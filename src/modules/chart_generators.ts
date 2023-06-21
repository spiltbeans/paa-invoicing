
import { whitelist } from '../config/whitelist'
import { dataFormatter } from './xls_parser'

export const employee_hour_client = (data: AllEmployeeHours): CCHours => {
	const cch: CCHours = new Map<EmployeeName, ClientHours>()
	for (let client of data) {
		for (let employee of client[1]) {
			if (cch.has(employee[0])) {

				if (cch.get(employee[0])?.has(client[0])) {
					// this should work because maps are passed by reference

					const t = (cch.get(employee[0]) as ClientHours)
					t?.set(
						client[0],
						(t.get(client[0]) as number) + employee[1]
					)
					cch.set(
						employee[0],
						new Map<ClientName, number>([...t])
					)
				} else {
					cch.set(
						employee[0],
						new Map<ClientName, number>([...(cch.get(employee[0]) as ClientHours), [client[0], employee[1]]])
					)
				}
			} else {
				cch.set(
					employee[0],
					new Map([[client[0], employee[1]]])
				)
			}
		}
	}
	return cch
}

export const hour_employees = (data: AllEmployeeHours): EmployeeHours => {
	const eh: EmployeeHours = new Map<string, number>()

	for (let client of data) {
		for (let employee of client[1]) {
			if (eh.has(employee[0])) {
				eh.set(
					employee[0],
					employee[1] + (eh.get(employee[0]) as number)
				)
			} else {
				eh.set(
					employee[0],
					employee[1]
				)
			}
		}
	}

	// edge case where employee did not enter any time into the work description
	for (let wlm in whitelist) {
		if (!eh.has(wlm)) eh.set(wlm, 0)
	}

	return eh
}

export const hour_client = (data: AllEmployeeHours): ClientHours => {
	const ch: ClientHours = new Map<string, number>()

	for (let client of data) {
		for (let employee of client[1]) {

			if (ch.has(client[0])) {
				ch.set(
					client[0],
					(ch.get(client[0]) as number) + employee[1]
				)
			} else {
				ch.set(
					client[0],
					employee[1]
				)
			}
		}

		// edge case where no work has been done to a client file
		if ((data.get(client[0]) as EmployeeHours).size < 1) {
			ch.set(
				client[0],
				0
			)
		}
	}

	return ch
}


const fileSorting = ((a: DataElement, b: DataElement) => {
	// date collection algorithm
	// get the label
	// collect respective dates for comparison

	// separate the string by the period (before the file type)
	// and the hyphen (separating the date formatting)
	const a_dates = ((a.label).split('.')[0]).split('-')

	const a_date: DateStructure = {
		'year': '00',
		'month': '00',
		'day': '00'
	}

	// collect the date by moving from last position x3
	let i = a_dates.length - 1
	for (let d in a_date) {
		if (i < 0) break

		a_date[d as keyof DateStructure] = a_dates[i]
		i = i - 1
	}

	// separate the string by the period (before the file type)
	// and the hyphen (separating the date formatting)
	const b_dates = ((b.label).split('.')[0]).split('-')

	const b_date: DateStructure = {
		'year': '00',
		'month': '00',
		'day': '00'
	}

	// collect the date by moving from last position x3
	i = b_dates.length - 1
	for (let d in b_date) {
		if (i < 0) break

		b_date[d as keyof DateStructure] = b_dates[i]
		i = i - 1
	}

	// doing date comparison

	// doesn't matter which struct to loop through, both have same keys
	for (let d in a_date) {
		// if a is NaN then put it behind b (leftmost)
		if (isNaN(parseInt(a_date[d as keyof DateStructure]))) return 1

		// if b is NaN then put it behind a (leftmost)
		if (isNaN(parseInt(b_date[d as keyof DateStructure]))) return -1

		// if both are numbers, compare which is greater

		// we don't return 0 because this would indicate we need to check the next parameter.
		// we only return 0 when all parameters have been checked. If there's been no return it indicates there's no difference
		if ((parseInt(b_date[d as keyof DateStructure]) === parseInt(a_date[d as keyof DateStructure]))) continue

		return (parseInt(a_date[d as keyof DateStructure]) - parseInt(b_date[d as keyof DateStructure]))

	}
	return 0
})

// export const client_hour_trend = (trend: TrendClients): FormattedData => {
// 	// note: this utilizes AllEmployeeHours structure, but with the following changed:
// 	// - employee_name -> bill_period/file_name/sheet_name
// 	const ch: AllEmployeeHours = new Map<ClientName, EmployeeHours>()

// 	// assumptions: 
// 	// (1) there is only 1 client per document
// 	for (let sheet in trend) {
// 		for (let client in trend[sheet].clients) {
// 			if (ch.hasOwnProperty(client)) {
// 				ch[client][sheet] = trend[sheet].clients[client]
// 			} else {
// 				ch[client] = {
// 					[sheet]: trend[sheet].clients[client]
// 				}
// 			}
// 		}
// 	}

// 	// do some sorting
// 	// note: this sorting needs to be the final version, so
// 	// we need login in the index.tsx map to disable auto-sorting in the chart

// 	let r: FormattedData = (dataFormatter(ch))

// 	for (let client in r) {
// 		r[client] = (r[client]).sort(fileSorting)
// 	}
// 	return r
// }

// export const employee_hour_trend = (trend: TrendEmployees): FormattedData => {
// 	// note: this utilizes AllEmployeeHours structure, but with the following changed:
// 	// - employee_name -> bill_period/file_name/sheet_name
// 	// - client_name => employee_name
// 	const ch: AllEmployeeHours = {}

// 	// assumptions: 
// 	// (1) there is only 1 employee per document
// 	for (let sheet in trend) {
// 		for (let employee in trend[sheet].employees) {
// 			if (ch.hasOwnProperty(employee)) {
// 				ch[employee][sheet] = trend[sheet].employees[employee]
// 			} else {
// 				ch[employee] = {
// 					[sheet]: trend[sheet].employees[employee]
// 				}
// 			}
// 		}
// 	}

// 	// do some sorting
// 	// note: this sorting needs to be the final version, so
// 	// we need login in the index.tsx map to disable auto-sorting in the chart

// 	let r: FormattedData = (dataFormatter(ch))

// 	for (let employee in r) {
// 		r[employee] = (r[employee]).sort(fileSorting)
// 	}

// 	return r
// }