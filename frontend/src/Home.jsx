import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../src/components/Navbar'
import Documents from "./Documents";
import "../components/ui/documents.css";
import socket from "./socket";
import getUserIdFromToken from "./getUserId";
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
import {useNotification} from './NotificationProvider'
const Home = () => {
    console.log("backend_url",backendUrl)
  const userId = getUserIdFromToken()
  const [ownDocuments, setOwnDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isTokenExpired = (token) => {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    if(!userId){
        return 
    }
    fetchDocuments();
    // Listen for document deletions
    socket.on("document-deleted-server", (docID) => {
      setOwnDocuments((prev) => prev.filter((doc) => doc._id !== docID));
      setSharedDocuments((prev) => prev.filter((doc) => doc._id !== docID));
    });

    socket.on("document-created", (document) => {
        fetchDocuments()
        console.log("document added",document)
        showNotification(`New document - '${document?.document?.title}' created!`, "success")
      });
    
      return () => {
        socket.off("document-deleted-server");
        socket.off("document-added-server");
        
      };
  },[userId,setOwnDocuments,setSharedDocuments]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("accessToken");
      setTimeout(() => {
        alert("Session expired.");
        navigate("/signin");
      }, 1000);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("accessToken");
          setTimeout(() => {
            alert("Session expired.");
            navigate("/signin");
          }, 1000);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setTimeout(() => {
          alert("Session expired.");
          navigate("/signin");
        }, 1000);
      }
    };

    verifyToken();
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const result = await fetch(`${backendUrl}/api/documents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await result.json();
    //   console.log(data);

      // Separate into own and shared documents
      const ownDocs = data.results.filter((doc) => doc.owner === userId);
      const sharedDocs = data.results.filter((doc) => doc.owner !== userId);

      setOwnDocuments(ownDocs);
      setSharedDocuments(sharedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  return (
    <>
      <Navbar userId={userId}/>
      <Documents ownDocuments={ownDocuments} sharedDocuments={sharedDocuments} userId={userId}  />
      
    </>
  );
};

export default Home;
