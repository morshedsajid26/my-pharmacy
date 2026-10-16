import prisma from '../../../config/db.js';

export const addMedicineRequestService = async (customerId, medicineId) => {
  return await prisma.medicineRequest.upsert({
    where: {
      customerId_medicineId: {
        customerId,
        medicineId,
      },
    },
    create: { customerId, medicineId },
    update: {},
  });
};

export const removeMedicineRequestService = async (customerId, medicineId) => {
  return await prisma.medicineRequest.deleteMany({
    where: { customerId, medicineId },
  });
};

export const getCustomerWishlistService = async (customerId) => {
  const requests = await prisma.medicineRequest.findMany({
    where: { customerId },
    select: { medicineId: true },
  });
  return requests.map((r) => r.medicineId);
};
