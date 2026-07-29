import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Providers } from "./providers";
import "@/styles/globals.css";
import "@/styles/production.css";
import "@/styles/dashboard.css";
import "@/styles/modules.css";
import "@/styles/completion.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
