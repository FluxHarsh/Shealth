const router = require('express').Router();


router.get('/', (req, res) => {
  res.send('user route working');
});

module.exports = router;