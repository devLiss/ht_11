import bcrypt from 'bcrypt';
import {userRepo} from "../repositories/user-db-repo";
import {v4 as uuidv4} from 'uuid'
import add from 'date-fns/add';
import {emailManager} from "../managers/emailManager";


export const userService = {
    async createUser(login:string, password:string, email:string):Promise<any>{
        console.log("create user")
        const passwordSalt = await bcrypt.genSalt(12)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser = {
            login,
            email,
            passwordHash,
            passwordSalt,
            createdAt:new Date().toISOString(),
            emailConfirmation:{
                confirmationCode:uuidv4(),
                expirationDate:add(new Date(), {hours:1, minutes:3}),
                isConfirmed: false
            }
        }

        const createResult = await userRepo.createUser(newUser)
        try{
            await emailManager.sendConfirmation(newUser);
        }
        catch(e){
            console.log("failed create user")
            console.log(e)
            // @ts-ignore
            //await userRepo.deleteUser(newUser!.id!)
            return null

        }
        return {
            id: createResult.id,
            login: createResult.login,
            email: createResult.email,
            createdAt: createResult.createdAt
        }
    },
    async _generateHash(password:string, salt:string){
        const hash = await bcrypt.hash(password, salt)
        return hash
    },
    async checkCredentials(login:string, password:string):Promise<any>{
        const user = await userRepo.findByLogin(login)
        console.log("User in creds with login ---> "+login)
        if(!user) return null
        const passwordHash = await this._generateHash(password, user.passwordSalt)
        if(user.passwordHash !== passwordHash){
            return null
        }
        return user
    },
    async deleteUser(id:string){
        return await userRepo.deleteUser(id);
    },
    async getUserById(id:string){
        const user = await userRepo.findById(id)
        return user
    },
    async getUsers( searchLoginTerm:any, searchEmailTerm:any, pageNumber: number, pageSize: number, sortBy: any, sortDirection: any){
        return await userRepo.getUsers(searchLoginTerm, searchEmailTerm,pageNumber, pageSize, sortBy, sortDirection);
    },
    async generatePasswordHash(password:string){
        const passwordSalt = await bcrypt.genSalt(12)
        const passwordHash = await this._generateHash(password, passwordSalt)

        return {
            passwordSalt:passwordSalt,
            passwordHash:passwordHash
        }
    }

}