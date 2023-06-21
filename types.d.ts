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
	anchor_cell?: string,
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
	errors?: Map<string, SheetErrors> | string
}




/**
 * DATA STRUCTURES
 */
type ErrorSource = string
type ErrorDetail = string

type SheetErrors = Map<ErrorSource, ErrorDetail>

type EmployeeName = string
type EmployeeHours = Map<EmployeeName, number>

type GraphType = string

// This is not a module response, but every sheet
// will have a status so that the front end can parse the data
// with a more convenient comparison
interface WorkbookData {
	status: keyof typeof ResponseProtocol,
	data?: Map<GraphType, FormattedData>
	errors?: Map<string, SheetErrors> | string,
}
type WorkbookName = string

type WorkbookPayload = Map<WorkbookName, WorkbooksData>

type DataElement = {
	label: string,
	value: number
}

type FormattedData = Map<string, DataElement[]>

interface GraphPayload {
	individual_clients: AllEmployeeHours,
	individual_employees: CCHours,
	employees: Map<string, EmployeeHours>,
	clients: Map<string, ClientHours>
}


type DateStructure = {
	year: string,
	month: string,
	day: string
}


/**
 * GRAPH TYPES
 */

type ClientName = string
type AllEmployeeHours = Map<ClientName, EmployeeHours>

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

type ClientHours = Map<ClientName, number>

type CCHours = Map<EmployeeName, ClientHours>