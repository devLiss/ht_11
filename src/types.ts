import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";

export interface postType {
        id?:string|null,
        title:string|null,
        shortDescription:string|null,
        content:string|null,
        blogId:string|null,
        blogName:string|null,
        createdAt:string
}

export interface blogType{
        id?:string,
        name:string,
        youtubeUrl:string,
        createdAt:string
}

export interface userType{
        passwordHash?:string,
        passwordSalt?:string,
        email:string,
        login:string,
        createdAt:string,
}

export interface userDBType{
        id:string,
        email:string,
        login:string,
        createdAt:string,
}

export interface userAccountDbType{
        id?: ObjectId,
        login:string,
        email:string,
        passwordHash:string,
        passwordSalt:string,
        createdAt:string,
        emailConfirmation:{
                confirmationCode:any,
                expirationDate:Date,
                isConfirmed: boolean
        }
}

export interface SessionDbType{
        _id?:ObjectId
        ip:string
        title:string
        lastActiveDate:Date
        expiredDate:Date
        deviceId:string,
        userId:string
}
export interface SessionType{
        ip:string
        title:string
        lastActiveDate:Date
        deviceId:string,
}