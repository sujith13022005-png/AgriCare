import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Leaf,
  Bot,
  BadgeCheck,
  Award,
  Film,
} from 'lucide-react';
import agriFieldImage from '../assets/images/agri_field_hero_1789982215111.jpg';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  onOpenAdvisor: () => void;
  onSelectCategory: (category: string) => void;
  onOpenVideoGenerator?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenAdvisor,
  onSelectCategory,
  onOpenVideoGenerator,
}) => {
  const { language, t } = useLanguage();

  return (
    <section className="relative overflow-hidden text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Authentic Agricultural Field Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={agriFieldImage}
          alt="AgriCare fertile agricultural crop field under golden hour sunlight"
          className="w-full h-full object-cover object-center filter brightness-95"
          referrerPolicy="no-referrer"
        />
        {/* High-contrast layered gradient scrim to ensure pristine text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-emerald-950/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-black/30" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Welcome & Value Proposition */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'ta'
                  ? 'அந்தியூர் & ஈரோடு வட்டார விவசாய பொருட்கள் • 100+ அசல் தயாரிப்புகள்'
                  : 'Anthiyur & Erode District Agricultural Hub • 100+ Verified Farm Supplies'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-['Outfit',sans-serif]">
              {language === 'ta' ? (
                <>
                  விவசாயிகளின் வளமான விளைச்சலுக்கு <br />
                  <span className="text-emerald-300">தரமான விதைகள் & இயற்கை உரங்கள்</span>
                </>
              ) : (
                <>
                  Empowering Farmers with <br />
                  <span className="text-emerald-300">Pure Seeds, Bio-Nutrients</span> & Expert Tools
                </>
              )}
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* Quick Action Badges & Advisor CTA */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="hero-ai-advisor-trigger"
                onClick={onOpenAdvisor}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-emerald-900" />
                <span>{t('askAdvisor')}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-amber-300 text-[10px] font-bold">
                  {language === 'ta' ? 'குரல் & மேப்' : 'Voice & Maps'}
                </span>
              </button>

              {onOpenVideoGenerator && (
                <button
                  id="hero-veo-video-trigger"
                  onClick={onOpenVideoGenerator}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-sm font-semibold border border-emerald-400/40 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Film className="w-4 h-4 text-amber-300" />
                  <span>{language === 'ta' ? 'Veo வீடியோ அசைவூட்டு' : 'Animate with Veo'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400 text-emerald-950">
                    AI
                  </span>
                </button>
              )}

              <button
                onClick={() => onSelectCategory('Seeds')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white text-sm font-medium border border-emerald-500/30 transition-all cursor-pointer"
              >
                <span>{t('seeds')}</span>
              </button>

              <button
                onClick={() => onSelectCategory('Organic Nutrients')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-emerald-200 text-sm font-medium border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Leaf className="w-4 h-4 text-emerald-300" />
                <span>{t('organicNutrients')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Highlights Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/60 flex items-center justify-center text-emerald-200 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                  {language === 'ta' ? '100% சான்றளிக்கப்பட்டது' : '100% Certified'}
                </p>
                <p className="text-xs text-emerald-200/90 mt-1">
                  {language === 'ta'
                    ? 'முளைப்புத்திறன் பரிசோதிக்கப்பட்ட விதைகள் & மருந்துகள்'
                    : 'High-germination tested seeds & compliant nutrients'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/60 flex items-center justify-center text-amber-200 mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                  {language === 'ta' ? 'பண்ணைக்கே டெலிவரி' : 'Farm Gate Dispatch'}
                </p>
                <p className="text-xs text-emerald-200/90 mt-1">
                  {language === 'ta'
                    ? 'கிராம வாசற்படி விநியோகம் • ரொக்கம் அல்லது UPI'
                    : 'Express rural delivery with Cash on Delivery & UPI'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-green-600/60 flex items-center justify-center text-green-200 mb-3">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                  {language === 'ta' ? 'மருந்தளவு வழிகாட்டல்' : 'Free Dosage Advice'}
                </p>
                <p className="text-xs text-emerald-200/90 mt-1">
                  {language === 'ta'
                    ? 'தெளிப்பான் மருந்து அளவு & பயிர் நோய் AI தீர்வுகள்'
                    : 'AI voice guidance for exact foliar spray & drip application'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/60 flex items-center justify-center text-emerald-200 mb-3">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                  {language === 'ta' ? 'நியாயமான விலை' : 'Fair Farmer Price'}
                </p>
                <p className="text-xs text-emerald-200/90 mt-1">
                  {language === 'ta'
                    ? 'இடைத்தரகர்கள் இல்லாத நேரடி மொத்த விற்பனை விலை'
                    : 'Direct wholesale rates without middleman commissions'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
