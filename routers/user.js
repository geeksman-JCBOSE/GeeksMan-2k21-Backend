const express = require("express");
const { check } = require("express-validator");
const adminmiddleware=require('../middleware/check-auth')
const usercontroller = require("../controllers/user-controller");
const router = express.Router();
//signup route for user
router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 5 }),
  ],
  usercontroller.signuphandler
);
//admin can directly create user
router.post("/createuser-byadmin",adminmiddleware,[
  check("name").not().isEmpty(),
  check("email").normalizeEmail().isEmail(),
  check("password").isLength({ min: 5 }),
],usercontroller.createuserbyadmin);
//login route for user
router.post("/login", usercontroller.loginhandler);
//Route present in the email to reset password
router.post("/resetpassword", usercontroller.resetPassword);
//Route to get user by id
router.get("/users/getuser/:uid", usercontroller.getuserbyid);
//return all the present users
router.get("/users",adminmiddleware,usercontroller.getallusers)
//delete users [an array of id's is passed from client]
router.delete("/deleteuser",adminmiddleware,usercontroller.deleteuser);
//update user by id
router.patch("/users/updateuser/:uid",usercontroller.updateuser);
//Route to generate email for resetting password
router.post("/forgotpassword",usercontroller.forgotpass);
//Route to get all the contests registered by the user
router.get("/getusercontests/:uid",usercontroller.getUserContest);
module.exports=router