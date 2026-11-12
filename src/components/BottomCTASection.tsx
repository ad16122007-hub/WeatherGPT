import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from '../i18n/translations';

interface BottomCTASectionProps {
  onStartAsking: () => void;
  language?: string;
}

export const BottomCTASection: React.FC<BottomCTASectionProps> = ({ onStartAsking, language = 'hi' }) => {
  const t = getTranslations(language);

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7EE] text-center border-t border-[#EAE3D2] w-full max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight mb-4">
          {t.bottomCTA.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 font-normal">
          {t.bottomCTA.desc}
        </p>
        <button
          onClick={onStartAsking}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          <span>{t.bottomCTA.btn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
