const mongoClient = require("mongodb").MongoClient;

const state = {
  db: null,
};

module.exports.connect = async function () {
  const url = "mongodb://127.0.0.1:27017";
  const dbname = "shopping";

  try {
    const client = await mongoClient.connect(url);
    state.db = client.db(dbname);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

module.exports.get = function () {
  return state.db;
};
