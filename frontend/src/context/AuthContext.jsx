import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// Single-row lookup in user_roles. Returns true iff role=admin.
async function queryIsAdmin(userId) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("user_roles query error", error);
    return false;
  }
  return data?.role === "admin";
}

// One short retry absorbs the JWT-hydration race right after a reload.
async function resolveIsAdmin(userId) {
  const first = await queryIsAdmin(userId);
  if (first) return true;
  await new Promise((r) => setTimeout(r, 400));
  return await queryIsAdmin(userId);
}

export const AuthProvider = ({ children }) => {
  // undefined = not yet resolved, null = signed out, Session = signed in.
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  // 1) Subscribe to auth changes. CRITICAL: do NOT await any supabase.from()
  //    calls inside this callback — supabase-js v2 holds an auth lock while
  //    the callback runs, which deadlocks PostgREST (issue #741). Only fast,
  //    synchronous work here.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) Resolve the admin role outside the listener so we don't hold the lock.
  useEffect(() => {
    if (session === undefined) return; // auth not resolved yet
    let cancelled = false;
    const userId = session?.user?.id;
    setAdminChecked(false);

    if (!userId) {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }

    (async () => {
      try {
        const admin = await resolveIsAdmin(userId);
        if (!cancelled) setIsAdmin(admin);
      } catch (e) {
        console.warn("resolveIsAdmin failed", e);
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setAdminChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // Loading until the auth listener has reported AND the role check has run.
  const loading = session === undefined || !adminChecked;

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{
        session: session ?? null,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
