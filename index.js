const express = require("express");
const { dev } = require("./config");
const chalk = require("chalk");
const { clientError, serverError } = require("./controllers/error");
const userRoute = require("./routes/users");
const connectDB = require("./config/db");
const adminRoute = require("./routes/admin");

const app = express();

const port = dev.app.port || 3007;

app.set("view engine", "ejs");

app.listen(port, async () => {
  console.log(chalk.blue(`Server is connected at http://localhost:${port}`));
  await connectDB();
});

app.get("/test", (req, res) => {
  res.render("test");
});

app.use("/admin", adminRoute);

app.use(userRoute);

app.use(clientError);
app.use(serverError);
