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

/*아이템 수정 API*/
router.patch("/items/:itemCode", async (req, res, next) => {
  const { itemCode } = req.params;
  const { itemName, itemStat } = req.body;

  try {
    const updateItem = await prisma.items.update({
      where: { itemCode: +itemCode },
      data: {
        itemName: itemName,
        itemStat: itemStat,
      },
    });
    return res.status(200).json({
      itemCode: updateItem.itemCode,
      itemName: updateItem.itemName,
      itemStat: updateItem.itemStat,
    });
  } catch (error) {
    throw new Error("서버에 오류가 발생했습니다.");
  }
});

/*아이템 목록 조회 API*/

router.get("/items", async (req, res, next) => {
  try {
    const items = await prisma.items.findMany({
      select: {
        itemCode: true,
        itemName: true,
        itemPrice: true,
      },
    });
    return res.status(200).json(items);
  } catch (error) {
    throw new Error("서버에 오류가 발생했습니다.");
  }
});

export default router;
