import React, { useRef, useEffect } from 'react';

interface SectionBackgroundVideoProps {
  overlayOpacity?: number;
  className?: string;
  videoSrc?: string;
}

export const SectionBackgroundVideo: React.FC<SectionBackgroundVideoProps> = ({
  overlayOpacity = 0.75,
  className = '',
  videoSrc = '/uploads/studio_bg_video.mp4',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoSrc]);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover scale-[1.01]"
        src={videoSrc}
      >
        <source src={videoSrc} type="video/mp4" />
        <source src="/uploads/studio_bg_video.mp4" type="video/mp4" />
      </video>

      {/* Atmospheric dark overlay for perfect text contrast and luxury visual polish */}
      <div
        className="absolute inset-0 bg-[#07080A] pointer-events-none transition-opacity duration-300"
        style={{ opacity: overlayOpacity }}
      />

      {/* Ambient subtle noise/texture */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
