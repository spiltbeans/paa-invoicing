const dotenv = require('dotenv').config()	//DELETE CODE ON PRODUCTION
const dictator = require('console-dictation').config()
const express = require('express')
const path = require('path')
const collector = require('./modules/hours_collector/index')


const app = express()
const port = process.env.PORT || 4000

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/public/views'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')))

app.get('/january-2023', (req, res) => {
    let data = collector.collectHours(process.env.DATA_PATH || "")
    //console.log(data)
    res.render('index', {data: JSON.stringify(data)})
})


app.listen(port, ()=> {dictator.system(`connected to port: ${port}`)})