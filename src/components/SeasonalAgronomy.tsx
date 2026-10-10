import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  CloudRain,
  Thermometer,
  Waves,
  Layers,
  AlertTriangle,
  Check,
  Plus,
  Minus,
  ShoppingCart,
  Bot,
  RefreshCw,
  ChevronRight,
  Sprout,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Droplets,
  ExternalLink,
} from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface RecommendedSeasonalProduct {
  productId: string;
  product?: Product;
  urgencyTag: string;
  seasonalRationale: string;
  dosageOrUsage: string;
  timing: string;
}

export interface SeasonalAgronomyData {
  success: boolean;
  aiGenerated: boolean;
  modelUsed: string;
  isCurrentMonth: boolean;
  monthIndex: number;
  monthName: string;
  tamilMonth: string;
  seasonTitle: string;
  seasonSubtitle: string;
  climateSummary: string;
  weather: {
    tempRange: string;
    rainfallStatus: string;
    canalStatus: string;
    soilCondition: string;
  };
  primaryCrops: string[];
  agronomyTips: { category: string; tip: string }[];
  pestAlert: {
    title: string;
    riskLevel: 'Critical' | 'High' | 'Moderate';
    affectedCrops: string[];
    symptoms: string;
    solution: string;
    productRecommendation?: string;
  };
  recommendedProducts: RecommendedSeasonalProduct[];
}

interface SeasonalAgronomyProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  onOpenAdvisor: (prompt?: string) => void;
}

const MONTH_TABS = [
  { index: 0, nameEn: 'Jan', nameTa: 'ஜன', tamilEn: 'Thai', tamilTa: 'தை' },
  { index: 1, nameEn: 'Feb', nameTa: 'பிப்', tamilEn: 'Maasi', tamilTa: 'மாசி' },
  { index: 2, nameEn: 'Mar', nameTa: 'மார்', tamilEn: 'Panguni', tamilTa: 'பங்குனி' },
  { index: 3, nameEn: 'Apr', nameTa: 'ஏப்', tamilEn: 'Chithirai', tamilTa: 'சித்திரை' },
  { index: 4, nameEn: 'May', nameTa: 'மே', tamilEn: 'Vaikasi', tamilTa: 'வைகாசி' },
  { index: 5, nameEn: 'Jun', nameTa: 'ஜூன்', tamilEn: 'Aani', tamilTa: 'ஆனி' },
  { index: 6, nameEn: 'Jul', nameTa: 'ஜூலை', tamilEn: 'Aadi', tamilTa: 'ஆடி' },
  { index: 7, nameEn: 'Aug', nameTa: 'ஆக', tamilEn: 'Aavani', tamilTa: 'ஆவணி' },
  { index: 8, nameEn: 'Sep', nameTa: 'செப்', tamilEn: 'Purattasi', tamilTa: 'புரட்டாசி' },
  { index: 9, nameEn: 'Oct', nameTa: 'அக்', tamilEn: 'Aippasi', tamilTa: 'ஐப்பசி' },
  { index: 10, nameEn: 'Nov', nameTa: 'நவ', tamilEn: 'Karthigai', tamilTa: 'கார்த்திகை' },
  { index: 11, nameEn: 'Dec', nameTa: 'டிச', tamilEn: 'Margazhi', tamilTa: 'மார்கழி' },
];

