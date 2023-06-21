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
		<div id='graph-space-wrapper' className={'flex flex-col flex-1 border gap-4 py-4'}>
			{[...graphs].map(graph => (
				<div id={`graph-wrapper-${graph[0]}`} key={graph[0]}>
					 <div id='graph-label-wrapper' className='flex items-center gap-5 ml-8 my-4'>
						<IconButton id={`graph-remove-${graph[0]}`} variant={'outline'} aria-label={'collapse controller'} icon={<CloseIcon />} onClick={() => onRemoveGraph(graph[0])} />
						{graph[0]}
					</div>
					<SimpleBarChartWithoutSSR autoSort={autoSort} data={graph[1]} maxValue={maxValue} />
				</div>
			))}
		</div>
	)
}