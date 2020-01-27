使用 docker-compose 部署开发环境，包含用于网站请求转发、数据库管理、邮件测试等容器。


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


## 配置文件


### 域名转发

每个项目对应一个 Nginx 配置文件 `./config/router/*.conf`，每个文件包含该项目所有域名的转发设定，比如

```
server {
    listen 80;
    server_name test.mine.com;

    location / {
        include proxy_params;
        proxy_pass http://test_web;
    }
}
```


### 数据库管理

通过 `./config/phpmyadmin/config.user.inc.php` 文件为 `phpmyadmin/phpmyadmin` 容器添加各项目的 MySQL 数据库信息，比如

```php
$cfg['Servers'][2]['auth_type'] = 'config';
$cfg['Servers'][2]['host'] = 'test_mysql';
$cfg['Servers'][2]['user'] = 'magento';
$cfg['Servers'][2]['password'] = 'magento';
```

