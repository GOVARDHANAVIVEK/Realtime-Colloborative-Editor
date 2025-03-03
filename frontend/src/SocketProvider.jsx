import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children, isAuthenticated }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null); // ✅ Store socket in state for reactivity

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

        if (!isAuthenticated || !token) {
            console.log("❌ WebSocket not initialized: User not authenticated.");
            return;
        }

        console.log("🔌 Initializing WebSocket connection...", isAuthenticated);

        if (!socketRef.current) {
            socketRef.current = io(backendUrl, {
                auth: { token },
                transports: ["websocket"],
            });

            socketRef.current.on("connect", () => console.log("✅ Connected securely to WebSocket server 🔒"));
            socketRef.current.on("disconnect", () => console.log("❌ Disconnected from WebSocket"));

            setSocket(socketRef.current); // ✅ Update state so consumers get the socket
        }

        return () => {
            if (socketRef.current) {
                console.log("🔌 Closing WebSocket connection...");
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [isAuthenticated]); // ✅ Depend only on `isAuthenticated`

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        console.warn("⚠️ WebSocket connection not available. Ensure the user is authenticated.");
    }
    return socket;
};
