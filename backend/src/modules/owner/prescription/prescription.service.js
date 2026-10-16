import prisma from '../../../config/db.js';

export const getAllPrescriptionsAdminService = async (status) => {
  const where = {};
  if (status && status !== 'ALL') where.status = status;

  return await prisma.prescriptionOrder.findMany({
    where,
    include: {
      customer: {
        select: { name: true, phone: true, email: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updatePrescriptionStatusService = async (id, status) => {
  return await prisma.prescriptionOrder.update({
    where: { id },
    data: { status },
  });
};

export const deletePrescriptionService = async (id) => {
  return await prisma.prescriptionOrder.delete({ where: { id } });
};
