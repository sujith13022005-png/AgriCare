import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  ExternalLink,
  Sprout,
  RotateCcw,
  ShoppingBag,
  Check,
  Mic,
  MicOff,
  Globe,
  Radio,
  Copy,
  Search,
  Stethoscope,
  Zap,
  MapPin,
  Languages,
} from 'lucide-react';
import { ChatMessage, Product, AdvisorRole } from '../types';
import { useVoiceInput } from '../hooks/useVoiceInput';
import agriFieldImage from '../assets/images/agri_field_hero_1789982215111.jpg';
import { useLanguage } from '../context/LanguageContext';

interface AgriChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakText: (text: string) => void;
  activePlayingText: string | null;
  isLoadingAudio: boolean;
  onAddToCart?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  allProducts?: Product[];
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

interface RoleConfig {
  id: AdvisorRole;
  name: string;
  shortName: string;
  model: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  colorClass: string;
  welcomeMessageEn: string;
  welcomeMessageTa: string;
  suggestedQuestionsEn: string[];
  suggestedQuestionsTa: string[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'general',
    name: 'AgriCare General Agronomist',
    shortName: 'General Advisor',
    model: 'gemini-3.5-flash',
    badge: 'Search & Maps Grounded',
    icon: Sprout,
    description: 'Crop advice, fertilizer schedules & real-time market data',
    colorClass: 'emerald',
    welcomeMessageEn: `Namaste! I am your **AgriCare General Agronomist**, powered by **gemini-3.5-flash** with live **Google Search & Google Maps Grounding** for **Anthiyur & Erode District**.\n\nI can assist you with:\n- Current Anthiyur & Erode turmeric mandi rates, sugarcane MSP & nearby APMCs\n- Seasonal sowing schedules for BSR-1/BSR-2 Turmeric, Bhavani CO-51 Paddy & Sugarcane\n- Recommended NPK, TNAU Turmeric Booster & organic neem cake schedules\n- 100+ AgriCare products available at Anthiyur Depot\n\nWhat farming question can I solve for you today?`,
    welcomeMessageTa: `வணக்கம்! நான் உங்களின் **AgriCare வேளாண்மை ஆலோசகர்**. **அந்தியூர் & ஈரோடு வட்டார** விவசாயிகளுக்காக **gemini-3.5-flash** மற்றும் **Google Maps / Search** ஆதரவுடன் செயல்படுகிறேன்.\n\nநான் உங்களுக்கு உதவக்கூடியவை:\n- அந்தியூர் மஞ்சள் சந்தை விலை, கரும்பு, நெல் மற்றும் மரவள்ளிக்கிழங்கு ஆலோசனைகள்\n- BSR-1/BSR-2 மஞ்சள் கிழங்கு விதைப்பு மற்றும் TNAU பூஸ்டர் மேலாண்மை\n- அருகில் உள்ள மண்டிகள், ஒழுங்குமுறை விற்பனைக்கூடங்கள் மற்றும் உரக்கடைகள்\n- அந்தியூர் டிப்போவில் கிடைக்கும் 100+ அசல் தயாரிப்புகள்\n\nஇன்று உங்கள் பயிருக்கு என்ன ஆலோசனை வேண்டும்?`,
    suggestedQuestionsEn: [
      'Latest Erode & Anthiyur turmeric mandi prices 2026',
      'TNAU Turmeric Booster dosage for 1 acre in Anthiyur',
      'Find nearby agricultural mandis in Erode & Anthiyur',
      'Sugarcane Co-86032 sett treatment & fertilizer schedule',
    ],
    suggestedQuestionsTa: [
      'அந்தியூர் & ஈரோடு ஒழுங்குமுறை விற்பனைக்கூட மஞ்சள் விலை',
      'மஞ்சள் பயிருக்கு TNAU பூஸ்டர் மற்றும் இலைவழி தெளிப்பு அளவு',
      'ஈரோடு பகுதியில் கரும்பு Co-86032 கரணை நேர்த்தி முறைகள்',
      'தென்னை மரங்களுக்கு காண்டாமிருக வண்டு பொறி அமைக்கும் முறை',
    ],
  },
  {
    id: 'complex_diagnostic',
    name: 'Crop Doctor & Plant Pathologist',
    shortName: 'Diagnostic Pro',
    model: 'gemini-3.1-pro-preview',
    badge: 'Deep Reasoning',
    icon: Stethoscope,
    description: 'In-depth plant pathology, fungal diagnostics & chemical tank mixes',
    colorClass: 'indigo',
    welcomeMessageEn: `Greetings. I am the **AgriCare Senior Plant Pathologist & Diagnostic Specialist**, powered by **gemini-3.1-pro-preview** for complex agricultural challenges.\n\nI specialize in:\n- Detailed fungal, bacterial & viral crop disease etiology\n- Symptom differential diagnosis (e.g. chlorosis vs early blight)\n- Chemical tank mix compatibility & pesticide resistance management\n- Soil chemistry, pH buffering & micronutrient antagonisms\n\nDescribe your crop symptoms in detail for an agronomical diagnosis.`,
    welcomeMessageTa: `வணக்கம். நான் **AgriCare மூத்த தாவர நோயியல் நிபுணர் (Crop Doctor)**. **gemini-3.1-pro-preview** உயர் ஆய்வாற்றலுடன் செயல்படுகிறேன்.\n\nஎன் சிறப்புத் துறைகள்:\n- பூஞ்சை, பாக்டீரியா மற்றும் வைரஸ் பயிர் நோய்களைக் கண்டறிதல்\n- இலைக்கருகல், வாடல் நோய் மற்றும் மஞ்சள் தேமல் நோய் தடுப்பு\n- பூச்சிக்கொல்லி மருந்து கலவை மற்றும் எதிர்ப்புத்திறன் மேலாண்மை\n- மண்ணின் கார அமிலத்தன்மை (pH) மற்றும் நுண்ணூட்டச் சத்து குறைபாடுகள்\n\nஉங்கள் பயிரில் உள்ள அறிகுறிகளை விளக்குங்கள், உடனடி தீர்வை வழங்குகிறேன்.`,
    suggestedQuestionsEn: [
      'Diagnose yellowing leaves and brown spots on tomatoes',
      'Can I tank-mix Mancozeb with Chlorpyrifos and micronutrients?',
      'How to identify bacterial wilt vs fungal fusarium wilt in chillies?',
      'Remedy severe iron chlorosis in alkaline black cotton soil',
    ],
    suggestedQuestionsTa: [
      'தக்காளி இலையில் மஞ்சள் வளையம் மற்றும் கருகல் நோய் தீர்வு',
      'பயிரில் இரும்புச்சத்து குறைபாட்டை எவ்வாறு சரிசெய்வது?',
      'மிளகாயில் பாக்டீரியா வாடல் நோயை தடுக்கும் முறை',
      'பூச்சிக்கொல்லி மருந்துகளை பாதுகாப்பாக கலக்கும் வழிகள்',
    ],
  },
  {
    id: 'fast_assistant',
    name: 'AgriCare Quick Field Assistant',
    shortName: 'Fast Assistant',
    model: 'gemini-3.1-flash-lite',
    badge: 'Ultra Fast',
    icon: Zap,
    description: 'Instant dilution rates, knapsack tank dosage & seed calculator',
    colorClass: 'amber',
    welcomeMessageEn: `Ready! I am the **AgriCare Quick Field Assistant**, powered by **gemini-3.1-flash-lite** for ultra-fast, direct answers.\n\nAsk me for:\n- Instant dilution ratios (grams per liter or ml per 15L knapsack tank)\n- Seed rate per acre or hectare\n- Quick sprayer calibration\n- Immediate do/don't field steps\n\nWhat calculation or rapid dosage do you need?`,
    welcomeMessageTa: `தயார்! நான் **AgriCare உடனடி கள உதவியாளர்**. **gemini-3.1-flash-lite** மூலம் நொடிப்பொழுதில் தெளிவான கணக்கீடுகளை வழங்குகிறேன்.\n\nஉடனடி உதவிகள்:\n- 15 லிட்டர் தெளிப்பான் டேங்கிற்கான சரியான மருந்து அளவு\n- ஒரு ஏக்கருக்கான விதை அளவு மற்றும் உர அளவு\n- விரைவான தெளிப்பு கணக்கீடுகள்\n\nஉங்களுக்கு என்ன உடனடி அளவு தேவை?`,
    suggestedQuestionsEn: [
      'NPK 19-19-19 dosage for 15L knapsack sprayer',
      'Seed rate for 1 acre basmati rice transplanting',
      'Neem oil 10000 PPM dilution for 100 liters of water',
      'Urea top dressing quantity for 2 acres of wheat',
    ],
    suggestedQuestionsTa: [
      '15 லிட்டர் ஸ்ப்ரே டேங்கிற்கு NPK 19-19-19 அளவு',
      'ஒரு ஏக்கர் நெல் நடவுக்கு தேவையான விதை அளவு',
      '100 லிட்டர் தண்ணீருக்கு வேப்ப எண்ணெய் கரைசல் அளவு',
      'ஒரு ஏக்கர் பயிருக்கு யூரியா மேலுர அளவு',
    ],
  },
];

