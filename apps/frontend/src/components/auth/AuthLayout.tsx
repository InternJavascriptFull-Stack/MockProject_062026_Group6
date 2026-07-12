import { LogoIcon } from "@/icon";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans antialiased">
      <div className="w-full max-w-[480px] bg-white border border-slate-100 rounded-[24px] shadow-sm p-8 md:p-10 flex flex-col items-center">
        {/* Logo */}
        <LogoIcon></LogoIcon>
        {children}
      </div>
    </div>
  );
}
