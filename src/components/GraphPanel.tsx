'use state'

import GraphSpace from './GraphSpace'
import ControllerSpace from './ControllerSpace'

export default function GraphPanel() {
	const graphTypes = ['clients', 'employees', 'individual_employees', 'individual_clients']
	const graphs: FormattedData = new Map([
		["paa",
			[
				{
					label: "steve",
					value: 1000
				},
				{
					label: "sally",
					value: 200
				},
				{
					label: "joe",
					value: 300
				}
			]
		]
	])
	return (
		<div className='flex py-5 gap-3'>
			<GraphSpace
				graphs={graphs}
				autoSort={true}
				onRemoveGraph={(v: string) => { }}
				maxValue={undefined}
			/>
			<ControllerSpace graphTypeOptions={graphTypes} />
		</div>
	)
}