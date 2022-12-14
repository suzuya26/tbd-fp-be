const connection = require('../../../../config/connection')
const csClient = connection.csClient

module.exports = {
    async getAllKategori(req,res){
        try {
            kategori = await csClient.execute('select * from photos.jenis_kategori')  
            return res.status(200).json({data: kategori.rows}) 
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    },
    async getAllItem(req,res){
        try {
            item = await csClient.execute('select * from photos.jenis_item')  
            return res.status(200).json({data: item.rows}) 
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    }
}