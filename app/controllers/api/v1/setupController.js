const dotenv = require('dotenv');
dotenv.config();

const pgp = require('pg-promise')(/* options */)
const db = pgp(`postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`)

const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const uri = process.env.MG_URI
const mgClient = new MongoClient(uri ,{ useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
const dbm = mgClient.db(process.env.MG_DB)
const detail_collection = dbm.collection('list_detail');
const photo_collection = dbm.collection('list_photo');

const cloudinary = require('../../../../config/cloudinary');

const neo4j = require('neo4j-driver')
const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),{ disableLosslessIntegers: true });
const session = driver.session({ database: 'neo4j' } )

module.exports = {
    async getAllSetup(req,res){
        try {
            const setup = await db.many('SELECT * FROM setup_desktop ORDER BY id ASC')
            return res.status(200).json({data: setup})
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    },
    async getSetupById(req,res){
        try {
            const setup_id = req.params.id;
            let setup = await db.one('SELECT * FROM setup_desktop WHERE id = ${id}',
                {
                    id: setup_id,
                }
            )

            const detail = await detail_collection.findOne({_id : ObjectId(setup.list_detail_id.trim())})
            Object.assign(setup,{content_list_detail : detail})

            const galery = await photo_collection.findOne({_id : ObjectId(setup.list_photo_id.trim())})
            Object.assign(setup,{content_list_photo : galery})

            const getLikeQuery = `match x=()-[r:Suka]->(b:Setup) where b.id_setup = ${setup_id} return count(x) as count`
            const data_like = await session.executeWrite(tx =>
              tx.run(getLikeQuery)
            )
            const total_like = data_like.records.map(record => record.get('count'))
            Object.assign(setup,{total_like : parseInt(total_like.toString())})

            return res.status(200).json({data: setup})
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    },
    uploadSetupPhoto(req,res){
        const fileBase64 = req.file.buffer.toString("base64");
        const file = `data:${req.file.mimetype};base64,${fileBase64}`;
        const tanggal = Date.now();
        const namaFile = "Desktop Setup " + tanggal;

        cloudinary.uploader.upload(
            file,
            { public_id: "mydesktop/" + namaFile },
            function (err, result) {
              if (!!err) {
                console.log(err);
                return res.status(400).json({
                  message: "Gagal upload file!",
                });
              }
              console.log(namaFile);
              console.log(result.url);
              res.status(201).json({
                message: "Upload photo berhasil",
                url: result.url,
                namafile: namaFile,
              });
            }
          );
    },
    deleteSetupPhoto(req, res) {
        const nameasset = "mydesktop/"+req.body.public_id;
        cloudinary.uploader.destroy(nameasset, function (error, result) {
          if (!!error) {
            return res.status(400).json({
              message: "Gagal hapus file!",
            });
          }
          res.status(200).json({
            message: "Hapus Photo berhasil",
            status: result
          });
        });
      },
      async createSetup(req,res){
        try {
          const list_detail = req.body.list_detail
          const list_photo = req.body.galery_photo

          const detail_setup = await detail_collection.insertOne(list_detail)
          const photo_setup = await photo_collection.insertOne(list_photo)
          
          const new_setup = await db.one('INSERT INTO setup_desktop(user_id,type_setup,main_photo_url,main_photo_namefile,list_detail_id,list_photo_id) VALUES(${user_id},${type_setup},${main_photo_url},${main_photo_namefile},${list_detail_id},${list_photo_id}) RETURNING id',{
            user_id             : req.body.user_id,
            type_setup          : req.body.type_setup,
            main_photo_url      : req.body.main_photo_url,
            main_photo_namefile : req.body.main_photo_namefile,
            list_detail_id      : detail_setup.insertedId.toString(),
            list_photo_id       : photo_setup.insertedId.toString()
          })

          const writeQuery = `create (a:Setup {id_setup:${new_setup.id}})`
          const relationshipQuery = `match (a:User), (b:Setup) where a.id_user = ${req.body.user_id} and b.id_setup = ${new_setup.id} create (a)-[r:Pemilik]->(b)`
          await session.executeWrite(tx =>
              tx.run(writeQuery)
            )
          await session.executeWrite(tx =>
              tx.run(relationshipQuery)
            )

          return res.status(201).json({msg: "Setup Berhasil ditambahkan" , id : new_setup.id})
        } catch (error) {
          return res.status(500).json({ msg : error.message})
        } 
        // finally {
        //   await session.close();
        // }
      },
      async likeSetup(req,res){
        try {
          const checkQuery = `match x=(a:User)-[r:Suka]->(b:Setup) where a.id_user = ${req.body.user_id} and b.id_setup = ${req.body.setup_id} return count(x) as count`
          const info_like = await session.executeWrite(tx =>
            tx.run(checkQuery)
          )
          const total_like = info_like.records.map(record => record.get('count'))

          if(!parseInt(total_like.toString()) == 0 ){
            return res.status(403).json({msg: "Sudah Pernah Like"})
          }

          const likeQuery = `match (a:User),(b:Setup) where a.id_user = ${req.body.user_id} and b.id_setup = ${req.body.setup_id} create (a)-[r:Suka]->(b)`
          await session.executeWrite(tx =>
            tx.run(likeQuery)
          )
          return res.status(201).json({msg: "Liked"})
        } catch (error) {
          return res.status(500).json({ msg : error.message})
        }
      }
}
    