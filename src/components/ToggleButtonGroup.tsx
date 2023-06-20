'use client'

import React, { useState } from 'react'
import {
	Button,
	ButtonGroup
} from '@chakra-ui/react'

const ToggleButtonGroup = (
	{
		children,
		initialIndex,
		onChange
	}: {
		children: JSX.Element | JSX.Element[],
		initialIndex?: number,
		onChange?: (v: string | number) => any
	}
): JSX.Element => {
	const [currButton, setCurrButton] = useState<number>(initialIndex ?? 0)

	const getValue = (e: JSX.Element): string | number => {
		if (e?.props?.value) return e.props.value

		if (typeof e?.props?.children === 'string') return e.props.children

		return ""
	}

	const handleValueChange = (idx: number) => {
		setCurrButton(idx)

		if (onChange !== undefined) {
			(Array.isArray(children)) ? onChange(getValue(children[idx])) : onChange(getValue(children))
		}
	}
	return (
		<ButtonGroup isAttached variant={'outline'}>
			{
				(Array.isArray(children)) ? (
					children.map((e, idx) => (
						<ToggleButton key={idx} value={idx} currValue={currButton} changeValue={handleValueChange}>
							{e}
						</ToggleButton>
					))
				) : (
					<ToggleButton value={-1} currValue={currButton} changeValue={() => handleValueChange(-1)}>
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
		value: number,
		currValue: number,
		changeValue: (new_val: number) => void
	}
) => {

	const { onClick, ...props } = children.props

	const handleClick = () => {
		changeValue(value)
		if (onClick) onClick()
	}
	return <Button {...props} isActive={value === currValue} onClick={handleClick} />
}
export default ToggleButtonGroup