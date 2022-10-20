import {likesCollection} from "./db";
import {ObjectId} from "mongodb";

export const likesDbRepo = {
   async createLike(like:{commentId:ObjectId, userId:ObjectId, status:string}){
        return await likesCollection.insertOne(like);
        },
    async updateLike(like:{commentId:ObjectId, userId:ObjectId, status:string}){
       const updated = await likesCollection.findOneAndUpdate({commentId:like.commentId,userId:like.userId },{$set:{status:like.status}})
        return updated
    },
    async getLikeByCommentIdAndUserId(commentId:string, userId:ObjectId){
       return await likesCollection.findOne({commentId:new ObjectId(commentId), userId:userId});
    },
    async getLikesAndDislikesByCommentId(commentId:string){
        const counts = await likesCollection.aggregate([{$match:{commentId:new ObjectId(commentId)}},{$group:{_id:"$status",count:{$sum:1}}}]).toArray();
        return counts;
   }
}