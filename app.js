import express from "express";
import UserRouter from "./routes/users.router.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", [UserRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
