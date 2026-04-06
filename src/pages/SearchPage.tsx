import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Property } from '../types';
import { SEO } from '../components/SEO';
import { PropertyCard } from '../components/PropertyCard';
import { FilterBar } from '../components/FilterBar';
import { FilterModal, FilterState } from '../components/FilterModal';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { city, area } = useParams<{ city: string; area?: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    rentRange: [0, 200000],
    distanceRange: 50,
    bhkTypes: [],
    propertyTypes: ['All'],
    locality: '',
    sortBy: 'recommended'
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (city) {
      api.getPropertiesByLocation(city, area).then(data => {
        setProperties(data);
        setLoading(false);
        
        // If only one property found, redirect to details
        if (data.length === 1) {
          const p = data[0];
          const slug = p.slug || p.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          navigate(`/property/${slug}-${p.id}`, { replace: true });
        }
      });
    }
  }, [city, area, navigate]);

  const filteredProperties = properties.filter(p => {
    const matchesType = selectedType === 'All' ? true : p.type === selectedType;
    
    const rent = p.rent || 0;
    const matchesRent = rent >= filters.rentRange[0] && rent <= filters.rentRange[1];
    const matchesBHK = filters.bhkTypes.length === 0 || filters.bhkTypes.includes(p.bhkType as any);
    const matchesPropertyType = filters.propertyTypes.includes('All') || filters.propertyTypes.includes(p.type as any);
    const matchesLocality = !filters.locality || 
      p.area.toLowerCase().includes(filters.locality.toLowerCase()) ||
      p.city.toLowerCase().includes(filters.locality.toLowerCase());

    return matchesType && matchesRent && matchesBHK && matchesPropertyType && matchesLocality;
  });

  // Apply Sorting
  if (filters.sortBy !== 'recommended') {
    filteredProperties.sort((a, b) => {
      if (filters.sortBy === 'price-low-high') return (a.rent || 0) - (b.rent || 0);
      if (filters.sortBy === 'price-high-low') return (b.rent || 0) - (a.rent || 0);
      if (filters.sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
      return 0;
    });
  }

  if (loading || (properties.length === 1)) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-[var(--text-primary)] bg-[var(--bg)]">
      <Loader2 className="h-12 w-12 animate-spin text-brand" />
      <p className="text-[var(--text-secondary)]/50">{properties.length === 1 ? 'Redirecting to property...' : 'Searching properties...'}</p>
    </div>
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Properties in ${area ? `${area}, ` : ''}${city}`,
    "description": `Find the best properties for rent in ${area ? `${area}, ` : ''}${city}. Browse ${filteredProperties.length} listings on TOLETBRO.`,
    "itemListElement": filteredProperties.map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${window.location.origin}/property/${p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.id}`
    }))
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <SEO 
        title={`Flats for Rent in ${area ? `${area}, ` : ''}${city} | No Brokerage`}
        description={`Find the best ${area ? `${area}` : city} properties for rent. Browse ${filteredProperties.length} verified listings on TOLETBRO. Smart Tolet Boards for direct owner contact.`}
        schema={structuredData}
      />
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-brand">
            <MapPin size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Search Results</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">
            Properties in {area ? `${area}, ` : ''}{city}
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">Found {filteredProperties.length} properties matching your search.</p>
        </div>
        
        <button 
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black"
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="mb-12">
        <FilterBar selectedType={selectedType} onSelectType={setSelectedType} />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-xl text-[var(--text-secondary)]/40">No properties found matching your filters.</p>
          <button 
            onClick={() => {
              setSelectedType('All');
              setFilters({
                rentRange: [0, 200000],
                distanceRange: 50,
                bhkTypes: [],
                propertyTypes: ['All'],
                locality: '',
                sortBy: 'recommended'
              });
            }}
            className="mt-4 text-brand hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setIsFilterModalOpen(false);
        }}
        initialFilters={filters}
        showDistance={false}
      />
    </div>
  );
};
