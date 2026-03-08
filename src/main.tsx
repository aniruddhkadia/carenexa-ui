import { StrictMode } from "react";
console.log("main.tsx: Starting mounting process");
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./features/auth/AuthContext";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

console.log("main.tsx: Calling createRoot");
const root = document.getElementById("root");
if (!root) console.error("main.tsx: Root element not found!");
else console.log("main.tsx: Root element found:", root);

createRoot(root!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
console.log("main.tsx: Finished calling render");
