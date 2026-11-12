import React from 'react';
import { Shield } from 'lucide-react';
import { getTranslations } from '../i18n/translations';

interface HowItWorksSectionProps {
  language?: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ language = 'hi' }) => {
  const t = getTranslations(language);

  const steps = [
    {
      num: t.howItWorks.step1Num,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
    },
    {
      num: t.howItWorks.step4Num,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7EE] border-t border-[#EAE3D2] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 mb-10">
          <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#245E43] uppercase block font-mono">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            {t.howItWorks.title}
          </h2>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-white rounded-2xl p-6 border border-[#E7E1D2] shadow-2xs flex flex-col justify-between hover:border-[#D5CDBC] transition"
            >
              <div>
                <span className="text-4xl sm:text-5xl font-serif text-[#C98F2F] font-normal block mb-4">
                  {s.num}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 font-sans">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Guardrails Bar */}
        <div className="bg-[#0B1E33] rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">
              {t.howItWorks.guardrailsTitle}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t.howItWorks.guardrail1}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t.howItWorks.guardrail2}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t.howItWorks.guardrail3}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
