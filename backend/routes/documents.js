const router = require('express').Router();
const documetsModel = require('../models/document');
const verifyToken = require('../routes/auth')
const Versions = require('../models/Versions')


router.get('/', verifyToken,async(req,res)=>{
    const id = req?.user?.userId;
    // console.log(req?.user?.userId,id)
    try {
        const documets = await documetsModel.find({
            $or: [
              { owner: id }, 
              { collaborators: id }
            ]
          });
        if(!documets){
            return res.status(404).json({
                success:false,
                ok:false,
                status:404,
                message:"No documents found."
            });
        }
            return res.status(200).json({
                success:true,
                ok:true,
                status:200,
                results:documets
            });
        
    } catch (error) {
        throw new Error("Failed to get document: ",error);
    }
});

router.get('/document/:docid',async(req,res)=>{
    const {docid}=req.params;
    // console.log(docid)
    try {
        const document = await documetsModel.findById(docid)
        if(!document) return res.status(404).json({
            success:false,
            ok:false,
            status:404,
            message:"No document found."
        });
        return res.status(200).json({
            success:true,
            ok:true,
            status:200,
            result:document
        });
    } catch (error) {
        throw new Error("Failed to get document: ",error);
    }
});

router.post('/createDocument',async(req,res)=>{
    const {title,content,owner,collaborators=[]} = req.body
    try {
        const checkDocument = await documetsModel.findOne({title,owner});

        if(checkDocument){
            return res.json({
                success:true,
                ok:false,
                status:400,
                message:"Documnet Already Exists."
            });
        }else{
            const newDoc = new documetsModel({
                ...req.body
            });
            console.log(newDoc);
            await newDoc.save();
            return res.status(200).json({
                success:true,
                ok:true,
                status:200,
                message:"Document Created Successfully.",
                result:newDoc
            });
        }
    } catch (error) {
        throw new Error("Failed to create document: ",error);
    }
});

router.put('/edit/:docid',verifyToken,async(req,res)=>{
    const {docid}= req.params;
    const docTitle=req.body.docTitle;
    console.log(docTitle,docid)
    
    try {
        const document = await documetsModel.findById(docid);
        console.log(document)
        if(!document){
            return res.status(404)
        }
        document.title = docTitle
        await document.save();
        return res.json({
            status:200,
            ok:true,
            result:document
        })
    } catch (error) {
        console.log(error)
    }
});

router.put('/shareAccess/:docid',async(req,res)=>{
    const {emails} = req.body;
    console.log(emails,typeof(emails))
})

router.delete('/:docid',async(req,res)=>{
    const {docid} =req.params;

    try {
        const document = await documetsModel.findByIdAndDelete(docid);
        console.log(document)
        if(!document){
            return res.json({
                ok:false,
                message:"no document found",
                status:404
            })
        }
        return res.json({
            ok:true,
            status:200,
            result:document
        })
    } catch (error) {
        return res.json({
            ok:false,
            message:"Failed to get document: "+error,
            status:500
        })
    }
});


router.get('/versions/:documentId', async (req, res) => {
    const { documentId } = req.params;
    console.log("Document ID:", documentId);

    try {
        const documents = await Versions.find({ DocId: documentId }).sort({ __v: -1 }).lean();
        console.log("Documents fetched:", documents);

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No versions found",
            });
        }

        return res.status(200).json({
            success: true,
            result: documents,
        });

    } catch (error) {
        console.error("Error fetching document versions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.get('/versions/:documentId/:selectedVersion', async (req, res) => {
    const { documentId, selectedVersion } = req.params;
    console.log("Document ID:", documentId,"version",selectedVersion);

    try {
        const document = await Versions.findOne({ DocId: documentId ,__v:selectedVersion});
        console.log("Documents fetched:", document);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "No versions found",
            });
        }

        return res.status(200).json({
            success: true,
            result: document,
        });

    } catch (error) {
        console.error("Error fetching document versions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.put('/update-title/:documentId',async(req,res)=>{
    const {documentId} =req.params;
    const{title} = req.body
    try {
        const document = await documetsModel.findByIdAndUpdate(documentId,{title});
        console.log(document)
        if(!document){
            return res.json({
                ok:false,
                message:"no document found",
                status:404
            })
        }
        return res.json({
            ok:true,
            status:200,
            result:document
        })
    } catch (error) {
        return res.json({
            ok:false,
            message:"Failed to get document: "+error,
            status:500
        })
    }
});

module.exports = router;