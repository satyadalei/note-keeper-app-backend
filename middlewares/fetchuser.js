const dotenv = require('dotenv').config();
var jwt = require('jsonwebtoken');
const fetchuser = async (req,res,next)=>{
    const token = await req.header('auth-token'); // getting token from req header 
    if (!token) {
        // if token not found
        return res.status(401).json({ "message": "You are not authorized to access data"});
    }else{
        try {
            // token found and verify token
            const userVerifiedData = jwt.verify(token,process.env.JWT_SIGN_SECRET); // returns basic datas from token liek --> { id: '64370b8bbd09ea8ff4495a5d', iat: 1681371861 }
            req.userId = userVerifiedData.id; // adding user id to req params and passing to next 
            next();  
        } catch (error) {
            //if token not verified
            res.status(401).send("You are not authorized to acces");
        }
    }
}
module.exports = fetchuser;