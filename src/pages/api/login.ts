import { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'cookies-next'
export default function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') return res.json({ status: false, message: 'not post' })

	if (!req.body) return res.json({ status: false, message: 'no body' })

	const { username, password } = req.body

	if (process.env.BASIC_AUTH_USERNAME === username && process.env.BASIC_AUTH_PASSWORD === password) {
		setCookie('authorized', true, {
			req,
			res
		})
		return res.json({ status: true, message: 'authorized' })
	} else {
		return res.json({ status: false, message: 'username or password is incorrect' })
	}
}