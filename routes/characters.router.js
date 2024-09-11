import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewaers/auth.middleware.js";
import detailsAuthMiddleware from "../middlewaers/details.auth.middleware.js";

const router = express.Router();

/*캐릭터 생성 API*/

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

/*캐릭터 삭제 API*/

router.delete(
  "/characters/:characterId",
  authMiddleware,
  async (req, res, next) => {
    const { characterId } = req.params;
    const { accountId } = req.user;
    try {
      //캐릭터 조회
      const character = await prisma.characters.findFirst({
        where: { characterId: +characterId },
      });

      //캐릭터가 존재하지 않을시
      if (!character) {
        return res.status(404).json({ message: "캐릭터가 존재하지 않습니다." });
      }
      //캐릭터의 계정ID와 사용자의 계정ID가 일치하는지 확인
      if (character.accountId !== accountId) {
        return res.status(403).json({ message: "본인의 캐릭터가 아닙니다." });
      }
      //캐릭터 삭제
      await prisma.characters.delete({
        where: { characterId: +characterId },
      });
      return res.status(200).json({ message: "캐릭터가 삭제되었습니다." });
    } catch (error) {
      throw new Error("서버 오류가 발생했습니다.");
    }
  },
);

/*캐릭터 상세보기API*/

router.get(
  "/characters/:characterId",
  detailsAuthMiddleware,
  async (req, res, next) => {
    const { characterId } = req.params;

    //캐릭터 조회
    const character = await prisma.characters.findFirst({
      where: { characterId: +characterId },
    });
    if (!character) {
      return res.status(404).json({ message: "존재하지 않는 캐릭터입니다." });
    }
    //존재하는 캐릭터를 조회할경우
    const characterData = {
      characterName: character.characterName,
      characterHp: character.characterHp,
      characterStr: character.characterStr,
    };
    //토큰이 있을경우에만 userMoney를 추가함
    if (req.user) {
      characterData.userMoney = character.userMoney;
    }
    return res.status(200).json(characterData);
  },
);

export default router;
