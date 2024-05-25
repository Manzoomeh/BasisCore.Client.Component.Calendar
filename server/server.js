var fs = require("fs");
const path = require("path");
const express = require('express')
const app = express()
var cors = require('cors');
const bodyParser = require('body-parser');
var router = express.Router();


// Apis


// Main Menu
router.post('/calendarnotes',cors(),function (req, res) {
  res.send(
    [{"id": 3281, "dateid": 12457, "time": "", "note": "2:00", "description": "", "catid": 2842, "color": "#B388FF", "creator": 1, "creatoruser": 122504}, {"id": 3263, "dateid": 12456, "time": "", "note": "\u06f2:..", "description": "", "catid": 2842, "color": "#B388FF", "creator": 1, "creatoruser": 122504}, {"id": 3262, "dateid": 12455, "time": "", "note": "\u06f2:..", "description": "", "catid": 2842, "color": "#B388FF", "creator": 1, "creatoruser": 122504}, {"id": 3261, "dateid": 12450, "time": "", "note": "1:15", "description": "", "catid": 2842, "color": "#B388FF", "creator": 1, "creatoruser": 122504}]
)
})

// Sidebar Menus
router.get('/calendartemplates',cors(), function (req, res) {
  
  res.send([
    {
      "id": 1717,
      "color": "#A3FF37",
      "count": 0,
      "title": "جلسه",
      "todolist": true
    },
    {
      "id": 1718,
      "color": "#30A9D8",
      "count": 2,
      "title": "تسک های خودم",
      "todolist": false
    },
    {
      "id": 1733,
      "color": "#FFFFFF",
      "count": 0,
      "title": "",
      "todolist": false
    }
  ]);
})

router.post('/viewcalendarnote', function (req, res) {  
  res.send(
    [
      {
        "id": 1693,
        "dateid": 12304,
        "time": "",
        "note": "ریلیز نوت 50",
        "description": "",
        "catid": 1718,
        "color": "#30A9D8",
        "creator": "غدیره مرادی",
        "creatoruser": 0,
        "reminders": [
          {
            "id": 644,
            "timeunitid": 3,
            "timeunit": "روز",
            "value": 1,
            "actionid": 1,
            "action": "email",
            "typeid": 1
          }
        ],
        "sharing": []
      }
    ]
  );
})
router.get('/calendartemplates', function (req, res) {  
  res.send(
    [
      {
        "id": 1,
        "title": "شمسی"
      },
      {
        "id": 2,
        "title": "میلادی"
      },
      {
        "id": 3,
        "title": "قمری"
      },
      {
        "id": 4,
        "title": "t"
      },
      {
        "id": 5,
        "title": "test1"
      },
      {
        "id": 6,
        "title": "tttt"
      },
      {
        "id": 7,
        "title": "s"
      },
      {
        "id": 8,
        "title": "s"
      },
      {
        "id": 9,
        "title": "try"
      },
      {
        "id": 10,
        "title": "tr"
      },
      {
        "id": 11,
        "title": "g"
      },
      {
        "id": 12,
        "title": "test100"
      },
      {
        "id": 13,
        "title": "lastTest"
      }
    ]
  );
})
router.post('/sharing',cors(), function (req, res) {  
  res.send(
  {"errorid": 3, "message": "username is invalid", "users": [{"username": "d1254", "errorid": 8, "message": "There is no user with this username"}]}

  )
})




app.listen(8000)
module.exports = router;
