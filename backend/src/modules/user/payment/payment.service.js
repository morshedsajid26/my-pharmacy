import prisma from '../../../config/db.js';

export const handlePaymentSuccessService = async (tran_id) => {
  if (tran_id) {
    await prisma.onlineOrder.update({
      where: { transactionId: tran_id },
      data: { paymentStatus: 'PAID' },
    });
  }
};

export const handlePaymentFailService = async (tran_id) => {
  if (tran_id) {
    await prisma.onlineOrder.update({
      where: { transactionId: tran_id },
      data: { paymentStatus: 'FAILED' },
    });
  }
};

export const handlePaymentCancelService = async (tran_id) => {
  if (tran_id) {
    await prisma.onlineOrder.update({
      where: { transactionId: tran_id },
      data: {
        paymentStatus: 'UNPAID',
        status: 'CANCELLED',
      },
    });
  }
};

export const handlePaymentIpnService = async (tran_id, status) => {
  if (tran_id && status === 'VALID') {
    await prisma.onlineOrder.update({
      where: { transactionId: tran_id },
      data: { paymentStatus: 'PAID' },
    });
  } else if (tran_id && status === 'FAILED') {
    await prisma.onlineOrder.update({
      where: { transactionId: tran_id },
      data: { paymentStatus: 'FAILED' },
    });
  }
};
