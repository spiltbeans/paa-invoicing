import * as React from 'react'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Box, ToggleButtonGroup, ToggleButton, Tooltip, AccordionSummary, Accordion, AccordionDetails, Badge, TextField, Autocomplete, Fab } from '@mui/material'
import { Add, ExpandMore, Close, ArrowBack, ArrowForward } from '@mui/icons-material'
const SimpleBarChartWithoutSSR = dynamic(import('@/shared/components/Chart'), { ssr: false })
import { FormattedData, ErrSheets, GraphItem, DataItem } from '@/shared/types/types'
import { processXLS, dataFormatter } from './api/modules/parse_xls'


export async function getServerSideProps() {
	// const { data, error, message, status } = processXLS('/data/work_description-23-02-24.xlsx')
	const { data, error, message, status } = processXLS('/data/work_description-22-12.xlsx')

	const { clients, individual_clients, employees, individual_employees } = data
	// Pass data to the page via props
	return {
		props: {
			data: ({
				individual_clients: dataFormatter(individual_clients),
				employees: dataFormatter(employees),
				individual_employees: dataFormatter(individual_employees),
				clients: dataFormatter(clients)
			}),
			error
		}
	}
}

export default function Home({ data, error }: { data: any, error: ErrSheets }) {
	const [displayType, setDisplayType] = useState('clients')
	const [yRelative, setYRelative] = useState(true)
	const [currSearch, setCurrSearch] = useState<string | null>('')
	const [controlsOpen, setControlsOpen] = useState(true)
	const [displayErrorExists, setEExists] = useState(Object.keys(error).length > 1)
	const [graphs, setGraphs] = useState<Array<string | undefined>>([])

	const handleSearchChange = (event: React.SyntheticEvent<Element, Event>, value: GraphItem | string | null) => {
		if (typeof value === 'object') {
			setCurrSearch(value?.graph_id ?? '')
		} else {
			setCurrSearch(value ?? '')
		}
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
		return Math.max(...((Object.keys(data?.[displayType] ?? []).map(client => data[displayType][client].map((d: DataItem) => d.value))).flat()) || [0])
	}, [data, displayType])

	const handlePerspectiveChange = (e: React.MouseEvent<HTMLElement>, t: string) => {
		if (t !== null) {
			setGraphs([])
			setCurrSearch('')
			setDisplayType(t)
		}
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
						{Object.keys(error).map((client, idx) => {
							return (
								<div key={idx}>
									{client}
									<ul className='list-disc ml-8'>
										{(Object.keys(error?.[client])?.map((err, sub_idx) => {
											return <li key={`${idx}_${sub_idx}`}>{error[client][err]}</li>
										}))}

									</ul>
								</div>
							)
						})}
					</AccordionDetails>
				</Accordion>

			</div>
			<div id='display-space' className='flex w-full gap-4'>
				<div id='data-charts' className={`flex flex-col ${controlsOpen ? 'w-3/4' : 'w-full'} border gap-4 py-4`}>
					{graphs?.map((client, idx) => {
						return (
							<div id='data-chart' className='w-full' key={idx}>
								<div className='flex items-center gap-5 ml-8 my-4'>
									<Fab size='small' onClick={() => handleRemoveGraph(client ?? '')}>
										<Close />
									</Fab>
									{client}
								</div>
								<SimpleBarChartWithoutSSR data={data?.[displayType]?.[client ?? '']} maxValue={yRelative ? undefined : maxValue} />
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
								<select>
									<option>test</option>
								</select>
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
										options={Object.keys(data?.[displayType] ?? [])}
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