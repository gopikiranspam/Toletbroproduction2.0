import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { BHKType, PropertyType } from '../types';

export type SortOption = 'recommended' | 'price-low-high' | 'price-high-low' | 'distance';

export interface FilterState {
  rentRange: [number, number];
  distanceRange: number;
  bhkTypes: BHKType[];
  propertyTypes: (PropertyType | 'All')[];
  locality: string;
  sortBy: SortOption;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
  showDistance?: boolean;
}

const BHK_OPTIONS: BHKType[] = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
const PROPERTY_TYPES: (PropertyType | 'All')[] = ['All', 'Independent House', 'Apartment', 'Standalone Building', 'Hostel', 'Commercial'];

export const FilterModal: React.FC<FilterModalProps> = ({ 
  isOpen, 
  onClose, 
  onApply, 
  initialFilters,
  showDistance = true
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleReset = () => {
    setFilters({
      rentRange: [0, 1000000],
      distanceRange: 50,
      bhkTypes: [],
      propertyTypes: ['All'],
      locality: '',
      sortBy: 'recommended'
    });
  };

  const toggleBHK = (type: BHKType) => {
    setFilters(prev => ({
      ...prev,
      bhkTypes: prev.bhkTypes.includes(type)
        ? prev.bhkTypes.filter(t => t !== type)
        : [...prev.bhkTypes, type]
    }));
  };

  const togglePropertyType = (type: PropertyType | 'All') => {
    setFilters(prev => {
      if (type === 'All') return { ...prev, propertyTypes: ['All'] };
      
      const newTypes = prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes.filter(t => t !== 'All'), type];
      
      return { ...prev, propertyTypes: newTypes.length === 0 ? ['All'] : newTypes };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex h-[90vh] w-full flex-col overflow-hidden rounded-t-[2.5rem] bg-[var(--bg)] shadow-2xl sm:h-auto sm:max-w-xl sm:rounded-[2.5rem]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose}
                  className="rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-white/5"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Filters</h2>
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand transition-colors hover:opacity-80"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="space-y-8">
                {/* Sort By */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Sort By</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'recommended', label: 'Recommended' },
                      { id: 'price-low-high', label: 'Price: Low to High' },
                      { id: 'price-high-low', label: 'Price: High to Low' },
                      { id: 'distance', label: 'Distance' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setFilters(prev => ({ ...prev, sortBy: option.id as SortOption }))}
                        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                          filters.sortBy === option.id
                            ? 'border-brand bg-brand/5 text-brand'
                            : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="text-xs font-bold">{option.label}</span>
                        {filters.sortBy === option.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rent Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Rent Range (Monthly)</label>
                    <span className="text-xs font-bold text-brand">₹{filters.rentRange[0].toLocaleString()} - ₹{filters.rentRange[1].toLocaleString()}</span>
                  </div>
                  <div className="space-y-6 px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="200000" 
                      step="5000"
                      value={filters.rentRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, rentRange: [prev.rentRange[0], parseInt(e.target.value)] }))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--border)] accent-brand"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>₹0</span>
                      <span>₹200,000+</span>
                    </div>
                  </div>
                </div>

                {/* Distance Range */}
                {showDistance && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Distance Radius</label>
                      <span className="text-xs font-bold text-brand">{filters.distanceRange} km</span>
                    </div>
                    <div className="space-y-6 px-2">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        step="1"
                        value={filters.distanceRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, distanceRange: parseInt(e.target.value) }))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--border)] accent-brand"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                        <span>1 km</span>
                        <span>100 km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* BHK Type */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">BHK Type</label>
                  <div className="flex flex-wrap gap-2">
                    {BHK_OPTIONS.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleBHK(type)}
                        className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                          filters.bhkTypes.includes(type)
                            ? 'border-brand bg-brand text-black'
                            : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Property Type</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => togglePropertyType(type)}
                        className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                          filters.propertyTypes.includes(type)
                            ? 'border-brand bg-brand text-black'
                            : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Locality */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Locality / Area</label>
                  <input 
                    type="text"
                    value={filters.locality}
                    onChange={(e) => setFilters(prev => ({ ...prev, locality: e.target.value }))}
                    placeholder="Search locality..."
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border)] p-6">
              <button 
                onClick={() => onApply(filters)}
                className="w-full rounded-2xl bg-brand py-4 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-transform active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
