import { useRef, useState, useEffect } from "react";

const Username = (userId) => {
    const userCache = useRef(new Map());  // Cache usernames
    const [username, setUsername] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const fetchUsername = async () => {
            try {
                console.log("Checking cache for:", userId);
                
                if (userCache.current.has(userId)) {
                    console.log("Cache hit! Username:", userCache.current.get(userId));
                    setUsername(userCache.current.get(userId));
                    return;
                }

                console.log("Fetching from API...");
                const response = await fetch(`${process.env.VITE_APP_backend_url}/api/users/user/${userId}`, { method: "GET" });
                const data = await response.json();

                if (data?.result?.username) {
                    userCache.current.set(userId, data.result.username);
                    setUsername(data.result.username);
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };

        fetchUsername();
    }, [userId]);
    console.log(username)
    return username;
};

export default Username;
