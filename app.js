const dotenv = require('dotenv').config();
const express = require('express');
const connectToMongoDB = require('./db');
connectToMongoDB();
const app = express();
app.use(express.json());


app.use("/api/auth", require('./routes/auth'));
app.use("/api/note", require('./routes/notes'));
app.get("/",function(req,res){
   res.send("Hello there we are listening you");
   console.log('Someone requesting');
})

app.listen(5000, ()=>{
  console.log("server started on port 5000");
})