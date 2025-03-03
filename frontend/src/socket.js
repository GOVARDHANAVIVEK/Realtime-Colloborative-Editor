
import { io } from "socket.io-client";
const token = localStorage.getItem("accessToken");
    const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
const socket = io(backendUrl,{
            auth: {token},
            transports: ["websocket"],
            }); // Adjust your server URL
socket.on("connect", () => {
    console.log("Connected securely to WebSocket server 🔒");
});

export default socket