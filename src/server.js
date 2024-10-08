import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { readCache, writeCacheEX } from './SQR.js'

const app = express()
const port = 3000

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/demo', (req, res) => {
    res.sendFile(path.join(__dirname, 'demo.html'))
})

app.get('/cache', async (req, res) => {
    let mypage = await readCache('mypage')

    if (mypage) {
        // page hit
        res.send(mypage)
    }
    else {
        // page miss
        const mypage = fs.readFileSync(path.join(__dirname, 'demo.html'), 'utf8');
        await writeCacheEX('mypage', mypage, 60)
        res.send(mypage)
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})