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


export default function GraphPanel({ sheetsPayload, onWarning }: { sheetsPayload: SheetsPayload, onWarning: (w: string) => void }) {

	const SPECIAL_DISPLAY = ['client_trends', 'employee_trends']

	const [workbook, setWorkbook] = useState<string>(Object.keys(sheetsPayload?.data ?? {})[0] ?? '')

	const [panel, setPanel] = useState<number>(0)

	const [graphs, setGraphs] = useState<Array<string | undefined>>([])

	// display options
	const [graphType, setGraphType] = useState<string>('')
	const [yRelative, setYRelative] = useState<boolean>(true)
	const [autoSort, setAutoSort] = useState<boolean>(true)

	const maxValue: number = useMemo(() => {

		const d = sheetsPayload?.data?.[workbook]?.data

		if (d === undefined) return 0

		const graph_labels: Array<string> = (Object.keys(d?.[graphType] ?? {}))
		const graph_values: Array<number> = graph_labels.map(label => (
			(d?.[graphType]?.[label]).map((element: DataElement) => element.value)
		)).flat()

		return Math.max(...graph_values)
	}, [sheetsPayload, graphType, workbook])

	const selectedGraphs = useMemo(() => {
		const available_graphs = sheetsPayload?.data?.[workbook]?.['data']?.[graphType] ?? {}
		return graphs.reduce((previousValue: FormattedData, currentValue: string | undefined): FormattedData => {
			if (currentValue === undefined) return previousValue

			previousValue[currentValue] = available_graphs[currentValue]
			return previousValue
		}, {})
	}, [graphType, graphs, sheetsPayload?.data, workbook])


	const handleAddGraph = (g: string) => {
		if (g !== null && g.length > 1 && !graphs.includes(g)) setGraphs((prev) => [g, ...prev])
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
		if (p === 'clients' || p === 'employees') {
			setGraphs(Object.keys(sheetsPayload.data?.[workbook]?.data?.[p] ?? {}))
		} else {
			setGraphs([])
		}
		setGraphType(p)
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
						<div id='data-charts' className={'flex flex-col w-3/4 border gap-4 py-4'}>
							<ChartSpace
								graphs={selectedGraphs}
								autoSort={autoSort}
								onRemoveGraph={handleRemoveGraph}
								maxValue={yRelative ? undefined : maxValue}
							/>
						</div>

						<div id='data-controller' className='w-fit border py-11'>
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