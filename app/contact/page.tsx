'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you. A Vesper concierge will reach out to you shortly.');
  };

  return (
    <main className="min-h-screen bg-[#080705] flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-40 px-6">
        <div className="w-full max-w-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl p-12 rounded-sm relative overflow-hidden">
          {/* Accent glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c8622a]/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10">
            <span className="label-text mb-4 block">Acquisition</span>
            <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-[0.3em] mb-8">
              Reserve Your Timepiece
            </h1>
            <p className="text-[#8a8070] font-light mb-12 leading-relaxed">
              Due to the limited nature of the Vesper Equinox (244 pieces), each acquisition is handled personally by our concierge. Please provide your details below to begin the reservation process.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[0.6rem] uppercase tracking-[0.4em] text-[#c8622a]">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 outline-none focus:border-[#c8622a] transition-colors font-light text-white"
                    placeholder="Marcus Vesper"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.6rem] uppercase tracking-[0.4em] text-[#c8622a]">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 outline-none focus:border-[#c8622a] transition-colors font-light text-white"
                    placeholder="marcus@vesper.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.6rem] uppercase tracking-[0.4em] text-[#c8622a]">Interested In</label>
                <select className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 outline-none focus:border-[#c8622a] transition-colors font-light text-white appearance-none">
                  <option className="bg-[#080705]">Vesper Equinox (Limited Edition)</option>
                  <option className="bg-[#080705]">Custom Concierge Request</option>
                  <option className="bg-[#080705]">Technical Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[0.6rem] uppercase tracking-[0.4em] text-[#c8622a]">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 outline-none focus:border-[#c8622a] transition-colors font-light text-white resize-none"
                  placeholder="Tell us about your interest in the Equinox..."
                />
              </div>

              <button type="submit" className="btn w-full py-6 text-lg mt-8 group relative overflow-hidden">
                <span className="relative z-10">Send Reservation Inquiry</span>
                <div className="absolute inset-0 bg-[#c8622a] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
