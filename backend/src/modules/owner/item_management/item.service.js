import prisma from '../../../config/db.js';

export const getOwnerMedicinesService = async ({ search, category, company }) => {
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

export const getLowStockMedicinesService = async () => {
  return await prisma.medicine.findMany({
    where: { stock: { lte: 10 } },
    orderBy: { stock: 'asc' },
  });
};

export const getMedicineByIdService = async (id) => {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) throw new Error('Medicine not found');
  return medicine;
};

export const addMedicineService = async (data) => {
  const stock = parseInt(data.stock, 10) || 0;
  const status = stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low' : 'In Stock';

  return await prisma.medicine.create({
    data: {
      name: data.name,
      genericName: data.genericName || null,
      company: data.company,
      category: data.category || 'Tablet',
      purchasePrice: parseFloat(data.purchasePrice) || 0,
      sellingPrice: parseFloat(data.sellingPrice) || 0,
      stock,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      image: data.image || null,
      status,
    },
  });
};

export const updateMedicineService = async (id, data) => {
  const existing = await prisma.medicine.findUnique({ where: { id } });
  if (!existing) throw new Error('Medicine not found');

  const stock = data.stock !== undefined ? parseInt(data.stock, 10) : existing.stock;
  const status = stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low' : 'In Stock';

  const updatePayload = {
    ...data,
    stock,
    status,
  };

  if (data.purchasePrice !== undefined) updatePayload.purchasePrice = parseFloat(data.purchasePrice);
  if (data.sellingPrice !== undefined) updatePayload.sellingPrice = parseFloat(data.sellingPrice);
  if (data.expiryDate !== undefined) {
    updatePayload.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  }

  return await prisma.medicine.update({
    where: { id },
    data: updatePayload,
  });
};

export const deleteMedicineService = async (id) => {
  const hasSales = await prisma.saleItem.count({ where: { medicineId: id } });
  const hasPurchases = await prisma.purchaseItem.count({ where: { medicineId: id } });

  if (hasSales > 0 || hasPurchases > 0) {
    throw new Error(`Cannot delete: Medicine is in ${hasSales} sales and ${hasPurchases} purchases. Set stock to 0 instead.`);
  }

  return await prisma.medicine.delete({ where: { id } });
};
