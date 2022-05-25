const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 5000, app = express();

app.get('/', (req, res) => {
  res.send('Welcome!!');
})

app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
