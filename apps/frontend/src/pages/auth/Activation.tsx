import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { authService } from "../../services/auth";
import { Lock } from "lucide-react";

export function Activation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email")?.trim() ?? "";
    const activationCode = searchParams.get("code")?.trim() ?? "";
    const hasValidInvite = Boolean(email && activationCode);

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

        if (!hasValidInvite) {
            setErrors({ api: "This activation link is invalid or incomplete. Please request a new invitation from your administrator." });
            return;
        }

        if (!validate()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await authService.activate(email, activationCode, password, phoneNumber);

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
            <div className="mb-5 w-full text-center">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Activate your account</h2>
            </div>

            {/* Admin Invite Banner */}
            <div
                className={`mb-5 w-full rounded-xl border px-4 py-3 text-center text-xs leading-normal font-semibold ${
                    hasValidInvite ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]" : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
            >
                {hasValidInvite ? (
                    <>
                        Invited by Administrator <span className="mx-1.5 text-emerald-300">•</span> link valid 72h
                    </>
                ) : (
                    "Activation email and code are missing from this link."
                )}
            </div>

            {errors.api && <div className="mb-4 w-full rounded-xl border border-red-100 bg-red-50 p-3 text-center text-xs font-semibold text-red-600">{errors.api}</div>}

            {successMsg && <div className="mb-4 w-full rounded-xl border border-green-100 bg-green-50 p-3 text-center text-xs font-semibold text-green-700">{successMsg}</div>}

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                {/* Email read-only field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Email</label>
                    <div className="relative">
                        <input
                            type="email"
                            readOnly
                            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-500 outline-none"
                            value={email || "No invitation email provided"}
                        />
                        <Lock className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <span className="mt-1 text-[10px] font-medium text-slate-400">Set by admin — read-only</span>
                </div>

                {/* Set Password field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                        Set password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                            errors.password ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                        placeholder="At least 8 chars, mixed case + number"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading || !hasValidInvite}
                    />
                    {errors.password && <span className="mt-1 text-[10px] leading-normal font-semibold text-red-500">{errors.password}</span>}
                </div>

                {/* Confirm Password field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                        Confirm password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                            errors.confirmPassword ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && <span className="mt-1 text-[10px] font-semibold text-red-500">{errors.confirmPassword}</span>}
                </div>

                {/* Phone Number field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                        Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                            errors.phoneNumber ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                        placeholder="+1 555 000 1234"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoading}
                    />
                    {errors.phoneNumber && <span className="mt-1 text-[10px] font-semibold text-red-500">{errors.phoneNumber}</span>}
                    <span className="mt-1 text-[10px] font-medium text-slate-400">Used for 2-step verification codes.</span>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="mt-1 flex flex-col gap-1">
                    <label className="flex cursor-pointer items-start gap-2.5 select-none">
                        <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-[#2563EB] focus:ring-blue-500"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            disabled={isLoading}
                        />
                        <span className="text-xs leading-normal font-medium text-slate-600">
                            I accept the{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                                Terms of Use
                            </a>{" "}
                            &{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                                Privacy Policy
                            </a>
                        </span>
                    </label>
                    {errors.terms && <span className="mt-1 text-[10px] font-semibold text-red-500">{errors.terms}</span>}
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isLoading || !hasValidInvite}
                    className="mt-2 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                >
                    {isLoading ? "Activating..." : "Activate account"}
                </button>
            </form>
        </AuthLayout>
    );
}
