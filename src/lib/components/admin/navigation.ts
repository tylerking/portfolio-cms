type CollectionCount = 'approach' | 'cases' | 'exhibits' | 'projects' | 'skills'

export interface AdminLink {
	href: string
	label: string
	count?: CollectionCount
}

export const ADMIN_NAVIGATION: { title: string; links: AdminLink[] }[] = [
	{
		title: '',
		links: [
			{ href: '/admin', label: 'Dashboard' },
			{ href: '/admin/leads', label: 'Leads' }
		]
	},
	{
		title: 'Singletons',
		links: [
			{ href: '/admin/globals', label: 'Globals' },
			{ href: '/admin/home', label: 'Home' }
		]
	},
	{
		title: 'Collections',
		links: [
			{ href: '/admin/approach', label: 'Approach', count: 'approach' },
			{ href: '/admin/case-studies', label: 'Case Studies', count: 'cases' },
			{ href: '/admin/exhibits', label: 'Exhibits', count: 'exhibits' },
			{ href: '/admin/projects', label: 'Side Projects', count: 'projects' },
			{ href: '/admin/skills', label: 'Skills', count: 'skills' }
		]
	}
]
