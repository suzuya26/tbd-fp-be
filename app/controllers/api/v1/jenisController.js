const connection = require('../../../../config/connection')
const csClient = connection.csClient
const redisClient = connection.redisClient

module.exports = {
    async getAllKategori(req,res){
        try {
            // kategori = await csClient.execute('select * from photos.jenis_kategori')  
            // return res.status(200).json({data: kategori.rows}) 
            const kategori = await redisClient.smembers('kategori');
            return res.status(200).json({data : kategori})
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    },
    async getAllItem(req,res){
        try {
            // item = await csClient.execute('select * from photos.jenis_item')  
            // return res.status(200).json({data: item.rows}) 
            const item = await redisClient.smembers('item');
            return res.status(200).json({data : item})
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    }
}