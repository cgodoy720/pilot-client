import axios, { type AxiosInstance } from "axios";

/**
 * API client for the FastAPI backend (financial_forecasting/main.py).
 *
 * In dev, Vite proxies /api/* → http://localhost:8000 (see vite.config.ts).
 * In prod, set VITE_API_URL to point at the deployed backend.
 *
 * Auth: cookie-based, mirroring the legacy CRA frontend at
 * `financial_forecasting/frontend/src/services/api.ts`. The backend reads
 * `access_token` from cookies (auth.py:65). `withCredentials: true` makes
 * the browser include cookies on cross-origin requests so production
 * deployments work the same as dev (where the Vite proxy makes everything
 * same-origin anyway).
 */
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
