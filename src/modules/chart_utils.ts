import fs from 'fs'
import path from 'path'
import { processXLS, dataFormatter } from './xls_parser'
import { client_hour_trend, employee_hour_trend } from './chart_generators'

export const load_data_sheets = (): DSheets => {
	try {

		// get files uploaded to filesystem
		const files = fs.readdirSync(path.join(process.cwd(), process.env.DATA_ORIGIN ?? ''))

		const ds: DSheets = {}

		const trend_employees: TrendEmployees = {}
		const trend_clients: TrendClients = {}
		// get the graph data for each file in filesystem
		for (let file of files) {
			const { data, errors, message, status } = processXLS(`${process.env.DATA_ORIGIN}/${file}`)

			ds[file] = { errors }

			if (data === undefined) continue

			let d: { [graph_type: string]: FormattedData } = {}

			for (let graph_type in data) {
				d[graph_type] = dataFormatter(data[graph_type])
			}

			// collect the trend data point for this file. need the clients and employees data
			const { clients, employees } = data
			trend_employees[file] = {
				employees: employees?.employees as EmployeeHours
			}
			trend_clients[file] = {
				clients: clients?.clients as ClientHours
			}

			ds[file]['data'] = d
		}

		if (Object.keys(trend_clients).length > 1) {
			ds['trends'] = {
				data: {
					'client_trends': client_hour_trend(trend_clients),
					'employee_trends': employee_hour_trend(trend_employees)
				},
				errors: {}
			}
		}

		return ds

	} catch (e: any) {
		return {
			'error_retrieving_uploaded_files': {
				errors: e.toString()
			}
		}
	}
}