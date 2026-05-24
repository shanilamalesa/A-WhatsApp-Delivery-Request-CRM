
const express = require("express");
const cors = require("cors");
//reads .env file
const dotenv = require("dotenv");
const webhookRouter = require("./routes/webhook");
const apiRouter = require("./routes/api");
const authRouter = require('./routes/auth.routes');
const rideRouter = require('./routes/ride.routes');
const riderRouter = require('./routes/rider.routes');

//loads .env file
dotenv.config();
const app = express();
//running the port and use 3000 as default
const PORT = process.env.PORT || 3000;

//activate the cor middleware
app.use(cors());

//express.json->perses incoming request and converts Json to js
//req.body ->saves the aw byte before they get converted
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

app.use('/api/auth', authRouter);
app.use('/api/rides', rideRouter);
app.use('/api/riders', riderRouter);
//activate the webhook, and api router
app.use('/webhook', webhookRouter);
app.use('/api', apiRouter);


//staring the actual server and runs it at port 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})