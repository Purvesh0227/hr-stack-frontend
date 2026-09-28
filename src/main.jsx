import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";  
import "./styles/theme.css";                             
import "./index.css";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter basename="/hr-stack-frontend">
        <ThemeProvider>         
            <App />
            </ThemeProvider>      
    </BrowserRouter>
);