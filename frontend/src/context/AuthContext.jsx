import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("finpay_token") || null);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile and wallet if token exists
  useEffect(() => {
    async function loadSession() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getMe();
        setUser({
          userId: profile.user_id,
          studentId: profile.student_id,
          email: profile.email,
          fullName: profile.full_name,
        });
        setWallet({
          walletId: profile.wallet_id,
          balance: parseFloat(profile.balance),
        });
      } catch (err) {
        console.error("Session expired or invalid:", err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem("finpay_token", res.access_token);
    setToken(res.access_token);
    setUser({
      userId: res.user_id,
      studentId: res.student_id,
      email: res.email,
      fullName: res.full_name,
    });
    // Fetch wallet
    const w = await api.getWallet();
    setWallet({
      walletId: w.wallet_id,
      balance: parseFloat(w.balance),
    });
    return res;
  };

  const register = async (email, password, fullName) => {
    const res = await api.register({ email, password, full_name: fullName });
    localStorage.setItem("finpay_token", res.access_token);
    setToken(res.access_token);
    setUser({
      userId: res.user_id,
      studentId: res.student_id,
      email: res.email,
      fullName: res.full_name,
    });
    const w = await api.getWallet();
    setWallet({
      walletId: w.wallet_id,
      balance: parseFloat(w.balance),
    });
    return res;
  };

  const logout = () => {
    localStorage.removeItem("finpay_token");
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  const refreshWallet = async () => {
    try {
      const w = await api.getWallet();
      setWallet({
        walletId: w.wallet_id,
        balance: parseFloat(w.balance),
      });
      return w;
    } catch (err) {
      console.error("Failed to refresh wallet:", err);
    }
  };

  const topUpWallet = async (amount) => {
    const res = await api.topUpWallet(amount);
    setWallet({
      walletId: res.wallet_id,
      balance: parseFloat(res.balance),
    });
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        wallet,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshWallet,
        topUpWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
