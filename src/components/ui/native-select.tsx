'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

export type NativeSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type NativeSelectProps = {
  'aria-label': string;
  className?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  onValueChange: (value: string) => void;
  options: NativeSelectOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  value: string;
  wrapperClassName?: string;
};

export function NativeSelect({
  'aria-label': ariaLabel,
  className,
  disabled,
  leftIcon,
  onValueChange,
  options,
  placeholder = 'Pilih opsi',
  searchable = false,
  searchPlaceholder = 'Cari opsi...',
  value,
  wrapperClassName,
}: NativeSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const reactId = React.useId();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties | null>(null);
  const selectedOption = options.find((option) => option.value === value);
  const listboxId = `${reactId}-listbox`;
  const searchInputId = `${reactId}-search`;
  const filterOptions = React.useCallback((queryValue: string) => {
    const query = queryValue.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      `${option.label} ${option.description || ''}`.toLowerCase().includes(query),
    );
  }, [options]);
  const filteredOptions = React.useMemo(() => filterOptions(searchQuery), [filterOptions, searchQuery]);
  const closeSelect = React.useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        closeSelect();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeSelect]);

  React.useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownStyle({
        left: rect.left,
        top: rect.bottom + 8,
        width: rect.width,
        maxHeight: Math.max(220, window.innerHeight - rect.bottom - 24),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && searchable) {
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = React.useCallback((nextValue: string) => {
    onValueChange(nextValue);
    closeSelect();
  }, [closeSelect, onValueChange]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(Math.max(0, filteredOptions.findIndex((option) => option.value === value)));
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeSelect();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) => (filteredOptions.length ? (prev < filteredOptions.length - 1 ? prev + 1 : 0) : -1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) => (filteredOptions.length ? (prev > 0 ? prev - 1 : filteredOptions.length - 1) : -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      default:
        break;
    }
  }, [closeSelect, disabled, filteredOptions, handleSelect, highlightedIndex, isOpen, value]);

  return (
    <div className={cn('relative', wrapperClassName)} ref={wrapperRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            closeSelect();
            return;
          }
          setIsOpen(true);
          setHighlightedIndex(Math.max(0, filteredOptions.findIndex((option) => option.value === value)));
        }}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        className={cn(
          'flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-left text-sm font-black text-slate-800 shadow-sm shadow-slate-200/30 outline-none transition-all hover:border-orange-200 hover:bg-white focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60',
          leftIcon ? 'pl-4 pr-4' : 'pl-4 pr-4',
          isOpen && 'border-primary bg-white ring-4 ring-primary/10',
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          {leftIcon && <span className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-400">{leftIcon}</span>}
          <span className={cn('truncate', selectedOption ? 'text-slate-800' : 'text-slate-400')}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && dropdownStyle && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="fixed z-[80] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70"
        >
          {searchable && (
            <label htmlFor={searchInputId} className="relative mb-2 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id={searchInputId}
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setSearchQuery(nextQuery);
                  setHighlightedIndex(filterOptions(nextQuery).length ? 0 : -1);
                }}
                placeholder={searchPlaceholder}
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </label>
          )}
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-label={ariaLabel}
            style={{ maxHeight: `calc(${dropdownStyle.maxHeight}px - ${searchable ? 58 : 0}px)` }}
            className="overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm font-bold text-slate-400">
                Tidak ada opsi ditemukan
              </li>
            ) : filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li key={`${option.value || 'empty'}-${index}`}>
                  <button
                    id={`${listboxId}-option-${option.value || 'empty'}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected ? 'true' : 'false'}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'mb-1 flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected || isHighlighted ? 'bg-orange-50 text-primary' : 'text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-black">{option.label}</span>
                      {option.description && <span className="mt-0.5 block truncate text-xs font-bold text-slate-500">{option.description}</span>}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}
