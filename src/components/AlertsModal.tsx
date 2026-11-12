import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Bell,
  Phone,
  CloudRain,
  Flame,
  Snowflake,
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { GeocodeLocation } from '../types';
import { getTranslations } from '../i18n/translations';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeocodeLocation;
  language: string;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  location,
  language,
}) => {
  const t = getTranslations(language);

  const [villageName, setVillageName] = useState(location.name.split(',')[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cropName, setCropName] = useState('गेहूं (Wheat)');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [isSuccess, setIsSuccess] = useState(false);

  const [alerts, setAlerts] = useState({
    heavyRain: true,
    heatwave: true,
    frost: true,
    hailstorm: true,
  });

  const [phoneErrorMsg, setPhoneErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim().length < 10) {
      setPhoneErrorMsg(t.alertsModal.phoneError);
      return;
    }
    setPhoneErrorMsg('');
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7EE] rounded-3xl w-full max-w-lg p-5 sm:p-8 shadow-2xl border border-[#DDD5C0] text-slate-900 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#EFEAD8] text-slate-500 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              {t.alertsModal.successTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {t.alertsModal.successDesc} (+91 {phoneNumber} · {villageName} · {channel.toUpperCase()})
            </p>

            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              {t.alertsModal.closeBtn}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#C27803] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                {t.alertsModal.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              {t.alertsModal.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Location Input */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t.alertsModal.villageLabel}
                </label>
                <input
                  type="text"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  className="w-full bg-white border border-[#DDD5C0] rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#C27803]"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t.alertsModal.phoneLabel}
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2.5 bg-[#EFEAD8] rounded-xl font-bold text-slate-700">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1 bg-white border border-[#DDD5C0] rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#C27803]"
                    required
                  />
                </div>
                {phoneErrorMsg && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{phoneErrorMsg}</p>
                )}
              </div>

              {/* Crop Name */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t.alertsModal.cropLabel}
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full bg-white border border-[#DDD5C0] rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#C27803]"
                >
                  <option value="गेहूं (Wheat)">Wheat / गेहूं / ਕਣਕ / गहू / ઘઉં</option>
                  <option value="धान (Paddy/Rice)">Rice / धान / ਚੌਲ / भात / ડાંગર</option>
                  <option value="कपास (Cotton)">Cotton / कपास / ਨਰਮਾ / कापूस / કપાસ</option>
                  <option value="सोयाबीन (Soybean)">Soybean / सोयाबीन / સોયાબીન</option>
                  <option value="सरसों (Mustard)">Mustard / सरसों / ਸਰ੍ਹੋਂ / मोहरी / રાઈ</option>
                  <option value="चना (Gram/Chickpea)">Gram / चना / ਛੋਲੇ / हरभरा / ચણા</option>
                  <option value="मक्का (Corn/Maize)">Corn / मक्का / ਮੱਕੀ / मका / મકાઈ</option>
                  <option value="सब्जियां व बागवानी (Vegetables)">Vegetables & Fruits / फल व सब्जियां</option>
                </select>
              </div>

              {/* Delivery Channel */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {t.alertsModal.channelLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      channel === 'whatsapp'
                        ? 'bg-[#1E5438] text-white border-[#1E5438]'
                        : 'bg-white border-[#DDD5C0] text-slate-700'
                    }`}
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      channel === 'sms'
                        ? 'bg-[#1E5438] text-white border-[#1E5438]'
                        : 'bg-white border-[#DDD5C0] text-slate-700'
                    }`}
                  >
                    <span>SMS</span>
                  </button>
                </div>
              </div>

              {/* Alert Types Checkboxes */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  {t.alertsModal.alertTypesLabel}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E8E2D2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts.heavyRain}
                      onChange={(e) => setAlerts((prev) => ({ ...prev, heavyRain: e.target.checked }))}
                      className="rounded accent-[#C27803]"
                    />
                    <span>{t.alertsModal.heavyRain}</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E8E2D2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts.hailstorm}
                      onChange={(e) => setAlerts((prev) => ({ ...prev, hailstorm: e.target.checked }))}
                      className="rounded accent-[#C27803]"
                    />
                    <span>{t.alertsModal.hailstorm}</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E8E2D2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts.frost}
                      onChange={(e) => setAlerts((prev) => ({ ...prev, frost: e.target.checked }))}
                      className="rounded accent-[#C27803]"
                    />
                    <span>{t.alertsModal.frost}</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E8E2D2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alerts.heatwave}
                      onChange={(e) => setAlerts((prev) => ({ ...prev, heatwave: e.target.checked }))}
                      className="rounded accent-[#C27803]"
                    />
                    <span>{t.alertsModal.heatwave}</span>
                  </label>
                </div>
              </div>

              {/* Preview Message */}
              <div className="p-3 bg-[#EFEAD8] rounded-xl border border-[#DDD5C0] text-[11px] text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">
                  {t.alertsModal.previewTitle}
                </span>
                <p className="italic">
                  {t.alertsModal.previewMsg.replace('{village}', villageName)}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#E5A83B] hover:bg-[#D99B26] text-slate-950 font-bold text-sm shadow-md transition-all mt-4 cursor-pointer"
              >
                {t.alertsModal.submitBtn}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
