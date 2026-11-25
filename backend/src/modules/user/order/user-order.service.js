import prisma from '../../../config/db.js';
import { getSslCommerz } from '../../../config/sslcommerz.js';

const parseCoordsFromAddress = (rawAddress = '') => {
  if (!rawAddress || typeof rawAddress !== 'string') return null;
  const gpsRegex = /\[?GPS:\s*([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)\]?/i;
  const match = rawAddress.match(gpsRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
};

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const createOnlineOrderService = async (customer, { items, notes, deliveryAddress, paymentMethod = 'COD' }) => {
  const result = await prisma.$transaction(async (tx) => {
    const settings = (await tx.storefrontSetting.findUnique({
      where: { id: 'settings' },
      include: { discountTiers: true },
    })) || {
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
      deliveryChargePerKm: 5,
      storeLat: null,
      storeLng: null,
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

      const discountPercent = Number(medicine.onlineDiscountPercent) || 0;
      const unitPrice = discountPercent > 0 
        ? parseFloat((medicine.sellingPrice * (1 - discountPercent / 100)).toFixed(2))
        : medicine.sellingPrice;
      const itemTotal = parseFloat((unitPrice * cartItem.quantity).toFixed(2));
      subtotal += itemTotal;

      orderItemsToCreate.push({
        medicineId: medicine.id,
        quantity: cartItem.quantity,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    let deliveryCharge = 0;
    const minFreeOrder = Number(settings.minOrderForFreeDelivery) || 500;
    if (subtotal > 0 && subtotal < minFreeOrder) {
      const customerCoords = parseCoordsFromAddress(deliveryAddress);
      const perKmRate = Number(settings.deliveryChargePerKm ?? 5);
      if (
        customerCoords &&
        settings.storeLat != null &&
        settings.storeLng != null &&
        perKmRate > 0
      ) {
        const distanceKm = calculateDistanceKm(
          Number(settings.storeLat),
          Number(settings.storeLng),
          customerCoords.lat,
          customerCoords.lng
        );
        deliveryCharge = Math.max(perKmRate, Math.round(distanceKm * perKmRate));
      } else {
        deliveryCharge = Number(settings.deliveryCharge ?? 20);
      }
    }
    // Storefront tier discount disabled in favor of per-product online discounts
    const discount = 0;

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
