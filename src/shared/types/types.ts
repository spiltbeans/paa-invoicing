// types for graph
export type DataItem = {
	label: string,
	value: number
}
export interface FormattedData {
	[graph_label: string]: Array<DataItem>
}



export interface APIRequestResponse {
	status: boolean,
	message: string,
	data: any,
	errors?: any
}

export interface APIXLSParser extends Omit<APIRequestResponse, 'data'> {
	data: FormattedData
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


export interface ClientHours{
	[client_name: string]: number
}

export interface CCHours{
	[employee_name: string]: ClientHours
}
