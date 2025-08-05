import { checkPaymentsJob } from 'medusa-payment-solana/job';

// Export the job function
export default checkPaymentsJob;

// Configure the job schedule (Recommended, every minute)
export const config = {
  name: "check-solana-payments",
  schedule: "*/1 * * * *",
};
