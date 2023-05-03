// file are contains the secert things
//install npm i dotenv

require("dotenv").config();
// console.log(process.env.USER_DB);

exports.config = {
    db_pass: process.env.PASS_DB,
    db_user: process.env.USER_DB,
    token_secret: process.env.TOKEN_SECRET,
    db_url: 'mongodb+srv://mosheb932:1234moshe@myservercluster.yy6dviz.mongodb.net/atid22'
}