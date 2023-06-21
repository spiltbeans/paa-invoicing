import fs from 'fs'
import path from 'path'
import { processXLS, dataFormatter } from './xls_parser'
// import { client_hour_trend, employee_hour_trend } from './chart_generators'

export const load_data_sheets = (): SheetsPayload => {
	try {

		// get files uploaded to filesystem
		const files = fs.readdirSync(path.join(process.cwd(), process.env.DATA_ORIGIN ?? ''))

		const ds: WorkbookPayload = new Map<WorkbookName, WorkbookData>()

		// const trend_employees: TrendEmployees = {}
		// const trend_clients: TrendClients = {}

		// get the graph data for each file in filesystem
		for (let file of files) {
			const { data, errors, message, status } = processXLS(`${process.env.DATA_ORIGIN}/${file}`)
			const wb_data: WorkbookData = {
				status,
				errors: status === 'OK' ? undefined : errors
			}

			if (status === 'FAIL') continue

			if (data === undefined) continue

			// formatting all graph types
			const d = new Map<string, FormattedData>()
			for (let graph_type in data) {
				d.set(
					graph_type,
					dataFormatter(data[graph_type as keyof GraphPayload])
				)
			}

			wb_data['data'] = d

			// collect the trend data point for this file. need the clients and employees data
			const { clients, employees } = data
			// trend_employees[file] = {
			// 	employees: employees?.employees as EmployeeHours
			// }
			// trend_clients[file] = {
			// 	clients: clients?.clients as ClientHours
			// }
			ds.set(
				file,
				JSON.parse(JSON.stringify(wb_data))		// ensuring a deep copy is made of object
			)
		}

		// only need to do an if statement for trend clients because if there
		// are no trend clients there should be no trend employees

		// if (Object.keys(trend_clients).length > 1) {
		// 	ds['trends'] = {
		// 		status: 'OK',
		// 		data: {
		// 			'client_trends': client_hour_trend(trend_clients),
		// 			'employee_trends': employee_hour_trend(trend_employees)
		// 		}
		// 	}
		// }

		return ({
			status: 'OK',
			data: ds,
			message: `successfully loaded sheets ${ds.keys()}`
		})

	} catch (e: unknown) {
		const knownErr = e as Error

		return {
			status: 'FAIL',
			message: `error loading workbooks: ${knownErr.toString()}`
		}
	}
}