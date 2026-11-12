import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Copy, Check, ExternalLink, X, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export function FloatingWhatsApp() {
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Schedule Call Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [schedulePhone, setSchedulePhone] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [scheduleTopic, setScheduleTopic] = useState('NCK FQE Licensure Strategy & Revision Guidance');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
      const stopTimer = setTimeout(() => setShouldAnimate(false), 5000);
      return () => clearTimeout(stopTimer);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

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
      localStorage.setItem('nckprep_last_whatsapp_inquiry', JSON.stringify({ queryId, timestamp: new Date().toISOString() }));
    }

    const customMessage = `Hello NCKPrep, I need assistance regarding my nursing licensure prep. [Ref ID: ${queryId}]`;
    const dynamicUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(customMessage)}`;
    
    window.open(dynamicUrl, '_blank', 'noopener,noreferrer');
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(schedulePhone.trim())) {
      alert("Please enter a valid 10-digit phone number starting with 0 (e.g. 0712345678).");
      return;
    }

    setIsSubmittingSchedule(true);
    const userEmail = auth.currentUser?.email || localStorage.getItem('userEmail') || 'Guest Student';
    const scheduleId = `SCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      await addDoc(collection(db, 'consultationSchedules'), {
        scheduleId,
        name: scheduleName || userEmail,
        phone: schedulePhone,
        dateTime: scheduleDateTime,
        topic: scheduleTopic,
        userEmail,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      const existing = JSON.parse(localStorage.getItem('nckprep_schedules') || '[]');
      localStorage.setItem('nckprep_schedules', JSON.stringify([...existing, { scheduleId, scheduleName, schedulePhone, scheduleDateTime, scheduleTopic, userEmail, createdAt: new Date().toISOString() }]));
    }

    setIsSubmittingSchedule(false);
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setShowScheduleModal(false);
      setScheduleName('');
      setSchedulePhone('');
      setScheduleDateTime('');
    }, 3500);
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
    <>
      <aside
        id="floating-whatsapp-banner"
        aria-label="WhatsApp Contact Banner"
        className={`fixed top-[70px] sm:top-[72px] right-3 sm:right-6 md:right-8 z-30 max-w-[calc(100vw-1.5rem)] transition-all duration-300 animate-in fade-in slide-in-from-top-2 slide-in-from-right-4 ${
          shouldAnimate ? 'animate-bounce' : ''
        }`}
      >
        <div className="relative group bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl shadow-slate-900/15 border border-emerald-500/40 p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 hover:border-emerald-400 transition-all">
          {/* Recent Response Time Tooltip on Hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-emerald-300 text-[11px] font-extrabold rounded-lg shadow-xl border border-emerald-500/40 whitespace-nowrap z-50 animate-in fade-in">
            <span>⚡ Typical response time: Under 5 minutes</span>
          </div>

          {/* Clickable WhatsApp link trigger with automated query tracking */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* WhatsApp green icon bubble with pulse status */}
            <a
              href={`https://wa.me/${rawNumber}`}
              onClick={handleWhatsAppClick}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Chat with NCKPrep on WhatsApp (0112 294 835)"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-slate-900" />
              </span>
            </a>

            {/* Text & Action Buttons */}
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
              
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${rawNumber}`}
                  onClick={handleWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-black rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <span>Message Us</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowScheduleModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black rounded-lg shadow-sm transition-all cursor-pointer"
                  title="Schedule a consultation call with an NCK expert"
                >
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Schedule Call</span>
                </button>
              </div>
            </div>
          </div>

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

      {/* Schedule Call Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Schedule Consultation Call</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pick your preferred time to speak with our NCK Licensure Expert.</p>
              </div>
            </div>

            {scheduleSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-emerald-900 text-base">Consultation Scheduled Successfully!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  We have received your preferred time slot. An NCK faculty advisor will call or WhatsApp you at the scheduled time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    placeholder="e.g. Nurse Jane Wanjiku"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="^0[0-9]{9}$"
                    value={schedulePhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setSchedulePhone(val);
                    }}
                    placeholder="0712345678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Must be exactly 10 digits and start with 0 (e.g., 0712345678)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Consultation Topic</label>
                  <select
                    value={scheduleTopic}
                    onChange={(e) => setScheduleTopic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
                  >
                    <option value="NCK FQE Licensure Strategy & Revision Guidance">NCK FQE Licensure Strategy & Revision Guidance</option>
                    <option value="Subscription & Payment Assistance">Subscription & Payment Assistance</option>
                    <option value="Clinical Judgment & NGN Case Studies">Clinical Judgment & NGN Case Studies</option>
                    <option value="General Support">General Support</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSchedule}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-extrabold text-white shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmittingSchedule ? 'Booking...' : 'Confirm Call'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
