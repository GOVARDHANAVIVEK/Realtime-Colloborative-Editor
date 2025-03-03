import React,{useState,useEffect,useCallback} from "react";
// import socket from "./socket";
import { useSocket } from "./SocketProvider";
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
import {useNotification} from './NotificationProvider'
const DocAccess = ({ docId, onClose, documentName }) => {
  const socket = useSocket()
  const [emails, setEmails] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const { showNotification } = useNotification();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      event.preventDefault();
      if (validateEmail(inputValue)) {
        if (!emails.includes(inputValue.trim())) {
          setEmails((prevEmails) => [...prevEmails, inputValue.trim()]);
          setInputValue("");
        } else {
          showNotification("Email already added.", "warning");
        }
      } else {
        alert("Invalid email address!");
      }
    }
  }, [inputValue, emails]);

  const removeEmail = (index) => {
    setEmails((prevEmails) => prevEmails.filter((_, i) => i !== index));
  };

  const shareDocumentAccess = async () => {
    try {
      console.log(emails, `${backendUrl}/api/users/getUser/`);
      const userFetchPromises = emails.map(email =>
        fetch(`${backendUrl}/api/users/getUser/${email}`).then(res => res.json())
      );

      const userData = await Promise.all(userFetchPromises);
      const updatedUsers = userData
        .filter(data => data?.result?.userId)
        .map(data => data.result.userId);

      if (updatedUsers.length > 0) {
        setCollaborators(updatedUsers);
        showNotification(`Document Access provided.`, "success");
        socket.emit("share-access", { docId, users: updatedUsers });
      } else {
        showNotification(`Access Provision failed. No user found!`, "failure");
      }
      onClose();
    } catch (error) {
      console.error("Error in shareDocumentAccess:", error);
      showNotification("Access Provision failed.", "failure");
    }
  };
  useEffect(()=>{
    return () => {
      socket.off("share-access");
    };
  },[])
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 px-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Share Document</h2>
        <p className="text-gray-600 text-sm mb-2">
          Document ID: <span className="font-medium">{docId}</span>
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Document Title: <span className="font-medium">{documentName}</span>
        </p>

        {/* Email List */}
        <div className="w-full border border-gray-300 p-3 rounded-md bg-white">
          <div className="flex flex-wrap gap-2">
            {emails.map((email, index) => (
              <div key={index} className="flex items-center bg-blue-400 px-3 py-1 rounded-md text-sm">
                <span>{email}</span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => removeEmail(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Email Input */}
          <input
            type="email"
            placeholder="Enter email and press Enter"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-white border border-gray-400 p-2 w-full rounded-md mt-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Share Button */}
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:bg-blue-700 transition"
          onClick={shareDocumentAccess}
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default DocAccess;
