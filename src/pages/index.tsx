// React
import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'

// Elements
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Badge from '@mui/material/Badge'
import Snackbar from '@mui/material/Snackbar'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import Controller from '@/components/Controller'
import ChartSpace from '@/components/ChartSpace'
import Errors from '@/components/Errors'


// Hooks/Modules
import { load_data_sheets } from '@/modules/chart_utils'
import { useSession, signIn } from 'next-auth/react'

export async function getServerSideProps({ req, res }: { req: any, res: any }) {
	return {
		props: {
			data: load_data_sheets(),
		}
	}
}

export default function Home({ data }: { data: DSheets }) {
	const [documentSelect, setDocumentSelect] = useState(Object.keys(data)[0] ?? '')

	// search state
	const [graphs, setGraphs] = useState<Array<string | undefined>>([])

	// indicate if error was sent to client
	const [displayErrorExists, setEExists] = useState(false)

	// display options
	const [displayType, setDisplayType] = useState('clients')
	const [yRelative, setYRelative] = useState(true)
	const [autoSort, setAutoSort] = useState(true)

	const [warning, setWarning] = useState('')


	const { data: session } = useSession()

	console.log(data)
	// useEffect(() => {
	// 	const e = data[documentSelect]?.errors

	// 	if (e !== undefined && Object.keys(e).length > 1) {
	// 		setEExists(true)
	// 	}

	// }, [data, documentSelect])

	// useEffect(() => {
	// 	if (documentSelect === 'error_retrieving_uploaded_files') {
	// 		setWarning(data[documentSelect]?.errors)
	// 	}
	// }, [documentSelect, data])

	const handleAddGraph = (g: string) => {
		if (g !== null && g.length > 1 && !graphs.includes(g)) setGraphs((prev) => [g, ...prev])
	}

	const handleRemoveGraph = (g: string) => {
		setGraphs(prev => prev.filter(e => e !== g))
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



	// rules: 
	// - if document gets changed to client trend and display not client trend, change
	// - if document gets changed to !client trend and display client trend, change
	// don't need to do any enforcement logic in perspective change because the buttons are disabled
	const SPECIAL_DISPLAY = ['client_trends', 'employee_trends']

	const handleDocumentChange = (d: string) => {
		if (d === 'trends' && !SPECIAL_DISPLAY.includes(displayType)) {
			setAutoSort(false)
			setDisplayType('client_trends')
		}

		if (d !== 'trends' && SPECIAL_DISPLAY.includes(displayType)) {
			setAutoSort(true)
			setDisplayType('clients')
		}

		setDocumentSelect(d as string)
		setGraphs([])
	}

	const handlePerspectiveChange = (p: string) => {
		setGraphs([])
		setDisplayType(p)
	}

	if (!session) return (
		<Container className={'flex justify-center p-6'}>
			<button className={'py-5 px-10 mt-10 rounded border border-black bg-gray-100 hover:bg-gray-300'} onClick={() => signIn()}>Sign in</button>
		</Container>
	)
	// console.log(Object.entries(data?.[documentSelect]?.['data']?.[displayType] ?? {}).filter((g, d) => graphs.includes(g))	)
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
						<AccordionSummary expandIcon={<ExpandMoreIcon />} >
							Errors
						</AccordionSummary>
					</Badge>
					<AccordionDetails>
						<Errors errors={data[documentSelect]?.errors ?? {}}/>
					</AccordionDetails>
				</Accordion>

			</div>
			<div id='display-space' className='flex w-full gap-4'>
				<div id='data-charts' className={'flex flex-col w-3/4 border gap-4 py-4'}>
					<ChartSpace
						graphs={data?.[documentSelect]?.['data']?.[displayType] ?? {}}
						autoSort={autoSort}
						onRemoveGraph={handleRemoveGraph}
						maxValue={yRelative ? undefined : maxValue}
					/>
				</div>

				<div id='data-controller' className='w-fit border py-11'>
					<Controller
						isDefaultCollapsed={false}
						documentOptions={Object.keys(data)}
						perspectiveOptions={Object.keys(data?.[documentSelect]?.['data'] ?? {})}
						graphOptions={Object.keys(data?.[documentSelect]?.['data']?.[displayType] ?? {})}
						onDocumentChange={handleDocumentChange}
						onYRangeChange={setYRelative}
						onPerspectiveChange={handlePerspectiveChange}
						onAddGraph={handleAddGraph}
						onWarning={setWarning}
					/>

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