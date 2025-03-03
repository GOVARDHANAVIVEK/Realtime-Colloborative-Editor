// fetch Username

export const fetchUsername = async (backendUrl,userId,userCache) => {
    console.log("userId,userCache,backendUrl in fetch",{userId,userCache,backendUrl})
    if (userCache && userCache.current.has(userId)) return userCache.current.get(userId);
    try {
        
        const response = await fetch(`${backendUrl}/api/users/user/${userId}`);
        const data = await response.json();
        if (data?.result?.username) {
            userCache.current.set(userId, data.result.username);
            return data.result.username;
        }
    } catch (error) {
        console.error('Error fetching username:', error);
    }
    return userId;
};

//Load document data

export const loadData = async (backendUrl,documentId) => {
    try {
        console.log("documentId,backendUrl",{documentId,backendUrl})
        const response = await fetch(`${backendUrl}/api/documents/document/${documentId}`);
        const data = await response.json();
        console.log("data",data)
        return data?.result
        

    } catch (error) {
        console.error('Error fetching document data:', error);
    }
};

export const fetchVersions = async (backendUrl,documentId,userCache) => {
    try {
        console.log("backendUrl,documentId",{backendUrl,documentId})
        const response = await fetch(`${backendUrl}/api/documents/versions/${documentId}`);
        const data = await response.json();
        console.log(data)
        if (data?.result) {
            const updatedDocs = await Promise.all(
                data?.result.map(async (doc) => ({
                    ...doc,
                    savedBy: await fetchUsername(backendUrl,doc.savedBy,userCache),
                }))
            );
            return updatedDocs
        }
    } catch (error) {
        console.error("Error fetching document versions:", error);
    }
};

export const saveDocumentTitle =async(docTitle,documentId,backendUrl)=>{
    try {
        console.log("backendUrl,documentId,docTitle",{backendUrl,documentId,docTitle})
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${backendUrl}/api/documents/update-title/${documentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: docTitle }),
        });
        if (!response.ok) throw new Error("Failed to update title");

        const data = await response.json();
        if (data && data?.result && data?.result?.title) {
            console.log("title",data?.result?.title)
            return data?.result?.title
        }
        return "Untitled Document"
    } catch (error) {
        console.error("Error updating title:", error);
    }
}

export const fetchTitle = async (backendUrl,documentId) => {
    console.log("backendUrl,documentId",{backendUrl,documentId})
    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${backendUrl}/api/documents/document/${documentId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch title");

        const data = await response.json();
        if (data && data?.result && data?.result?.title) {
            console.log("title",data?.result?.title)
            return data?.result?.title
        }
        return "Untitled Document"

    } catch (error) {
        console.error("Error fetching title:", error);
    }
};

export const fetchContent = async (backendUrl,documentId,selectedVersion) => {
    console.log("backendUrl,documentId,selectedVersion",{backendUrl,documentId,selectedVersion})
    try {
        const resposne = await fetch(`${backendUrl}/api/documents/versions/${documentId}/${selectedVersion}`);
        const data = await resposne.json()
        console.log("data", data, "version", selectedVersion)
        return data
    } catch (error) {
        console.log(error)
    }
}

import { useEffect,useState } from "react";
import { jwtDecode } from "jwt-decode"; 
export const getUserIdFromToken = () => {
    const token = localStorage.getItem("accessToken"); // Retrieve token from local storage
    if (!token) return null; // If no token, return null

    try {
        const decodedToken = jwtDecode(token);
        console.log("decodedToken?.userId",decodedToken?.userId)
        return decodedToken?.userId; // Extract and return user ID
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};




import { useNavigate } from "react-router-dom";

const GetToken = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            localStorage.setItem("accessToken", token); // Store token
            navigate("/home"); // Redirect to home page
        }
    }, [navigate]);

    return null; // No UI is needed
};

export default GetToken;



export const fetchDocuments = async (backendUrl,userId) => {
    console.log("backendUrl,userId",{backendUrl,userId})
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

      return {ownDocs,sharedDocs}
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

