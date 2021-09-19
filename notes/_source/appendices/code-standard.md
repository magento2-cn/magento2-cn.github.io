# 编码规范

Magento 2 有一套自己的编码规范：

https://devdocs.magento.com/guides/v2.4/coding-standards/bk-coding-standards.html

并对提交到其 Marketplace 的组件提供了一个检测工具：

https://devdocs.magento.com/marketplace/sellers/code-sniffer.html

在项目目录之外执行如下指令可以安装工具：

```sh
composer create-project magento/magento-coding-standard --stability=dev magento-coding-standard
```

安装完成后会自动生成一个 magento-coding-standard 文件夹，进入这个文件夹后执行如下指令可以进行检测：

```sh
vendor/bin/phpcs <path-to-extension> \
  --standard=Magento2 \
  --error-severity=10 \
  --extensions=php,phtml \
  --exclude=Magento2.Legacy.Copyright,Magento2.Legacy.CopyrightAnotherExtensionsFiles \
  --ignore-annotations
```

其中 `<path-to-extension>` 是需要检查的组件目录或指定文件的绝对路径。
