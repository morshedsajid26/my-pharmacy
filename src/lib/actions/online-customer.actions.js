'use server';

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/session";

// Secret session age is 7 days for online customers
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; 

export async function registerCustomerAction(name, phone, password, address = null) {
  try {
    const existing = await prisma.onlineCustomer.findUnique({
      where: { phone }
    });

    if (existing) {
      throw new Error("Mobile number is already registered!");
    }

    const customer = await prisma.onlineCustomer.create({
      data: {
        name,
        phone,
        password, // In a real app, use bcrypt or hashing
        address
      }
    });

    // Auto-login after registration
    return await loginCustomerAction(phone, password);
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
}

export async function loginCustomerAction(phone, password) {
  try {
    const customer = await prisma.onlineCustomer.findUnique({
      where: { phone }
    });

    if (!customer || customer.password !== password) {
      throw new Error("Invalid mobile number or password");
    }

    // Encrypt customer session payload
    const session = await encrypt({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      type: "customer"
    });

    const expires = new Date(Date.now() + SESSION_EXPIRY_MS);
    (await cookies()).set("customer_session", session, { 
      expires, 
      httpOnly: true,
      path: "/" 
    });

    return {
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      }
    };
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

export async function logoutCustomerAction() {
  (await cookies()).set("customer_session", "", { 
    expires: new Date(0),
    path: "/"
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
        serializedAddress = JSON.stringify(address.map(a => a.trim()).filter(Boolean));
      } else {
        serializedAddress = JSON.stringify([address.trim()]);
      }
    } else {
      serializedAddress = JSON.stringify([]);
    }

    const updated = await prisma.onlineCustomer.update({
      where: { id: current.id },
      data: {
        name: name.trim(),
        address: serializedAddress
      }
    });

    // Re-encrypt the customer session cookie with the new profile data
    const session = await encrypt({
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      type: "customer"
    });

    const expires = new Date(Date.now() + SESSION_EXPIRY_MS);
    (await cookies()).set("customer_session", session, { 
      expires, 
      httpOnly: true,
      path: "/" 
    });

    revalidatePath("/profile");
    revalidatePath("/profile/orders");
    revalidatePath("/");

    return {
      success: true,
      customer: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        address: updated.address
      }
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
    if (!decrypted || !decrypted.id) return null;

    const customer = await prisma.onlineCustomer.findUnique({
      where: { id: decrypted.id },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true
      }
    });

    return customer;
  } catch (error) {
    console.error("Error fetching current customer:", error);
    return null;
  }
}

export async function createOnlineOrderAction(items, notes, deliveryAddress) {
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
      const settings = await tx.storefrontSetting.findUnique({
        where: { id: "settings" },
        include: { discountTiers: true },
      }) || {
        minOrderForFreeDelivery: 500,
        deliveryCharge: 20,
        discountTiers: [],
      };

      // 2. Generate sequential order number (ORD-1001, ORD-1002...)
      const count = await tx.onlineOrder.count();
      const orderNo = `ORD-${1000 + count + 1}`;

      let subtotal = 0;
      const orderItemsToCreate = [];

      // 3. Validate stock and get exact selling prices from DB to avoid price injection
      for (const cartItem of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: cartItem.id }
        });

        if (!medicine) {
          throw new Error(`Medicine ${cartItem.name} not found`);
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
          totalPrice: itemTotal
        });
      }

      // 4. Calculate dynamic delivery charges and discounts
      const deliveryCharge = subtotal >= settings.minOrderForFreeDelivery ? 0 : settings.deliveryCharge;
      let discount = 0;
      if (settings.discountTiers && settings.discountTiers.length > 0) {
        const applicable = settings.discountTiers.filter(t => subtotal >= t.threshold);
        if (applicable.length > 0) {
          const best = applicable.reduce((prev, cur) => (cur.percent > prev.percent ? cur : prev));
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
          items: {
            create: orderItemsToCreate
          }
        }
      });

      return {
        success: true,
        orderNo: order.orderNo,
        totalAmount: order.totalAmount
      };
    });

    revalidatePath("/profile/orders");
    return result;
  } catch (error) {
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
                company: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
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
          medicineId: medicineId
        }
      },
      create: {
        customerId: customer.id,
        medicineId: medicineId
      },
      update: {}
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
        medicineId: medicineId
      }
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
        medicineId: true
      }
    });

    return requests.map(r => r.medicineId);
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
            phone: true
          }
        },
        medicine: {
          select: {
            name: true,
            company: true,
            stock: true,
            category: true,
            sellingPrice: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return requests;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch customer requests");
  }
}
