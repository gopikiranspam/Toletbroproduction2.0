import React, { useState } from 'react';
import { Search, MapPin, QrCode, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface SearchSectionProps {
  onNearbySearch: (radius?: number) => void;
  isNearbyLoading: boolean;
}

const HYDERABAD_LOCALITIES = [
  'Gachibowli', 'Madhapur', 'Jubilee Hills', 'Banjara Hills', 
  'Kondapur', 'Kukatpally', 'Miyapur', 'Manikonda', 
  'Hitech City', 'Tellapur', 'Nallagandla', 'Kokapet',
  'Secunderabad', 'Uppal', 'LB Nagar', 'Ameerpet'
];

export const SearchSection: React.FC<SearchSectionProps> = ({ onNearbySearch, isNearbyLoading }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'Rent' | 'Buy'>('Rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState('');
  const [radius, setRadius] = useState('5');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/Hyderabad/${searchQuery.trim()}`);
    } else if (selectedLocality) {
      navigate(`/search/Hyderabad/${selectedLocality}`);
    }
  };

  return (
    <section className="relative -mt-12 z-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl md:p-6">
          {/* Mode Toggle */}
          <div className="mb-6 flex justify-center">
            <div className="flex rounded-2xl bg-[var(--bg)] p-1">
              {['Rent', 'Buy'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m as any)}
                  className={`rounded-xl px-8 py-2 text-xs font-bold transition-all ${
                    mode === m 
                      ? 'bg-brand text-black shadow-lg' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by area, landmark or project..."
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNearbySearch(Number(radius))}
                  disabled={isNearbyLoading}
                  className="flex flex-1 md:flex-none h-12 md:h-12 flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-2xl bg-brand/10 px-2 md:px-4 text-[10px] md:text-xs font-bold text-brand transition-all hover:bg-brand/20 disabled:opacity-50"
                >
                  {isNearbyLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  ) : (
                    <MapPin size={16} />
                  )}
                  <span className="md:inline">Nearby</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="flex flex-1 md:flex-none h-12 md:h-12 flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-2xl bg-[var(--bg)] px-2 md:px-4 text-[10px] md:text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--border)]"
                >
                  <QrCode size={16} />
                  <span className="md:inline">Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex flex-1 md:flex-none h-12 md:h-12 flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-2xl px-2 md:px-4 text-[10px] md:text-xs font-bold transition-all ${
                    showFilters 
                      ? 'bg-brand text-black' 
                      : 'bg-[var(--bg)] text-[var(--text-primary)] hover:bg-[var(--border)]'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  <span className="md:inline">Filter</span>
                </button>
              </div>

              <button
                type="submit"
                className="flex h-12 w-full md:w-auto items-center justify-center rounded-2xl bg-brand px-8 text-xs font-bold text-black shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </form>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 grid grid-cols-1 gap-6 border-t border-[var(--border)] pt-6 md:grid-cols-3">
                  {/* Locality Dropdown */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      Hyderabad Localities
                    </label>
                    <div className="relative">
                      <select
                        value={selectedLocality}
                        onChange={(e) => setSelectedLocality(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs font-bold outline-none focus:border-brand/50"
                      >
                        <option value="">Select Locality</option>
                        {HYDERABAD_LOCALITIES.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
                    </div>
                  </div>

                  {/* Radius Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Search Radius
                      </label>
                      <span className="text-xs font-bold text-brand">{radius} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--bg)] accent-brand"
                    />
                  </div>

                  {/* Property Type */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      Property Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Apartment', 'Villa', 'Office', 'Plot'].map(type => (
                        <button
                          key={type}
                          type="button"
                          className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-secondary)] transition-all hover:border-brand/50 hover:text-brand"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
