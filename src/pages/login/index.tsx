import * as React from 'react'
import { useState } from 'react'
import axios from 'axios'
import {
	Container,
	Box,
	FormControl,
	InputLabel,
	OutlinedInput,
	Alert,
	LinearProgress
} from '@mui/material'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next'

export async function getServerSideProps({ req, res }: {req: any, res: any}) {
	const authorized = getCookie('authorized', { req, res })
	if (authorized) {
		return {
			redirect: {
				permanent: false,
				destination: '/',
			},
		}
	} else {
		return {
			props: {
			}
		}
	}
}

export default function Home() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [warning, setWarning] = useState('')
	const [validating, setValidating] = useState(false)
	const router = useRouter()
	const handleSubmit = async (e: any) => {
		e.preventDefault()
		setValidating(true)
		await axios('/api/login', {
			method: 'POST',
			data: {
				username: (username.toLowerCase()),
				password: password
			}
		}).then(({ data }) => {
			setValidating(false)
			if (data.status) {
				// this is very slow but apparently is fine in prod
				// https://stackoverflow.com/questions/65146878/nextjs-router-seems-very-slow-compare-to-react-router
				router.replace('/')
			} else {
				setWarning(data.message)
			}

		})
	}

	return (
		<Container sx={{ justifyContent: 'center', display: 'flex', marginBlockStart: '6rem' }}>
			<Box
				component="form"
				noValidate
				autoComplete="off"
				sx={{ display: 'flex', flexDirection: 'column', border: 1 }}
				onSubmit={handleSubmit}
				className={'py-16 px-24 gap-5'}
			>
				{validating && <LinearProgress />}
				<FormControl>
					<InputLabel htmlFor="username-input">Username</InputLabel>
					<OutlinedInput label={'Username'} required id="username-input" onChange={e => setUsername(e.target.value)} />
				</FormControl>
				<FormControl>
					<InputLabel htmlFor="password-input">Password</InputLabel>
					<OutlinedInput label={'Username'} required id="password-input" onChange={e => setPassword(e.target.value)} type="password" />
				</FormControl>
				{warning && <Alert severity='warning'>{warning}</Alert>}
				<button className={'py-2 text-sm border rounded hover:brightness-75'}>Login</button>
			</Box>
		</Container>
	)
}