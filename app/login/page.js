"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); return; }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role === "admin") {
      await supabase.auth.signOut();
      setMessage("You are an admin. Please use the Admin Login page.");
      return;
    }
    router.push("/dashboard");
  };

  const handleForgotPassword = async () => {
    if (!email) { setMessage("Please enter your email address first."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setMessage(error.message);
    else setMessage("Password reset email sent! Check your inbox.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-xl p-10 w-full max-w-sm">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-xs tracking-widest text-gray-400 uppercase">Article Dome</span>
          </div>
          <h1 className="text-2xl font-medium text-black mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400">Sign in to your account to continue.</p>
        </div>

        <hr className="border-gray-100 mb-6" />

        <div className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 text-sm text-black outline-none focus:border-gray-400 transition"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-14 rounded-md border border-gray-200 text-sm text-black outline-none focus:border-gray-400 transition"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>
        </div>

        {message && <p className="text-xs text-red-400 mb-3">{message}</p>}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white rounded-md py-2.5 px-4 text-sm font-medium flex items-center justify-between hover:bg-gray-900 transition"
          >
            <span>Login</span>
            <span>→</span>
          </button>
          <button
            onClick={handleForgotPassword}
            className="w-full bg-white text-gray-400 border border-gray-100 rounded-md py-2.5 px-4 text-sm hover:bg-gray-50 transition text-left"
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            No account?{" "}
            <Link href="/signup" className="text-black font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <Link href="/" className="text-xs text-gray-300 hover:text-gray-500 transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}