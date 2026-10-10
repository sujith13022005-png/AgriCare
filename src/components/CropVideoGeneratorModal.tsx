import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Video,
  Sparkles,
  Upload,
  Play,
  RotateCcw,
  Download,
  AlertCircle,
  Loader2,
  Film,
  CheckCircle2,
  Maximize2,
  Sliders,
  Crop,
  Image as ImageIcon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CropVideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  initialPrompt?: string;
}

// Curated high-resolution farm sample photos for instant one-click demonstration
const SAMPLE_FARM_PHOTOS = [
  {
    id: 'turmeric-field',
    titleEn: 'Anthiyur Turmeric Sprout',
    titleTa: 'அந்தியூர் மஞ்சள் பயிர்',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    promptEn:
      'A cinematic timelapse of turmeric sprouts growing vigorously into emerald lush foliage in fertile red soil under golden morning sunlight',
    promptTa:
      'அதிகாலை சூரிய ஒளியில் செழிப்பான வளமான மண்ணில் துளிர்க்கும் பசுமையான மஞ்சள் பயிரின் அழகிய வீடியோ',
  },
  {
    id: 'paddy-crop',
    titleEn: 'Bhavani Paddy Field',
    titleTa: 'பவானி நெல் வயல்',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    promptEn:
      'Cinematic slow drone camera sweeping over vibrant green paddy fields swaying rhythmically in gentle afternoon breeze',
    promptTa:
      'தென்றல் காற்றில் மெல்ல அசைந்தாடும் பசுமையான நெல் பயிர்களின் மீது பறக்கும் ட்ரோன் கேமரா காட்சி',
  },
  {
    id: 'tomato-plant',
    titleEn: 'Organic Tomato Crop',
    titleTa: 'இயற்கை தக்காளி பயிர்',
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    promptEn:
      'Macro close-up video of ripening organic tomatoes on the vine glistening with morning dew drops as sunlight streams through leaves',
    promptTa:
      'காலை பனித்துளிகள் மின்னும் தக்காளி செடியில் பழங்கள் பழுக்கும் நேர்த்தியான மேக்ரோ வீடியோ காட்சி',
  },
  {
    id: 'seed-germination',
    titleEn: 'Seed Germination',
    titleTa: 'விதை முளைப்புத்திறன்',
    url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
    promptEn:
      'High-speed scientific timelapse of a healthy seed germinating, pushing roots into moist dark compost and unfurling first green leaves',
    promptTa:
      'வளமான மண்ணில் விதை முளைத்து முதல் பச்சை இலைகள் விரிவடையும் அறிவியல் டைம்லேப்ஸ் காட்சி',
  },
];

const ANIMATION_PRESETS = [
  {
    id: 'drone-sweep',
    labelEn: 'Cinematic Drone Sweep',
    labelTa: 'ட்ரோன் பறக்கும் காட்சி',
    promptEn: 'Cinematic 4K drone sweep slowly drifting forward across lush green crop foliage with realistic wind motion and soft morning lighting.',
  },
  {
    id: 'timelapse-growth',
    labelEn: 'Growth & Sprouting Timelapse',
    labelTa: 'பயிர் வளர்ச்சி டைம்லேப்ஸ்',
    promptEn: 'Fast-motion agricultural growth timelapse showing vibrant shoots expanding, unfurling emerald leaves and flourishing under changing sunlight.',
  },
  {
    id: 'gentle-breeze',
    labelEn: 'Gentle Field Breeze',
    labelTa: 'இதமான தென்றல் அசைவு',
    promptEn: 'Natural realistic botanical animation of leaves and stems swaying gently in a calm breeze with soft atmospheric dust motes and sunlight rays.',
  },
  {
    id: 'macro-dew',
    labelEn: 'Macro Morning Dew',
    labelTa: 'பனித்துளி மேக்ரோ காட்சி',
    promptEn: 'Cinematic macro lens zoom showcasing sparkling morning dew drops on crisp crop leaves with subtle depth-of-field focus shift.',
  },
];

