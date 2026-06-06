'use client';

import * as React from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface Destination {
  id: number;
  name: string;
  city: string;
  thumbnail?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
}

interface DestinationSelectProps {
  label: string;
  placeholder: string;
  destinations: Destination[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  disabledId?: number | null;
  tone?: 'orange' | 'blue';
}

function resolveImageUrl(destination: Partial<Destination>) {
  const rawUrl = destination.thumbnailUrl || destination.thumbnail_url || destination.thumbnail || destination.imageUrl || destination.image_url;
  return rawUrl ? getImageUrl(rawUrl) : '/images/auth-bg.jpg';
}

export default function DestinationSelect({
  label,
  placeholder,
  destinations,
  selectedId,
  onSelect,
  disabledId,
  tone = 'orange',
}: DestinationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const reactId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedDest = destinations.find((destination) => destination.id === selectedId);
  const accent = tone === 'orange'
    ? {
        label: 'text-primary',
        ring: 'focus:ring-primary/15',
        border: 'border-orange-200',
        active: 'border-primary ring-4 ring-primary/15',
        bg: 'bg-orange-50',
        text: 'text-primary',
      }
    : {
        label: 'text-ai',
        ring: 'focus:ring-sky-100',
        border: 'border-sky-200',
        active: 'border-ai ring-4 ring-sky-100',
        bg: 'bg-sky-50',
        text: 'text-ai',
      };

  const filteredDestinations = destinations.filter((destination) => {
    if (destination.id === disabledId) return false;
    if (!search) return true;
    const normalizedSearch = search.toLowerCase();
    return destination.name.toLowerCase().includes(normalizedSearch) || destination.city.toLowerCase().includes(normalizedSearch);
  });

  const listboxId = `${reactId}-destination-listbox`;
  const activeOptionId = highlightedIndex >= 0 && filteredDestinations[highlightedIndex]
    ? `${listboxId}-option-${filteredDestinations[highlightedIndex].id}`
    : undefined;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback((destId: number) => {
    onSelect(destId);
    setIsOpen(false);
    setSearch('');
  }, [onSelect]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) => (filteredDestinations.length ? (prev < filteredDestinations.length - 1 ? prev + 1 : 0) : -1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) => (filteredDestinations.length ? (prev > 0 ? prev - 1 : filteredDestinations.length - 1) : -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredDestinations.length) {
          handleSelect(filteredDestinations[highlightedIndex].id);
        }
        break;
      default:
        break;
    }
  }, [filteredDestinations, handleSelect, highlightedIndex, isOpen]);

  return (
    <div className="relative min-w-0 w-full" ref={wrapperRef} onKeyDown={handleKeyDown}>
      <label className={`mb-2 block text-xs font-black uppercase tracking-[0.16em] ${accent.label}`}>
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        className={`flex min-h-24 w-full min-w-0 items-center justify-between gap-3 overflow-hidden rounded-xl border bg-white p-4 text-left shadow-sm transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:shadow-md focus:outline-none ${accent.ring} ${
          isOpen ? accent.active : accent.border
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selectedDest ? (
            <>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={resolveImageUrl(selectedDest)}
                  alt={selectedDest.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black text-slate-950 md:text-lg">{selectedDest.name}</p>
                <p className="mt-1 flex min-w-0 items-center text-sm font-bold text-slate-500">
                  <MapPin className="mr-1 h-4 w-4 shrink-0" />
                  <span className="truncate">{selectedDest.city}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="flex min-h-16 items-center">
              <span className="text-base font-bold text-slate-400">{placeholder}</span>
            </div>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-3 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className={`border-b border-slate-100 p-3 ${accent.bg}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari nama destinasi atau kota..."
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition-[color,background-color,border-color,box-shadow,transform,opacity] placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setHighlightedIndex(-1);
                }}
                onClick={(event) => event.stopPropagation()}
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
              />
            </div>
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            ref={listRef}
            className="max-h-72 overflow-y-auto p-2"
          >
            {filteredDestinations.length === 0 ? (
              <li className="p-5 text-center text-sm font-bold text-slate-500">
                Pencarian tidak ditemukan
              </li>
            ) : (
              filteredDestinations.map((destination, index) => {
                const isSelected = selectedId === destination.id;
                const isHighlighted = highlightedIndex === index;
                return (
                  <li key={destination.id}>
                    <button
                      id={`${listboxId}-option-${destination.id}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected ? 'true' : 'false'}
                      onClick={() => handleSelect(destination.id)}
                      className={`mb-1 flex min-h-14 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isHighlighted
                          ? `${accent.bg} ${accent.text}`
                          : isSelected
                            ? `${accent.bg} ${accent.text}`
                            : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <Image
                            src={resolveImageUrl(destination)}
                            alt={destination.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-black ${isSelected || isHighlighted ? accent.text : 'text-slate-950'}`}>
                            {destination.name}
                          </p>
                          <p className="text-xs font-bold text-slate-500">{destination.city}</p>
                        </div>
                      </div>
                      {isSelected && <Check className={`h-4 w-4 shrink-0 ${accent.text}`} />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}


