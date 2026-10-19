import React, { useState } from 'react';
import { MessageCircle, Phone, Copy, Check, ExternalLink, X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export function FloatingWhatsApp() {
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const rawNumber = '254112294835';
  const displayPhone = '0112 294 835';

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const queryId = `NP-WAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const userEmail = auth.currentUser?.email || localStorage.getItem('userEmail') || 'Guest Student';
    const userRole = localStorage.getItem('userRole') || 'student';
    const currentPath = window.location.pathname;

    try {
      await addDoc(collection(db, 'whatsappInquiries'), {
        queryId,
        userEmail,
        userRole,
        currentPath,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } catch (err) {
      console.error("Error logging WhatsApp inquiry to Firestore", err);
    }

    const customMessage = `Hello NCKPrep, I need assistance regarding my nursing licensure prep. [Ref ID: ${queryId}]`;
    const dynamicUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(customMessage)}`;
    
    window.open(dynamicUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(displayPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isMinimized) {
    return (
      <aside
        id="floating-whatsapp-minimized"
        aria-label="WhatsApp Contact"
        className="fixed top-[70px] sm:top-[72px] right-3 sm:right-6 md:right-8 z-30 transition-transform duration-200"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2 px-3 py-1.5 sm:py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg hover:shadow-xl border-2 border-white/90 transition-all hover:scale-105 cursor-pointer"
          title="Open WhatsApp contact banner (0112 294 835)"
          aria-label="Open WhatsApp contact banner"
        >
          <span className="relative flex items-center justify-center">
            <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-200 rounded-full" />
          </span>
          <span className="text-xs font-black tracking-wide pr-0.5">
            WhatsApp
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      id="floating-whatsapp-banner"
      aria-label="WhatsApp Contact Banner"
      className="fixed top-[70px] sm:top-[72px] right-3 sm:right-6 md:right-8 z-30 max-w-[calc(100vw-1.5rem)] transition-all duration-300 animate-in fade-in slide-in-from-top-2 slide-in-from-right-4"
    >
      <div className="relative group bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl shadow-slate-900/15 border border-emerald-500/40 p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 hover:border-emerald-400 transition-all">
        {/* Clickable WhatsApp link trigger with automated query tracking */}
        <a
          href={`https://wa.me/${rawNumber}`}
          onClick={handleWhatsAppClick}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 group/link active:scale-95 transition-transform cursor-pointer"
          title="Chat with NCKPrep on WhatsApp (0112 294 835) - Auto Inquiry ID Tracked"
        >
          {/* WhatsApp green icon bubble with pulse status */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shrink-0 shadow-md transition-transform group-hover/link:scale-105">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-slate-900" />
            </span>
          </div>

          {/* Text & Message Us CTA Button */}
          <div className="min-w-0 pr-0.5 flex flex-col items-start">
            <div className="flex items-center gap-1.5 leading-none mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                24/7 NCK Support
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-slate-300 font-medium">
                Online
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-lg shadow-sm group-hover/link:shadow transition-all">
              <span>Message Us</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </div>
          </div>
        </a>

        {/* Copy button & minimize control */}
        <div className="flex items-center gap-0.5 border-l border-slate-700/80 pl-1.5 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={copied ? "Copied!" : "Copy phone number"}
            aria-label="Copy phone number"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Minimize WhatsApp banner"
            aria-label="Minimize WhatsApp banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
