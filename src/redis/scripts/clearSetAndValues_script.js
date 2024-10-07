import { redisClient } from '../redisClient.js'

const script = `
    --
    -- Delete all associated values of set members and the set.
    -- 
    -- @param {string} KEYS[1] - The set to operate on. 
    -- 
    local setKey = KEYS[1]
    local members = redis.call('SMEMBERS', setKey)
    local total = 0 

    for _, member in ipairs(members) do
        total = total + redis.call('DEL', member)
    end
    total = total + redis.call('DEL', setKey)

    return total
`

/**
 * Load lua script for clearSetAndValues
 *
 * @returns {null} 
 */
const load = async () => {
  redisClient.defineCommand("clearSetAndValues", {
    numberOfKeys: 1,
    lua: script,
  });  
};

/**
 * Get an auto increment number of a key using Lua script. 
 *
 * @returns {Promise} - a Promise, resolving to an auto increment number of a key.
 */
// const clearSetAndValues = (key) => {  
//   return redisClient.clearSetAndValues(key)
// }
  
export { load };

/*
ioredis | Lua Scripting
https://github.com/redis/ioredis

ioredis supports all of the scripting commands such as EVAL, EVALSHA and SCRIPT. 
However, it's tedious to use in real world scenarios since developers have to take 
care of script caching and to detect when to use EVAL and when to use EVALSHA. 
ioredis exposes a defineCommand method to make scripting much easier to use:

const redis = new Redis();

// This will define a command myecho:
redis.defineCommand("myecho", {
  numberOfKeys: 2,
  lua: "return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}",
});

// Now `myecho` can be used just like any other ordinary command,
// and ioredis will try to use `EVALSHA` internally when possible for better performance.
redis.myecho("k1", "k2", "a1", "a2", (err, result) => {
  // result === ['k1', 'k2', 'a1', 'a2']
});

// `myechoBuffer` is also defined automatically to return buffers instead of strings:
redis.myechoBuffer("k1", "k2", "a1", "a2", (err, result) => {
  // result[0] equals to Buffer.from('k1');
});

// And of course it works with pipeline:
redis.pipeline().set("foo", "bar").myecho("k1", "k2", "a1", "a2").exec();

*/