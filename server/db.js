const mongoose = require("mongoose");
const config = require("config");

const connectDB = async () => {
  try {
    const options = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    };
    await mongoose.connect(config.get("databaseURI"), options);
    console.log("Connected successfully to database");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
