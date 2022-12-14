const dotenv = require('dotenv');
dotenv.config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SALT = 10

const connection = require('../../../../config/connection');
const db = connection.db
const session = connection.session

function encryptPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, SALT, (err, encryptedPassword) => {
        if (!!err) {
          reject(err);
          return;
        }
  
        resolve(encryptedPassword);
      });
    });
}

function checkPassword(encryptedPassword, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err, isPasswordCorrect) => {
      if (!!err) {
        reject(err);
        return;
      }

      resolve(isPasswordCorrect);
    });
  });
}

function createToken(payload) {
    return jwt.sign(payload, process.env.JWT_SIGNATURE_KEY ,{ expiresIn: '12h' });
}

module.exports = {
    async register(req,res){
        try {
            const new_user = await db.one('INSERT INTO my_desktop_user(username,email,password) VALUES(${username},${email},${password}) RETURNING id',{
                username    : req.body.username,
                email       : req.body.email,
                password    : await encryptPassword(req.body.password)
            })

            const newUserQuery = `create (a:User {id_user:${new_user.id},user_name:'${req.body.username}'})`
            await session.executeWrite(tx =>
                tx.run(newUserQuery)
            )
            return res.status(201).json({msg : "registrasi user baru berhasil"})
        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    },

    async login(req,res){
        try {
            const user = await db.one('SELECT * FROM my_desktop_user WHERE email = ${email}',{
                email : req.body.email
            })
            if (!user) {
                res.status(404).json({ message: "Email tidak ditemukan" });
                return;
            }
            const isPasswordCorrect = await checkPassword(
                user.password,
                req.body.password
            );
            if (!isPasswordCorrect) {
                res.status(401).json({ message: "Password salah!" });
                return;
            }
            const token = createToken({
                id: user.id,
                username : user.username,
            })
            res.status(202).json({token})

        } catch (error) {
            return res.status(500).json({ msg : error.message})
        }
    },
}