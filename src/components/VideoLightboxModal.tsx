import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Share2, 
  Check, 
  User, 
  Eye, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { VideoGalleryItem } from '../data/studioData';

interface VideoLightboxModalProps {
  item: VideoGalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (artistId?: string) => void;
}

export const VideoLightboxModal: React.FC<VideoLightboxModalProps> = ({
  item,
  isOpen,
  onClose,
  onBookAppointment,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      document.body.style.overflow = '';
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer backdrop-blur-md"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Video Player */}
        <div className="relative flex-1 bg-black flex items-center justify-center aspect-[9/16] sm:aspect-[4/3] lg:aspect-auto lg:h-[620px] max-h-[55vh] lg:max-h-none overflow-hidden group">
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={item.thumbnailUrl}
            playsInline
            loop
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Center Play/Pause Overlay indicator when paused */}
          {!isPlaying && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFD60A] text-black flex items-center justify-center shadow-xl transform scale-110">
                <Play className="w-8 h-8 fill-black translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Player Controls Bar at bottom of video */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
            {/* Scrubber */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-700 accent-[#FFD60A] rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="hover:text-[#FFD60A] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-[#FFD60A] transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="font-mono text-[11px] text-zinc-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#FFD60A]/20 text-[#FFD60A] font-bold px-2 py-0.5 rounded uppercase">
                  Studio Reel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Video Metadata & Booking Sidebar */}
        <div className="w-full lg:w-80 p-5 sm:p-6 bg-[#121212] border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between overflow-y-auto max-h-[40vh] lg:max-h-none space-y-4">
          <div className="space-y-4">
            {/* Category & Views */}
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[#FFD60A] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                {item.category}
              </span>
              {item.views && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{item.views} views</span>
                </span>
              )}
            </div>

            {/* Video Title */}
            <h3 className="font-serif font-extrabold text-lg sm:text-xl text-white leading-snug">
              {item.title}
            </h3>

            {/* Artist Tag */}
            <div className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
              <div className="w-7 h-7 rounded-full bg-[#FFD60A]/20 flex items-center justify-center text-[#FFD60A] font-bold shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Artist</span>
                <span className="font-bold text-white truncate block">{item.artist}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">About this work</span>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-zinc-800/80 text-zinc-300 text-[10px] px-2.5 py-1 rounded-full border border-zinc-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <button
              onClick={() => {
                onClose();
                onBookAppointment(item.artist.toLowerCase().includes('rohit') ? 'rohit-sharma' : undefined);
              }}
              className="w-full bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-black" />
              <span>Book Appointment For This Style</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs py-2 rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Share Video Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
