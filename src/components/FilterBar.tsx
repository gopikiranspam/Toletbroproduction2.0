import React from 'react';
import { PropertyType } from '../types';

interface FilterBarProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

const TYPES: (PropertyType | 'All')[] = ['All', 'Independent House', 'Apartment', 'Standalone Building', 'Hostel', 'Commercial'];

export const FilterBar: React.FC<FilterBarProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
      {TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all ${
            selectedType === type
              ? 'bg-brand text-black'
              : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:border-brand/50 hover:text-[var(--text-primary)]'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
};
