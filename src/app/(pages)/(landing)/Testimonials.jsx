'use client';

import { Star } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Testimonials() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
    swipeToSlide: true, 
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-bold text-medical-blue-600 uppercase tracking-widest bg-medical-blue-50 px-3 py-1 rounded-full border border-medical-blue-100">
          CUSTOMER STORIES
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-display">
          What Dhaka Residents Say About Us
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
          Genuine reviews from verified shoppers ordering home delivery medicines.
        </p>
      </div>

      <div className="w-full min-w-0 overflow-hidden pb-12">
        <Slider {...settings} className="my-slider-wrapper">
          {/* Card 1 */}
          <div>
            <div className="mx-2 mb-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow h-full">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed min-h-[60px]">
                "Extremely pleased with their service. I ordered insulin, and it was delivered within 40 minutes in a proper temperature-regulated cooler pack. Absolute lifesavers!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100/50">
                <div className="w-8 h-8 rounded-full bg-medical-blue-100 text-medical-blue-700 flex flex-shrink-0 items-center justify-center font-bold text-xs">
                  RA
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-950">Rashedul Alam</h5>
                  <span className="text-[10px] text-slate-400">Gulshan-2, Dhaka</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div>
            <div className="mx-2 mb-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow h-full">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed min-h-[60px]">
                "Finding genuine pediatric medicines online can be stressful. S&S is the only online pharmacy where I get original products with clear expiration dates."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100/50">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex flex-shrink-0 items-center justify-center font-bold text-xs">
                  NT
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-950">Nusrat Jahan Tania</h5>
                  <span className="text-[10px] text-slate-400">Dhanmondi, Dhaka</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div>
            <div className="mx-2 mb-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow h-full">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed min-h-[60px]">
                "The customer portal makes ordering regular medicines so quick. OTP register took seconds, and they kept my delivery address saved. Highly recommended!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100/50">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex flex-shrink-0 items-center justify-center font-bold text-xs">
                  MH
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-950">Mehedi Hasan</h5>
                  <span className="text-[10px] text-slate-400">Uttara, Dhaka</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card 4 */}
          <div>
            <div className="mx-2 mb-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow h-full">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed min-h-[60px]">
                "Great app! Fast delivery and authentic medicines. I highly recommend to everyone who are looking for reliable healthcare services online in Dhaka."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100/50">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex flex-shrink-0 items-center justify-center font-bold text-xs">
                  FA
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-950">Farhan Ahmed</h5>
                  <span className="text-[10px] text-slate-400">Banani, Dhaka</span>
                </div>
              </div>
            </div>
          </div>
        </Slider>
      </div>
    </section>
  );
}
