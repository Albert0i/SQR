
// import Parser for all databases
//const { Parser } = require('node-sql-parser');
//import Parser from "node-sql-parser"
import pkg from 'node-sql-parser';
const { Parser } = pkg;

const parser = new Parser();

//const ast = parser.astify('SELECT * FROM t'); // mysql sql grammer parsed by default
// const ast = parser.tableList(`
// SELECT f1.*, f2.*, 
//        ( SELECT count(*) FROM dcdevdtc.nembers f3 
//          WHERE f1.famnum=f3.famnum ) AS famsiz 
// FROM dcdevdta.family f1, dcdevdtb.member f2
// WHERE f1.famnum=f2.famnum and f1.age IN (SELECT age FROM dcdevdtd.anotherTable)
// ORDER BY f2.memseq ASC
// `); // mysql sql grammer parsed by default

const opt = {
    database: 'MySQL'
  }
const tableList = parser.tableList('SELECT * FROM sampledb.movie', opt);

console.log(tableList);
