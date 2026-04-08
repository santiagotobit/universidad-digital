// Cypress configuration in CommonJS format to avoid ESM loading issues.

const dotenv = require('dotenv');
dotenv.config({ path: '.env.cypress' });

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
const APP_BASE_URL = process.env.CYPRESS_BASE_URL || 'http://localhost:3000';

module.exports = {
  projectId: 'universidad-digital-e2e',
  e2e: {
    baseUrl: APP_BASE_URL,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      config.env = {
        apiBaseUrl: API_BASE_URL,
        appBaseUrl: APP_BASE_URL,
        testUserEmail: process.env.TEST_USER_EMAIL || 'admin@ud.edu',
        testUserPassword: process.env.TEST_USER_PASSWORD || 'AdminPass1234',
        validationTimeout: 8000,
        apiTimeout: 10000,
        uiTimeout: 6000,
      };
      return config;
    },
    // Aumentar timeouts para desarrollo local
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
  },
  component: {
    devServer: { framework: 'react', bundler: 'vite' },
    specPattern: 'src/**/*.cy.ts',
    supportFile: 'cypress/support/component.ts',
  },
  defaultCommandTimeout: 8000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  execTimeout: 60000,
  taskTimeout: 60000,
  pageLoadTimeout: 30000,
  chromeWebSecurity: false,
  retries: { runMode: 1, openMode: 0 },
  video: true,
  videoCompression: 32,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: false,
  reporter: 'spec',
  reporterOptions: { mochaFile: 'cypress/results/junit-result.xml' },
  viewportWidth: 1280,
  viewportHeight: 720,
  fileServerFolder: '.',
  fixturesFolder: 'cypress/fixtures',
  downloadsFolder: 'cypress/downloads',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
};
