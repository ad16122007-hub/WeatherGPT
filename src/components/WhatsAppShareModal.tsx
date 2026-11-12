import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, Send } from 'lucide-react';
import { GeocodeLocation, WeatherData, CropConfig } from '../types';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeocodeLocation;
  currentWeather: WeatherData | null;
  crop: CropConfig;
  language?: string;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  location,
  currentWeather,
  crop,
  language = 'hi',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isHindi = language !== 'en';
  const cityName = location.name.split(',')[0];
  const temp = Math.round(currentWeather?.current?.temperature_2m ?? 30);
  const rainProb = currentWeather?.hourly?.precipitation_probability?.[0] ?? 0;
  const windSpeed = Math.round(currentWeather?.current?.wind_speed_10m ?? 7);
  const soilMoisture = currentWeather?.agronomic?.soil?.rootZonePct ?? 28;
  const cropTitle = isHindi ? crop.nameHi || crop.name : crop.name;

  const isSprayFeasible = windSpeed < 15 && rainProb < 40;

  const shareText = `🌾 *WeatherGPT - दैनिक किसान बुलेटिन* 🌾
📍 *स्थान:* ${cityName} (${location.admin1 || 'भारत'})
📅 *दिनांक:* ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}

🌡️ *तापमान:* ${temp}°C | 🌧️ *बारिश संभावना:* ${rainProb}%
💨 *हवा की गति:* ${windSpeed} km/h | 💧 *जड़ नमी:* ${soilMoisture}%

🚜 *स्प्रे फैसला:* ${isSprayFeasible ? '✅ अनुकूल (दवा छिड़काव कर सकते हैं)' : '⚠️ हवा तेज / बारिश का खतरा - स्प्रे रोकें'}
💧 *सिंचाई सलाह:* ${soilMoisture < 25 ? '⚠️ शाम को हल्की सिंचाई करें' : '✅ मिट्टी में पर्याप्त नमी है'}
🌱 *फसल सलाह (${cropTitle}):* कल्ले व वानस्पतिक वृद्धि पर विशेष ध्यान दें।

📊 *ताज़ा मंडी भाव:*
• गेहूं: ₹2,480/क्विंटल
• सोयाबीन: ₹4,860/क्विंटल
• चना: ₹5,740/क्विंटल
• सरसों: ₹5,420/क्विंटल

🎙️ *WeatherGPT पर बोलकर अपनी फसल का सवाल पूछें:*
https://ais-pre-4igp4kt5ixygqjvctksj47-608257159943.asia-east1.run.app`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7EE] w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-amber-500/30 text-slate-900 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E2D2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                {isHindi ? 'गाँव किसान ग्रुप में शेयर करें' : 'Share Weather Bulletin to WhatsApp'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? '1-क्लिक में आज का मौसम व मंडी भाव भेजें' : 'Share today’s weather & market rates'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-[#DDD5C0] flex items-center justify-center transition cursor-pointer text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="my-4 p-4 rounded-2xl bg-white border border-[#DDD5C0] overflow-y-auto max-h-60 text-xs sm:text-sm font-sans text-slate-800 whitespace-pre-line leading-relaxed shadow-2xs">
          {shareText}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {/* Direct WhatsApp Share Link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95 text-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isHindi ? 'सीधे WhatsApp पर भेजें' : 'Send on WhatsApp'}</span>
          </a>

          {/* Copy Message Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 border border-[#DDD5C0] text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">{isHindi ? 'कॉपी हो गया!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>{isHindi ? 'संदेश कॉपी करें' : 'Copy Text'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
