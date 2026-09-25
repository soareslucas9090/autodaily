import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./estilos.css";

function Raiz() {
  useEffect(() => {
    document.documentElement.dataset.tema = localStorage.getItem("tema") === "escuro" ? "escuro" : "claro";
  }, []);
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Raiz />
  </StrictMode>,
);
