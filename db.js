const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const user = process.env.LWWUSER;
const pass = process.env.LWWPASS;
// const uri = process.env.URI
const url = `mongodb+srv://${user}:${pass}@cluster0.txyhn.mongodb.net/pushItDb?retryWrites=true&w=majority`;
const dbName = "pushItDb";
const client = new MongoClient(url);

const dateInt = new Date();
const dateString = dateInt.toDateString();
const timeString = dateInt.toTimeString();
const unixEpoc = dateInt.getTime();


const getAll = async () => {
  await client.connect();
  console.log("starting getAll Item in DB");
  const db = client.db(dbName);
  const collection = db.collection("subscriptions");
  const insertResult = await collection.find({}).toArray();
  client.close();
  return await insertResult;
};

const getAllSubbed = async (host) => {
  await client.connect();
  console.log("starting getAll Item in DB");
  const db = client.db(dbName);
  const collection = db.collection("subscriptions");
  const subscibers = await collection.find({ host: host }).toArray();
  client.close();
  return await subscibers;
};

const removeItem = async (itemToRemove) => {
  let itemTR = await itemToRemove;
  console.log(
    "removing the following expired subscription endpoints ===>" +
      itemTR.endpoint
  );
  await client.connect();
  const db = await client.db(dbName);
  const collection = await db.collection("subscriptions");
  await collection.deleteOne({ endpoint: itemTR.endpoint });
  client.close();
  // return itemToRemove+"item removed";
};

const insertIfNotExist = (sub) => {
  async function innerThing(sub) {
    await client.connect();
    console.log("Connected to DB");
    const db = client.db(dbName);
    const collection = db.collection("subscriptions");
    const insertResult = await collection.updateOne(
      { endpoint: sub.endpoint },
      { $set: { host: sub.host, sub: JSON.parse(sub.sub), subHRFDate:dateString, subHRFTime: timeString, subUnixEpoc:unixEpoc } },
      { upsert: true }
    );
    console.log("Inserted documents =>", insertResult);
    return "done.";
  }
  innerThing(sub)
    .then(console.log("Insert Complete"))
    .catch(console.error)
    .finally(() => client.close());
};

const insertLog = async (log) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("log");
  const insertResult = await collection.insertOne({ log: log });
  console.log("Inserted documents =>", insertResult);
};

const getAllLogs = async () => {
  await client.connect();
  console.log("starting getAll Item in DB");
  const db = client.db(dbName);
  const collection = db.collection("log");
  const insertResult = await collection.find({}).toArray();
  client.close();
  return await insertResult;
};

module.exports = {
  getAll,
  insertIfNotExist,
  removeItem,
  getAllSubbed,
  insertLog,
  getAllLogs,
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//this insert is not  aware of previous inserts, thus if  you add an entry twice, it will. Do. Not. Want./////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// let insertSub = (host, sub)=>{
//     async function innerThing(host, sub) {
//         await client.connect();
//         console.log('starting insertSub Item in DB');
//         const db = client.db(dbName);
//         const collection = db.collection('subscriptions');
//         const insertResult = await collection.insertOne({host:host, sub});
//         console.log('Inserted documents =>', insertResult);
//         return 'done.';
//     }
//     innerThing(host, sub)
//         .then(console.log('Insert Complete'))
//     .catch(console.error)
//     .finally(() => client.close());
// }



//////////////////////////////////////////////////////////////////////
//probly dont need, but incase  you need insert many//////////////////
//////////////////////////////////////////////////////////////////////
// async function insertMany(arry) {
//   await client.connect();
//   console.log('Connected successfully to server');
//   const db = client.db(dbName);
//   const collection = db.collection('subscription');
//   const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
//   console.log('Inserted documents =>', insertResult);
//   return 'done.';
// }
