const router = require('express').Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User  = require('../models/user')
const passport = require('passport')
router.post('/signup', async (req, res) => {
    // console.log("signup...........");
    const { username, password, email,gender } = req.body;

    try {
        const user = new User({
            username: username,
            password: password,
            email: email,
            gender:gender
        })
        // console.log("user", user)
        const existinguser = await User.findOne({ email: email });
        console.log("existinguser",existinguser)
        if (existinguser) {
            
            return res.json({
                success:true,
                ok:false,
                status:400,
                Message:"Email already exists"
            })
            
            
        } else {
            const existingusername = await User.findOne({ username: username });
            // console.log(existingusername,existingusername.Username === username)
            if(existingusername && (existingusername.username === username)){
                return res.json({
                    success:true,
                    ok:false,
                    status:400,
                    Message:"Username already exists"
                })
            }
            if (username.length < 3 || username.length > 25) {
                return res.json({
                    success:true,
                    ok:false,
                    status:400,
                    Message:"Username must be between 3 and 15 characters long"
                })
            }
            if (!/^[a-zA-Z0-9_ ]+$/.test(username)) {
                return res.json({
                    success:true,
                    ok:false,
                    status:400,
                    Message:"Username can only contain letters, numbers, and underscores"
                })
            }
            if (password.length < 8) {
                return res.json({
                    success:true,
                    ok:false,
                    status:400,
                    Message:"Password must be at least 8 characters long"
                })
            }
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
                return res.json({
                    success:true,
                    ok:false,
                    status:400,
                    Message:"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                })
                
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            // console.log("user", user)
            await user.save()
            const accesstoken = jwt.sign({ Username: user.username, Email: user.email, userId: user._id },
                JWT_secret = process.env.JWT_secret,
                { expiresIn: '30m' }
            );
            const refreshToken = jwt.sign(
                { Username: user.username, Email: user.email, userId: user._id },
                process.env.JWT_secret,
                { expiresIn: '1d' }
            );

            // Set refreshToken as an HTTP-only cookie
            res.cookie('refreshToken', refreshToken,
                //      {
                //     httpOnly: true,
                //     secure: true,         // Use in production over HTTPS
                //     sameSite: 'Strict',
                //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
                //   }
            );
            return res.json({
                success:true,
                ok:true,
                status:201,
                Message:"User registered successfully",
                result:accesstoken
            })
            
        }
    } catch (error) {
        return res.json({
            success:true,
            ok:false,
            status:500,
            Message:"Error registering user: "+error.message
        })
        
    }
});


router.post('/signin', [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const existinguser = await User.findOne({ email: email });
        // const userId = req.user.userId;
        // console.log(userId)
        console.log("existing user",existinguser)
        if (!existinguser) {
            return res.json({
                    response:true,
                    ok:false,
                    status:403,
                    type:"email",
                    Message:"Incorrect email or doesn't exists."
                });
            
        } else {

            const match = await bcrypt.compare(password, existinguser.password)
            // console.log("password match"+match)
            if (!match) {
                console.log("Incorrect password")
                return res.json({
                    response:true,
                    ok:false,
                    status:403,
                    type:"password",
                    Message:"Incorrect password."
                })
                
            } else {
                const accesstoken = jwt.sign({
                    email: email, userId: existinguser.
                        _id,username:existinguser.username
                },
                    JWT_secret = process.env.JWT_secret,
                    { expiresIn: '30m' }
                );
                // console.log("access->"+accesstoken)
                const refreshtoken = jwt.sign({ email: email, userId: existinguser.
                    _id,username:existinguser.username },
                    JWT_secret = process.env.JWT_secret,
                    { expiresIn: '1d' }
                );
                
                res.cookie('refreshToken', refreshtoken,
                    // {
                    //     httpOnly: true,       // Makes the cookie inaccessible to JavaScript in the client to prevent XSS attacks
                    //     secure: true,         // Ensures the cookie is sent over HTTPS only (useful in production)
                    //     sameSite: 'Strict',   // Helps prevent CSRF attacks
                    //     path: '/refresh',     // The path where the cookie is available, e.g., only on /refresh
                    //     maxAge: 24 * 60 * 60 * 1000 // Sets expiration (24 hours in this example)
                    // }
                );
                return res.json({
                    success:true,
                    ok:true,
                    status:201,
                    Message:"Login successfully",
                    result:accesstoken
                })
            }
        }
    } catch (error) {
        res.status(401).send({ message: "error" + error })
    }
})

router.get('/google',passport.authenticate('google',{scope:["profile",'email']}));

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication failed" });
      }
     
      
      // Generate JWT token
      const token = req.user.accessToken
      
      console.log("generated token: ",token)
      // Send token as JSON response
    //   return res.status(200).send({ message: "Login successfully", token });
    res.redirect(`http://localhost:5173?token=${token}`);
    }
  );


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    // console.log("token:::::", token)
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(403).send("Access denied, no token provided");
    }

    const actualToken = token.split(' ')[1];  // Extract the token
    try {
        const decoded = jwt.verify(actualToken, process.env.JWT_secret);  // Verify the token
         // Attach the decoded payload to the request
        req.user = decoded;
        // console.log("user------>"+JSON.stringify(req.user)) 
        next(); 
        // Proceed to the next middleware
    } catch (error) {
        res.status(401).send("Invalid token");
    }
};
router.post('/verify-token',verifyToken,(req,res)=>{
    return res.json({
        status:200,
        ok:true
    })
})
module.exports = [router,verifyToken];





