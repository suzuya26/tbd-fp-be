//import dotnev
const dotenv = require('dotenv');
dotenv.config();

//connect posgre
const pgp = require('pg-promise')(/* options */)
const db = pgp(`postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`)

//connect mongodb
const { MongoClient, ServerApiVersion} = require('mongodb');
const uri = process.env.MG_URI
const mgClient = new MongoClient(uri ,{ useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
const dbm = mgClient.db(process.env.MG_DB)
const detail_collection = dbm.collection('list_detail');
const photo_collection = dbm.collection('list_photo');

//connect neo4j
const neo4j = require('neo4j-driver')
const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),{ disableLosslessIntegers: true });
const session = driver.session({ database: 'neo4j' } )

//connect cassandra
const cassandra = require('cassandra-driver');
const csClient = new cassandra.Client({
    cloud: { secureConnectBundle: 'config/secure-connect-list-photo.zip' },
    credentials: { username: process.env.USER_CS, password: process.env.PW_CS }
});

//connect redis
const Redis = require("ioredis");

let redisClient = new Redis(process.env.REDIS_URL);


module.exports = {
    db,
    detail_collection,
    photo_collection,
    session,
    csClient,
    redisClient,
}