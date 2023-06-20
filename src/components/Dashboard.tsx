'use client'

import {
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Box,
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
import {
	EditIcon,
	DownloadIcon
} from '@chakra-ui/icons'
import GraphPanel from './GraphPanel';

export default function Dashboard() {
	const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()

	const handleFileUpload = () => { }

	return (
		<Box w={'100%'} h={'80vh'} p={10} border={'1px'} borderColor={'grey'} borderRadius={8.5}>
			<Tabs size='md' variant='enclosed' w="100%" h={'100%'}>
				<TabList>
					<Tab>Graphs</Tab>
					<Tab>Analytics</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<HStack>
							<Select placeholder='Select option'>
								<option value='option1'>Option 1</option>
								<option value='option2'>Option 2</option>
								<option value='option3'>Option 3</option>
							</Select>
							<Button variant={'outline'} onClick={onModalOpen} >
								Upload
							</Button>
						</HStack>
						<GraphPanel />
						<Modal isOpen={isModalOpen} onClose={onModalClose}>
							<ModalOverlay />
							<ModalContent h={'600px'} w={'600px'}>
								<ModalCloseButton />
								<ModalBody display={'flex'}>
									<input className={'mx-auto my-auto'} type='file' onChange={handleFileUpload}></input>
								</ModalBody>
							</ModalContent>
						</Modal>
					</TabPanel>
					<TabPanel>
						<p>two!</p>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box >
	)
}