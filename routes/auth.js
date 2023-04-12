const dotenv = require('dotenv').config();
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

router.post("/", [
   body('email', "Enter a valid email").isEmail(),
   body('password', "Enter correct password").isLength({ min: 5 })
],
   async (req, res) => {
      // ------------- checking whether  user given right data ----------   
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      else {
         try {
            // --------------Finding that user if previously exist-------------
            const isUserExist = await User.findOne({ email: req.body.email });
            // returns null if not found bcoz of async await
            if (isUserExist) {
               // user found
               return res.status(400).json({ "Message": "This user already exist." })
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
               console.log(user.id);
               console.log(process.env.JWT_SIGN_SECRET);
               const token = jwt.sign(data,process.env.JWT_SIGN_SECRET)
               res.json({ user, token });
            }
         } catch (error) {
            console.log(error);
            return res.status(500).json({ "message": "Something gone wrong" });
         }
      }
   })

module.exports = router;