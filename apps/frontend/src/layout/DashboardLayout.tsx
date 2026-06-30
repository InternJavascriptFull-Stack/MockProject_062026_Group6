import React from "react";

import { Header } from "../components/Header";
import  Footer  from "../components/Footer";
import Sidebar from "@/components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="ml-[90px] flex flex-1 flex-col">
        <Header />
        <main className="flex-1 px-8 py-2">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
