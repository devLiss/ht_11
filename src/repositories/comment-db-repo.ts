import {commentsCollection, postCollection} from "./db";
import {ObjectId} from "mongodb";

export const commentRepo = {
    async createComment(comment:any){

        await commentsCollection.insertOne(comment)
        const findedComment = await commentsCollection.findOne({_id:comment._id},{projection:{_id:0, id:"$_id", userId:1, userLogin:1, content:1, createdAt:1}})
        console.log(findedComment)
        return findedComment;
    },

    async getCommentById(id:string){
        return await commentsCollection.findOne({_id:new ObjectId(id)},{projection:{_id:0, id:"$_id", userId:1, userLogin:1, content:1, createdAt:1}})
    },
    async deleteComment(id:string){
        const result = await commentsCollection.deleteOne({_id:new ObjectId(id)})
        return result.deletedCount === 1
    },
    async updateComment(id:string, content:string){
        const result = await commentsCollection.updateOne({_id:new ObjectId(id)},{$set:{content:content}})
        return result.matchedCount === 1
    },
    async getCommentsByPostId(postId:string,pageNumber:number,pageSize:number, sortBy:string, sortDirection:any){
        /*const comments = await commentsCollection.find({postId:new ObjectId(postId)},
            {projection:{_id:0,
                id:"$_id",
                content:1,
                userId:1,
                userLogin:1,
                createdAt:1}})
            .skip((pageNumber-1)*pageSize)
            .limit(pageSize)
            .sort( {[sortBy] : sortDirection} )
            .toArray();*/

        const comments = await commentsCollection.aggregate([{
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "commentId",
                pipeline: [{
                    $match: {
                        "status": "Like"
                    },
                },
                    {
                        $group: {_id:"$status", count:{$sum:1}}
                    }
                ],
                as: "likesCount"
            }
        },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "commentId",
                    pipeline:  [{
                        $match: {
                            "status": "Dislike"
                        },
                    },
                        {
                            $count: "dislikesCount"
                        }
                    ],
                    as: "dislikesCount"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "commentId",
                    pipeline: [{
                        $group: { _id: "$status", count: { $sum: 1 } }
                    }],
                    as: "likeInfo.myStatus"
                }
            },
            {
                $project: {
                    _id: 0,
                    //id: "$_id",
                    content: 1,
                    userId: 1,
                    userLogin: 1,
                    createdAt: 1,
                    "likeInfo.likesCount": "$likesCount",
                    "likeInfo.dislikesCount": "$dislikesCount.dislikesCount"
                }
            }])
            .skip((pageNumber-1)*pageSize)
            .limit(pageSize)
            .sort( {[sortBy] : sortDirection} )
            .toArray();
        const totalCount = await commentsCollection.countDocuments({postId:new ObjectId(postId)});

        return {
            pagesCount:Math.ceil(totalCount/pageSize),
            page:pageNumber,
            pageSize:pageSize,
            totalCount:totalCount,
            items:comments
        }
    },
    async deleteAll():Promise<boolean>{
        const result = await commentsCollection.deleteMany({})
        return result.deletedCount > 1
    }
}