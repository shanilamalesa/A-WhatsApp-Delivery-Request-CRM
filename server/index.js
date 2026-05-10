const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const webhookRouter = require("./routes/webhook");
const apiRouter = require("./routes/api");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

app.use('/webhook', webhookRouter);
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})