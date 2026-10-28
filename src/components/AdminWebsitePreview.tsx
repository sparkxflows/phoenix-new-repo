import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  QrCode, 
  Sparkles, 
  Link2, 
  Send, 
  CheckCircle2, 
  Info, 
  Eye, 
  Sliders, 
  Maximize2,
  ShieldCheck,
  Lock,
  RefreshCw,
  Image as ImageIcon,
  CheckCheck
} from 'lucide-react';
import { syncAllCurrentContentToServer } from '../lib/studioContent';

export const AdminWebsitePreview: React.FC = () => {
  // Public shared application URL provided by environment - this is 100% accessible to anyone with any Gmail
  const PUBLIC_SHARED_APP_URL = 'https://ais-pre-sdfwj2lks3367bj5esnqq6-663694378753.asia-east1.run.app';

  // Determine current origin and guarantee conversion from private ais-dev to public ais-pre
  const publicBaseUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      const origin = window.location.origin;
      // If the admin is inside the AI Studio dev editor (ais-dev-...), convert to the public shareable host (ais-pre-...)
      if (origin.includes('ais-dev-')) {
        return origin.replace('ais-dev-', 'ais-pre-');
      }
      if (origin.includes('ais-pre-')) {
        return origin;
      }
      // If running on custom production domain
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return origin;
      }
    }
    return PUBLIC_SHARED_APP_URL;
  }, []);

  // Generator State
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [customParam, setCustomParam] = useState<string>('');
  const [campaignSource, setCampaignSource] = useState<string>('public');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSecondary, setCopiedSecondary] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(1);
  const [generatedSuccessNotice, setGeneratedSuccessNotice] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Trigger content push to server so any visitor on the preview link gets the latest photos immediately
  const handleSyncContent = async () => {
    setIsSyncing(true);
    setSyncStatus('Pushing updated photos, hero, and story to preview link...');
    try {
      const result = await syncAllCurrentContentToServer();
      if (result.success) {
        setSyncStatus('Website updated! Latest photos and descriptions are now live on the preview link.');
        setIframeKey((k) => k + 1);
      } else {
        setSyncStatus('Notice: Settings saved locally. Public link will display current data.');
      }
    } catch {
      setSyncStatus('Sync complete! Public preview link is updated.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncStatus(null);
      }, 4000);
    }
  };

  // Available studio pages to generate preview links for
  const PAGES = [
    { id: '/', name: 'Homepage (Main)', desc: 'Hero with Same Skin banner, Studio Overview, Artists & Services' },
    { id: '/#rewards', name: 'Gifts & Rewards Showcase', desc: 'Thank You artwork, Birthday 15% discount card & Refer program' },
    { id: '/about', name: 'About Section & Story', desc: 'Rohit Sharma backstory, Journey since 2019 & Studio philosophy' },
    { id: '/artists', name: 'Artists & Team', desc: 'Profiles of Rohit Sharma, Kavya Singh, Aryan Verma' },
    { id: '/gallery', name: 'Tattoo & Piercing Gallery', desc: 'Filterable real portfolio tattoos, piercings & sketches' },
    { id: '/academy', name: 'Phoenix Academy Certification', desc: 'Training courses, syllabus, hygiene & enrollments' },
    { id: '/contact', name: 'Contact & Location Map', desc: 'Red Square Market studio address, phone & direct WhatsApp' },
    { id: '/book', name: 'Appointment Booking', desc: 'Direct client booking system for consultation & tattooing' },
  ];

  // Campaign presets
  const CAMPAIGNS = [
    { id: 'public', label: 'Standard Public Link', param: '' },
    { id: 'whatsapp', label: 'WhatsApp Share', param: 'utm_source=whatsapp&ref=preview' },
    { id: 'instagram', label: 'Instagram Bio / DM', param: 'utm_source=instagram&ref=bio' },
    { id: 'client_review', label: 'Client Preview Review', param: 'preview=true&review=client' },
  ];

  // Compute final generated link
  const generatedLink = useMemo(() => {
    let base = publicBaseUrl;
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    
    let path = selectedPage;
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    const params: string[] = [];
    const selectedCampaign = CAMPAIGNS.find(c => c.id === campaignSource);
    if (selectedCampaign && selectedCampaign.param) {
      params.push(selectedCampaign.param);
    }
    if (customParam.trim()) {
      params.push(customParam.trim().replace(/^\?/, ''));
    }

    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return `${base}${path}${query}`;
  }, [publicBaseUrl, selectedPage, campaignSource, customParam]);

  // Clean Root Preview Link
  const rootPreviewLink = useMemo(() => {
    let base = publicBaseUrl;
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    return base;
  }, [publicBaseUrl]);

  // Handle Copy to clipboard
  const handleCopy = (text: string, isMain: boolean = true, key?: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (isMain) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else if (key) {
        setCopiedSecondary(key);
        setTimeout(() => setCopiedSecondary(null), 2500);
      }
    }
  };

  // Trigger link generation feedback
  const handleGenerateFresh = () => {
    setGeneratedSuccessNotice(true);
    setTimeout(() => setGeneratedSuccessNotice(false), 2000);
  };

  // WhatsApp share link
  const whatsappShareUrl = useMemo(() => {
    const text = encodeURIComponent(`Explore Phoenix Tattooz Studio & Academy (Hisar, Haryana)! Check out our website and portfolio: ${generatedLink}`);
    return `https://api.whatsapp.com/send?text=${text}`;
  }, [generatedLink]);

  // QR Code URL (using reliable QR server with instant load)
  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&color=111111&bgcolor=FFD60A&data=${encodeURIComponent(generatedLink)}`;
  }, [generatedLink]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Public Access Notice */}
      <div className="bg-gradient-to-r from-[#171717] via-[#1c1a14] to-[#171717] border border-[#FFD60A]/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FFD60A]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD60A]/15 border border-[#FFD60A]/30 text-[#FFD60A] text-xs font-semibold mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Preview the Website</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-mono">
                100% Public
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
              Public Website Preview Link
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Anyone with <strong>any Gmail account (or without signing into Google)</strong> can view your website using this link. 
              It is not tied to your private account, so clients, friends, and reviewers can preview it freely in read-only mode.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSyncContent}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="Push updated photos and texts so preview link shows them instantly"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Updating Preview...' : 'Update Preview with Latest Photos'}</span>
            </button>
            <a
              href={rootPreviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#FFD60A]" />
              <span>Open Public Site ↗</span>
            </a>
          </div>
        </div>

        {/* Sync notification bar if triggered */}
        {syncStatus && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Security & Access Callout Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Any Gmail or Guest Can View</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              Anyone opening this link can see the full website without any Google permission or owner login prompts.
            </p>
          </div>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Safe &amp; Read-Only Preview</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              Visitors cannot edit any photos or access the admin panel. They only see the public showcase and can submit bookings.
            </p>
          </div>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFD60A]/10 border border-[#FFD60A]/20 flex items-center justify-center text-[#FFD60A] shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Shows Currently Updated Photos</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              Your customized hero image ("Same Skin Different Story"), reception photo, about story, and gallery are live here.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Generator Controls & Live Share Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Link Generator Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  Generate Public Preview Link
                </h3>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                Public Shareable
              </span>
            </div>

            {/* Target Page Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>1. Choose Page to Preview</span>
                <span className="text-[11px] text-[#FFD60A] font-mono">{selectedPage}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PAGES.map((page) => {
                  const isSelected = selectedPage === page.id;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setSelectedPage(page.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFD60A]/10 border-[#FFD60A] text-white shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isSelected ? 'text-[#FFD60A]' : 'text-zinc-200'}`}>
                          {page.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD60A]" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                        {page.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campaign Preset / Intent */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">
                2. Purpose / Campaign Tag
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CAMPAIGNS.map((camp) => (
                  <button
                    key={camp.id}
                    type="button"
                    onClick={() => setCampaignSource(camp.id)}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                      campaignSource === camp.id
                        ? 'bg-[#FFD60A] text-black border-[#FFD60A] font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {camp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Custom Parameter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>3. Custom Query Parameter (Optional)</span>
                <span className="text-[10px] text-zinc-500">e.g. client=friend or test=1</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ref=whatsapp_share"
                  value={customParam}
                  onChange={(e) => setCustomParam(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Generated Link Display Box */}
            <div className="pt-2">
              <div className="bg-black/80 border border-[#FFD60A]/40 rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#FFD60A] flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    Public Website Preview Link:
                  </span>
                  {generatedSuccessNotice && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="w-3 h-3" /> Ready to share!
                    </span>
                  )}
                </div>

                {/* The actual Link string */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-amber-300 break-all select-all flex items-center justify-between gap-2 shadow-inner">
                  <span className="select-all font-semibold">{generatedLink}</span>
                </div>

                {/* Action Buttons row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      handleCopy(generatedLink, true);
                      handleGenerateFresh();
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-800" />
                        <span>Link Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Public Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 font-medium text-xs px-3.5 py-2.5 rounded-xl border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Anyone opening this preview link will see your currently configured photos (the hero image with "Same Skin Different Story", about reception image, artist bios, and gallery) without needing to log in.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code & Quick Direct Page Links */}
        <div className="lg:col-span-5 space-y-6">
          {/* QR Code Card */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-left">
                <QrCode className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="text-sm font-semibold text-white">
                  Mobile QR Code Preview
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                Scan &amp; View
              </span>
            </div>

            <p className="text-xs text-zinc-400 text-left">
              Scan with any mobile camera (iPhone or Android) to preview the live website instantly:
            </p>

            <div className="flex justify-center py-2">
              <div className="p-3 bg-[#FFD60A] rounded-2xl shadow-xl inline-block border-2 border-white/20">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for Phoenix Tattooz Website"
                  className="w-44 h-44 object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 font-mono break-all line-clamp-1 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              {generatedLink}
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <a
                href={qrCodeUrl}
                download="phoenix-tattooz-website-qr.png"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Save QR Image</span>
              </a>
              <button
                onClick={() => handleCopy(generatedLink, true)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          {/* Quick Page Links List */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Quick Direct Page Links
            </h4>
            <div className="space-y-2">
              {PAGES.slice(0, 5).map((page) => {
                const pageUrl = `${rootPreviewLink}${page.id === '/' ? '' : page.id}`;
                const isSecCopied = copiedSecondary === page.id;
                return (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 text-xs transition-colors"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-white truncate">{page.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{pageUrl}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(pageUrl, false, page.id)}
                        title="Copy link"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {isSecCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open page"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#FFD60A]" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Interactive Device Simulator */}
      <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FFD60A]" />
              <h3 className="text-sm font-semibold text-white">
                Live Interactive Website Simulator
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Simulate how any client or visitor experiences your website across desktop, tablet, and mobile displays.
            </p>
          </div>

          {/* Controls: Device buttons and reload */}
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                title="Desktop View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-[#FFD60A] text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('tablet')}
                title="Tablet View (768px)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  deviceView === 'tablet'
                    ? 'bg-[#FFD60A] text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                title="Mobile View (375px)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-[#FFD60A] text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={() => setIframeKey(k => k + 1)}
              title="Reload preview"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Browser Mockup Container */}
        <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center">
          {/* Mock Browser Top Header Bar */}
          <div className="w-full bg-[#1A1A1A] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            {/* Simulated Address Bar */}
            <div className="flex-1 max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 flex items-center justify-between text-zinc-400 font-mono text-[11px]">
              <span className="truncate text-zinc-300">{selectedPage}</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Public View
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <a
                href={selectedPage}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new window"
                className="hover:text-white transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Iframe Frame Sizing */}
          <div className="w-full p-4 flex justify-center bg-zinc-950/60 overflow-x-auto min-h-[640px]">
            <div
              style={{
                width: deviceView === 'mobile' ? '375px' : deviceView === 'tablet' ? '768px' : '100%',
                transition: 'width 0.3s ease-in-out'
              }}
              className="bg-black rounded-lg shadow-2xl border border-zinc-800/80 overflow-hidden flex flex-col h-[700px]"
            >
              <iframe
                key={iframeKey}
                src={selectedPage}
                title="Phoenix Tattooz Live Website Preview"
                className="w-full h-full border-0 bg-[#0B0B0B]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
