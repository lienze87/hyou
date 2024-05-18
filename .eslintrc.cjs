module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-shadow": "off",
    "no-param-reassign": ["error", { props: false }],
    "no-console": "off",
    "no-plusplus": [
      "error",
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    "react/display-name": "off",
    "import/no-cycle": "off", // TODO: remove
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/order": "off",
    "import/prefer-default-export": "off",
    // 关闭variable必须全部大写规则
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        modifiers: ["const"],
        format: null,
      },
    ],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
};
