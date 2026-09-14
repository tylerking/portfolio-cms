import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import WithLabels from './WithLabels.svelte'

export const renderWithLabels = <ComponentProps extends Record<string, unknown>>(
	component: Component<ComponentProps>,
	props: ComponentProps
) => render(WithLabels<ComponentProps>, { props: { component, props } })
