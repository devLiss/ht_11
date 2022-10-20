import {commentRepo} from "../repositories/comment-db-repo";

export const commentService = {
    async createComment(content:string, postId:string, userId:string, userName:string){

        const newComment = {
            content:content,
            postId:postId,
            userId:userId,
            userLogin:userName,
            createdAt:new Date().toISOString()
        }

        const createdComment = await commentRepo.createComment(newComment)
        return createdComment

    },

    async getCommentByID(id:string){
        return await commentRepo.getCommentById(id);
    },
    async deleteComment(id:string){
        return await commentRepo.deleteComment(id);
    },
    async updateComment(id:string,content:string){
        return await commentRepo.updateComment(id, content);
    },
    async getCommentsByPostId(postId:string,pageNumber:number,pageSize:number, sortBy:any, sortDirection:any){
        return await commentRepo.getCommentsByPostId(postId, pageNumber, pageSize, sortBy, sortDirection)
    }
}