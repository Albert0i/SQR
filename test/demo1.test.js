import { disconnect } from "../src/redis/redisClient.js"
import { readCache, writeCacheEX, writeCache, updateCache } from "../src/SQR.js"

const testSuiteName = 'SQR_demo1';
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

afterAll( async () => { 
  // Release Redis connection.
  await disconnect()
} );

describe(`${testSuiteName}: Test1`, () => {
  test(`${testSuiteName}: readCache`, async () => {      
    
    expect(1+1).toEqual(2)
  });
})
