import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  User, 
  MapPin, 
  PenTool,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Plus,
  Trash2,
  Play
} from 'lucide-react';
import { addCustomerReview, CustomerReview } from '../lib/studioContent';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReview: CustomerReview) => void;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Hisar');
  const [service, setService] = useState('Custom Tattooing');
  const [artist, setArtist] = useState('Rohit Sharma');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  
  // Media attachments
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle image upload from computer/phone with client canvas compression
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    const filesArray = Array.from(files);

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setImages((prev) => [...prev, dataUrl]);
          }
          setIsProcessingMedia(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add video by URL or file
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setVideos((prev) => [...prev, videoUrlInput.trim()]);
    setVideoUrlInput('');
  };

  // Handle video file upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Video file is larger than 25MB. Please provide a shorter clip or video URL link.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVideos((prev) => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove video
  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!text.trim() || text.length < 15) {
      setErrorMsg('Please write at least 15 characters sharing your thoughts & experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await addCustomerReview({
      name: name.trim(),
      city: city.trim() || 'Hisar',
      rating,
      title: title.trim() || `${service} Experience`,
      text: text.trim(),
      service,
      artist,
      verified: true,
      featured: true,
      approved: true,
      images: images.length > 0 ? images : undefined,
      videos: videos.length > 0 ? videos : undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.newReview) {
      setSubmittedSuccess(true);
      if (onSuccess) onSuccess(res.newReview);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
        // Reset form
        setName('');
        setTitle('');
        setText('');
        setRating(5);
        setImages([]);
        setVideos([]);
      }, 2500);
    } else {
      setErrorMsg(res.error || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-7 overflow-y-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFD60A]/15 border-2 border-[#FFD60A] flex items-center justify-center text-[#FFD60A]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Thank You for Your Review!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Your feedback{images.length > 0 || videos.length > 0 ? ', photos, and video showcase' : ''} have been published to our studio review section.
            </p>
            <div className="pt-2 text-[11px] text-[#FFD60A] font-semibold">
              “Same Skin Different Story”
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FFD60A]" />
                <span className="text-[11px] font-bold text-[#FFD60A] uppercase tracking-wider">
                  Client Feedback
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                Review &amp; Share Your Thoughts
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Share your personal tattoo experience, views on our hygiene, or add photos/video of your healed piece.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs px-3.5 py-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="bg-[#181818] border border-zinc-800/80 p-3.5 rounded-xl text-center space-y-1.5">
              <span className="text-xs font-semibold text-zinc-300 block">
                How was your studio experience?
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          active
                            ? 'text-[#FFD60A] fill-[#FFD60A] drop-shadow-[0_2px_8px_rgba(255,214,10,0.4)]'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-semibold text-[#FFD60A]">
                {rating === 5 && 'Outstanding • 5.0 Stars (Masterpiece Experience)'}
                {rating === 4 && 'Great • 4.0 Stars (Very Happy)'}
                {rating === 3 && 'Good • 3.0 Stars (Satisfied)'}
                {rating === 2 && 'Fair • 2.0 Stars (Could be better)'}
                {rating === 1 && 'Needs Improvement • 1.0 Star'}
              </span>
            </div>

            {/* Inputs: Name & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FFD60A]" />
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FFD60A]" />
                  City / Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hisar, Delhi, Rohtak"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Inputs: Service & Artist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#FFD60A]" />
                  Service Received
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                >
                  <option value="Custom Tattooing">Custom Tattooing (Realism / Fine Line)</option>
                  <option value="Cover-Up & Rework">Tattoo Cover-Up &amp; Rework</option>
                  <option value="Cosmetic Tattooing">Cosmetic Tattooing (Microblading / Lip Blush)</option>
                  <option value="Body Piercing">Sterile Body Piercing</option>
                  <option value="Academy Course">Phoenix Tattoo Academy Certification</option>
                  <option value="Studio Consultation">Design &amp; Placement Consultation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  Tattoo Artist
                </label>
                <select
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                >
                  <option value="Rohit Sharma">Rohit Sharma (Master Artist)</option>
                  <option value="Sneha Verma">Sneha Verma (Fine-Line Specialist)</option>
                  <option value="Arjun Mehta">Arjun Mehta (Color / Traditional)</option>
                  <option value="Phoenix Studio Team">Phoenix Studio Team</option>
                </select>
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300">
                Headline / One-Line Summary
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterpiece lion realism on my arm!"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            {/* Review Thoughts & Details */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#FFD60A]" />
                Your Thoughts &amp; Experience *
              </label>
              <textarea
                required
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us about the design process, studio hygiene, pain level, artist behavior, and how you feel about your new tattoo..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A] resize-none leading-relaxed"
              />
            </div>

            {/* ======================================================= */}
            {/* MEDIA SECTION: ADD PHOTOS & VIDEOS */}
            {/* ======================================================= */}
            <div className="bg-[#181818] border border-zinc-800/90 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                  <span>Add Photos &amp; Video (Optional)</span>
                </span>
                <span className="text-[10px] text-zinc-500">
                  Show off your healed ink
                </span>
              </div>

              {/* 1. Images attachment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-200 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#FFD60A]" />
                    <span>Upload Tattoo Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-1">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste photo URL..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Images Preview Grid */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
                        <img src={img} alt="Tattoo preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Video attachment */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-200 cursor-pointer transition-colors">
                    <VideoIcon className="w-3.5 h-3.5 text-[#FFD60A]" />
                    <span>Upload Video Clip</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-1">
                    <input
                      type="url"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="Or video link (MP4/Reel/Shorts)..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideoUrl}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Videos Preview List */}
                {videos.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {videos.map((vid, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-[11px]">
                        <div className="flex items-center gap-2 truncate">
                          <Play className="w-3.5 h-3.5 text-[#FFD60A] shrink-0" />
                          <span className="text-zinc-300 truncate max-w-xs">{vid.slice(0, 40)}...</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(i)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Studio Review</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingMedia}
                  className="px-5 py-2 text-xs font-bold bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>Post My Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
