import prisma from '../../../config/db.js';

export const createPrescriptionOrderService = async (customerId, { prescriptionFile, durationDays, notes }) => {
  return await prisma.prescriptionOrder.create({
    data: {
      customerId,
      prescriptionFile,
      durationDays: String(durationDays || '7'),
      notes: notes || null,
      status: 'PENDING',
    },
  });
};

export const getMyPrescriptionsService = async (customerId) => {
  return await prisma.prescriptionOrder.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteMyPrescriptionOrderService = async (customerId, id) => {
  return await prisma.prescriptionOrder.deleteMany({
    where: { id, customerId },
  });
};
