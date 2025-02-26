import { io } from "socket.io-client";
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
const socket = io(backendUrl); // Adjust your server URL

export default socket;