import {Request, Response, Router} from "express";


export const testingRouter = Router({})
testingRouter.delete('/testing/all-data',(req:Request, res:Response)=>{
    res.status(204).send([]);
})