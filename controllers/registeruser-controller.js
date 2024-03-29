const RegisteredUser = require("../models/registeredUser");
const User = require("../models/User");
const Contest = require("../models/Contest");
const mongoose = require("mongoose");
const getUsers = async (req, res, next) => {
  let contestid = req.params.cid;
  let contestwithregisteredusers;
  try {
    contestwithregisteredusers = await Contest.findById(contestid).populate(
      "registeredusers"
    );
  } catch (error) {
    return res.status(500).json({message:'Internal server error'})
  }
  if (
    !contestwithregisteredusers ||
    contestwithregisteredusers.registeredusers.length === 0
  ) {
    return res
      .status(404)
      .json({ message: "There are no registered users uptil now." });
  }
  return res
    .status(200)
    .json({ data: contestwithregisteredusers.registeredusers });
};
const registerforcontest = async (req, res, next) => {
  let { uid, cid } = req.body;
  let contest, user;
  try {
    contest = await Contest.findById(cid);
    user = await User.findById(uid);
    if (user){
      let registereduser = await RegisteredUser.findOne({ email: user.email,contestname:contest.contestname,contestid:contest._id });
      if (registereduser) {
        return res.json({
          message: "you are already registered.",
          registereduser,
        });
      }
    }
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Could not register right now,please try again later" });
  }
  if(!contest){
    return res
      .status(404)
      .json({
        message:
          "Could not find the contest that you are trying to register for,please try again later",
      });
  }
  if (!user) {
    return res
      .status(404)
      .json({ message: "Could not find the user,please try again later" });
  }
  let starttime=parseInt(contest.starttime)
   if(Date.now()>starttime){
     return res.status({message:'Registration time is already over!'})
   }
  if(contest.seats_filled==contest.seats_left){
    return res.json({message:'All seats are boooked cannot register you'})
  }
  let newuser = new RegisteredUser({
    name: user.name,
    email: user.email,
    mainuserid:uid,
    contestid:cid,
    phoneno: user.phoneno,
    college: user.college,
    year: user.year,
    branch: user.Branch,
  });
  let totalslots = contest.totalslots.length;
  let givenslot;
  if (contest.availableslot.length === 0) {
    let slotarray = new Array(totalslots).fill(0);
    contest.availableslot = slotarray;
  }
  try {
    for (let i = 0; i < totalslots; ++i) {
      if (contest.availableslot[i] < contest.slotstrength) {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        givenslot = i + 1;
        contest.availableslot[i] = contest.availableslot[i] + 1;
        newuser.slot.slotno = givenslot;
        newuser.slot.slotstarttime = contest.totalslots[i].slotstarttime;
        newuser.slot.slotendtime = contest.totalslots[i].slotendtime;
        newuser.contestname = contest.contestname;
        await newuser.save({ session: sess });
        contest.seats_filled=contest.seats_filled+1
        contest.seats_left=contest.seats_left-1
        contest.registeredusers.push(newuser);
        user.usercontestdetail.push(newuser);
        await contest.save({ session: sess });
        await user.save({ session: sess });
        await sess.commitTransaction();
        break;
      }
    }
  } catch (e) {
    return res.status(500).json({message: e });
  }
  if (givenslot) {
    var api_key = process.env.EMAIL_KEY;
    var domain = "geeksmanjcbust.in";
    var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });
    var data = {
      from: "<cedept@geeksmanjcbust.in>",
      to: user.email,
      subject: "Thanks for Registering",
      html: `
        <h2>Dear ${user.name},<h2>
        <p>Thank you for registering to ${
          contest.contestname
        } on GeeksCode by Geeksman-The Coding Society of JC Bose UST. Your registration has been received</p>
        <p>You registered with this email: ${user.email}.<p>
        Your designated slot is ${givenslot}
        Date and time of slot:-${
       (new Date(contest.totalslots[givenslot - 1].slotstarttime)).toLocaleString()+'&nbsp;&nbsp;' +'to '+(new Date(contest.totalslots[givenslot-1].slotendtime)).toLocaleString()
        }
        <p>You can simply take the test by clicking at this link at you designated time slot.<a href="https://geeksmanjcbust.in/contests/${
          contest.contestname
        }">Link</a>
        If you have any questions leading up to the event, feel free to reply to cedept@geeksmanjcbust.in or you can also use the geeksman<br>
        support feature,someone from our team will resolve your doubts<br>
        We look forward to seeing you on EVENT DATE!<br>
        Kind Regards,<br>
        Geeksman Family
        `,
    };
    mailgun.messages().send(data, function (error, body) {
      if (error) {
        return res.status(500).json({message:'Slot mail could not be sent,server error'})
      }
    });
    return res
    .status(200)
    .json({ message: "You have been registered,please check your email" });
  }else{
    return res.json({message:'Slots are full'})
  }
};
const updatedetails = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const { Name, email, PhoneNo, branch, College, year } = req.body;
    let registereduser = await RegisteredUser.findOne({ _id });
    if (registereduser) {
      registereduser.Name = Name;
      registereduser.email = email;
      registereduser.PhoneNo = PhoneNo;
      registereduser.branch = branch;
      registereduser.College = College;
      registereduser.year = year;
      await registereduser.save();
      return res.status(201).json({ Success: "Update Successfull" });
    } else {
      return res.status(201).json({ Failure: "Please try again later" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
module.exports = {
  getUsers,
  registerforcontest,
  updatedetails,
};
