<script
	lang='ts'>
	import SocialLinks from '$lib/components/elements/SocialLinks'
	import Text from '$lib/components/elements/Text'
	import type { SiteSettings } from '$lib/types'
	import * as styles from './Footer.css'

	let { settings }: { settings: SiteSettings } = $props()
</script>

<footer
	class={styles.footer}>
	<div
		class={styles.inner}>
		<Text
			as='div'
			caps
			tone='muted'
			variant='machine'>{settings.footerText}</Text>
		<SocialLinks
			socials={settings.socials} />
	</div>
</footer>
