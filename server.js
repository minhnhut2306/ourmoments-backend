const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/connections_mongdb");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const indexRouter = require("./src/route/routes");

app.use("/", indexRouter);

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});
