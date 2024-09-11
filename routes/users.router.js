import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const env = process.env;
const router = express.Router();

/** 사용자 회원가입 API **/

router.post("/sign-up", async (req, res, next) => {
  const { userId, userPassword, checkPassword, userName } = req.body;

  //비밀번호 일치여부 확인
  if (
    !userPassword ||
    !checkPassword ||
    userPassword !== checkPassword ||
    userPassword.length < 6
  ) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  //사용자 존재여부 확인
  const isExistUser = await prisma.account.findUnique({
    where: {
      userId,
    },
  });

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
  }
  //비밀번호 해시화
  const hashedPassword = await bcrypt.hash(userPassword, 10);

  // Users 테이블에 사용자를 추가합니다.
  const user = await prisma.account.create({
    data: {
      userId,
      userPassword: hashedPassword,
      userName,
    },
  });

  return res.status(201).json({
    message: "회원가입이 완료되었습니다.",
    accountId: user.accountId,
    userId: user.userId,
    userName: user.userName,
  });
});

/*사용자 로그인 페이지*/

router.post("/login", async (req, res, next) => {
  const { userId, userPassword } = req.body;

  //사용자 아이디 확인
  const user = await prisma.account.findUnique({
    where: {
      userId: userId,
    },
  });
  //사용자 존재 여부 확인
  if (!user) {
    return res
      .status(401)
      .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
  }
  //비밀번호 확인
  const passwordValid = await bcrypt.compare(userPassword, user.userPassword);
  if (!passwordValid) {
    return res
      .status(401)
      .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
  }
  //jwt 토큰 생성
  const JWT_ACCESS_TOKEN = jwt.sign(
    { userId: user.userId },
    env.JWT_TOKEN_SECRETKEY,
    { expiresIn: "1h" },
  );
  res.header("authorization", `Bearer ${JWT_ACCESS_TOKEN}`);

  return res.status(200).json({
    message: "로그인에 성공했습니다.",
    JWT_ACCESS_TOKEN: JWT_ACCESS_TOKEN,
  });
});
export default router;