export const CropVideoGeneratorModal: React.FC<CropVideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialImageUrl,
  initialPrompt,
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(initialImageUrl || null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState<string>(
    initialPrompt || 'Cinematic drone sweep over flourishing green turmeric crop with morning dew and soft sunlight'
  );

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for generation feedback
  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (generatedVideoUrl && generatedVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [generatedVideoUrl]);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(language === 'ta' ? 'தயவுசெய்து படக் கோப்பை பதிவேற்றவும் (JPG, PNG, WEBP)' : 'Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImageBase64(result);
      setSelectedImagePreview(result);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle selecting a sample photo
  const handleSelectSample = async (sample: typeof SAMPLE_FARM_PHOTOS[0]) => {
    setSelectedImagePreview(sample.url);
    setPrompt(language === 'ta' ? sample.promptTa : sample.promptEn);
    setErrorMessage(null);

    try {
      // Fetch sample image and convert to base64
      const response = await fetch(sample.url);
      const blob = await response.blob();
      setImageMimeType(blob.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Could not convert sample to base64, will use fallback:', err);
    }
  };

  // Convert image URL to base64 helper
  const ensureBase64 = async (url: string): Promise<string> => {
    if (selectedImageBase64) return selectedImageBase64;
    const response = await fetch(url);
    const blob = await response.blob();
    setImageMimeType(blob.type || 'image/jpeg');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start Veo generation
  const handleGenerateVideo = async () => {
    if (!selectedImagePreview && !selectedImageBase64) {
      setErrorMessage(language === 'ta' ? 'முதலில் ஒரு பயிர் புகைப்படத்தை தேர்வு செய்யவும்.' : 'Please select or upload a crop photo first.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedVideoUrl(null);
    setGenerationStep(1);
    setStatusMessage(
      language === 'ta'
        ? 'பயிர் புகைப்படத்தை ஆய்வு செய்து Veo மாடலுக்கு அனுப்புகிறது...'
        : 'Analyzing crop photo and preparing Veo generation job...'
    );

    try {
      const base64Data = await ensureBase64(selectedImagePreview || '');

      // Step 1: Start Veo Video Generation via backend
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: imageMimeType,
          prompt,
          aspectRatio, // '16:9' or '9:16' per requirement
        }),
      });

      if (!startRes.ok) {
        const errorData = await startRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${startRes.status}`);
      }

      const startData = await startRes.json();
      const opName = startData.operationName;
      setOperationName(opName);

      // Step 2: Poll status
      setGenerationStep(2);
      setStatusMessage(
        language === 'ta'
          ? 'Veo மாடல் தாவர இயக்கம் மற்றும் சூரிய ஒளியை கணக்கிடுகிறது...'
          : 'Veo 3.1 Fast is synthesizing photorealistic plant motion and lighting...'
      );

      let isDone = false;
      let pollCount = 0;
      const maxPolls = 40; // ~160 seconds max

      while (!isDone && pollCount < maxPolls) {
        await new Promise((r) => setTimeout(r, 4000));
        pollCount++;

        // Update progress indicators
        if (pollCount === 2) {
          setGenerationStep(3);
          setStatusMessage(
            language === 'ta'
              ? 'அதிநவீன 720p பிரேம்களை உருவாக்குகிறது...'
              : 'Rendering high-fidelity 720p video frames with botanical physics...'
          );
        } else if (pollCount === 5) {
          setGenerationStep(4);
          setStatusMessage(
            language === 'ta'
              ? 'வீடியோவை தொகுத்து பதிவிறக்கத்திற்கு தயார் செய்கிறது...'
              : 'Synthesizing final MP4 video stream...'
          );
        }

        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!pollRes.ok) {
          console.warn('Status check non-ok status:', pollRes.status);
          continue;
        }

        const pollData = await pollRes.json();
        if (pollData.error) {
          throw new Error(pollData.error);
        }

        if (pollData.done) {
          isDone = true;
          break;
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try again.');
      }

      // Step 3: Download video via server proxy
      setStatusMessage(
        language === 'ta' ? 'வீடியோவை பதிவிறக்குகிறது...' : 'Downloading completed video...'
      );

      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!downloadRes.ok) {
        throw new Error(`Failed to download completed video: ${downloadRes.status}`);
      }

      const videoBlob = await downloadRes.blob();
      const videoObjectUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoObjectUrl);
      setIsGenerating(false);
      setStatusMessage('');
    } catch (err: any) {
      console.error('Video generation failure:', err);
      setIsGenerating(false);
      setErrorMessage(
        err.message ||
          (language === 'ta'
            ? 'வீடியோ உருவாக்கத்தில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Error during video generation. Please check your Gemini API key and try again.')
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c140e] rounded-2xl shadow-2xl border border-emerald-100 dark:border-emerald-900/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {language === 'ta' ? 'வீடியோ அசைவூட்டும் தளம் (Veo AI)' : 'Veo Crop Animator & Farm Video Studio'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                {language === 'ta'
                  ? 'பயிர் புகைப்படத்தை அசைவூட்டி நேரடி வீடியோவாக மாற்றவும் (16:9 அல்லது 9:16)'
                  : 'Animate farm photos into dynamic cinematic videos using Google Veo (16:9 & 9:16)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                  Tip: Ensure your environment has valid Gemini API access.
                </p>
              </div>
            </div>
          )}

          {/* If Video Generated: Showcase Player */}
          {generatedVideoUrl && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-[#132416] border border-emerald-200 dark:border-emerald-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {language === 'ta' ? 'வெற்றிகரமாக வீடியோ உருவாக்கப்பட்டது!' : 'Veo Video Generation Complete!'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-200/70 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold uppercase">
                    {aspectRatio} • 720p HD
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={generatedVideoUrl}
                    download={`agricare-veo-${aspectRatio.replace(':', '-')}.mp4`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'பதிவிறக்கு' : 'Download MP4'}</span>
                  </a>
                  <button
                    onClick={() => setGeneratedVideoUrl(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'புதிய வீடியோ' : 'New Video'}</span>
                  </button>
                </div>
              </div>

              {/* Video Player Box */}
              <div
                className={`mx-auto rounded-xl overflow-hidden shadow-lg bg-black flex items-center justify-center ${
                  aspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : 'max-w-xl aspect-[16/9]'
                }`}
              >
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-center text-xs text-emerald-700 dark:text-emerald-400">
                Prompt: &ldquo;{prompt}&rdquo;
              </p>
            </div>
          )}

          {/* Active Generation Progress Screen */}
          {isGenerating && (
            <div className="p-8 rounded-2xl bg-gradient-to-b from-emerald-50/90 to-green-50/50 dark:from-[#112314] dark:to-[#0c140e] border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 animate-spin" />
                <Film className="w-6 h-6 text-emerald-700 dark:text-emerald-400 absolute" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  {language === 'ta' ? 'வீடியோ உருவாக்கப்படுகிறது...' : 'Generating Agricultural Video with Veo...'}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                  {statusMessage || 'Processing neural video synthesis...'}
                </p>
                <p className="text-[11px] text-stone-500 font-mono pt-1">
                  Elapsed: {elapsedSeconds}s • Aspect Ratio: {aspectRatio} • Model: veo-3.1-fast-generate-preview
                </p>
              </div>

              {/* Progress Steps */}
              <div className="max-w-md mx-auto pt-2 grid grid-cols-4 gap-2 text-[10px] text-stone-600 dark:text-stone-400 font-medium">
                <div className={`p-1.5 rounded-lg border ${generationStep >= 1 ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                  1. Analysis
                </div>
                <div className={`p-1.5 rounded-lg border ${generationStep >= 2 ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                  2. Physics
                </div>
                <div className={`p-1.5 rounded-lg border ${generationStep >= 3 ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                  3. Rendering
                </div>
                <div className={`p-1.5 rounded-lg border ${generationStep >= 4 ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                  4. Stream
                </div>
              </div>
            </div>
          )}

          {/* Form Setup (Visible when not actively generating or when modifying) */}
          {!isGenerating && !generatedVideoUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Image Selection */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    {language === 'ta' ? '1. பயிர் புகைப்படத்தை தேர்வு செய்க' : '1. Select Crop Photo to Animate'}
                  </label>

                  {/* Upload Box or Image Preview */}
                  <div className="relative border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 bg-emerald-50/40 dark:bg-[#142316]/50 text-center hover:bg-emerald-50 dark:hover:bg-[#142316] transition-colors">
                    {selectedImagePreview ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden shadow-xs border border-emerald-200 dark:border-emerald-800 max-h-48 bg-stone-900 flex items-center justify-center">
                          <img
                            src={selectedImagePreview}
                            alt="Crop Preview"
                            className="max-h-48 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImagePreview(null);
                              setSelectedImageBase64(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{language === 'ta' ? 'வேறு படத்தை மாற்றவும்' : 'Upload Different Photo'}</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="py-6 cursor-pointer space-y-2"
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            {language === 'ta' ? 'புகைப்படத்தை பதிவேற்ற கிளிக் செய்யவும்' : 'Click to upload your crop photo'}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            JPG, PNG, WEBP up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Sample One-Click Photos */}
                <div>
                  <span className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-2">
                    {language === 'ta' ? 'அல்லது மாதிரி புகைப்படத்தை கிளிக் செய்யவும்:' : 'Or choose a sample field photo:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_FARM_PHOTOS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedImagePreview === sample.url
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40 text-emerald-950 dark:text-emerald-100'
                            : 'bg-white dark:bg-[#142316] border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.titleEn}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {language === 'ta' ? sample.titleTa : sample.titleEn}
                          </p>
                          <p className="text-[10px] text-stone-500 truncate">
                            One-click Veo demo
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Settings & Prompt */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 2. Aspect Ratio Selector (16:9 or 9:16) */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    {language === 'ta' ? '2. வீடியோ திரை விகிதம் (Aspect Ratio)' : '2. Video Aspect Ratio (Veo Constraint)'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        aspectRatio === '16:9'
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-600 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                          : 'bg-white dark:bg-[#142316] border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                      }`}
                    >
                      <div className="w-8 h-5 rounded border-2 border-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>16:9 Landscape</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200">
                            Desktop / YouTube
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          Standard wide cinematic panoramic field view
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        aspectRatio === '9:16'
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-600 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                          : 'bg-white dark:bg-[#142316] border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                      }`}
                    >
                      <div className="w-5 h-8 rounded border-2 border-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>9:16 Portrait</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200">
                            Reels / WhatsApp
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          Vertical format optimized for smartphone screens
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Animation Motion Presets */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    {language === 'ta' ? '3. அசைவூட்டும் பாணி (Presets)' : '3. Animation Motion Style'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ANIMATION_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setPrompt(preset.promptEn)}
                        className="px-2.5 py-2 rounded-xl text-left border border-stone-200 dark:border-emerald-900/60 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-xs font-medium text-stone-700 dark:text-stone-300 transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">
                          {language === 'ta' ? preset.labelTa : preset.labelEn}
                        </span>
                        <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Custom Prompt Textarea */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    {language === 'ta' ? '4. அசைவூட்டும் வழிகாட்டுதல் (Veo Prompt)' : '4. Animation Guidance / Prompt'}
                  </label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how the camera, wind, plants, or sunlight should move..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-900 bg-stone-50/60 dark:bg-[#112013] text-stone-900 dark:text-emerald-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                  />
                </div>

                {/* CTA Generate Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || (!selectedImagePreview && !selectedImageBase64)}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Film className="w-4 h-4 text-emerald-200" />
                    <span>
                      {language === 'ta'
                        ? 'Veo மூலம் வீடியோவை உருவாக்குக'
                        : 'Generate Video with Veo (veo-3.1-fast-generate-preview)'}
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-stone-500 dark:text-stone-400 mt-2">
                    Generates 720p HD MP4 video with natural physics using Google Veo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-[#081009] px-5 py-3 border-t border-stone-200 dark:border-emerald-950 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google Veo Video Generation Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
          >
            {language === 'ta' ? 'மூடு' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
