const express = require('express');
const router = express.Router();
router.get('/', (req, res,next)=> {
    res.render('index', {
        title : 'Baat Cheet',
    });
});
module.exports = router;