import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Loader2, Home, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Property } from '../types';
import { SEO } from '../components/SEO';
import { PropertyCard } from '../components/PropertyCard';

export const FavoritesPage: React.FC = () => {
  const { user, loading: authLoading, openAuth } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuth();
    }
  }, [user, authLoading, openAuth]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.favorites || user.favorites.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const favoriteProperties = await Promise.all(
          user.favorites.map(id => api.getPropertyById(id))
        );
        setFavorites(favoriteProperties.filter((p): p is Property => p !== undefined));
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadFavorites();
    }
  }, [user]);

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Loader2 size={48} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Heart size={48} />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">Your Favorites</h2>
        <p className="mt-4 max-w-md text-lg text-[var(--text-secondary)]">
          Login to see your saved properties and keep track of your dream homes.
        </p>
        <button 
          onClick={() => openAuth()}
          className="mt-10 rounded-2xl bg-brand px-10 py-4 font-bold text-black transition-transform hover:scale-105 active:scale-95"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-32 pt-24 px-6">
      <SEO 
        title="My Favorites"
        description="View and manage your favorite properties on TOLETBRO."
      />
      <div className="mx-auto max-w-7xl space-y-12">
        <header>
          <div className="flex items-center gap-2 text-brand mb-2">
            <Heart size={20} fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-widest">Saved Masterpieces</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
            My <span className="text-brand">Favorites</span>
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved for later.
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[var(--border)] py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-secondary)]">
              <Home size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">No favorites yet</h3>
            <p className="mt-2 text-[var(--text-secondary)]">Start exploring and save properties you love!</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 flex items-center gap-2 rounded-2xl bg-brand px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              Explore Properties
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {favorites.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
