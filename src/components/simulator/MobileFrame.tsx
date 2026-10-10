"use client";

import React from "react";

interface MobileFrameProps {
  children: React.ReactNode;
  roomTitle?: string;
  activeScreen?: string;
  onNavigateScreen?: (screen: any) => void;
  onAndroidBack?: () => void;
  onAndroidHome?: () => void;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-[#F1F5F9] md:bg-[#E2E8F0]/70 flex items-center justify-center p-0 md:py-6 selection:bg-blue-500 selection:text-white antialiased">
      {/* Container Web Mobile (Cukupan web bentuk mobile, clean tanpa frame handphone) */}
      <main className="w-full max-w-[430px] h-[100dvh] md:h-[880px] md:max-h-[94vh] bg-white flex flex-col overflow-hidden md:rounded-2xl md:shadow-xl md:border md:border-slate-200/90 relative">
        <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
          {children}
        </div>
      </main>
    </div>
  );
}

