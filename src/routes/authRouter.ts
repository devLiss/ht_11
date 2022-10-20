import {Router,Request, Response} from "express";
import {userService} from "../domain/user-service";
import {
    emailNotExistsValidation,
    emailRegValidation,
    emailVAlidator, loginRegValidation,
    loginValidator,
    passwordValidator
} from "../middlewares/userMiddleware";
import {inputValidationMiddleware, inputValidationMiddlewareV2} from "../middlewares/inputValidationMiddleware";
import {body} from "express-validator";
import {jwtService} from "../application/jwt-service";
import {authMiddleware} from "../middlewares/authMiddleware";
import {authService} from "../domain/auth-service";
import dayjs from "dayjs";
import {sessionService} from "../domain/session-service";

import rateLimit from 'express-rate-limit'
import {responseCountMiddleware} from "../middlewares/responseCountMiddleware";

export const authRouter = Router({})


authRouter.post('/login', body('login').trim().isLength({min:1}),body('password').trim().isLength({min:1}) , inputValidationMiddlewareV2, responseCountMiddleware, async (req:Request, res:Response)=>{
    const user = await userService.checkCredentials(req.body.login, req.body.password)
    if(!user){
        res.sendStatus(401)
        return
    }
    console.log("LOGIN USER")
    console.log(user)
    const session = await sessionService.createSession(user, req.ip, req.headers["user-agent"]!);

    if(!session){
        console.log("!!! NE SESSION !!! ")
        res.sendStatus(401)
        return
    }
    res.cookie('refreshToken', session.refreshToken, {
        secure:true,
        expires:  dayjs().add(20, "seconds").toDate(),
        httpOnly: true,
      });

    res.status(200).send({
        accessToken:session.accessToken
    })
})

authRouter.post('/password-recovery',body('email').trim().isLength({min:1}).isEmail(),inputValidationMiddleware,responseCountMiddleware, async (req:Request, res:Response)=>{
    /*console.log("PASSWORD-RECOVERY = ",req.body.email)
    if(!req.body.email){
        console.log("email is undefined")
        res.sendStatus(400)
        return
    }*/
    await authService.sendRecoveryCode(req.body.email);
    res.sendStatus(204)
})
authRouter.post('/new-password',body('newPassword').trim().isLength({min:6, max:20}),inputValidationMiddleware,responseCountMiddleware,async (req:Request, res:Response)=>{

    console.log(req.body.newPassword," NEW PASSWORD ",req.body.recoveryCode)
    const confirmation = await authService.confirmPassword(req.body.newPassword,req.body.recoveryCode)
    if(!confirmation){
        res.status(400).send({
            errorsMessages: [
                { message: "Некорректный recoveryCode", field: "recoveryCode" }
            ]
        })
        return
    }
    res.sendStatus(204)
})

authRouter.post('/refresh-token',async (req:Request, res:Response)=> {

    if(!req.cookies.refreshToken){
        res.sendStatus(401)
        return
    }
    const refreshToken = req.cookies.refreshToken
    const tokens = await sessionService.updateSession(refreshToken);
    if(!tokens){
        res.sendStatus(401);
        return
    }
    res.cookie('refreshToken', tokens.refreshToken, {
        expires:  dayjs().add(20, "seconds").toDate(),
        secure:true,
        httpOnly: true,
    });
    res.status(200).send({
        accessToken:tokens.accessToken
    })
})
authRouter.post('/registration-confirmation',responseCountMiddleware,async (req:Request, res:Response)=>{
    const result = await authService.confirmEmail(req.body.code)

    console.log(result);
    if(result){
        res.status(204).send(result);
        return
    }
    res.status(400).send({errorsMessages:[{
            message:"некорректный код",
            field:"code"
        }]})
})
authRouter.post('/registration',responseCountMiddleware/*,loginValidator, passwordValidator, loginRegValidation, emailRegValidation, inputValidationMiddleware*/,async (req:Request, res:Response)=>{
    const createdUser = await userService.createUser(req.body.login, req.body.password, req.body.email)

    if(!createdUser){
        res.sendStatus(400)
        return
    }
    res.sendStatus(204)
})
authRouter.post('/registration-email-resending',responseCountMiddleware,/*emailNotExistsValidation, inputValidationMiddleware,*/async (req:Request, res:Response)=>{
    const result = await authService.resendConfirmCode(req.body.email)
    res.sendStatus(204)
})
authRouter.post('/logout',async (req:Request, res:Response)=>{

    if(!req.cookies.refreshToken){
        res.sendStatus(401)
        return
    }
    const refreshToken = req.cookies.refreshToken
    const payload = await jwtService.getPayloadByRefreshToken(refreshToken)
    if(!payload){
        res.sendStatus(401)
        return
    }

    await sessionService.removeSessionByDeviceId(payload.userId,payload.deviceId);
    const check = await jwtService.checkRevokedTokens(payload.userId, refreshToken)
    if(check){
        res.status(401).send("Token in Blacklist")
        return
    }
    await jwtService.revokeToken(payload.userId, refreshToken)
    res.clearCookie("refreshToken");
    res.sendStatus(204)

    
})
authRouter.get('/me', authMiddleware, async (req:Request, res:Response)=>{
    //@ts-ignore
    console.log(req.user)
    //@ts-ignore
    const user = await userService.getUserById(req.user!.id)
    //@ts-ignore
    delete Object.assign(user, {["userId"]: user["id"] })["id"];
    res.status(200).send(user)
})