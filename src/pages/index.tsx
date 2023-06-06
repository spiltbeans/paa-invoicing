// React
import * as React from 'react'
import { useState, useEffect } from 'react'

import type { SelectChangeEvent } from '@mui/material/Select'

// Elements
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import GraphPanel from '@/components/GraphPanel'
import Errors from '@/components/Errors'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'

// Hooks/Modules
import { load_data_sheets } from '@/modules/chart_utils'

export async function getServerSideProps({ req, res }: { req: any, res: any }) {
	const session = await getServerSession(
		req,
		res,
		authOptions
	)

	if (!session) {
		return { redirect: { destination: '/api/auth/signin' } }
	} else {
		return {
			props: {
				sheetsPayload: load_data_sheets(),
			}
		}
	}

}

export default function Home({ sheetsPayload }: { sheetsPayload: SheetsPayload }) {
	useEffect(() => {
		if (sheetsPayload?.status === 'FAIL') {
			setWarning(sheetsPayload?.message)
		}
	}, [sheetsPayload])

	const [warning, setWarning] = useState<string>('')

	return (

		< Box
			sx={{
				my: 4,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 4,
				mx: 4,
			}}
		>
			<h1 className='text-2xl font-bold'>Work Description Report</h1>


			<GraphPanel sheetsPayload={sheetsPayload} onWarning={setWarning} />

			<Snackbar open={!!warning} autoHideDuration={12000} onClose={() => setWarning('')}>
				<Alert onClose={() => setWarning('')} severity={'error'} sx={{ width: '100%' }}>
					{warning}
				</Alert>
			</Snackbar>
		</ Box>
	)
}