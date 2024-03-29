const Admin=require('../models/AdminUser')
const bcrypt = require("bcryptjs");
const jwt=require('jsonwebtoken');
//creating new admins
const createadmin=async (req,res,next)=>{
    const {adminname,adminemail,adminPassword}=req.body
    let admin
    try{
     admin=await Admin.findOne({adminemail})
    }catch(e){
       return res.status(500).json({message:e})
    }
    if(admin){
        return res.status(409).json({message:"Admin with this email already exists"})
    }
    //hashing the password first before creating the admin
    let hashedpassword;
    try{
    hashedpassword=await bcrypt.hash(adminPassword,8)
    }catch(err){
        const error = new HttpError("Could not create user,try again later", 500);
        return next(error);
    }
    //creating a new admin
    let newadmin=new Admin({
        adminname,
        adminemail,
        adminPassword:hashedpassword
    })

    //saving the newly created admin to the database
     try{
      await newadmin.save()
     }catch(e){
       return res.status(500).json({message:'Internal server error'})
     }

    res.status(201).json({
        message:"Admin created successfully!!!"
    });      
}

//hanling the login of admins
const loginadmin= async (req,res,next)=>{
 const { adminemail, adminPassword } = req.body;
 let existingAdmin;
 try {
   existingAdmin = await Admin.findOne({ adminemail });
 } catch (err) {
   return res.status(500).json({message:'Internal server error'})
 }
 
 if(!existingAdmin){
     return res.status(401).json({message:"Invalid credentials,could not log you in"})
 }
 let isvalidpasword = false;
 try {
   isvalidpasword = await bcrypt.compare(adminPassword, existingAdmin.adminPassword);
 } catch (err) {
       return res.status(500).json({message:'Internal server error'})
 }

 if(!isvalidpasword){
     return res.status(401).json({message:"Invalid credentials,could not log you in"})
 }

 let token;
  try {
    token = jwt.sign(
      { adminid: existingAdmin.id, email: existingAdmin.adminemail },
      process.env.JWTADMIN_KEY,
      { expiresIn: "24h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed,please try again later",
      500
    );
    return next(error);
  }
  res.status(201).json({
    adminid: existingAdmin.id,
    adminemail: existingAdmin.adminemail,
    adminname: existingAdmin.adminname,
    token,
  });
}

//Returning all the admins present
const getadmin=async (req,res,next)=>{
  let admins;
  try{
    admins=await Admin.find({})
  }catch(e){
    return res.status(500).json({"error":e})
  }
  if(!admins||admins.length===0){
    return res.status(404).json({message:"There are no current admins"})
  }
  return res.status(200).json({admins:admins.map(admin=>admin.toObject({getters:true}))})
}

const deleteadmin=async (req,res,next)=>{
  let adminids=req.body.ids
  try{
   await Admin.deleteMany({_id:{$in:adminids}})
  }catch(e){
    return res.status(500).json({message:e})
  }
  return res.json({message:"Deleted Successfully!!"})
}
module.exports={
    createadmin,
    loginadmin,
    getadmin,
    deleteadmin
}