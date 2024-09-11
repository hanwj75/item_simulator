import express from "express";
import { prisma } from "../utils/prisma/index.js";
const router = express.Router();

/*아이템 생성 API*/
router.post("/items", async (req, res, next) => {
  const { itemCode, itemName, itemStat, itemPrice } = req.body;
  try {
    //필수 입력값 확인
    if (!itemCode || !itemName || !itemStat || !itemPrice) {
      return res
        .status(400)
        .json({ message: "아이템 정보가 입력되지 않았습니다." });
    }

    //아이템 코드 중복 검사
    const existsItem = await prisma.items.findUnique({
      where: {
        itemCode: itemCode,
      },
    });
    if (existsItem) {
      return res.status(409).json({ message: "이미 존재하는 아이템 입니다." });
    }
    //아이템 이름 중복 검사
    const existsItemName = await prisma.items.findUnique({
      where: { itemName: itemName },
    });
    if (existsItemName) {
      return res
        .status(409)
        .json({ message: "이미 존재하는 아이템 이름 입니다." });
    }

    //아이템 생성
    const item = await prisma.items.create({
      data: {
        itemCode: itemCode,
        itemName: itemName,
        itemStat: { health: itemStat.health, itemStr: itemStat.itemStr },
        itemPrice: itemPrice,
      },
    });
    return res.status(201).json({ data: item });
  } catch (error) {
    throw new Error("서버에 오류가 발생했습니다.");
  }
});

export default router;
