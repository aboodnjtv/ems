const express = require("express");
const router = express.Router();

router.get("/services/cost_per_pound",(req,res)=>{
    res.render("services/cost_per_pound");
});

router.get("/services/compare_two_products",(req,res)=>{
    res.render("services/compare_two_products");
});

router.get("/services/wheatgrass_seeds_needed",(req,res)=>{
    res.render("services/wheatgrass_seeds_needed");
});

module.exports = router;
