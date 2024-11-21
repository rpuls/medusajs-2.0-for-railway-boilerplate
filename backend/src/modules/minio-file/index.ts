import { ModuleProviderExports } from '@medusajs/types'
import MinioFileProviderService from './service'

const services = [MinioFileProviderService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
