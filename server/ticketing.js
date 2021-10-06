var express = require("express");
var router = express.Router();
// // middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
router.post("/:rKey/usernotes", function (req, res) {
  const result = [{"id":262,"dateid":11485,"time":"","note":"تست هفت شهریور","description":"","color":"9286f9","creator":1,"creatoruser":122504},{"id":265,"dateid":11479,"time":"","note":"gggg","description":"","color":"ff80c0","creator":1,"creatoruser":122504},{"id":266,"dateid":11482,"time":"","note":"تست ","description":"","color":"ff0000","creator":1,"creatoruser":122504},{"id":267,"dateid":11483,"time":"","note":"تست بلو","description":"","color":"0080ff","creator":1,"creatoruser":122504}]
  res.status(200).json(result)
});


router.post("/:rKey/addnote", function (req, res) {
	res.status(200).json({ "message": 'ok' })
  });

router.post("/:rKey/removenote", function (req, res) {
res.status(200).json({ "message": 'ok' })
});
  
module.exports = router;
