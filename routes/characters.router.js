import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewaers/auth.middleware.js";

const router = express.Router();

//캐릭터 생성 API
router.post("/characters", authMiddleware, async (req, res, next) => {
  const { characterName } = req.body;
  const accountId = req.user.accountId;

  try {
    //캐릭터 이름 중복 체크
    const existsCharacter = await prisma.characters.findUnique({
      where: {
        characterName: characterName,
      },
    });
    if (existsCharacter) {
      return res
        .status(400)
        .json({ message: "이미 존재하는 캐릭터명 입니다." });
    }

    //새로운 캐릭터 생성
    const newCharacter = await prisma.characters.create({
      data: {
        characterName: characterName,
        accountId,
      },
    });
    return res.status(200).json({
      message: "캐릭터 생성이 완료되었습니다.",
      character: newCharacter,
    });
  } catch (error) {
    return res.status(500).json({ message: "서버 오류가 발생하였습니다." });
  }
});

export default router;
