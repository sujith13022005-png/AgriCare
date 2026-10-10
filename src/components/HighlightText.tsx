import React, { memo } from 'react';

interface HighlightTextProps {
  text: string;
  query?: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Escapes special regex characters in a query string.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * HighlightText component highlights matched query terms in text
 * with bolding and high-contrast styling.
 */
export const HighlightText: React.FC<HighlightTextProps> = memo(({
  text,
  query,
  className = '',
  highlightClassName = 'bg-amber-200/90 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-bold px-0.5 rounded-xs',
}) => {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Extract non-empty keywords (split on whitespace) and escape each
  const keywords = query
    .trim()
    .split(/\s+/)
    .filter((k) => k.length > 0)
    .map(escapeRegExp);

  if (keywords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Build regex matching any of the keywords case-insensitively
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches one of the keywords (case-insensitive)
        const isMatch = keywords.some(
          (k) => part.toLowerCase() === k.replace(/\\/g, '').toLowerCase()
        );

        if (isMatch) {
          return (
            <mark key={index} className={highlightClassName}>
              {part}
            </mark>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
});

HighlightText.displayName = 'HighlightText';
