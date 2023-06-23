'use state'

import GraphSpace from './GraphSpace'
import ControllerSpace from './ControllerSpace'
import {
	HStack,
	Button,
	Select,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	useDisclosure
} from '@chakra-ui/react'

// const load_sheets = async () => {
// 	return load_data_sheets()
// }
export default function GraphPanel() {
	const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()

	// const d = fetch('/api/sheet-names')

	const handleFileUpload = () => { }

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
		<div id='graph-panel-wrapper' className='flex flex-col gap-5 py-5'>
			<HStack id='sheet-selector-wrapper'>
				<Select id='sheet-selector' placeholder='Select option'>
					<option value='option1'>Option 1</option>
					<option value='option2'>Option 2</option>
					<option value='option3'>Option 3</option>
				</Select>
				<Button id='sheet-upload' variant={'outline'} onClick={onModalOpen} >
					Upload
				</Button>
			</HStack>
			<div id='graph-detail-wrapper' className='flex w-full gap-3 '>
				<GraphSpace
					graphs={graphs}
					autoSort={true}
					onRemoveGraph={(v: string) => { }}
					maxValue={undefined}
				/>
				<ControllerSpace graphTypeOptions={graphTypes} />
			</div>

			<Modal id='sheet-upload-modal' isOpen={isModalOpen} onClose={onModalClose}>
				<ModalOverlay />
				<ModalContent h={'600px'} w={'600px'}>
					<ModalCloseButton />
					<ModalBody display={'flex'}>
						<input className={'mx-auto my-auto'} type='file' onChange={handleFileUpload}></input>
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>

	)
}