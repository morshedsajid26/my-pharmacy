import prisma from '../../../config/db.js';

export const getPublicStorefrontSettingsService = async () => {
  const settings = await prisma.storefrontSetting.findUnique({
    where: { id: 'settings' },
    include: { discountTiers: true },
  });

  return (
    settings || {
      id: 'settings',
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
      discountTiers: [],
    }
  );
};
