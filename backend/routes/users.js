const router = require('express').Router();

const User  = require('../models/user')


router.get("/getUser/:email",async(req,res)=>{
    const {email} = req.params;

    try {
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                message:"No user found",
                status:404,
                ok:false
            })
        }
        return res.json({
            status:200,
            ok:true,
            result:{
                userId:user._id,
                username:user.username
            }
        })
        
    } catch (error) {
      throw new Error('failed to get user info ',error)  
    }
})

router.get("/user/:userId", async (req, res) => {
    console.log("hello");
    const { userId } = req.params;
    console.log("id->:", userId);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "No user found",
                status: 404,
                ok: false
            });
        }

        return res.status(200).json({
            status: 200,
            ok: true,
            result: {
                userId: user._id,
                username: user.username  // ✅ Ensure correct field name
            }
        });

    } catch (error) {
        console.error("Error fetching user:", error); // Log actual error for debugging
        return res.status(500).json({
            message: "Failed to get user info",
            status: 500,
            ok: false,
            error: error.message // ✅ Send error message in response
        });
    }
});


router.get('/',async(req,res)=>{
    try {
        const users = await User.find();
        if(!users){
            return res.status(404)
        }
        return res.json({
            users
        })
    } catch (error) {
        
    }
})

module.exports = router;