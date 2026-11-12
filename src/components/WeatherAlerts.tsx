import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CloudLightning,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  CheckCircle2,
  ShieldCheck,
  Send,
  Phone
} from 'lucide-react';
import { WeatherData, CropConfig, GeocodeLocation } from '../types';
import { formatTemp, formatWind } from '../utils/weatherUtils';

interface WeatherAlertsProps {
  weather: WeatherData;
  crop: CropConfig;
  location: GeocodeLocation;
  language: 'hi' | 'en';
  isImperial: boolean;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({
  weather,
  crop,
  location,
  language,
  isImperial,
}) => {
  const isHindi = language === 'hi';
  const [phoneAlertSet, setPhoneAlertSet] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const current = weather.current;
  const tMax = weather.daily?.temperature_2m_max?.[0] ?? current.temperature_2m;
  const tMin = weather.daily?.temperature_2m_min?.[0] ?? current.temperature_2m;
  const windGusts = current.wind_gusts_10m;
  const rainSum = weather.daily?.precipitation_sum?.slice(0, 3).reduce((a, b) => a + (b || 0), 0) ?? 0;

  // Real-time active alerts evaluation
  const activeAlerts = [];

  // Frost Alert
  if (tMin <= crop.criticalFrostTempC + 2) {
    activeAlerts.push({
      id: 'frost',
      title: isHindi ? 'पाला / शीतलहर चेतावनी (Frost & Cold Wave)' : 'Frost & Freeze Warning',
      severity: 'high',
      icon: Snowflake,
      color: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200',
      tag: isHindi ? 'गंभीर चेतावनी' : 'High Alert',
      desc: isHindi
        ? `आगामी रातों में न्यूनतम तापमान ${formatTemp(tMin, isImperial)} तक गिर सकता है। ${crop.nameHi || crop.name} में पाले से नुकसान की आशंका है।`
        : `Minimum temperature expected to drop to ${formatTemp(tMin, isImperial)}. Risk of frost damage to ${crop.name}.`,
      action: isHindi
        ? 'शाम के समय हल्की सिंचाई करें या खेत की मेड़ों पर धुआं करें ताकि तापमान सुरक्षित रहे।'
        : 'Apply light evening irrigation or run wind machines to protect sensitive crop canopy.',
    });
  }

  // Heatwave Alert
  if (tMax >= crop.idealTempMaxC + 3) {
    activeAlerts.push({
      id: 'heat',
      title: isHindi ? 'लू व भीषण गर्मी चेतावनी (Heatwave Alert)' : 'Severe Heatwave Alert',
      severity: 'high',
      icon: Flame,
      color: 'border-amber-500/60 bg-amber-950/40 text-amber-200',
      tag: isHindi ? 'ऑरेंज अलर्ट' : 'Orange Alert',
      desc: isHindi
        ? `दिन का तापमान ${formatTemp(tMax, isImperial)} तक पहुंचने की संभावना है। पछुआ गर्म हवाओं से फसल में पराग सूखने व फूल झड़ने का खतरा।`
        : `Day temperatures reaching ${formatTemp(tMax, isImperial)}. High evaporative stress and risk of flower abortion.`,
      action: isHindi
        ? 'ड्रिप या स्प्रिंकलर से नियमित अंतराल पर नमी बनाए रखें। दोपहर में तेज धूप के समय छिड़काव न करें।'
        : 'Maintain soil moisture to prevent stomatal shock. Avoid chemical sprays during midday heat.',
    });
  }

  // Wind / Storm Alert
  if (windGusts > 25) {
    activeAlerts.push({
      id: 'wind',
      title: isHindi ? 'आंधी व तेज हवा की चेतावनी (High Wind Warning)' : 'Strong Wind & Gusts Warning',
      severity: 'medium',
      icon: Wind,
      color: 'border-rose-500/60 bg-rose-950/40 text-rose-200',
      tag: isHindi ? 'येलो अलर्ट' : 'Yellow Alert',
      desc: isHindi
        ? `हवा के झोंके ${formatWind(windGusts, isImperial)} तक जा सकते हैं। लंबी खड़ी फसलों (जैसे गेहूं, मक्का) में गिरने (Lodging) का खतरा।`
        : `Wind gusts up to ${formatWind(windGusts, isImperial)}. Danger of crop lodging in mature cereals.`,
      action: isHindi
        ? 'तेज हवा के दौरान खेत में पानी न लगाएं, गीली मिट्टी में फसल गिर सकती है। कीटनाशक छिड़काव रोक दें।'
        : 'Do not irrigate during strong winds to prevent lodging. Cease all chemical spraying.',
    });
  }

  // Rain Washout Alert
  if (rainSum > 15) {
    activeAlerts.push({
      id: 'rain',
      title: isHindi ? 'असमय वर्षा चेतावनी (Unseasonal Heavy Rain)' : 'Heavy Rain & Washout Warning',
      severity: 'medium',
      icon: CloudLightning,
      color: 'border-blue-500/60 bg-blue-950/40 text-blue-200',
      tag: isHindi ? 'अलर्ट' : 'Alert',
      desc: isHindi
        ? `अगले 72 घंटों में लगभग ${rainSum.toFixed(1)} mm बारिश का अनुमान। खेत में जलभराव की संभावना।`
        : `Accumulated rainfall of ~${rainSum.toFixed(1)} mm forecasted over next 72 hours.`,
      action: isHindi
        ? 'खेत से अतिरिक्त पानी की निकासी (Drainage) सुनिश्चित करें। कटाई की गई उपज को सुरक्षित स्थान पर ढकें।'
        : 'Ensure proper drainage channels are clear and cover harvested produce.',
    });
  }

  // Default No Severe Alert State
  const hasAlerts = activeAlerts.length > 0;

  return (
    <div className="w-full max-w-full overflow-hidden space-y-4">
      {/* Alert Header Box */}
      <div className="farm-card rounded-2xl p-4 sm:p-5 border-amber-900/30">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base sm:text-lg text-stone-100">
              {isHindi ? 'मौसम चेतावनी व कृषि सुरक्षा अलर्ट' : 'Agro-Meteorological Alerts'}
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/40">
            {location.name.split(',')[0]}
          </span>
        </div>

        {/* Active Alerts List */}
        <div className="mt-4 space-y-3">
          {hasAlerts ? (
            activeAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 sm:p-4 rounded-xl border ${alert.color} space-y-2 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="font-bold text-sm sm:text-base">{alert.title}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10">
                      {alert.tag}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                    {alert.desc}
                  </p>

                  <div className="pt-2 border-t border-white/10 text-xs font-medium text-amber-300 flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong>{isHindi ? 'बचाव सलाह:' : 'Action Required:'}</strong> {alert.action}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong className="block font-bold">
                  {isHindi ? 'फिलहाल कोई गंभीर मौसमी खतरा नहीं है' : 'No Critical Severe Weather Alerts'}
                </strong>
                <p className="text-stone-300 text-xs mt-0.5">
                  {isHindi
                    ? `${location.name.split(',')[0]} में तापमान, हवा व बारिश की स्थिति सामान्य है। नियमित कृषि कार्य जारी रख सकते हैं।`
                    : `Atmospheric and soil conditions for ${location.name.split(',')[0]} are stable and favorable.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Free SMS / WhatsApp Alert Notification Card */}
      <div className="farm-card rounded-2xl p-4 sm:p-5 border-emerald-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-stone-100 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>
                {isHindi ? 'खेत पर सीधे मौसम अलर्ट पाएं' : 'Get Farm Weather Alerts Directly'}
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              {isHindi
                ? 'आंधी, भारी बारिश या पाले की पूर्व सूचना सीधे आपके मोबाइल पर। फसल सुरक्षा के लिए समय पर अलर्ट।'
                : 'Receive advance warnings for storms, unseasonal rain, and frost directly on your phone.'}
            </p>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={isHindi ? 'मोबाइल नंबर दर्ज करें' : 'Enter mobile number'}
              className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 w-full sm:w-48"
            />
            <button
              onClick={() => {
                if (phoneNumber.trim().length >= 10) {
                  setPhoneAlertSet(true);
                  setTimeout(() => setPhoneAlertSet(false), 4000);
                } else {
                  alert(isHindi ? 'कृपया 10 अंकों का मोबाइल नंबर डालें' : 'Please enter a valid 10-digit number');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-colors shrink-0"
            >
              {phoneAlertSet ? (
                <span className="flex items-center gap-1 text-stone-950">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isHindi ? 'सेट हो गया' : 'Active'}
                </span>
              ) : (
                isHindi ? 'अलर्ट चालू करें' : 'Enable Alerts'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
