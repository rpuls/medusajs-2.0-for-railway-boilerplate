import checkPaymentsJob from '../modules/medusa-payment-solana/src/jobs/check-payment'

export default checkPaymentsJob

export const config = {
  name: 'check-solana-payments',
  schedule: '*/1 * * * *', // Runs every 1 minutes
}