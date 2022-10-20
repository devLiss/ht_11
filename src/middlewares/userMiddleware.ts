import {body, CustomValidator} from "express-validator";
import {userRepo} from "../repositories/user-db-repo";

export const loginValidator = body('login').trim().isLength({min:3, max:10})

export const passwordValidator = body('password').trim().isLength({min:6, max:20})

export const emailVAlidator = body('email').isEmail()

const isUserExists: CustomValidator = async value => {
    const user = await userRepo.findByLoginOrEmail(value)
    console.log("validator")
    console.log(user)
    if(user){
        throw new Error('Пользователь уже зарегистрирован')
    }
    return true
}

export const emailRegValidation = body('email').trim().isLength({min:1}).isEmail().custom(isUserExists)//.custom(isUserConfirmed);
export const loginRegValidation = body('login').trim().isLength({min:1}).custom(isUserExists);

const UserisNotExists: CustomValidator = async value => {
    const user = await userRepo.getByEmail(value)
    console.log("validator")
    console.log(user)
    if(!user){
        throw new Error('Пользователь не зарегистрирован')
    }
    if(user.emailConfirmation.isConfirmed){
        throw new Error('Пользователь уже подтвержден')
    }
    return true
}
export const emailNotExistsValidation = body('email').trim().isLength({min:1}).isEmail().custom(UserisNotExists);