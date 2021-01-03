const Contest = require('../models/Contest')
const HttpError=require('../models/Http-error')
const Contest=require('../models/Contest')

const createcontest=async (req,res,next)=>{
const {name,starttime,endtime,startdate,enddate,prize,registeredusers,contestdetail,rules,upcoming,previous,ongoing}=req.body
let contest=new Contest({
  name,
  starttime,
  endtime,
  startdate,
  enddate,
  prize,
  registeredusers,
  contestdetail,
  rules,
  upcoming,
  previous,
  ongoing
})
try{
await contest.save()
}catch{
const error=new HttpError('Could not create a contest please try again later',500)
return next(error)
}
res.status(200).json({contest:contest.toObject({getters:true})})
}


const updatecontest=async (req,res,next)=>{
const contestid=req.params.cid
let contest
try{
contest=await Contest.findById(contestid)
}catch(err){
    return next(new HttpError('Could not update the details,please try again later',500))
}
if(!contest){
    return next(new HttpError('Could not find a contest to update,please try again later',422))
}

try{
await contest.save()
}catch(err){
    return next(new HttpError('Could not update the details,please try again later',500))
}
res.status(200).json({contest:contest.toObject({getters:true})})
}


const getcontest=async (req,res,next)=>{
const contestid=req.params.cid
let contest;
try{
contest=await Contest.findById(contestid)
}catch(err){
    const error=new HttpError('Could not fetch the contest,please try again later',500)
    return next(error)
}
if(!contest){
    return next(new HttpError("Could not find a contest with that id,please try again later",422))
}
res.status(200).json({contest:contest.toObject({getters:true})})
}


const getallcontests=async (req,res,next)=>{
let contests;
try{
contests=await Contest.find({})
}catch(err){
return next(new HttpError("Could not fetch the contests,please try again later",500))
}
if(!contests){
    return next(new HttpError("There are no contests currently available",422))
}
res.status(200).json({contests:contests.map(contest=>contest.toObject({getters:true}))})
}

const deletecontest=async (req,res,next)=>{
const contestid=req.params.cid
let contest;
try{
contest=await Contest.findById(contestid)
}catch(err){
return next(new HttpError('Could not delete the contest,please try again later',500))
}
if(!contest){
    return next(new HttpError('Could not find a contest with that id',422))
}
try{
await contest.remove()
}catch(err){
return next(new HttpError('Could not delete the contest,please try again later',500))
}
res.status(200).json({message:'Deleted successfully'})
}
module.exports={
    createcontest,
    updatecontest,
    getcontest,
    getallcontests,
    deletecontest
}