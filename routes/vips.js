const express = require("express");
const { VipModel, validateVip } = require("../models/vipModel");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        let data = await VipModel.find().limit(20);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.post("/", async (req, res) => {
    let validBody = validateVip(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let vip = new VipModel(req.body);
        await vip.save();
        res.json(vip)
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.put("/:id", async (req, res) => {
    let validBody = validateVip(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let id = req.params.id;
        let data = await VipModel.updateOne({ _id: id }, req.body);
        res.json(data)
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let data = await VipModel.deleteOne({ _id: id });
        res.json(data)
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

module.exports = router;