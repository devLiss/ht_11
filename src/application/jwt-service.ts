import {userDBType} from "../types";
import jwt, {verify} from 'jsonwebtoken'
import {settings} from "../settings/settings";
import {ObjectId} from "mongodb";
import {tokenRepo} from "../repositories/token-db-repo";

export const jwtService = {
    /*async generateTokens(userId:any, deviceId:string){
        const token = jwt.sign({userId:userId}, settings.JWT_SECRET, {expiresIn:'10s'})
        const refreshToken = jwt.sign({deviceId:deviceId, userId:userId}, settings.JWT_REFRESH_SECRET, {expiresIn:'20s'})

        return {
            accessToken:token,
            refreshToken:refreshToken
        }
    },*/

    async generateTokens(userId:any, deviceId:string){
        const token = jwt.sign({userId:userId}, settings.JWT_SECRET, {expiresIn:'10s'})
        const refreshToken = jwt.sign({deviceId:deviceId,userId:userId}, settings.JWT_REFRESH_SECRET, {expiresIn:'20s'})

        return {
            accessToken:token,
            refreshToken:refreshToken
        }
    },

    async getUserByAccessToken(token:string){
      try{
          const result:any = jwt.verify(token, settings.JWT_SECRET);
          console.log(result.userId)
          return new ObjectId(result.userId)
      }
      catch(e){
          console.log(e)
          return null
      }
    },

    async getPayloadByRefreshToken(refreshToken:string):Promise<any>{
        try {
            const result: any = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET);
            return result
        }
        catch (e){
            console.log("Fall")
            console.log(e)
            return null
        }
    },


    async getUserByRefreshToken(refreshToken:string){
        try{
            const result:any = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET);
            return result.userId
        }
        catch (e){
            return null
        }
    },

    async revokeToken(userId:string, token:string){
        await tokenRepo.revokeToken(userId, token)
        return null
    },

    async checkRevokedTokens(userId:string, token:string){
        const findToken = await tokenRepo.getBlackList(userId,token);
        return findToken
    }
}