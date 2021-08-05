# eslint-plugin-i18n2

[![NPM version](https://img.shields.io/npm/v/eslint-plugin-i18n2.svg?style=flat)](https://npmjs.org/package/eslint-plugin-i18n2)
[![NPM downloads](http://img.shields.io/npm/dm/eslint-plugin-i18n2.svg?style=flat)](https://npmjs.org/package/eslint-plugin-i18n2)
<!-- [![Build Status](https://img.shields.io/travis/imhele/eslint-plugin-i18n2.svg?style=flat)](https://travis-ci.org/imhele/eslint-plugin-i18n2) -->
<!-- [![Coverage Status](https://coveralls.io/repos/github/imhele/eslint-plugin-i18n2/badge.svg?branch=master)](https://coveralls.io/github/imhele/eslint-plugin-i18n2?branch=master) -->
[![License](https://img.shields.io/npm/l/eslint-plugin-i18n2.svg)](https://npmjs.org/package/eslint-plugin-i18n2)

## Usage 用法

如果你对 ESLint 插件并不熟悉，请参考 [Configuring Plugins](https://eslint.org/docs/user-guide/configuring/plugins#configuring-plugins) 。

> If you are not familiar with ESLint plug-ins, please refer to [Configuring Plugins](https://eslint.org/docs/user-guide/configuring/plugins#configuring-plugins).

1. 使用 i18n 推荐的配置：

> Use i18n recommended configuration:

```json
{
  "extends": ["plugin:i18n2/recommended"]
}
```

2. 自定义启用的规则以及错误等级：

> Customize the enabled rules and error levels:

```json
{
  "plugins": ["i18n2"],
  "rules": {
    "i18n2/no-top-level-translation": "error",
    "i18n2/no-untranslated-literal": "error"
  }
}
```

## Settings 配置

在 .eslintrc.json 等配置文件中可设置 i18n2 插件的公共配置，所有规则都会共享此配置。

> The sharing settings of the i18n2 plug-in can be set in configuration files such as .eslintrc.json, and all rules will share these settings.

```json
{
  "extends": ["plugin:i18n2/recommended"],
  "settings": {
    "i18n2": {
      "translator": ["*.t.*", "*.i18n.t"],
      "translatorSourceModule": "esm",
      "untranslatedChars": "[^\\x00-\\x7F]"
    }
  }
}
```
