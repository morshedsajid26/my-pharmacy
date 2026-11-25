import prisma from '../../../config/db.js';

export const getOwnerSettingsService = async () => {
  return await prisma.storefrontSetting.findUnique({
    where: { id: 'settings' },
    include: { discountTiers: true },
  });
};

export const updateOwnerSettingsService = async ({
  minOrderForFreeDelivery,
  deliveryCharge,
  deliveryChargePerKm,
  storeAddress,
  storeLat,
  storeLng,
  discountTiers,
}) => {
  const updateData = {};
  if (minOrderForFreeDelivery !== undefined) {
    updateData.minOrderForFreeDelivery = parseFloat(minOrderForFreeDelivery) || 0;
  }
  if (deliveryCharge !== undefined) {
    updateData.deliveryCharge = parseFloat(deliveryCharge) || 0;
  }
  if (deliveryChargePerKm !== undefined) {
    updateData.deliveryChargePerKm = Math.max(0, parseFloat(deliveryChargePerKm) || 0);
  }
  if (storeAddress !== undefined) {
    updateData.storeAddress = storeAddress ? String(storeAddress).trim() : null;
  }
  if (storeLat !== undefined) {
    updateData.storeLat = storeLat !== null && storeLat !== '' ? parseFloat(storeLat) : null;
  }
  if (storeLng !== undefined) {
    updateData.storeLng = storeLng !== null && storeLng !== '' ? parseFloat(storeLng) : null;
  }

  await prisma.storefrontSetting.upsert({
    where: { id: 'settings' },
    update: updateData,
    create: {
      id: 'settings',
      minOrderForFreeDelivery: parseFloat(minOrderForFreeDelivery) || 500,
      deliveryCharge: parseFloat(deliveryCharge) || 20,
      deliveryChargePerKm: deliveryChargePerKm !== undefined ? Math.max(0, parseFloat(deliveryChargePerKm) || 0) : 5,
      storeAddress: storeAddress ? String(storeAddress).trim() : null,
      storeLat: storeLat !== undefined && storeLat !== null && storeLat !== '' ? parseFloat(storeLat) : null,
      storeLng: storeLng !== undefined && storeLng !== null && storeLng !== '' ? parseFloat(storeLng) : null,
    },
  });

  if (discountTiers !== undefined) {
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
  }

  return await prisma.storefrontSetting.findUnique({
    where: { id: 'settings' },
    include: { discountTiers: true },
  });
};
