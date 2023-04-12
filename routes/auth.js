const express =  require('express');
const User = require('../models/User');
const router = express.Router();
// const User  = require('../models/User');

router.get("/",(req,res)=>{
    const newUser = new User(req.body)
    newUser.save();
   console.log(req.body);
   res.send(req.body);
})

module.exports = router;