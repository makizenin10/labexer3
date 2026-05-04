"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkResetLink = async () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const type = params.get("type");
      if (type === "recovery" && access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error || !data?.session) {
          setMessage("Invalid or expired reset link. Please request a new one.");
        }
      }
    };
    checkResetLink();
  }, []);

  const handleResetPassword = async () => {
    setMessage("");
    setIsSuccess(false);
    if (password !== confirmPassword) { setMessage("Passwords do not match."); return; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage("Password must be 8+ characters with uppercase, lowercase, number, and symbol.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setIsSuccess(true);
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-xl p-10 w-full max-w-sm">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-xs tracking-widest text-gray-400 uppercase">Article Dome</span>
          </div>
          <h1 className="text-2xl font-medium text-black mb-1">Reset password</h1>
          <p className="text-sm text-gray-400">Choose a strong new password for your account.</p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* INPUTS */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
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
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 pr-14 rounded-md border border-gray-200 text-sm text-black outline-none focus:border-gray-400 transition"
            />
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              {showConfirm ? "hide" : "show"}
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <p className={`text-xs mb-3 ${isSuccess ? "text-gray-500" : "text-red-400"}`}>
            {message}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleResetPassword}
          className="w-full bg-black text-white rounded-md py-2.5 px-4 text-sm font-medium flex items-center justify-between hover:bg-gray-900 transition"
        >
          <span>Update password</span>
          <span>→</span>
        </button>

        {/* FOOTER */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <Link href="/login" className="text-xs text-gray-300 hover:text-gray-500 transition">
            ← Back to login
          </Link>
        </div>

      </div>
    </div>
  );
}