import dynamic from 'next/dynamic'
import CloseIcon from '@mui/icons-material/Close'

import Fab from '@mui/material/Fab'

const SimpleBarChartWithoutSSR = dynamic(import('@/components/Chart'), { ssr: false })


export default function ChartSpace(
	{
		graphs,
		autoSort,
		onRemoveGraph,
		maxValue
	}: {
		graphs: FormattedData,
		autoSort: boolean,
		onRemoveGraph: (g: string) => void,
		maxValue?: number
	}
) {
	return (
		<>
			{Object.keys(graphs ?? {})?.map((label, idx) => {
				return (
					<div id='data-chart' className='w-full' key={idx}>
						<div className='flex items-center gap-5 ml-8 my-4'>
							<Fab size='small' onClick={() => onRemoveGraph(label)}>
								<CloseIcon />
							</Fab>
							{label}
						</div>
						<SimpleBarChartWithoutSSR autoSort={autoSort} data={graphs?.[label] ?? []} maxValue={maxValue} />
					</div>
				)
			})}
		</>
	)
}