import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { authService } from "../../services/auth";
import { session } from "../../utils/session";

const OTP_COUNTDOWN = 300; // 5 minutes in seconds — matches backend TTL

export function TwoStepVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    email?: string;
    tempCode?: string;
    phoneHint?: string | null;
  } | null;

  // If no email in state, user arrived without going through login → redirect
  const email = state?.email;
  const phoneHint = state?.phoneHint ?? null;

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timer, setTimer] = useState(OTP_COUNTDOWN);
  const [errors, setErrors] = useState<{ otp?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If arrived without login state, redirect back
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  // Pre-fill OTP from tempCode (demo/testing only)
  useEffect(() => {
    const code = state?.tempCode;
    if (code && code.length === 6 && /^\d{6}$/.test(code)) {
      setOtp(code.split(""));
    }
  }, []); // run once on mount

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ── OTP input handlers ────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // digits only

    const next = [...otp];
    next[idx] = val.slice(-1); // keep last char if multiple pasted somehow
    setOtp(next);

    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace") {
      const next = [...otp];
      if (!otp[idx] && idx > 0) {
        next[idx - 1] = "";
        setOtp(next);
        inputRefs.current[idx - 1]?.focus();
      } else {
        next[idx] = "";
        setOtp(next);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(text)) {
      setOtp(text.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (timer > 0 || isResending || !email) return;

    setIsResending(true);
    setErrors({});

    try {
      const res = await authService.resendOtp(email);
      if (res.success) {
        // Pre-fill new tempCode if returned (demo mode)
        if (res.data?.tempCode) {
          setOtp(res.data.tempCode.split(""));
        } else {
          setOtp(new Array(6).fill(""));
        }
        setTimer(OTP_COUNTDOWN); // restart countdown
        inputRefs.current[0]?.focus();
      } else {
        setErrors({
          api: res.message || "Failed to resend OTP. Please log in again.",
        });
      }
    } catch {
      setErrors({ api: "Failed to connect. Please try again." });
    } finally {
      setIsResending(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrors({ otp: "Please enter all 6 digits" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await authService.verifyOtp(email!, otpString);

      if (res.success && res.data) {
        // AC1: save session — accessToken + refreshToken + user
        session.save(
          res.data.accessToken,
          res.data.refreshToken,
          res.data.user,
        );

        setSuccessMsg("Verified! Redirecting...");

        // AC1: route to role-based dashboard
        setTimeout(() => {
          const roleName = res.data?.user.roleName?.toLowerCase() ?? "";
          if (roleName.includes("admin")) {
            navigate("/dashboard/admin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 1000);
      } else {
        // AC2: reject, no session, allow retry
        setErrors({ api: res.message || "Invalid OTP. Please try again." });
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setErrors({ api: "Failed to connect. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (!email) return null; // redirecting

  return (
    <AuthLayout>
      <div className="mb-6 w-full text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">
          Two-step verification
        </h2>
        <p className="mt-2 px-4 text-xs leading-relaxed font-semibold text-slate-400">
          Enter the 6-digit code sent to your phone
          {phoneHint && (
            <>
              {" "}
              ending in{" "}
              <span className="font-bold text-slate-700">{phoneHint}</span>
            </>
          )}
        </p>
      </div>

      {/* API error */}
      {errors.api && (
        <div className="mb-4 w-full rounded-xl border border-red-100 bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
          {errors.api}
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="mb-4 w-full rounded-xl border border-green-100 bg-green-50 p-3 text-center text-xs font-semibold text-green-700">
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center"
      >
        {/* OTP inputs */}
        <div className="mb-2 flex w-full justify-center gap-2.5">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`h-14 w-12 rounded-xl border text-center text-xl font-bold transition-all outline-none focus:ring-2 ${
                errors.otp
                  ? "border-red-300 focus:ring-red-100"
                  : digit
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          ))}
        </div>

        {errors.otp && (
          <span className="mb-3 text-center text-[10px] font-semibold text-red-500">
            {errors.otp}
          </span>
        )}

        {/* Resend — AC3 */}
        <div className="mt-3 mb-6 text-center text-xs font-bold text-slate-400">
          Didn't get a code?{" "}
          {timer > 0 ? (
            <span className="cursor-not-allowed text-[#2563EB]">
              Resend code ({formatTime(timer)})
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-[#2563EB] hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>

        {/* Verify button */}
        <button
          type="submit"
          disabled={isLoading || otp.join("").length !== 6}
          className="mb-5 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>

        {/* Use different account */}
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          Use a different account
        </button>
      </form>
    </AuthLayout>
  );
}
