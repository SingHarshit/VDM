const mongoose=require('mongoose');
const {Schema, model} = mongoose;
const bcrypt = require('bcryptjs');


const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        minlength:3,
        maxlength:30,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password:{
        type:String,
        required:true,
        minlength:5,
        maxlength:128,
        select:false,
    },
    role:{
        type:String,
        enum:['Buyer','Seller'],
        required:true,
    },
    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model('User', UserSchema);