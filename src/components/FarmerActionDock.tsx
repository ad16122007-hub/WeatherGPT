import React from 'react';
import { Wind, Droplets, Bug, Bell, ArrowUpRight, Sparkles } from 'lucide-react';
import { getTranslations } from '../i18n/translations';

interface FarmerActionDockProps {
  language?: string;
  onOpenAlertsModal: () => void;
  onScrollToRadar: (tab?: string) => void;
  sprayStatusOptimal?: boolean;
  rainProb?: number;
}

export const FarmerActionDock: React.FC<FarmerActionDockProps> = ({
  language = 'hi',
  onOpenAlertsModal,
  onScrollToRadar,
  sprayStatusOptimal = true,
  rainProb = 15,
}) => {
  const isHindi = language !== 'en';

  const actions = [
    {
      id: 'spray',
      icon: <Wind className="w-5 h-5 text-[#245E43]" />,
      badge: sprayStatusOptimal ? (isHindi ? 'अनुकूल' : 'Optimal') : (isHindi ? 'सावधानी' : 'Caution'),
      badgeColor: sprayStatusOptimal ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200',
      title: isHindi ? 'स्प्रे विंडो कैलकुलेटर' : 'Spray Window Calculator',
      desc: isHindi ? 'दवा व खाद छिड़काव का सही समय और हवा की गति जांचें' : 'Check best spraying hours, Delta-T & wind drift',
      action: () => onScrollToRadar('spray'),
      btnText: isHindi ? 'स्प्रे समय देखें' : 'View Spray Times',
    },
    {
      id: 'water',
      icon: <Droplets className="w-5 h-5 text-teal-600" />,
      badge: isHindi ? 'जड़ नमी 28%' : 'Moisture 28%',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      title: isHindi ? 'सिंचाई व वाष्पोत्सर्जन' : 'Irrigation & Water Budget',
      desc: isHindi ? 'मिट्टी की नमी और फसल पानी की दैनिक आवश्यकता (ET₀)' : 'Root zone moisture depth & Penman-Monteith crop need',
      action: () => onScrollToRadar('irrigation'),
      btnText: isHindi ? 'पानी की मात्रा देखें' : 'View Water Needs',
    },
    {
      id: 'pests',
      icon: <Bug className="w-5 h-5 text-[#C27803]" />,
      badge: isHindi ? 'कीट अलर्ट' : 'Pest Watch',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      title: isHindi ? 'फसल रोग व कीट रडार' : 'Pest & Disease Advisory',
      desc: isHindi ? 'मौसम अनुसार इल्ली, माहू, फंगस और रोग से बचाव' : 'Microclimate fungal, insect vector & rust risk indices',
      action: () => onScrollToRadar('pests'),
      btnText: isHindi ? 'कीट रोकथाम देखें' : 'View Pest Controls',
    },
    {
      id: 'alerts',
      icon: <Bell className="w-5 h-5 text-rose-600" />,
      badge: isHindi ? 'मुफ्त SMS / WhatsApp' : 'Free Alerts',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      title: isHindi ? 'गाँव मौसम चेतावनी' : 'Village Weather Alerts',
      desc: isHindi ? 'भारी बारिश, ओलावृष्टि व आंधी की सीधी फोन चेतावनी' : 'Instant severe rain, frost & storm notifications to phone',
      action: onOpenAlertsModal,
      btnText: isHindi ? 'अलर्ट चालू करें' : 'Set Alerts Free',
    },
  ];

  return (
    <section className="py-6 sm:py-8 bg-[#FAF7EE] border-b border-[#E8E2D2] w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              {isHindi ? '⚡ किसान तुरंत निर्णय टूलबॉक्स (Quick Decision Tools)' : 'Quick Agricultural Tools'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi
                ? 'अपनी जरूरत अनुसार सीधे टूल खोलें और तुरंत सटीक फैसला लें'
                : 'Direct 1-tap farm intelligence and severe weather subscriptions'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((act) => (
            <div
              key={act.id}
              onClick={act.action}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD5C0] hover:border-[#C27803] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7EE] border border-[#E8E2D2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {act.icon}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 group-hover:text-[#C27803] transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {act.desc}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-[#C27803]">
                <span>{act.btnText}</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
