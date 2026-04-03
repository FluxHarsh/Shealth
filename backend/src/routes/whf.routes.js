const router = require('express').Router();


router.get('/', (req, res) => {
  res.send('whf route working');
});

module.exports = router;
