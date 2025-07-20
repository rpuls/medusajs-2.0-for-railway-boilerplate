// import { checkPaymentsJob } from 'medusa-payment-solana';
const checkPaymentsJob = ()=> {
  // This function is a placeholder for the actual job logic.
  console.log('Checking Solana payments...');
};

export default checkPaymentsJob;

export const config = {
  name: 'check-solana-payments',
  schedule: '*/1 * * * *', // Runs every 1 minutes
};
