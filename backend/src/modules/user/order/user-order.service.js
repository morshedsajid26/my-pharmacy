import prisma from '../../../config/db.js';
import { getSslCommerz } from '../../../config/sslcommerz.js';

export const createOnlineOrderService = async (customer, { items, notes, deliveryAddress, paymentMethod = 'COD' }) => {
  const result = await prisma.$transaction(async (tx) => {
    const settings = (await tx.storefrontSetting.findUnique({
      where: { id: 'settings' },
      include: { discountTiers: true },
    })) || {
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
      discountTiers: [],
    };

    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNo = `ORD-${Date.now().toString().slice(-6)}-${randomStr}`;
    const transactionId = paymentMethod === 'SSLCOMMERZ' ? `TXN-${Date.now()}-${randomStr}` : null;

    let subtotal = 0;
    const orderItemsToCreate = [];

    for (const cartItem of items) {
      const medicine = await tx.medicine.findUnique({
        where: { id: cartItem.id || cartItem.medicineId },
      });

      if (!medicine) {
        throw new Error(`Medicine ${cartItem.name || 'item'} not found`);
      }

      if (medicine.stock < cartItem.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}. Only ${medicine.stock} left.`);
      }

      const itemTotal = medicine.sellingPrice * cartItem.quantity;
      subtotal += itemTotal;

      orderItemsToCreate.push({
        medicineId: medicine.id,
        quantity: cartItem.quantity,
        unitPrice: medicine.sellingPrice,
        totalPrice: itemTotal,
      });
    }

    const deliveryCharge = subtotal >= settings.minOrderForFreeDelivery ? 0 : settings.deliveryCharge;
    let discount = 0;

    if (settings.discountTiers && settings.discountTiers.length > 0) {
      const applicable = settings.discountTiers.filter((t) => subtotal >= t.threshold);
      if (applicable.length > 0) {
        const bestTier = applicable.reduce((prev, cur) => (cur.percent > prev.percent ? cur : prev));
        discount = (subtotal * bestTier.percent) / 100;
      }
    }

    const totalAmount = subtotal + deliveryCharge - discount;

    const order = await tx.onlineOrder.create({
      data: {
        orderNo,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        address: deliveryAddress.trim(),
        notes: notes || '',
        subtotal,
        deliveryCharge,
        discount,
        totalAmount,
        status: 'PENDING',
        paymentMethod,
        paymentStatus: 'UNPAID',
        transactionId,
        items: { create: orderItemsToCreate },
      },
    });

    return {
      order,
      orderNo: order.orderNo,
      totalAmount: order.totalAmount,
      transactionId: order.transactionId,
      customerName: order.customerName,
      customerEmail: customer.email || 'customer@pharmacy.com',
      customerPhone: order.customerPhone,
      customerAddress: order.address,
    };
  });

  if (paymentMethod === 'SSLCOMMERZ') {
    const backendUrl = `http://localhost:${process.env.PORT || 5000}`;
    const sslData = {
      total_amount: result.totalAmount,
      currency: 'BDT',
      tran_id: result.transactionId,
      success_url: `${backendUrl}/api/user/payment/success`,
      fail_url: `${backendUrl}/api/user/payment/fail`,
      cancel_url: `${backendUrl}/api/user/payment/cancel`,
      ipn_url: `${backendUrl}/api/user/payment/ipn`,
      shipping_method: 'Courier',
      product_name: 'Medicines',
      product_category: 'Healthcare',
      product_profile: 'general',
      cus_name: result.customerName,
      cus_email: result.customerEmail,
      cus_add1: result.customerAddress,
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1200',
      cus_country: 'Bangladesh',
      cus_phone: result.customerPhone,
      ship_name: result.customerName,
      ship_add1: result.customerAddress,
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1200,
      ship_country: 'Bangladesh',
    };

    const ssl = getSslCommerz();
    const apiResponse = await ssl.init(sslData);

    if (apiResponse?.GatewayPageURL) {
      return {
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
        orderNo: result.orderNo,
        totalAmount: result.totalAmount,
      };
    } else {
      throw new Error('Failed to initialize payment gateway.');
    }
  }

  return { success: true, message: 'Order placed successfully', data: result.order };
};

export const getCustomerOrdersService = async (customerId) => {
  return await prisma.onlineOrder.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          medicine: { select: { name: true, company: true, category: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getCustomerStatsService = async (customerId) => {
  const [orders, prescriptions] = await Promise.all([
    prisma.onlineOrder.findMany({ where: { customerId } }),
    prisma.prescriptionOrder.count({ where: { customerId } }),
  ]);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter((o) => ['PENDING', 'PROCESSING'].includes(o.status)).length;

  return {
    totalOrders,
    totalSpent,
    pendingOrders,
    totalPrescriptions: prescriptions,
  };
};
