const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth")
const { UserModel, validateUser, validateLogin, createToken } = require("../models/userModel")

const router = express.Router();

// מאזין לכניסה לראוט של העמוד בית לפי מה שנקבע לראוטר
// בקובץ הקונפיג
router.get("/", async (req, res) => {
  res.json({ msg: "Users endpoint" });
})

// only for admin to see the users
router.get("/usersList", authAdmin, async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 20;
  let page = req.query.page - 1 || 0;
  let sort = req.query.sort || "_id"
  let reverse = req.query.reverse == "yes" ? 1 : -1

  try {
    let data = await UserModel
      .find({})
      .limit(perPage)
      .skip(page * perPage)
      .sort({ [sort]: reverse })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

//check the token and will bring all aspecialy the role
//will check in server side not in DB
router.get("/checkToken", auth, async (req, res) => {
  try {
    res.json(req.tokenData);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// מחזיר למשתמש את הפרטים שלו
router.get("/userInfo", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(user);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


// sign up
router.post("/", async (req, res) => {
  let validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    // להצפין את הסיסמא במסד עם מודול ביקריפט
    // 10 -> רמת הצפנה
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    // להסתיר את ההצפנה לצד לקוח
    user.password = "***"
    res.json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({ msg: "Email already in system", code: 11000 })
    }
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/logIn", async (req, res) => {
  let validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    // לבדוק אם בכלל יש רשומה עם המייל שנשלח
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Email Worng." })
    }
    // לבדוק אם הרשומה שנמצאה הסיסמא המוצפנות בתוכה מתאימה 
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "Password Worng." })
    }
    // לשלוח טוקן
    let token = createToken(user._id, user.role)
    // res.json({token:token})
    res.json({ token, role: user.role });
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

//http://localhost:3002/users/changeRole/6411adeb92dbccc6cc7dcbb4/admin
router.patch("/changeRole/:id/:role", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const newRole = req.params.role;
    // מונע ממשתמש לשנות את עצמו או את הסופר אדמין שלנו
    // 63b2a02cee44ada32ecbe89e -> admin@walla.com -> id
    if (id == req.tokenData._id || id == "63b2a046d03a8214f7599fde") {
      return res.status(401).json({ err: "You cant change your user role or the super admin" })
    }
    const data = await UserModel.updateOne({ _id: id }, { role: newRole })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


module.exports = router;