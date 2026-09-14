declare global {
	namespace App {
		interface Error {
			message: string
			id?: string
		}
		interface Locals {
			admin: boolean
		}
	}
}

export {}
