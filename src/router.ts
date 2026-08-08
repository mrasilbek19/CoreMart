import express from "express";
import memberController from "./controllers/member.controller";
const router = express.Router();

/* MEMBER */

router.get("/member/shop", memberController.getShop)
router.post("/member/signup", memberController.signup);


/* PRODUCT */




/* USER */


export default router;