export const SeasonalAgronomy: React.FC<SeasonalAgronomyProps> = ({
  onAddToCart,
  onSelectProduct,
  onOpenAdvisor,
}) => {
  const { language, getLocalizedProduct } = useLanguage();
  const currentActualMonth = new Date().getMonth(); // 8 for September
  const [selectedMonth, setSelectedMonth] = useState<number>(currentActualMonth);
  const [agronomyData, setAgronomyData] = useState<SeasonalAgronomyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Fetch seasonal agronomy data from server
  const fetchSeasonalData = async (month: number, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const res = await fetch(
        `/api/seasonal-agronomy?month=${month}&language=${language}${refresh ? '&refresh=true' : ''}`
      );
      if (!res.ok) throw new Error('Failed to load seasonal agronomy');
      const data: SeasonalAgronomyData = await res.json();
      if (data.success) {
        setAgronomyData(data);
      }
    } catch (err) {
      console.warn('Could not fetch seasonal agronomy data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSeasonalData(selectedMonth, false);
  }, [selectedMonth, language]);

  const handleQuantityChange = (productId: string, delta: number) => {
    setProductQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleAddProduct = (prod: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const qty = productQuantities[prod.id] || 1;
    onAddToCart(prod, qty);
    setAddedProductId(prod.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === prod.id ? null : current));
    }, 1800);
  };

  const handleConsultProduct = (item: RecommendedSeasonalProduct, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prodName = item.product?.name || item.productId;
    const monthName = agronomyData?.monthName || 'September';
    const tamilMonth = agronomyData?.tamilMonth || 'Purattasi';

    const promptText =
      language === 'ta'
        ? `${monthName} (${tamilMonth}) மாதத்தில் ${prodName} பொருளை எப்போது, எந்த வீதத்தில் பயன்படுத்த வேண்டும்? இதன் பயன்பாட்டு வழிமுறைகள் மற்றும் முன்னெச்சரிக்கைகள் என்ன?`
        : `How and when should I apply "${prodName}" for my crops during ${monthName} (${tamilMonth}) in Anthiyur? Please advise on exact dosage, tank mixing, and field precautions.`;

    onOpenAdvisor(promptText);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Container Card */}
      <div className="bg-gradient-to-b from-white via-[#fafdfa] to-emerald-50/30 dark:from-[#111c13] dark:via-[#0e170f] dark:to-[#09110a] rounded-3xl border border-emerald-200/70 dark:border-emerald-800/50 shadow-sm overflow-hidden transition-all duration-300">
        {/* Top Header Banner */}
        <div className="p-5 sm:p-7 border-b border-emerald-100 dark:border-emerald-800/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-20 w-60 h-60 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>
                  {language === 'ta' ? 'ஜெமினி AI பயிர் ஆலோசகர்' : 'Gemini AI Agronomy Advisor'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-emerald-100 font-normal">
                  {agronomyData?.modelUsed === 'gemini-3.8-flash'
                    ? 'Live Gemini 3.8'
                    : 'Anthiyur Agri-Engine'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] tracking-tight text-white flex items-center gap-2">
                <span>
                  {language === 'ta'
                    ? 'அந்தியூர் & பவானி பருவகால வேளாண் ஆலோசனை'
                    : 'Seasonal Agronomy & Crop Advisory'}
                </span>
              </h2>

              <p className="text-emerald-100/90 text-sm max-w-2xl font-normal leading-relaxed">
                {language === 'ta'
                  ? 'நடப்பு மாத பயிர் நிலை, பவானி அணை பாசன நீர் அட்டவணை, மற்றும் பூச்சி பாதுகாப்புக்கு உகந்த உள்ளூர் பரிந்துரைகள்.'
                  : 'Actionable crop guidance, Lower Bhavani Project canal water timing, and verified product recommendations tailored for Anthiyur & Erode farmers.'}
              </p>
            </div>

            {/* Current Month Badge & Refresh Button */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setSelectedMonth(currentActualMonth)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedMonth === currentActualMonth
                    ? 'bg-amber-400 text-emerald-950 shadow-md ring-2 ring-amber-300/40'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {language === 'ta' ? 'நடப்பு மாதம் (செப்)' : 'Current Month (Sept)'}
                </span>
                {selectedMonth === currentActualMonth && (
                  <span className="w-2 h-2 rounded-full bg-emerald-800 animate-ping" />
                )}
              </button>

              <button
                onClick={() => fetchSeasonalData(selectedMonth, true)}
                disabled={isRefreshing || isLoading}
                title="Refresh with Gemini AI"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing
                    ? language === 'ta'
                      ? 'புதுப்பிக்கிறது...'
                      : 'Consulting Gemini...'
                    : language === 'ta'
                    ? 'AI புதுப்பி'
                    : 'Refresh AI'}
                </span>
              </button>

              <button
                onClick={() => {
                  const query =
                    language === 'ta'
                      ? `வணக்கம்! செப்டம்பர் புரட்டாசி மாதத்தில் அந்தியூர் பகுதியில் பயிரிடப்பட்டுள்ள மஞ்சள் மற்றும் சம்பா நெல்லுக்கு சிறந்த வேளாண் பராமரிப்பு முறைகளை விளக்குங்கள்.`
                      : `Hello! What are the most critical agronomic practices and pesticide sprays needed for Turmeric and Samba Paddy in Anthiyur during September?`;
                  onOpenAdvisor(query);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>{language === 'ta' ? 'AI ஆலோசகரிடம் கேள்' : 'Ask AI Advisor'}</span>
              </button>
            </div>
          </div>

          {/* 12-Month Calendar Selector Tabs */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20">
              {MONTH_TABS.map((tab) => {
                const isSelected = selectedMonth === tab.index;
                const isCurrent = currentActualMonth === tab.index;
                return (
                  <button
                    key={tab.index}
                    onClick={() => setSelectedMonth(tab.index)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center min-w-[70px] ${
                      isSelected
                        ? 'bg-white text-emerald-900 font-bold shadow-md scale-105'
                        : isCurrent
                        ? 'bg-white/20 text-amber-200 border border-amber-300/40 hover:bg-white/25'
                        : 'bg-white/5 text-emerald-100 hover:bg-white/15'
                    }`}
                  >
                    <span className="text-[13px] leading-tight">
                      {language === 'ta' ? tab.nameTa : tab.nameEn}
                    </span>
                    <span
                      className={`text-[10px] leading-tight opacity-80 ${
                        isSelected ? 'text-emerald-700 font-semibold' : ''
                      }`}
                    >
                      {language === 'ta' ? tab.tamilTa : tab.tamilEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-emerald-800 dark:text-emerald-300 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold tracking-wide">
              {language === 'ta'
                ? 'ஜெமினி AI அந்தியூர் வேளாண் நுண்ணறிவை ஏற்றுகிறது...'
                : 'Consulting Gemini AI with Anthiyur agronomy knowledge base...'}
            </p>
          </div>
        ) : agronomyData ? (
          <div className="p-5 sm:p-7 space-y-6">
            {/* Season Highlight Title Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold">
                    {agronomyData.monthName} • {agronomyData.tamilMonth}
                  </span>
                  {agronomyData.isCurrentMonth && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                      {language === 'ta' ? 'நடப்பு பருவம்' : 'Active Field Season'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50">
                  {agronomyData.seasonTitle}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-300/90 max-w-3xl">
                  {agronomyData.seasonSubtitle}
                </p>
              </div>

              {/* Primary Active Crops */}
              <div className="flex-shrink-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-400/80 mb-1.5 flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ta' ? 'முக்கிய பயிர்கள்' : 'Active Regional Crops'}</span>
                </p>
                <div className="flex flex-wrap gap-1.5 max-w-sm">
                  {agronomyData.primaryCrops.map((crop, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-white dark:bg-[#162518] text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Regional Agro-Climatic Intelligence Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900/80 dark:text-emerald-300/80 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {language === 'ta'
                      ? 'பவானி பாசனம் & வானிலை நிலை'
                      : 'Bhavani Canal & Agro-Climatic Conditions'}
                  </span>
                </h4>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/70">
                  Anthiyur • Bhavani • Gobichettipalayam
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Canal Water Status */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#142016] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {language === 'ta' ? 'பவானி பாசன நீர்' : 'LBP Canal Discharge'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5 leading-snug">
                      {agronomyData.weather.canalStatus}
                    </p>
                  </div>
                </div>

                {/* Temperature Range */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#142016] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {language === 'ta' ? 'வெப்பநிலை நிலவரம்' : 'Temperature Range'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5 leading-snug">
                      {agronomyData.weather.tempRange}
                    </p>
                  </div>
                </div>

                {/* Rainfall Status */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#142016] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {language === 'ta' ? 'மழைப்பொழிவு நிலை' : 'Rainfall Outlook'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5 leading-snug">
                      {agronomyData.weather.rainfallStatus}
                    </p>
                  </div>
                </div>

                {/* Soil & Puddling Condition */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#142016] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {language === 'ta' ? 'மண் ஈரப்பதம்' : 'Soil & Puddling'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5 leading-snug">
                      {agronomyData.weather.soilCondition}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Advisory: Critical Agronomy Tips + Pest Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Field Agronomy Operations (2 cols) */}
              <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131f15] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {language === 'ta'
                        ? 'கள வேளாண் வழிகாட்டுதல்கள்'
                        : 'Critical Field Agronomy Directives'}
                    </span>
                  </h4>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {agronomyData.agronomyTips.length}{' '}
                    {language === 'ta' ? 'குறிப்புகள்' : 'Key Directives'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {agronomyData.agronomyTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/60 dark:border-emerald-900/40 text-xs flex items-start gap-2.5"
                    >
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-emerald-700 dark:bg-emerald-600 text-white font-bold text-[10px]">
                        {tip.category}
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                        {tip.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Risk Pest Alert Banner (1 col) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-50/90 via-amber-50/50 to-orange-50/40 dark:from-red-950/40 dark:via-amber-950/20 dark:to-[#1a1412] border border-red-200/80 dark:border-red-900/50 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase tracking-wide">
                      <ShieldAlert className="w-3 h-3" />
                      <span>
                        {agronomyData.pestAlert.riskLevel}{' '}
                        {language === 'ta' ? 'அபாய எச்சரிக்கை' : 'Pest Alert'}
                      </span>
                    </span>
                    <span className="text-[10px] text-red-700 dark:text-red-300 font-semibold">
                      {agronomyData.monthName}
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-red-950 dark:text-red-100 leading-snug">
                    {agronomyData.pestAlert.title}
                  </h5>

                  <div>
                    <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                      {language === 'ta' ? 'பாதிக்கப்படும் பயிர்கள்:' : 'Affected Crops:'}
                    </p>
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                      {agronomyData.pestAlert.affectedCrops.join(', ')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#1a231b] border border-red-100 dark:border-red-900/40 text-[11px] text-gray-700 dark:text-gray-300 space-y-1">
                    <p className="font-semibold text-red-900 dark:text-red-300">
                      {language === 'ta' ? 'அறிகுறிகள்:' : 'Symptoms:'}
                    </p>
                    <p className="leading-snug">{agronomyData.pestAlert.symptoms}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {language === 'ta' ? 'உடனடி தீர்வு:' : 'Recommended Action:'}
                    </p>
                    <p className="leading-snug">{agronomyData.pestAlert.solution}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const q =
                      language === 'ta'
                        ? `எச்சரிக்கை: ${agronomyData.pestAlert.title} தாக்குதலை கட்டுப்படுத்த என்ன மருந்தை எந்த அளவில் தெளிக்க வேண்டும்? விரிவாக சொல்லுங்கள்.`
                        : `Please provide complete IPM dosage and spraying protocol to control ${agronomyData.pestAlert.title} in Anthiyur this month.`;
                    onOpenAdvisor(q);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ta' ? 'பூச்சி மேலாண்மை AI ஆலோசனை' : 'Get Pest Advisory'}
                  </span>
                </button>
              </div>
            </div>

            {/* RECOMMENDED SEASONAL PRODUCTS SECTION */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50 font-['Outfit',sans-serif] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>
                      {language === 'ta'
                        ? `${agronomyData.monthName} மாதத்திற்கான பரிந்துரைக்கப்பட்ட வேளாண் உள்ளீடுகள்`
                        : `Recommended Farm Inputs for ${agronomyData.monthName}`}
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {language === 'ta'
                      ? 'தற்போதைய பயிர் வளர்ச்சி பருவம் மற்றும் மண் தேவைகளுக்கு உகந்த உள்ளூர் தயாரிப்புகள்'
                      : 'Curated by AgriCare AI agronomist based on Anthiyur regional crop calendar & stock availability'}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full self-start sm:self-auto">
                  {agronomyData.recommendedProducts.length}{' '}
                  {language === 'ta' ? 'பொருட்கள்' : 'Inputs Recommended'}
                </span>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {agronomyData.recommendedProducts.map((item, idx) => {
                  const prod = item.product;
                  if (!prod) return null;

                  const localizedProd = getLocalizedProduct(prod);
                  const displayName = localizedProd.name;
                  const qty = productQuantities[prod.id] || 1;
                  const isAdded = addedProductId === prod.id;
                  const isOutOfStock = prod.stock <= 0;

                  return (
                    <div
                      key={item.productId || idx}
                      onClick={() => onSelectProduct(prod)}
                      className="group bg-white dark:bg-[#131f15] rounded-2xl border border-emerald-100 dark:border-emerald-900/60 p-4 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3"
                    >
                      {/* Top: Image, Category, Urgency Tag */}
                      <div className="space-y-3">
                        <div className="relative aspect-video sm:aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={prod.image}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {/* Urgency Badge */}
                          <div className="absolute top-2 left-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-900/90 backdrop-blur-md text-amber-300 border border-emerald-600/40 text-[10px] font-bold shadow-sm">
                              {item.urgencyTag}
                            </span>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                              {prod.category}
                            </span>
                          </div>

                          {/* Stock Status */}
                          <div className="absolute bottom-2 left-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isOutOfStock
                                  ? 'bg-rose-600 text-white'
                                  : prod.stock <= 10
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-emerald-600/90 text-white backdrop-blur-xs'
                              }`}
                            >
                              {isOutOfStock
                                ? language === 'ta'
                                  ? 'இருப்பு இல்லை'
                                  : 'Out of Stock'
                                : prod.stock <= 10
                                ? language === 'ta'
                                  ? `குறைந்த இருப்பு (${prod.stock})`
                                  : `Low Stock (${prod.stock})`
                                : language === 'ta'
                                ? `இருப்பு: ${prod.stock} ${prod.unit}`
                                : `In Stock: ${prod.stock}`}
                            </span>
                          </div>
                        </div>

                        {/* Product Title & Short Rationale */}
                        <div>
                          <h5 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                            {displayName}
                          </h5>

                          {/* AI Rationale Box */}
                          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>
                                {language === 'ta' ? 'பருவகால காரணம்:' : 'Seasonal Rationale:'}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-950 dark:text-emerald-100 leading-snug font-normal">
                              {item.seasonalRationale}
                            </p>
                          </div>

                          {/* Application Dosage & Timing */}
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#1a251c] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                              <span className="font-semibold text-gray-500 dark:text-gray-400 block">
                                {language === 'ta' ? 'அளவு / விகிதம்:' : 'Dosage / Rate:'}
                              </span>
                              <span className="font-medium text-emerald-900 dark:text-emerald-200 line-clamp-1">
                                {item.dosageOrUsage}
                              </span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#1a251c] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                              <span className="font-semibold text-gray-500 dark:text-gray-400 block">
                                {language === 'ta' ? 'தெளிக்கும் நேரம்:' : 'Timing:'}
                              </span>
                              <span className="font-medium text-emerald-900 dark:text-emerald-200 line-clamp-1">
                                {item.timing}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Price, Quantity & Add to Cart */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300">
                              ₹{prod.price.toLocaleString()}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-xs text-gray-400 line-through ml-1.5">
                                ₹{prod.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                              / {prod.unit}
                            </span>
                          </div>

                          {/* Ask AI button */}
                          <button
                            type="button"
                            onClick={(e) => handleConsultProduct(item, e)}
                            title="Ask AI Advisor about this input"
                            className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>{language === 'ta' ? 'AI கேள்வி' : 'Ask AI'}</span>
                          </button>
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="flex items-center gap-2">
                          {/* Quantity Selector */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a251c] p-0.5"
                          >
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(prod.id, -1)}
                              disabled={qty <= 1 || isOutOfStock}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-gray-100">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(prod.id, 1)}
                              disabled={qty >= prod.stock || isOutOfStock}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            type="button"
                            onClick={(e) => handleAddProduct(prod, e)}
                            disabled={isOutOfStock}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                              isOutOfStock
                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                : isAdded
                                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                                : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 animate-bounce" />
                                <span>{language === 'ta' ? 'சேர்க்கப்பட்டது!' : 'Added!'}</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>
                                  {language === 'ta' ? 'கூடையில் சேர்' : 'Add to Cart'}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
