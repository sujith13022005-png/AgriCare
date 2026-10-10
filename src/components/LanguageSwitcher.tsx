import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'compact' | 'pill';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'navbar' }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { id: Language; label: string; nativeLabel: string; flag: string }[] = [
    { id: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
    { id: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
  ];

  if (variant === 'pill') {
    return (
      <div className="inline-flex p-1 rounded-xl bg-emerald-100/70 dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800">
        {languages.map((lang) => {
          const isActive = language === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-[#1d3320]'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="language-switcher-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white/80 dark:bg-[#152317]/80 hover:bg-emerald-50 dark:hover:bg-[#1d3320] text-emerald-950 dark:text-emerald-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
        title={t('selectLanguage')}
        aria-label="Change language between English and Tamil"
      >
        <Languages className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        <span className="hidden sm:inline">
          {language === 'ta' ? 'தமிழ் (TA)' : 'English (EN)'}
        </span>
        <span className="sm:hidden font-mono text-[11px]">
          {language.toUpperCase()}
        </span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#121d14] border border-emerald-100 dark:border-emerald-800/80 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-emerald-50 dark:border-emerald-900/40 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {t('selectLanguage')}
          </div>
          {languages.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                id={`lang-option-${lang.id}`}
                onClick={() => {
                  setLanguage(lang.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-100 font-bold'
                    : 'text-emerald-950 dark:text-emerald-200 hover:bg-emerald-50/60 dark:hover:bg-[#1a2d1d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div>
                    <p className="leading-tight">{lang.nativeLabel}</p>
                    <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-normal">
                      {lang.label}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
