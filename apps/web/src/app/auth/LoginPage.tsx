// LoginPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../supabase/supabase.server";
import { useAuth } from "../../context/AuthContextProvider";

type LoginStep = "email" | "otp";

export default function LoginPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (userId) {
      navigate("/projects", { replace: true });
    }
  }, [userId, navigate]);

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    setIsPending(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    setIsPending(false);

    if (error) {
      setMessage(`Unable to send login code: ${error.message}`);
      return;
    }

    setStep("otp");
  };

  const requestOtp = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendOtp();
  };

  const verifyOtp = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedOtp = otp.replace(/\s/g, "");

    if (!normalizedOtp) {
      setMessage("Please enter the verification code.");
      return;
    }

    setIsPending(true);
    setMessage(null);

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: normalizedOtp,
      type: "email",
    });

    setIsPending(false);

    if (error) {
      console.log(error.message);
      setMessage(`
        This verification code is invalid or has expired. 
        Please check it and try again or request a new code.
      `);

      return;
    }

    // The Supabase auth state listener in AuthContextProvider should update
    // userId. The useEffect above then navigates to /projects.
  };

  const resetEmail = () => {
    setStep("email");
    setOtp("");
    setMessage(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-md dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {step === "email" ? "Sign in to your account" : "Check your email"}
          </h1>

          {step === "otp" && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              We sent a verification code to{" "}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {email}
              </span>
              .
            </p>
          )}
        </div>

        {message && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {message}
            </p>
          </div>
        )}

        {step === "email" ? (
          <form className="space-y-6" onSubmit={requestOtp}>
            <div>
              <label
                htmlFor="email-address"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>

              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isPending ? "Sending code..." : "Send login code"}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={verifyOtp}>
            <div>
              <label
                htmlFor="otp"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Verification code
              </label>

              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, ""));
                }}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-xl tracking-[0.4em] text-gray-950 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isPending ? "Verifying..." : "Verify and log in"}
            </button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={resetEmail}
                disabled={isPending}
                className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 dark:text-indigo-400"
              >
                Change email
              </button>

              <button
                type="button"
                onClick={() => void sendOtp()}
                disabled={isPending}
                className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 dark:text-indigo-400"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}