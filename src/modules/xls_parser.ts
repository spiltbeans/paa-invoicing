import xlsx from 'xlsx'
import path from 'path'
import { whitelist, known_errors } from '@/config/whitelist'
import type { WorkBook, WorkSheet } from 'xlsx'
import { employee_hour_client, hour_employees, hour_client } from './chart_generators'

const findAnchorCell = (sheet: WorkSheet, anchor: Array<string>): AnchorResponse => {
	//check if multiple anchors exist
	const anchors = []

	// find the anchor cell (cell with team member/team members)
	for (let cell in sheet) {
		let cell_value = (sheet[cell]?.w ?? '').toLowerCase()
		if (anchor.includes(cell_value)) anchors.push(cell)
	}

	if (anchors.length < 1) {
		return { status: 'FAIL', message: `cannot find anchor cell for anchor: ${anchor.toString()}` }
	} else if (anchors.length > 1) {
		return { status: 'WARN', message: `multiple anchors found. using first anchor found. some entries may not be accounted for: ${anchors.toString()}`, data: anchors[0] }
	} else {
		return { status: 'OK', data: anchors[0] }
	}

}

const findHours = (sheet: WorkSheet, anchor_cell: string | undefined): EmployeeHours => {
	const eh: EmployeeHours = {}

	// find the column (of hours) and adjacent column (of members)
	let anchor_column = ''
	let adjacent_column = ''

	for (let c of (anchor_cell ?? '')) {
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

		// unsafe code:
		if (cell.includes(anchor_column)) {
			let curr_row = parseInt(cell.substring(anchor_column.length))

			// this accounts for redundant entries in the file (i.e., John entering hours twice). assumption: redundancies are intentional
			if (eh.hasOwnProperty(sheet[cell]?.w)) {
				eh[sheet[cell]?.w] = parseFloat(sheet[`${adjacent_column}${curr_row}`]?.w) + eh[sheet[cell]?.w]
			} else {
				eh[sheet[cell]?.w] = parseFloat(sheet[`${adjacent_column}${curr_row}`]?.w)
			}
		}
	}

	return eh
}


export const dataFormatter = (data: AllEmployeeHours): FormattedData => {
	const fd: FormattedData = {}

	for (let graph_label in data) {
		fd[graph_label] = Object.keys(data[graph_label])?.map(element => ({ label: element, value: data[graph_label][element] }))
	}

	return fd
}

const sanitizeData = (data: EmployeeHours): SanitizedDataResponse => {
	// at same time because working with a whitelist:
	// (1) do some sanitization to remove redundancy - done in findHours
	// (2) to remove Team Member and Total cells
	// (3) do some checking to see if all employees have an alias

	const error_tracker: SheetErrors = {}

	const sanitized_copy: EmployeeHours = {}

	for (let member in data) {

		// standardizing strings
		let m = member.replaceAll(' ', '').toLowerCase()

		let inWhitelist = false	// this variable distinguishes the "could not add because invalid number" vs "not in whitelist"

		for (let wlm in whitelist) {

			// standardizing strings
			let w = (whitelist[wlm]).map(alias => alias.replaceAll(' ', '').toLowerCase())
			if (w.includes(m)) {
				inWhitelist = true

				// check to see if data is a number. Note: this was type casted in findHours
				if (isNaN(data[member])) {
					error_tracker[member] = `could not add data: "${member}" data point not a valid number.`
				} else {
					sanitized_copy[wlm] = data[member]
				}
			}
		}
		if (!inWhitelist && !known_errors.includes(m)) error_tracker[member] = `could not add data: member "${member}" does not exist on whitelist.`
	}
	return { data: sanitized_copy, errors: error_tracker }
}


export const processXLS = (relative_path: string): ParseXLSXResponse => {

	try {
		const workbook: WorkBook = xlsx.readFile(path.join(process.cwd(), relative_path))
		const sheets: { [sheet: string]: WorkSheet } = workbook.Sheets
		const workbook_errors: { [sheet: string]: SheetErrors } = {}
		const all_emp_hours: AllEmployeeHours = {}
		const ANCHOR_VALUES = ['team member', 'team members']

		for (let sheet in sheets) {
			const sheet_errors: SheetErrors = {}

			if (sheet.toLowerCase() === 'navigation') continue

			let { data: anchor_cell, message, status } = findAnchorCell(sheets[sheet], ANCHOR_VALUES)

			// error handling, maybe anchor has typo or deleted
			if (status === 'WARN') {
				sheet_errors['anchor'] = `${sheet} ${message}`
			} else if (status === 'FAIL') {
				sheet_errors['anchor'] = `${sheet} ${message}`
				continue
			}

			let sheet_contributions = findHours(sheets[sheet], anchor_cell)        // find the hours each member has done on this sheet

			// do some sanitization to:
			// remove redundancy, remove Team Member and Total cells,
			// all employees have an alias
			// do some checking to see if all employees have a number beside them
			const { data: sanitized_data, errors: sanitize_errors } = sanitizeData(sheet_contributions)

			workbook_errors[sheet] = { ...sheet_errors, ...sanitize_errors }

			all_emp_hours[sheet] = { ...sanitized_data }
		}

		if (Object.keys(workbook_errors).length > 0) {
			return {
				status: 'WARN',
				message: 'succeeded with some errors',
				data: {
					'individual_clients': all_emp_hours,
					'individual_employees': employee_hour_client(all_emp_hours),
					'employees': { 'employees': hour_employees(all_emp_hours) },
					'clients': { 'clients': hour_client(all_emp_hours) }
				},
				errors: workbook_errors
			}
		} else {
			return {
				status: 'OK',
				message: 'success',
				data: {
					'individual_clients': all_emp_hours,
					'individual_employees': employee_hour_client(all_emp_hours),
					'employees': { 'employees': hour_employees(all_emp_hours) },
					'clients': { 'clients': hour_client(all_emp_hours) }
				}
			}

		}

	} catch (e: unknown) {
		const knownErr = e as Error
		return {
			status: 'FAIL',
			message: `unsuccessful:\n${e}`,
			errors: (knownErr).toString()
		}
	}
}