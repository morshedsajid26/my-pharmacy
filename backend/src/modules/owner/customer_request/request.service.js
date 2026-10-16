import prisma from '../../../config/db.js';

export const getMedicineRequestsAdminService = async () => {
  return await prisma.medicineRequest.findMany({
    include: {
      customer: { select: { name: true, phone: true, email: true } },
      medicine: { select: { name: true, company: true, stock: true, category: true, sellingPrice: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
