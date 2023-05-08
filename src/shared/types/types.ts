export type DataItem = {
	label: string,
	value: number
}

export interface APIRequestResponse {
	status: boolean,
	message: string,
	data: any,
	error?: any
}

export interface FormattedData {
	[data_label: string]: Array<DataItem>
}

export interface APIXLSParser extends Omit<APIRequestResponse, 'data'> {
	data: FormattedData
}

export interface ErrSheets {
	[client_name: string]: any
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
export interface GraphItem{
	label: string,
	graph_id: string
}
