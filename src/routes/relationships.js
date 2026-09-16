const express=require('express');
const {discoverRelationships}=require('../services/entityService');
const router=express.Router();
// Read-only compatibility route. No relationship creation/deletion is possible.
router.get('/discover',async(req,res)=>{
  try { res.json({success:true,data:await discoverRelationships(req.query)}); }
  catch(e){res.status(500).json({success:false,message:e.message});}
});
router.get('/',async(req,res)=>{
  try { const data=await discoverRelationships(req.query); res.json({success:true,data:data.edges}); }
  catch(e){res.status(500).json({success:false,message:e.message});}
});
module.exports=router;
