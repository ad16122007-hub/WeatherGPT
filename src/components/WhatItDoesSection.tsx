import React from 'react';
import {
  Mic,
  ShieldCheck,
  Bell,
  Thermometer,
  Languages
} from 'lucide-react';
import { getTranslations } from '../i18n/translations';

interface WhatItDoesSectionProps {
  language?: string;
}

export const WhatItDoesSection: React.FC<WhatItDoesSectionProps> = ({ language = 'hi' }) => {
  const t = getTranslations(language);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7EE] border-t border-[#EAE3D2] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 mb-10">
          <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#245E43] uppercase block font-mono">
            {t.whatItDoes.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            {t.whatItDoes.title}{' '}
            <span className="text-slate-500 font-sans text-2xl sm:text-3xl font-normal block sm:inline">
              {t.whatItDoes.titleSub}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E7E1D2] shadow-2xs hover:border-[#D5CDBC] transition">
            <div className="w-10 h-10 rounded-xl bg-[#E8F3EB] text-[#245E43] flex items-center justify-center mb-5">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 font-sans">
              {t.whatItDoes.card1Title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.whatItDoes.card1Desc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E7E1D2] shadow-2xs hover:border-[#D5CDBC] transition">
            <div className="w-10 h-10 rounded-xl bg-[#E8F3EB] text-[#245E43] flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 font-sans">
              {t.whatItDoes.card2Title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.whatItDoes.card2Desc}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E7E1D2] shadow-2xs hover:border-[#D5CDBC] transition">
            <div className="w-10 h-10 rounded-xl bg-[#E8F3EB] text-[#245E43] flex items-center justify-center mb-5">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 font-sans">
              {t.whatItDoes.card3Title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.whatItDoes.card3Desc}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E7E1D2] shadow-2xs hover:border-[#D5CDBC] transition">
            <div className="w-10 h-10 rounded-xl bg-[#E8F3EB] text-[#245E43] flex items-center justify-center mb-5">
              <Thermometer className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 font-sans">
              {t.whatItDoes.card4Title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.whatItDoes.card4Desc}
            </p>
          </div>

          {/* Full Width Language Card */}
          <div className="md:col-span-2 bg-[#0D2137] rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md text-white flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E5A83B] text-slate-950 flex items-center justify-center mb-5 shadow-sm">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 font-sans">
                {t.whatItDoes.card5Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                {t.whatItDoes.card5Desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
