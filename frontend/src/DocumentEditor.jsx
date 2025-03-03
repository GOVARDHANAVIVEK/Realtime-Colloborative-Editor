import React, { useEffect, useState, useRef, useCallback } from 'react';
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
// import socket from './socket';
import { useSocket } from './SocketProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserIdFromToken } from './APIContext';
import DocumentVersions from "../src/components/DocumentVersions"
import ActiveUsers from './components/ActiveUsers';
import TextEditor from './components/TextEditor';
import CodeEditor from './components/CodeEditor';
import { useNotification } from './NotificationProvider'
import { detectLanguage } from './helperFunctions';
import { fetchUsername, loadData, fetchVersions, saveDocumentTitle, fetchTitle, fetchContent } from './APIContext';
// import TrackCursor from './components/TrackCursor';
const DocumentEditor = () => {

    const socket  = useSocket()
    const userId = getUserIdFromToken()
    console.log("userid", userId)

    // const {mountEditor} = TrackCursor()
    const { documentId } = useParams();
    console.log('Document ID:', documentId);
    const [content, setContent] = useState('');
    const [OriginalContent, setOriginalContent] = useState("");
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState("javascript"); // Default language
    const [typingUser, setTypingUser] = useState('');
    const typingTimeoutRef = useRef(null); // To clear timeout
    const [docTitle, setDocTitle] = useState('')
    const userCache = useRef(new Map());
    const [activeUsers, setActiveUsers] = useState([])
    const [IsEditingTitle, setIsEditingTitle] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [enableRestore, setEnableRestore] = useState(false)
    const [versionedDocuments, setVersionedDocuments] = useState([])
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [selectedVersionIndex, setSelectedVersionIndex] = useState(null)
    const [showBackBtn, setShowBackBtn] = useState(null)
    const [showUsers, setShowUsers] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const { showNotification } = useNotification();
    const [runCode, setRunCode] = useState(false)


    const [checkedDocs, setCheckedDocs] = useState(() => {
        const savedState = localStorage.getItem("checkedDocs");
        return savedState ? JSON.parse(savedState) : {};
    });

    useEffect(() => {
        console.log("checkeddocs", checkedDocs)
        console.log("showVersions", showVersions)
    }, [checkedDocs]);
    const isTokenExpired = (token) => {
        try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token || isTokenExpired(token)) {
            localStorage.removeItem("accessToken");
            alert('Session expired.');
            navigate("/signin");
        }
    }, [navigate]);


    useEffect(() => {
        if (!documentId) return;

        async function getData() {
            try {
                const data = await loadData(backendUrl, documentId);  // Call the function
                console.log("data of document", data)
                setContent(data?.content || '');
                setDocTitle(data?.title || '');
                setOriginalContent(data?.content)
            } catch (error) {
                console.log("error getting data of document", error)
            }
        }

        getData();

    }, [documentId]); // ✅ Runs only when documentId changes

    useEffect(() => {
        console.log("setOriginalContent", OriginalContent)
    }, [OriginalContent])
    // Handle socket events (join room & receive updates)
    useEffect(() => {
        if (!documentId || !socket) return;

        socket.emit('joinDocument', { documentId, userId });

        socket.on("activeUsers", async (users) => {
            console.log("Received users:", users);

            const userArray = Array.isArray(users) ? users : Object.values(users); // Ensure it's an array
            console.log("userArray", userArray)
            try {
                const userNames = await Promise.all(userArray.map(userId => fetchUsername(backendUrl, userId, userCache)));
                setActiveUsers(userNames);
            } catch (error) {
                console.error("Error fetching usernames:", error);
            }
        });


        socket.on('load-document', (data) => setContent(data));

        socket.on('receive-changes', (newContent) => setContent((prevContent) => newContent));

        return () => {
            socket.off('load-document');
            socket.off('receive-changes');
            socket.emit("leaveDocument", { documentId, userId });
            socket.off("activeUsers");
        };
    }, [socket,documentId, userId]);
    // Detect language whenever content updates
    useEffect(() => {
        setSelectedLanguage(detectLanguage(content));
    }, [content]);



    const handleTyping = async ({ userId }) => {
        console.log("Received user typing event:", userId);

        try {
            const username = await fetchUsername(backendUrl, userId, userCache);
            setTypingUser(username);
        } catch (error) {
            console.error("Error fetching username:", error);
        }

    };



    useEffect(() => {
        if (!documentId || !socket) return;

        socket.on('user-typing', handleTyping);

        socket.on('user-stopped-typing', (() => {
            setTypingUser('')
        }));



        return () => {
            socket.off('user-typing', handleTyping);
            socket.off('user-stopped-typing');
        };
    }, [socket,documentId, socket]); // Include handleTyping in dependencies








    // Ensure editorRef stays intact across re-renders


    const handleEditorChange = (value) => {
        setContent(value);

        socket.emit('send-changes', { documentId, content: value });

        socket.emit('user-typing', { documentId, userId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('user-stopped-typing', { documentId });

        }, 500);
    };



    const saveDocument = () => {
        const savedTime = new Date().toLocaleString();
        setLastSaved(savedTime);
        if (docTitle !== "Untitled Document") {
            socket.emit('save-document', { documentId, content });
            setOriginalContent(content)
            showNotification(`Saving.........`, "success")
            setTimeout(() => {
                showNotification(`Saved.`, "success")
            }, 1500);

            socket.emit('send-group-notification',{documentId,userId});
        } else {
            showNotification('Set a document name to enable saving.', "failure")
        }

    };

    useEffect(() => {

        if (lastSaved && checkedDocs[documentId]) {
            socket.emit('save-version', { docTitle, documentId, content, lastSaved, userId });
        }
    }, [lastSaved, checkedDocs[documentId]]);

    useEffect(() => {
        const fetchDocumentversions = async () => {
            const updatedDocs = await fetchVersions(backendUrl, documentId, userCache);
            console.log("updatedDocs", updatedDocs)
            setVersionedDocuments(updatedDocs);
        }
        fetchDocumentversions()
        socket.on("version-saved", fetchDocumentversions);

        return () => {
            socket.off("version-saved", fetchDocumentversions);
        };
    }, [socket,documentId]); // ✅ Empty dependency array to avoid reattaching event listener

    useEffect(() => {
        console.log("Updated versionedDocuments:", versionedDocuments);
    }, [versionedDocuments]);

    const closeDocument = () => {
        socket.emit('close-document');
        navigate('/home');
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setIsEditingTitle(false);
            console.log("docTitle", docTitle)
            const documentTitle = await saveDocumentTitle(docTitle, documentId, backendUrl)
            console.log("documentTitle",documentTitle)
            // setDocTitle(documentTitle || "");
            showNotification(`Changes Saved`, "success")
        }
    };

    useEffect(() => {

        const fetchDocumentsTitle = async()=>{
            const updatedDocumentTitle =await fetchTitle(backendUrl, documentId);
            console.log("fetchDocumentsTitle",updatedDocumentTitle)
            setDocTitle(updatedDocumentTitle || "");
        }
        fetchDocumentsTitle()
    }, [documentId]);


    const getVersionIndex = async (version) => {
        console.log("✅ handleViewVersion called with index:", version);
        setSelectedVersion(version)
        setEnableRestore(true)
        // setSelectedVersionIndex(version)
        setShowBackBtn(true)
    };

    const removeVersionIndex = async () => {
        setSelectedVersion(null)
        setEnableRestore(false)
        setShowBackBtn(false)
    }


    useEffect(() => {
        console.log("selectedVersion", selectedVersion)

        if (selectedVersion !== null && selectedVersion !== undefined) {
            setContent('')
            const fetchDocumentversionData = async () => {
                const fetched_Data = await fetchContent(backendUrl, documentId, selectedVersion)
                console.log("conetnt fetch versions", fetched_Data)
                setContent(fetched_Data?.result?.content)
                console.log("conetnt fetch versions", fetched_Data?.result?.content)
            }
            fetchDocumentversionData()
        } else {
            console.log("came here.....")
            setContent(OriginalContent)
        }

    }, [selectedVersion])

    const restoreOriginalContent = () => {
        console.log("content", content, "OriginalContent", OriginalContent)
        setContent(OriginalContent)
        console.log("content", content)
    }
    const restoreSelectedVersionContent = () => {
        if (selectedVersion !== null && selectedVersion !== undefined) {
            const fetchDocumentversionData = async () => {
                const fetched_Data = await fetchContent(backendUrl, documentId, selectedVersion)
                console.log("conetnt fetch versions", fetched_Data)

                setContent(fetched_Data?.result?.content)
                // setOriginalContent(data?.result?.content)
                socket.emit('save-document', { documentId, content })
                socket.emit('remove-version', { documentId, selectedVersion })
                console.log("content", content, "original", OriginalContent)
                setEnableRestore(false)
                displayVersions()
            }
            fetchDocumentversionData()


        } else {
            // setContent(OriginalContent)
            setContent('')
        }
    }

    const displayUsers = () => {
        setShowUsers(prev => !prev)
    }


    const displayVersions = () => {
        setShowVersions(prev => !prev)
    }


    const executeCode = () => {
        setRunCode(true)
    }

    const closeExecuter = () => {
        setRunCode(false)
    }



    return (

        <div className="flex flex-col md:flex-col sm:flex-col w-full h-screen  bg-gray-50">

            {/*Users n version history*/}
            <div className='flex flex-col md:flex-row sm:flex-row w-full h-max py-4 px-2 justify-between items-center gap-4'>
                <div className="w-max bg-gray-900 text-black rounded-lg  text-center items-center ">
                    <input
                        type="text"
                        value={docTitle}
                        // onClick={()=>setIsEditingTitle(true)}
                        onKeyDown={handleKeyDown}

                        onChange={(e) => setDocTitle(e.target.value)}
                        // onBlur={() => setIsEditable(false)}
                        className="text-center items-center font-semibold w-max"
                        placeholder="Enter Document Title..."
                    // disabled={!IsEditingTitle}
                    />
                </div>
                <div>
                    {typingUser && (
                        <p className="text-lg text-center text-violet-800">{typingUser} is typing...</p>
                    )}
                </div>
                <div className='flex flex-row justify-between gap-4'>
                    <div className="relative">
                        <button
                            className='relative bg-[#007BFF] px-2 py-2 w-24 rounded-3xl text-white hover:bg-blue-600'
                            onClick={displayUsers}
                        >
                            Users
                        </button>

                        {showUsers && (
                            <div className="absolute top-full sm:right-20 md:right-20 lg:right-0 mt-2 w-[300px] flex items-center justify-end bg-transparent bg-opacity-50 z-50
                                            ">
                                <div className="relative w-full h-[60vh] bg-gray-800 p-6 shadow-2xl rounded-xl">


                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-center text-white mb-4">Active Users</h3>

                                    {/* Active Users List */}
                                    <div className="overflow-y-auto h-[80%] px-4">
                                        <ActiveUsers activeUsers={activeUsers} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='relative'>
                        <div>
                            {checkedDocs[documentId] && (
                                <button
                                    className=' relative bg-[#5CB85C] px-2 py-2 w-24 rounded-3xl text-white hover:bg-green-600'
                                    onClick={() => { displayVersions() }}
                                >verisons</button>
                            )}

                        </div>
                        {(showVersions && checkedDocs[documentId]) && (
                            <div className="absolute top-full right-0 mt-2 w-[400px] flex items-center justify-end bg-transparent bg-opacity-50 z-50">
                                <div className="relative w-full h-[90vh] bg-gray-800 p-6 shadow-2xl rounded-xl">


                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-center text-white mb-4">Versions history</h3>

                                    {/* Active Users List */}
                                    <div className="overflow-y-auto h-[90%] px-4">
                                        <DocumentVersions
                                            versionedDocuments={versionedDocuments}
                                            getVersionIndex={getVersionIndex}
                                            selectedVersionIndex={selectedVersionIndex}
                                            setSelectedVersionIndex={setSelectedVersionIndex}
                                            restoreOriginalContent={restoreOriginalContent}
                                            setShowBackBtn={setShowBackBtn}
                                            showBackBtn={showBackBtn}
                                            removeVersionIndex={removeVersionIndex}
                                        />
                                    </div>
                                </div>
                            </div>


                        )}
                    </div>
                    <div>
                        <button
                            onClick={closeDocument}
                            className="px-7 py-2 bg-red-500 text-white rounded-3xl shadow-md hover:bg-red-600 transition-all"
                        >
                            Close
                        </button>
                    </div>



                </div>
            </div>
            <div className="flex flex-col w-[100%] md:w-full sm:w-2/3 items-center p-6 ">
                {/*Editor Panel Code */}
                {/* {styles} */}
                {(selectedLanguage === "plaintext" || selectedLanguage === "json") ? (


                    <TextEditor
                        selectedLanguage={selectedLanguage}
                        restoreSelectedVersionContent={restoreSelectedVersionContent}
                        enableRestore={enableRestore}
                        saveDocument={saveDocument}
                        content={content}

                        handleEditorChange={handleEditorChange}



                    />
                ) :
                    <CodeEditor
                        selectedLanguage={selectedLanguage}
                        restoreSelectedVersionContent={restoreSelectedVersionContent}
                        enableRestore={enableRestore}
                        saveDocument={saveDocument}
                        content={content}
                        runCode={runCode}
                        executeCode={executeCode}
                        closeExecuter={closeExecuter}
                        handleEditorChange={handleEditorChange}

                    />

                }

            </div>
        </div>

    );
};

export default DocumentEditor;
