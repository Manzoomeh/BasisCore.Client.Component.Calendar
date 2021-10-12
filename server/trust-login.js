var express = require("express");
var router = express.Router();
// // middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
router.post("/userid", function (req, res) {
  res.status(200).json({ "userid": '122504' })
});






module.exports = router;
