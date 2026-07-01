import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";

import TextInput from "@/components/textInput";
import LoginHeader from "@/pages/login/loginHeader";
import LoginFooter from "@/pages/login/loginFooter";

import LockIcon from "@/assets/images/lockIcon.png";

export default function ForgotPass() {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    void navigate(APP_ROUTES.ENTER_NEW_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-10">
        <LoginHeader />

        <main className="flex flex-1 items-center justify-center py-6 sm:py-10">
          <section className="w-full max-w-[520px] rounded-[20px] bg-white p-6 shadow-[0px_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-[96px] bg-gradient-to-b from-sky-100/50 via-sky-100/0 to-sky-100/0 p-4 outline outline-1 outline-offset-[-1px] outline-sky-100">
                <div className="flex items-center justify-center rounded-[96px] bg-white p-3.5 shadow-[0px_2px_4px_0px_rgba(179,212,253,0.04)] outline outline-1 outline-offset-[-1px] outline-blue-200">
                  <img
                    src={LockIcon}
                    alt="Lock Icon"
                    className="block h-[24px] w-[24px] object-contain object-center"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl leading-8 font-semibold text-zinc-950 sm:text-[28px] sm:leading-9">
                  Forgot Password
                </h1>
                <p className="max-w-md text-sm leading-6 tracking-tight text-gray-500 sm:text-base">
                  Enter your email address and we’ll send you password reset
                  instructions.
                </p>
              </div>
            </div>

            <form className="mt-8 flex flex-col gap-4">
              <TextInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
              />

              <button
                type="submit"
                onClick={handleForgotPassword}
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-slate-700 px-4 py-2 text-base leading-6 font-semibold tracking-tight text-white shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none"
              >
                Forgot Password
              </button>

              <p className="text-center text-sm leading-6 tracking-tight text-gray-500 sm:text-base">
                Don’t have access anymore?{" "}
                <button
                  type="button"
                  className="cursor-pointer font-semibold text-sky-800 transition-colors hover:text-sky-900"
                >
                  Try another method
                </button>
              </p>
            </form>
          </section>
        </main>

        <LoginFooter />
      </div>
    </div>
  );
}
