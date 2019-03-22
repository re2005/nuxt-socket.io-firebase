module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    extends: [
        'plugin:vue/essential'
    ],
    plugins: [
        'vue'
    ],
    rules: {
        'semi': [
            2,
            'always'
        ],
        'indent': 'off',
        'space-before-function-paren': [
            'error', {'anonymous': 'ignore', 'named': 'never'}
        ],
        'generator-star-spacing': 'off',
        'no-mixed-operators': 'off',
        'vue/html-indent': 'off'
    }
};
