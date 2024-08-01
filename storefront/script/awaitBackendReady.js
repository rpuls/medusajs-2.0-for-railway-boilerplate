const nodefetch = require('node-fetch');

let startTime = Date.now();

const checkBackend = () => {
  const url = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000') + '/store/product-categories';
  console.log('Checking if the backend is ready on:', url);

  let elapsedTime = Math.floor((Date.now() - startTime) / 1000);

  if (elapsedTime > 1200) { // 20 minutes in seconds
    console.log('Timeout: Backend was not ready within 20 minutes.');
    process.exit(1); // Exit script with error
  }

  nodefetch(url)
    .then((res) => {
      if (res.status === 200) {
        console.log('Backend is ready!');
        process.exit(0); // Exit script successfully
      } else {
        console.log(`Waiting for a medusajs backend to be available on ${url}... Elapsed time: ${elapsedTime} seconds`);
        setTimeout(checkBackend, 5000); // Wait 5 seconds before retrying
      }
    })
    .catch((err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log(`Waiting for a medusajs backend to be available on ${url}... Elapsed time: ${elapsedTime} seconds`);
        setTimeout(checkBackend, 5000); // Wait 5 seconds before retrying
      } else {
        console.error('An unexpected error occurred:', err);
        process.exit(1); // Exit script with error
      }
    });
};

checkBackend();