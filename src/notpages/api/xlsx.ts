// import { NextApiHandler, NextApiRequest } from 'next'
// import formidable from 'formidable'
// import path from 'path'
// import fs from 'fs/promises'

// export const config = {
// 	api: {
// 		bodyParser: false,
// 	},
// }

// const readFile = (
// 	req: NextApiRequest,
// ): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
// 	const options: formidable.Options = {}
// 	options.uploadDir = path.join(process.cwd(), '/data')
// 	options.filename = (name, ext, path, form) => (path.originalFilename ?? '')
// 	options.maxFileSize = 4000 * 1024 * 1024

// 	const form = formidable(options)
// 	return new Promise((resolve, reject) => {
// 		form.parse(req, (err, fields, files) => {
// 			if (err) reject(err)
// 			resolve({ fields, files })
// 		})
// 	})
// }

// const handler: NextApiHandler = async (req, res) => {
// 	try {
// 		await fs.readdir(path.join(process.cwd() + '/data'))
// 	} catch (error) {
// 		await fs.mkdir(path.join(process.cwd() + '/data'))
// 	}
// 	await readFile(req)
// 		.then(() => {
// 			return res.json({ status: true, message: 'successfully uploaded document' })
// 		})
// 		.catch(e => {
// 			return res.json({ status: false, message: `unsuccessfully uploaded document ${e}` })
// 		})

// }

// export default handler