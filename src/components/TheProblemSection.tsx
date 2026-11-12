import React from 'react';
import { getTranslations } from '../i18n/translations';

interface TheProblemSectionProps {
  language?: string;
}

export const TheProblemSection: React.FC<TheProblemSectionProps> = ({ language = 'hi' }) => {
  const t = getTranslations(language);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7EE] border-t border-[#EAE3D2] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#245E43] uppercase block font-mono">
              {t.problem.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-slate-900 tracking-tight leading-[1.15]">
              {t.problem.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal pt-2">
              {t.problem.desc}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 italic max-w-xl font-normal">
              {t.problem.sub}
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* What they see */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1D2] shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#C2410C] uppercase block mb-4 font-mono">
                  {t.problem.whatTheySeeBadge}
                </span>
                <div className="space-y-2 font-mono text-xs sm:text-[13px] text-slate-700 tracking-wide leading-relaxed">
                  <p className="flex items-center justify-between">
                    <span>MSLP 1004.2 hPa</span>
                    <span className="text-slate-400">↓</span>
                  </p>
                  <p>WS 14 kt, G 31 kt, 240°</p>
                  <p>RH 82%, QPF 38 mm/24h</p>
                  <p>T 34.1 / Td 24.6</p>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 italic">
                {t.problem.whatTheySeeSub}
              </div>
            </div>

            {/* What they need */}
            <div className="bg-[#EBF5ED] rounded-2xl p-6 border border-[#CDE5D3] shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#1F5438] uppercase block mb-4 font-mono">
                  {t.problem.whatTheyNeedBadge}
                </span>
                <p className="text-slate-900 text-sm sm:text-base leading-relaxed font-medium">
                  {t.problem.whatTheyNeedText}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#D5EAD9] text-xs text-slate-600 font-normal">
                {t.problem.whatTheyNeedSub}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
