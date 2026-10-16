import prisma from '../../../config/db.js';

export const getPublicMedicinesService = async ({ search, category, company }) => {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { genericName: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = category;
  if (company) where.company = company;

  return await prisma.medicine.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getPublicMedicineByIdService = async (id) => {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) throw new Error('Medicine not found');
  return medicine;
};
