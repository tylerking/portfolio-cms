<script
	lang='ts'>
	import { picture } from '$lib/media'
	import * as styles from '$lib/styles/admin.css'

	let { imageKey }: { imageKey: string | null } = $props()

	const WIDTH = 960

	const thumbnail = $derived(imageKey ? picture(imageKey, WIDTH) : null)
</script>

{#if thumbnail}
	<img
		alt=''
		class={styles.figureThumb}
		decoding='async'
		height='1000'
		loading='lazy'
		sizes={styles.figureThumbSizes}
		src={thumbnail.src}
		srcset={thumbnail.srcset}
		width='1600' />
{:else}
	<div
		class={styles.figureThumb}></div>
{/if}
