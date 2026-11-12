import React from 'react';
import { getTranslations } from '../i18n/translations';

interface FooterProps {
  language?: string;
}

export const Footer: React.FC<FooterProps> = ({ language = 'hi' }) => {
  const t = getTranslations(language);

  return (
    <footer className="bg-[#091522] text-slate-400 text-xs py-12 border-t border-slate-800 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-white font-serif font-bold text-base block mb-1">
            Weather<span className="text-[#C27803]">GPT</span>
          </span>
          <p className="text-[11px] text-slate-400 max-w-md">
            {t.footer.desc}
          </p>
        </div>
        <div className="text-[11px] text-slate-400 font-mono text-center sm:text-right">
          <span>{t.footer.sources}</span>
          <p className="mt-1 text-slate-300 font-semibold">{t.footer.dedicated}</p>
        </div>
      </div>
    </footer>
  );
};
