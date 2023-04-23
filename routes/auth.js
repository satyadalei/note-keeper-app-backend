const dotenv = require('dotenv').config(); // find env data
const express = require('express'); //
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchUser = require('../middlewares/fetchuser')

//::ROUTE:1:::++++++++++++++++++++++++ CREATE A USER ++++++++++++++++++++++++
router.post("/createuser", [
   body('email', "Enter a valid email").isEmail(),
   body('password', "Enter correct password").isLength({ min: 5 })
],
   async (req, res) => {
      // ------------- checking whether  user given right data ----------   
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         const msg = "invalid credentials";
         const success = false ;
         return res.status(400).json({ success,msg,errors: errors.array() });
      }
      else {
         try {
            // --------------Finding that user if previously exist-------------
            const isUserExist = await User.findOne({ email: req.body.email });
            // returns null if not found bcoz of async await
            if (isUserExist) {
               // user found
               const success = false;
               const msg = "user exists";
               return res.status(400).json({msg,success,"Message": "This user already exist." })
            } else {
               // create new user --
               const salt = await bcrypt.genSalt(10);
               const securePassword = await bcrypt.hash(req.body.password, salt);
               const user = User({
                  name: req.body.name,
                  email: req.body.email,
                  password:securePassword 
               })
               await user.save();
               const data = {
                  id : user.id
               }
               const userId = user._id;
               const success = true;
               const msg  = "user created";
               const token = jwt.sign(data,process.env.JWT_SIGN_SECRET)
               res.json({msg,success,token,userId : userId});
            }
         } catch (error) {
            const msg = "server error";
            const success = false;
            return res.status(500).json({ success,msg,"message": "Something gone wrong" });
         }
      }
   })
//::ROUTE:2:::++++++++++++++++++++++++ AUTHENTICATE A USER +++++++++++++++++++++++++++++++++
router.post("/login",[
   // check valid email or empty password
   body('email', "Enter a valid email").isEmail(),
   body('password', "Password can not be empty").exists()
   ],
   async (req,res)=>{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }else{
          const {email,password} = req.body;
          try {
            //--first find that user
            const user = await User.findOne({email});
            if (!user) {
               // --- user does not exit
               res.status(400).json({"Message":"Please login with correct credentials"})
            }else{
               //---user exists
               const validUser =await bcrypt.compare(password,user.password); // compare user password with saved password
               if(!validUser) {
                  const success  = false;
                  res.send({ success ,message :"not a Valid user"}); //password did not matched
               }else{
                  //password matched
                  const data = {
                     id : user.id
                  }
                  const success  = true;
                  const userId = user._id;
                  const token = jwt.sign(data,process.env.JWT_SIGN_SECRET)
                  res.json({success,token,userId:userId});
               }
            }
          } catch (error) {
            //nothing goes right then catch error
            console.log(error);
            return res.status(500).json({ "message": "Something gone wrong" });
          }
      }
   }
)
//::ROUTE:3:::+++++++++++++++++++++++::Get user after logIn :::++++++++++++++++++++++++++++
router.post("/getuser",fetchUser,async (req,res)=>{
   try {
     const userId = req.userId ;// stores only id of user
     const user = await User.findOne({id:userId}).select("-password");//gives user credentias without password
     console.log(user);
      res.send({user});
   } catch (error) {
      console.log(error);
      return res.status(500).json({ "message": "Something gone wrong" });
   }
})
module.exports = router;