const fetch = require('node-fetch');
const { spawn } = require('child_process');
const { setTimeout } = require('timers/promises');

const runCommand = (command, env) => {
  const [cmd, ...args] = command.split(' ');
  const childProcess = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env }
  });

  return new Promise((resolve, reject) => {
    childProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
        return;
      }
      resolve();
    });
  });
};

const delay = (ms) => setTimeout(ms);

const fetchApiKey = async (retries = 5) => {
  const url = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000') + '/key-exchange';
  console.log(`Attempting to fetch API key from: ${url}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      console.log(`Attempt ${attempt} - Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch API key: ${response.statusText}`);
      }
      
      const apiKey = await response.json();
      console.log('API key response:', apiKey);
      
      if (!apiKey || !apiKey.publishableApiKey) {
        throw new Error('Invalid API key format received');
      }
      
      return apiKey.publishableApiKey;
    } catch (error) {
      console.error(`Error fetching API key (Attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying in 3 seconds...`);
        await delay(3000);
      } else {
        console.error('All retry attempts exhausted. Unable to fetch API key.');
        return null;
      }
    }
  }
};

const init = async () => {
  const command = process.argv[2];
  if (!command || !['start', 'build'].includes(command)) {
    console.error('Please provide a valid command: "start" or "build".');
    process.exit(1);
  }

  let publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  console.log('Initial NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:', publishableKey);

  if (!publishableKey) {
    console.log('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not defined. Attempting to fetch...');
    publishableKey = await fetchApiKey();
    if (!publishableKey) {
      console.error('Failed to fetch API key after multiple attempts. Please ensure the backend is running and the key exchange endpoint is accessible.');
      process.exit(1);
    }
    console.log('API key fetched successfully.');
  } else {
    console.log('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is already set.');
  }

  const nextCommand = command === 'start' ? `next start -p ${process.env.PORT || '3000'}` : 'next build';
  console.log(`Running command: ${nextCommand}`);
  
  try {
    await runCommand(nextCommand, { NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: publishableKey });
    console.log(`Command "${nextCommand}" completed successfully.`);
  } catch (error) {
    console.error(`Error running command: ${error.message}`);
    process.exit(1);
  }
};

init();