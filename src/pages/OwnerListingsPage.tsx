import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Property, Owner } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';

export const OwnerListingsPage: React.FC = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ownerId) {
      const fetchData = async () => {
        console.log('Fetching listings for owner:', ownerId);
        try {
          const ownerData = await api.getOwnerById(ownerId);
          const propertyData = await api.getPropertiesByOwnerId(ownerId);
          
          console.log('Owner Data:', ownerData);
          console.log('Properties Data:', propertyData.length);

          if (ownerData) {
            setOwner(ownerData);
            setProperties(propertyData);
            
            // Rule: If only one property exists, automatically redirect to the property page
            if (propertyData.length === 1) {
              const p = propertyData[0];
              const slug = p.slug || p.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
              
              const source = searchParams.get('source');
              const internal = searchParams.get('internal');
              let query = '';
              if (source) query += `?source=${source}`;
              if (internal) query += `${query ? '&' : '?'}internal=${internal}`;
              
              navigate(`/property/${slug}-${p.id}${query}`);
            }
          }
        } catch (error) {
          console.error('Error fetching owner listings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [ownerId, navigate, searchParams]);

  if (loading || (properties.length === 1 && owner)) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)]">
      <Loader2 className="h-12 w-12 animate-spin text-brand" />
      <p className="text-[var(--text-secondary)]/50">{properties.length === 1 ? 'Redirecting to property...' : 'Loading owner profile...'}</p>
    </div>
  );
  
  if (!owner) return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-6 text-center bg-[var(--bg)]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Owner Profile Not Found</h2>
      <p className="max-w-xs text-[var(--text-secondary)]/50">
        We couldn't find the profile for this property owner. They might have deactivated their account.
      </p>
      <button 
        onClick={() => navigate('/')}
        className="rounded-2xl bg-brand px-8 py-3 font-bold text-black transition-transform hover:scale-105"
      >
        Go Back Home
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-16 rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-8 md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">{owner.name}</h1>
            <p className="text-lg text-[var(--text-secondary)]/50">Verified Property Owner</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 py-3 text-sm font-medium text-[var(--text-primary)]">
              <Phone size={18} className="text-brand" />
              <span>{owner.phone}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 py-3 text-sm font-medium text-[var(--text-primary)]">
              <Mail size={18} className="text-brand" />
              <span>{owner.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Available Properties ({properties.length})</h2>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--card-bg)] text-[var(--text-secondary)]/20">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">No Active Listings</h3>
          <p className="mt-2 max-w-xs text-[var(--text-secondary)]/40">
            This owner hasn't posted any properties yet or their listings are currently inactive.
          </p>
        </div>
      )}
    </div>
  );
};
