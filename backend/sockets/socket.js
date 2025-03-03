module.exports = (io) =>{
    const Document = require('../models/document');
    const Versions  = require('../models/Versions');
    const User = require('../models/user');
    const Notification = require('../models/notifications');
    const jwt = require('jsonwebtoken')
let documentUsers = {}
let socketUsers = {}
let MapUserIDToSocketID={}
let userName = ""
let savedBy=""
io.on('connection', (socket) => {
    
    if (!io) {
        console.error("Socket.io instance is undefined!");
        return;
    }
    io.use((socket, next) => {
        console.log("Handshake Data:", socket.handshake);
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT token
            socket.user = decoded; // Store user info in socket
            console.log("socket",socket.user)
            socketUsers[socket.user.userId] = {"socketId":socket.id,"username":socket.user.username}
            console.log("socketUsers",socketUsers)
            next();
        } catch (error) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });
    console.log('User connected:', socket.id);
    io.emit("userConnected", { id: socket.id });
    
    socket.on("joinDocument", async ({ documentId, userId }) => {
        
        console.log("userId->", userId);
    
        if (!documentUsers[documentId]) {
            documentUsers[documentId] = []; // Initialize if not present
        }
    
        if (!documentUsers[documentId].includes(userId)) {
            documentUsers[documentId].push(userId);
        }
    
        socket.join(documentId); // Ensure socket joins the specific document room
        console.log(`User joined document: ${documentId}`);
    
        try {
            const document = await Document.findById(documentId);
            if (document) {
                socket.emit("load-document", document.content);
            }
        } catch (err) {
            console.error("Error loading document:", err);
        }
    
        // Remove null values (optional, but defensive)
        if (!documentUsers[documentId]) {
            console.warn(`documentUsers[${documentId}] is undefined, initializing it.`);
            documentUsers[documentId] = [];  // Initialize it
        }
        
        documentUsers[documentId] = documentUsers[documentId].filter(user => user !== null);
        
        
        console.log(documentUsers)
        // Send active users for this specific document only
        io.to(documentId).emit("activeUsers", documentUsers[documentId]);
        
    });
    socket.on("send-group-notification", async ({ documentId, userId }) => {
        console.log("saveBy", userId);
        let documentTitle = ""
        try {
            // Fetch the document from the database
            let fetchTheDocument = await Document.findById(documentId);
            if (!fetchTheDocument) {
                console.error("Document not found");
                return;
            }
            
            documentTitle = fetchTheDocument.title
            console.log("fetchTheDocument", fetchTheDocument);
    
            // Get the list of users (collaborators + owner)
            let sendNotificationToUsers = [...fetchTheDocument.collaborators, fetchTheDocument.owner];
    
            console.log("sendNotificationToUsers", sendNotificationToUsers);
    
            // Ensure userId is in the same format for comparison
            const userIdStr = userId;
    
            // Filter out the current user (so they don't receive their own notification)
            let sendNotifications = sendNotificationToUsers.filter(id => id.toString() !== userIdStr);
            // let sendNotifications  =sendNotificationToUsers
            console.log("sendNotifications", sendNotifications);
            savedBy = await User.findById(userId)
            savedBy= savedBy.username
            sendNotifications.forEach(async(user)=>{
                userName= await User.findById(user)
                userName = userName.username
                console.log("Notifying user:", user,user.toString(),userName);
                const message = `${savedBy} made changes in the document ${documentTitle}`;
                console.log("message",message)
                await Notification.findOneAndUpdate(
                    {userId: user.toString()},
                    { $push: { messages: { readMessage:false, docId: documentId, text: message, createdAt: new Date()} } },
                    { upsert: true, new: true }
                );
                console.log("notification created..")
            })

        io.to(documentId).emit("notification", `${savedBy} user made changes to the document ${documentTitle}`);
           
            
        } catch (err) {
            console.error("Error in send-group-notification:", err);
        }
    });

    socket.on('user-read-notifications',async(userId)=>{
        console.log("userId",userId,typeof(userId))
        const aaa = await Notification.updateOne(
            { userId: userId}, 
            { $set: { "messages.$[].readMessage": true } }
        );
        console.log("aaa",aaa)
    });
    
    

    socket.on('share-access',async({docId,users})=>{
        // console.log(users,Array.isArray(users))
        if (!Array.isArray(users)) {
            console.log("not array ->array")
            users = [users]; // Convert to an array if it's a single string
        }
        try {
            const documents = await Document.findById(docId);
            if(!documents){
                console.log('no ducment')
            }
            // console.log(documents)
            const collaboratorEmails = documents.collaborators
            const NewEmailSet = [...collaboratorEmails,...users]
            // console.log(NewEmailSet)
            documents.collaborators = [...collaboratorEmails,...users]
            await documents.save()
            socket.emit('access-shared',documents)
        } catch (error) {
            console.error("Error loading document:", error);
        }
    })

    socket.on('documentDeleted',async({documentId})=>{
        try {
            const document = await Document.findByIdAndDelete(documentId);
            if(!document){
                console.log("no document")
                return 
            }
            console.log("document deleted.")
            io.emit('document-deleted-server',documentId)
        } catch (error) {
            console.log(error)
        }
    });

    socket.on('delete-users-notification-selected',async({userId,documentId,index})=>{
        try {
            const notification_extracted = await Notification.findOne({userId});
            notification_extracted.messages.splice(index, 1);
            await notification_extracted.save();
            console.log("Message deleted successfully.");
        } catch (error) {
            console.log("error",error);
        }
    })


    socket.on("leaveDocument",async({ documentId, userId })=>{
        if (documentUsers[documentId]) {
            documentUsers[documentId] = documentUsers[documentId].filter(id => id !== userId);
    
            // If no users remain in this document, optionally delete the entry
            if (documentUsers[documentId].length === 0) {
                delete documentUsers[documentId];
            }
        }
    
        console.log("documentUsers",documentUsers)
        // Notify remaining users about the updated list
        io.to(documentId).emit("activeUsers", documentUsers[documentId] || []);
    })

    socket.on('document-added-server',async({document})=>{
        console.log('new document created..',document)
        socket.emit('document-created',{document})
    })
    

    socket.on('send-changes', ({ documentId, content }) => {
        socket.to(documentId).emit('receive-changes', content);
    });

    socket.on('save-document', async ({ documentId, content }) => {
        // console.log('documentId',documentId)
        await Document.findByIdAndUpdate(documentId, { content });
        // console.log('Document saved:', documentId);
    });
   

      
    socket.on('save-version', async ({ docTitle, documentId, content, lastSaved, userId }) => {
        try {
            console.log({ docTitle, documentId, content, lastSaved, userId });
    
            const document = await Document.findById(documentId);
            if (!document) {
                console.log('Document not found');
                return;
            }
    
            console.log("wdcvbwnjd",document);
    
            // Find the latest version
            const latestVersion = await Versions.findOne({ DocId: documentId })
                .sort({ __v: -1 }) // Get the latest __v
                .lean();
    
            const newVersion = latestVersion ? latestVersion.__v + 1 : 0;
            console.log("latest",latestVersion,"new",newVersion)
            // Create new version document
            const newDoc = new Versions({
                title: document.title,
                DocId:documentId,
                lastSaved: lastSaved,
                savedBy: userId,
                content: content,
                __v: newVersion,
            });
            console.log("new doc",newDoc)
            await newDoc.save();
    
            // Fetch all versions sorted by __v
            const documents = await Versions.find({ DocId: documentId }).sort({ __v: -1 }).lean();
            console.log("documents======>",documents)
            io.to(documentId).emit('version-saved', {documents});
        } catch (error) {
            console.error('Error saving version:', error);
        }
    });
    
    socket.on('remove-version',async({documentId,selectedVersion})=>{
        await Versions.findOneAndDelete({ DocId: documentId, __v: selectedVersion });
        const documents = await Versions.find({ DocId: documentId }).sort({ __v: -1 }).lean();
        console.log("documents======>",documents)
        io.to(documentId).emit('latestVersions', {documents});
    })
    
   
    socket.on('user-typing', ({ documentId, userId}) => {
        console.log({ documentId, userId })
        io.to(documentId).emit('user-typing', { userId });
    });
    socket.on('user-stopped-typing', ({ documentId}) => {
        io.to(documentId).emit('user-stopped-typing');
    });

    socket.on("disconnect", () => {
        for (const docId in documentUsers) {
            documentUsers[docId] = documentUsers[docId].filter((user) => user !== socket.userId);
            io.to(docId).emit("activeUsers", { users: documentUsers[docId], documentId: docId });
        }
        console.log("A user disconnected:", socket.id);
        
    });
});
}