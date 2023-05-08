import * as React from 'react'
import { useState, useMemo } from 'react'
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
	InputLabel
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material'
import { Add, ExpandMore, Close, ArrowBack, ArrowForward } from '@mui/icons-material'
const SimpleBarChartWithoutSSR = dynamic(import('@/shared/components/Chart'), { ssr: false })
import { ErrSheets, DataItem } from '@/shared/types/types'
import { processXLS, dataFormatter } from '../shared/modules/parse_xls'
import { load_data_sheets } from '@/shared/modules/load_datasheets'

export async function getServerSideProps() {
	// const { data, errors, message, status } = processXLS('/data/work_description-23-02-24.xlsx')
	// const { data, errors, message, status } = processXLS('/data/work_description-22-12.xlsx')


	// const { clients, individual_clients, employees, individual_employees } = data
	// Pass data to the page via props
	return {
		props: {
			data: load_data_sheets(),
			// ({
			// 	individual_clients: dataFormatter(individual_clients),
			// 	employees: dataFormatter(employees),
			// 	individual_employees: dataFormatter(individual_employees),
			// 	clients: dataFormatter(clients)
			// }),
			errors: {}
		}
	}
}

export default function Home({ data, errors }: { data: any, errors: any }) {
	const [displayType, setDisplayType] = useState('clients')
	const [yRelative, setYRelative] = useState(true)
	const [currSearch, setCurrSearch] = useState<string | null>('')
	const [controlsOpen, setControlsOpen] = useState(true)
	const [displayErrorExists, setEExists] = useState(Object.keys(errors).length > 1)
	const [graphs, setGraphs] = useState<Array<string | undefined>>([])
	const [documentSelect, setDocumentSelect] = useState(Object.keys(data)[0])

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
		const graph_labels: Array<string> = (Object.keys(data?.[documentSelect]?.[displayType]))
		const graph_values: Array<number> = graph_labels.map(label => (
			(data?.[documentSelect]?.[displayType]?.[label]).map((element: DataItem) => element.value)
		)).flat()

		return Math.max(...graph_values)
	}, [data, displayType, documentSelect])

	const handlePerspectiveChange = (e: React.MouseEvent<HTMLElement>, t: string) => {
		if (t !== null) {
			setGraphs([])
			setCurrSearch('')
			setDisplayType(t)
		}
	}

	const handleDocumentChange = (event: SelectChangeEvent) => {
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
					<AccordionSummary expandIcon={<ExpandMore />} >
						<Badge
							color="warning"
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							variant="dot"
							invisible={!displayErrorExists}
						>
							Errors
						</Badge>
					</AccordionSummary>
					<AccordionDetails>
						{/* {Object.keys(errors).map((client, idx) => {
							return (
								<div key={idx}>
									{client}
									<ul className='list-disc ml-8'>
										{(Object.keys(errors?.[client])?.map((err, sub_idx) => {
											return <li key={`${idx}_${sub_idx}`}>{errors[client][err]}</li>
										}))}

									</ul>
								</div>
							)
						})} */}
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
								<SimpleBarChartWithoutSSR data={data?.[documentSelect]?.[displayType]?.[label ?? '']} maxValue={yRelative ? undefined : maxValue} />
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
									<input type='file'></input>
								</Tooltip>
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
										<ToggleButton className='text-xs' value='clients'>Clients</ToggleButton>
										<ToggleButton className='text-xs' value='employees'>Employees</ToggleButton>
										<ToggleButton className='text-xs' value='individual_employees'>Individual Employees</ToggleButton>
										<ToggleButton className='text-xs' value='individual_clients'>Individual Clients</ToggleButton>
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
										options={Object.keys(data?.[documentSelect]?.[displayType] ?? [])}
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
		</Box>
	)
}