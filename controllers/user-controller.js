const { validationResult } = require("express-validator");
const User = require("../models/User.js");
const api_key = process.env.EMAIL_KEY;
const domain = "geeksmanjcbust.in";
var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });
const HttpError = require("../models/Http-error");
const bcrypt = require("bcryptjs");
const {cloudinary}=require('../Cloudinaryconfig/Cloudinary')
const jwt = require("jsonwebtoken");
const PendingUser = require("../models/PendingUser");
const signuphandler = async (req, res, next)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed,please check your data", 422)
    );
  }
  const { name, email, password } = req.body;
  let existinguser, pendinguser;
  try {
    existinguser = await User.findOne({ email });
    pendinguser = await PendingUser.findOne({ email });
  } catch (err) {
    const error = new HttpError("Signup failed,please try again later", 500);
    return next(error);
  }
  if (existinguser) {
    return res.status(409).json({message:'User is already registered,Please login instead'})
  }
  if (pendinguser) {
    const error = new HttpError(
      "This email address is already registered,please verify",
      409
    );
    return next(error);
  }
  let hashedpassword;
  try {
    hashedpassword = await bcrypt.hash(password, 8);
  } catch (err) {
    const error = new HttpError("Could not sign you up,please try again later", 500);
    return next(error);
  }
  const newpendinguser = new PendingUser({
    name,
    email,
    password: hashedpassword,
  });
  try {
    await newpendinguser.save();
    let hash = newpendinguser._id;
    var data = {
      from: "<cedept@geeksmanjcbust.in>",
      to: newpendinguser.email,
      subject: "Thanks for Registering",
      html: `<h2>Hi  ${newpendinguser.name}</h2>
    <p>Thanks for getting started with GeeksCode by Geeksman-The Coding Society!We need a little more information <br>
    to complete your registration, including a confirmation of your email address.</p><br>
    <p>Click below to confirm your email address:
    <a href="${process.env.BACKEND_URL}activate/user/${hash}">link</a><br>If you have problems, please paste the above URL into your web browser.</p>`,
    };
    mailgun.messages().send(data, function (error, body) {
      if (error) {
        return res.status(500).json({message:'Registration mail could not be sent,server error'})
      }
    });
    return res
      .status(201)
      .json({ message: "You have been registered,check your email address" });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed,please try again later",
      500
    );
    return next(error);
  }
};
const loginhandler = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError("Internal server error,please try again later", 500);
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials,could not log you in",
      400
    );
    return next(error);
  }
  let isvalidpasword = false;
  try {
    isvalidpasword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Internal server error,please try again later",
      500
    );
    return next(error);
  }
  if (!isvalidpasword) {
    const error = new HttpError(
      "could not log you in, please check your credentials",
      401
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "24h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed,please try again later",
      500
    );
    return next(error);
  }
  await existingUser.save();
  res.status(200).json({
    userid: existingUser.id,
    email: existingUser.email,
    username: existingUser.name,
    token,
  });
};
const updateuser = async (req, res, next) => {
  const userid = req.params.uid;
  const allowedupdates=['year','profilePhotoLocation','phoneno','college','Branch']
  const updates=Object.keys(req.body)
  const {profilePhotoLocation}=req.body
  if(profilePhotoLocation){
    let imageresponse;
    try{
      imageresponse=await cloudinary.uploader.upload(profilePhotoLocation,{upload_preset:'Users-images'})
    }
    catch(err){
       return res.status(500).json({message:'Image upload failed'})
    }
    req.body.profilePhotoLocation=imageresponse.secure_url
  }
  const isvalidoperation=updates.every((update)=>{
    return allowedupdates.includes(update)
  })
  if(!isvalidoperation){
    return res.status(400).json({message:'Invalid update data'})
  }
  try{
    const user = await User.findByIdAndUpdate(userid,req.body,{runValidators:true});
  }catch (err){
    return next(
      new HttpError("Something went wrong please try again later", 500)
    );
  }

  res.status(200).json({message:'Profile updated successfully'});
};
const getuserbyid = async (req, res, next) => {
  const userid = req.params.uid;
  let user;
  try {
    user = await User.findById(userid,['-password']).populate('usercontestdetail');
  } catch (err) {
    const error = new HttpError(
      "Something went wrong could not fetch user please try again later",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError("Could not find a user with that id", 404);
  }
  res.status(200).json({ user: user.toObject({ getters: true }) });
};
const deleteuser = async (req, res, next) => {
  let userids = req.body.ids;
  try {
    await User.deleteMany({ id: [userids] });
  } catch {
    const error = new HttpError(
      "Could not delete the user,please try again later",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Users deleted Successfully !" });
};
const getallusers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, ["-password", "-token", "-usercontestdetail"]);
  } catch (err) {
    const error = new HttpError(
      "could not fetch users,please try again later",
      500
    );
    return next(error);
  }
  if (!users) {
    return next(
      new HttpError("Could not find users,please try again later", 404)
    );
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};
const forgotpass = async (req, res, next) => {
  try {
    const { email } = req.body;
    const thisuser = await User.findOne({ email });
    let token;
    try {
      token = jwt.sign(
        { email },
        process.env.JWTRESET_KEY,
        { expiresIn: "10m" }
      );
    } catch (err) {
      const error = new HttpError(
        "Logging in failed,please try again later",
        500
      );
      return next(error);
    }
    if(thisuser){
      let hash = thisuser._id;
      var data = {
        from: "<cedept@geeksmanjcbust.in>",
        to: thisuser.email,
        subject: "Reset Password",
        html: `<h2>Hi ${thisuser.name},</h2>
       <p>We got a request for changing your password at GeeksCode by Geeksman-The Coding Society!</p>
        <p>Click below to change your password <a href="${process.env.BACKEND_URL}changepassword/${hash}/${token}">Link</a></p><br>
        <p>If you have problems, please paste the above URL into your web browser. DONT CLICK THE LINK IF YOU HAVE NOT PLACED THIS REQUEST!!</p><br>
        <p>This url is active only for 10minutes</p>`,
      };
      mailgun.messages().send(data, function (error, body) {
        if (error) {
        return res.status(500).json({message:'Internal server error'})
        }
      });
      return res.status(200).json({
        message:
          "Your request for password change has been initiated,please check your email",
      });
    }else {
      return res.status(404).json({ message: "User Not found" });
    }
  }catch(error){
    return res.status(500).json({ message:'Internal server' });
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { password, id ,token} = req.body;
    try{
     const decodedtoken=jwt.verify(token,process.env.JWTRESET_KEY)
    }catch(err){
       return res.status(401).json({message:'Password reset failed'})
    }
    const thisuser = await User.findById(id);
    if (!thisuser) {
      return res.status(404).json({ message: "User does not exist" });
    }
    let hashedpassword;
    if (thisuser) {
      hashedpassword = await bcrypt.hash(password, 8);
      thisuser.password = hashedpassword;
      await thisuser.save();
      return res.status(200).json({ message: "password reset successfully" });
    } else {
      return res.status(404).json({message: "User Not found!" });
    }
  } catch (error) {
    return res.status(500).json({message: "Internal server error" });
  }
};
const getUserContest = async (req, res, next) => {
  const uid = req.params.uid;
  let userwithcontests;
  try {
    userwithcontests = await User.findById(uid).populate("usercontestdetail");
  } catch (e) {
    return res.status(404).json({ message: e });
  }
  if (!userwithcontests || userwithcontests.usercontestdetail.length === 0) {
    return res
      .status(404)
      .json({
        message: "There are no available previous contests done by you.",
      });
  }
  return res.status(200).json({ data: userwithcontests.usercontestdetail });
};
const createuserbyadmin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed,please check your data", 422)
    );
  }
  const { name, email, password } = req.body;
  let existinguser, pendinguser;
  try {
    existinguser = await User.findOne({ email });
    pendinguser = await PendingUser.findOne({ email });
  } catch (err) {
    const error = new HttpError("Signup failed,please try again later", 500);
    return next(error);
  }
  if (existinguser) {
    const error = new HttpError(
      "User already registered,Cannnot create new",
      422
    );
    return next(error);
  }
  if (pendinguser) {
    await pendinguser.remove();
  }
  let hashedpassword;
  try {
    hashedpassword = await bcrypt.hash(password, 8);
  } catch (err) {
    const error = new HttpError("Could not create user,try again later", 500);
    return next(error);
  }
  let newuser;
  newuser = await new User({
    name,
    email,
    password: hashedpassword,
  });
  await newuser.save();
  return res.status(201).json({ message: "User created successfully!!" });
};
module.exports = {
  signuphandler,
  loginhandler,
  updateuser,
  getuserbyid,
  getallusers,
  deleteuser,
  forgotpass,
  resetPassword,
  getUserContest,
  createuserbyadmin,
};