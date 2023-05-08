import fs from 'fs'
import path from 'path'
import { processXLS, dataFormatter } from './parse_xls'

export const load_data_sheets = () => {
	try {
		const files = fs.readdirSync(path.join(process.cwd(), process.env.DATA_ORIGIN ?? ''))

		const cfiles: { [index: string]: any } = {}
		for (let file of files) {
			const { data, errors, message, status } = processXLS(`${process.env.DATA_ORIGIN}/${file}`)
			const { individual_clients, individual_employees, employees, clients } = data

			cfiles[file] = {
				individual_clients: dataFormatter(individual_clients),
				employees: dataFormatter(employees),
				individual_employees: dataFormatter(individual_employees),
				clients: dataFormatter(clients)
			}
		}

		return cfiles


	} catch (e) {
		console.log(e)
	}
}