
import {ObjectId} from "mongodb";
import { tokensBlackListCollection } from "./db";

export const tokenRepo = {
    async revokeToken(userId:string, token:string){
        await tokensBlackListCollection.insertOne({userId:userId, refreshToken:token})
        return null
    },
    async getBlackList(userId:string,token:string){
        const findedToken = await tokensBlackListCollection.find({userId:userId, refreshToken:token}, ).toArray();
        return findedToken.length > 0;
    }
}