import express, {NextFunction, Request, Response} from 'express'
import bodyParser from "body-parser";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {runDB} from "./repositories/db";
import {blogsRepo} from "./repositories/blog-db-repo";
import {postRepo} from "./repositories/post-db-repo";
import {userRouter} from "./routes/usersRouter";
import {authRouter} from "./routes/authRouter";
import {userRepo} from "./repositories/user-db-repo";
import * as dotenv from 'dotenv'
import {commentsRouter} from "./routes/commentsRouter";
import {commentRepo} from "./repositories/comment-db-repo";
import cookieParser from 'cookie-parser'
import {sessionDbRepo} from "./repositories/session-db-repo";
import {sessionRouter} from "./routes/sessionRouter";

dotenv.config()
export const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.json());
app.use(cookieParser())
app.set('trust proxy', true)

app.delete('/testing/all-data',async (req: Request, res: Response) => {
    await blogsRepo.deleteAll();
    await postRepo.deleteAll();
    await userRepo.deleteAll();
    await commentRepo.deleteAll();
    //await sessionDbRepo.deleteAll();

    res.status(204).send([])
})
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/security/devices',sessionRouter)
app.get('/',(req:Request, res:Response)=>{
    res.send('Hello!')
})

const startApp = async () => {
    await runDB();
    app.listen(port,()=>{
        console.log(`Listening port ${port}`);
    })
}

startApp();
