import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LOGO_URL } from "../lib/supabase";
import { toast } from "sonner";

export default function AdminLogin() {
  const nav = useNavigate();
  const { signIn, session, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session && isAdmin) nav("/admin");
  }, [session, isAdmin, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
  };

  return (
    <div
      className="min-h-screen bg-[#F5E6B8] flex items-center justify-center px-4"
      data-testid="admin-login-page"
    >
      <div className="w-full max-w-md bg-[#FAF6EA] rounded-2xl border border-[#E8D8A7] shadow-xl p-8">
        <Link to="/" className="flex justify-center mb-6">
          <img src={LOGO_URL} alt="SweetNest" className="h-20 w-auto" />
        </Link>
        <h1 className="font-serif text-3xl text-[#5C1A0B] text-center">
          Admin Access
        </h1>
        <p className="text-sm text-[#8A412A] text-center mt-1 mb-6">
          Sign in to manage SweetNest.
        </p>

        <form onSubmit={submit} className="space-y-3" data-testid="admin-auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white rounded-lg px-3 py-2.5 border border-[#E8D8A7] focus:outline-none focus:border-[#5C1A0B]"
            required
            data-testid="admin-email-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white rounded-lg px-3 py-2.5 border border-[#E8D8A7] focus:outline-none focus:border-[#5C1A0B]"
            required
            minLength={6}
            data-testid="admin-password-input"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full btn-primary rounded-full py-2.5 font-medium disabled:opacity-60"
            data-testid="admin-submit-btn"
          >
            {busy ? "Please wait…" : "Sign In"}
          </button>
        </form>

        {session && !isAdmin && (
          <div
            className="mt-4 text-xs text-[#5C1A0B] bg-[#F5E6B8] rounded-lg p-3"
            data-testid="not-admin-warning"
          >
            Signed in but this account is not an admin.
          </div>
        )}
      </div>
    </div>
  );
}
