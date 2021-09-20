# 编码规范

Magento 2 有一套自己的编码规范：

https://devdocs.magento.com/guides/v2.4/coding-standards/bk-coding-standards.html

并提供了一个基于 [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer) 的检测工具：

https://devdocs.magento.com/marketplace/sellers/code-sniffer.html

执行如下指令安装工具：

```sh
composer create-project magento/magento-coding-standard --stability=dev magento-coding-standard
```

安装完成后会自动生成一个 magento-coding-standard 文件夹，进入这个文件夹后执行如下指令进行检测：

```sh
vendor/bin/phpcs \
  --standard=Magento2 \
  --error-severity=10 \
  --extensions=php,phtml,js \
  --exclude=Magento2.Legacy.Copyright,Magento2.Legacy.CopyrightAnotherExtensionsFiles \
  --report=full,summary \
  --ignore-annotations \
    <path-to-source>
```

以下是相关参数简述：

|参数|说明|
|---|---|
|`standard`|检测标准，这里固定为 Magento2|
|`error-severity`|错误级别|
|`extensions`|检测类型，以逗号分割|
|`exclude`|跳过的检测规则。如果不是为 Magento 贡献代码则跳过 copyright 规则|
|`report`|报告类型，以逗号分割。省略此项（或设置为 full）会列出完整的错误报告|
|`ignore-annotations`|跳过代码中注释为 phpcs: 的内容|
|`<path-to-source>`|需要检查的目录或文件的绝对路径|

以下是错误级别说明：

|类型|级别|描述|
|---|---|---|
|Error|10|严重问题，可能是 bug 或安全漏洞|
|Warning|9|可能导致出错的安全隐患|
|Warning|8|与 Magento 的编码规范或设计思想不符|
|Warning|7|一般代码问题|
|Warning|6|编码格式问题|
|Warning|5|PHPDoc 或注释的格式问题|

其他用法参考：

[https://github.com/squizlabs/PHP_CodeSniffer/wiki/Usage](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Usage)
[https://github.com/squizlabs/PHP_CodeSniffer/wiki/Advanced-Usage](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Advanced-Usage)
