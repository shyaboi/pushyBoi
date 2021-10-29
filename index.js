const express = require("express");
const webpush = require("web-push");
const path = require("path");
var cors = require("cors");
var app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
require("dotenv").config();

const port = process.env.PORT || 5000;
//dotenv vars
const pubKey = process.env.LWW_PUB_KEY;
const priKey = process.env.LWW_PRI_KEY;
const email = process.env.EMAIL;
const auth = process.env.AUTH;

const publicVapidKey = pubKey;
const privateVapidKey = priKey;
webpush.setVapidDetails(`mailto:${email}`, publicVapidKey, privateVapidKey);

//utilFuncs consts
const dateInt = new Date();
const dateString = dateInt.toDateString();
const timeString = dateInt.toTimeString();
const unixEpoc = dateInt.getTime();
const parseIp = (req) => req.headers['x-forwarded-for'].split(',').shift() || req.socket.remoteAddress

// import insertSub from './db'
const { 
  getAllSubbed,
  insertIfNotExist,
  removeItem,
  insertLog,
  getAllLogs
} = require("./db");

var allowlist = ["https://app.foodallergyawareness.org"];

var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// Set static path
app.use(express.static(path.join(__dirname, "client")));

// Subscribe Route
app.post("/sub", cors(corsOptionsDelegate), (req, res) => {
  // TODO make an auth token so not anyone can sub
  const subscription = req.body;
  // console.log(subscription.sub)
  if(subscription.sub != undefined){
    insertIfNotExist(subscription);
    res.status(201).json({msg:"Sub Entered"})
  }else{
    insertLog({bork:"*μBORK* json body does not match model", triggeredBy: '/allSubsNoti', requesterBody:subscription, requesterIP:parseIp(req), dateHRF:dateString, timeHRF:timeString, unixEpocTime:unixEpoc})
    console.log(subscription);
    res.status(403).json({msg:"Please dont do that"});
  }
});


app.post("/allSubsNoti", cors(corsOptionsDelegate), async (req, res) => {
  const clientData = req.body;
  if (clientData.auth === auth) {
    const allRoutes = await getAllSubbed(clientData.host);
    if (allRoutes.length > 0) {
      console.log(allRoutes)
      allRoutes.forEach((ele) => {
        const payload = JSON.stringify(clientData.payload);
        const sub = ele.sub;
        webpush.sendNotification(sub, payload).catch((err) => {
          removeItem(sub);
          if(err){
            console.error("Error was ====> " + err);
            insertLog({bork:"***ERROR*** Notification not sent", error: err, triggeredBy: '/allSubsNoti',  requesterBody:sub, requesterIP:parseIp(req), dateHRF:dateString, timeHRF:timeString, unixEpocTime:unixEpoc})
          }
        });
      });
      res.status(200).json({msg:"allRoutes Pinged!"});
    } else {
      insertLog({bork:"*μBORK* No Routes Found", triggeredBy: '/allSubsNoti', requesterBody:clientData, requesterIP:parseIp(req), dateHRF:dateString, timeHRF:timeString, unixEpocTime:unixEpoc})
      res.status(404).json({ msg: "No Route Found" });
    }
  } else {
    insertLog({bork:"**BORK** Unauthorized push notification attempt!", triggeredBy: '/allSubsNoti',  requesterBody:clientData, requesterIP:parseIp(req), dateHRF:dateString, timeHRF:timeString, unixEpocTime:unixEpoc})
    res.status(403).send({msg:"not authed to send notis"});
  }
});


app.get('/server/up', (res, req)=>{
  req.status(200).json({msg:"Server Is Up"});
})


app.get('/server/logs', (res, req)=>{

  console.log(getAllLogs());
  req.status(200).json({msg:"Server Is Up"});
})




app.listen(port, () => console.log(`Server started on port ${port}`));