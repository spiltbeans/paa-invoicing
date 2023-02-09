const express = require('express')
const path = require('path')
const collector = require('./modules/hours_collector/index')

const WORK_DIR = './data/hours_collector/'
const FILE_NAME = 'work_description.xlsx'

const app = express()
const port = 4000
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/public/views'))
app.use(express.static(path.join(__dirname, '/public')));

app.get('/loadChart.js', (req, res) => {
    res.sendFile(path.join(__dirname,'/public/scripts/loadChart.js'))
})
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname,'/public/styles/styles.css'))
})
app.get('/chart.js', (req, res) => {
    res.sendFile(path.join(__dirname,'/node_modules/chart.js/dist/chart.umd.js'))
})

app.get('/', (req, res) => {
    let data = collector.collectHours(WORK_DIR+FILE_NAME)
    res.render('index', {data: JSON.stringify(data)})
})


app.listen(port, ()=> {console.log(`connected to port: ${port}`)})


// const main =() => {
//     collectHours(WORK_DIR+FILE_NAME)
// }




// import 
// const main = () => {
//     var workbook = xlsx.readFile(sheet_name);
//     let inc = 0
//     let total_size = Object.keys(workbook.Sheets).length
//     let contact_info = get_contact_json()
//     let responsible = get_responsible_array()
//     const bar = new cliProgress.SingleBar({
//         format: 'Creating documents: {bar} {percentage}% Current sheet: {curr_sheet} ',
//         barCompleteChar: '\u2588',
//         barIncompleteChar: '\u2591',
//         hideCursor: true
//     });
//     bar.start(100, 0, { curr_sheet: 'N/A' });
//     for (let sheet in workbook.Sheets) {

//         if(!responsible.includes(sheet)) continue

//         let wd_lines = []
//         inc++
//         if (sheet === "Navigation") continue
//         bar.update((inc / total_size) * 100, { curr_sheet: sheet })
//         for (let i in workbook.Sheets[sheet]) {
//             //if (sheet !== "COVENANT ENERGY") break    //for testing. Delete later
//             if (i.charAt(0) === 'A' && !ignore.includes(workbook.Sheets[sheet][i]?.w)) wd_lines.push(workbook.Sheets[sheet][i]?.w)
//         }

//         if (wd_lines.length === 0) continue

//         //if (sheet === "COVENANT ENERGY") create_doc(wd_lines, sheet, contact_info[sheet]?.contact_label || "not found", contact_info[sheet]?.contact_name || "not found")
//         create_doc(wd_lines, sheet, contact_info[sheet]?.contact_label || "not found", contact_info[sheet]?.contact_name || "not found")
        
//         responsible = responsible.filter(item => item !== sheet)

//     }
//     bar.stop()

//     console.log('Documents not generated: ' + responsible)
// }

// main()