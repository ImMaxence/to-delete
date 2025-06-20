import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@tremor/react/dist/esm/tremor.css";
import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
