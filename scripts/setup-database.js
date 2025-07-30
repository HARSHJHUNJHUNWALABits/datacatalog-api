#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script sets up the database and runs migrations for the RudderStack Data Catalog API.
 * It supports both PostgreSQL and SQLite databases.
 * 
 * Usage:
 *   node scripts/setup-database.js [--postgres] [--sqlite] [--env <environment>]
 * 
 * Examples:
 *   node scripts/setup-database.js --postgres
 *   node scripts/setup-database.js --sqlite --env development
 *   node scripts/setup-database.js --env production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(message) {
  log(`\n${colors.bright}${message}${colors.reset}`, 'cyan');
}

// Parse command line arguments
const args = process.argv.slice(2);
const usePostgres = args.includes('--postgres');
const useSqlite = args.includes('--sqlite');
const envIndex = args.indexOf('--env');
const environment = envIndex !== -1 ? args[envIndex + 1] : 'development';

// Determine database type
let databaseType = 'sqlite'; // default
if (usePostgres) {
  databaseType = 'postgres';
} else if (useSqlite) {
  databaseType = 'sqlite';
}

logStep('🚀 RudderStack Data Catalog API - Database Setup');
logInfo(`Environment: ${environment}`);
logInfo(`Database Type: ${databaseType}`);

// Check prerequisites
function checkPrerequisites() {
  logStep('Checking Prerequisites...');
  
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 16) {
      logError('Node.js 16+ is required');
      process.exit(1);
    }
    logSuccess(`Node.js version: ${nodeVersion}`);
    
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      logError('package.json not found. Please run this script from the project root.');
      process.exit(1);
    }
    logSuccess('Project structure verified');
    
    // Check if knexfile exists
    if (!fs.existsSync('knexfile.ts')) {
      logError('knexfile.ts not found. Please ensure Knex is properly configured.');
      process.exit(1);
    }
    logSuccess('Knex configuration found');
    
  } catch (error) {
    logError(`Prerequisites check failed: ${error.message}`);
    process.exit(1);
  }
}

// Install dependencies
function installDependencies() {
  logStep('Installing Dependencies...');
  
  try {
    logInfo('Installing npm dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Dependencies installed successfully');
  } catch (error) {
    logError(`Failed to install dependencies: ${error.message}`);
    process.exit(1);
  }
}

// Setup environment file
function setupEnvironment() {
  logStep('Setting up Environment Configuration...');
  
  try {
    const envExamplePath = path.join(process.cwd(), 'env.example');
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envExamplePath)) {
      logWarning('env.example not found, creating basic .env file...');
      const basicEnv = `# Database Configuration
DATABASE_URL=${databaseType === 'postgres' ? 'postgresql://localhost:5432/rudderstack_data_catalog' : './data/dev.sqlite3'}

# Server Configuration
PORT=3000
NODE_ENV=${environment}

# Logging
LOG_LEVEL=info

# API Configuration
API_BASE_PATH=/api/v1
`;
      fs.writeFileSync(envPath, basicEnv);
    } else {
      logInfo('Copying env.example to .env...');
      fs.copyFileSync(envExamplePath, envPath);
    }
    
    logSuccess('Environment configuration set up');
  } catch (error) {
    logError(`Failed to setup environment: ${error.message}`);
    process.exit(1);
  }
}

// Setup PostgreSQL database
function setupPostgres() {
  logStep('Setting up PostgreSQL Database...');
  
  try {
    // Check if PostgreSQL is installed
    try {
      execSync('psql --version', { stdio: 'pipe' });
    } catch (error) {
      logError('PostgreSQL is not installed or not in PATH');
      logInfo('Please install PostgreSQL and ensure psql is available in your PATH');
      logInfo('Visit: https://www.postgresql.org/download/');
      process.exit(1);
    }
    
    // Create database
    logInfo('Creating database...');
    try {
      execSync('createdb rudderstack_data_catalog', { stdio: 'pipe' });
      logSuccess('Database created successfully');
    } catch (error) {
      logWarning('Database might already exist, continuing...');
    }
    
    // Run migrations
    logInfo('Running database migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });
    logSuccess('Migrations completed successfully');
    
  } catch (error) {
    logError(`PostgreSQL setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Setup SQLite database
function setupSqlite() {
  logStep('Setting up SQLite Database...');
  
  try {
    // Create data directory
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logSuccess('Created data directory');
    }
    
    // Run migrations
    logInfo('Running database migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });
    logSuccess('Migrations completed successfully');
    
  } catch (error) {
    logError(`SQLite setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Verify setup
function verifySetup() {
  logStep('Verifying Setup...');
  
  try {
    // Check if database file exists (for SQLite)
    if (databaseType === 'sqlite') {
      const dbPath = path.join(process.cwd(), 'data', 'dev.sqlite3');
      if (fs.existsSync(dbPath)) {
        logSuccess('SQLite database file created');
      } else {
        logWarning('SQLite database file not found, but this might be normal');
      }
    }
    
    // Check if .env exists
    if (fs.existsSync('.env')) {
      logSuccess('Environment file configured');
    } else {
      logWarning('.env file not found');
    }
    
    // Check if node_modules exists
    if (fs.existsSync('node_modules')) {
      logSuccess('Dependencies installed');
    } else {
      logWarning('node_modules not found, run npm install');
    }
    
    logSuccess('Setup verification completed');
    
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
  }
}

// Display next steps
function displayNextSteps() {
  logStep('🎉 Setup Complete! Next Steps:');
  
  logInfo('1. Start the development server:');
  log('   npm run dev', 'bright');
  
  logInfo('2. Access the API documentation:');
  log('   http://localhost:3000/docs', 'bright');
  
  logInfo('3. Test the API:');
  log('   curl http://localhost:3000/api/v1/events', 'bright');
  
  logInfo('4. Run tests:');
  log('   npm test', 'bright');
  
  if (databaseType === 'postgres') {
    logInfo('5. PostgreSQL connection details:');
    log('   Host: localhost', 'bright');
    log('   Port: 5432', 'bright');
    log('   Database: rudderstack_data_catalog', 'bright');
  }
  
  logInfo('\n📚 For more information, see the README.md file');
}

// Main execution
async function main() {
  try {
    checkPrerequisites();
    installDependencies();
    setupEnvironment();
    
    if (databaseType === 'postgres') {
      setupPostgres();
    } else {
      setupSqlite();
    }
    
    verifySetup();
    displayNextSteps();
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  installDependencies,
  setupEnvironment,
  setupPostgres,
  setupSqlite,
  verifySetup
}; 