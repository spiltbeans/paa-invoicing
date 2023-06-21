import xlsx from 'xlsx'
import path from 'path'
import { whitelist, known_errors } from '@/config/whitelist'
import type { WorkBook, WorkSheet } from 'xlsx'
import { employee_hour_client, hour_employees, hour_client } from './chart_generators'

const findAnchorCell = (
	sheet: WorkSheet,
	anchor: string[]
): AnchorResponse => {
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
		return { status: 'WARN', message: `multiple anchors found. using first anchor found. some entries may not be accounted for: ${anchors.toString()}`, anchor_cell: anchors[0] }
	} else {
		return { status: 'OK', anchor_cell: anchors[0] }
	}

}

const findHours = (
	sheet: WorkSheet,
	anchor_cell: string | undefined
): EmployeeHours => {
	const eh: EmployeeHours = new Map<string, number>()

	// find the column (of hours) and adjacent column (of members)
	let anchor_column: string = ''
	let adjacent_column: string = ''

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
		if (cell.includes(anchor_column) && sheet[cell]?.w !== undefined) {
			let curr_row = parseInt(cell.substring(anchor_column.length))

			// this accounts for redundant entries in the file (i.e., John entering hours twice). assumption: redundancies are intentional
			if (eh.has(sheet[cell].w)) {
				eh.set(
					sheet[cell].w,
					parseFloat(sheet[`${adjacent_column}${curr_row}`]?.w) + (eh.get(sheet[cell].w) as number)
				)
			} else {
				eh.set(
					sheet[cell].w,
					parseFloat(sheet[`${adjacent_column}${curr_row}`]?.w)
				)
			}
		}
	}

	return eh
}


export const dataFormatter = (data: AllEmployeeHours): FormattedData => {
	const fd: FormattedData = new Map<string, DataElement[]>()

	for (let graph_label of data) {
		fd.set(
			graph_label[0],
			[...graph_label[1]].map((eh: [string, number]): DataElement => (
				{ label: eh[0], value: eh[1] }
			))
		)
	}

	return fd
}

const sanitizeData = (data: EmployeeHours): SanitizedDataResponse => {
	// at same time because working with a whitelist:
	// (1) do some sanitization to remove redundancy - done in findHours
	// (2) to remove Team Member and Total cells
	// (3) do some checking to see if all employees have an alias

	const error_tracker: SheetErrors = new Map<string, string>()

	const sanitized_copy: EmployeeHours = new Map<string, number>()


	for (let member of data) {

		// standardizing strings
		let m = member[0].replaceAll(' ', '').toLowerCase()

		let inWhitelist = false	// this variable distinguishes the "could not add because invalid number" vs "not in whitelist"

		for (let wlm in whitelist) {

			// standardizing strings
			let w = (whitelist[wlm]).map(alias => alias.replaceAll(' ', '').toLowerCase())
			if (w.includes(m)) {
				inWhitelist = true

				// check to see if data is a number. Note: this was type casted in findHours
				if (isNaN(member[1])) {
					error_tracker.set(
						member[0],
						`could not add data: "${member[0]}" data point not a valid number.`
					)
				} else {
					sanitized_copy.set(
						wlm,
						member[1]
					)
				}
			}
		}
		if (!inWhitelist && !known_errors.includes(m)) error_tracker.set(
			member[0],
			`could not add data: member "${member[0]}" does not exist on whitelist.`
		)

	}
	return { data: sanitized_copy, errors: error_tracker }
}


export const processXLS = (relative_path: string): ParseXLSXResponse => {

	try {
		const workbook: WorkBook = xlsx.readFile(path.join(process.cwd(), relative_path))
		const sheets: { [sheet: string]: WorkSheet } = workbook.Sheets
		const workbook_errors: Map<string, SheetErrors> = new Map<string, SheetErrors>()
		const all_emp_hours: AllEmployeeHours = new Map<string, EmployeeHours>()
		const ANCHOR_VALUES = ['team member', 'team members']

		for (let sheet in sheets) {
			const sheet_errors: SheetErrors = new Map<string, string>()

			if (sheet.toLowerCase() === 'navigation') continue

			const { anchor_cell, message, status } = findAnchorCell(sheets[sheet], ANCHOR_VALUES)

			// error handling, maybe anchor has typo or deleted
			if (status === 'WARN') {
				sheet_errors.set('anchor', `${sheet} ${message}`)
			} else if (status === 'FAIL') {
				sheet_errors.set('anchor', `${sheet} ${message}`)
				continue
			}

			let sheet_contributions = findHours(sheets[sheet], anchor_cell)        // find the hours each member has done on this sheet

			// do some sanitization to:
			// remove redundancy, remove Team Member and Total cells,
			// all employees have an alias
			// do some checking to see if all employees have a number beside them
			const { data: sanitized_data, errors: sanitize_errors } = sanitizeData(sheet_contributions)

			workbook_errors.set(
				sheet,
				new Map([...sheet_errors, ...sanitize_errors])
			)

			all_emp_hours.set(
				sheet,
				sanitized_data
			)
		}

		if (workbook_errors.size > 0) {
			return {
				status: 'WARN',
				message: 'succeeded with some errors',
				data: {
					'individual_clients': all_emp_hours,
					'individual_employees': employee_hour_client(all_emp_hours),
					'employees': new Map<string, EmployeeHours>([['employees', hour_employees(all_emp_hours)]]),
					'clients': new Map<string, ClientHours>([['clients', hour_client(all_emp_hours)]])
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
					'employees': new Map<string, EmployeeHours>([['employees', hour_employees(all_emp_hours)]]),
					'clients': new Map<string, ClientHours>([['clients', hour_client(all_emp_hours)]])
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