## Github 地址

[https://github.com/zengliwei/dev](https://github.com/zengliwei/dev)


## 部署内容

- `mysql:5.7` 容器
- `phpmyadmin/phpmyadmin` 容器，用于管理数据库
- `mailhog/mailhog` 容器，用于本地邮件测试
- 基于 `nginx:latest` 的自定义容器，用于域名转发
- 基于 `php:7.3-fpm` 的自定义容器，包含以下内容：
    - MSMTP 用于转发测试邮件到 `mailhog/mailhog` 容器
    - Nginx 用于处理页面请求
    - SSH 用于执行 CLI 指令，及通过 SFTP 进行文件传输 
- 名为 dev_net 的 network
