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
    <div className="w-full h-screen h-[100dvh] min-h-[100dvh] bg-white md:bg-[#E2E8F0]/70 flex flex-col justify-start md:justify-center md:items-center p-0 md:py-6 selection:bg-blue-500 selection:text-white antialiased overflow-hidden">
      {/* Container Web Mobile (Fullscreen 100% di HP smartphone, mockup frame di Desktop) */}
      <main className="w-full max-w-full md:max-w-[430px] h-full h-screen h-[100dvh] md:h-[880px] md:max-h-[94vh] bg-white flex flex-col overflow-hidden md:rounded-2xl md:shadow-xl md:border md:border-slate-200/90 relative">
        <div className="flex-1 w-full h-full flex flex-col overflow-hidden relative bg-white">
          {children}
        </div>
      </main>
    </div>
  );
}

