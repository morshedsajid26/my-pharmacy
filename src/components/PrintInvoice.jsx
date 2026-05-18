import React from "react";

export const PrintInvoice = ({
  completedSale,
  completedCustomerName,
  completedCustomerPhone,
}) => {
  if (!completedSale) return null;

  return (
    <div
      id="print-area"
      className="hidden print:block receipt-width bg-white mx-auto text-slate-900 font-mono text-[10px] leading-normal"
    >
      <div className="text-center space-y-1.5 border-b border-dashed border-slate-300 pb-4">
        <h2 className="text-xl font-bold uppercase tracking-wider">
          SNS Pharmacy
        </h2>
        <p className="text-[10px] text-slate-600">Mirpur, Dhaka, Bangladesh</p>
        <p className="text-[10px] text-slate-600">Phone: +880 1756-899699</p>
      </div>

      <div className="py-3 space-y-1 text-[11px] border-b border-dashed border-slate-300">
        <p>
          <strong>Invoice No:</strong> {completedSale.invoiceNo}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(completedSale.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Customer:</strong>{" "}
          {completedCustomerName || "Walking Customer"}
        </p>
        <p>
          <strong>Phone:</strong> {completedCustomerPhone || "N/A"}
        </p>
      </div>

      <table className="w-full text-[11px] my-3 border-b border-dashed border-slate-300 pb-3">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left pb-1">Item</th>
            <th className="text-left pb-1">Cat</th>
            <th className="text-center pb-1">Qty</th>
            <th className="text-right pb-1">Price</th>
            <th className="text-right pb-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {completedSale.items?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1">{item.medicine?.name || "Medicine"}</td>
              <td className="py-1 uppercase text-[9px] text-slate-600">
                {item.medicine?.category || "Tablet"}
              </td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">৳{item.unitPrice?.toFixed(2)}</td>
              <td className="text-right py-1">
                ৳{item.totalPrice?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-[11px] text-right">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>
            ৳
            {completedSale.items
              ?.reduce((acc, item) => acc + item.totalPrice, 0)
              ?.toFixed(2)}
          </span>
        </div>
        {completedSale.items?.reduce((acc, item) => acc + item.totalPrice, 0) -
          completedSale.totalAmount >
          0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>
              - ৳
              {(
                completedSale.items?.reduce(
                  (acc, item) => acc + item.totalPrice,
                  0,
                ) - completedSale.totalAmount
              )?.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between font-black text-sm pt-2 border-t border-dashed border-slate-300">
          <span>Grand Total:</span>
          <span>৳{completedSale.totalAmount?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount Paid:</span>
          <span>
            ৳
            {completedSale.paidAmount
              ? completedSale.paidAmount.toFixed(2)
              : completedSale.totalAmount?.toFixed(2)}
          </span>
        </div>
        {completedSale.dueAmount > 0 && (
          <div className="flex justify-between text-rose-600 font-bold">
            <span>Remaining Due:</span>
            <span>৳{completedSale.dueAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] mt-6 pt-4 border-t border-dashed border-slate-300 space-y-1 text-slate-500">
        <p className="font-bold text-slate-700">Thank You for Your Visit!</p>
        <p>Get Well Soon.</p>
      </div>
    </div>
  );
};
