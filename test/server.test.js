import { redisClient, disconnect } from "../src/redis/redisClient.js"
import { readCache, writeCacheEX, writeCache, updateCache } from "../src/SQR.js"

const testSuiteName = 'SQR_server';

beforeAll( async () => {
  // Flush database 
  await redisClient.flushdb()
} )

afterAll( async () => { 
  // Release Redis connection.
  await disconnect()
} );

describe(`${testSuiteName}: Round 1`, () => {
    test(`${testSuiteName}: fetch 10000 times`, async () => {
        for (let i=0; i<10000; i++) {
            await fetch('http://localhost:3000/demo')
        }
    }, 60000);
})

describe(`${testSuiteName}: Round 2`, () => {
    test(`${testSuiteName}: fetch 10000 times`, async () => {
      for (let i=0; i<10000; i++) {
          await fetch('http://localhost:3000/cache')
      }
    }, 60000);
})
