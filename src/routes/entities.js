const express = require('express');
const {
  schemas, createEntity, listEntities, getEntity, getEntityDetail
} = require('../services/entityService');
const router = express.Router();

router.get('/:type/:id/detail', async (req,res)=>{
  try {
    const data=await getEntityDetail(req.params.type,req.params.id);
    if(!data) return res.status(404).json({success:false,message:'Record not found'});
    res.json({success:true,data});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});


router.get('/:type/:id', async (req,res)=>{
  try { const data=await getEntity(req.params.type,req.params.id); if(!data)return res.status(404).json({success:false,message:'Record not found'}); res.json({success:true,data}); }
  catch(e){res.status(500).json({success:false,message:e.message});}
});
router.get('/:type', async (req,res)=>{
  try { const type=req.params.type.toUpperCase(); if(!schemas[type])return res.status(400).json({success:false,message:'Unsupported entity type'}); res.json({success:true,data:await listEntities(type)}); }
  catch(e){res.status(500).json({success:false,message:e.message});}
});
router.post('/:type', async (req,res)=>{
  try { const type=req.params.type.toUpperCase(); if(!schemas[type])return res.status(400).json({success:false,message:'Unsupported entity type'}); if(type==='PERSON'&&!String(req.body.firstName||'').trim())return res.status(400).json({success:false,message:'First name is required'}); if(type==='CASE'&&!String(req.body.title||'').trim())return res.status(400).json({success:false,message:'Case title is required'}); const data=await createEntity(type,req.body); res.status(201).json({success:true,message:`${schemas[type].label} created successfully`,data}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:e.message});}
});
module.exports=router;
