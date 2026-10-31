import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2, Award, Sparkles, GraduationCap } from 'lucide-react';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  schoolOrHospital: string;
  examPassed: string;
  scoreOrResult: string;
  avatar: string;
  rating: number;
  text: string;
  highlight: string;
  date: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Faith Wanjiru, KRCHN, RN',
    role: 'Critical Care Nurse',
    schoolOrHospital: 'Kenyatta National Hospital & KMTC Nairobi',
    examPassed: 'NCK Registered Nurse (RN) FQE',
    scoreOrResult: 'Passed NCK FQE on 1st Attempt',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    text: 'Preparing for the NCK final qualifying examination was intense. NCKPrep AI gave me the exact clinical case studies, pharmacology modules, and NCK-style multiple-choice questions needed to master nursing concepts. Passed with distinction on my first try!',
    highlight: 'Mastered NCK standards with distinction',
    date: '2 weeks ago'
  },
  {
    id: '2',
    name: 'Brian Kiprop, BScN',
    role: 'Staff Nurse',
    schoolOrHospital: 'Moi Teaching & Referral Hospital',
    examPassed: 'NCK Registered Nurse (RN) FQE',
    scoreOrResult: '96% Mock Pass Rate / Passed FQE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    text: 'The NCK predictor adaptive tests and rationale breakdowns simulated the exact exam environment. Walking into the NCK Licensure exam hall felt effortless because of the rigorous practice.',
    highlight: 'Zero test anxiety on exam day',
    date: '3 weeks ago'
  },
  {
    id: '3',
    name: 'Mary Njeri, KRCHN',
    role: 'Community Health Nurse',
    schoolOrHospital: 'University of Nairobi',
    examPassed: 'NCK Community Health & RN FQE',
    scoreOrResult: 'Passed First Attempt',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    text: 'I recommend NCKPrep AI to every nursing student in Kenya. The 3,000 KSh all-inclusive pass gave me full access to thousands of NCK questions and video reviews. Absolutely worth every shilling!',
    highlight: 'The best NCK preparation platform in Kenya',
    date: '1 month ago'
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-15 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4 text-emerald-400" />
            Verified Kenyan Nursing Success Stories
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Trusted by Final-Year Nurses Across Kenya
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            See how KMTC, University of Nairobi, and Moi University nursing candidates successfully passed their NCK Licensure & FQE examinations.
          </p>
        </div>

        {/* Carousel Card Container */}
        <div 
          className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 md:p-12 shadow-2xl"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="absolute top-6 right-8 text-slate-700/60 pointer-events-none">
            <Quote className="w-24 h-24 stroke-[1.5]" />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10"
            >
              {/* Left Author Profile */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                <div className="relative">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{current.name}</h3>
                  <p className="text-xs text-emerald-400 font-bold">{current.role}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{current.schoolOrHospital}</p>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl text-xs font-bold text-amber-300">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {current.examPassed}
                </div>
              </div>

              {/* Right Quote & Details */}
              <div className="lg:col-span-8 space-y-6">
                {/* Rating Stars */}
                <div className="flex items-center justify-center lg:justify-start gap-1">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {current.scoreOrResult}
                  </span>
                </div>

                {/* Highlight Badge */}
                <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg text-xs font-extrabold uppercase tracking-wide">
                  "{current.highlight}"
                </div>

                {/* Main Quote Text */}
                <p className="text-base md:text-lg text-slate-200 leading-relaxed font-medium italic">
                  "{current.text}"
                </p>

                <div className="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Verified NCK Licensure Candidate</span>
                  <span>{current.date}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === idx ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrow Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
