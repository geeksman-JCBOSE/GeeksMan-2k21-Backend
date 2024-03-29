const Contest=require('../models/Contest')
const jwt=require('jsonwebtoken')
const User=require('../models/User')
const testvalidation=async (req,res,next)=>{
let time,contest,Token;
const {cid,token}=req.body
let decodedToken;
try{
    decodedToken=jwt.verify(token,process.env.JWT_KEY)
}catch{
    return res.status(403).json({message:'Cannot start your test,validation failed'})
}
try{
    contest=await Contest.findById(cid)
}catch(e){
    return res.status(500).json({message:'Internal server error!'})
}
if(!contest){
    return res.status(404).json({message:'Could not find the contest'})
}
let uid
if(decodedToken){    
uid=decodedToken.userId
}
let registeruserid,slotno,endtime,starttime
let user;
try{
user=await User.findById(uid).populate('usercontestdetail')
}catch{
return res.status(500).json({message:'Could not start your test,try again later'})
}
if(user||user.usercontestdetail.length!=0){
    const finduser=user.usercontestdetail.find(user=>user.contestid==cid)
    if(!finduser){
        return res.status(403).json({message:'You are not registered for this contest'})
    }
    registeruserid=finduser._id
    slotno=finduser.slot.slotno
    starttime=finduser.slot.slotstarttime
    endtime=finduser.slot.slotendtime
    if(finduser.testgiven){
        return res.status(403).json({message:'You have already given the test'});
    }
}else{
    return res.status(403).json({message:'You are not registered for this contest'})
}

//managing when the test token should be created    
if(Date.now()<starttime){
    return res.status(403).json({message:'Either contest or your slot has not started yet'})
}
if(endtime<=Date.now()){
    return res.status(403).json({message:'Either contest or your slot has already ended'})
}

time=parseInt(contest.contestduration)
let tokentime
if((Date.now()+time)>=endtime){
    tokentime=time-((Date.now()+time)-endtime)
}else{
    tokentime=time
}
try{
Token=jwt.sign({contestId:cid,userId:uid,ruid:registeruserid,slotno:slotno},process.env.JWTCONTEST_KEY,{expiresIn:`${tokentime}ms`})
}catch(e){
    return res.status(500).json({message:'Could not start your test please try again later'})
}
res.status(200).json({Token})
}
module.exports={
    testvalidation
}