
import pkg from 'node-sql-parser';
import crypto from 'crypto';
import { redisClient } from './redis/redisClient.js'

const { Parser } = pkg;
const parser = new Parser();

const NAMESPACE = "SQR:cache:"
const TTL = 3  // Default TTL is three seconds 
const opt = {
  database: 'MySQL' 
}

/**
 * Calculate hash value 
 *
 * @param {string} data - A string value
 * @returns {string} - The hash value
 */
function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Read from cache
 *
 * @param {string} sql - A string value of SQL statement.
 * @returns {string} - The cached string or null.
 */
async function readCache(sql) {
  return redisClient.get(`${NAMESPACE}${hash(sql)}`)
}

/**
 * Write to cache with TTL
 *
 * @param {string} sql - A string value of SQL statement.
 * @param {string} result - The stringified Object to be cached.
 * @param {number} ttl - Time to live.
 * @returns {string} - "OK" or null.
 */
async function writeCacheEX(sql, result, ttl = TTL) {
  return redisClient.set(`${NAMESPACE}${hash(sql)}`, result, 'EX', ttl)
}

/**
 * Write to cache
 *
 * @param {string} sql - A string value of SQL statement.
 * @param {string} result - The stringified Object to be cached.
 * @returns {string} - Array of array containing results of pipeline.
 */
async function writeCache(sql, result) {
  const pipeline = redisClient.pipeline()
  const tableList = parser.tableList(sql, opt);
  
  pipeline.set(`${NAMESPACE}${hash(sql)}`, result);

  for (let i=0; i< tableList.length; i++) {
    // the format is {type}::{dbName}::{tableName} 
    // type could be select, update, delete or insert
    const parts = tableList[i].split("::")    
    pipeline.sadd(`${NAMESPACE}${parts[2].toLowerCase()}`, `${NAMESPACE}${hash(sql)}`);
  }
  return pipeline.exec()
}

/**
 * Update the cache
 *
 * @param {string} sql - A string value of SQL statement.
 * @returns {string} - Array of array containing results of pipeline.
 */
async function updateCache(sql) {
  const pipeline = redisClient.pipeline()
  const tableList = parser.tableList(sql, opt);
  
  for (let i=0; i< tableList.length; i++) {
    // the format is {type}::{dbName}::{tableName} 
    // type could be select, update, delete or insert
    const parts = tableList[i].split("::")
    pipeline.clearSetAndValues(`${NAMESPACE}${parts[2].toLowerCase()}`)
  }
  return pipeline.exec()
}

export { readCache, writeCacheEX, writeCache, updateCache } 

/*
   node-sql-parser
   https://www.npmjs.com/package/node-sql-parser

   ioredis
   https://github.com/redis/ioredis?tab=readme-ov-file

*/