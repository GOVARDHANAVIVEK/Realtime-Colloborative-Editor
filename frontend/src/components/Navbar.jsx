import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useNotification } from '../NotificationProvider';
// import socket from "../socket";
import { useSocket } from "../SocketProvider";
import { FaBell } from "react-icons/fa";
import { HiMiniBellAlert } from "react-icons/hi2";
import NotificationUiComponent from "./NotificationUiComponent";

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

const Navbar = ({ userId, notifications,onClickNotification,setIsAuthenticated }) => {
    const socket = useSocket();
    console.log("notifications", notifications);
    const { showNotification } = useNotification();
    const [readNotifications,setreadNotifications] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [createDocumnet, setCreateDocumnet] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();
    const [showNotificationWindow, setShowNotificationWindow] = useState(false); // State for notification window
    const [notificationMessagesStyle,setNotificationMessagesStyle] = useState('')
    useEffect(() => {
        console.log("userId", userId);
    }, [userId]);

    const handleLogout = () => {
        showNotification("Logging out.", "success");
        setTimeout(() => {
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false)
            navigate('/signin');
        }, 1000);
        setTimeout(() => {
            window.history.pushState(null, "", window.location.href);
            window.addEventListener("popstate", function () {
                window.history.pushState(null, "", window.location.href);
            });
        }, 0);
    };

    const createNewDocument = () => {
        setCreateDocumnet(prev => !prev);
    };

    const createDocument = async (newDoc) => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${backendUrl}/api/documents/createDocument`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newDoc)
            });

            const data = await response.json();
            if (!data?.ok) {
                showNotification(data?.message, "failure");
                return;
            }
            const document = data?.result;

            if (document) {
                socket.emit("document-added-server", { document });
                navigate(`/document/editor/${document._id}`);
            }
        } catch (error) {
            console.log("Failed to create blank document", error);
        }
    };

    const createBlankDocument = async () => {
        const newDoc = {
            title: "Untitled Document",
            content: "",
            owner: userId,
            collaborators: []
        };

        createDocument(newDoc);
        console.log("Creating blank document...");
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;

                const newFile = {
                    title: file.name,
                    content: content,
                    owner: userId,
                    collaborators: []
                };

                createDocument(newFile);
                console.log("uploading document...", newFile);
            };
            reader.readAsText(file);
        }
    };
    const handleNotificationWindow = () => {
        setShowNotificationWindow((prev) => !prev)
        
    }

    const handlereadNotifications=()=>{
        setreadNotifications(true);
        socket.emit('user-read-notifications',userId);
       
    }

    useEffect(() => {
        setNotificationMessagesStyle({
            backgroundColor: readNotifications ? "#FFEBE5" : "#F5F5F5",
            color: readNotifications ? "#D32F2F" : "#757575"
        });
    }, [setreadNotifications,readNotifications]);
    useEffect(()=>{
        console.log('notificationMessagesStyle',notificationMessagesStyle)
    },[notificationMessagesStyle])

    return (
        <>
            <nav className="bg-blue-600 shadow-md sticky top-0 w-full z-50 ">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <Link to="/home" className="text-white text-2xl font-bold">
                    CodeCraftr
                    </Link>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white focus:outline-none">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    <ul className={`md:flex md:gap-8 absolute md:static top-full left-0 w-full md:w-auto bg-blue-600 md:bg-transparent transition-all duration-300 ease-in-out ${isOpen ? "block" : "hidden md:flex"}`}>
                    {!readNotifications && notifications && notifications.length > 0 && notifications.some(notification=>{
                        return !notification.readMessage
                    })
                            ? (
                                <HiMiniBellAlert
                                    size={24}
                                    className="m-auto relative"
                                    onClick={() => {
                                        console.log("opened");
                                        handleNotificationWindow();
                                        handlereadNotifications()
                                        
                                    }}
                                    aria-label="Notifications available"
                                />
                            ) : (
                                <FaBell
                                    size={24}
                                    className="m-auto"
                                    onClick={() => {
                                        console.log("closed");
                                        handleNotificationWindow();
                                        setNotificationMessagesStyle({
                                            backgroundColor:"#F5F5F5",
                                            color: "#757575"
                                        });
                                    }}
                                    aria-label="No notifications"
                                />
                            )}

                        {showNotificationWindow && (
                           notifications && notifications.length > 0 ? (

                                <NotificationUiComponent notifications={notifications} onClickNotification={onClickNotification} notificationMessagesStyle={notificationMessagesStyle} />
                            )
                                : (
                                    <NotificationUiComponent notification_message={"No messages"} />
                                )
                        )}

                        {/* {showNotificationWindow && notifications && notifications.Message ? (
                            <NotificationUiComponent notification_message={notifications.Message} />
                        ):<NotificationUiComponent notification_message={"No messages"} />} */}



                        <button className="relative text-white text-lg hover:text-gray-200 p-4 md:p-0 cursor-pointer" onClick={createNewDocument}>
                            Create Document
                        </button>
                        {createDocumnet && (
                            <div className="absolute top-14 w-48 md:w-56 lg:w-64 p-2 flex flex-col bg-white shadow-lg rounded-lg border border-gray-300">
                                <button className="w-full py-3 text-center text-black bg-blue-500 rounded-md hover:bg-blue-600 transition-all" onClick={createBlankDocument}>
                                    📄 Blank Document
                                </button>
                                <div className="relative w-full mt-2">
                                    <input type="file" id="fileUpload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                                    <button className="w-full py-3 text-black bg-gray-300 rounded-md hover:bg-gray-400 transition-all">
                                        📤 Upload File
                                    </button>
                                </div>
                            </div>
                        )}

                        <button className="text-white text-lg hover:text-gray-200 p-4 md:p-0 cursor-pointer" onClick={handleLogout}>
                            Logout
                        </button>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Navbar;