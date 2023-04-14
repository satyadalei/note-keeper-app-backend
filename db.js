const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const mongoURI = process.env.MONGO_URL;
const connectToMongoDB = async function () {
  try {
   mongoose.connect(mongoURI);
    console.log("connected Success fully");
  } catch (error) {
    console.log(error); 
  }
}
module.exports = connectToMongoDB;