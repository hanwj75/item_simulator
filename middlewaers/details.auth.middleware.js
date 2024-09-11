import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

const env = process.env;

export default async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new Error("요청한 사용자의 토큰이 존재하지 않습니다.");
    }
    const [tokenType, JWT_ACCESS_TOKEN] = authHeader.split(" ");
    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 Bearer가 아닙니다.");
    const decodedToken = jwt.verify(JWT_ACCESS_TOKEN, env.JWT_TOKEN_SECRETKEY);
    const userId = decodedToken.userId;
    const userMoney = decodedToken.userMoney;

    const user = await prisma.account.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }
    req.user = { ...user, userMoney };
    next();
  } catch (error) {
    next();
  }
};
