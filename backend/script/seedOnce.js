// /script/seedOnce.js
require('dotenv').config();
const axios = require('axios');
const { exec } = require('child_process');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const checkIfSeeded = async () => {
  try {
    await client.connect();
    await client.query('SELECT 1 FROM "user" LIMIT 1;');
    return true;
  } catch (error) {
    if (error.message.includes('relation "user" does not exist')) {
      return false;
    }
    console.error('Unexpected error checking if database is seeded:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      resolve();
    });
  });
};

const seedDatabase = async () => {
  try {
    console.log('Running migrations...');
    await runCommand('npx medusa migrations run');
    
    console.log('Running link sync...');
    await runCommand('npx medusa links sync');
    
    console.log('Running seed script...');
    await runCommand('npm run seed');
    
    const adminEmail = process.env.MEDUSA_ADMIN_EMAIL;
    const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      console.log('Creating admin user...');
      await runCommand(`npx medusa user -e "${adminEmail}" -p "${adminPassword}"`);
    }
    
    console.log('Database seeded and admin user created successfully.');
    return;
    
  } catch (error) {
    console.error('Failed to seed database or create admin user:', error);
    process.exit(1);
  }
};

const seedOnce = async () => {
  const isSeeded = await checkIfSeeded();
  if (!isSeeded) {
    console.log('Database is not seeded. Seeding now...');
    await seedDatabase();
  } else {
    console.log('Database is already seeded. Skipping seeding.');
  }
};

const reportDeploy = async () => {
  const url = process.env.TEMPLATE_REPORTER_URL;
  if (!url) {
    return;
  }
  const projectId = process.env.RAILWAY_PROJECT_ID;
  const templateId = 'medusa-2.0';
  const payload = { projectId, templateId };
  try {
      const response = await axios.post(`${url}/api/projectDeployed`, payload);
  } catch (error) {
      console.error(`An error occurred: ${error.message}`);
  }
};

seedOnce();
reportDeploy();