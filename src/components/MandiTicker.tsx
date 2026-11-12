import React from 'react';
import { TrendingUp, TrendingDown, Store, Sparkles } from 'lucide-react';
import { getTranslations } from '../i18n/translations';

interface MandiItem {
  cropHi: string;
  cropEn: string;
  mandi: string;
  price: number;
  change: number; // positive or negative in ₹
  unit: string;
}

const MANDI_DATA: MandiItem[] = [
  { cropHi: 'गेहूं (Wheat)', cropEn: 'Wheat', mandi: 'उज्जैन मंडी', price: 2480, change: 35, unit: 'क्विंटल' },
  { cropHi: 'सोयाबीन (Soybean)', cropEn: 'Soybean', mandi: 'इंदौर मंडी', price: 4860, change: -40, unit: 'क्विंटल' },
  { cropHi: 'चना (Gram/Chana)', cropEn: 'Chana', mandi: 'कोटा मंडी', price: 5740, change: 80, unit: 'क्विंटल' },
  { cropHi: 'सरसों (Mustard)', cropEn: 'Mustard', mandi: 'जयपुर मंडी', price: 5420, change: 25, unit: 'क्विंटल' },
  { cropHi: 'कपास (Cotton)', cropEn: 'Cotton', mandi: 'राजकोट मंडी', price: 7150, change: 110, unit: 'क्विंटल' },
  { cropHi: 'धान (Paddy/Basmati)', cropEn: 'Paddy', mandi: 'करनाल मंडी', price: 3650, change: -20, unit: 'क्विंटल' },
  { cropHi: 'मक्का (Maize)', cropEn: 'Maize', mandi: 'छिंदवाड़ा मंडी', price: 2190, change: 15, unit: 'क्विंटल' },
  { cropHi: 'प्याज (Onion)', cropEn: 'Onion', mandi: 'नासिक/लासलगांव', price: 1850, change: 60, unit: 'क्विंटल' },
];

interface MandiTickerProps {
  language?: string;
  onOpenAskModal?: (questionText?: string) => void;
}

export const MandiTicker: React.FC<MandiTickerProps> = ({ language = 'hi', onOpenAskModal }) => {
  const isHindi = language !== 'en';

  return (
    <div className="w-full bg-[#102A43] border-b border-slate-800 text-white overflow-hidden py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Ticker Lead Tag */}
        <div className="flex items-center gap-1.5 shrink-0 bg-[#E5A83B] text-slate-950 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide">
          <Store className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">
            {isHindi ? 'लाइव मंडी भाव' : 'Live Mandi Bhav'}
          </span>
        </div>

        {/* Scrolling or Flex Commodity Items */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 sm:gap-6 text-xs whitespace-nowrap py-0.5">
          {MANDI_DATA.map((item, idx) => {
            const isUp = item.change >= 0;
            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  onOpenAskModal &&
                  onOpenAskModal(
                    isHindi
                      ? `${item.cropHi} का आज का सटीक मंडी भाव और मौसम का असर क्या है?`
                      : `What is today's mandi price and weather impact on ${item.cropEn}?`
                  )
                }
                className="inline-flex items-center gap-1.5 hover:text-amber-300 transition cursor-pointer group shrink-0"
                title={isHindi ? 'क्लिक करके भाव का मौसम असर पूछें' : 'Click to ask weather impact on price'}
              >
                <span className="font-semibold text-slate-200 group-hover:text-amber-300">
                  {isHindi ? item.cropHi.split('(')[0].trim() : item.cropEn}
                </span>
                <span className="text-slate-400 text-[11px]">({item.mandi})</span>
                <span className="font-mono tabular-nums font-bold text-white">
                  ₹{item.price.toLocaleString()}
                </span>
                <span
                  className={`inline-flex items-center text-[10px] font-mono font-bold ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isUp ? `+₹${item.change}` : `-₹${Math.abs(item.change)}`}
                </span>
                <span className="text-slate-600 ml-1" aria-hidden="true">
                  ·
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
