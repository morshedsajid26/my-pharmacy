import * as paymentService from './payment.service.js';

export const handleSuccess = async (req, res) => {
  try {
    const { tran_id } = req.body;
    await paymentService.handlePaymentSuccessService(tran_id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/orders?payment=success`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/orders?payment=error`);
  }
};

export const handleFail = async (req, res) => {
  try {
    const { tran_id } = req.body;
    await paymentService.handlePaymentFailService(tran_id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/orders?payment=failed`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/orders?payment=error`);
  }
};

export const handleCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;
    await paymentService.handlePaymentCancelService(tran_id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/orders?payment=cancelled`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/orders?payment=error`);
  }
};

export const handleIpn = async (req, res) => {
  try {
    const { tran_id, status } = req.body;
    await paymentService.handlePaymentIpnService(tran_id, status);
    return res.status(200).json({ success: true, message: 'IPN processed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'IPN Processing Error' });
  }
};
