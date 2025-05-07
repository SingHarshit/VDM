const mongoose=require('mongoose');

const DealSchema= new mongoose.Schema({
    title:String,
    description:String,
    price:Number,
    status:{type:String,enum:['Pending','In Progress', 'Completed','Cancelled'],default:'Pending'},
    buyer:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    seller:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    documents:[{
        filepath:String,
        fileName:String,
        uploadedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
    }]
});

module.exports= mongoose.model('Deal',DealSchema);