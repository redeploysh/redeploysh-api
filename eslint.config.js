const stylisticJs = require('@stylistic/eslint-plugin-js')

module.exports = {
    plugins: {
        '@stylistic/js': stylisticJs
    },
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
            ecmaVersion: 8
        }
    },
    rules: {
        '@stylistic/js/no-var-requires': 0,
        '@stylistic/js/indent': [
            "error",
            4
        ],
        '@stylistic/js/array-bracket-spacing': ['error', 'never'],
        '@stylistic/js/arrow-parens': ['error', 'as-needed', { 'requireForBlockBody': true }],
        '@stylistic/js/brace-style': ['error', '1tbs'],
        '@stylistic/js/computed-property-spacing': ['error', 'never'],
        '@stylistic/js/function-call-spacing': ['error', 'never'],
        '@stylistic/js/no-trailing-spaces': ['error'],
        '@stylistic/js/space-before-function-paren': ['error', {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always"
        }],
        '@stylistic/js/space-before-blocks': ['error', 'always'],
        '@stylistic/js/semi': ['error', 'never'],
        '@stylistic/js/no-multi-spaces': 'error',
        '@stylistic/js/object-curly-spacing': ['error', 'always', { 'arraysInObjects': false }],
        '@stylistic/js/keyword-spacing': ['error', { 'before': true, 'after': true }],
        '@stylistic/js/computed-property-spacing': ["error", "never"],
        '@stylistic/js/key-spacing': ["error"],
        '@stylistic/js/template-curly-spacing': ["error", "never"],
        '@stylistic/js/no-mixed-spaces-and-tabs': ["error"],
        '@stylistic/js/no-tabs': ["error", { 'allowIndentationTabs': true }],
        '@stylistic/js/space-infix-ops': ["error"],
        '@stylistic/js/space-unary-ops': ["error"],
        '@stylistic/js/space-in-parens': ["error", "never"]
    }
}
