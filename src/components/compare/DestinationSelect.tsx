'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface Destination {
  id: number;
  name: string;
  city: string;
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
}

export default function DestinationSelect({
  label,
  placeholder,
  destinations,
  selectedId,
  onSelect,
  disabledId
}: DestinationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const selectedDest = destinations.find(d => d.id === selectedId);

  const filteredDestinations = destinations.filter(d => {
    if (d.id === disabledId) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return d.name.toLowerCase().includes(s) || d.city.toLowerCase().includes(s);
  });

  const handleSelect = useCallback((destId: number) => {
    onSelect(destId);
    setIsOpen(false);
    setSearch('');
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredDestinations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredDestinations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredDestinations.length) {
          handleSelect(filteredDestinations[highlightedIndex].id);
        }
        break;
    }
  }, [isOpen, filteredDestinations, highlightedIndex, handleSelect]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const listboxId = `destination-listbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="relative w-full" ref={wrapperRef} onKeyDown={handleKeyDown}>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        className={`w-full text-left px-4 py-4 rounded-2xl border ${isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-slate-200'} bg-white shadow-sm flex items-center justify-between transition-all group hover:border-slate-300`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedDest ? (
            <>
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                <Image 
                  src={getImageUrl(selectedDest.thumbnailUrl || selectedDest.thumbnail_url)} 
                  alt={selectedDest.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate text-base">{selectedDest.name}</p>
                <p className="text-xs text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> {selectedDest.city}
                </p>
              </div>
            </>
          ) : (
            <span className="text-slate-400 font-medium text-base py-2">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari nama destinasi atau kota..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setHighlightedIndex(-1); }}
                onClick={(e) => e.stopPropagation()}
                aria-controls={listboxId}
                aria-autocomplete="list"
              />
            </div>
          </div>
          
          <ul 
            id={listboxId}
            role="listbox"
            aria-label={label}
            ref={listRef}
            className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200"
          >
            {filteredDestinations.length === 0 ? (
              <li className="p-4 text-center text-sm text-slate-500 font-medium">
                Pencarian tidak ditemukan
              </li>
            ) : (
              filteredDestinations.map((dest, index) => (
                <li key={dest.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedId === dest.id}
                    onClick={() => handleSelect(dest.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between mb-1 transition-colors ${
                      highlightedIndex === index 
                        ? 'bg-primary/10' 
                        : selectedId === dest.id 
                          ? 'bg-primary/5' 
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                        <Image 
                          src={getImageUrl(dest.thumbnailUrl || dest.thumbnail_url)} 
                          alt={dest.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <p className={`text-sm font-bold truncate ${selectedId === dest.id ? 'text-primary' : 'text-slate-900'}`}>
                          {dest.name}
                        </p>
                        <p className="text-xs text-slate-500">{dest.city}</p>
                      </div>
                    </div>
                    {selectedId === dest.id && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
