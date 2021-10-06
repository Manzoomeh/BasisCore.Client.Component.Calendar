var express = require("express");
var router = express.Router();
// // middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
router.get("/userid", function (req, res) {
  console.log("profile");
  res.json({ "userid": '122504' });
});






module.exports = router;
