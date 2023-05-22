// types for graph
type DataItem = {
	label: string,
	value: number
}
interface FormattedData {
	[graph_label: string]: Array<DataItem>
}

interface ErrSheets {
	[error_source: string]: any
}

interface EmployeeHours {
	[employee_name: string]: number
}

interface ConsolidatedHours {
	[client_name: string]: EmployeeHours
}


interface ClientHours {
	[client_name: string]: number
}

interface CCHours {
	[employee_name: string]: ClientHours
}
interface SPayload {
	[graph_type: string]: ConsolidatedHours | CCHours | {
		[sub_type: string]: EmployeeHours | ClientHours
	}
}

interface PXLSResponse {
	status: boolean,
	message: string,
	data?: SPayload,
	errors: ErrSheets | Error | unknown
}

interface DSheets {
	[sheet_name: string]: {
		data?: {
			[graph_type: string]: FormattedData
		},
		errors: ErrSheets | any,
	}
}

interface TrendEmployees {
	[sheet_name: string]: {
		employees: EmployeeHours
	}
}
interface TrendClients {
	[sheet_name: string]: {
		clients: ClientHours
	}
}