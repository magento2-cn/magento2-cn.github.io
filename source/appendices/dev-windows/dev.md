使用 docker-compose 部署开发环境，创建用于网站请求转发、数据库管理、邮件测试等功能的容器。


## Github 地址

[https://github.com/zengliwei/dev](https://github.com/zengliwei/dev)


## 部署内容

- `mysql:5.7` 容器
- `phpmyadmin/phpmyadmin` 容器，用于管理数据库
- `mailhog/mailhog` 容器，用于本地邮件测试
- 基于 `nginx:latest` 的自定义容器，用于域名转发
- 基于 `php:7.3-fpm` 的自定义容器，包含以下内容：
    - Xdebug - 用于 PHP 开发中的调试、追踪和分析
    - MSMTP - 用于转发测试邮件到 `mailhog/mailhog` 容器
    - Nginx - 用于处理页面请求
    - SSH - 用于执行 CLI 指令，及通过 SFTP 进行文件传输 
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

其中 test_web 为自定义 Web 容器的容器名。


### 数据库管理

通过 `./config/phpmyadmin/config.user.inc.php` 文件为 `phpmyadmin/phpmyadmin` 容器添加各项目的 MySQL 数据库信息，比如

```php
$cfg['Servers'][2]['auth_type'] = 'config';
$cfg['Servers'][2]['host'] = 'test_mysql';
$cfg['Servers'][2]['user'] = 'magento';
$cfg['Servers'][2]['password'] = 'magento';
```

其中 test_mysql 为 MySQL 容器的容器名。


## 部署步骤

- 下载文件到本地目录
- 保证 22 及 80 端口未被使用，否则须修改 **.env** 文件，指定要映射的端口
- 修改 **C:\Windows\System32\drivers\etc\hosts** 文件，添加域名映射：
    - 127.0.0.1  localhost
    - 127.0.0.1  db.localhost
    - 127.0.0.1  mail.localhost
- 执行 **start.cmd** 文件以生成自启动文件，创建并开启相关容器

