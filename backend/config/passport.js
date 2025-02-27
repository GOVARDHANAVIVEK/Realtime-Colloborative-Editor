const passport = require('passport')
const bcrypt = require('bcryptjs');
const GoogleOauth = require('passport-google-oauth20').Strategy
const User = require('../models/user');
const jwt = require('jsonwebtoken')
require('dotenv').config();



const configurePassport = async() =>{

    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });

    passport.deserializeUser(async(id,done)=>{
        try {
            const user = await User.findById(id);
            done(null,user);
        } catch (error) {
            done(error)
        }
    })
    passport.use(new GoogleOauth({
        clientID:process.env.Client_ID,
        clientSecret:process.env.Client_Secret,
        callbackURL:`${process.env.BACKEND_CALLBACK_URL}/api/auth/google/callback`,
        scope: ["profile", "email"]
        },
        async function(accessToken, refreshToken, profile, cb) {
            try {
                console.log("Google Profile Data:", JSON.stringify(profile, null, 2)); // Debugging line
        
                // Ensure emails exist before accessing them
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

                if (!email) {
                    return cb(new Error("No email found in Google profile"), null);
                }
                console.log("User Email:", email);

        
                let user = await User.findOne({ email });
                if (!user) {
                    user = new User({
                        username: profile.displayName || "No Name",
                        email: email,
                        googleId: profile.id,
                        password: null
                    });
                    await user.save();
                }
        
                // Generate JWT token
                const accessToken = jwt.sign(
                    { userId: user._id, email: user.email, username: user.username }, 
                    process.env.JWT_secret, 
                    { expiresIn: '30m' }
                );
        
                return cb(null, { user, accessToken });
            } catch (error) {
                return cb(error, null);
            }
        }
        
    ));
    
}


module.exports = configurePassport;