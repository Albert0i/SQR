import { redisClient, disconnect } from "../src/redis/redisClient.js"
import { readCache, writeCacheEX, writeCache, updateCache } from "../src/SQR.js"

const testSuiteName = 'SQR_demo';
const sql = `SELECT f1.*, f2.*, 
                ( SELECT COUNT(*) 
                  FROM dcdevdtc.nanders f3 
                  WHERE f1.famnum=f3.famnum ) AS famsiz 
             FROM dcdevdta.family f1, dcdevdtb.members f2
             WHERE f1.famnum=f2.famnum AND 
                   f1.age IN (SELECT age FROM dcdevdtd.anotherTable) 
             ORDER BY f2.memseq ASC`

const updateSQL = "UPDATE members SET name='', age=0 WHERE famnum=123 "

const john = {
    "userId": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "age": 30,
    "isActive": true,
    "roles": ["user", "admin"],
    "profile": {
      "bio": "Software developer with a passion for open source.",
      "website": "https://johndoe.dev",
      "socialMedia": {
        "twitter": "@john_doe",
        "linkedin": "https://linkedin.com/in/johndoe"
      }
    }
  }

beforeAll( async () => {
  // Flush database 
  await redisClient.flushdb()
} )

afterAll( async () => { 
  // Release Redis connection.
  await disconnect()
} );

describe(`${testSuiteName}: Round 1`, () => {
  test(`${testSuiteName}: readCache miss`, async () => {
    const result = await readCache(sql)

    expect(result).toEqual(null)
  });

  test(`${testSuiteName}: writeCacheEX`, async () => {
    const result = await writeCacheEX(sql, JSON.stringify(john))

    expect(result).toEqual("OK")
  });

  test(`${testSuiteName}: readCache hit`, async () => {
    const result = await readCache(sql)

    expect(JSON.parse(result)).toEqual(john)
  });

  test(`${testSuiteName}: readCache miss after 3 seconds`, async () => {
    // imitate delay 
    await new Promise(resolve => setTimeout(resolve, 3000));  
    const result = await readCache(sql)

    expect(result).toEqual(null)
  });  
})

describe(`${testSuiteName}: Round 2`, () => {
  test(`${testSuiteName}: writeCache`, async () => {
    const result = await writeCache(sql, JSON.stringify(john))

    expect(result).toEqual([[null, "OK"], [null, 1], [null, 1], [null, 1], [null, 1]])
  });

  test(`${testSuiteName}: readCache hit`, async () => {
    const result = await readCache(sql)

    expect(JSON.parse(result)).toEqual(john)
  });

  test(`${testSuiteName}: updateCache`, async () => {
    const result = await updateCache(updateSQL)

    expect(result).toEqual( [[null, 2]])
  });
  
  test(`${testSuiteName}: readCache miss`, async () => {
    const result = await readCache(sql)

    expect(result).toEqual(null)
  });

  test(`${testSuiteName}: remaining keys`, async () => {
    const result = await redisClient.keys('*')

    expect(result).toEqual(["SQR:cache:family", "SQR:cache:nanders", "SQR:cache:anothertable"])
  });
})
