const API_BASE = "http://127.0.0.1:8000/api/v1";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("finpay_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  // Student Profile
  getMe: () => request("/students/me"),

  // Wallet
  getWallet: () => request("/wallet"),
  topUpWallet: (amount) => request("/wallet/topup", { method: "POST", body: JSON.stringify({ amount }) }),

  // Merchants
  getCategories: () => request("/merchant-categories"),
  getMerchants: (categoryId) => request(`/merchants${categoryId ? `?category_id=${categoryId}` : ""}`),
  getMerchant: (merchantId) => request(`/merchants/${merchantId}`),

  // Payments
  createPayment: (body) => request("/payments", { method: "POST", body: JSON.stringify(body) }),
  getPayments: () => request("/payments"),
  getPayment: (paymentId) => request(`/payments/${paymentId}`),

  // Cashback
  getCashback: () => request("/cashback"),

  // Reconciliation
  getReconciliationRuns: () => request("/reconciliation/runs"),
  createReconciliationRun: (body) => request("/reconciliation/runs", { method: "POST", body: JSON.stringify(body) }),
};
