const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
    name: String,
    info: String,
    date_created: {
        type: Date, default: Date.now
    },
})
exports.VipModel = mongoose.model("vips", schema)

exports.validateVip = (_reqBody) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(400).required(),
        info: Joi.string().min(2).max(400).required(),
    })
    return joiSchema.validate(_reqBody)
}