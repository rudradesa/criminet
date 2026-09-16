const express=require('express');
const {getGraph}=require('../services/entityService');
const router=express.Router();
router.get('/',async(req,res)=>{
  try {
    const data=await getGraph({rootType:req.query.rootType,rootId:req.query.rootId,depth:req.query.depth,maxNodes:req.query.maxNodes});
    res.json({success:true,data});
  } catch(e) {
    console.error(e);
    res.status(500).json({success:false,message:e.message});
  }
});
module.exports=router;
