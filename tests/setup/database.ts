import { databaseUrl, resetDatabase } from './databases'

export default () => resetDatabase(databaseUrl('_test'))
