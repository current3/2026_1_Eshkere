export default [
  {
    files: ["assets/js/**/*.js", "components/**/*.js", "layouts/**/*.js", "pages/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        location: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        URLSearchParams: "readonly",
        Handlebars: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
];
