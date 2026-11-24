import { createRoot } from "react-dom/client";
import "react-isokit/styles.css";
import "react-isokit/themes.css";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
