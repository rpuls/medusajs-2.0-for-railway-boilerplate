import { checkPaymentsJob } from 'medusa-payment-solana';

export default checkPaymentsJob;

export const config = {
  name: 'check-solana-payments',
  schedule: '*/1 * * * *', // Runs every 1 minutes
};
