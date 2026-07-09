import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { authService } from "../../services/auth";
import { Lock } from "lucide-react";

export function Activation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Grab email and activation code from URL or fallback to demo values matching mockups
  const email = searchParams.get("email") || "j.rivera@facility.org";
  const activationCode = searchParams.get("code") || "ACT123";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
    terms?: string;
    api?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validate = () => {
    const newErrors: typeof errors = {};

    // Password validation (min 8 chars, mixed case, number)
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordRegex.test(password)) {
        newErrors.password = "Password must contain mixed case (uppercase and lowercase) and at least one number";
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the Terms of Use & Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.activate(
        email,
        activationCode,
        password,
        phoneNumber
      );

      if (response.success) {
        setSuccessMsg("Account activated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrors({ api: response.message || "Failed to activate account. Please check your details." });
      }
    } catch (err) {
      setErrors({ api: "Failed to connect to authentication server. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full text-center mb-5">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Activate your account</h2>
      </div>

      {/* Admin Invite Banner */}
      <div className="w-full mb-5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] rounded-xl px-4 py-3 text-xs font-semibold text-center leading-normal">
        Invited by Administrator <span className="text-emerald-300 mx-1.5">•</span> link valid 72h
      </div>

      {errors.api && (
        <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold text-center">
          {errors.api}
        </div>
      )}

      {successMsg && (
        <div className="w-full mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs font-semibold text-center">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Email read-only field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700">Email</label>
          <div className="relative">
            <input
              type="email"
              readOnly
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-500 outline-none cursor-not-allowed"
              value={email}
            />
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">Set by admin — read-only</span>
        </div>

        {/* Set Password field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700">Set password <span className="text-red-500">*</span></label>
          <input
            type="password"
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all ${
              errors.password
                ? "border-red-300 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
            placeholder="At least 8 chars, mixed case + number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {errors.password && <span className="text-[10px] text-red-500 font-semibold mt-1 leading-normal">{errors.password}</span>}
        </div>

        {/* Confirm Password field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700">Confirm password <span className="text-red-500">*</span></label>
          <input
            type="password"
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all ${
              errors.confirmPassword
                ? "border-red-300 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className="text-[10px] text-red-500 font-semibold mt-1">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Phone Number field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700">Phone number <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all ${
              errors.phoneNumber
                ? "border-red-300 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
            placeholder="+1 555 000 1234"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
          {errors.phoneNumber && <span className="text-[10px] text-red-500 font-semibold mt-1">{errors.phoneNumber}</span>}
          <span className="text-[10px] text-slate-400 font-medium mt-1">Used for 2-step verification codes.</span>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex flex-col gap-1 mt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={isLoading}
            />
            <span className="text-xs text-slate-600 font-medium leading-normal">
              I accept the <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> & <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <span className="text-[10px] text-red-500 font-semibold mt-1">{errors.terms}</span>}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-blue-500/10 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {isLoading ? "Activating..." : "Activate account"}
        </button>
      </form>
    </AuthLayout>
  );
}
