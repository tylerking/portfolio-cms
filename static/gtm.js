;((w, d, id) => {
	if (/^\/admin(\/|$)/.test(w.location.pathname)) return
	if (['localhost', '127.0.0.1', '[::1]'].includes(w.location.hostname)) return
	w.dataLayer = w.dataLayer || []
	w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
	const script = d.createElement('script')
	script.async = true
	script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
	d.head.appendChild(script)
})(window, document, 'GTM-TGG4R456')
