export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        browser: "readonly",
        chrome: "readonly",
        window: "readonly",
        document: "readonly",
        console: "readonly",
        parseInt: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        setTimeout: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off"
    }
  }
];
