
import { CCHours, ClientHours, ConsolidatedHours, EmployeeHours } from '../types/types'
import { whitelist } from '../whitelist'

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

export const client_hour_period = () => { }

export const employee_hour_period = () => { }