import {requestCollection} from "./db";

export const requestDbRepo = {
    async createRequestRow (ip:string, url:string, requestDate:Date){
        await requestCollection.insertOne({ip, url, requestDate});
        return true;
    },
    async getRequestsCountPer10sec(ip:string, url:string, date:Date){
        const requestsCount = await requestCollection.count({ip:ip, url:url, requestDate:{$gte:date}})
        return requestsCount
    }
}