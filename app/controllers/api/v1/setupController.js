const cloudinary = require('../../../../config/cloudinary');
const connection = require('../../../../config/connection');
const {ObjectId} = require('mongodb')

const db = connection.db
const detail_collection = connection.detail_collection
const photo_collection = connection.photo_collection
const session = connection.session

module.exports = {
    async getAllSetup(req,res){
        try {
            const setup = await db.many(`SELECT setup_desktop.*, my_desktop_user.username FROM setup_desktop INNER JOIN my_desktop_user ON setup_desktop.user_id = my_desktop_user.id WHERE status = 'show'`)
            return res.status(200).json({data: setup})
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    },
    async getSetupById(req,res){
        try {
            const setup_id = req.params.id;
            let setup = await db.one(`SELECT setup_desktop.*, my_desktop_user.username FROM setup_desktop INNER JOIN my_desktop_user ON setup_desktop.user_id = my_desktop_user.id WHERE setup_desktop.id = ${setup_id}`,
                {
                    id: setup_id,
                }
            )
            
            const detail = await detail_collection.findOne({_id : ObjectId(setup.list_detail_id.trim())})
            // Object.assign(setup,{content_list_detail : detail})

            const galeries = await photo_collection.findOne({_id : ObjectId(setup.list_photo_id.trim())})
            // Object.assign(setup,{content_list_photo : galery})

            const getLikeQuery = `match x=()-[r:Suka]->(b:Setup) where b.id_setup = ${setup_id} return count(x) as count`
            const data_like = await session.executeWrite(tx =>
              tx.run(getLikeQuery)
            )
            const total_like = data_like.records.map(record => record.get('count'))
            // Object.assign(setup,{total_like : parseInt(total_like.toString())})

            let photo = [setup.main_photo_url]
            galeries.photo.forEach(galery => {
              photo.push(galery.url)
            });

            const response = {
              data : {
                id                    : setup.id,
                user_id               : setup.user_id,
                type_setup            : setup.type_setup,
                name_setup            : setup.name_setup,
                username              : setup.username,
                content_list_detail   : detail,
                list_photo            : photo,
                total_like            : parseInt(total_like.toString()),
                status                : setup.status,
              }
            }

            return res.status(200).json({data: response})
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
                return res.status(400).json({
                  message: "Gagal upload file!",
                });
              }
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
          const name_setup = `${req.body.user_name} ${req.body.type_setup} Setup`
          const list_detail = req.body.list_detail
          const list_photo = req.body.galery_photo

          const detail_setup = await detail_collection.insertOne(list_detail)
          const photo_setup = await photo_collection.insertOne(list_photo)
          
          const new_setup = await db.one('INSERT INTO setup_desktop(user_id,type_setup,name_setup,main_photo_url,main_photo_namefile,list_detail_id,list_photo_id,status) VALUES(${user_id},${type_setup},${name_setup},${main_photo_url},${main_photo_namefile},${list_detail_id},${list_photo_id},${status}) RETURNING id',{
            user_id             : req.body.user_id,
            type_setup          : req.body.type_setup,
            name_setup          : name_setup,
            main_photo_url      : req.body.main_photo_url,
            main_photo_namefile : req.body.main_photo_namefile,
            list_detail_id      : detail_setup.insertedId.toString(),
            list_photo_id       : photo_setup.insertedId.toString(),
            status              : 'show',
          })

          const writeQuery = `create (a:Setup {id_setup:${new_setup.id},setup_name:'${name_setup}'})`
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
      async hideSetup(req,res){
        try {
          const setup_id = req.params.id;
          const hidden_setup = await db.one(`UPDATE setup_desktop SET status = 'hidden' WHERE id = ${setup_id} RETURNING name_setup`)
          return res.status(202).json({msg : `setup ${hidden_setup.name_setup} sudah disembunyikan`})
        } catch (error) {
          return res.status(500).json({ msg : error.message})
        }
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
    