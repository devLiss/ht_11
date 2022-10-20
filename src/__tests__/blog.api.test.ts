import request from 'supertest'
import {app} from "../index"
describe('/blogs',()=>{
    it("should return all blogs",async ()=>{
        await request(app).get('/blogs').expect(200,[])
    })

    it("should return one blog",async ()=>{
        await request(app).get('/blogs/'+1).expect(200,[])
    })
})