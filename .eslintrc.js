module.exports = {
  "plugins": ["mocha"],
  "env": {
	   "node": true,
      "commonjs": true,
      "es6": true,
	     "mocha": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-console": [
      "error",
      { allow: ["info", "warn", "error"] }
    ],
    "no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ]
  }
};
