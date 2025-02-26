import React,{useState,useEffect} from "react";
import socket from "./socket";
import {useNotification} from './NotificationProvider'
const DocAccess = ({ docId, onClose,documentName }) => {
  const [emails, setEmails] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const { showNotification } = useNotification();
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      event.preventDefault(); // Prevent form submission
      if (validateEmail(inputValue)) {
        setEmails([...emails, inputValue.trim()]);
        setInputValue(""); // Clear input
      } else {
        alert("Invalid email address!");
      }
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Remove an email
  const removeEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const shareDocumentAccess = async () => {
    try {
        let updatedUsers = [];
        console.log(emails,`${process.env.VITE_APP_backend_url}/api/users/getUser/`)
        for (const user of emails) {
            try {
                const response = await fetch(`${process.env.VITE_APP_backend_url}/api/users/getUser/${user}`, {
                    method: "GET"
                });
                const data = await response.json();
                console.log('User Data:', data);
                if (data?.result?.userId) { // Ensuring userId is valid
                  updatedUsers.push(data.result.userId);
              }
            } catch (error) {
              showNotification(`Access Provision failed.`, "failure")
                console.error('Error fetching user data:', error);
            }
        }

        if (updatedUsers.length > 0) {
            setCollaborators(updatedUsers); // Updates state asynchronously
            showNotification(`Document Access provided.`, "success")
        }else{
          showNotification(`Access Provision failed. No user found!`, "failure")
        }
        
        onClose()
        
        console.log('Updated Users:', updatedUsers);
        socket.emit('share-access', { docId, users: updatedUsers }); // Use updatedUsers directly
    } catch (error) {
        console.log(error);
    }
};



  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50 px-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-grey-800 mb-2">Share Document</h2>
        <p className="text-gray-600 text-sm mb-4">Document ID: <span className="font-medium">{docId}</span></p>
        <p className="text-gray-600 text-sm mb-4">Document Title: <span className="font-medium">{documentName}</span></p>
        {/* Email List */}
        <div className="w-full border border-gray-300 p-3 rounded-md bg-black">
          <div className="flex flex-wrap gap-2 ">
            {emails.map((email, index) => (
              <div key={index} className="flex items-center bg-blue-400 px-3 py-1 rounded-md text-sm ">
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
            className=" bg-white border border-gray-400 p-2 w-full rounded-md mt-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Share Button */}
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:bg-blue-700 transition" onClick={()=>shareDocumentAccess()}>
          Share
        </button>
      </div>
    </div>
  );
};

export default DocAccess;
