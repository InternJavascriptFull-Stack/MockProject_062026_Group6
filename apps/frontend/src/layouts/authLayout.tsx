import { Outlet } from "react-router-dom";
import { HeartPulse, Quote } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen min-w-full">
      {/* Left Marketing Banner */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              CareNest
            </h1>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Senior Living
            </p>
          </div>
        </div>

        {/* Marketing Copy */}
        <div className="max-w-md">
          <h2 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-50">
            Elevating the <br /> standard of senior <br /> care.
          </h2>
          <p className="text-lg leading-relaxed text-slate-400">
            An intuitive, role-based platform designed to simplify daily operations and bring peace of mind to staff and families alike.
          </p>
        </div>

        {/* Testimonial Quote */}
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <Quote className="mb-4 h-8 w-8 text-emerald-400 opacity-50" />
          <p className="mb-6 text-sm italic leading-relaxed text-slate-300">
            "CareNest has completely transformed how our nurses and administrative staff coordinate. Everything is just one click away."
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-semibold text-sm">
              SJ
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Dr. Sarah Jenkins
              </p>
              <p className="text-xs text-slate-500">Chief Medical Officer</p>
            </div>
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute -left-[20%] top-1/4 h-[500px] w-[500px] rounded-full bg-blue-900/20 blur-[120px]" />
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex w-full items-center justify-center bg-slate-50 p-8 lg:w-1/2">
        <div className="w-full max-w-[420px]">
          <Outlet />
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              CareNest demo only. Real authentication will connect to the NestJS JWT backend and HttpOnly cookies later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
