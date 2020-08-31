module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    mocha: true,
    node: true,
  },
  rules: {
    'class-methods-use-this': ['off'],
  },
  parserOptions: {
    ecmaVersion: 2017, // ECMAScript 2017 (for async / await)
  },
};
