'use state'

import GraphSpace from './GraphSpace'
import ControllerSpace from './ControllerSpace'
export default function GraphPanel() {
	const graphTypes = ['clients', 'employees', 'individual_employees', 'individual_clients']


	return (
		<div className='flex'>
			<GraphSpace />
			<ControllerSpace graphTypeOptions={graphTypes}/>
		</div>
	)
}