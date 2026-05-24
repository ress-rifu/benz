"use client";

import { LoginForm } from "./login-form";
import { useLanguage } from "@/lib/language/language-context";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ShieldCheck, Sparkles, TrendingUp, Package, Wrench, Users } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 font-sans relative overflow-hidden">
      {/* Background Decorative Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Left Column: Login Form Panel */}
      <div className="w-full md:w-[45%] lg:w-[40%] min-h-screen flex flex-col justify-between p-5 sm:p-12 md:p-16 z-10 bg-white/70 backdrop-blur-md border-r border-slate-200/80 overflow-y-auto">
        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-8 md:mb-0">
          <img
            src="/logo.webp"
            alt="Benz Automobile Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-xs"
          />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
              Benz Automobile
            </h1>
            <p className="text-[10px] text-amber-600 font-semibold tracking-widest uppercase">Workshop System</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-sm mx-auto my-6 md:my-auto space-y-6 md:space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm">
              Please enter your credentials to access the admin dashboard.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xl shadow-slate-200/30">
            <LoginForm />
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-8 md:mt-0 pt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Benz Automobile.</p>
          <div className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-slate-500">Secure Connection</span>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Brand Panel (Hidden on mobile) */}
      <div className="hidden md:flex md:w-[55%] lg:w-[60%] bg-slate-50/50 relative flex-col justify-between p-16 overflow-hidden border-l border-slate-200/40">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/60 via-transparent to-transparent pointer-events-none" />

        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-amber-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span>Premium Performance Management</span>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="w-full max-w-2xl mx-auto my-auto z-10 relative">
          {/* Glassmorphic Mockup Container */}
          <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            {/* Glossy lighting gradient */}
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.02)_0%,transparent_50%)] pointer-events-none" />

            {/* Dashboard Mock Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <span className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="text-[11px] font-semibold text-slate-400 ml-2">benz-automobile.app/dashboard</span>
              </div>
              <div className="w-20 h-5 rounded-md bg-slate-100" />
            </div>

            {/* Mock Finance/Summary Cards Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs relative overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Revenue (Monthly)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">BDT 450,290</div>
                <p className="text-[9px] text-green-600 mt-1 font-semibold flex items-center gap-0.5">
                  <span>+12.4%</span>
                  <span className="text-slate-400 font-normal">vs last month</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs relative overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Low Stock</span>
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-lg font-bold text-amber-600 tracking-tight">02 Items</div>
                <p className="text-[9px] text-slate-400 mt-1">Requires reorder soon</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs relative overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active Services</span>
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">18 Vehicles</div>
                <p className="text-[9px] text-blue-600 mt-1 font-medium">In workshop queue</p>
              </div>
            </div>

            {/* Mock Charts Area */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-800">Weekly Analytics</h4>
                  <p className="text-[9px] text-slate-400">Service billing rates for current weekdays</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                  <span className="text-[9px] text-slate-500 font-semibold">Revenue</span>
                </div>
              </div>
              {/* Fake visual bar chart graphic */}
              <div className="flex items-end justify-between h-28 pt-2 gap-3 px-2">
                <div className="w-full bg-slate-200/80 rounded-t-xs h-[30%] hover:bg-slate-300 transition-all duration-300" />
                <div className="w-full bg-slate-200/80 rounded-t-xs h-[45%] hover:bg-slate-300 transition-all duration-300" />
                <div className="w-full bg-amber-500 rounded-t-xs h-[85%] hover:bg-amber-600 transition-all duration-300 shadow-xs shadow-amber-500/10" />
                <div className="w-full bg-slate-200/80 rounded-t-xs h-[50%] hover:bg-slate-300 transition-all duration-300" />
                <div className="w-full bg-slate-200/80 rounded-t-xs h-[65%] hover:bg-slate-300 transition-all duration-300" />
                <div className="w-full bg-slate-200/80 rounded-t-xs h-[40%] hover:bg-slate-300 transition-all duration-300" />
                <div className="w-full bg-amber-500 rounded-t-xs h-[95%] hover:bg-amber-600 transition-all duration-300 shadow-xs shadow-amber-500/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Footer Brand Info */}
        <div className="z-10 flex items-center justify-between text-xs text-slate-500">
          <p className="max-w-md leading-relaxed">
            Designed for automotive professionals. Drive workshop efficiency, track inventory in real-time, and manage customer relations seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
}

