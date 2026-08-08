import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput, Member, MemberInput } from "../libs/types/member";
import Errors, { HttpCode } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";

const authService = new AuthService();
const memberService = new MemberService();
const memberController: T = {};


memberController.getShop = async (req: Request, res: Response) => {
    try {
        console.log("getShop page");

        const result = await memberService.getShop();
        console.log(result);

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getShop:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log("signup page")
        const input: MemberInput = req.body,
            result: Member = await memberService.signup(input),
            token = await authService.createToken(result);
        res.cookie("accessToken", token, {
            maxAge: AUTH_TIMER * 3600 * 1000,
            httpOnly: false,
        });
        res.status(HttpCode.CREATED).json({ member: result });
    } catch (err) {
        console.log("Error, signup:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

memberController.login = async (req: Request, res: Response) => {
    try {
        console.log("login page")
        const input: LoginInput = req.body

        const result: Member = await memberService.login(input)

        const token = await authService.createToken(result);
        res.cookie("accessToken", token, {
            maxAge: AUTH_TIMER * 3600 * 1000,
            httpOnly: false,
        });
        res.status(HttpCode.OK).json({ member: result });
    } catch (err) {
        console.log("Error, login:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}

memberController.logout = (req: ExtendedRequest, res: Response) => {
    try {
        console.log("logout");
        res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
        //finds access token and changes its time to 0
        res.status(HttpCode.OK).json({ logout: true });
    } catch (err) {
        console.log("Error, verifyAuth:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

memberController.getMemberDetail = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("getMemberDetail");
        console.log(req.member)
        const result = await memberService.getMemberDetail(req.member);
        res.status(HttpCode.OK).json(result)
    } catch (err) {
        console.log("Error, getMemberDetail:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};




export default memberController;