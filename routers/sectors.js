const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

router.post('/create', async (req, res) => {
    console.log(req.body);
    res.json({ code: 200 });
});

module.exports = router;
