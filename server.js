const express = require("express");
const bot = require("./bot");

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  await bot.handleUpdate(req.body);
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Local bot running on http://localhost:3000");
});