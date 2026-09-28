import AppRoutes from "./routes";

import { NotificationProvider } from "./contexts/NotificationContext";
import PwaInstallPrompt from "./components/common/PwaInstallPrompt";

import "./App.css";

function App() {
    return (
        <NotificationProvider>
            <AppRoutes />
            <PwaInstallPrompt />
        </NotificationProvider>
    );
}

export default App;