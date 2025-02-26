import React, { useState, useEffect } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import '../components/ui/signin.css'
import { useNavigate } from "react-router-dom";
import getToken from "./getToken";
import {useNotification} from './NotificationProvider'
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
const SignIn = () => {
    console.log("backend_url",backendUrl)
    const { showNotification } = useNotification();
    const [user,setUser] = useState({
        email:"",
        password:""

    });
    
    const navigate = useNavigate();
    const [err, setError] = useState({isError:false,message:""});
    function handleChange(e) {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
        setError({ hasError: false, message: "" })
        
    }
    async function handleSubmit(e){
        e.preventDefault();
        console.log("Submitted Data:", user);
        if(user.email ===""){
            setError({ isError: true, message: "Email is required" })
            return
        }
        if(user.password ===""){
            setError({ isError: true, message: "Password is required" })
            return
        }
        try {
            const result = await fetch(`${backendUrl}/api/auth/signin`,{
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body:JSON.stringify(user)
            });
            console.log(result)
            const data = await result.json(); // Read JSON response correctly
            console.log(JSON.stringify(data))
            if (!result.ok || data.ok === false) { 
                if(data.type == "password" || data.type === "email"){
                    setError({ isError: true, message:data.Message})
                    console.log("Error:", data.Message || "Unknown error occurred");
                } 
            } else {
                if (data?.result) {
                    localStorage.setItem("accessToken", data?.result);
                }
                showNotification(data.Message, "success")
                navigate("/home");
            }
            
        } catch (error) {
            setError({isError:true,message:error})
            showNotification("Signin falied", "failure")
            console.error("Error:", error);
        }
    
    }

    const handleGoogleLogin = () => {
        getToken()
    };
    
    

    
    return (
        <>
        <div className="bg-black border-2 border-red-400 w-full min-h-screen flex justify-center items-center px-4">
        
            <div className="box-border bg-black px-8 py-10 border-2 border-white shadow-lg rounded-3xl 
                            sm:w-11/12 md:w-3/4 lg:w-1/3">
                
                <h1 className="text-center text-white text-2xl font-semibold">
                Sign In
                </h1>

                <div className="w-full mt-6">
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="w-full px-4 py-2 rounded-lg">
                    <label htmlFor="email" className="text-white block mb-1">Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        className="w-full px-3 py-2 rounded-lg bg-gray-100 text-black focus:outline-none" 
                        value = {user.email}
                        onChange={handleChange}
                    />
                    
                    
                    </div>

                    <div className="w-full px-4 py-2 rounded-lg">
                    <label htmlFor="password" className="text-white block mb-1">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        id="password" 
                        className="w-full px-3 py-2 rounded-lg bg-gray-100 text-black focus:outline-none" 
                        value = {user.password}
                        onChange={handleChange}
                    />
                   
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700" >
                    Login
                    </button>
                    {err.isError &&(
                    <span className="text-red-400 text-sm text-center">{err.message}</span>
                    )}
                </form>
                
                </div>

                <div className="text-center text-white mt-4">
                <p>
                    <a href="/signup" className="text-blue-400 hover:underline">Create account?</a> Or login with
                </p>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <a href={`${backendUrl}/api/auth/google`} className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
                        <FaGoogle className="text-red-600 w-6 h-6" />
                    </a>
                    <a href={`${backendUrl}/api/auth/github`} className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
                        <FaGithub className="text-black w-6 h-6" />
                    </a>
                </div>


            </div>

        </div>

        </>
      )
}

export default SignIn
