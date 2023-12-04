var fs = require("fs");
const path = require("path");
const express = require('express')
const app = express()
var cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors({
	origin: 'http://localhost:3001'
  }));
  app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

// Apis


// Main Menu
app.post('/calendarnotes',cors(),function (req, res) {
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
        "creator": 1,
        "creatoruser": 122504
      },
      {
        "id": 1691,
        "dateid": 12305,
        "time": "",
        "note": "حذف نوت از تقویم بررسی شود",
        "description": "",
        "catid": null,
        "color": null,
        "creator": 1,
        "creatoruser": 122504
      },
      {
        "id": 1690,
        "dateid": 12305,
        "time": "",
        "note": "تیکتینگ پشتیبانی بررسی شود",
        "description": "",
        "catid": null,
        "color": null,
        "creator": 1,
        "creatoruser": 122504
      }
    ]
)
})

// Sidebar Menus
app.get('/notecatlist',cors(), function (req, res) {

  
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

app.post('/viewcalendarnote',cors(), function (req, res) {  
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




app.listen(3000)