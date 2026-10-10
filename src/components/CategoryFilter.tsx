import React from 'react';
import {
  Sprout,
  Droplet,
  ShieldAlert,
  Wrench,
  Leaf,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../i18n/translations';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  inStockOnly: boolean;
  onToggleInStockOnly: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: string; key: TranslationKey; icon: React.FC<{ className?: string }> }[] = [
  { id: 'All', key: 'allSupplies', icon: Layers },
  { id: 'Seeds', key: 'seeds', icon: Sprout },
  { id: 'Fertilizers', key: 'fertilizers', icon: Droplet },
  { id: 'Pesticides', key: 'pesticides', icon: ShieldAlert },
  { id: 'Farm Tools', key: 'farmTools', icon: Wrench },
  { id: 'Organic Nutrients', key: 'organicNutrients', icon: Leaf },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  inStockOnly,
  onToggleInStockOnly,
  sortBy,
  onSortChange,
  categoryCounts,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#0e170f] border-y border-emerald-100/80 dark:border-emerald-900/60 py-4 px-4 sm:px-6 lg:px-8 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Category Pills Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;

              return (
                <button
                  key={cat.id}
                  id={`category-filter-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs scale-100 ring-2 ring-emerald-700/20 dark:ring-emerald-500/30'
                      : 'bg-emerald-50/70 dark:bg-[#162318] hover:bg-emerald-100/80 dark:hover:bg-[#1f3223] text-emerald-900 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-200 dark:text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`} />
                  <span>{t(cat.key)}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-emerald-900/60 dark:bg-emerald-950/80 text-emerald-200'
                        : 'bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: In-Stock Toggle & Sort */}
          <div className="flex items-center gap-3 text-xs sm:text-sm ml-auto">
            {/* In-Stock Only Toggle */}
            <button
              id="filter-instock-toggle"
              onClick={onToggleInStockOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                inStockOnly
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white dark:bg-[#162318] text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-[#1f3223]'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-emerald-200' : 'text-emerald-500 dark:text-emerald-400'}`} />
              <span className="font-medium">{t('inStockOnly')}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-emerald-50/70 dark:bg-[#162318] border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1.5 text-emerald-900 dark:text-emerald-200">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <label htmlFor="sort-select" className="sr-only">{t('sortBy')}</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label={t('sortBy')}
                className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer dark:text-emerald-200 [&>option]:bg-white [&>option]:text-stone-900 dark:[&>option]:bg-[#162318] dark:[&>option]:text-emerald-200"
              >
                <option value="featured">{t('featured')}</option>
                <option value="price-asc">{t('priceLowHigh')}</option>
                <option value="price-desc">{t('priceHighLow')}</option>
                <option value="rating">{t('highestRated')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
