import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import type { SelectChangeEvent } from '@mui/material/Select'

import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Autocomplete from '@mui/material/Autocomplete'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Fab from '@mui/material/Fab'

import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

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
		isDefaultCollapsed = false,
		documentOptions,
		graphTypeOptions,
		graphOptions,
		onWorkbookChange,
		onYRangeChange,
		onGraphTypeChange,
		onAddGraph,
		onWarning

	}: {
		isDefaultCollapsed: boolean,
		documentOptions: Array<string>,
		graphTypeOptions: Array<string>,
		graphOptions: Array<string>,
		onWorkbookChange: (d: string) => void,
		onYRangeChange: (y: boolean) => void,
		onGraphTypeChange: (p: string) => void,
		onAddGraph: (g: string) => void
		onWarning: (w: string) => void,
	}
) {
	useEffect(()=>{
		// this is a limited solution. if the workbook is changed and the graph type is clients
		// or employees, the graph is not selected
		changeGraphType('clients')
	// eslint-disable-next-line
	}, [])
	const SPECIAL_DISPLAY = ['client_trends', 'employee_trends']

	const [collapsed, setCollapsed] = useState(isDefaultCollapsed)
	const [workbook, setWorkbook] = useState(documentOptions[0])

	const [searchInp, setSearchInp] = useState('')
	const [searchValue, setSearchValue] = useState<string | null>(null)

	// display options
	const [graphType, setGraphType] = useState('clients')
	const [yRelative, setYRelative] = useState(true)

	const router = useRouter()

	// References
	// https://gist.github.com/ndpniraj/2735c3af00a7c4cbe50602ffe6209fc3
	// https://stackoverflow.com/questions/59233036/react-typescript-get-files-from-file-input
	const handleFileUpload = (e: React.FormEvent<HTMLInputElement>) => {
		try {
			if (e.currentTarget?.files) {
				const file = e.currentTarget.files[0]

				if (!file) return

				const formData = new FormData()
				formData.append('newFile', file)
				axios.post('/api/xlsx', formData)
					.then(({ data }) => {
						if (data.status) return router.replace(router.asPath)

						onWarning(data.message)
					})
			}
		} catch (err: any) {
			onWarning(JSON.stringify(err))
		}

	}

	const handleWorkbookChange = (e: SelectChangeEvent) => {
		clearSearch()

		if (e.target.value === 'trends' && !SPECIAL_DISPLAY.includes(graphType)) {
			changeGraphType('client_trends')
		}

		if (e.target.value !== 'trends' && SPECIAL_DISPLAY.includes(graphType)) {
			changeGraphType('clients')
		}

		setWorkbook(e.target.value as string)
		onWorkbookChange(e.target.value as string)
	}

	const handleChangeYRange = (_event: React.MouseEvent<HTMLElement>, yRange: boolean) => {
		if (yRange !== null) {
			setYRelative(yRange)
			onYRangeChange(yRange)
		}
	}
	const handleGraphTypeChange = (_e: React.MouseEvent<HTMLElement>, type: string) => {
		changeGraphType(type)
	}

	const changeGraphType = (type: string) => {
		if (type !== null) {
			setGraphType(type)
			clearSearch()
			onGraphTypeChange(type)
		}
	}

	const handleSearchChange = (_e: React.SyntheticEvent<Element, Event>, value: string) => setSearchInp(value)

	const handleSearchValChange = (_e: any, newVal: string | null) => setSearchValue(newVal)

	const handleAddGraph = () => {
		clearSearch()
		onAddGraph(searchInp)
	}

	const clearSearch = () => {
		setSearchInp('')
		setSearchValue(null)
	}

	return (
		<div>
			{collapsed && <ArrowBackIcon className='hover:cursor-pointer' onClick={() => setCollapsed(false)} />}
			{!collapsed &&
				<div className='flex flex-col gap-4 px-5'>
					<ArrowForwardIcon className='hover:cursor-pointer' onClick={() => setCollapsed(true)} />
					<section className='flex flex-col gap-4'>
						<h2 className='text-base font-bold'>
							Select from already existing data
							<hr />
						</h2>
						<div>
							<Select
								value={workbook}
								onChange={handleWorkbookChange}
							>
								{documentOptions.map((document, idx) => {
									return <MenuItem key={idx} value={document}>{document}</MenuItem>
								})}
							</Select>
						</div>

					</section>

					<section className='flex flex-col gap-4'>
						<h2 className='text-base font-bold'>
							Upload your own data
							<hr />
						</h2>
						<Tooltip title="replace data by uploading a sheet with the same name">
							<input type='file' onChange={handleFileUpload}></input>
						</Tooltip>
						<div className='flex flex-col w-96'>
							<em>
								{'Note on "trend" feature: files are sorted by date in format of [text]-[DD]-[MM]-[YY].xlsx.'}
							</em>
							<em>
								{'The system will attempt to sort even if some date formatting is missing (i.e., [text]-[MM]-[YY].xlsx), but if the system cannot recognize a valid date formatting, the bar will be positioned left-wise.'}
							</em>
						</div>

					</section>
					<section className='flex flex-col gap-4'>
						<h2 className='text-base font-bold'>
							Display Options
							<hr />
						</h2>
						<div className='flex flex-col w-full items-center gap-4'>
							<ToggleButtonGroup value={yRelative} exclusive onChange={handleChangeYRange}>
								<ToggleButton className='text-xs' value={true}>Set Y Range Relative</ToggleButton>
								<ToggleButton className='text-xs' value={false}>Set Y Range Global</ToggleButton>
							</ToggleButtonGroup>


							<ToggleButtonGroup value={graphType} exclusive onChange={handleGraphTypeChange}>
								<ToggleButton className='text-xs' value='clients' disabled={!graphTypeOptions.includes('clients')}>Clients</ToggleButton>
								<ToggleButton className='text-xs' value='employees' disabled={!graphTypeOptions.includes('employees')}>Employees</ToggleButton>
								<ToggleButton className='text-xs' value='individual_employees' disabled={!graphTypeOptions.includes('individual_employees')}>Individual Employees</ToggleButton>
								<ToggleButton className='text-xs' value='individual_clients' disabled={!graphTypeOptions.includes('individual_clients')}>Individual Clients</ToggleButton>
							</ToggleButtonGroup>
							<ToggleButtonGroup value={graphType} exclusive onChange={handleGraphTypeChange}>
								<ToggleButton className='text-xs' value='client_trends' disabled={!graphTypeOptions.includes('client_trends')}>Client Trends</ToggleButton>
								<ToggleButton className='text-xs' value='employee_trends' disabled={!graphTypeOptions.includes('employee_trends')}>Employee Trends</ToggleButton>
							</ToggleButtonGroup>
						</div>

					</section>

					<section className='flex flex-col gap-4'>
						<h2 className='text-base font-bold'>
							Add a Graph
							<hr />
						</h2>
						<div className='flex justify-evenly items-center'>
							<Autocomplete
								disablePortal
								freeSolo
								id={'graph_input'}
								options={graphOptions}
								value={searchValue}			// option chosen
								onChange={handleSearchValChange}
								inputValue={searchInp}		// what is typed
								onInputChange={handleSearchChange}
								className={'w-1/2'}
								renderInput={(params) => <TextField {...params} label={'Graph Name'} />}
							/>
							<Fab size='small' className='bg-gray-400 hover:bg-gray-300' onClick={handleAddGraph}>
								<AddIcon />
							</Fab>
						</div>
					</section>

				</div>
			}
		</div>
	)
}