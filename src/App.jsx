import AppRoutes from "./routes";

import { NotificationProvider } from "./contexts/NotificationContext";

import "./App.css";

function App() {
    return (
        <NotificationProvider>
            <AppRoutes />
        </NotificationProvider>
    );
}

export default App;