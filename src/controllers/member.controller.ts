import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { Member, MemberInput } from "../libs/types/member";
import Errors, { HttpCode } from "../libs/Errors";


const memberService = new MemberService();
const memberController: T = {};

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log("signup page")
        const input: MemberInput = req.body,
            result: Member = await memberService.signup(input)


        res.status(HttpCode.CREATED).json({ member: result });
    } catch (err) {
        console.log("Error, signup:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};





export default memberController;