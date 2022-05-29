const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const { connectToDB } = require("./db/dbConnection");
const errorHandler = require("./middlewares/errorHandler");
const problemsRoute = require("./routes/problems");
const userRoute = require("./routes/user");

dotenv.config();

connectToDB();

const PORT = process.env.PORT,
  app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/problems", problemsRoute);
app.use("/user", userRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
