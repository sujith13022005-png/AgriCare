import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Sprout,
  Leaf,
  Droplets,
  ShieldAlert,
  Wrench,
  ArrowRight,
  Sparkles,
  Layers,
  Mic,
  MicOff,
  Radio,
  Loader2,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { HighlightText } from './HighlightText';
import { formatCurrency } from '../utils/formatters';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface SearchAutocompleteProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct?: (product: Product) => void;
  allProducts: Product[];
  categoryCounts?: Record<string, number>;
  activeCategory?: string;
  placeholder?: string;
  idPrefix?: string;
}

interface CategoryDefinition {
  name: ProductCategory;
  icon: React.ElementType;
  keywords: string[];
  description: string;
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    name: 'Seeds',
    icon: Sprout,
    keywords: ['seed', 'grain', 'hybrid', 'paddy', 'wheat', 'maize', 'corn', 'germination', 'crop', 'variety', 'vegetable'],
    description: 'High-yield hybrid seeds & cereal grains',
  },
  {
    name: 'Fertilizers',
    icon: Droplets,
    keywords: ['fertilizer', 'npk', 'urea', 'potash', 'dap', 'nitrogen', 'phosphorus', 'potassium', 'micronutrient', 'foliar', 'soil'],
    description: 'NPK formulations, solubles & plant food',
  },
  {
    name: 'Pesticides',
    icon: ShieldAlert,
    keywords: ['pesticide', 'insecticide', 'fungicide', 'weedicide', 'pest', 'bug', 'insect', 'spray', 'disease', 'blight', 'borer'],
    description: 'Insecticides, fungicides & crop protectors',
  },
  {
    name: 'Farm Tools',
    icon: Wrench,
    keywords: ['tool', 'sprayer', 'spade', 'hoe', 'shear', 'pruner', 'cutter', 'glove', 'drip', 'irrigation', 'pump', 'equipment'],
    description: 'Sprayers, cutting tools & safety gear',
  },
  {
    name: 'Organic Nutrients',
    icon: Leaf,
    keywords: ['organic', 'nutrient', 'bio', 'vermicompost', 'seaweed', 'humic', 'neem', 'eco', 'natural', 'earthworm', 'tonic'],
    description: '100% bio-certified soil conditioners & tonics',
  },
];

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectProduct,
  allProducts,
  categoryCounts = {},
  activeCategory = 'All',
  placeholder = 'Search seeds, fertilizers, pesticides, tools...',
  idPrefix = 'desktop',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice search transcription via gemini-3.5-transcribe
  const {
    isRecording,
    isTranscribing,
    recordingSeconds,
    statusMessage: voiceStatus,
    startRecording,
    stopRecording,
  } = useVoiceInput({
    onTranscribed: (text) => {
      onSearchChange(text);
      setIsOpen(true);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = searchQuery.trim().toLowerCase();

  // 1. Auto-suggested Categories
  const suggestedCategories = useMemo(() => {
    if (!cleanQuery) {
      // When empty and focused, show all 5 primary categories
      return CATEGORY_DEFINITIONS.map((cat) => ({
        ...cat,
        count: categoryCounts[cat.name] || 0,
        isDirectMatch: false,
      }));
    }

    return CATEGORY_DEFINITIONS.filter((cat) => {
      // Direct category name match
      const nameMatch = cat.name.toLowerCase().includes(cleanQuery);
      // Keyword/synonym match
      const keywordMatch = cat.keywords.some((kw) => kw.includes(cleanQuery) || cleanQuery.includes(kw));
      return nameMatch || keywordMatch;
    }).map((cat) => ({
      ...cat,
      count: categoryCounts[cat.name] || 0,
      isDirectMatch: cat.name.toLowerCase().includes(cleanQuery),
    }));
  }, [cleanQuery, categoryCounts]);

  // 2. Matching Products for instant preview
  const matchingProducts = useMemo(() => {
    if (!cleanQuery) return [];

    return allProducts
      .filter((p) => {
        const q = cleanQuery;
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.cropCompatibility.some((c) => c.toLowerCase().includes(q)) ||
          p.composition.toLowerCase().includes(q)
        );
      })
      .slice(0, 3);
  }, [cleanQuery, allProducts]);

  // Total items in suggestions list for keyboard navigation
  const totalSelectableItems = suggestedCategories.length + matchingProducts.length;

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= totalSelectableItems ? 0 : prev + 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? totalSelectableItems - 1 : prev - 1));
      return;
    }

    if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        // Check if selected index is in suggestedCategories
        if (activeIndex < suggestedCategories.length) {
          const selectedCat = suggestedCategories[activeIndex];
          handleCategoryClick(selectedCat.name);
        } else {
          // Selected index is in matchingProducts
          const productIndex = activeIndex - suggestedCategories.length;
          const selectedProd = matchingProducts[productIndex];
          if (selectedProd && onSelectProduct) {
            onSelectProduct(selectedProd);
            setIsOpen(false);
          }
        }
      } else {
        // Just submit current search
        setIsOpen(false);
      }
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    onSelectCategory(categoryName);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative w-full flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
        <input
          id={`search-input-${idPrefix}`}
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? `Listening... (${recordingSeconds}s)` : isTranscribing ? 'Transcribing audio...' : placeholder}
          autoComplete="off"
          className={`w-full pl-10 pr-18 py-2 rounded-xl border text-sm transition-all outline-hidden font-medium ${
            isRecording
              ? 'bg-red-50/80 dark:bg-red-950/40 border-red-400 text-red-900 dark:text-red-200 placeholder-red-500'
              : 'bg-emerald-50/70 dark:bg-[#152317] border-emerald-200/90 dark:border-emerald-800/80 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#1a2d1d] focus:ring-3 focus:ring-emerald-500/15 placeholder-emerald-800/50 dark:placeholder-emerald-400/50 text-emerald-950 dark:text-emerald-100'
          }`}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-100 p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-[#1a2d1d] transition-colors cursor-pointer"
              aria-label="Clear search"
              title="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Search Button (gemini-3.5-transcribe) */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                : isTranscribing
                ? 'bg-amber-100 text-amber-700 animate-spin'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-[#203525]'
            }`}
            title={
              isRecording
                ? 'Stop Recording'
                : isTranscribing
                ? 'Transcribing audio via gemini-3.5-transcribe...'
                : 'Voice Search via microphone (gemini-3.5-transcribe)'
            }
            aria-label="Voice search with gemini-3.5-transcribe"
          >
            {isTranscribing ? (
              <Loader2 className="w-3.5 h-3.5" />
            ) : isRecording ? (
              <MicOff className="w-3.5 h-3.5" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Voice Status Alert if error or info */}
      {voiceStatus && !isRecording && !isTranscribing && (
        <div className="mt-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-[11px] rounded-lg border border-amber-200 dark:border-amber-800">
          {voiceStatus}
        </div>
      )}

      {/* Auto-suggest Dropdown Panel */}
      {isOpen && (
        <div
          id={`search-suggestions-dropdown-${idPrefix}`}
          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#101a12] rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/80 overflow-hidden z-50 divide-y divide-emerald-50 dark:divide-emerald-900/40 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[75vh] overflow-y-auto text-emerald-950 dark:text-emerald-100"
        >
          {/* Section 1: Auto-Suggested Categories */}
          <div className="p-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {cleanQuery ? 'Suggested Categories' : 'Explore by Category'}
              </span>
              {cleanQuery && suggestedCategories.length > 0 && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  Matches &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {suggestedCategories.length === 0 ? (
              <div className="px-3 py-2 text-xs text-stone-500 italic">
                No categories match &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {suggestedCategories.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isSelected = activeIndex === idx;
                  const isActive = activeCategory === cat.name;

                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleCategoryClick(cat.name)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-2xs'
                          : isActive
                          ? 'bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-100 border border-emerald-300/80 dark:border-emerald-700 font-bold'
                          : 'hover:bg-emerald-50 dark:hover:bg-[#18281b] text-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-700 text-amber-300'
                              : isActive
                              ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : 'bg-emerald-50 dark:bg-[#18281b] text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-[#203524]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p
                            className={`text-xs font-bold leading-tight truncate ${
                              isSelected ? 'text-white' : 'text-emerald-950 dark:text-emerald-100'
                            }`}
                          >
                            <HighlightText
                              text={cat.name}
                              query={searchQuery}
                              highlightClassName={
                                isSelected
                                  ? 'bg-amber-400 text-emerald-950 font-black px-0.5 rounded-xs'
                                  : 'bg-amber-200 dark:bg-amber-400/40 text-emerald-950 dark:text-amber-200 font-black px-0.5 rounded-xs'
                              }
                            />
                          </p>
                          <p
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-emerald-100' : 'text-emerald-700/80 dark:text-emerald-400/80'
                            }`}
                          >
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-emerald-900 text-amber-300'
                              : 'bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Quick Matching Products (if query is present) */}
          {cleanQuery && matchingProducts.length > 0 && (
            <div className="p-3 bg-stone-50/50 dark:bg-[#0c140e]/60">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Matching Products ({matchingProducts.length})
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">Click to view specs</span>
              </div>

              <div className="space-y-1.5">
                {matchingProducts.map((prod, prodIdx) => {
                  const globalIdx = suggestedCategories.length + prodIdx;
                  const isSelected = activeIndex === globalIdx;

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleProductClick(prod)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-2xs'
                          : 'hover:bg-white dark:hover:bg-[#18281b] bg-white/70 dark:bg-[#121c13] border border-emerald-100/70 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-9 h-9 rounded-lg object-cover border border-emerald-100 dark:border-emerald-800 shrink-0"
                        />
                        <div className="truncate">
                          <p
                            className={`text-xs font-bold leading-tight truncate ${
                              isSelected ? 'text-white' : 'text-emerald-950 dark:text-emerald-100'
                            }`}
                          >
                            <HighlightText
                              text={prod.name}
                              query={searchQuery}
                              highlightClassName={
                                isSelected
                                  ? 'bg-amber-400 text-emerald-950 font-black px-0.5 rounded-xs'
                                  : 'bg-amber-200 dark:bg-amber-400/40 text-emerald-950 dark:text-amber-200 font-black px-0.5 rounded-xs'
                              }
                            />
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded-xs font-semibold ${
                                isSelected
                                  ? 'bg-emerald-700 text-amber-200'
                                  : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              }`}
                            >
                              <HighlightText text={prod.category} query={searchQuery} />
                            </span>
                            <span className={isSelected ? 'text-emerald-200' : 'text-stone-500 dark:text-stone-400'}>
                              {prod.unit}
                            </span>
                            {prod.stock > 0 && prod.stock <= 5 && (
                              <span className="px-1.5 py-0.2 rounded-xs font-bold bg-amber-500 text-amber-950 text-[9px] uppercase tracking-tight">
                                Low Stock: {prod.stock} left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span
                          className={`text-xs font-black ${
                            isSelected ? 'text-amber-300' : 'text-emerald-950 dark:text-emerald-100'
                          }`}
                        >
                          {formatCurrency(prod.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Bottom Action Banner */}
          <div className="p-2.5 bg-emerald-50/60 dark:bg-[#0d160f] flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                {cleanQuery ? (
                  <>
                    Press <strong className="font-semibold text-emerald-950 dark:text-emerald-100">Enter</strong> to search
                  </>
                ) : (
                  'Type to search products & categories'
                )}
              </span>
            </div>

            {cleanQuery && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 transition-colors cursor-pointer"
              >
                <span>View Full Results</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
