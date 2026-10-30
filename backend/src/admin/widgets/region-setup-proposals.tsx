import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { SetupProposals } from '../components/setup-proposals'

/**
 * Store setup an AI assistant proposed, on the regions list, where an admin looks when they
 * think about where the store sells. Renders nothing when there is nothing to review.
 */
const RegionSetupProposals = () => <SetupProposals hideWhenEmpty reloadOnApply />

export const config = defineWidgetConfig({
  zone: 'region.list.before',
})

export default RegionSetupProposals
