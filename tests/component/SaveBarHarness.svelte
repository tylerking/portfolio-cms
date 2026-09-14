<script
	lang='ts'>
	import SaveBar from '$lib/components/admin/SaveBar'

	let { result, snapshot }: { result?: { success?: boolean; message?: string; field?: string } | null; snapshot?: string } =
		$props()
</script>

<form
	id='editor'>
	<label
		for='title'>Title</label>
	<input
		id='title'
		name='title' />
</form>
<form
	id='media'>
	<label
		for='caption'>Caption</label>
	<input
		id='caption'
		name='caption' />
</form>
<SaveBar
	form='editor'
	label='Save Details'
	{result}
	{snapshot} />
