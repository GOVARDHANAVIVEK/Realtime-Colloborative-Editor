const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const { rateLimit } = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const connectMongooseDB = require('./config/db');
const Document = require('./models/document')
const Versions = require('./models/Versions')
const app = express();
const server = http.createServer(app);
const passport = require('passport')
const session = require("express-session");
const configurePassport =require('./config/passport')
const io = socketIo(server, {
    cors: { origin: ["http://localhost:5173","https://realtime-colloborative-editor.vercel.app"], credentials: true }
});

const PORT = process.env.PORT || 3900;
const documentRoute = require('./routes/documents');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users')

// Middleware
connectMongooseDB();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors({
    origin: ["http://localhost:5173","https://realtime-colloborative-editor-1.onrender.com"],
    credentials: true
}));
app.use(
    session({
      secret: process.env.SESSION_SECRET || "your_secret_key",
      resave: false,
      saveUninitialized: true,
    })
  );
app.use(passport.initialize())
app.use(passport.session())
const limiter = rateLimit({
    windowMs: 25 * 60 * 1000, // 15 minutes
    limit: 500, // Max 100 requests per window
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});
configurePassport();
// app.use(limiter);

// Routes
app.use('/api/auth', authRoute);
app.use('/api/documents', documentRoute);
app.use('/api/users', usersRoute);
// WebSocket Logic
let documentUsers = {}
io.on('connection', (socket) => {
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

// Start the server
server.listen(PORT ||3900, () => {
    console.log(`Running on port ${PORT}`);
});
