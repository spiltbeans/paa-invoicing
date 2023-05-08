import xlsx from 'xlsx'
import path from 'path'
import { whitelist, known_errors } from '@/shared/whitelist'
import type {
	APIRequestResponse,
	DataItem,
	FormattedData,
	ErrSheets,
	EmployeeHours,
	ConsolidatedHours,
	CCHours,
	ClientHours
} from '@/shared/types/types'
import type { WorkBook, WorkSheet } from 'xlsx'




const findAnchorCell = (sheet: WorkSheet, anchor: Array<string>): APIRequestResponse => {
	// find the anchor cell (cell with team member/team members)
	for (let cell in sheet) {
		let cell_value = (sheet[cell]?.w ?? '').toLowerCase()
		if (anchor.includes(cell_value)) {
			return { status: true, message: 'successfully found anchor cell', data: cell }
		}
	}
	return { status: false, message: `cannot find anchor cell for anchor: ${anchor.toString()}`, data: undefined }
}

const findHours = (sheet: WorkSheet, anchor_cell: string): EmployeeHours => {
	let members_hours: EmployeeHours = {}

	// find the column (of hours) and adjacent column (of members)
	let anchor_column = ''
	let adjacent_column = ''

	for (let c of anchor_cell) {
		if (isNaN(parseInt(c))) anchor_column += c
	}

	adjacent_column = String.fromCharCode(anchor_column.charCodeAt(0) + 1)		// assumption (1): column is 1 character, so code breaks if sheet has width over column "Z"

	// start collecting information from the columns until there is no more information
	for (let cell in sheet) {
		// original code split cell into column and row and checked if column equals
		// anchor column. This is the safer method, but since we are under assumption (1)
		// includes will be fine. Unsafe method is fine since adjacent column will be
		// wrong anyways if assumption (1) is wrong.

		// original safe code:
		// for (let c of cell) {
		// 	if (isNaN(parseInt(c))) {
		// 		curr_column += c
		// 	} else {
		// 		curr_row += c
		// 	}
		// }

		// unsafe code
		if (cell.includes(anchor_column)) {
			let curr_row = parseInt(cell.substring(anchor_column.length))
			if(members_hours.hasOwnProperty(sheet[cell]?.w)){
				members_hours[sheet[cell]?.w] = parseFloat(sheet[`${adjacent_column}${curr_row}`]?.w) + members_hours[sheet[cell]?.w] 
			}else{
				members_hours[sheet[cell]?.w] = parseFloat(sheet[`${adjacent_column}${curr_row}`]?.w)
			}
		}
	}

	return members_hours
}


export const dataFormatter = (data: ConsolidatedHours): FormattedData => {
	let formatted_data: FormattedData = {}

	for (let client in data) {
		let formatted_sheet: Array<DataItem> = []
		for (let member in data[client]) {
			formatted_sheet.push({ label: member, value: data[client][member] })
		}
		formatted_data[client] = formatted_sheet

	}


	return formatted_data
}

const sanitizeData = (data: EmployeeHours): APIRequestResponse => {
	// at same time because working with a whitelist:
	// (1) do some sanitization to remove redundancy, to remove Team Member and Total cells
	// (2) do some checking to see if all employees have an alias

	const error_tracker: ErrSheets = {}

	const sanitized_copy: EmployeeHours = {}
	for (let member in data) {

		// standardizing strings
		let m = member.replaceAll(' ', '').toLowerCase()

		let accounted = false

		for (let wlm in whitelist) {

			// standardizing strings
			let w = (whitelist[wlm]).map(alias => alias.toLowerCase())
			if (w.includes(m)) {

				// check to see if data is a number. was type casted in findHours
				if (isNaN(data[member])) {
					error_tracker[member] = `could not add data: "${member}" data point not a valid number.`
				} else {
					sanitized_copy[wlm] = data[member]
				}
				accounted = true
				continue
			}
		}
		if (!accounted && !known_errors.includes(m)) error_tracker[member] = `could not add data: member "${member}" does not exist on whitelist.`

		accounted = false
	}


	return { status: true, message: 'successfully sanitized data', data: sanitized_copy, error: error_tracker }
}

//const client_hour_employee = () => {}	// default from ConsolidatedHours

const employee_hour_client = (data: ConsolidatedHours): CCHours => {
	const cch: CCHours = {}
	for (let client in data) {
		for (let employee in data[client]) {
			if (cch.hasOwnProperty(employee)) {
				if ((cch[employee]).hasOwnProperty(client)) {
					cch[employee][client] = cch[employee][client] + data[client][employee]
				} else {
					cch[employee][client] = data[client][employee]
				}
			} else {
				cch[employee] = ({ [client]: data[client][employee] })
			}
		}
	}
	return cch
}

const hour_employees = (data: ConsolidatedHours): EmployeeHours => {
	const eh: EmployeeHours = {}

	for (let client in data) {
		for (let employee in data[client]) {
			if (eh.hasOwnProperty(employee)) {
				eh[employee] = eh[employee] + data[client][employee]
			} else {
				eh[employee] = data[client][employee]
			}
		}
	}

	// edge case where employee did not enter any time into the work description
	for (let wlm in whitelist) {
		if (!eh.hasOwnProperty(wlm)) eh[wlm] = 0
	}

	return eh
}

const hour_client = (data: ConsolidatedHours): ClientHours => {
	const ch: ClientHours = {}

	for (let client in data) {
		for (let employee in data[client]) {
			if (ch.hasOwnProperty(client)) {
				ch[client] = ch[client] + data[client][employee]
			} else {
				ch[client] = data[client][employee]
			}
		}

		// edge case where no work has been done to a client file
		if (Object.keys(data[client]).length < 1) {
			ch[client] = 0
		}
	}

	return ch
}

const client_hour_period = () => { }

const employee_hour_period = () => { }

export const processXLS = (relative_path: string): APIRequestResponse => {

	try {
		const new_path = path.join(process.cwd(), relative_path)
		const workbook: WorkBook = xlsx.readFile(new_path)
		const sheets: { [sheet: string]: WorkSheet } = workbook.Sheets
		const error_sheets: ErrSheets = {}
		const consolidated_hours: ConsolidatedHours = {}
		const ANCHOR_VALUES = ['team member', 'team members']

		for (let sheet in sheets) {
			if (sheet.toLowerCase() === 'navigation') continue

			let { data: anchor_cell, message, status } = findAnchorCell(sheets[sheet], ANCHOR_VALUES)

			// error handling, maybe anchor has typo or deleted
			if (!status) {
				error_sheets[sheet] = { 'anchor': `${sheet} ${message}` }
				continue
			}

			let employee_contributions = findHours(sheets[sheet], anchor_cell)        // find the hours each member has done on this sheet

			// do some sanitization to:
			// remove redundancy, remove Team Member and Total cells,
			// all employees have an alias
			// do some checking to see if all employees have a number beside them
			let { data, error } = sanitizeData(employee_contributions)

			if (Object.keys(error).length > 0) error_sheets[sheet] = error

			consolidated_hours[sheet] = data

		}

		// get multiple types of data
		let ehc = employee_hour_client(consolidated_hours)
		let he = { 'employees': hour_employees(consolidated_hours) }
		let ch = { 'clients': hour_client(consolidated_hours) }

		return {
			status: true,
			message: 'success',
			data: {
				'individual_clients': consolidated_hours,
				'employees': he,
				'individual_employees': ehc,
				'clients': ch
			},
			error: error_sheets
		}
	} catch (e: Error | unknown) {
		return { status: false, message: `unsuccessful ${e}`, data: null, error: (e) }
	}

}
