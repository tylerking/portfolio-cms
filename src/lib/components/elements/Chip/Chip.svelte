<script
	lang='ts'>
	import type { RecipeVariants } from '@vanilla-extract/recipes'
	import type { Snippet } from 'svelte'
	import Text from '$lib/components/elements/Text'
	import { chip } from '$lib/styles/recipes.css'

	interface Props {
		size?: NonNullable<RecipeVariants<typeof chip>>['size']
		children: Snippet
	}

	let { size, children }: Props = $props()
</script>

<Text
	class={chip({ size })}
	variant='chip'>{@render children()}</Text>
