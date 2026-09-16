const express = require('express');
const { discoverRelationships, getDiscoveryForEntity } = require('../services/entityService');
const router = express.Router();

router.get('/discover', async (req, res) => {
  try {
    const data = await discoverRelationships({
      rootType: req.query.rootType,
      rootId: req.query.rootId,
      depth: req.query.depth,
      maxNodes: req.query.maxNodes
    });
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/entity/:type/:id', async (req, res) => {
  try {
    const data = await getDiscoveryForEntity(req.params.type, req.params.id);
    if (!data.entity) return res.status(404).json({ success:false, message:'Entity not found' });
    res.json({ success:true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:e.message });
  }
});

module.exports = router;
