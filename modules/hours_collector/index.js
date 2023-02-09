const xlsx = require('xlsx')
const ALIASES = require('./ALIASES.json')
/**
 * The goal of this parse is to go through each sheet and find the team member 
 * and their correlated hours
 * @param {*} path 
 * @returns 
 */
const parseXL = (path) => {
    let workbook = xlsx.readFile(path)
    let sheets = workbook.Sheets

    // config
    const QUERY = ['team member', 'team members']       // anchor cell

    let consolidated_hours = {}
    for (let sheet in sheets) {

        let query_cell = ''

        // find cell associated with QUERY (anchor cell)
        for (let cell in sheets[sheet]) {
            let cell_value = sheets[sheet][cell]?.w ?? ""
            if (QUERY.includes(cell_value.toLowerCase())) {
                query_cell = cell
                break;
            }
        }


        let members_hours = findHours(sheets, sheet, query_cell)        // find the hours each member has done on this sheet

        // add to consolidated_hours
        for (let member in members_hours) {
            if (!(member in consolidated_hours)) consolidated_hours[member] = {}

            consolidated_hours[member][sheet.replaceAll(' ', '')] = members_hours[member]
        }

    }

    return consolidated_hours
}

const findHours = (sheets, sheet, query_cell) => {

    let members_hours = {}

    //find the column, and row to collect members
    let column = ''
    let adjacent_column = ''
    let row = ''
    for (let c of query_cell) {
        if (isNaN(c)) {
            column += c
        } else {
            row += c
        }
    }

    adjacent_column = String.fromCharCode(column.charCodeAt() + 1)      // find the adjacent column for hours

    row = `${parseInt(row) + 1}`      // this is to avoid including the 'team members' cell in the return

    // cell value calculations
    let cell_value = (sheets[sheet][`${column}${row}`]?.w ?? "").replaceAll(' ', '')
    let adjacent_value = sheets[sheet][`${adjacent_column}${row}`]?.w ?? ""

    // parse through entries until there are no more entries
    while (cell_value !== '') {
        members_hours[cell_value] = adjacent_value

        row = `${parseInt(row) + 1}`
        cell_value = (sheets[sheet][`${column}${row}`]?.w ?? "").replaceAll(' ', '')
        adjacent_value = sheets[sheet][`${adjacent_column}${row}`]?.w ?? ""

    }

    return members_hours
}

const consolidateAliases = (hours_data) => {
    let filtered_list = {}

    // populate filtered list
    for(let member in hours_data){

        for(let correct_name in ALIASES){
            for(let aliases of ALIASES[correct_name]){
                if(member === aliases){

                    if(correct_name in filtered_list){
                        filtered_list[correct_name] = {...filtered_list[correct_name], ...hours_data[member]}
                    }else{
                        filtered_list[correct_name] = hours_data[member]
                    }


                }
            }
        }
    }

    return filtered_list
}
const collectHours = (path) => {
    return consolidateAliases(parseXL(path))
}

module.exports = { collectHours }