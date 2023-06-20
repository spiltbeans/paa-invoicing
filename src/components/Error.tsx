// import { useRef } from 'react'
// import Accordion from '@mui/material/Accordion'
// import AccordionSummary from '@mui/material/AccordionSummary'
// import AccordionDetails from '@mui/material/AccordionDetails'
// import Badge from '@mui/material/Badge'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export default function Errors(
	{ errors }: { errors: { [sheet: string]: SheetErrors } | string }
) {

	return (
		<>
			{
				typeof errors === 'string' ? (
					<ul className='list-disc ml-8'>
						<li >
							{errors}
						</li>
					</ul>
				) : (
					Object.keys(errors ?? {}).map((sheet, idx) => {
						return (
							<div key={idx}>
								{sheet}
								<ul className='list-disc ml-8'>
									{
										(Object.keys(errors?.[sheet])?.map((source, sub_idx) => {
											return (
												<li key={`${idx}_${sub_idx}`}>
													{errors[sheet][source]}
												</li>
											)
										}))
									}
								</ul>
							</div>
						)
					})
				)
			}
		</>
	)

}