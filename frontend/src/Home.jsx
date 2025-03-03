import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../src/components/Navbar'
import Documents from "./Documents";
import "../components/ui/documents.css";
// import socket from "./socket";
import { useSocket } from "./SocketProvider";
import { getUserIdFromToken } from "./APIContext";
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
import { fetchDocuments } from "./APIContext";
import {useNotification} from './NotificationProvider'

const Home = ({setIsAuthenticated}) => {
    const socket = useSocket();
    const [notifications,setNotifications] = useState({});
    console.log("backend_url", backendUrl);
    
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const userId = getUserIdFromToken();
    console.log("userId",userId)
    const [ownDocuments, setOwnDocuments] = useState([]);
    const [sharedDocuments, setSharedDocuments] = useState([]);
  
    const isTokenExpired = (token) => {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT
        return decoded.exp * 1000 < Date.now();
      } catch (error) {
        return true;
      }
    };
  
    const getDocuments = async () => {
      if (!userId) return;
      try {
        const data = await fetchDocuments(backendUrl, userId);
        console.log("Fetched Documents:", data);
        setOwnDocuments(data.ownDocs || []);
        setSharedDocuments(data.sharedDocs || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
  
    useEffect(() => {
      if (!userId) return;
      if (!socket) {
        console.warn("⚠️ WebSocket connection not yet available.");
        return;
    }
      
      let isMounted = true;
      
      getDocuments();
  
      // Listen for real-time updates
      socket.on("document-deleted-server", (docID) => {
        if (isMounted) {
          setOwnDocuments((prev) => prev.filter((doc) => doc._id !== docID));
          setSharedDocuments((prev) => prev.filter((doc) => doc._id !== docID));
        }
      });
  
      socket.on("document-created", (document) => {
        if (isMounted) {
          getDocuments(); // Refetch documents on new document creation
          console.log("Document added", document);
          showNotification(`New document - '${document?.document?.title}' created!`, "success");
        }
      });
  
      return () => {
        isMounted = false;
        socket.off("document-deleted-server");
        socket.off("document-created");
      };
    }, [socket,userId]);
  
    useEffect(() => {
      const token = localStorage.getItem("accessToken");
  
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("accessToken");
        alert("Session expired.");
        navigate("/signin");
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
            alert("Session expired.");
            navigate("/signin");
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          localStorage.removeItem("accessToken");
          alert("Session expired.");
          navigate("/signin");
        }
      };
  
      verifyToken();
    }, [navigate]);


  //   {
  //     "Message": "67b07e021220ba89fda1ed12 made changes in the document.",
  //     "sendNotifications": [
  //         "67b07df01220ba89fda1ed0d"
  //     ]
  // }
 
  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ WebSocket connection not yet available.");
      return;
  }
    const getNotification = async () => {
        try {
            console.log("Fetching notifications from:", `${backendUrl}/api/users/notifications/${userId}`);
            
            const response = await fetch(`${backendUrl}/api/users/notifications/${userId}`);
            const data = await response.json();

            console.log("Fetched Data:", data);

            if (!response.ok || !data.ok) {
                console.log("Unable to fetch notifications:", data.message);
                return;
            }

            // Check if there is a new notification before updating state
            if (JSON.stringify(data.result) !== JSON.stringify(notifications)) {
                console.log("New Notifications Found:", data.result);
                setNotifications(data.result);
            } else {
                console.log("No new notifications.");
            }

        } catch (error) {
            console.log("Something went wrong while fetching notifications:", error);
        }
    };
    getNotification()
    socket.on('notification',getNotification)
    return(()=>{
      socket.off('notification',getNotification)
    })
}, [socket,userId, notifications]);  // ✅ Runs when `notifications` change

  const onClickNotification =(index,documentId)=>{
    console.log("index",index,"docID",documentId)
    navigate(`/document/editor/${documentId}`)
    socket.emit(`delete-users-notification-selected`,{userId,documentId,index})
  }
//   useEffect(() => {
//     socket.on("notification", (data) => {
//         console.log("id:", userId, "data:", data);

//         const sendNotificationsStrings = data.sendNotifications?.map(id => id.toString()) || [];
//         const userIdString = userId.toString();

//         const shouldNotify = sendNotificationsStrings.includes(userIdString);

//         console.log("Should notify?", shouldNotify);

//         if (shouldNotify) {
//           setNotifications((prev) => ({
//             ...prev,
//             Messages: [...(prev?.Messages || []), data.Message] // Append new message
            
//         }));
// //        {
//       //     "Messages": [
//             //       "test2 made changes in the document test.py",
//             //       "test2 made changes in the document my doc 1"
//             //   ]
//       // }
        
//         } else {
//           setNotifications(null); //clear the notifications object if not for this user.
//         }
//     });

//     return () => {
//         socket.off("notification");
//     };
// }, [socket, userId]);

//Remove this useEffect in production.
useEffect(() => {
    console.log("notifications:", notifications);
}, [notifications]);

    return (
      <>
        <Navbar userId={userId} notifications={notifications} onClickNotification={onClickNotification} setIsAuthenticated={setIsAuthenticated}/>
        <Documents ownDocuments={ownDocuments} sharedDocuments={sharedDocuments} userId={userId} />
      </>
    );
  };

export default Home;
