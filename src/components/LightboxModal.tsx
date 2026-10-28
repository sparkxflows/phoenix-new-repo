import React, { useEffect } from 'react';
import { X, Calendar, User, Tag, Sparkles } from 'lucide-react';

interface LightboxItem {
  id: string;
  title: string;
  category: string;
  image: string;
  artist?: string;
  description?: string;
  tags?: string[];
}

interface LightboxModalProps {
  item: LightboxItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (artistId?: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  isOpen,
  onClose,
  onBookAppointment,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-3xl w-full bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-auto flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image display */}
        <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[220px] sm:min-h-[320px] max-h-[45vh] md:max-h-[70vh]">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain max-h-[45vh] md:max-h-[70vh]"
          />
        </div>

        {/* Tattoo Details */}
        <div className="md:w-2/5 p-4 sm:p-6 flex flex-col justify-between space-y-4 text-zinc-300 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#FFD60A] block mb-1">
                {item.category}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                {item.title}
              </h3>
            </div>

            {item.artist && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <User className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Crafted by <strong className="text-zinc-200">{item.artist}</strong></span>
              </div>
            )}

            <p className="text-xs text-zinc-400 leading-relaxed">
              {item.description || 'Custom crafted original tattoo artwork completed at Phoenix Tattooz Studio & Academy, Hisar.'}
            </p>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <button
              onClick={() => {
                onClose();
                onBookAppointment();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs py-2.5 px-4 rounded-lg shadow transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-black" />
              <span>Book Similar Tattoo Design</span>
            </button>
            <p className="text-[10px] text-center text-zinc-500">
              Custom size &amp; placement consultations available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
