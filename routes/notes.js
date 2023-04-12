const express = require('express');
const router = express.Router();

router.get("/",(req,res)=>{
    // res.json("Hello") ;
    res.send("Hello")
})


module.exports = router ;