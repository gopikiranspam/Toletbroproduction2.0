import React, { useState, useEffect, useMemo } from 'react';
import { Bed, Bath, Maximize, MapPin, Heart, BellOff, Eye, QrCode } from 'lucide-react';
import { Property, PrivacySettings } from '../types';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { isDNDActive } from '../utils/privacy';
import { useLocation } from '../hooks/useLocation';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, openAuth, toggleFavorite } = useAuth();
  const [privacy, setPrivacy] = useState<PrivacySettings | undefined>();
  const isFavorite = user?.favorites?.includes(property.id) || false;
  const userLocation = useLocation();

  useEffect(() => {
    api.getOwnerById(property.ownerId).then(owner => {
      if (owner?.privacy) setPrivacy(owner.privacy);
    });
  }, [property.ownerId]);

  const dndActive = isDNDActive(privacy);

  const distance = useMemo(() => {
    if (!userLocation.lat || !userLocation.lng || !property.lat || !property.lng) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (property.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (property.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(property.lat * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
  }, [userLocation, property.lat, property.lng]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuth();
      return;
    }

    await toggleFavorite(property.id);
  };

  const handleClick = () => {
    const slug = property.slug || property.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const source = searchParams.get('source');
    const internal = searchParams.get('internal');
    let query = '';
    if (source) query += `?source=${source}`;
    if (internal) query += `${query ? '&' : '?'}internal=${internal}`;
    
    navigate(`/property/${slug}-${property.id}${query}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] transition-all hover:shadow-xl hover:shadow-brand/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={property.imageUrl || null} 
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="rounded-lg bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-wider">
            {property.preferredTenant || 'Anyone'}
          </span>
          {property.isFeatured && (
            <span className="rounded-lg bg-brand px-2 py-1 text-[10px] font-bold text-black uppercase tracking-wider">
              Featured
            </span>
          )}
          {dndActive && (
            <span className="flex items-center gap-1 rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg shadow-red-500/20">
              <BellOff size={10} />
              DND
            </span>
          )}
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col items-center gap-1">
          <button 
            onClick={handleToggleFavorite}
            className={`rounded-full bg-black/40 p-1.5 backdrop-blur-md transition-colors hover:text-brand ${isFavorite ? 'text-brand' : 'text-white'}`}
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <span className="text-[10px] font-bold text-white drop-shadow-md">
            {property.favoritesCount || 0}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 flex gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            <Eye size={10} />
            {property.views || 0}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            <QrCode size={10} />
            {(property.scans || 0) + (property.internalScans || 0)}
          </div>
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-black shadow-lg">
            ₹{(property.price || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-sm font-bold tracking-tight text-[var(--text-primary)] line-clamp-1 group-hover:text-brand transition-colors">
          {property.bhkType} {property.type}
        </h3>
        
        <div className="mb-3 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-secondary)]">
            <MapPin size={10} className="text-brand" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)]">
            <Bed size={12} className="text-brand" />
            <span>{property.beds || 0} BHK</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)]">
            <Maximize size={12} className="text-brand" />
            <span>{property.sqft || 0} ft²</span>
          </div>
          
          {property.lat && property.lng && (
            <div className="ml-auto flex items-center gap-2">
              {distance && (
                <span className="text-[9px] font-bold text-brand uppercase tracking-wider">
                  {distance} km
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

