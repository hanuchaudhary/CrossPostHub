import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import "./index.css";
import App from "./App";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><ThemeProvider attribute="class" defaultTheme="system" enableSystem><App /></ThemeProvider></BrowserRouter></StrictMode>,
)
