"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

export interface AdminAuthContextType {
  adminUsername: string;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUsername: "admin",
  logout: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState("");

  // Login form state
  const [usernameInput, setUsernameInput] = useState("admin");
  const [passwordInput, setPasswordInput] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check saved admin session on mount and persist on reload
  useEffect(() => {
    try {
      const savedSessionStr = localStorage.getItem("bidpulse_admin_session");
      if (savedSessionStr) {
        const session = JSON.parse(savedSessionStr);
        if (session?.username && session?.token) {
          setIsAuthenticated(true);
          setAdminUsername(session.username);
        } else {
          localStorage.removeItem("bidpulse_admin_session");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn("Gagal membaca sesi admin:", e);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        const sessionData = {
          username: usernameInput.trim(),
          token: data.token,
          loggedInAt: Date.now(),
        };
        localStorage.setItem("bidpulse_admin_session", JSON.stringify(sessionData));
        setAdminUsername(usernameInput.trim());
        setIsAuthenticated(true);
      } else {
        setErrorMessage(data?.error || "Username atau password admin salah.");
      }
    } catch (err: any) {
      setErrorMessage("Terjadi gangguan koneksi ke server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      try {
        localStorage.removeItem("bidpulse_admin_session");
      } catch {}
      setIsAuthenticated(false);
      setAdminUsername("");
      setPasswordInput("");
    }
  };

  // Loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-500 text-xs font-medium">
        <div className="w-8 h-8 rounded-full border-2 border-[#0066D6] border-t-transparent animate-spin mb-3" />
        <span>Memuat CMS Bidding Plus...</span>
      </div>
    );
  }

  // 1. Unauthenticated: Clean Admin Login Screen matching Public UI/UX
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between p-6 selection:bg-[#0066D6] selection:text-white">
        {/* Top bar back link */}
        <header className="max-w-md mx-auto w-full flex items-center justify-between py-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0066D6] transition group py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
            <span>Kembali ke Web Publik</span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
            Panel Pengelola
          </span>
        </header>

        {/* Center Card */}
        <main className="max-w-md mx-auto w-full my-auto py-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0066D6] text-white mx-auto flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
                <span className="font-black text-lg tracking-tight">BP</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Masuk Admin CMS
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Kelola lot produk, kendalikan timer lelang, dan pantau penawaran Bidding Plus.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Username Administrator
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0066D6] focus:ring-1 focus:ring-[#0066D6] transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0066D6] focus:ring-1 focus:ring-[#0066D6] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0055B8] active:scale-[0.99] text-white shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk ke Panel Admin</span>
                )}
              </button>
            </form>

            {/* Quick credentials hint */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500">
                Default: Username <strong className="text-slate-800 font-mono">admin</strong> · Password <strong className="text-slate-800 font-mono">admin123</strong>
              </span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-md mx-auto w-full text-center text-[11px] text-slate-400 py-2">
          Bidding Plus CMS Controller · Hak Cipta Terlindungi
        </footer>
      </div>
    );
  }

  // 2. Authenticated: Render children inside AdminAuthContext
  return (
    <AdminAuthContext.Provider
      value={{
        adminUsername,
        logout: handleAdminLogout,
      }}
    >
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased selection:bg-[#0066D6] selection:text-white">
        {children}
      </div>
    </AdminAuthContext.Provider>
  );
}
