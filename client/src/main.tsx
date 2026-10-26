import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/components/theme_provider";
import "./index.css";
import App from "./app";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><ThemeProvider defaultTheme="system"><App /></ThemeProvider></BrowserRouter></StrictMode>,
)
