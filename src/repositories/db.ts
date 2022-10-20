import {MongoClient} from 'mongodb'
import {blogType, postType} from "../types";
import "dotenv/config";
import exp from "constants";

const mongoURI = process.env.mongoURI || "mongodb://localhost:27017";

export const client = new MongoClient(mongoURI);
export const blogCollection = client.db("ht_03").collection<blogType>("blogs");
export const postCollection = client.db("ht_03").collection<postType>("posts");
export const userCollection = client.db("ht_03").collection("users");
export const commentsCollection = client.db("ht_03").collection("comments");
export const sessionCollection = client.db("ht_03").collection("sessions");
export const requestCollection = client.db("ht_03").collection("requests");
export const tokensBlackListCollection = client.db("ht_03").collection("tokens");

export async function runDB(){
    try {
        await client.connect();
        await client.db("incubator").command({ping:1})
    }
    catch{
        await client.close()
    }
}

