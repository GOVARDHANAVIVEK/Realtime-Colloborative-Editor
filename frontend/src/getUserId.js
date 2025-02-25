import { useEffect,useState } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ Correct way to import
const getUserIdFromToken = () => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUserIdFromToken = () => {
            const token = localStorage.getItem("accessToken"); // Retrieve token from local storage
            if (!token) return null; // If no token, return null

            try {
                const decodedToken = jwtDecode(token);
                return decodedToken?.userId; // Extract and return user ID
            } catch (error) {
                console.error("Invalid token:", error);
                return null;
            }
        };

        const id = getUserIdFromToken();
        console.log("Extracted userId from token:", id);
        setUserId(id); // Set user ID from token
    }, []); // Runs once when the component mounts

    return userId; // Return userId state

};

export default getUserIdFromToken;