import {commentsCollection, postCollection} from "./db";
import {ObjectId} from "mongodb";

export const commentRepo = {
    async createComment(comment:any){

        await commentsCollection.insertOne(comment)
        const findedComment = await commentsCollection.findOne({_id:comment._id},{projection:{_id:0, id:"$_id", userId:1, userLogin:1, content:1, createdAt:1}})
        //console.log(findedComment)
        if(findedComment){
        findedComment.likesInfo = {
            likesCount:  0,
            dislikesCount: 0,
            myStatus: "None"
        }
        }
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
    async getCommentsByPostId(userId:string,postId:string,pageNumber:number,pageSize:number, sortBy:string, sortDirection:any){
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

        const comments = await commentsCollection.aggregate([{$match:{"postId":new ObjectId(postId)}},{
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
                        $count: "count"
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
                    pipeline: [{
                        $match: {
                            "status": "Dislike"
                        },
                    },
                        {
                            $count: "count"
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
                        $match:{"userId":new ObjectId(userId)}
                    },{
                        $project:{_id:0,"status":1}
                        }],
                    as: "myStatus"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    content: 1,
                    userId: 1,
                    userLogin: 1,
                    createdAt: 1,
                    "likesInfo.likesCount": "$likesCount",
                    "likesInfo.dislikesCount": "$dislikesCount",
                    "likesInfo.myStatus":"$myStatus"
                }
            }])
            .skip((pageNumber-1)*pageSize)
            .limit(pageSize)
            .sort( {[sortBy] : sortDirection} )
            .toArray();
            const temp = comments.map((comment) => {
                const likesCountArr = comment.likesInfo.likesCount
                const dislikesCountArr = comment.likesInfo.dislikesCount
                const myStatusArr = comment.likesInfo.myStatus

                const likesInfo = {
                    likesCount: likesCountArr.length ? likesCountArr[0].count : 0,
                    dislikesCount: dislikesCountArr.length ? dislikesCountArr[0].count : 0,
                    myStatus: myStatusArr.length ? myStatusArr[0].status : "None"
                }
                comment.likesInfo = likesInfo
                return comment
        });
            console.log(temp)

        const totalCount = await commentsCollection.countDocuments({postId:new ObjectId(postId)});

        return {
            pagesCount:Math.ceil(totalCount/pageSize),
            page:pageNumber,
            pageSize:pageSize,
            totalCount:totalCount,
            items:temp
        }
    },
    async deleteAll():Promise<boolean>{
        const result = await commentsCollection.deleteMany({})
        return result.deletedCount > 1
    }
}