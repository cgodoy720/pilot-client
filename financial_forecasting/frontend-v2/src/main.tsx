import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Long stale time + persistent cache means navigation between
      // pages reuses fetched data instantly. Mutations + onSettled
      // refetch keep things fresh.
      staleTime: 60_000,
      gcTime: 24 * 60 * 60 * 1000, // 24h — needed for persister to keep the data
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "bedrock-v2:rq-cache",
  // 5 MiB cap (default is 5 MB). Accounts + opps payloads can be large.
  throttleTime: 1000,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Bump this when query shapes change so old caches don't poison new code.
        // v2 — 2026-05-03: Award / opp / contact schemas changed substantially
        // (prior-stage map, IsClosed/IsWon, ISA exclusion, etc.). Older
        // persisted caches were triggering "promise.then is not a function"
        // during hydrate.
        buster: "v2",
        dehydrateOptions: {
          // Only persist queries that finished successfully — pending /
          // error states carry a state.promise field that doesn't survive
          // JSON.stringify, which causes "promise.then is not a function"
          // during hydrate. Also skip auth-related queries so cookies/JWT
          // stay fresh on reload.
          shouldDehydrateQuery: (q) => {
            const k = q.queryKey;
            if (Array.isArray(k) && k[0] === "auth") return false;
            return q.state.status === "success" && q.state.data !== undefined;
          },
        },
        // Hide the splash if hydration is slow.
        maxAge: 24 * 60 * 60 * 1000,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
