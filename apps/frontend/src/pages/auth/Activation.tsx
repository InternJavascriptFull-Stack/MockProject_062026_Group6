import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/auth";
import { Lock, Mail, Phone, Check, X, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";

export function Activation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [hasValidInvite, setHasValidInvite] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
    api?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const queryEmail = searchParams.get("email")?.trim() ?? "";
    const queryCode = searchParams.get("code")?.trim() ?? "";
    const queryToken = searchParams.get("token")?.trim() ?? "";

    if (queryEmail && queryCode) {
      setEmail(queryEmail);
      setActivationCode(queryCode);
      setHasValidInvite(true);
      setIsLoading(false);
    } else if (queryToken) {
      setIsLoading(true);
      setErrors({});
      authService.getActivateContext(queryToken)
        .then((res) => {
          if (res.success && res.data) {
            setEmail(res.data.email);
            setActivationCode(queryToken);
            setHasValidInvite(true);
            if (res.data.phoneNumber) {
              setPhoneNumber(res.data.phoneNumber);
            }
          } else {
            setErrors({ api: res.message || "This invitation link is invalid or incomplete. Please request a new invitation from your administrator." });
          }
        })
        .catch((err: any) => {
          setErrors({ api: err.message || "Failed to validate activation token." });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setHasValidInvite(false);
      setIsLoading(false);
    }
  }, [searchParams]);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[\W_]/.test(password),
  };

  const isPasswordStrong = Object.values(rules).every(Boolean);

  const validatePhone = (phone: string) => {
    // E.164 format: Optional plus sign, followed by 7 to 15 digits
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phone.replace(/\s+/g, ""));
  };

  const handleValidation = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordStrong) {
      newErrors.password = "Password does not meet all security requirements";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number. Must be in E.164 format (e.g. +15551234567)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasValidInvite) {
      setErrors({ api: "This invitation link is invalid or incomplete. Please request a new invitation from your administrator." });
      return;
    }

    if (!handleValidation()) return;

    setIsLoading(true);
    setErrors({});

    let normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");
    if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    try {
      const response = await authService.activate(email, activationCode, password, normalizedPhone);

      if (response.success) {
        setIsSuccess(true);
      } else {
        setErrors({ api: response.message || "Failed to activate account. The invitation link may have expired." });
      }
    } catch (err) {
      setErrors({ api: "Failed to connect to authentication server. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans antialiased">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-[24px] shadow-xl p-8 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Account Activated Successfully</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Your account is now active. You can now sign in using your email address or phone number.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 p-4 md:p-8 font-sans antialiased">
      <div className="w-full max-w-5xl bg-white border border-slate-100 rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[640px]">
        
        {/* Left Side: Illustration Panel */}
        <div className="w-full lg:w-1/2 bg-blue-50/50 p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">C</div>
              <span className="font-bold text-slate-800 tracking-tight text-lg">CareSync</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-4">
              Nursing Home Management System
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              Secure, efficient administrative management platform designed specifically for nursing homes, care centers, and clinical facilities.
            </p>
          </div>

          <div className="my-8 flex justify-center items-center">
            <img 
              src="/activation_illustration.jpg" 
              alt="Account Activation Process"
              className="max-h-[300px] w-auto object-contain rounded-2xl shadow-sm mix-blend-multiply"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span>Enterprise Grade Security</span>
            <span>•</span>
            <span>2-Step Verification Ready</span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Activate Your Account</h2>
            <p className="text-slate-500 text-sm mt-1">
              Complete your account setup to access the system.
            </p>
          </div>

          {/* Invitation validation check */}
          {!hasValidInvite && !isLoading && (
            <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <h4 className="font-bold text-sm">Invalid or Expired Activation Link</h4>
                <p className="text-xs text-rose-600/90 mt-0.5">
                  The link you followed is missing required parameters or may have expired. Please verify your activation email or request a new one from your admin.
                </p>
              </div>
            </div>
          )}

          {errors.api && (
            <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
              <p className="text-xs font-medium leading-relaxed">{errors.api}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-500 outline-none cursor-not-allowed"
                  value={email || "No invitation email provided"}
                />
                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
                  Read-only
                </span>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  className={`w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-all outline-none focus:ring-2 ${
                    errors.password ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !hasValidInvite}
                />
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.password && <p className="text-[10px] font-bold text-rose-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  className={`w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-all outline-none focus:ring-2 ${
                    errors.confirmPassword ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !hasValidInvite}
                />
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.confirmPassword && <p className="text-[10px] font-bold text-rose-500">{errors.confirmPassword}</p>}
            </div>

            {/* Password Requirements Panel */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password Security Requirements</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all ${rules.length ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className={`text-xs ${rules.length ? "text-slate-800 font-semibold" : "text-slate-400"}`}>Min 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all ${rules.uppercase ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className={`text-xs ${rules.uppercase ? "text-slate-800 font-semibold" : "text-slate-400"}`}>1 Uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all ${rules.lowercase ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className={`text-xs ${rules.lowercase ? "text-slate-800 font-semibold" : "text-slate-400"}`}>1 Lowercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all ${rules.number ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className={`text-xs ${rules.number ? "text-slate-800 font-semibold" : "text-slate-400"}`}>1 Number</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all ${rules.special ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className={`text-xs ${rules.special ? "text-slate-800 font-semibold" : "text-slate-400"}`}>1 Special character (!@#$%^& etc.)</span>
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-all outline-none focus:ring-2 ${
                    errors.phoneNumber ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="+15551234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading || !hasValidInvite}
                />
                <Phone className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.phoneNumber ? (
                <p className="text-[10px] font-bold text-rose-500">{errors.phoneNumber}</p>
              ) : (
                <p className="text-[10px] text-slate-400 font-medium">Format: E.164 (e.g., +15551234567) - used for two-step OTP verification codes</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !hasValidInvite}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Activating Account..." : "Activate Account"}
            </button>
          </form>

          {/* Secondary Link: Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
