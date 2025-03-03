
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
// import socket from "./socket";
import { useSocket } from "./SocketProvider";
import DocAccess from "./DocAccess";
import { useNotification } from './NotificationProvider'
const Document = ({ doc, userId }) => {
    const socket = useSocket()
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [showAccess, setShowAccess] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    console.log('id', doc.id)
    const [showMenu, setShowMenu] = useState(false);
    const [documentName, setDocumentName] = useState(doc.title);

    const [checkedDocs, setCheckedDocs] = useState(() => {
        const savedState = localStorage.getItem("checkedDocs");
        return savedState ? JSON.parse(savedState) : {};
    });

    // Update localStorage whenever the checkbox state changes
    useEffect(() => {
        localStorage.setItem("checkedDocs", JSON.stringify(checkedDocs));
    }, [checkedDocs]);

    // Toggle checkbox for the selected document
    const EnableVersionControl = (docId) => {
        setCheckedDocs((prev) => ({
            ...prev,
            [docId]: !prev[docId], // Toggle the value
        }));
    };

    const onDelete = useCallback((docid) => {
        socket.emit('documentDeleted', { documentId: docid });
        setShowMenu(false)
        showNotification(`Document - '${doc?.title}' deleted!`, "success");

    }, [doc, showNotification]);


    const onShare = useCallback((docid) => {
        setShowAccess(true)
        setSelectedDocId(docid)
        setShowMenu(false)
        console.log('access shared and fecting documents')


    }, []);

    const onDownload = useCallback(async (doc) => {
        console.log("document", doc)
        if (!doc || !doc.content || !doc.title) {
            alert("Invalid document data");
            return;
        }

        // Create a Blob from the document content
        const blob = new Blob([doc.content], { type: "text/plain" }); // Adjust MIME type as needed
        const url = window.URL.createObjectURL(blob);
        console.log("url", url)
        // Create a hidden anchor element to trigger the download
        const link = document.createElement("a");
        link.href = url;
        console.log("link", link)
        link.setAttribute("download", doc.title); // Set filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup URL object
        window.URL.revokeObjectURL(url);

    }, []);
    return (
        <>

            <div className="bg-white border border-gray-300 rounded-lg shadow-md flex flex-col overflow-hidden w-56 h-70">
                {/* Header Section */}
                <div className="w-full bg-yellow-600 text-white text-center py-2 font-semibold flex flex-row  px-2">

                    {/* Options Menu */}
                    <button
                        className="w-[15%] text-white text-lg ml-auto cursor-pointer"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        ⋮
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute mt-8 bg-white border border-gray-300 shadow-xl rounded-lg max-w-sm w-56 z-10 p-5">
                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-3">
                                {doc.owner === userId && (
                                    <button
                                        className="cursor-pointer w-full px-4 py-2 text-red-600 font-medium bg-red-50 rounded-md hover:bg-red-100 transition"
                                        onClick={() => onDelete(doc._id)}
                                    >
                                        🗑 Delete
                                    </button>
                                )}
                                <button
                                    className="cursor-pointer w-full px-4 py-2 text-blue-600 font-medium bg-blue-50 rounded-md hover:bg-blue-100 transition"
                                    onClick={() => onShare(doc._id)}
                                >
                                    🔗 Share Access
                                </button>
                                <button
                                    className="cursor-pointer w-full px-4 py-2 text-black font-medium bg-green-50 rounded-md hover:bg-green-100 transition"
                                    onClick={() => onDownload(doc)}
                                >
                                    ⬇️ Download
                                </button>
                            </div>

                            {/* Checkbox for Document Versions */}
                            <div
                                className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition cursor-pointer"
                                onClick={() => EnableVersionControl(doc._id)} // Toggle on div click
                            >
                                <label htmlFor={`documentVersions-${doc._id}`} className="text-gray-800 text-sm font-medium cursor-pointer"
                                >
                                    Enable Versions
                                </label>
                                <input
                                    id={`documentVersions-${doc._id}`}
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                                    checked={checkedDocs[doc._id] || false} // Controlled checkbox
                                    readOnly // Prevent manual toggling
                                    onChange={() => setShowMenu(false)}
                                />
                            </div>
                        </div>



                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-center items-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mt-3">{doc.title}</h3>
                </div>

                {/* Footer Section */}
                <div className="border-1 border-gray-200 py-2 text-center w-full bg-blue-600 rounded-lg font-semibold">
                    <button className="text-white hover:underline cursor-pointer" onClick={() => navigate(`/document/editor/${doc._id}`)}>Open</button>
                </div>
            </div>


            {showAccess && <DocAccess docId={selectedDocId} documentName={documentName} onClose={() => setShowAccess(false)} />}
        </>
    );


}

export default Document