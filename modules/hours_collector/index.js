const xlsx = require('xlsx')
const ALIASES = require('./ALIASES.json')
/**
 * The goal of this parse is to go through each sheet and find the team member 
 * and their correlated hours
 * @param {*} path 
 * @returns 
 */
const parseXL = (path) => {
    try {
        let workbook = xlsx.readFile(path)
        let sheets = workbook.Sheets

        // config
        const QUERY = ['team member', 'team members']       // anchor cell

        let consolidated_hours = {}
        for (let sheet in sheets) {

            let anchor_cell = ''

            // find cell associated with QUERY (anchor cell)
            for (let cell in sheets[sheet]) {
                let cell_value = sheets[sheet][cell]?.w ?? ""
                if (QUERY.includes(cell_value.toLowerCase())) {
                    anchor_cell = cell
                    break;
                }
            }

            let members_hours = findHours(sheets, sheet, anchor_cell)        // find the hours each member has done on this sheet

            // add to consolidated_hours
            for (let member in members_hours) {
                if (!(member in consolidated_hours)) consolidated_hours[member] = {}

                consolidated_hours[member][sheet.replaceAll(' ', '')] = members_hours[member]
            }

        }

        return {'status': true, 'message': `Successfully parsed file`, 'data': consolidated_hours}
    }catch (e){
        return {'status': false, 'message': `Error parsing file ${e}`}
    }
    
}

const findHours = (sheets, sheet, anchor_cell) => {
    let members_hours = {}

    //find the column, and row to collect members
    let anchor_column = ''
    let adjacent_column = ''

    for (let c of anchor_cell) {
        if (isNaN(c)) anchor_column += c

    }
    adjacent_column = String.fromCharCode(anchor_column.charCodeAt() + 1)      // find the adjacent column for hours

    for (let cell in sheets[sheet]) {
        let current_column = ''
        let row = ''
        let cell_value = ''
        let adjacent_value = ''
        for (let c of cell) {
            if (isNaN(c)) {
                current_column += c
            } else {
                row += c
            }
        }

        if (current_column === anchor_column) {
            cell_value = (sheets[sheet][`${anchor_column}${row}`]?.w ?? "").replaceAll(' ', '')
            adjacent_value = (sheets[sheet][`${adjacent_column}${row}`]?.w ?? "").replaceAll(' ', '')
            members_hours[cell_value] = parseFloat(adjacent_value)
        }
    }

    return members_hours
}

const consolidateAliases = (hours_data) => {
    let filtered_list = {}

    // populate filtered list
    for (let member in hours_data) {

        for (let correct_name in ALIASES) {
            for (let aliases of ALIASES[correct_name]) {
                if (member === aliases) {

                    if (correct_name in filtered_list) {
                        filtered_list[correct_name] = { ...filtered_list[correct_name], ...hours_data[member] }
                    } else {
                        filtered_list[correct_name] = hours_data[member]
                    }
                }
            }
        }
    }

    return filtered_list
}
const collectHours = (path) => {
    let parsed_data = parseXL(path)
    if(parsed_data.status){
        return consolidateAliases(parsed_data.data)
    } 

    return {}
}

const findMax = (list) => {
    let max = -1
    let leader = ""
    for (let member in list) {

        for (let client in list[member]) {
            if (parseFloat(list[member][client]) > max) {
                max = parseFloat(list[member][client])
                leader = member
            }
        }
    }
    return { 'leader': leader, 'max': max }
}


module.exports = { collectHours }