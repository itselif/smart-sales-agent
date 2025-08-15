const { createClient } = require("redis");

const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;
const redisUser = process.env.REDIS_USER || null;
const redisPwd = process.env.REDIS_PWD || null;

let redisUri = `redis://${redisHost}:${redisPort}`;
if (redisUser && redisPwd) {
  redisUri = `redis://${redisUser}:${redisPwd}@${redisHost}:${redisPort}`;
}

const client = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
  username: redisUser,
  password: redisPwd,
});
client.on("error", (err) => console.log("Redis Client Error", err));

client.on("connect", () => {
  console.log("Redis client connected");
});

const set = async (key, value) => {
  return new Promise((resolve, reject) => {
    client.set(key, value, (err, value) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

const get = async (key) => {
  try {
    let data = null;
    const dataStr = await client.get(key);
    if (dataStr) {
      data = JSON.parse(dataStr);
      if (data) data.source = "redis";
    }
    return data;
  } catch (err) {
    console.log(err.message);
    return null;
  }
};

const connectToRedis = async () => {
  console.log("connecting to redis", `redis://${redisHost}:${redisPort}`);
  try {
    await client.connect();
    console.log("connected to redis", `redis://${redisHost}:${redisPort}`);
  } catch (err) {
    console.log(err);
    console.log("cannot connect redis", `redis://${redisHost}:${redisPort}`);
  }
};

module.exports = {
  connectToRedis,
  set,
  get,
};
