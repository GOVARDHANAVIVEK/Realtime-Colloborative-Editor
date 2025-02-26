import { io } from "socket.io-client";

const socket = io(process.env.VITE_APP_backend_url); // Adjust your server URL

export default socket;