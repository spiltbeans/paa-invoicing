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
		<div className={'flex flex-col flex-1 border gap-4 py-4'}>
			{Object.keys(graphs ?? {})?.map((label, idx) => {
				return (
					<div id='data-chart' key={idx}>
						<div className='flex items-center gap-5 my-4 ml-8'>
							<Fab size='small' onClick={() => onRemoveGraph(label)}>
								<CloseIcon />
							</Fab>
							{label}
						</div>
						<SimpleBarChartWithoutSSR autoSort={autoSort} data={graphs?.[label] ?? []} maxValue={maxValue} />
					</div>
				)
			})}
		</div>
	)
}