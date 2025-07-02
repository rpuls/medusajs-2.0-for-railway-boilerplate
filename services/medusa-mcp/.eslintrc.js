module.exports = {
    // parser: `@babel/eslint-parser`,
    parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
            experimentalDecorators: true
        },
        ecmaVersion: "latest",
        sourceType: "module"
    },
    plugins: ["file-progress", "prettier"],
    extends: [
        "eslint:recommended",
        "eslint-config-prettier",
        "google",
        "prettier"
    ],
    rules: {
        "no-use-before-define": "off",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-use-before-define": ["error"],
        // "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }],
        "file-progress/activate": 1,
        "prettier/prettier": [
            "error",
            {
                "endOfLine": "auto",
                "quoteProps": "consistent",
                "printWidth": 80,
                "editor.formatOnSave": true,
                "proseWrap": "always",
                "tabSize": 4,
                "tabWidth": 4,
                "requireConfig": false,
                "useTabs": false,
                "trailingComma": "none",
                "bracketSpacing": true,
                "jsxBracketSameLine": false,
                "semi": true
            },
            {
                usePrettierrc: true
            }
        ],
        "object-curly-spacing": [2, "always"],
        "quotes": [2, "double", { avoidEscape: true }],
        "curly": [2, "all"],
        "new-cap": "off",
        "require-jsdoc": "off",
        "semi": "error",
        "no-unused-expressions": "off",
        "camelcase": "off",
        "no-invalid-this": "off"
    },
    env: {
        es6: true,
        node: true,
        jest: true
    },
    ignorePatterns: ["**/reports", "**/dist", "**/coverage,**/*/*.js"],
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            plugins: ["@typescript-eslint/eslint-plugin"],
            extends: ["plugin:@typescript-eslint/recommended"],
            rules: {
                "valid-jsdoc": [
                    "error",
                    {
                        requireParamType: false,
                        requireReturnType: false,
                        prefer: {
                            arg: "param",
                            argument: "param",
                            class: "constructor",
                            return: "return",
                            virtual: "abstract"
                        }
                    }
                ],
                "@typescript-eslint/explicit-function-return-type": ["warn"],
                "@typescript-eslint/no-non-null-assertion": ["off"]
            }
        },
        {
            files: [
                "**/common/**/*.ts",
                "**/bin/**/*.ts",
                "**/api/**/*.ts",
                "**/medusa-js/**/resources/**/*.ts"
            ],
            rules: {
                "valid-jsdoc": ["off"]
            }
        },
        {
            // Medusa JS client
            files: ["**/medusa-js/**/resources/**/*.ts"],
            rules: {
                "valid-jsdoc": ["off"]
            }
        },
        {
            files: ["**/api/**/*.ts"],
            rules: {
                "valid-jsdoc": ["off"],
                "@typescript-eslint/explicit-function-return-type": ["off"],
                "@typescript-eslint/no-var-requires": ["off"]
            }
        }
    ]
};
