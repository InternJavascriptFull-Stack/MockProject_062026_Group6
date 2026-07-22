import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { authService } from "../../services/auth";
import { session } from "../../utils/session";

export function Login() {
    const navigate = useNavigate();
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [demoCode, setDemoCode] = useState<string | null>(null);

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        const cleanEmail = emailOrPhone.trim();

        if (!cleanEmail) {
            newErrors.email = "Email or Phone number is required";
        } else if (cleanEmail.includes("@")) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                newErrors.email = "Email format must be valid (e.g. admin@facility.org)";
            }
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDemoCode(null);

        if (!validate()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const cleanEmail = emailOrPhone.trim();
            const response = await authService.login(cleanEmail, password);

            if (response.success && response.data) {
                if (response.data.accessToken && response.data.refreshToken && response.data.user) {
                    session.save(response.data.accessToken, response.data.refreshToken, response.data.user);

                    const roleName = response.data.user.roleName?.toLowerCase() ?? "";
                    navigate(roleName.includes("admin") ? "/admin/users" : "/dashboard", {
                        replace: true,
                    });
                    return;
                }

                if (response.data.twoStepRequired) {
                    // Show demo OTP briefly before redirecting
                    if (response.data.tempCode) {
                        setDemoCode(response.data.tempCode);
                    }

                    setTimeout(
                        () => {
                            navigate("/verify-otp", {
                                state: {
                                    email: response.data?.email || emailOrPhone,
                                    tempCode: response.data?.tempCode,
                                },
                            });
                        },
                        response.data.tempCode ? 2000 : 0,
                    );
                }
            } else {
                setErrors({ api: response.message || "Invalid email or password" });
            }
        } catch (err) {
            setErrors({ api: "Failed to connect to authentication server. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="mb-6 w-full text-center">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Sign in to NHMS</h2>
                <p className="mt-1 text-xs font-medium text-slate-400">Nursing Home Management System</p>
            </div>

            {errors.api && <div className="mb-4 w-full rounded-xl border border-red-100 bg-red-50 p-3 text-center text-xs font-semibold text-red-600">{errors.api}</div>}

            {demoCode && (
                <div className="mb-4 w-full rounded-xl border border-green-100 bg-green-50 p-3 text-center text-xs font-semibold text-green-700">
                    Demo OTP Code: <span className="font-mono text-sm tracking-widest">{demoCode}</span> (Redirecting...)
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                {/* Email or Phone field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Email or Phone</label>
                    <input
                        type="text"
                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                            errors.email ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                        placeholder="name@facility.org or +1 555 000 1234"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        disabled={isLoading}
                    />
                    {errors.email && <span className="mt-1 text-[10px] font-semibold text-red-500">{errors.email}</span>}
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Password</label>
                        <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">
                            Forgot password?
                        </a>
                    </div>
                    <input
                        type="password"
                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                            errors.password ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    {errors.password && <span className="mt-1 text-[10px] font-semibold text-red-500">{errors.password}</span>}
                </div>

                {/* Sign In Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                >
                    {isLoading ? "Signing In..." : "Sign In"}
                </button>
            </form>

            {/* Footer Info */}
            <div className="mt-8 px-2 text-center text-[10px] leading-relaxed font-medium text-slate-400">
                Accounts are provisioned by your administrator.
                <br />
                Need access?{" "}
                <a href="#" className="font-bold text-blue-600 hover:underline">
                    Contact your NHMS admin.
                </a>
            </div>
        </AuthLayout>
    );
}
