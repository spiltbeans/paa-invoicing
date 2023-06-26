import fs from 'fs'
import path from 'path'
import { processXLS, dataFormatter } from './xls_parser'
import { client_hour_trend, employee_hour_trend } from './chart_generators'
import { tech_payment } from '@/config/whitelist'

export const load_data_sheets = (): SheetsPayload => {
	try {

		// get files uploaded to filesystem
		const files = fs.readdirSync(path.join(process.cwd(), process.env.DATA_ORIGIN ?? ''))

		const ds: WorkbooksData = {}

		const trend_employees: TrendEmployees = {}
		const trend_clients: TrendClients = {}

		const tech_payment_trend: TP = {}

		// get the graph data for each file in filesystem
		for (let file of files) {
			const { data, errors, message, status } = processXLS(`${process.env.DATA_ORIGIN}/${file}`)
			ds[file] = {
				status
			}

			if (status !== 'OK') {
				ds[file]['errors'] = errors
			}

			if (status === 'FAIL') continue

			if (data === undefined) continue

			const d: { [graph_type: string]: FormattedData } = {}

			for (let graph_type in data) {
				d[graph_type] = dataFormatter(data[graph_type])
			}

			ds[file]['data'] = d
			for (let t of tech_payment) {
				if (!(ds?.[file]?.['data']?.['individual_clients'])?.hasOwnProperty(t)) continue
				if (tech_payment_trend.hasOwnProperty(t)) {
					tech_payment_trend[t][file] = ds?.[file]?.['data']?.['individual_clients'][t] as DataElement[]
				} else {
					tech_payment_trend[t] = {
						[file]: ds?.[file]?.['data']?.['individual_clients'][t] as DataElement[]
					}
				}
			}
			// collect the trend data point for this file. need the clients and employees data
			const { clients, employees } = data
			trend_employees[file] = {
				employees: employees?.employees as EmployeeHours
			}
			// console.log(clients)
			trend_clients[file] = {
				clients: clients?.clients as ClientHours
			}

		}

		// only need to do an if statement for trend clients because if there
		// are no trend clients there should be no trend employees

		if (Object.keys(trend_clients).length > 1) {
			ds['trends'] = {
				status: 'OK',
				data: {
					'client_trends': client_hour_trend(trend_clients),
					'employee_trends': employee_hour_trend(trend_employees),
				}
			}
		}

		ds['experimental'] = {
			data: tech_payment_trend
		}

		return ({
			status: 'OK',
			data: ds,
			message: `successfully loaded sheets ${JSON.stringify(Object.keys(ds))}`
		})

	} catch (e: unknown) {
		const knownErr = e as Error

		return {
			status: 'FAIL',
			message: `error loading workbooks: ${knownErr.toString()}`
		}
	}
}