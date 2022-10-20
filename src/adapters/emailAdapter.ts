import nodemailer from 'nodemailer'
import "dotenv/config";

export const emailAdapter = {
    async send(user:any,subject:string, message:string) {
        let transporter = nodemailer.createTransport({
            //service: "gmail",
            host:"smtp.yandex.ru",
            //host:"smtp.mail.ru",
            port: 465,
            secure: true,
            /*host:"imap.mail.ru",
            port:993,
            secure:true,*/
            auth: {
                /*user:"devliss@inbox.ru",
                pass:"7XskYYxBwkd9"*/
                user: "devliss@yandex.ru",//process.env.SMTP_USER || "",
                pass: "u*qY5tTJ*w53f" //process.env.SMTP_PASSWORD || ""
            }
        });

        try {
            let result = await transporter.sendMail({
                from: "devliss@yandex.ru",
                to: user.email,
                subject: subject,
                html: message
            })
            return result
        }catch(e){
            console.log(e)
        }

    }
}