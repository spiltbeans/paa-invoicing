// React
import * as React from 'react'
import { useState, useMemo } from 'react'

// Elements
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import Controller from '@/components/Controller'
import ChartSpace from '@/components/ChartSpace'
import Errors from '@/components/Errors'

import { tech_payment } from '@/config/whitelist'
export default function GraphPanel({ sheetsPayload, onWarning }: { sheetsPayload: SheetsPayload, onWarning: (w: string) => void }) {

	const SPECIAL_DISPLAY = ['client_trends', 'employee_trends']

	const [workbook, setWorkbook] = useState<string>(Object.keys(sheetsPayload?.data ?? {})[0] ?? '')

	const [panel, setPanel] = useState<number>(0)

	const [graphs, setGraphs] = useState<Array<string | undefined>>([])

	// display options
	const [graphType, setGraphType] = useState<string>('')
	const [yRelative, setYRelative] = useState<boolean>(true)
	const [autoSort, setAutoSort] = useState<boolean>(true)



	const selectedGraphs = useMemo(() => {
		const available_graphs = sheetsPayload?.data?.[workbook]?.['data']?.[graphType === 'tech_payments' ? 'individual_clients' : graphType] ?? {}
		return graphs.reduce((previousValue: FormattedData, currentValue: string | undefined): FormattedData => {
			if (currentValue === undefined) return previousValue

			previousValue[currentValue] = available_graphs[currentValue]
			return previousValue
		}, {})
	}, [graphType, graphs, sheetsPayload?.data, workbook])


	const maxValue: number = useMemo(() => {
		if (Object.keys(selectedGraphs).length < 1) return 0
		let running: number[] = []
		for (let c in selectedGraphs) {
			running = [...running, ...selectedGraphs[c].map(e => e.value)]
		}
		return Math.max(...running)
	}, [selectedGraphs])

	const handleAddGraph = (g: string, p?:string) => {
		const def = p ?? graphType
		const graph_exists = (sheetsPayload?.data?.[workbook]?.['data']?.[def === 'tech_payments' ? 'individual_clients' : def] ?? {}).hasOwnProperty(g)

		if (g !== null && g.length > 1 && !graphs.includes(g) && graph_exists) setGraphs((prev) => [g, ...prev])
	}

	const handleRemoveGraph = (g: string) => {
		setGraphs(prev => prev.filter(e => e !== g))
	}

	const handleWorkbookChange = (w: string) => {
		// rules: 
		// - if document gets changed to trend and display not client trend, change
		// - if document gets changed to !trend and display client trend, change
		// don't need to do any enforcement logic in perspective change because the buttons are disabled

		if (w === 'trends' && !SPECIAL_DISPLAY.includes(graphType)) {
			setAutoSort(false)
			handleGraphTypeChange('client_trends')
		}

		if (w !== 'trends' && SPECIAL_DISPLAY.includes(graphType)) {
			setAutoSort(true)
			handleGraphTypeChange('clients')
		}

		setWorkbook(w)
		setGraphs([])
	}

	const handleGraphTypeChange = (p: string) => {
		setGraphType(p)
		if (p === 'clients' || p === 'employees') {
			setGraphs(Object.keys(sheetsPayload.data?.[workbook]?.data?.[p] ?? {}))
		} else if (p === 'tech_payments') {
			setGraphs([])
			for (let g of tech_payment) {
				handleAddGraph(g, p)	// this is because the client may not exist in sheet
			}
		} else {
			setGraphs([])
		}
	}

	const handleChangePanel = (_event: React.SyntheticEvent, newValue: number) => {
		setPanel(newValue)
	}

	return (

		<>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={panel} onChange={handleChangePanel} aria-label="basic tabs example">
					<Tab label="Graphs" />
					<Tab label="Errors" />
				</Tabs>
			</Box>

			{
				panel === 0 ? (
					<div id='display-space' className='flex w-full gap-4'>
						<ChartSpace
							graphs={selectedGraphs}
							autoSort={autoSort}
							onRemoveGraph={handleRemoveGraph}
							maxValue={yRelative ? undefined : maxValue}
						/>

						<Controller
							isDefaultCollapsed={false}
							documentOptions={Object.keys(sheetsPayload?.data ?? {})}
							graphTypeOptions={Object.keys(sheetsPayload?.data?.[workbook]?.data ?? {})}
							graphOptions={Object.keys(sheetsPayload?.data?.[workbook]?.data?.[graphType] ?? {})}
							onWorkbookChange={handleWorkbookChange}
							onYRangeChange={setYRelative}
							onGraphTypeChange={handleGraphTypeChange}
							onAddGraph={handleAddGraph}
							onWarning={onWarning}
						/>
					</div>
				) : (
					<div id='data-input' className='flex flex-col justify-center gap-4'>
						<Errors errors={sheetsPayload?.data?.[workbook]?.errors ?? {}} />
					</div>
				)
			}
		</ >
	)
}