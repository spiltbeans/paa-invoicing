export default function Errors(
	{ errors }: { errors: ErrSheets | any }
) {
	return (
		<>
			{
				Object.keys(errors ?? {}).map((source, idx) => {
					return (
						<div key={idx}>
							{source}
							<ul className='list-disc ml-8'>
								{
									(Object.keys(errors?.[source])?.map((description, sub_idx) => {
										return (
											<li key={`${idx}_${sub_idx}`}>
												{errors[source][description]}
											</li>
										)
									}))
								}
							</ul>
						</div>
					)
				})
			}
		</>
	)
}