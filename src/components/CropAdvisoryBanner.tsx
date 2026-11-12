import React from 'react';
import { ShieldCheck, AlertCircle, Sparkles, Share2, Sprout, ChevronRight } from 'lucide-react';
import { CropConfig } from '../types';

interface CropAdvisoryBannerProps {
  crop: CropConfig;
  temperature: number;
  humidity: number;
  rainProb: number;
  language?: string;
  onOpenShareModal: () => void;
  onOpenAskWithCrop: (prompt: string) => void;
}

const CROP_ADVISORIES: Record<string, {
  stage: string;
  stageEn: string;
  advisoryHi: string;
  advisoryEn: string;
  pestThreatHi: string;
  pestThreatEn: string;
  preventiveHi: string;
  preventiveEn: string;
  fertTipHi: string;
  fertTipEn: string;
}> = {
  wheat: {
    stage: 'कल्ले फूटना / वानस्पतिक वृद्धि (Tillering Stage)',
    stageEn: 'Tillering & Vegetative Stage',
    advisoryHi: 'गेहूं की फसल में वर्तमान तापमान (22-28°C) कल्ले फूटने के लिए अत्यधिक अनुकूल है। खेत में पर्याप्त नमी बनाए रखें।',
    advisoryEn: 'Current temperatures (22-28°C) are optimal for tillering. Ensure root zone moisture is maintained.',
    pestThreatHi: 'पीला रतुआ (Yellow Rust) और माहू (Aphid) की निगरानी रखें',
    pestThreatEn: 'Monitor for Yellow Rust and Foliar Aphids',
    preventiveHi: 'पत्तियों पर पीली धारियां दिखने पर प्रोपिकोनाज़ोल 25% EC (1 मिली/लीटर) का सुबह शांत मौसम में छिड़काव करें।',
    preventiveEn: 'If yellow pustules appear, spray Propiconazole 25% EC @ 1ml/L in calm morning wind.',
    fertTipHi: 'यूरिया की दूसरी टॉप-ड्रेसिंग पहली सिंचाई के 3-4 दिन बाद शाम को दें।',
    fertTipEn: 'Apply second urea top-dressing 3-4 days after irrigation in evening.',
  },
  soybean: {
    stage: 'फली विकास व दाना भराव (Pod Filling)',
    stageEn: 'Pod Development & Grain Filling',
    advisoryHi: 'सोयाबीन में फली बनते समय पानी की कमी न होने दें। यदि 10 दिनों से बारिश न हुई हो तो हल्की सिंचाई करें।',
    advisoryEn: 'Avoid water stress during pod filling. Provide supplementary irrigation if dry spell exceeds 10 days.',
    pestThreatHi: 'तंबाकू इल्ली (Spodoptera) और गर्डल बीटल (Girdle Beetle)',
    pestThreatEn: 'Tobacco Caterpillar & Girdle Beetle',
    preventiveHi: 'क्लोरेंट्रानिलिप्रोल 18.5% SC (Coragen) 60 मिली प्रति एकड़ की दर से 150 लीटर पानी में मिलाकर स्प्रे करें।',
    preventiveEn: 'Apply Chlorantraniliprole 18.5% SC @ 60ml/acre in 150L water if pest threshold exceeded.',
    fertTipHi: '0:52:34 (मोनो पोटेशियम फॉस्फेट) 1 किग्रा/एकड़ का पर्णीय छिड़काव दानों की चमक बढ़ाता है।',
    fertTipEn: 'Foliar spray of 0:52:34 @ 1kg/acre improves seed weight and shine.',
  },
  mustard: {
    stage: 'फूल व फली निर्माण (Flowering & Siliqua Stage)',
    stageEn: 'Flowering & Siliqua Formation',
    advisoryHi: 'सरसों में फूल खिलते समय तेज हवा और बादल छाने से माहू कीट का खतरा बढ़ जाता है।',
    advisoryEn: 'Overcast skies and high humidity during flowering increase aphid risk significantly.',
    pestThreatHi: 'चेपा / माहू (Mustard Aphid) और सफेद रतुआ (White Rust)',
    pestThreatEn: 'Mustard Aphid and White Rust',
    preventiveHi: 'यदि 10% टहनियों पर माहू दिखे, तो इमिडाक्लोप्रिड 17.8% SL (0.5 मिली/लीटर) का छिड़काव धूप खिलने पर करें।',
    preventiveEn: 'If 10% inflorescence infested, spray Imidacloprid 17.8% SL @ 0.5ml/L on clear sunny day.',
    fertTipHi: 'फूल आते समय खेत में गंधक (सल्फर) की पूर्ति दानों में तेल प्रतिशत 2-3% बढ़ाती है।',
    fertTipEn: 'Sulfur supplementation during pod formation raises oil content by 2-3%.',
  },
  gram: {
    stage: 'फूल व घांटी निर्माण (Pod Formation)',
    stageEn: 'Flowering & Pod Setting',
    advisoryHi: 'चने में फूल खिलने के समय सिंचाई से बचें, इससे फूल गिरने का खतरा रहता है। घांटी बनने पर ही पानी दें।',
    advisoryEn: 'Avoid flood irrigation during peak flowering to prevent bloom drop. Irrigate at pod setting.',
    pestThreatHi: 'घांटी छेदक इल्ली (Helicoverpa / Pod Borer)',
    pestThreatEn: 'Helicoverpa Armigera (Gram Pod Borer)',
    preventiveHi: 'खेत में प्रति एकड़ 5-6 फेरोमोन ट्रैप लगाएं और इमामेक्टिन बेंजोएट 5% SG (80 ग्राम/एकड़) का छिड़काव करें।',
    preventiveEn: 'Install 5-6 pheromone traps/acre and apply Emamectin Benzoate 5% SG @ 80g/acre.',
    fertTipHi: '2% यूरिया या 19:19:19 का हल्का छिड़काव घांटी का वजन और दाना भराव मजबूत करता है।',
    fertTipEn: 'Foliar application of 2% urea or 19:19:19 enhances pod filling and grain boldness.',
  },
  cotton: {
    stage: 'टिंडे विकास व चुनाई (Boll Opening & Picking)',
    stageEn: 'Boll Development & Picking',
    advisoryHi: 'कपास में बादल छाने व उमस से गुलाबी सुंडी का प्रकोप हो सकता है। खेत को खरपतवार मुक्त रखें।',
    advisoryEn: 'Humid cloudy conditions elevate Pink Bollworm hazard. Keep field border clean.',
    pestThreatHi: 'गुलाबी सुंडी (Pink Bollworm) व सफेद मक्खी (Whitefly)',
    pestThreatEn: 'Pink Bollworm & Whitefly',
    preventiveHi: 'रोशनी वाले ट्रैप (Light Trap) लगाएं और आवश्यकतानुसार अनुशंसित कीटनाशक का स्प्रे करें।',
    preventiveEn: 'Install light traps and follow refuge strategy with designated spray cycles.',
    fertTipHi: 'पोटेशियम नाइट्रेट (13:0:45) का 1.5% छिड़काव रेशे की गुणवत्ता व टिंडे का आकार बढ़ाता है।',
    fertTipEn: 'Spray 1.5% Potassium Nitrate (13:0:45) to increase fiber strength and boll weight.',
  },
  rice: {
    stage: 'कल्ले फूटना / बाली निकलना (Panicle Initiation)',
    stageEn: 'Panicle Initiation & Flowering',
    advisoryHi: 'धान में बाली निकलते समय खेत में 2-3 सेमी पानी का स्तर बना रहना अनिवार्य है।',
    advisoryEn: 'Maintain 2-3 cm standing water during panicle emergence and anthesis.',
    pestThreatHi: 'तना छेदक (Stem Borer) और झुलसा रोग (Bacterial Leaf Blight)',
    pestThreatEn: 'Yellow Stem Borer & Bacterial Blight',
    preventiveHi: 'कार्टाप हाइड्रोक्लोराइड 4G (7.5 किग्रा/एकड़) का प्रयोग करें या ट्राइसाइक्लाजोल का स्प्रे करें।',
    preventiveEn: 'Apply Cartap Hydrochloride 4G @ 7.5kg/acre or Tricyclazole 75% WP for blast control.',
    fertTipHi: 'पोटाश (MOP) की अंतिम खुराक बाली निकलने से ठीक पहले देने से दाना ठोस और चमकदार बनता है।',
    fertTipEn: 'Final top dressing of Muriate of Potash ensures dense grain weight and non-lodging.',
  },
  maize: {
    stage: 'भुट्टा निर्माण व दाना भराव (Silking & Grain Filling)',
    stageEn: 'Silking & Tasseling',
    advisoryHi: 'मक्के में सिल्क निकलते समय मिट्टी में नमी की कमी पैदावार 30-40% तक घटा सकती है।',
    advisoryEn: 'Moisture stress during silking drastically reduces kernel count. Maintain irrigation.',
    pestThreatHi: 'फॉल आर्मीवर्म (Fall Armyworm - FAW)',
    pestThreatEn: 'Fall Armyworm (FAW)',
    preventiveHi: 'मक्के के पोंगे (Whorl) में दानेदार कीटनाशक डालें या स्पिनोसैड 45% SC का छिड़काव करें।',
    preventiveEn: 'Apply granular bait or Spinosad 45% SC directly into plant whorls.',
    fertTipHi: 'जिंक सल्फेट की कमी होने पर 0.5% जिंक सल्फेट + 0.25% चूने के पानी का छिड़काव करें।',
    fertTipEn: 'Foliar spray of 0.5% Zinc Sulfate + lime water corrects micronutrient deficiency.',
  },
};