export const AgriChatbot: React.FC<AgriChatbotProps> = ({
  isOpen,
  onClose,
  onSpeakText,
  activePlayingText,
  isLoadingAudio,
  onAddToCart,
  onSelectProduct,
  allProducts = [],
  initialQuery,
  onClearInitialQuery,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<AdvisorRole>('general');
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(true);
  const [enableMapsGrounding, setEnableMapsGrounding] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim()) {
      setInputText(initialQuery.trim());
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [isOpen, initialQuery]);

  const getWelcomeText = (role: RoleConfig, lang: string) => {
    return lang === 'ta' ? role.welcomeMessageTa : role.welcomeMessageEn;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      text: getWelcomeText(currentRoleConfig, language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleType: currentRoleConfig.id,
      modelUsed: currentRoleConfig.model,
      searchGrounded: currentRoleConfig.id === 'general',
    },
  ]);

  // Update welcome message if language changes and conversation is fresh
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome') {
        return [
          {
            ...prev[0],
            text: getWelcomeText(currentRoleConfig, language),
          },
        ];
      }
      return prev;
    });
  }, [language]);

  // Voice recording & transcription via gemini-3.5-transcribe
  const {
    isRecording,
    isTranscribing,
    recordingSeconds,
    statusMessage: voiceStatus,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceInput({
    onTranscribed: (transcribedText) => {
      setInputText((prev) => {
        const separator = prev.trim() ? ' ' : '';
        return `${prev.trim()}${separator}${transcribedText}`;
      });
    },
    onError: (err) => {
      console.warn('Voice transcription error:', err);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isGenerating, isOpen]);

  // Switch role handler
  const handleRoleChange = (role: AdvisorRole) => {
    setSelectedRole(role);
    const newConfig = ROLES.find((r) => r.id === role) || ROLES[0];
    const roleIntroMessage: ChatMessage = {
      id: 'msg-role-switch-' + Date.now(),
      role: 'model',
      text: getWelcomeText(newConfig, language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleType: newConfig.id,
      modelUsed: newConfig.model,
      searchGrounded: newConfig.id === 'general',
    };
    setMessages((prev) => [...prev, roleIntroMessage]);
  };

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isGenerating) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleType: selectedRole,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsGenerating(true);

    try {
      // Prior conversation history before the new user query
      const historyPayload = messages
        .filter((m) => !m.id.startsWith('msg-welcome') && !m.id.startsWith('msg-role-switch'))
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          roleType: selectedRole,
          enableSearchGrounding,
          enableMapsGrounding,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API responded with status ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        data.text ||
        (language === 'ta'
          ? 'நான் உங்கள் பயிர்கள், விதைகள், உரங்கள் மற்றும் பூச்சி மேலாண்மை கேள்விகளுக்கு உதவ தயாராக உள்ளேன்.'
          : 'I am here to assist you with your crops, seeds, fertilizers, and pest management questions.');

      const botReply: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleType: data.roleType || selectedRole,
        modelUsed: data.modelUsed || currentRoleConfig.model,
        searchGrounded: data.searchGrounded || false,
        mapsGrounded: data.mapsGrounded || false,
        groundingSources: data.groundingSources,
        searchQueries: data.searchQueries,
        matchedProducts: data.matchedProducts,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error('Chat generation error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'model',
        text:
          language === 'ta'
            ? 'மன்னிக்கவும், இணைப்பில் சிறு தடை ஏற்பட்டது. AgriCare உதவி எண் 1800-425-AGRI ஐ அழைக்கலாம் அல்லது மீண்டும் கேட்கலாம்.'
            : 'I apologize, I am temporarily having trouble connecting to the network. Please consult our AgriCare helpline at 1800-425-AGRI or ask about any crop disease or fertilizer schedule.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleType: selectedRole,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-' + Date.now(),
        role: 'model',
        text: getWelcomeText(currentRoleConfig, language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleType: currentRoleConfig.id,
        modelUsed: currentRoleConfig.model,
        searchGrounded: currentRoleConfig.id === 'general',
      },
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleAddProductFromChat = (productId: string) => {
    if (!onAddToCart) return;
    const targetProduct = allProducts.find((p) => p.id === productId);
    if (targetProduct) {
      onAddToCart(targetProduct);
      setAddedItemIds((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [productId]: false }));
      }, 2500);
    }
  };

  const handleViewProduct = (productId: string) => {
    if (!onSelectProduct) return;
    const targetProduct = allProducts.find((p) => p.id === productId);
    if (targetProduct) {
      onSelectProduct(targetProduct);
    }
  };

  const suggestedQuestions =
    language === 'ta'
      ? currentRoleConfig.suggestedQuestionsTa
      : currentRoleConfig.suggestedQuestionsEn;

  return (
    <div
      id="agri-chatbot-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="agri-chatbot-panel"
        className="relative w-full max-w-xl bg-white dark:bg-[#101912] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chatbot Header */}
        <div className="relative p-4 bg-emerald-950 text-white border-b border-emerald-800 flex flex-col gap-3 shadow-xs overflow-hidden">
          {/* Background image layer */}
          <img
            src={agriFieldImage}
            alt="Agricultural Field"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-green-950/85" />

          {/* Top Title & Controls */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-emerald-200 shadow-xs">
                <Bot className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-['Outfit',sans-serif]">
                    {language === 'ta' ? 'AgriCare AI விவசாய ஆலோசகர்' : 'AgriCare AI Advisor'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-[10px] text-emerald-200 font-semibold border border-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Gemini 3.5</span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/85">
                  {language === 'ta'
                    ? 'கூகுள் தேடல் & மேப்ஸ் ஆதரவு • தமிழ் & ஆங்கிலம் • குரல் ஒலிவடிவம்'
                    : 'Google Search & Maps Grounding • English & Tamil • Audio'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch Toggle inside chatbot */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-emerald-700/60"
                title="Switch Language / மொழியை மாற்றவும்"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'தமிழ்' : 'English'}</span>
              </button>

              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/80 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role / Persona Selector Bar */}
          <div className="relative z-10 grid grid-cols-3 gap-1.5 pt-1">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`flex flex-col p-2 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800/90 border-emerald-400 text-white shadow-xs'
                      : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200 hover:bg-emerald-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Icon className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-emerald-900 text-emerald-200 border border-emerald-700">
                      {role.model.replace('gemini-', '')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold truncate leading-tight">
                    {language === 'ta' && role.id === 'general'
                      ? 'வேளாண் ஆலோசகர்'
                      : language === 'ta' && role.id === 'complex_diagnostic'
                      ? 'பயிர் மருத்துவர்'
                      : language === 'ta' && role.id === 'fast_assistant'
                      ? 'கள உதவியாளர்'
                      : role.shortName}
                  </span>
                  <span className="text-[9px] text-emerald-300/80 truncate">
                    {role.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/60 dark:bg-[#0c140d]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = activePlayingText === msg.text;
            const isCopied = copiedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Sprout className="w-4 h-4 text-emerald-300" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-2.5 ${
                    isUser
                      ? 'bg-emerald-800 dark:bg-emerald-700 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-[#142016] text-emerald-950 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-900/60 rounded-tl-xs'
                  }`}
                >
                  {/* Model & Grounding Header on bot replies */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-emerald-100/70 dark:border-emerald-900/40 text-[10px]">
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                          {msg.roleType === 'complex_diagnostic'
                            ? 'Plant Pathologist Pro'
                            : msg.roleType === 'fast_assistant'
                            ? 'Quick Field Assistant'
                            : 'AgriCare Agronomist'}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{msg.modelUsed || currentRoleConfig.model}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {msg.mapsGrounded && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span>Google Maps</span>
                          </span>
                        )}
                        {msg.searchGrounded && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">
                            <Globe className="w-3 h-3 text-blue-500" />
                            <span>Google Search</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Search Queries used by Google Search Grounding */}
                  {!isUser && msg.searchQueries && msg.searchQueries.length > 0 && (
                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 text-[10px] space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <Search className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Google Grounding Queries:</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.searchQueries.map((query, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#1a2d1d] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 italic"
                          >
                            &ldquo;{query}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounding / Search & Maps Citations if available */}
                  {!isUser && msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 space-y-1.5 text-[11px]">
                      <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Verified Live Sources & Map References:</span>
                      </span>
                      <div className="grid grid-cols-1 gap-1">
                        {msg.groundingSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 hover:text-blue-950 dark:hover:text-blue-100 hover:bg-blue-100/70 transition-colors flex items-center justify-between gap-2"
                          >
                            <span className="truncate font-medium">{src.title || src.uri}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-blue-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched AgriCare Catalog Products Chips */}
                  {!isUser && msg.matchedProducts && msg.matchedProducts.length > 0 && (
                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட விவசாய பொருட்கள்:' : 'Recommended AgriCare Supplies:'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.matchedProducts.map((prod) => {
                          const isAdded = addedItemIds[prod.id];
                          return (
                            <div
                              key={prod.id}
                              className="p-2 rounded-xl bg-emerald-50/70 dark:bg-[#18281c] border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-emerald-950 dark:text-emerald-100 truncate text-[11px]">
                                  {prod.name}
                                </p>
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                  ₹{prod.price} <span className="text-stone-400 dark:text-stone-500">/ {prod.unit}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {onSelectProduct && (
                                  <button
                                    onClick={() => handleViewProduct(prod.id)}
                                    className="px-2 py-1 rounded-md text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#203525] transition-colors cursor-pointer"
                                  >
                                    {language === 'ta' ? 'விவரம்' : 'View'}
                                  </button>
                                )}
                                {onAddToCart && (
                                  <button
                                    onClick={() => handleAddProductFromChat(prod.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                      isAdded
                                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white'
                                        : 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-2xs active:scale-95'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>{language === 'ta' ? 'சேர்க்கப்பட்டது' : 'Added'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag className="w-3 h-3" />
                                        <span>{t('addToCart')}</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions & Timestamp Footer */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      className={`text-[10px] ${
                        isUser ? 'text-emerald-200' : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className={`p-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                          isUser
                            ? 'text-emerald-200 hover:text-white hover:bg-emerald-700'
                            : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1a2d1d]'
                        }`}
                        title="Copy message"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => onSpeakText(msg.text)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                            isSpeakingThis
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-[#18281c] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#203525] border border-emerald-200/60 dark:border-emerald-800/60'
                          }`}
                          title="Listen to this advice via Gemini TTS"
                        >
                          {isSpeakingThis ? (
                            <>
                              <VolumeX className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                              <span>{t('stop')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                              <span>{t('listenAloud')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex gap-3 items-center text-xs text-emerald-800 dark:text-emerald-300 bg-white dark:bg-[#142016] p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 w-fit">
              <Sprout className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-spin" />
              <span>
                {selectedRole === 'complex_diagnostic'
                  ? 'Plant Pathologist Pro (gemini-3.1-pro-preview) is analyzing pathology...'
                  : selectedRole === 'fast_assistant'
                  ? 'Quick Field Assistant (gemini-3.1-flash-lite) is calculating...'
                  : enableMapsGrounding
                  ? 'AgriCare Advisor is finding locations with Google Maps (gemini-3.5-flash)...'
                  : enableSearchGrounding
                  ? 'AgriCare Advisor is searching Google data and compiling advice (gemini-3.5-flash)...'
                  : 'AgriCare AI Advisor is preparing recommendations...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Chips */}
        {messages.length <= 3 && (
          <div className="px-4 py-2 bg-emerald-50/70 dark:bg-[#121e14] border-t border-emerald-100 dark:border-emerald-900/60 flex items-center gap-1.5 overflow-x-auto pb-2">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider shrink-0">
              {language === 'ta' ? 'பரிந்துரைகள்:' : 'Suggested:'}
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#18281c] border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-[#203525] whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Voice Recording Active Banner */}
        {isRecording && (
          <div className="px-4 py-2.5 bg-red-500/10 border-t border-red-500/30 flex items-center justify-between text-xs text-red-600 dark:text-red-400 animate-pulse">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-ping" />
              <span className="font-semibold">
                {language === 'ta'
                  ? `குரல் பதிவு செய்யப்படுகிறது... (${recordingSeconds}s)`
                  : `Listening to speech via microphone... (${recordingSeconds}s)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={stopRecording}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 cursor-pointer"
              >
                {language === 'ta' ? 'முடிந்தது' : 'Done (Transcribe)'}
              </button>
              <button
                onClick={cancelRecording}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Transcribing Indicator */}
        {isTranscribing && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Transcribing your audio with <strong>gemini-3.5-transcribe</strong>...</span>
          </div>
        )}

        {/* Voice status/error message if any */}
        {voiceStatus && !isRecording && !isTranscribing && (
          <div className="px-4 py-1.5 bg-stone-100 dark:bg-[#152317] text-[11px] text-stone-600 dark:text-stone-300 border-t border-stone-200 dark:border-stone-800">
            {voiceStatus}
          </div>
        )}

        {/* Chat Input Bar & Controls */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#101912] border-t border-emerald-100 dark:border-emerald-900/60 space-y-2">
          {/* Controls Bar: Google Search Grounding & Google Maps Grounding toggles */}
          <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800 dark:text-emerald-300 font-medium select-none">
                <input
                  type="checkbox"
                  checked={enableSearchGrounding && !enableMapsGrounding}
                  onChange={(e) => {
                    setEnableSearchGrounding(e.target.checked);
                    if (e.target.checked) setEnableMapsGrounding(false);
                  }}
                  className="rounded-xs text-emerald-600 focus:ring-emerald-500 dark:bg-[#1a2d1d] dark:border-emerald-700 cursor-pointer"
                />
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Search Grounding</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800 dark:text-emerald-300 font-medium select-none">
                <input
                  type="checkbox"
                  checked={enableMapsGrounding}
                  onChange={(e) => {
                    setEnableMapsGrounding(e.target.checked);
                    if (e.target.checked) setEnableSearchGrounding(false);
                  }}
                  className="rounded-xs text-red-600 focus:ring-red-500 dark:bg-[#1a2d1d] dark:border-emerald-700 cursor-pointer"
                />
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Maps Grounding (Mandis & Stores)</span>
              </label>
            </div>

            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
              {currentRoleConfig.model}
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="agri-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'பயிர் நோய்கள், உரங்கள், மண்டி இடங்கள், மருந்தளவு பற்றி கேளுங்கள்...'
                  : selectedRole === 'complex_diagnostic'
                  ? 'Describe crop blight, lesions, chlorosis or chemical mix...'
                  : selectedRole === 'fast_assistant'
                  ? 'Ask for fast tank dilution, seed rates or spray doses...'
                  : 'Ask crop questions, market rates, fertilizers, seeds...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-xs focus:bg-white dark:focus:bg-[#1a2d1d] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 outline-hidden text-emerald-950 dark:text-emerald-100 placeholder-emerald-800/50 dark:placeholder-emerald-400/50"
              disabled={isGenerating || isRecording}
            />

            {/* Audio Recording / Speech-To-Text via gemini-3.5-transcribe */}
            <button
              id="voice-transcribe-button"
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isGenerating || isTranscribing}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400 shadow-sm'
                  : 'bg-emerald-100/80 dark:bg-[#1a2d1d] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-[#203525] border border-emerald-200 dark:border-emerald-800'
              }`}
              title={isRecording ? 'Stop Recording & Transcribe' : 'Speak via microphone (gemini-3.5-transcribe)'}
              aria-label="Voice input with gemini-3.5-transcribe"
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Message Button */}
            <button
              id="send-chat-message-button"
              type="submit"
              disabled={!inputText.trim() || isGenerating || isRecording}
              className="w-10 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
