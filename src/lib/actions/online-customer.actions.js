"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/session";
import { sendOtpEmail } from "@/lib/mailer";

// Secret session age is 7 days for online customers
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function checkCustomerExistsAction(phone, email) {
  try {
    const existingPhone = await prisma.customer.findUnique({
      where: { phone },
    });
    if (existingPhone) return { exists: true, field: "phone" };
    
    if (email) {
      const existingEmail = await prisma.customer.findUnique({
        where: { email },
      });
      if (existingEmail) return { exists: true, field: "email" };
    }
    return { exists: false };
  } catch (error) {
    console.error("Error checking customer existence:", error);
    return { exists: false };
  }
}

export async function registerCustomerAction(
  name,
  phone,
  email,
  password,
  address = null,
) {
  try {
    const check = await checkCustomerExistsAction(phone, email);
    if (check.exists) {
      throw new Error(`${check.field === 'phone' ? 'Mobile number' : 'Email'} is already registered!`);
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        password, // In a real app, use bcrypt or hashing
        address,
      },
    });

    // Auto-login after registration
    return await loginCustomerAction(email, password);
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
}

export async function sendVerificationEmailAction(email, otp) {
  try {
    const success = await sendOtpEmail(email, otp);
    return { success };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function loginCustomerAction(email, password) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer || customer.password !== password) {
      throw new Error("Invalid email or password");
    }

    // Encrypt customer session payload
    const session = await encrypt({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      type: "customer",
    });

    const expires = new Date(Date.now() + SESSION_EXPIRY_MS);
    (await cookies()).set("customer_session", session, {
      expires,
      httpOnly: true,
      path: "/",
    });

    return {
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      },
    };
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

export async function logoutCustomerAction() {
  (await cookies()).set("customer_session", "", {
    expires: new Date(0),
    path: "/",
  });
  return { success: true };
}

export async function updateCustomerProfileAction(name, address) {
  try {
    const current = await getCurrentCustomer();
    if (!current) {
      throw new Error("You must be logged in to update your profile");
    }

    if (!name || !name.trim()) {
      throw new Error("Name is required");
    }

    let serializedAddress = null;
    if (address) {
      if (Array.isArray(address)) {
        serializedAddress = JSON.stringify(
          address.map((a) => a.trim()).filter(Boolean),
        );
      } else {
        serializedAddress = JSON.stringify([address.trim()]);
      }
    } else {
      serializedAddress = JSON.stringify([]);
    }

    const updated = await prisma.customer.update({
      where: { id: current.id },
      data: {
        name: name.trim(),
        address: serializedAddress,
      },
    });

    // Re-encrypt the customer session cookie with the new profile data
    const session = await encrypt({
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      type: "customer",
    });

    const expires = new Date(Date.now() + SESSION_EXPIRY_MS);
    (await cookies()).set("customer_session", session, {
      expires,
      httpOnly: true,
      path: "/",
    });

    revalidatePath("/profile");
    revalidatePath("/orders");
    revalidatePath("/");

    return {
      success: true,
      customer: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
      },
    };
  } catch (error) {
    throw new Error(error.message || "Failed to update profile");
  }
}

export async function getCurrentCustomer() {
  try {
    const session = (await cookies()).get("customer_session")?.value;
    if (!session) return null;

    const decrypted = await decrypt(session);
    if (!decrypted || !decrypted.id) {
      try {
        (await cookies()).delete("customer_session");
      } catch (_) {}
      return null;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decrypted.id },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
      },
    });

    return customer;
  } catch (error) {
    console.error("Error fetching current customer:", error);
    return null;
  }
}

import { getSslCommerz } from "@/lib/sslcommerz";

