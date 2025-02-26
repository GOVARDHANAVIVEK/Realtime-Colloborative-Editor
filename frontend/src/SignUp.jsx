import React, { useState, useEffect } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import '../components/ui/signup.css'
import { useNavigate } from "react-router-dom";
import {useNotification} from './NotificationProvider'
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
const Signup = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    const [user,setUser] = useState({
        email:"",
        password:"",
        username:"",
        gender:""

    });
    
    
    const [err, setError] = useState({isError:false,message:""});
    function handleChange(e) {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    }
    async function handleSubmit(e){
        e.preventDefault();
        console.log("Submitted Data:", user);
        if(user.username ===""){
            setError({ isError: true, message: "Username is required" })
            return
        }
        
        if(user.password ===""){
            setError({ isError: true, message: "Password is required" })
            return
        }
        if(user.email ===""){
            setError({ isError: true, message: "Email is required" })
            return
        }
        if(user.gender ===""){
            setError({ isError: true, message: "Gender is required" })
            return
        }
        try {
            const result = await fetch(`${backendUrl}/api/auth/signup`,{
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body:JSON.stringify(user)
            });
            console.log(result)
            const data = await result.json(); // Read JSON response correctly
           console.log(data,data?.ok === false)
            if (!result.ok || data?.ok === false) { 
                setError({ isError: true, message:data.Message})
                    console.log("Error:", data.Message || "Unknown error occurred");
            } else {
                
                if (data?.result) {
                    localStorage.setItem("accessToken", data?.result);
                }
                showNotification(data.Message, "success")
                navigate("/home");
            }

        } catch (error) {
            setError({ isError: true, message:error})
            showNotification("Signup failed", "failure")
            console.error("Error:", error);
        }
    
    }

  return (
    <>
   <div className="bg-black border-2 border-red-400 w-full h-screen flex justify-center items-center">

<div className="box-border bg-black px-10 py-10 border-2 border-white shadow-lg rounded-3xl 
                lg:w-1/3 md:w-2/3 sm:w-full sm:px-6">

  <h1 className="text-white text-center text-2xl font-semibold">Sign Up</h1>

  <div className="mt-6">
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      
      <div className=" w-full px-4 py-2 rounded-lg">
        <label htmlFor="username" className="text-white block mb-1">Username</label>
        <input 
          type="text" 
          name="username" 
          id="username" 
          value = {user.username}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg bg-gray-100 text-black focus:outline-none" 
        />
      </div>

      <div className=" w-full px-4 py-2 rounded-lg">
        <label htmlFor="password" className="text-white block mb-1">Create Password</label>
        <input 
          type="password" 
          name="password" 
          id="password" 
          className="w-full px-3 py-2 rounded-lg bg-gray-100 text-black focus:outline-none" 
          value = {user.password}
          onChange={handleChange}
        />
      </div>

      <div className=" w-full px-4 py-2 rounded-lg">
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

      <div className="flex justify-center gap-8 text-white">
        <label className="flex items-center gap-4">
          <input type="radio" name="gender"  value ="male" className="accent-blue-500" checked = {user.gender ==="male"}
          onChange={handleChange}/> Male
        </label>
        <label className="flex items-center gap-4">
          <input type="radio" name="gender"  value="female" className="accent-pink-500" checked = {user.gender ==="female"}
          onChange={handleChange}/> Female
        </label>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Sign Up
      </button>
      {err.isError &&(
                    <span className="text-red-400 text-sm text-center">{err.message}</span>
                    )}
    </form>
  </div>

  <div className="text-center text-white mt-4">
    <p>
      Have an account? <a href="/signin" className="text-blue-400 hover:underline">Login here</a> Or sign up with
    </p>
  </div>

  <div className="flex justify-center gap-4 mt-4">
    <button type="button" className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
      <FaGoogle className="text-red-600 w-6 h-6" />
    </button>
    <button type="button" className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
      <FaGithub className="text-black w-6 h-6" />
    </button>
  </div>

</div>

</div>

    </>
  );
};

export default Signup;
