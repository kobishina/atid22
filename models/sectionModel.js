const mongoose = require("mongoose");
const Joi = require("joi")

const sectionSchema = new mongoose.Schema({
  title:String,
  info:String,
  cat_url:String,
  img_url:String,
  user_id:String,
  // מאפיין שבודק אם לחשוף ללקוח קצה
  active:{
    type:Boolean, default:true
  },
  // תאריך שנוספה בו הרשומה ומקבל פונקציה
  // שמייצרת לו את התאריך של אותו רגע
  date_created:{
    type:Date, default:Date.now
  }
})

exports.SectionModel = mongoose.model("sections",sectionSchema);

exports.validateSection = (_reqBody) => {
  let joiSchema = Joi.object({
    title:Joi.string().min(1).max(150).required(),
    info:Joi.string().min(1).max(2000).required(),
    cat_url:Joi.string().min(1).max(150).required(),
    img_url:Joi.string().min(1).max(300).allow(null,"")
  })
  return joiSchema.validate(_reqBody);
}
