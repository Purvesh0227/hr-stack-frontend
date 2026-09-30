import AppRoutes from "./routes";
import { NotificationProvider } from "./contexts/NotificationContext";
import {
    NotificationCenterProvider
} from "./contexts/NotificationCenterContext";
import PwaInstallPrompt from "./components/common/PwaInstallPrompt";

import "./App.css";

function App() {
    return (
        <NotificationProvider>
            <NotificationCenterProvider>
                <AppRoutes />
                <PwaInstallPrompt />
            </NotificationCenterProvider>
        </NotificationProvider>
    );
}

export default App;