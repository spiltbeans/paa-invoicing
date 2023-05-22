import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, Text, ResponsiveContainer } from 'recharts'

// https://github.com/recharts/recharts/issues/397

const CustomizedAxisTick = (props: any) => {
	const { index, x, y, payload } = props
	return (
		<g transform={`translate(${x},${y})`}>
			<text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)" fontSize={'0.75rem'}>
				{(payload.value).substring(0, 8)}
			</text>
		</g>
	)
}

export default function Chart({ data, maxValue, autoSort=true }: { data: Array<DataItem>, maxValue?: number, autoSort ?: boolean }) {
	const sortedData = autoSort ? data.sort((a, b) => a.value - b.value)  : data
	return (
		<ResponsiveContainer width={'100%'} height={300}>
			<BarChart
				data={sortedData}
				margin={{
					top: 5,
					right: 30,
					left: 20,
					bottom: 4,
				}}
			>
				<CartesianGrid strokeDasharray="5 5" />
				<XAxis
					dataKey='label'
					tick={<CustomizedAxisTick />}
					tickMargin={5}
					interval={0}
					height={60}
				/>
				<YAxis dataKey='value' domain={[0, maxValue ?? (Math.max(...(data.map(d => d.value))))]} />
				<Tooltip formatter={(value, name, props) => ([`${value}`, '# of hours'])} />
				<Legend />
				<Bar name={`Total ${(data)?.reduce((run, curr) => run + (curr?.value ?? 0), 0)} hours`} barSize={20} dataKey='value' fill="#8884d8" />
			</BarChart>
		</ResponsiveContainer>
	)
}