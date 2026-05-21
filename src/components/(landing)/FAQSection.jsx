'use client';

import { ChevronDown } from "lucide-react";

export default function FAQSection({ openFaq, onToggleFaq }) {
  const faqs = [
    {
      q: "Are the medicines sold here genuine?",
      a: "Yes, 100%. S&S Pharmacy is a certified Model Pharmacy. All our drugs are procured directly from manufacturers or authorized representatives, stored under exact DGDA guidelines, and delivered under clinical safety standards."
    },
    {
      q: "How fast is your home delivery?",
      a: "We offer express delivery across major zones in Dhaka within 45 to 60 minutes. Orders are dispatched from our central store immediately upon verification."
    },
    {
      q: "Is there a charge for delivery?",
      a: "Standard delivery is ৳20. However, for any order of ৳500 or above, delivery is completely FREE."
    },
    {
      q: "Can I order medicine without a prescription?",
      a: "Over-the-counter (OTC) medicines can be ordered freely. For prescription-only drugs, our pharmacist will verify your prescription. You can upload a photo of the prescription during checkout or show it to our rider."
    }
  ];

  return (
    <section className="max-w-[90%] lg:max-w-4xl mx-auto mt-20 mb-10">
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-medical-blue-600 uppercase tracking-widest bg-medical-blue-50 px-3 py-1 rounded-full border border-medical-blue-100">
          COMMON INQUIRIES
        </span>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-3 font-display">Frequently Asked Questions</h3>
        <p className="text-xs text-slate-500 mt-1">Answers to key questions regarding online prescription orders and delivery</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div key={index} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => onToggleFaq(isOpen ? null : index)}
                className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-350 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="p-5 border-t border-slate-100/50 text-xs sm:text-sm text-slate-500 leading-relaxed bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
