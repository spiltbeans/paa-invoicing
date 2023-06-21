'use client'

import { useState, useEffect } from 'react'
import {
	Button,
	IconButton
} from '@chakra-ui/react'
import {
	AddIcon,
	ArrowBackIcon,
	ArrowForwardIcon
} from '@chakra-ui/icons'
import {
	AutoComplete,
	AutoCompleteInput,
	AutoCompleteItem,
	AutoCompleteList,
} from "@choc-ui/chakra-autocomplete";

import ToggleButtonGroup from './ToggleButtonGroup'
// enum DisplayTypes{
// 	clients,
// 	employees,
// 	individual,
// 	individual_employees,
// 	individual_clients,
// 	client_trends,
// 	employee_trends
// }

export default function Controller(
	{
		// 	isDefaultCollapsed = false,
		// 	documentOptions,
		graphTypeOptions,
		// 	graphOptions,
		// 	onWorkbookChange,
		// 	onYRangeChange,
		// 	onGraphTypeChange,
		// 	onAddGraph,
		// 	onWarning

	}: {
		// 	isDefaultCollapsed: boolean,
		// 	documentOptions: Array<string>,
		graphTypeOptions: string[],
		// 	graphOptions: Array<string>,
		// 	onWorkbookChange: (d: string) => void,
		// 	onYRangeChange: (y: boolean) => void,
		// 	onGraphTypeChange: (p: string) => void,
		// 	onAddGraph: (g: string) => void
		// 	onWarning: (w: string) => void,
	}
) {
	// useEffect(() => {
	// 	// this is a limited solution. if the workbook is changed and the graph type is clients
	// 	// or employees, the graph is not selected
	// 	changeGraphType('clients')
	// 	// eslint-disable-next-line
	// }, [])
	// const SPECIAL_DISPLAY = ['client_trends', 'employee_trends']

	const [collapsed, setCollapsed] = useState(false)
	// const [workbook, setWorkbook] = useState(documentOptions[0])

	// const [searchInp, setSearchInp] = useState('')
	// const [searchValue, setSearchValue] = useState<string | null>(null)

	// display options
	const [graphType, setGraphType] = useState('clients')
	const [yRelative, setYRelative] = useState('true')


	// const handleWorkbookChange = (e: any) => {
	// 	clearSearch()

	// 	if (e.target.value === 'trends' && !SPECIAL_DISPLAY.includes(graphType)) {
	// 		changeGraphType('client_trends')
	// 	}

	// 	if (e.target.value !== 'trends' && SPECIAL_DISPLAY.includes(graphType)) {
	// 		changeGraphType('clients')
	// 	}

	// 	setWorkbook(e.target.value as string)
	// 	onWorkbookChange(e.target.value as string)
	// }

	// const handleChangeYRange = (_event: React.MouseEvent<HTMLElement>, yRange: boolean) => {
	// 	if (yRange !== null) {
	// 		setYRelative(yRange)
	// 		onYRangeChange(yRange)
	// 	}
	// }
	const handleGraphTypeChange = (type: string) => {
		changeGraphType(type)
	}

	const changeGraphType = (type: string) => {
		if (type !== null) {
			setGraphType(type)
			// clearSearch()
			// onGraphTypeChange(type)
		}
	}

	// const handleSearchChange = (_e: React.SyntheticEvent<Element, Event>, value: string) => setSearchInp(value)

	// const handleSearchValChange = (_e: any, newVal: string | null) => setSearchValue(newVal)

	// const handleAddGraph = () => {
	// 	clearSearch()
	// 	onAddGraph(searchInp)
	// }

	// const clearSearch = () => {
	// 	setSearchInp('')
	// 	setSearchValue(null)
	// }
	const countries = [
		"nigeria",
		"japan",
		"india",
		"united states",
		"south korea",
	];
	return (
		<div className='border p-5 min-h-[370px]'>
			{
				collapsed ? (
					<IconButton variant={'outline'} aria-label={'expand controller'} icon={<ArrowBackIcon />} onClick={() => setCollapsed(prev => !prev)} />
				) : (


					<div className='flex flex-col gap-4 px-5'>
						<IconButton variant={'outline'} aria-label={'collapse controller'} icon={<ArrowForwardIcon />} onClick={() => setCollapsed(prev => !prev)} />

						<section className='flex flex-col gap-4'>
							<h2 className='text-base font-bold'>
								Display Options
								<hr />
							</h2>
							<div className='flex flex-col w-full items-center gap-4'>
								<ToggleButtonGroup onChange={(val: string | number) => setYRelative(val as string)}>
									<Button className='text-xs' value={'true'}>Set Y Range Relative</Button>
									<Button className='text-xs' value={'false'}>Set Y Range Global</Button>
								</ToggleButtonGroup>
								<ToggleButtonGroup onChange={(val: string | number) => handleGraphTypeChange(val as string)}>
									<Button className='text-xs' value='clients' isDisabled={!graphTypeOptions.includes('clients')}>Clients</Button>
									<Button className='text-xs' value='employees' isDisabled={!graphTypeOptions.includes('employees')}>Employees</Button>
									<Button className='text-xs' value='individual_employees' isDisabled={!graphTypeOptions.includes('individual_employees')}>Individual Employees</Button>
									<Button className='text-xs' value='individual_clients' isDisabled={!graphTypeOptions.includes('individual_clients')}>Individual Clients</Button>
								</ToggleButtonGroup>
								<ToggleButtonGroup onChange={(val: string | number) => handleGraphTypeChange(val as string)}>
									<Button className='text-xs' value='client_trends' disabled={!graphTypeOptions.includes('client_trends')}>Client Trends</Button>
									<Button className='text-xs' value='employee_trends' disabled={!graphTypeOptions.includes('employee_trends')}>Employee Trends</Button>
								</ToggleButtonGroup>
							</div>

						</section>

						<section className='flex flex-col gap-4'>
							<h2 className='text-base font-bold'>
								Add a Graph
								<hr />
							</h2>
							<div className='flex justify-evenly items-center'>
								<AutoComplete openOnFocus>
									<AutoCompleteInput variant="outline" placeholder='Search for graph...' />
									<AutoCompleteList>
										{countries.map((country, cid) => (
											<AutoCompleteItem
												key={`option-${cid}`}
												value={country}
												textTransform="capitalize"
											>
												{country}
											</AutoCompleteItem>
										))}
									</AutoCompleteList>
								</AutoComplete>
								<IconButton variant={'outline'} aria-label={'add graph'} icon={<AddIcon />} />
							</div>
						</section>

					</div>
				)
			}
		</div>
	)
}