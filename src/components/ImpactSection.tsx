import React from 'react';
import { getTranslations } from '../i18n/translations';

interface ImpactSectionProps {
  language?: string;
}

export const ImpactSection: React.FC<ImpactSectionProps> = ({ language = 'hi' }) => {
  const t = getTranslations(language);

  return (
    <section className="py-16 sm:py-24 bg-[#1E4E38] text-white w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#86EFAC] uppercase block font-mono">
              {t.impact.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-[1.15]">
              {t.impact.title}
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl font-normal pt-2">
              {t.impact.desc}
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="bg-[#E5A83B] text-slate-950 rounded-2xl p-4.5 flex flex-col justify-between shadow-md">
              <span className="text-[11px] font-semibold text-slate-800 uppercase font-mono">
                {t.impact.step1Label}
              </span>
              <div className="my-3">
                <h4 className="text-sm sm:text-base font-bold text-slate-950 leading-tight">
                  {t.impact.step1Title}
                </h4>
              </div>
              <span className="text-[11px] font-medium text-slate-800">
                {t.impact.step1Sub}
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-[#183F2E]/80 border border-emerald-500/20 text-white rounded-2xl p-4.5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-300/80 uppercase font-mono">
                {t.impact.step2Label}
              </span>
              <div className="my-3">
                <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {t.impact.step2Title}
                </h4>
              </div>
              <span className="text-[11px] text-emerald-300/70">{t.impact.step2Sub}</span>
            </div>

            {/* Step 3 */}
            <div className="bg-[#183F2E]/80 border border-emerald-500/20 text-white rounded-2xl p-4.5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-300/80 uppercase font-mono">
                {t.impact.step3Label}
              </span>
              <div className="my-3">
                <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {t.impact.step3Title}
                </h4>
              </div>
              <span className="text-[11px] text-emerald-300/70">
                {t.impact.step3Sub}
              </span>
            </div>

            {/* Step 4 */}
            <div className="bg-[#183F2E]/80 border border-emerald-500/20 text-white rounded-2xl p-4.5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-300/80 uppercase font-mono">
                {t.impact.step4Label}
              </span>
              <div className="my-3">
                <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {t.impact.step4Title}
                </h4>
              </div>
              <span className="text-[11px] text-emerald-300/70">
                {t.impact.step4Sub}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
