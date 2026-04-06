import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, MapPin, DollarSign, Bed, Bath, Maximize, FileText, Image as ImageIcon } from 'lucide-react';

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const ListPropertyModal: React.FC<ListPropertyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Apartment',
    category: 'Rent',
    price: '',
    location: '',
    beds: '',
    baths: '',
    sqft: '',
    description: '',
    imageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-[var(--card-bg)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">List My Property</h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-[var(--bg)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Property Title</label>
                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="e.g. Modern 2BHK in Kukatpally"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Type</label>
                      <select
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm focus:border-brand focus:outline-none"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option>Apartment</option>
                        <option>Villa</option>
                        <option>Penthouse</option>
                        <option>House</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Category</label>
                      <select
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm focus:border-brand focus:outline-none"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option>Rent</option>
                        <option>Buy</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Price and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                      <input
                        required
                        type="number"
                        placeholder="Amount"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="City, Area"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Beds</label>
                    <div className="relative">
                      <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                      <input
                        required
                        type="number"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                        value={formData.beds}
                        onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Baths</label>
                    <div className="relative">
                      <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                      <input
                        required
                        type="number"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                        value={formData.baths}
                        onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Sqft</label>
                    <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                      <input
                        required
                        type="number"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                        value={formData.sqft}
                        onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-[var(--text-secondary)]" size={18} />
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us about the property..."
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                      required
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 w-full rounded-2xl bg-brand py-4 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Post Property
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
