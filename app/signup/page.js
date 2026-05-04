"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setMessage("Please fill in all fields before signing up.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: data.user.id, email, full_name: fullName, role: "user" }]);
        if (profileError) {
          setMessage("Signup successful but profile save failed: " + profileError.message);
        } else {
          setMessage("Sign up successful! Check your email for confirmation.");
        }
      } else {
        setMessage("Sign up successful! Check your email for confirmation.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-xl p-10 w-full max-w-sm">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-xs tracking-widest text-gray-400 uppercase">Article Space</span>
          </div>
          <h1 className="text-2xl font-medium text-black mb-1">Create an account</h1>
          <p className="text-sm text-gray-400">Sign up to start publishing articles.</p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* INPUTS */}
        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 text-sm text-black outline-none focus:border-gray-400 transition"
          />
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

        {/* MESSAGE */}
        {message && <p className="text-xs text-red-400 mb-3">{message}</p>}

        {/* BUTTON */}
        <button
          onClick={handleSignUp}
          className="w-full bg-black text-white rounded-md py-2.5 px-4 text-sm font-medium flex items-center justify-between hover:bg-gray-900 transition"
        >
          <span>Sign up</span>
          <span>→</span>
        </button>

        {/* FOOTER */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            Have an account?{" "}
            <Link href="/login" className="text-black font-medium hover:underline">
              Login
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