export async function createOnlineOrderAction(items, notes, deliveryAddress, paymentMethod = "COD") {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      throw new Error("You must be logged in to place an order");
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      throw new Error("Delivery address is required to place an order.");
    }

    if (!items || items.length === 0) {
      throw new Error("Your cart is empty");
    }

    // Execute order creation in a database transaction to prevent concurrency issues
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch storefront settings
      const settings = (await tx.storefrontSetting.findUnique({
        where: { id: "settings" },
        include: { discountTiers: true },
      })) || {
        minOrderForFreeDelivery: 500,
        deliveryCharge: 20,
        discountTiers: [],
      };

      // 2. Generate robust unique order number to prevent collision if orders are deleted
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      const orderNo = `ORD-${Date.now().toString().slice(-6)}-${randomStr}`;
      const transactionId = paymentMethod === "SSLCOMMERZ" ? `TXN-${Date.now()}-${randomStr}` : null;

      let subtotal = 0;
      const orderItemsToCreate = [];

      // 3. Validate stock and get exact selling prices from DB to avoid price injection
      for (const cartItem of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: cartItem.id },
        });

        if (!medicine) {
          throw new Error(`Medicine ${cartItem.name} not found`);
        }

        if (medicine.stock < cartItem.quantity) {
          throw new Error(
            `Insufficient stock for ${medicine.name}. Only ${medicine.stock} left.`,
          );
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

      // 4. Calculate dynamic delivery charges and discounts
      const deliveryCharge =
        subtotal >= settings.minOrderForFreeDelivery
          ? 0
          : settings.deliveryCharge;
      let discount = 0;
      if (settings.discountTiers && settings.discountTiers.length > 0) {
        const applicable = settings.discountTiers.filter(
          (t) => subtotal >= t.threshold,
        );
        if (applicable.length > 0) {
          const best = applicable.reduce((prev, cur) =>
            cur.percent > prev.percent ? cur : prev,
          );
          discount = (subtotal * best.percent) / 100;
        }
      }
      const totalAmount = subtotal + deliveryCharge - discount;

      // 5. Create the OnlineOrder row with full financial details
      const order = await tx.onlineOrder.create({
        data: {
          orderNo,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          address: deliveryAddress.trim(),
          notes: notes || "",
          subtotal,
          deliveryCharge,
          discount,
          totalAmount,
          status: "PENDING",
          paymentMethod,
          paymentStatus: "UNPAID",
          transactionId,
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      return {
        success: true,
        orderNo: order.orderNo,
        totalAmount: order.totalAmount,
        transactionId: order.transactionId,
        customerName: order.customerName,
        customerEmail: customer.email || "test@test.com",
        customerPhone: order.customerPhone,
        customerAddress: order.address
      };
    },
    {
      maxWait: 5000, // 5 seconds max wait to connect to prisma
      timeout: 10000, // 10 seconds max transaction execution time
    });

    if (paymentMethod === "SSLCOMMERZ") {
      const data = {
        total_amount: result.totalAmount,
        currency: 'BDT',
        tran_id: result.transactionId, // use unique tran_id for each api call
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/success`,
        fail_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/fail`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/cancel`,
        ipn_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/ipn`,
        shipping_method: 'Courier',
        product_name: 'Medicines',
        product_category: 'Health',
        product_profile: 'general',
        cus_name: result.customerName,
        cus_email: result.customerEmail,
        cus_add1: result.customerAddress,
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: result.customerPhone,
        ship_name: result.customerName,
        ship_add1: result.customerAddress,
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };
      
      const ssl = getSslCommerz();
      const apiResponse = await ssl.init(data);
      if (apiResponse?.GatewayPageURL) {
         return {
           success: true,
           gatewayUrl: apiResponse.GatewayPageURL,
           orderNo: result.orderNo
         };
      } else {
         console.error("SSLCommerz Init Failed:", apiResponse);
         throw new Error("Failed to initialize SSLCommerz gateway. Check credentials or try again.");
      }
    }

    revalidatePath("/orders");
    return result;
  } catch (error) {
    console.error("Order Action Error:", error);
    throw new Error(error.message || "Failed to place order");
  }
}

export async function getCustomerOrdersAction() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      throw new Error("Unauthorized");
    }

    const orders = await prisma.onlineOrder.findMany({
      where: { customerId: customer.id },
      include: {
        items: {
          include: {
            medicine: {
              select: {
                name: true,
                company: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch orders");
  }
}

export async function addMedicineRequestAction(medicineId) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      throw new Error("You must be logged in to request a restock.");
    }

    if (!medicineId) {
      throw new Error("Medicine ID is required.");
    }

    const request = await prisma.medicineRequest.upsert({
      where: {
        customerId_medicineId: {
          customerId: customer.id,
          medicineId: medicineId,
        },
      },
      create: {
        customerId: customer.id,
        medicineId: medicineId,
      },
      update: {},
    });

    revalidatePath("/");
    revalidatePath("/customer-requests");
    return { success: true, request };
  } catch (error) {
    throw new Error(error.message || "Failed to submit restock request");
  }
}

export async function removeMedicineRequestAction(medicineId) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      throw new Error("You must be logged in.");
    }

    await prisma.medicineRequest.deleteMany({
      where: {
        customerId: customer.id,
        medicineId: medicineId,
      },
    });

    revalidatePath("/");
    revalidatePath("/customer-requests");
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Failed to remove request");
  }
}

export async function getCustomerWishlistAction() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return [];

    const requests = await prisma.medicineRequest.findMany({
      where: { customerId: customer.id },
      select: {
        medicineId: true,
      },
    });

    return requests.map((r) => r.medicineId);
  } catch (error) {
    console.error("Error fetching wishlist requests:", error);
    return [];
  }
}

export async function getMedicineRequestsAdminAction() {
  try {
    const requests = await prisma.medicineRequest.findMany({
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        medicine: {
          select: {
            name: true,
            company: true,
            stock: true,
            category: true,
            sellingPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch customer requests");
  }
}

export async function getCustomerOverviewStatsAction() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) throw new Error("Unauthorized");

    const orders = await prisma.onlineOrder.findMany({
      where: { customerId: customer.id },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const pendingOrders = orders.filter((o) =>
      ["PENDING", "PROCESSING"].includes(o.status),
    ).length;

    // Also include prescription orders
    const prescriptions = await prisma.prescriptionOrder.count({
      where: { customerId: customer.id },
    });

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      totalPrescriptions: prescriptions,
    };
  } catch (error) {
    console.error("Stats error:", error);
    return {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      totalPrescriptions: 0,
    };
  }
}
