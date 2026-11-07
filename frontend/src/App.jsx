import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { WalletPage } from "./pages/WalletPage";
import { MerchantsPage } from "./pages/MerchantsPage";
import { PaymentPage } from "./pages/PaymentPage";
import { HistoryPage } from "./pages/HistoryPage";
import { CashbackPage } from "./pages/CashbackPage";
import { ReconciliationPage } from "./pages/ReconciliationPage";
import { ShieldCheck, Heart } from "lucide-react";

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [preselectedMerchantId, setPreselectedMerchantId] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div className="logo-badge" style={{ margin: "0 auto 1rem", animation: "pulse 1.5s infinite" }}>
            FP
          </div>
          <div style={{ color: "var(--gray-600)", fontWeight: "600" }}>Loading FinPay Secure Session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleSelectMerchantForPayment = (merchantId) => {
    setPreselectedMerchantId(merchantId);
    setActiveTab("payment");
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === "dashboard" && (
          <Dashboard
            setActiveTab={setActiveTab}
            onSelectMerchantForPayment={handleSelectMerchantForPayment}
          />
        )}
        {activeTab === "wallet" && <WalletPage />}
        {activeTab === "merchants" && (
          <MerchantsPage
            onSelectMerchantForPayment={handleSelectMerchantForPayment}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "payment" && (
          <PaymentPage
            preselectedMerchantId={preselectedMerchantId}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "history" && <HistoryPage />}
        {activeTab === "cashback" && <CashbackPage />}
        {activeTab === "reconciliation" && <ReconciliationPage />}
      </main>

      <footer style={{ background: "var(--white)", borderTop: "1px solid var(--gray-200)", padding: "1.5rem", marginTop: "auto", textAlign: "center", fontSize: "0.85rem", color: "var(--gray-500)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ShieldCheck size={16} color="var(--success)" />
            <strong>FinPay Student Digital Wallet</strong> • Approved Lab 4 Detailed Design Compliant
          </div>
          <div>
            FastAPI Backend • SQLite Simple DB • React & Vite Frontend
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
