const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { connectToDB } = require("./db/dbConnection");
const errorHandler = require("./middlewares/errorHandler");
const problemsRoute = require("./routes/problems");
const userRoute = require("./routes/user");

dotenv.config();

connectToDB();

const PORT = process.env.PORT,
  app = express();

app.use(
  cors({
    origin: "https://codemore.herokuapp.com",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/problems", problemsRoute);
app.use("/api/user", userRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "build", "index.html"))
  );
} else {
  app.get("/", (req, res) =>
    res.send("You are currently accessing development environment")
  );
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
