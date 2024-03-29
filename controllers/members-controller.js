const Member=require('../routers/Member')
const {cloudinary}=require('../Cloudinaryconfig/Cloudinary')
const mongoose =require('mongoose')
const Members=require('../models/Members')
const HttpError=require('../models/Http-error')
const compare=(arr=>{
    arr.sort((a,b)=>{
        return b.year.charCodeAt(0)-a.year.charCodeAt(0)
    })
})
const createmember=async (req,res,next)=>{
    const {name,post,year,image,linkedin,facebook,instagram}=req.body
    let resimage;
    try{
      resimage= await cloudinary.uploader.upload(image,{upload_preset:'Members-images'})
    }catch(err){
        return res.status(500).json({message:'Member Image upload failed!!'})
    }
    const newMember= new Members({
       name,
       post,
       year,
       image:resimage.secure_url,
       linkedin,
       facebook,
       instagram
    })
    try{
         await newMember.save();
    }catch(err){
        const error=new HttpError('Could not create a contest please try again later',500)
        return next(error)

    }
    res.status(201).json({member:newMember.toObject({getters:true})})
}
const getmembers=async (req,res,next)=>{
    const pno=parseInt(req.query.pno || "0");
    const imageperpage=3;
    //get all members from schema
    let allmembers
    try{
        allmembers= await Members.find({});
    }catch(err){
        const error=new HttpError('Something went wrong while fetching members',500)
        return next(error)

    }
    //now sort the list of members according to 4th yr > 3rd yr > 2nd yr > 1st yr...
    compare(allmembers)
   
    //we have sorted array so now apply pagination part...
    let singlepagemembers=[]
    const st=parseInt(pno*imageperpage)
    for(var i=st; i<allmembers.length && i<st+imageperpage;i++){
        singlepagemembers.push(allmembers[i])
    }
    res.json({members:singlepagemembers.map(memb=>memb.toObject({getters:true})), totalmembers:allmembers.length,imageperpage})

}

const getmembersforadmin=async(req,res,next)=>{
    let allmembers
    try{
        allmembers= await Members.find({});
    }catch(err){
        const error=new HttpError('Something went wrong while fetching members',500)
        return next(error)

    }
    //now sort the list of members according to 4th yr > 3rd yr > 2nd yr > 1st yr...
    compare(allmembers)
    res.json({members:allmembers});
}

const updatemember=async (req,res,next)=>{
    const {post,year}=req.body
    const {mid}=req.params
    let reqMember
    try{
        reqMember=await Members.findById(mid)
    }catch(err){
        const error=new HttpError('Something went wrong while finding this member',500)
        return next(error)
    }
    reqMember.post=post
    reqMember.year=year
    try{
     await reqMember.save()
    }catch(err){
        const error=new HttpError('Something went wrong could not update member',500)
        return next(error)
    }
    res.json({member:reqMember.toObject({getters:true})})

}
const deletemember=async (req,res,next)=>{
    const {ids}=req.body   
    try{
       await Members.deleteMany({_id:{$in:ids}})
    }catch(err){
        const error=new HttpError('Something went wrong,could delete members',500)
        return next(error)
    }

    res.json({message:'member deleted successfully'})
}
module.exports={
    createmember,
    getmembers,
    updatemember,
    deletemember,
    getmembersforadmin
}