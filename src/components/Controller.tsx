import { useState } from 'react'
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
		perspectiveOptions,
		graphOptions,
		onDocumentChange,
		onYRangeChange,
		onPerspectiveChange,
		onAddGraph,
		onWarning

	}: {
		isDefaultCollapsed: boolean,
		documentOptions: Array<string>,
		perspectiveOptions: Array<string>,
		graphOptions: Array<string>,
		onDocumentChange: (d: string) => void,
		onYRangeChange: (y: boolean) => void,
		onPerspectiveChange: (p: string) => void,
		onAddGraph: (g: string) => void
		onWarning: (w: string) => void,
	}
) {

	const [collapsed, setCollapsed] = useState(isDefaultCollapsed)
	const [documentSelect, setDocument] = useState(documentOptions[0])
	
	const [searchInp, setSearchInp] = useState('')
	const [searchValue, setSearchValue] = useState<string | null>(null)

	// display options
	const [displayType, setDisplayType] = useState('clients')
	const [yRelative, setYRelative] = useState(true)

	const router = useRouter()

	const handleDocumentChange = (e: SelectChangeEvent) => {
		setDocument(e.target.value as string)
		onDocumentChange(e.target.value as string)
	}

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


	const handleChangeYRange = (event: React.MouseEvent<HTMLElement>, yRange: boolean) => {
		if (yRange !== null) {
			setYRelative(yRange)
			onYRangeChange(yRange)
		}
	}
	const handlePerspectiveChange = (e: React.MouseEvent<HTMLElement>, perspective: string) => {
		if (perspective !== null) {
			setDisplayType(perspective)
			clearSearch()
			onPerspectiveChange(perspective)
		}
	}

	const handleSearchChange = (_e: React.SyntheticEvent<Element, Event>, value: string) => setSearchInp(value)

	const handleSearchValChange = (e: any, newVal: string | null) => setSearchValue(newVal)

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
								value={documentSelect}
								onChange={handleDocumentChange}
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


							<ToggleButtonGroup value={displayType} exclusive onChange={handlePerspectiveChange}>
								<ToggleButton className='text-xs' value='clients' disabled={!perspectiveOptions.includes('clients')}>Clients</ToggleButton>
								<ToggleButton className='text-xs' value='employees' disabled={!perspectiveOptions.includes('employees')}>Employees</ToggleButton>
								<ToggleButton className='text-xs' value='individual_employees' disabled={!perspectiveOptions.includes('individual_employees')}>Individual Employees</ToggleButton>
								<ToggleButton className='text-xs' value='individual_clients' disabled={!perspectiveOptions.includes('individual_clients')}>Individual Clients</ToggleButton>
							</ToggleButtonGroup>
							<ToggleButtonGroup value={displayType} exclusive onChange={handlePerspectiveChange}>
								<ToggleButton className='text-xs' value='client_trends' disabled={!perspectiveOptions.includes('client_trends')}>Client Trends</ToggleButton>
								<ToggleButton className='text-xs' value='employee_trends' disabled={!perspectiveOptions.includes('employee_trends')}>Employee Trends</ToggleButton>
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