export const CropAdvisoryBanner: React.FC<CropAdvisoryBannerProps> = ({
  crop,
  temperature,
  humidity,
  rainProb,
  language = 'hi',
  onOpenShareModal,
  onOpenAskWithCrop,
}) => {
  const isHindi = language !== 'en';
  const cropKey = crop.id.toLowerCase();
  const advisory = CROP_ADVISORIES[cropKey] || CROP_ADVISORIES.wheat;

  const cropTitle = isHindi ? crop.nameHi || crop.name : crop.name;

  return (
    <section className="py-5 bg-gradient-to-b from-[#FAF7EE] to-[#F3EDE0] border-b border-[#E8E2D2] w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#D9CEB4] shadow-md relative overflow-hidden">
          {/* Subtle agronomy watermark pattern */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-amber-500/5 pointer-events-none" />

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE3D2]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                <Sprout className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                    {cropTitle} - {isHindi ? 'दैनिक फसल सुरक्षा व कीट अलर्ट' : 'Daily Crop Shield & Pest Advisory'}
                  </h3>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {isHindi ? advisory.stage : advisory.stageEn}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isHindi
                    ? 'वर्तमान मौसम (तापमान ' + temperature + '°C, आर्द्रता ' + humidity + '%) के आधार पर वैज्ञानिक सिफारिश'
                    : `Scientific agrometeorological guidance for ${temperature}°C & ${humidity}% RH`}
                </p>
              </div>
            </div>

            {/* Quick Share to WhatsApp Button */}
            <button
              type="button"
              onClick={onOpenShareModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>{isHindi ? '📲 किसान ग्रुप में शेयर करें' : 'Share to WhatsApp'}</span>
            </button>
          </div>

          {/* 3-Column Advisory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Card 1: मुख्य कृषि सलाह */}
            <div className="bg-[#FAF7EE] rounded-2xl p-4 border border-[#E3DAC4]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  {isHindi ? 'मौसम अनुसार सलाह' : 'Weather Field Tip'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed mb-3">
                {isHindi ? advisory.advisoryHi : advisory.advisoryEn}
              </p>
              <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-[#DDD5C0]">
                <strong className="text-slate-900 block mb-0.5 font-semibold">
                  {isHindi ? '💡 खाद/उर्वरक सुझाव:' : '💡 Fertilizer Guidance:'}
                </strong>
                {isHindi ? advisory.fertTipHi : advisory.fertTipEn}
              </div>
            </div>

            {/* Card 2: कीट व रोग खतरा */}
            <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200/80">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-mono">
                  {isHindi ? 'कीट व रोग चेतावनी' : 'Pest Risk Alert'}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-rose-950 mb-2">
                {isHindi ? advisory.pestThreatHi : advisory.pestThreatEn}
              </div>
              <p className="text-xs text-rose-900/90 leading-relaxed font-medium">
                {isHindi
                  ? 'हवा में नमी और तापमान के कारण इस रोग का फैलाव संभव है। खेत के किनारों पर विशेष ध्यान दें।'
                  : 'Favorable relative humidity enables rapid spore germination & vector migration.'}
              </p>
            </div>

            {/* Card 3: रोकथाम और दवा (Actionable Solution) */}
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
                    {isHindi ? 'सटीक दवा व उपचार' : 'Recommended Treatment'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed mb-3">
                  {isHindi ? advisory.preventiveHi : advisory.preventiveEn}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onOpenAskWithCrop(
                    isHindi
                      ? `${cropTitle} में रोग रोकथाम और सही दवा के बारे में और विस्तार से बताएं`
                      : `Detailed pest and spray management for ${cropTitle}`
                  )
                }
                className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <span>{isHindi ? 'दवा की सही मात्रा पूछें' : 'Ask Dosage & Mixing'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
