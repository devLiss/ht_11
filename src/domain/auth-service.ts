import {emailManager} from "../managers/emailManager";
import {userRepo} from "../repositories/user-db-repo";
import {userService} from "./user-service";
import {userAccountDbType} from "../types";
import {v4 as uuidv4} from "uuid";
import {tokenRepo} from "../repositories/token-db-repo";
import {ObjectId} from "mongodb";
import add from "date-fns/add";
import bcrypt from "bcrypt";

export const authService = {
    async confirmEmail(code:string){
        const user = await userRepo.getUserByCode(code);
        console.log(user)
        if(!user) {return false}
        if(user.emailConfirmation.isConfirmed) {return false}
        console.log(user.id)
        const result = await userRepo.updateConfirmation(user.id);
        return true

    },

    async sendRecoveryCode(email:string){
        let user = await userRepo.getByEmail(email);
        console.log(email);
        console.log(user);
        console.log("Recovery Code")
        if(!user){
            console.log("User not found")
            return null
        }

        const recoveryCode = uuidv4();
        const recoveryData = {
            recoveryCode:recoveryCode,
            expirationDate:add(new Date(), {hours:1, minutes:3}),
            isConfirmed: false
        }
        console.log(recoveryCode)
        const updatedUser = await userRepo.createRecoveryData(user.id, recoveryData)
        const result = await emailManager.sendRecoveryCode(updatedUser)
        return result
    },
    async confirmPassword(newPassword:string, recoveryCode:string){
        const user = await userRepo.getUserByRecoveryCode(recoveryCode)
        if(!user){return false}
        if(user.recoveryData.isConfirmed) {return false}

        const passwordData = await userService.generatePasswordHash(newPassword);
        console.log("confirm password")
        console.log(user)
        console.log(passwordData)
        await userRepo.confirmPassword(user._id,passwordData)
        return true
    },
    async resendConfirmCode(email:string){
        let user = await userRepo.getByEmail(email);
        console.log("RESEND ")
        if(!user){
            return null
        }
        const confirmCode = uuidv4();
        const ypdateRes = await userRepo.updateConfirmationCode(user.id, confirmCode)
        user = await userRepo.getByEmail(email);
        const result = await emailManager.sendConfirmation(user)
            //console.log("result "+ result)
        return result
    },


}