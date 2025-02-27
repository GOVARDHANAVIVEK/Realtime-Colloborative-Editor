import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";  // Icon Library
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../NotificationProvider'
import socket from "../socket";
import { FaBell } from "react-icons/fa";
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
const Navbar = ({userId}) => {
    const { showNotification } = useNotification();
    useEffect(()=>{
       console.log("userId",userId)
    },[])
    const [isOpen, setIsOpen] = useState(false);
    const [createDocumnet ,setCreateDocumnet] = useState(false)
    const [blankDocument, setBlankDocument] = useState({
        title: "",
        owner: userId,  // Ensure userId is defined
        content: "",
        collaborators:[]
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState("");

    const navigate = useNavigate();
    const handleLogout=()=>{
        showNotification("Logging out.", "success")
        setTimeout(()=>{
            localStorage.removeItem('accessToken');
        navigate('/signin');
        },1000)
        setTimeout(() => {
            window.history.pushState(null, "", window.location.href);
            window.addEventListener("popstate", function () {
            window.history.pushState(null, "", window.location.href);
            });
        }, 0);
        
        
    }

    const createNewDocument=()=>{
        setCreateDocumnet(prev => !prev)
    }
    
    const createDocument =async(newDoc)=>{
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${backendUrl}/api/documents/createDocument`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newDoc) // Use newDoc directly instead of blankDocument
            });
            
            const data = await response.json();
            if(!data?.ok){
                showNotification(data?.message,"failure")
                return
            }
            const document = data?.result;
    
            if (document) {
                socket.emit("document-added-server", { document });
                navigate(`/document/editor/${document._id}`);
            }
        } catch (error) {
            console.log("Failed to create blank document", error);
        }
    }
   
    const createBlankDocument = async () => {
        const newDoc = {
            title: "Untitled Document",
            content: "",
            owner: userId,
            collaborators: []
        };
    
        // setBlankDocument(newDoc); // State update
        createDocument(newDoc)
        console.log("Creating blank document...");
    
        
    };
    
    const handleFileChange = async(event) => {
        const file = event.target.files[0]; // Get the first selected file
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = async(e) => {
                const content = e.target.result;
                setFileContent(content); // Update state

                // Create document once file content is available
                const newFile = {
                    title: file.name, // Use file.name directly
                    content: content, // File content
                    owner: userId,
                    collaborators: []
            };
            // setBlankDocument(newFile)
            createDocument(newFile)
            console.log("uploading document...", newFile);
            
        };
        reader.readAsText(file); // Read file as text
           
        }
    };

    return (
        <>
        <nav className="bg-blue-600 shadow-md sticky top-0 w-full z-50">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/home" className="text-white text-2xl font-bold">
                        DocsApp
                    </Link>
    
                    {/* Hamburger Menu for Mobile */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white focus:outline-none">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
    
                    {/* Navigation Links */}
                    <ul className={`md:flex md:gap-8 absolute md:static top-full left-0 w-full md:w-auto bg-blue-600 md:bg-transparent transition-all duration-300 ease-in-out ${
                        isOpen ? "block" : "hidden md:flex"
                    }`}>
                        
                        {/* <li className="text-white text-lg hover:text-gray-200 p-4 md:p-0">
                            <Link to="/create">Create Document</Link>
                        </li> */}
                        <FaBell 
                        size={24}
                        className="m-auto"
                        />
    
                        <button className=" relative text-white text-lg hover:text-gray-200 p-4 md:p-0"
                        onClick={createNewDocument}
                        >
                            Create Document
                        </button>
                        {createDocumnet && (
                            <div className="absolute top-14 w-48 md:w-56 lg:w-64 p-2 flex flex-col bg-white shadow-lg rounded-lg border border-gray-300">
                            {/* Blank Document Button */}
                            <button className="w-full py-3 text-center text-black bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
                            onClick={createBlankDocument}>
                                📄 Blank Document
                            </button>
    
                            {/* Upload File Section */}
                            <div className="relative w-full mt-2">
                                <input type="file" id="fileUpload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                                <button className="w-full py-3 text-black bg-gray-300 rounded-md hover:bg-gray-400 transition-all"
                                >
                                    📤 Upload File
                                </button>
                            </div>
                        </div>
                        )}
                        
    
                        
                        <button className="text-white text-lg hover:text-gray-200 p-4 md:p-0" onClick={handleLogout}>
                           Logout
                        </button>
                    </ul>
                </div>
            </nav>
        
        </>
        
      )
}

export default Navbar





