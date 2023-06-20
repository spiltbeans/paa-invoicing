'use client'

import React, { useEffect, useState } from 'react'
import {
	Button,
	ButtonGroup
} from '@chakra-ui/react'

const ToggleButtonGroup = (
	{ children }: { children: JSX.Element | JSX.Element[] }
): JSX.Element => {
	const [currButton, setCurrButton] = useState<string>('')

	const getValue = (e: JSX.Element): string => {
		if (e?.props?.value) return e.props.value

		if (typeof e?.props?.children === 'string') return e.props.children

		return ""
	}

	useEffect(() => {
		if (Array.isArray(children)) {
			// select first element
			setCurrButton(getValue(children[0]))
		} else {
			setCurrButton(getValue(children))
		}
	}, [])

	return (
		<ButtonGroup>
			{
				(Array.isArray(children)) ? (
					children.map((e, idx) => (
						<ToggleButton key={idx} value={getValue(e)} currValue={currButton} changeValue={setCurrButton}>
							{e}
						</ToggleButton>
					))
				) : (
					<ToggleButton value={getValue(children)} currValue={currButton} changeValue={setCurrButton}>
						{children}
					</ToggleButton>
				)
			}
		</ButtonGroup>
	)
}

const ToggleButton = (
	{
		children,
		value,
		currValue,
		changeValue
	}: {
		children: JSX.Element,
		value: string,
		currValue: string,
		changeValue: (new_val: string) => void
	}
) => {

	const { onClick, ...props } = children.props

	const handleClick = () => {
		changeValue(value)
		if (onClick) onClick()
	}
	return <Button {...props} isDisabled={value === currValue} onClick={handleClick} />


}
export default ToggleButtonGroup