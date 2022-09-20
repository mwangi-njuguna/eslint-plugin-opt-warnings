# eslint-plugin-opt-warnings

Downgrade errors to warning optionally when extending a config.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-opt-warnings`:

```sh
npm install eslint-plugin-opt-warnings --save-dev
```

## Usage

Add `opt-warnings` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "opt-warnings"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "opt-warnings/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here


