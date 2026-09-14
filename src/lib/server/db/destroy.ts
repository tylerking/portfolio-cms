import { deleteImages } from '../media/blobs'
import { caseStudies, projects } from './collections'

export async function destroyProject(id: number): Promise<void> {
	const current = await projects.get(id)
	await projects.remove(id)
	await deleteImages([current?.coverKey])
}

export async function destroyCaseStudy(id: number): Promise<void> {
	const current = await caseStudies.get(id)
	await caseStudies.remove(id)
	await deleteImages([current?.coverKey, ...(current?.figures.map((figure) => figure.key) ?? [])])
}
