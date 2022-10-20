import {NextFunction, Request, Response} from "express";
import {jwtService} from "../application/jwt-service";
import {userService} from "../domain/user-service";

export const authMiddleware = async (req:Request, res:Response, next:NextFunction) =>{
    if(!req.headers.authorization){
        res.sendStatus(401)
        return
    }
    const token = req.headers.authorization.split(' ')[1]

    console.log(token)
    const userId = await jwtService.getUserByAccessToken(token);
    console.log("UserId = "+userId)
    if(!userId){
        res.sendStatus(401)
        return
    }
    // @ts-ignore
    req.user = await userService.getUserById(userId);
    next()
}