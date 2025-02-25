import React, { createContext, useState, useContext } from "react";
import Notification from "./components/notification";// Import your notification component

// Create Context
const NotificationContext = createContext();

// Create a custom hook for easier access
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: "", type: "success", visible: false });

  // Function to trigger a notification
  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({ message, type, visible: true });

    // Hide the notification after duration
    setTimeout(() => {
      setNotification({ message: "", type: "success", visible: false });
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification.visible && <Notification message={notification.message} type={notification.type} />}
    </NotificationContext.Provider>
  );
};
