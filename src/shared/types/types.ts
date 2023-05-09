// types for graph
export type DataItem = {
	label: string,
	value: number
}
export interface FormattedData {
	[graph_label: string]: Array<DataItem>
}

export interface ErrSheets {
	[error_source: string]: any
}

export interface EmployeeHours {
	[employee_name: string]: number
}

export interface ConsolidatedHours {
	[client_name: string]: EmployeeHours
}


export interface ClientHours {
	[client_name: string]: number
}

export interface CCHours {
	[employee_name: string]: ClientHours
}
export interface SPayload {
	[graph_type: string]: ConsolidatedHours | CCHours | {
		[sub_type: string]: EmployeeHours | ClientHours
	}
}

export interface PXLSResponse {
	status: boolean,
	message: string,
	data?: SPayload,
	errors: ErrSheets | Error | unknown
}

export interface DSheets {
	[sheet_name: string]: {
		data?: {
			[graph_type: string]: FormattedData
		},
		errors: ErrSheets | any,
	}
}