/**
 * MODULE RESPONSES
 */
enum ResponseProtocol {
	OK = 'OK',
	FAIL = 'FAIL',
	WARN = 'WARN'
}
interface SheetsPayload {
	status: keyof typeof ResponseProtocol,
	data?: WorkbooksData,
	message: string
}

type AnchorResponse = {
	status: keyof typeof ResponseProtocol,
	data?: string,
	message?: string
}

type SanitizedDataResponse = {
	data: EmployeeHours,
	errors: SheetErrors
}
interface ParseXLSXResponse {
	status: keyof typeof ResponseProtocol,
	message: string,
	data?: GraphPayload,
	errors?: { [sheet: string]: SheetErrors } | string
}




/**
 * DATA STRUCTURES
 */
type SheetErrors = {
	[error_source: string]: string
}
interface EmployeeHours {
	[employee_name: string]: number
}

// This is not a module response, but every sheet
// will have a status so that the front end can parse the data
// with a more convenient comparison
interface WorkbooksData {
	[workbook: string]: {
		status: keyof typeof ResponseProtocol,
		data?: {
			[graph_type: string]: FormattedData
		},
		errors?: { [sheet: string]: SheetErrors } | string,
	}
}
type DataElement = {
	label: string,
	value: number
}

interface FormattedData {
	[graph_label: string]: Array<DataElement>
}
interface GraphPayload {
	[graph_type: string]: AllEmployeeHours | CCHours | {
		[sub_type: string]: EmployeeHours | ClientHours
	}
}





/**
 * GRAPH TYPES
 */

interface AllEmployeeHours {
	[client_name: string]: EmployeeHours
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

interface ClientHours {
	[client_name: string]: number
}

interface CCHours {
	[employee_name: string]: ClientHours
}