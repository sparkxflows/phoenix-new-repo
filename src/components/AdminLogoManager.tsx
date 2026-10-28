import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  CheckCircle2, 
  RotateCcw, 
  Link as LinkIcon, 
  Eye, 
  Sliders, 
  Sparkles, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  getStoredLogoSettings, 
  saveLogoSettings, 
  resetToDefaultLogo, 
  LogoSettings, 
  DEFAULT_LOGO_SETTINGS 
} from '../lib/branding';
import { PhoenixLogo } from './PhoenixLogo';
import { uploadImageToServer } from '../lib/studioContent';

export const AdminLogoManager: React.FC = () => {
  const [settings, setSettings] = useState<LogoSettings>(getStoredLogoSettings);
  const [urlInput, setUrlInput] = useState(settings.customLogoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync latest logo settings from persistent server on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFreshLogo = async () => {
      try {
        const res = await fetch('/api/content/custom_logo', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.value) {
            setSettings(data.value);
            if (data.value.customLogoUrl) {
              setUrlInput(data.value.customLogoUrl);
            }
          }
        }
      } catch {}
    };
    fetchFreshLogo();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle local file upload directly to persistent server disk storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('Image file size should be less than 20MB.');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      // Upload directly to server storage /data/uploads/
      const serverUrl = await uploadImageToServer(file, 'logo');
      setUrlInput(serverUrl);
      const updated = { ...settings, customLogoUrl: serverUrl };
      setSettings(updated);
      // Auto-save immediately to preserve across any subsequent site updates
      await saveLogoSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Logo upload error:', err);
      alert('Failed to upload logo image to server disk.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle direct URL change
  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    setFileName('');
    setSettings((prev) => ({ ...prev, customLogoUrl: url.trim() || null }));
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveLogoSettings(settings);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      alert('Error saving logo: ' + res.error);
    }
  };

  // Reset to original vector seal
  const handleReset = async () => {
    if (!window.confirm('Reset logo back to the original Phoenix Tattooz circular badge?')) {
      return;
    }
    await resetToDefaultLogo();
    setSettings(DEFAULT_LOGO_SETTINGS);
    setUrlInput('');
    setFileName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#FFD60A]/15 text-[#FFD60A]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-xl text-white">
              Custom Logo &amp; Studio Branding
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
            Upload or link your custom studio logo here. Any changes saved will update automatically across the entire website including the Navbar, Footer, Mobile bar, and Admin portal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Seal</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-bold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Save &amp; Apply Logo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Custom logo successfully applied across the entire website!</span>
          </span>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-400 hover:text-white text-xs">
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: Settings & Multi-View Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Upload & Customization Controls */}
        <div className="lg:col-span-7 space-y-6 bg-[#161616] border border-zinc-800 p-6 rounded-2xl">
          {/* Method 1: File Upload */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#FFD60A]" />
              <span>1. Upload Logo File</span>
            </h4>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-[#FFD60A] rounded-xl p-6 text-center cursor-pointer transition-colors bg-zinc-900/40 hover:bg-zinc-900/80 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-[#FFD60A]/20 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-[#FFD60A] transition-colors mb-3">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FFD60A]" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-semibold text-white">
                {isUploading ? 'Uploading to persistent server storage...' : fileName ? `Selected: ${fileName}` : 'Click to browse or drag & drop image file'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Permanently saved to disk storage (PNG, JPG, SVG, WebP)
              </p>
            </div>
          </div>

          {/* Method 2: Direct URL */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#FFD60A]" />
              <span>2. Or Provide Image URL</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/your-custom-logo.png"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => handleUrlChange('')}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Styling Options */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FFD60A]" />
              <span>3. Logo Framing &amp; Shape Style</span>
            </h4>

            {/* Shape selection */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Logo Shape
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'circle', label: 'Circular Badge', desc: 'Classic Round' },
                  { id: 'rounded', label: 'Squircle', desc: 'Rounded Modern' },
                  { id: 'original', label: 'Original Ratio', desc: 'Preserve Aspect' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, logoShape: s.id as any }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.logoShape === s.id
                        ? 'bg-zinc-800 border-[#FFD60A] text-white shadow-sm ring-1 ring-[#FFD60A]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{s.label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Background Fill Underneath Logo
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { value: '#FFD60A', label: 'Brand Yellow (#FFD60A)', bg: '#FFD60A' },
                  { value: '#0B0B0B', label: 'Studio Black (#0B0B0B)', bg: '#0B0B0B' },
                  { value: 'transparent', label: 'Transparent (None)', bg: 'transparent' },
                  { value: '#FFFFFF', label: 'Pure White (#FFFFFF)', bg: '#FFFFFF' },
                ].map((bg) => (
                  <button
                    key={bg.value}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, backgroundColor: bg.value }))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      settings.backgroundColor === bg.value
                        ? 'border-[#FFD60A] bg-zinc-800 text-white font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-zinc-600 inline-block"
                      style={{ backgroundColor: bg.bg }}
                    />
                    <span>{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Border toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Show Accent Border Ring
                </label>
                <input
                  type="checkbox"
                  checked={settings.showBorder}
                  onChange={(e) => setSettings((prev) => ({ ...prev, showBorder: e.target.checked }))}
                  className="w-4 h-4 accent-[#FFD60A] cursor-pointer"
                />
              </div>

              {settings.showBorder && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-400">Border Color:</span>
                  {[
                    { color: '#FFD60A', label: 'Yellow' },
                    { color: '#FFFFFF', label: 'White' },
                    { color: '#000000', label: 'Black' },
                    { color: '#E5E7EB', label: 'Silver' },
                  ].map((bc) => (
                    <button
                      key={bc.color}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, borderColor: bc.color }))}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        settings.borderColor === bc.color ? 'scale-110 ring-2 ring-[#FFD60A]' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: bc.color, borderColor: '#333' }}
                      title={bc.label}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Real-Time Multi-Context Previews */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161616] border border-zinc-800 p-6 rounded-2xl space-y-5">
            <h4 className="font-serif font-bold text-sm text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FFD60A]" />
                <span>Live Website Previews</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Real-Time
              </span>
            </h4>

            {/* 1. Header / Navbar Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Preview in Top Navbar:
              </span>
              <div className="bg-[#0B0B0B] border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Dynamic Logo in Navbar Size (52px) */}
                  {settings.customLogoUrl ? (
                    <div 
                      className={`overflow-hidden flex items-center justify-center shrink-0 ${
                        settings.logoShape === 'circle' ? 'rounded-full' : settings.logoShape === 'rounded' ? 'rounded-xl' : 'rounded-md'
                      }`}
                      style={{ 
                        width: 48, 
                        height: 48, 
                        backgroundColor: settings.backgroundColor,
                        border: settings.showBorder ? `2px solid ${settings.borderColor}` : 'none'
                      }}
                    >
                      <img src={settings.customLogoUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <PhoenixLogo size={48} />
                  )}

                  <div>
                    <div className="font-serif font-bold text-white text-sm">Phoenix Tattooz</div>
                    <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">Studio &amp; Academy</div>
                  </div>
                </div>

                <div className="bg-[#FFD60A] text-black font-bold text-[10px] px-3 py-1.5 rounded-md">
                  Book Appt
                </div>
              </div>
            </div>

            {/* 2. Footer Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Preview in Dark Footer:
              </span>
              <div className="bg-[#070707] border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                {settings.customLogoUrl ? (
                  <div 
                    className={`overflow-hidden flex items-center justify-center shrink-0 ${
                      settings.logoShape === 'circle' ? 'rounded-full' : settings.logoShape === 'rounded' ? 'rounded-xl' : 'rounded-md'
                    }`}
                    style={{ 
                      width: 56, 
                      height: 56, 
                      backgroundColor: settings.backgroundColor,
                      border: settings.showBorder ? `2px solid ${settings.borderColor}` : 'none'
                    }}
                  >
                    <img src={settings.customLogoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <PhoenixLogo size={56} />
                )}

                <div>
                  <div className="font-serif font-bold text-white text-base">Phoenix Tattooz</div>
                  <div className="text-[10px] text-[#FFD60A] uppercase tracking-wider">Studio &amp; Academy</div>
                  <div className="text-[10px] text-zinc-500">Hisar, Haryana</div>
                </div>
              </div>
            </div>

            {/* 3. Large High-Res Stamp Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Detailed Stamp View (110px):
              </span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                {settings.customLogoUrl ? (
                  <div 
                    className={`overflow-hidden flex items-center justify-center shadow-2xl transition-transform hover:scale-105 ${
                      settings.logoShape === 'circle' ? 'rounded-full' : settings.logoShape === 'rounded' ? 'rounded-2xl' : 'rounded-xl'
                    }`}
                    style={{ 
                      width: 110, 
                      height: 110, 
                      backgroundColor: settings.backgroundColor,
                      border: settings.showBorder ? `3px solid ${settings.borderColor}` : 'none'
                    }}
                  >
                    <img src={settings.customLogoUrl} alt="Large preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <PhoenixLogo size={110} />
                )}

                <span className="text-[11px] font-mono text-zinc-400">
                  {settings.customLogoUrl ? 'Custom Image Active' : 'Default Phoenix Emblem'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Save &amp; Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
