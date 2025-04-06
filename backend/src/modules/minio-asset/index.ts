import { ModuleProviderExports } from '@medusajs/framework/types'
import MinioAssetService from './service'

const services = [MinioAssetService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport 