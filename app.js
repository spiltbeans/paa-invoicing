import xlsx from 'xlsx'
import fs from "fs"
import cliProgress from 'cli-progress'
import pkg from "docx"
const { Document, Packer, Paragraph, TextRun, Header, ImageRun, AlignmentType } = pkg

//Script configs
const sheet_name = "./data/10-22 Invoicing Work Description_Timesheet.xlsx"
const info_sheet_name = "./data/Invoicing_Client_Info.xlsx"
const month = 'September'
const year = '2022'

const ignore = [
    "Link back to Navigation",
    "Client:",
    "Work Description",
    "Entered By"
]
const wd_sheet_name = "./data/wdsize.xlsx"
const wd_ignore_empty = true
const wd_info_insert_name = "./data/wd_sheets.xlsx"
//references
//https://runkit.com/dolanmiu/docx-demo10
//https://github.com/dolanmiu/docx/tree/29f421686fc5e0d0bd1aa6ef7c2d639d3ec1c26e/docs/usage

const get_contact_json = () => {
    var workbook_read = xlsx.readFile(info_sheet_name);
    let data = {}
    
    for (let cell in workbook_read.Sheets['Infos']) {
        if (cell.charAt(0) === 'C' && cell !== 'C1'){
            let num = cell.substring(1, cell.length)
            data[workbook_read.Sheets['Infos'][cell]?.w] = {
                'contact_label': workbook_read.Sheets['Infos'][`D${num}`]?.w,
                'contact_name': workbook_read.Sheets['Infos'][`H${num}`]?.w,
            }
        }
    }
    return data
}

const get_responsible_array = () => {
    var workbook_read = xlsx.readFile(info_sheet_name);
    let data = []
    
    for (let cell in workbook_read.Sheets['WD template']) {
        if (cell.charAt(0) === 'C' && workbook_read.Sheets['WD template'][cell]?.w === 'Eyas'){
            let num = cell.substring(1, cell.length)
            
            data.push(workbook_read.Sheets['WD template'][`B${num}`]?.w)
        }
    }
    return data
}

const wdsizes = () => {
    var workbook_read = xlsx.readFile(sheet_name);
    let inc = 0
    let total_size = Object.keys(workbook_read.Sheets).length
    let data = []
    const bar = new cliProgress.SingleBar({
        format: 'Creating documents: {bar} {percentage}% Current sheet: {curr_sheet} ',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    bar.start(100, 0, { curr_sheet: 'N/A' });

    for (let sheet in workbook_read.Sheets) {
        inc++
        if (sheet === "Navigation") continue
        let dump = []
        bar.update((inc / total_size) * 100, { curr_sheet: sheet })
        for (let i in workbook_read.Sheets[sheet]) {
            if (i.charAt(0) === 'A' && !ignore.includes(workbook_read.Sheets[sheet][i]?.w)) dump.push(workbook_read.Sheets[sheet][i]?.w)
        }

        if (wd_ignore_empty && dump.length === 0) continue

        data.push([sheet, dump.length])
    }
    bar.stop()

    let workbook_write = xlsx.utils.book_new();
    let worksheet = xlsx.utils.aoa_to_sheet([[['Client'], ['WD Entries']]]);
    xlsx.utils.book_append_sheet(workbook_write, worksheet);
    inc = 1
    for (let x of data) {
        inc++
        xlsx.utils.sheet_add_aoa(worksheet, [x], { origin: `A${inc}` });
    }
    xlsx.writeFile(workbook_write, wd_sheet_name);
}

const get_sheet_names = () => {
    var workbook_read = xlsx.readFile(sheet_name);
    let inc = 0
    let data = []
  
    for (let sheet in workbook_read.Sheets) {
        if (sheet === "Navigation") continue
        data.push(sheet)

    }

    let workbook_write = xlsx.utils.book_new();
    let worksheet = xlsx.utils.aoa_to_sheet([[['Sheet Name']]]);
    xlsx.utils.book_append_sheet(workbook_write, worksheet);
    inc = 1
    for (let x of data) {
        inc++
        xlsx.utils.sheet_add_aoa(worksheet, [[x]], { origin: `A${inc}` });
    }
    xlsx.writeFile(workbook_write, wd_info_insert_name);
}
const create_doc = (lines, title, formal_title, contact) => {

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "lines",
                    name: "Lines",
                    basedOn: "Normal",
                    next: "Normal",
                    paragraph: {
                        spacing: {
                            line: 400,
                        },
                    },
                    run: {
                        font: "arial",
                        size: 24,
                    }
                },
                {
                    id: "list_lines",
                    name: "List Lines",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: "arial",
                        size: 24,
                    }
                }

            ],
        },
        sections: [
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: fs.readFileSync("paa_logo.png"),
                                        transformation: {
                                            width: 103.68,
                                            height: 52.8,
                                        },
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                                
                            }),
                        ],
                    }),
                },
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Contact Person: ",
                                bold: true,
                            }),
                            new TextRun(contact),
                        ],
                        style: "lines",

                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Description for the month of ",
                                bold: true,
                            }),
                            new TextRun(`${month} ${year}`),
                        ],
                        style: "lines",
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: formal_title,
                                bold: true,
                            }),
                        ],
                        style: "lines",
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Activities undertaken in the month of ${month} for ${formal_title}:`,
                            }),
                        ],
                        style: "lines",
                    }),
                    ...lines.map(line => {

                        return new Paragraph({
                            text: line,
                            bullet: {
                                level: 0,
                            },
                            style: "list_lines"
                        })
                    })
                ],
            },
        ],
    });
    // Used to export the file into a .docx file
    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(`./wd2/${month} ${year} - ${title}.docx`, buffer);
    });
}

const main = () => {
    var workbook = xlsx.readFile(sheet_name);
    let inc = 0
    let total_size = Object.keys(workbook.Sheets).length
    let contact_info = get_contact_json()
    let responsible = get_responsible_array()
    const bar = new cliProgress.SingleBar({
        format: 'Creating documents: {bar} {percentage}% Current sheet: {curr_sheet} ',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    bar.start(100, 0, { curr_sheet: 'N/A' });
    for (let sheet in workbook.Sheets) {

        if(!responsible.includes(sheet)) continue

        let wd_lines = []
        inc++
        if (sheet === "Navigation") continue
        bar.update((inc / total_size) * 100, { curr_sheet: sheet })
        for (let i in workbook.Sheets[sheet]) {
            //if (sheet !== "COVENANT ENERGY") break    //for testing. Delete later
            if (i.charAt(0) === 'A' && !ignore.includes(workbook.Sheets[sheet][i]?.w)) wd_lines.push(workbook.Sheets[sheet][i]?.w)
        }

        if (wd_lines.length === 0) continue

        //if (sheet === "COVENANT ENERGY") create_doc(wd_lines, sheet, contact_info[sheet]?.contact_label || "not found", contact_info[sheet]?.contact_name || "not found")
        create_doc(wd_lines, sheet, contact_info[sheet]?.contact_label || "not found", contact_info[sheet]?.contact_name || "not found")
        
        responsible = responsible.filter(item => item !== sheet)

    }
    bar.stop()

    console.log('Documents not generated: ' + responsible)
}

main()