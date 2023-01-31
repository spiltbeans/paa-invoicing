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

import { collectHours } from "./modules/hours_collector/index.js";

const main =() => {
    collectHours('..')
}

main()