import React from 'react';
import { QrCode, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] pt-20 pb-10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-black">
                <QrCode size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">TOLETBRO</span>
            </div>
            <p className="mb-6 text-sm text-[var(--text-secondary)] leading-relaxed">
              Find houses for rent near you without broker. We invented smart tolet boards, Just Scan QR to view all nearby To-Let properties instantly.
            </p>
            <div className="flex gap-4">
              {/* Social media links removed as per request */}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]/70">Popular Locations</h4>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
              <li><Link to="/search/hyderabad/madhapur" className="transition-colors hover:text-brand">Rent in Madhapur</Link></li>
              <li><Link to="/search/hyderabad/gachibowli" className="transition-colors hover:text-brand">Rent in Gachibowli</Link></li>
              <li><Link to="/search/hyderabad/kondapur" className="transition-colors hover:text-brand">Rent in Kondapur</Link></li>
              <li><Link to="/search/hyderabad/kukatpally" className="transition-colors hover:text-brand">Rent in Kukatpally</Link></li>
              <li><Link to="/search/hyderabad/banjara-hills" className="transition-colors hover:text-brand">Rent in Banjara Hills</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]/70">Company</h4>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
              <li><Link to="/about-us" className="transition-colors hover:text-brand">About Us</Link></li>
              <li><Link to="/about-us" className="transition-colors hover:text-brand">Our Team</Link></li>
              <li><Link to="/about-us" className="transition-colors hover:text-brand">Careers</Link></li>
              <li><Link to="/about-us#contact" className="transition-colors hover:text-brand">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]/70">Support</h4>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
              <li><Link to="/about-us" className="transition-colors hover:text-brand">About Us</Link></li>
              <li><Link to="/terms-of-service" className="transition-colors hover:text-brand">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="transition-colors hover:text-brand">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="transition-colors hover:text-brand">Return & Refund</Link></li>
              <li><Link to="/cancellation-policy" className="transition-colors hover:text-brand">Cancellation Policy</Link></li>
              <li><Link to="/shipping-policy" className="transition-colors hover:text-brand">Shipping Policy</Link></li>
              <li><Link to="/admin/qr" className="transition-colors hover:text-brand">Admin Panel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]/70">Testimonials</h4>
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
                <p className="text-xs italic text-[var(--text-secondary)]">"Found my dream villa in Malibu within a week. Exceptional service!"</p>
                <p className="mt-2 text-[10px] font-bold text-brand">- Sarah J.</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
                <p className="text-xs italic text-[var(--text-secondary)]">"The Smart Tolet Board made listing my apartment so much easier."</p>
                <p className="mt-2 text-[10px] font-bold text-brand">- Michael R.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-[var(--border)] pt-10 text-center text-xs text-[var(--text-secondary)]/70">
          <p className="mb-4">© 2026 TOLETBRO. All rights reserved.</p>
          <div className="space-y-2">
            <p><strong>Legal Name:</strong> ToletBro Technologies</p>
            <p><strong>Trade Name:</strong> TOLETBRO</p>
            <p><strong>Registered Address:</strong> Plot No.34, Central Bank Colony, LB Nagar, Hyderabad, Telangana, Pin code : 500074.</p>
            <p><strong>Email:</strong> support@toletbro.com</p>
            <p><strong>Phone:</strong> +91 8500482405</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
