import GraphSpace from './GraphSpace'
import ControllerSpace from './ControllerSpace'
export default function GraphPanel() {
	return (
		<div className='flex'>
			<GraphSpace />
			<ControllerSpace />
		</div>
	)
}