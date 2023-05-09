import fs from 'fs'
import path from 'path'
import { processXLS, dataFormatter } from './parse_xls'
import { DSheets, FormattedData } from '../types/types'

export const load_data_sheets = (): DSheets => {
	try {

		// get files uploaded to filesystem
		const files = fs.readdirSync(path.join(process.cwd(), process.env.DATA_ORIGIN ?? ''))

		const ds: DSheets = {}

		// get the graph data for each file in filesystem
		for (let file of files) {
			const { data, errors, message, status } = processXLS(`${process.env.DATA_ORIGIN}/${file}`)

			ds[file] = { errors }

			if (data === undefined) continue

			let d: { [graph_type: string]: FormattedData } = {}

			for (let graph_type in data) {
				d[graph_type] = dataFormatter(data[graph_type])
			}

			ds[file]['data'] = d
		}

		return ds

	} catch (e: any) {
		return {
			'error retrieving uploaded files': {
				errors: e
			}
		}
	}
}