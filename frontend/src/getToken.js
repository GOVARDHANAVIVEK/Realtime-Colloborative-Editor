import React ,{useEffect} from "react";
import { useNavigate } from "react-router-dom";
const getToken = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
    
        if (token) {
          localStorage.setItem("accessToken", token); // Store token
          navigate("/home"); // Redirect to dashboard
        }
      }, []);
}

export default getToken