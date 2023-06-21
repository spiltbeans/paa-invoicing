'use client'

import {
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Box,
} from '@chakra-ui/react'

import GraphPanel from './GraphPanel';
	// References
	// https://gist.github.com/ndpniraj/2735c3af00a7c4cbe50602ffe6209fc3
	// https://stackoverflow.com/questions/59233036/react-typescript-get-files-from-file-input
	// const handleFileUpload = (e: React.FormEvent<HTMLInputElement>) => {
	// 	try {
	// 		if (e.currentTarget?.files) {
	// 			const file = e.currentTarget.files[0]

	// 			if (!file) return

	// 			const formData = new FormData()
	// 			formData.append('newFile', file)
	// 			axios.post('/api/xlsx', formData)
	// 				.then(({ data }) => {
	// 					if (data.status) return router.replace(router.asPath)

	// 					onWarning(data.message)
	// 				})
	// 		}
	// 	} catch (err: any) {
	// 		onWarning(JSON.stringify(err))
	// 	}

	// }

export default function Dashboard() {

	return (
		<Box w={'100%'} p={10} border={'1px'} borderColor={'grey'} borderRadius={8.5}>
			<Tabs size='md' variant='enclosed' w="100%" h={'100%'}>
				<TabList>
					<Tab>Graphs</Tab>
					<Tab>Analytics</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<GraphPanel />
					</TabPanel>
					<TabPanel>
						<p>two!</p>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box >
	)
}