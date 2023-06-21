'use client'

import dynamic from 'next/dynamic'
import {
	IconButton
} from '@chakra-ui/react'

import {
	CloseIcon
} from '@chakra-ui/icons'
const SimpleBarChartWithoutSSR = dynamic(()=>import('@/components/Graph'), { ssr: false })


export default function GraphSpace(
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
		<div id='data-charts' className={'flex flex-col w-full border gap-4 py-4'}>
			{[...graphs].map(graph => (
				<div id='data-chart' className='w-full' key={graph[0]}>
					<div className='flex items-center gap-5 ml-8 my-4'>
						<IconButton variant={'outline'} aria-label={'collapse controller'} icon={<CloseIcon />} onClick={() => onRemoveGraph(graph[0])} />
						{graph[0]}
					</div>
					<SimpleBarChartWithoutSSR autoSort={autoSort} data={graph[1]} maxValue={maxValue} />
				</div>
			))}
		</div>
	)
}