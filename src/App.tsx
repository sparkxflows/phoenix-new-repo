/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { LeftBookingLauncher } from './components/LeftBookingLauncher';
import { ModernCtaEffects } from './components/ModernCtaEffects';
import { BookAppointmentModal, BookingCategory } from './components/BookAppointmentModal';
import { AuthModal } from './components/AuthModal';
import { GiftRewardModal } from './components/GiftRewardModal';
import { OPEN_AUTH_MODAL_EVENT, OpenAuthModalDetail, triggerAuthModal } from './lib/memberAuth';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Artists } from './pages/Artists';
import { ArtistDetail } from './pages/ArtistDetail';
import { Experience } from './pages/Experience';
import { Gallery } from './pages/Gallery';
import { Contact } from './pages/Contact';
import { Reviews } from './pages/Reviews';
import { AdminPanel } from './pages/AdminPanel';

const getAppBasename = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('/phoenix_tattoz_github')) return '/phoenix_tattoz_github';
    if (path.includes('/phoenix-tattoz-github')) return '/phoenix-tattoz-github';
  }
  return '';
};

// Scroll to top automatically on route changes, or scroll to hash anchor if provided
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const elementId = hash.replace('#', '');
      setTimeout(() => {
        const elem = document.getElementById(elementId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

interface MainLayoutProps {
  onOpenBooking: (artistId?: string, serviceId?: string, categoryId?: BookingCategory) => void;
  onOpenRewards: (tab?: 'birthday' | 'referral') => void;
}

// Main App Layout Wrapper to selectively render public header/footer/mobile bar
function MainLayout({ onOpenBooking, onOpenRewards }: MainLayoutProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] text-zinc-100 font-sans selection:bg-[#FFD60A] selection:text-black">
      {/* Adds the unified CTA hover glow/shine to every button and CTA link */}
      <ModernCtaEffects />

      {/* Show public Navbar only when not in admin dashboard */}
      {!isAdminRoute && (
        <Navbar 
          onOpenBooking={onOpenBooking} 
          onOpenRewards={onOpenRewards} 
        />
      )}

      {/* Dynamic Route Pages */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onOpenBooking={onOpenBooking} />} />
          <Route path="/about" element={<About onOpenBooking={onOpenBooking} />} />
          <Route path="/artists" element={<Artists onOpenBooking={onOpenBooking} />} />
          <Route path="/artists/rohit-sharma" element={<ArtistDetail onOpenBooking={onOpenBooking} />} />
          <Route path="/experience" element={<Experience onOpenBooking={onOpenBooking} />} />
          <Route path="/gallery" element={<Gallery onOpenBooking={onOpenBooking} />} />
          <Route path="/reviews" element={<Reviews onOpenBooking={onOpenBooking} />} />
          <Route path="/contact" element={<Contact onOpenBooking={() => onOpenBooking()} />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Home onOpenBooking={onOpenBooking} />} />
        </Routes>
      </main>

      {/* Show public Footer with Admin link only when not in admin dashboard */}
      {!isAdminRoute && <Footer />}

      {/* Adaptive Mobile Bottom Quick Bar */}
      {!isAdminRoute && <MobileBottomBar onOpenBooking={() => onOpenBooking()} />}

      {/* Left Corner Floating Booking & Direct Contact Pop-up */}
      {!isAdminRoute && <LeftBookingLauncher onOpenBooking={() => onOpenBooking()} />}
    </div>
  );
}

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingArtistId, setBookingArtistId] = useState<string | undefined>(undefined);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [bookingCategoryId, setBookingCategoryId] = useState<BookingCategory | undefined>(undefined);

  // Global Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [authCustomTitle, setAuthCustomTitle] = useState<string | undefined>(undefined);
  const [authCustomSubtitle, setAuthCustomSubtitle] = useState<string | undefined>(undefined);
  const [afterAuthTab, setAfterAuthTab] = useState<'birthday' | 'referral' | null>(null);

  // Global Gifts & Rewards Modal state
  const [globalRewardsOpen, setGlobalRewardsOpen] = useState(false);
  const [globalRewardsTab, setGlobalRewardsTab] = useState<'birthday' | 'referral'>('birthday');

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const custom = e as CustomEvent<OpenAuthModalDetail | undefined>;
      const detail = custom.detail;
      setAuthModalMode(detail?.mode || 'signin');
      setAuthCustomTitle(detail?.title);
      setAuthCustomSubtitle(detail?.subtitle);
      setAfterAuthTab(detail?.afterTab || null);
      setAuthModalOpen(true);
    };

    window.addEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuth);
    return () => window.removeEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuth);
  }, []);

  const handleOpenBooking = (artistId?: string, serviceId?: string, categoryId?: BookingCategory) => {
    setBookingArtistId(artistId);
    setBookingServiceId(serviceId);
    setBookingCategoryId(categoryId);
    setBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
  };

  const handleOpenRewards = (tab: 'birthday' | 'referral' = 'birthday') => {
    setGlobalRewardsTab(tab);
    setGlobalRewardsOpen(true);
  };

  return (
    <BrowserRouter basename={getAppBasename()}>
      <ScrollToTop />
      <MainLayout 
        onOpenBooking={handleOpenBooking} 
        onOpenRewards={handleOpenRewards} 
      />

      {/* Global Appointment Booking Modal (Saves to Supabase) */}
      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={handleCloseBooking}
        preselectedArtistId={bookingArtistId}
        preselectedServiceId={bookingServiceId}
        initialCategory={bookingCategoryId}
      />

      {/* Global Professional Member Sign Up & Sign In Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        customTitle={authCustomTitle}
        customSubtitle={authCustomSubtitle}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (afterAuthTab) {
            setGlobalRewardsTab(afterAuthTab);
            setGlobalRewardsOpen(true);
            setAfterAuthTab(null);
          }
        }}
      />

      {/* Global Rewards & Gifts Modal */}
      <GiftRewardModal
        isOpen={globalRewardsOpen}
        onClose={() => setGlobalRewardsOpen(false)}
        initialTab={globalRewardsTab}
        onOpenBooking={() => handleOpenBooking()}
        onRequestAuth={(mode, title, subtitle) => {
          setGlobalRewardsOpen(false);
          triggerAuthModal({
            mode,
            title,
            subtitle,
            afterTab: globalRewardsTab,
          });
        }}
      />
    </BrowserRouter>
  );
}

