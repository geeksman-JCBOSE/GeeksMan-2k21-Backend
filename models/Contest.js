const mongoose=require('mongoose')
const contestSchema=new mongoose.Schema({
Contestname:{
    type:String,
    required:true
},
starttime:{
    type:Date,
    required:true
},
endtime:{
    type:Date,
    required:true
},
contestduration:{
type:String,
required:true
},
prize:{
    type:String,
    required:true
},
registeredusers:[
    {
        type:mongoose.Types.ObjectId,
        ref:"RegisteredUser"
    }
],
Totalslots:[{
  slotno:{
      type:String,
      required:true
  },
  timeanddateofslot:{
      type:Date,
      required:true
  }  
}],
slotstrength:{
    type:Number,
    required:true,
},
availableslot:{
type:Array,
},
contestdetail:{
    type:String,
    required:true
},
rules:{
    type:String,
    required:true
},
contestType:{
    type:String,
    enum:['ongoing','upcoming','previous'],
    required:true
}
})
module.exports=mongoose.model('Contest',contestSchema)