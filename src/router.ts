import express from "express";
import memberController from "./controllers/member.controller";
const router = express.Router();

/* MEMBER */

router.get("/member/shop", memberController.getShop)
router.post("/member/signup", memberController.signup);
router.post("/member/login", memberController.login);


router.post(
    "/member/logout",
    memberController.verifyAuth,
    memberController.logout
);

router.get(
    "/member/detail",
    memberController.verifyAuth,
    memberController.getMemberDetail
);

/* PRODUCT */




/* USER */


export default router;