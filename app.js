const dotenv = require('dotenv').config()	//DELETE CODE ON PRODUCTION

const express = require('express')
const path = require('path')
const collector = require('./modules/hours_collector/index')


const app = express()
const port = 4000

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/public/views'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')))

app.get('/january-2023', (req, res) => {
    let data = collector.collectHours(process.env.DATA_PATH || "")
   
    res.render('index', {data: JSON.stringify(data)})
})


app.listen(port, ()=> {console.log(`connected to port: ${port}`)})