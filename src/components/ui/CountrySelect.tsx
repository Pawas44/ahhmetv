'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { countries } from '@/lib/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CountrySelect({ value, onChange, className = '' }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find((c) => c.code === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input w-full flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <img 
                src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} 
                alt={selectedCountry.name}
                className="w-5 h-auto rounded-sm shadow-sm"
              />
              {selectedCountry.name}
            </>
          ) : (
            <span className="text-muted">Select country</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[#0f0f23] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-white/10">
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1a1a3a] text-sm text-white px-3 py-2 rounded-lg outline-none border border-transparent focus:border-primary/50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                      value === c.code ? 'bg-primary/20 text-white' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <img 
                        src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
                        alt={c.name}
                        className="w-5 h-auto rounded-sm shadow-sm"
                        loading="lazy"
                      />
                      {c.name}
                    </span>
                    {value === c.code && <Check className="w-4 h-4 text-primary-light" />}
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-muted">No countries found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
