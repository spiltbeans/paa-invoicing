import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import dynamic from 'next/dynamic'
import {
	Box,
	ToggleButtonGroup,
	ToggleButton,
	Tooltip,
	AccordionSummary,
	Accordion,
	AccordionDetails,
	Badge,
	TextField,
	Autocomplete,
	Fab,
	Select,
	MenuItem,
	Snackbar,
	Alert
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material'
import { Add, ExpandMore, Close, ArrowBack, ArrowForward } from '@mui/icons-material'
const SimpleBarChartWithoutSSR = dynamic(import('@/shared/components/Chart'), { ssr: false })
import { DataItem, DSheets } from '@/shared/types/types'
import { load_data_sheets } from '@/shared/modules/load_datasheets'
import { getCookie } from 'cookies-next'

export async function getServerSideProps({ req, res }: { req: any, res: any }) {
	const authorized = getCookie('authorized', { req, res })
	if (authorized) {
		return {
			props: {
				data: load_data_sheets(),
			}
		}
	} else {
		return {
			redirect: {
				permanent: false,
				destination: '/login',
			},
		}
	}
}


export default function Home({ data }: { data: DSheets }) {
	const [documentSelect, setDocumentSelect] = useState(Object.keys(data)[0] ?? '')

	// search state
	const [currSearch, setCurrSearch] = useState<string | null>('')
	const [graphs, setGraphs] = useState<Array<string | undefined>>([])

	// indicate if error was sent to client
	const [displayErrorExists, setEExists] = useState(false)

	// display options
	const [displayType, setDisplayType] = useState('clients')
	const [yRelative, setYRelative] = useState(true)
	const [controlsOpen, setControlsOpen] = useState(true)

	const router = useRouter()
	const [warning, setWarning] = useState('')
	const [autoSort, setAutoSort] = useState(true)

	useEffect(() => {
		const e = data[documentSelect]?.errors

		if (e !== undefined && Object.keys(e).length > 1) {
			setEExists(true)
		}

	}, [data, documentSelect])

	useEffect(() => {
		if (documentSelect === 'error_retrieving_uploaded_files') {
			setWarning(data[documentSelect]?.errors)
		}
	}, [documentSelect, data])

	const handleSearchChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
		setCurrSearch(value ?? '')
	}

	// const all_graphs = Object.keys(data).map(client => ({ label: client, graph_id: client.replaceAll(' ', '').toLowerCase() }))
	const handleAddGraph = () => {
		if (currSearch !== null && currSearch.length > 1 && !graphs.includes(currSearch)) setGraphs((prev) => [currSearch, ...prev])
	}

	const handleRemoveGraph = (element: string) => {
		setGraphs(prev => prev.filter(e => e !== element))
	}

	const handleChangeYRange = (event: React.MouseEvent<HTMLElement>, yRange: boolean) => {
		if (yRange !== null) setYRelative(yRange)
	}


	const maxValue = useMemo(() => {

		const d = data[documentSelect]?.data

		if (d === undefined) return 0

		const graph_labels: Array<string> = (Object.keys(d?.[displayType] ?? {}))
		const graph_values: Array<number> = graph_labels.map(label => (
			(d?.[displayType]?.[label]).map((element: DataItem) => element.value)
		)).flat()

		return Math.max(...graph_values)
	}, [data, displayType, documentSelect])

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
						if (data.status) return refreshProps()

						setWarning(data.message)
					})
			}
		} catch (err: any) {
			setWarning(JSON.stringify(err))
		}

	}

	const refreshProps = () => {
		router.replace(router.asPath)
	}
	const err = useMemo(() => {
		let e = data[documentSelect]?.errors

		if (e === undefined) return <></>

		return Object.keys(e ?? {}).map((source, idx) => {
			return (
				<div key={idx}>
					{source}
					<ul className='list-disc ml-8'>
						{
							(Object.keys(e?.[source])?.map((err, sub_idx) => {
								return (
									<li key={`${idx}_${sub_idx}`}>
										{e[source][err]}
									</li>
								)
							}))
						}
					</ul>
				</div>
			)
		})
	}, [data, documentSelect])

	const handlePerspectiveChange = (e: React.MouseEvent<HTMLElement>, t: string) => {
		if (t !== null) {
			setGraphs([])
			setCurrSearch('')
			setDisplayType(t)
		}
	}

	// rules: 
	// - if document gets changed to client trend and display not client trend, change
	// - if document gets changed to !client trend and display client trend, change
	// don't need to do any enforcement logic in perspective change because the buttons are disabled
	const SPECIAL_DISPLAY = ['client_trends', 'employee_trends']

	const handleDocumentChange = (event: SelectChangeEvent) => {
		if (event.target.value === 'trends' && !SPECIAL_DISPLAY.includes(displayType)) {
			setAutoSort(false)
			setDisplayType('client_trends')
		}

		if (event.target.value !== 'trends' && SPECIAL_DISPLAY.includes(displayType)) {
			setAutoSort(true)
			setDisplayType('clients')
		}

		setDocumentSelect(event.target.value as string)
		setGraphs([])
		setCurrSearch('')
	}
	return (
		<Box
			sx={{
				my: 4,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 4,
				mx: 4
			}}
		>
			<h1 className='text-2xl font-bold'>Work Description Report</h1>
			<div id='data-input' className='flex flex-col justify-center gap-4'>
				<Accordion onChange={(event: React.SyntheticEvent, expanded: boolean) => displayErrorExists ? setEExists(false) : undefined}>
					<Badge
						color="warning"
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'left',
						}}
						variant="dot"
						invisible={!displayErrorExists}
					>
						<AccordionSummary expandIcon={<ExpandMore />} >
							Errors
						</AccordionSummary>
					</Badge>
					<AccordionDetails>
						{err}
					</AccordionDetails>
				</Accordion>

			</div>
			<div id='display-space' className='flex w-full gap-4'>
				<div id='data-charts' className={`flex flex-col ${controlsOpen ? 'w-3/4' : 'w-full'} border gap-4 py-4`}>
					{graphs?.map((label, idx) => {
						return (
							<div id='data-chart' className='w-full' key={idx}>
								<div className='flex items-center gap-5 ml-8 my-4'>
									<Fab size='small' onClick={() => handleRemoveGraph(label ?? '')}>
										<Close />
									</Fab>
									{label}
								</div>
								<SimpleBarChartWithoutSSR autoSort={autoSort} data={data?.[documentSelect]?.['data']?.[displayType]?.[label ?? ''] ?? []} maxValue={yRelative ? undefined : maxValue} />
							</div>
						)
					})}
				</div>

				<div id='data-controller' className='w-fit border py-11'>
					{!controlsOpen && <ArrowBack className='hover:cursor-pointer' onClick={() => { setControlsOpen(true) }} />}
					{controlsOpen &&
						<div className='flex flex-col gap-4 px-5'>
							<ArrowForward className='hover:cursor-pointer' onClick={() => { setControlsOpen(false) }} />
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
										{Object.keys(data).map((document, idx) => {
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
										<ToggleButton className='text-xs' value='clients' disabled={!(data?.[documentSelect]?.['data'] ?? {}).hasOwnProperty('clients')}>Clients</ToggleButton>
										<ToggleButton className='text-xs' value='employees' disabled={!(data?.[documentSelect]?.['data'] ?? {}).hasOwnProperty('employees')}>Employees</ToggleButton>
										<ToggleButton className='text-xs' value='individual_employees' disabled={!(data?.[documentSelect]?.['data'] ?? {}).hasOwnProperty('individual_employees')}>Individual Employees</ToggleButton>
										<ToggleButton className='text-xs' value='individual_clients' disabled={!(data?.[documentSelect]?.['data'] ?? {}).hasOwnProperty('individual_clients')}>Individual Clients</ToggleButton>
									</ToggleButtonGroup>
									<ToggleButtonGroup value={displayType} exclusive onChange={handlePerspectiveChange}>
										<ToggleButton className='text-xs' value='client_trends' disabled={!(data?.[documentSelect]?.['data'] ?? {}).hasOwnProperty('client_trends')}>Client Trends</ToggleButton>
										<ToggleButton className='text-xs' value='employee_trends' disabled={!(data?.[documentSelect]?.['data'] ?? {}).hasOwnProperty('employee_trends')}>Employee Trends</ToggleButton>
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
										options={Object.keys(data?.[documentSelect]?.['data']?.[displayType] ?? [])}
										onChange={handleSearchChange}
										className={'w-1/2'}
										renderInput={(params) => <TextField {...params} label={'Graph Name'} />}
									/>
									<Fab size='small' className='bg-gray-400 hover:bg-gray-300' onClick={handleAddGraph}>
										<Add />
									</Fab>
								</div>
							</section>

						</div>
					}

				</div>
			</div>
			<Snackbar open={!!warning} autoHideDuration={12000} onClose={() => setWarning('')}>
				<Alert onClose={() => setWarning('')} severity={'error'} sx={{ width: '100%' }}>
					{warning}
				</Alert>
			</Snackbar>
		</Box>
	)
}