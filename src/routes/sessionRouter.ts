import {Request, Response, Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {sessionService} from "../domain/session-service";
import {jwtService} from "../application/jwt-service";
import { ObjectId } from "mongodb";

export const  sessionRouter = Router({})

sessionRouter.get('/',async (req:Request, res:Response)=>{
    if(!req.cookies.refreshToken){
        res.sendStatus(401)
        return
    }
    const payload = await jwtService.getPayloadByRefreshToken(req.cookies.refreshToken)
    if(!payload){
        res.sendStatus(401)
        return
    }
    const sessions = await sessionService.getSessionsByUserId(payload.userId)
    res.status(200).send(sessions)
})
sessionRouter.delete('/',async (req:Request, res:Response)=>{
    if(!req.cookies.refreshToken){
        res.sendStatus(401)
        return
    }
    const payload = await jwtService.getPayloadByRefreshToken(req.cookies.refreshToken)
    if(!payload){
        res.sendStatus(401)
        return
    }
    const isDeleted = await sessionService.removeSessionsByUserId(payload.userId, payload.deviceId);
    if(!isDeleted){
        res.sendStatus(401)
        return
    }

    res.sendStatus(204)

})
sessionRouter.delete('/:id',async (req:Request, res:Response)=>{
    if(!req.cookies.refreshToken){
        res.sendStatus(401)
        return
    }
    const payload = await jwtService.getPayloadByRefreshToken(req.cookies.refreshToken)
    if(!payload){
        res.sendStatus(401)
        return
    }
    const session = await sessionService.getSessionByDeviceId(req.params.id);
    if(!session){
        res.sendStatus(404)
        return
    }

    console.log("USER ID")
    console.log(session)
    console.log(payload)

    
    const payloadUserId = new ObjectId(payload.ObjectId)
    console.log(payloadUserId)
    if(session.userId !== payload.userId)
    {
        res.sendStatus(403)
        return
    }

    const isDeleted = await sessionService.removeSessionByDeviceId(payload.userId,req.params.id)
    res.sendStatus(204)

})