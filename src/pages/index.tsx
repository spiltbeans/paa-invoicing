// React
import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'

// Elements
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Container from '@mui/material/Container'

import Controller from '@/components/Controller'
import ChartSpace from '@/components/ChartSpace'
import Errors from '@/components/Errors'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'

// Hooks/Modules
import { load_data_sheets } from '@/modules/chart_utils'

export async function getServerSideProps({ req, res }: { req: any, res: any }) {
	const session = await getServerSession(
		req,
		res,
		authOptions
	)

	if (!session) {
		return { redirect: { destination: '/api/auth/signin' } }
	}else{
		return {
			props: {
				sheetsPayload: load_data_sheets(),
			}
		}
	}
	
}


// useEffect(() => {
// 	const e = sheetsPayload[workbook]?.errors

// 	if (e !== undefined && Object.keys(e).length > 1) {
// 		setEExists(true)
// 	}

// }, [sheetsPayload, workbook])



export default function Home({ sheetsPayload }: { sheetsPayload: SheetsPayload }) {
	useEffect(() => {
		if (sheetsPayload?.status === 'FAIL') {
			setWarning(sheetsPayload?.message)
		}
	}, [sheetsPayload])

	const SPECIAL_DISPLAY = ['client_trends', 'employee_trends']

	const [workbook, setWorkbookSelected] = useState<string>(Object.keys(sheetsPayload?.data ?? {})[0] ?? '')

	const [warning, setWarning] = useState('')

	const [panel, setPanel] = useState(0)

	const [graphs, setGraphs] = useState<Array<string | undefined>>([])

	// display options
	const [graphType, setGraphType] = useState('clients')
	const [yRelative, setYRelative] = useState(true)
	const [autoSort, setAutoSort] = useState(true)

	const maxValue = useMemo(() => {

		const d = sheetsPayload?.data?.[workbook]?.data

		if (d === undefined) return 0

		const graph_labels: Array<string> = (Object.keys(d?.[graphType] ?? {}))
		const graph_values: Array<number> = graph_labels.map(label => (
			(d?.[graphType]?.[label]).map((element: DataElement) => element.value)
		)).flat()

		return Math.max(...graph_values)
	}, [sheetsPayload, graphType, workbook])

	const handleAddGraph = (g: string) => {
		if (g !== null && g.length > 1 && !graphs.includes(g)) setGraphs((prev) => [g, ...prev])
	}

	const handleRemoveGraph = (g: string) => {
		setGraphs(prev => prev.filter(e => e !== g))
	}

	// rules: 
	// - if document gets changed to client trend and display not client trend, change
	// - if document gets changed to !client trend and display client trend, change
	// don't need to do any enforcement logic in perspective change because the buttons are disabled
	const handleWorkbookChange = (d: string) => {
		if (d === 'trends' && !SPECIAL_DISPLAY.includes(graphType)) {
			setAutoSort(false)
			setGraphType('client_trends')
		}

		if (d !== 'trends' && SPECIAL_DISPLAY.includes(graphType)) {
			setAutoSort(true)
			setGraphType('clients')
		}

		setWorkbookSelected(d as string)
		setGraphs([])
	}

	const handlePerspectiveChange = (p: string) => {
		setGraphs([])
		setGraphType(p)
	}

	const handleChangePanel = (event: React.SyntheticEvent, newValue: number) => {
		setPanel(newValue)
	}

	// console.log(Object.entries(sheetsPayload?.[workbook]?.['data']?.[graphType] ?? {}).filter((g, d) => graphs.includes(g))	)
	return (

		< Box
			sx={{
				my: 4,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 4,
				mx: 4
			}
			}
		>
			<h1 className='text-2xl font-bold'>Work Description Report</h1>

			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={panel} onChange={handleChangePanel} aria-label="basic tabs example">
					<Tab label="Graphs" />
					<Tab label="Errors" />
				</Tabs>
			</Box>

			{
				panel === 0 ? (
					<div id='display-space' className='flex w-full gap-4'>
						<div id='data-charts' className={'flex flex-col w-3/4 border gap-4 py-4'}>
							<ChartSpace
								graphs={sheetsPayload?.data?.[workbook]?.['data']?.[graphType] ?? {}}
								autoSort={autoSort}
								onRemoveGraph={handleRemoveGraph}
								maxValue={yRelative ? undefined : maxValue}
							/>
						</div>

						<div id='data-controller' className='w-fit border py-11'>
							<Controller
								isDefaultCollapsed={false}
								documentOptions={Object.keys(sheetsPayload?.data ?? {})}
								perspectiveOptions={Object.keys(sheetsPayload?.data?.[workbook]?.data ?? {})}
								graphOptions={Object.keys(sheetsPayload?.data?.[workbook]?.data?.[graphType] ?? {})}
								onDocumentChange={handleWorkbookChange}
								onYRangeChange={setYRelative}
								onPerspectiveChange={handlePerspectiveChange}
								onAddGraph={handleAddGraph}
								onWarning={setWarning}
							/>

						</div>
					</div>
				) : (
					<div id='data-input' className='flex flex-col justify-center gap-4'>
						<Errors errors={sheetsPayload?.data?.[workbook]?.errors ?? {}} />
					</div>
				)
			}

			<Snackbar open={!!warning} autoHideDuration={12000} onClose={() => setWarning('')}>
				<Alert onClose={() => setWarning('')} severity={'error'} sx={{ width: '100%' }}>
					{warning}
				</Alert>
			</Snackbar>
		</ Box>
	)
}