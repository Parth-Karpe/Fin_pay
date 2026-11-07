import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Wallet, 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  History, 
  Gift, 
  FileCheck2, 
  LogOut, 
  GraduationCap 
} from "lucide-react";

export function Navbar({ activeTab, setActiveTab }) {
  const { user, wallet, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="logo-section" onClick={() => setActiveTab("dashboard")} style={{ cursor: "pointer" }}>
          <div className="logo-badge">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="logo-text">FinPay</div>
            <div className="logo-subtext">Student Digital Wallet</div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={17} /> Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            <Wallet size={17} /> Wallet
          </button>
          <button
            className={`nav-btn ${activeTab === "merchants" ? "active" : ""}`}
            onClick={() => setActiveTab("merchants")}
          >
            <Store size={17} /> Merchants
          </button>
          <button
            className={`nav-btn ${activeTab === "payment" ? "active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            <CreditCard size={17} /> Pay Now
          </button>
          <button
            className={`nav-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <History size={17} /> History
          </button>
          <button
            className={`nav-btn ${activeTab === "cashback" ? "active" : ""}`}
            onClick={() => setActiveTab("cashback")}
          >
            <Gift size={17} /> Cashback
          </button>
          <button
            className={`nav-btn ${activeTab === "reconciliation" ? "active" : ""}`}
            onClick={() => setActiveTab("reconciliation")}
          >
            <FileCheck2 size={17} /> Reconciliation
          </button>
        </nav>

        <div className="user-profile-badge">
          <div className="user-chip">
            <span className="user-name">{user?.fullName || "Student"}</span>
            <span className="user-balance">
              ${wallet ? wallet.balance.toFixed(2) : "0.00"}
            </span>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign Out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
