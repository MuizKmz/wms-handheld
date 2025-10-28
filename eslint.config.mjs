import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import globals from "globals";

export default [
    js.configs.recommended,
    ...vue.configs["flat/essential"],
    // {files: ["**/*.{js,mjs,cjs,vue}"]},
    {
        files: ['**/*.js', '**/*.vue'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                uni: 'readonly',
                plus: 'readonly',
                wx: 'readonly',
                webUni: 'readonly',
                process: 'readonly',
                getCurrentPages: 'readonly',
            },
        },
        plugins: {
            vue,
        },
        rules: {
            'vue/no-multiple-template-root': 'off',
            'vue/html-self-closing': 'off',
            eqeqeq: [
                'warn',
                'always',
                {null: 'ignore'},
            ],
            semi: ['error', 'never'],
            // "no-unused-vars": "off",
            'no-async-promise-executor': 'off',
            'no-extra-semi': 'warn',
            'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            'space-before-function-paren': [
                'error',
                {
                    anonymous: 'never',
                    named: 'never',
                    asyncArrow: 'always',
                },
            ],
            // quotes: 'off',
            quotes: ['error', 'single'],
        },
    },
    {languageOptions: {globals: globals.browser}},
    {ignores: ['dist/', 'node_modules/', 'unpackage/', 'eslint.config.mjs', 'vite.config.js', 'vue.config.js']},

];