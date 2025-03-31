import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply global font styles
document.documentElement.style.setProperty("--font-sans", '"Inter", sans-serif');
document.documentElement.style.setProperty("--font-serif", '"Source Serif Pro", serif');

createRoot(document.getElementById("root")!).render(<App />);
