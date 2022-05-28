const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    const mongo = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connection established at: ${mongo.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = { connectToDB };
