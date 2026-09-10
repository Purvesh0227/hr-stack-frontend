import { createContext, useContext, useState } from "react";
import Notification from "../components/Notification";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

    const [notification, setNotification] = useState({
        message: "",
        type: "success"
    });

    const showNotification = (
        message,
        type = "success"
    ) => {

        setNotification({
            message,
            type
        });

    };

    const closeNotification = () => {

        setNotification({
            message: "",
            type: "success"
        });

    };

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                closeNotification
            }}
        >

            {children}

            <Notification
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
            />

        </NotificationContext.Provider>
    );
};


export const useNotification = () => {

    const context =
        useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotification must be used inside NotificationProvider"
        );
    }

    return context;
};