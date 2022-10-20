import {NextFunction, Request, Response} from "express";
import {requestDbRepo} from "../repositories/request-db-repo";

export const responseCountMiddleware = async (req:Request, res:Response, next:NextFunction) =>{
    const interval = 10*1000
    const currentDate = new Date();
    const count = await requestDbRepo.getRequestsCountPer10sec(req.ip, req.url, new Date(currentDate.getTime()-interval));
    await requestDbRepo.createRequestRow(req.ip, req.url,new Date())

    if(count >= 5){
        console.log("Count requests greate then 5!")
        res.sendStatus(429)
        return
    }
    next();
}