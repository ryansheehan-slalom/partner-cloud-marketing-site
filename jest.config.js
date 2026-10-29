const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    ...jestConfig.moduleNameMapper,
    "^@salesforce/community/basePath$":
      "<rootDir>/jest-mocks/salesforce/community/basePath",
    // CSS-only shared module (imported via @import "c/pcStyles")
    "^c/pcStyles$": "<rootDir>/force-app/main/default/lwc/pcStyles/pcStyles.css"
  },
  modulePathIgnorePatterns: ["<rootDir>/.localdevserver"]
};
