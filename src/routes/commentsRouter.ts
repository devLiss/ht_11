import {Router,Request,Response} from "express";
import {commentService} from "../domain/comments-service";
import {authMiddleware} from "../middlewares/authMiddleware";
import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/inputValidationMiddleware";
import {likeStatusValidation} from "../middlewares/middlewares";
import {jwtService} from "../application/jwt-service";
import {userService} from "../domain/user-service";
import {ObjectId} from "mongodb";

export const commentsRouter = Router({})


commentsRouter.put('/:commentId/like-status',authMiddleware, likeStatusValidation, inputValidationMiddleware, async (req:Request, res:Response)=>{
    //@ts-ignore
    console.log(req.user)
    //@ts-ignore
    const comment = await commentService.getCommentByID(req.params.commentId, req.user!.id)
    if(!comment){
        res.sendStatus(404)
        return
    }
    //@ts-ignore
    const result = await commentService.makeLike(req.params.commentId, req.user!.id!, req.body.likeStatus)
    res.sendStatus(204)
})
commentsRouter.get('/:id',/*authMiddleware,*/async(req:Request, res:Response)=>{
    let currentUserId = new ObjectId();
    if(req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        console.log(token)
        const userId = await jwtService.getUserByAccessToken(token);
        console.log("UserId = " + userId)

        if(userId){
            const user = await userService.getUserById(userId.toString());
            if(user){currentUserId = user.id}
        }
    }
    const comment = await commentService.getCommentByID(req.params.id,currentUserId)
    if(!comment){
        res.sendStatus(404)
        return
    }
    res.status(200).send(comment)
})
commentsRouter.delete('/:commentId',authMiddleware, async(req:Request, res:Response)=>{
    //@ts-ignore
    const comment = await commentService.getCommentByID(req.params.commentId, req.user.id);
    if(!comment){
        res.send(404)
        return
    }
    //@ts-ignore
    if(comment.userId.toString() !== req.user.userId.toString()){
        res.send(403)
        return
    }

    const isDeleted = await commentService.deleteComment(comment.id)
    res.send(204)
})
commentsRouter.put('/:commentId',authMiddleware,body('content').trim().isLength({min:20, max:300}),inputValidationMiddleware,async(req:Request, res:Response)=>{
    //@ts-ignore
    const comment = await commentService.getCommentByID(req.params.commentId, req.user.id);
    if(!comment){
        res.send(404)
        return
    }
    console.log(comment.userId)
    //@ts-ignore
    console.log(req.user.userId)
    //@ts-ignore
    if(comment.userId.toString() !== req.user.userId.toString()){
        res.send(403)
        return
    }

    const isModified = await commentService.updateComment(comment.id, req.body.content)
    res.send(204)
})