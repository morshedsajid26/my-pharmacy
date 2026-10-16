import prisma from '../../../config/db.js';

export const getOwnerSettingsService = async () => {
  return await prisma.storefrontSetting.findUnique({
    where: { id: 'settings' },
    include: { discountTiers: true },
  });
};

export const updateOwnerSettingsService = async ({ minOrderForFreeDelivery, deliveryCharge, discountTiers }) => {
  await prisma.storefrontSetting.upsert({
    where: { id: 'settings' },
    update: {
      minOrderForFreeDelivery: parseFloat(minOrderForFreeDelivery) || 0,
      deliveryCharge: parseFloat(deliveryCharge) || 0,
    },
    create: {
      id: 'settings',
      minOrderForFreeDelivery: parseFloat(minOrderForFreeDelivery) || 0,
      deliveryCharge: parseFloat(deliveryCharge) || 0,
    },
  });

  await prisma.discountTier.deleteMany({ where: { settingId: 'settings' } });

  if (Array.isArray(discountTiers) && discountTiers.length > 0) {
    await prisma.discountTier.createMany({
      data: discountTiers.map((t) => ({
        settingId: 'settings',
        threshold: parseFloat(t.threshold),
        percent: parseFloat(t.percent),
      })),
    });
  }

  return await prisma.storefrontSetting.findUnique({
    where: { id: 'settings' },
    include: { discountTiers: true },
  });
};
