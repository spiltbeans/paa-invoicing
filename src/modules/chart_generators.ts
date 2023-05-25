
import { whitelist } from '../config/whitelist'
import { dataFormatter } from './xls_parser'

//const client_hour_employee = () => {}	// default from ConsolidatedHours

export const employee_hour_client = (data: ConsolidatedHours): CCHours => {
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

export const hour_employees = (data: ConsolidatedHours): EmployeeHours => {
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

export const hour_client = (data: ConsolidatedHours): ClientHours => {
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

type DStruc = {
	[d_type: string]: string
}
const fileSorting = ((a: DataItem, b: DataItem) => {
	// date collection algorithm
	// get the label
	// collect respective dates for comparison

	const a_dates = ((a.label).split('.')[0]).split('-')

	const a_date: DStruc = {
		'year': '00',
		'month': '00',
		'date': '00'
	}

	let i = a_dates.length - 1
	for (let d in a_date) {
		if (i < 0) break

		a_date[d] = a_dates[i]
		i = i - 1
	}

	const b_dates = ((b.label).split('.')[0]).split('-')

	const b_date: DStruc = {
		'year': '00',
		'month': '00',
		'date': '00'
	}

	i = b_dates.length - 1
	for (let d in b_date) {
		if (i < 0) break

		b_date[d] = b_dates[i]
		i = i - 1
	}

	// doing date comparison

	// doesn't matter which struct to loop through, both have same keys
	for (let d in a_date) {

		// if a is NaN then put it behind b (leftmost)
		if (isNaN(parseInt(a_date[d]))) return 1

		// if b is NaN then put it behind a (leftmost)
		if (isNaN(parseInt(b_date[d]))) return -1

		// if both are numbers, compare which is greater

		// we don't return 0 because this would indicate we need to check the next parameter.
		// we only return 0 when all parameters have been checked. If there's been no return it indicates there's no difference
		if ((parseInt(b_date[d]) === parseInt(a_date[d]))) continue

		return (parseInt(a_date[d]) - parseInt(b_date[d]))

	}
	return 0
})

export const client_hour_trend = (trend: TrendClients): FormattedData => {
	// note: this utilizes ConsolidatedHours structure, but with the following changed:
	// - employee_name -> bill_period/file_name/sheet_name
	const ch: ConsolidatedHours = {}

	// assumptions: 
	// (1) there is only 1 client per document
	for (let sheet in trend) {
		for (let client in trend[sheet].clients) {
			if (ch.hasOwnProperty(client)) {
				ch[client][sheet] = trend[sheet].clients[client]
			} else {
				ch[client] = {
					[sheet]: trend[sheet].clients[client]
				}
			}
		}
	}

	// do some sorting
	// note: this sorting needs to be the final version, so
	// we need login in the index.tsx map to disable auto-sorting in the chart

	let r: FormattedData = (dataFormatter(ch))

	for (let client in r) {
		r[client] = (r[client]).sort(fileSorting)
	}
	return r
}

export const employee_hour_trend = (trend: TrendEmployees): FormattedData => {
	// note: this utilizes ConsolidatedHours structure, but with the following changed:
	// - employee_name -> bill_period/file_name/sheet_name
	// - client_name => employee_name
	const ch: ConsolidatedHours = {}

	// assumptions: 
	// (1) there is only 1 employee per document
	for (let sheet in trend) {
		for (let employee in trend[sheet].employees) {
			if (ch.hasOwnProperty(employee)) {
				ch[employee][sheet] = trend[sheet].employees[employee]
			} else {
				ch[employee] = {
					[sheet]: trend[sheet].employees[employee]
				}
			}
		}
	}

	// do some sorting
	// note: this sorting needs to be the final version, so
	// we need login in the index.tsx map to disable auto-sorting in the chart

	let r: FormattedData = (dataFormatter(ch))

	for (let employee in r) {
		r[employee] = (r[employee]).sort(fileSorting)
	}

	return r
}