import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Check } from 'lucide-react';
import { MEDICAL_SPECIALTIES, MedicalSpecialty } from '../data/medicalSpecialties';

interface SpecialtySelectProps {
  value: string; // The ID of the specialty (or legacy string)
  onChange: (specialtyId: string, ar: string, fr: string) => void;
  error?: string;
}

export default function SpecialtySelect({ value, onChange, error }: SpecialtySelectProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Find current specialty by id or legacy string
  const selectedSpecialty = useMemo(() => {
    if (!value) return null;
    return MEDICAL_SPECIALTIES.find(
      s => s.id === value || s.ar === value || s.fr === value
    );
  }, [value]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const filteredSpecialties = useMemo(() => {
    const q = search.toLowerCase();
    return MEDICAL_SPECIALTIES.filter(s => 
      s.ar.toLowerCase().includes(q) || s.fr.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 outline-none transition-colors ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} ${isOpen ? 'ring-2 ring-blue-500 bg-white' : ''}`}
      >
        <span className={selectedSpecialty ? 'text-slate-900' : 'text-slate-400'}>
          {selectedSpecialty 
            ? (isAr ? selectedSpecialty.ar : selectedSpecialty.fr) 
            : (t('select_specialty') || 'Select specialty')
          }
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 px-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_specialty') || 'Search...'}
              className="w-full text-sm outline-none bg-transparent py-1.5"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredSpecialties.length > 0 ? (
              filteredSpecialties.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => {
                    onChange(s.id, s.ar, s.fr);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm flex items-center justify-between hover:bg-slate-50 ${selectedSpecialty?.id === s.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                >
                  <span>{isAr ? s.ar : s.fr}</span>
                  {selectedSpecialty?.id === s.id && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                {t('no_results') || 'No results found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
