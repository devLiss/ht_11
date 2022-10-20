import {sessionCollection} from "./db";
import {SessionDbType, SessionType} from "../types";
import {ObjectId} from "mongodb";

export const sessionDbRepo = {

    async createSession(session:SessionDbType):Promise<SessionType>{

        await sessionCollection.insertOne(session);
        return {
            ip:session.ip,
            title:session.title,
            lastActiveDate:session.lastActiveDate,
            deviceId:session.deviceId
        }
    },
    async getSessionByDeviceId(deviceId:string){
        const session = await sessionCollection.findOne({deviceId:deviceId},{projection:{_id:0}});
        return session;
    },
    async getSessionByUserByDeviceAndByDate(userId:string, deviceId:string, issuedAt:Date){
        const sessions = await sessionCollection.find({userId:/*new ObjectId(userId)*/userId, deviceId:deviceId, lastActiveDate:issuedAt}).toArray();
        return sessions;
    },

    async updateSession(userId:string,deviceId:string,expiredDate:Date,issuedAt:Date){
        const result = await sessionCollection.updateOne({userId:/*new ObjectId(userId)*/userId, deviceId:deviceId}, {$set:{expiredDate:expiredDate, lastActiveDate:issuedAt}})
        return result.matchedCount === 1
    },
    async getSessionsByUserId(userId:string)/*:Promise<SessionType[]>*/{
        const sessions = await sessionCollection.find({userId: /*new ObjectId(userId)*/userId}).project({
            "_id":0,
            "ip": 1,
            "title": 1,
            "lastActiveDate": 1,
            "deviceId": 1
        }).toArray();
        return sessions
    },
    async removeSessionByDeviceId(userId:string,deviceId:string){
        const result = await sessionCollection.deleteOne({userId:/*new ObjectId(userId)*/userId,deviceId:deviceId})
        return result.deletedCount === 1
    },

    async removeAllSessionsByUserId(userId:string,deviceId:string){
        const result = await sessionCollection.deleteMany({userId:/*new ObjectId(userId)*/userId, deviceId:{$ne:deviceId}})
        return result.deletedCount > 0
    },

    async deleteAll():Promise<boolean>{
        const result = await sessionCollection.deleteMany({})
        return result.deletedCount > 1
    }
}