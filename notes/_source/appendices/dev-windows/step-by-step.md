# Magento 开发环境构建

Windows 环境下运行 Magento 2 站点速度感人，这对习惯使用 Windows 系统的 Magento 2 开发人员来说简直是折磨。现在，通过 Docker 部署本地开发环境可以完美解决这个问题。

Docker 是一个基于虚拟化技术的环境部署工具。为了完全读懂本文，我们需要先对它的使用有基本认识：
- Windows 下的安装 - [https://docs.docker.com/docker-for-windows/install/](https://docs.docker.com/docker-for-windows/install/)
- Docker 入门 - [https://docs.docker.com/get-started/](https://docs.docker.com/get-started/)

按照本文的步骤，你最终可以得到由以下几个容器组成的开发环境：
- 一个基于 nginx 的请求转发容器
- 一个包含 php 7.2 和 nginx 的自定义 web 容器
- 一个 mysql:5.7 容器
- 一个 redis 容器


## 环境构建步骤


### 创建 network

在本机 Windows（宿主机）下通过 Bash Shell 或 Docker Engine 执行如下指令，创建一个名为 `dev` 的 network 来连接几个容器：

```sh
$ docker network create --driver 'bridge' 'dev'
```

必须使用自建 network 才能在容器的配置文件中通过容器名来指定其他容器，否则只能通过 IP 指定。

要知道更多 network 相关信息，请移步 [https://docs.docker.com/network/network-tutorial-standalone/](https://docs.docker.com/network/network-tutorial-standalone/)。


### 将 Docker 源更换为国内源


在创建容器前，先将 Docker 源更换为国内源以提升镜像下载速度。

使用 Docker Desktop for Windows 的用户可以通过 Hyper-V 管理器访问虚拟机；使用 Docker Toolbox 的用户可以通过 docker-machine 命令访问虚拟机：

```sh
$ docker-machine ssh default
```

修改或添加虚拟机的 `/etc/docker/daemon.json` 文件，加入镜像地址后重启 Docker：

```json
{
    "registry-mirrors": [
        "http://hub-mirror.c.163.com",
        "https://docker.mirrors.ustc.edu.cn"
    ]
}
```


### 自定义 web 容器

考虑到国内访问官方镜像库的速度有点不太靠谱，没将自定义容器做成镜像发布，下边提供容器制作步骤。


#### 容器外的准备


在宿主机新建一个空文件夹，下载 php 7.2 安装包（[https://www.php.net/distributions/php-7.2.20.tar.gz](https://www.php.net/distributions/php-7.2.20.tar.gz)）到这个文件夹，并新建如下两个文件：

**boot.sh** 内容如下：
```sh
#!/bin/sh
/bin/bash;
```

**Dockerfile** 内容如下：
```
FROM debian:stretch-slim
COPY php-7.2.20.tar.gz /usr/local/src
COPY boot.sh /etc/init.d/boot.sh
CMD /bin/bash /etc/init.d/boot.sh
```

这时新建的文件夹包含 3 个文件，我们在这个目录下执行如下指令，创建一个名为 web-php-7.2 的自定义镜像：

```sh
$ docker build -t web-php:7.2 .
```

再执行如下指令，生成一个基于自定义镜像的名为 `php72` 的容器：

```sh
$ docker run -it \
  --name 'php72' \
  --network 'dev' \
  --restart 'on-failure' \
  -p '0.0.0.0:2272:22' \
  'web-php:7.2'
```

以下是各参数的作用：
- *--name 'php72'* - 指定容器名为 `php72`
- *--network 'dev'* - 连接名为 `dev` 的 network
- *--restart 'on-failure'* - 意外关闭后自动重启
- *-p '0.0.0.0:2272:22'* - 暴露容器的 22 端口到宿主机的 2272 端口，方便以后使用 SSH/SFTP 访问容器而无需通过 Docker 指令。<br />*这里用 0.0.0.0 而非 127.0.0.1 指代本机，否则在通过 Docker Toolbox 安装的 Docker 中，这项参数会不生效*


**注意：创建这个容器的时候，千万不要为了方便日后直接修改代码而绑定容器的文件夹与宿主机文件夹！否则完成部署后，网站的运行速度还不如直接上 WAMP。**<br />



#### 容器里的操作


上述指令执行成功的话，我们已经进入容器内部了，在容器中执行下边的指令来安装开发环境。


修改 apt 源地址，改为使用国内源：

```sh
$ mv /etc/apt/sources.list /etc/apt/sources.list.bak; \
  echo 'deb http://mirrors.ustc.edu.cn/debian stretch main' >> /etc/apt/sources.list; \
  echo 'deb http://mirrors.ustc.edu.cn/debian-security stretch/updates main' >> /etc/apt/sources.list; \
  echo 'deb http://mirrors.ustc.edu.cn/debian stretch-updates main' >> /etc/apt/sources.list;
```

还可以试下这些：

- 网易开源镜像<br />http://mirrors.163.com/debian/<br />http://mirrors.163.com/debian-security/
- 搜狐开源镜像<br />http://mirrors.sohu.com/debian/<br />http://mirrors.sohu.com/debian-security/
- 清华 TUNA<br />http://mirror.tuna.tsinghua.edu.cn/debian/<br />http://mirror.tuna.tsinghua.edu.cn/debian-security/

安装 PHP 7.2、PHP-FPM 以及 [Magento 2.3 所需插件](https://devdocs.magento.com/guides/v2.3/install-gde/system-requirements-tech.html)：

```sh
$ apt-get update; \
  apt-get -y upgrade; \
  apt-get -y install \
    gcc g++ make \
    libterm-ui-perl \
    libcurl4-openssl-dev \
    libjpeg62-turbo-dev libpng-dev libxpm-dev libfreetype6-dev \
    libicu-dev \
    libssl-dev \
    libxml2-dev \
    libxslt-dev \
    libzip-dev; \

  ln -s /usr/lib/x86_64-linux-gnu/libssl.so /usr/lib; \
  ln -s /usr/include/x86_64-linux-gnu/curl /usr/include/curl; \

  tar zxvf /usr/local/src/php-7.2.20.tar.gz -C /usr/local/src; \
  mkdir /usr/local/etc/php; \
  mkdir /usr/local/etc/php/conf.d; \
  cd /usr/local/src/php-7.2.20; \
  cp ./php.ini-development /usr/local/etc/php/php.ini; \
  ./configure \
    --build=x86_64-linux-gnu \
    --with-config-file-path=/usr/local/etc/php \
    --with-config-file-scan-dir=/usr/local/etc/php/conf.d \
    --enable-bcmath \
    -with-curl \
    --enable-fpm --with-fpm-user=www-data --with-fpm-group=www-data --disable-cgi \
    --with-jpeg-dir --with-png-dir --with-zlib-dir --with-freetype-dir --enable-gd-native-ttf --with-gd \
    --enable-intl \
    --enable-mbstring \
    --with-openssl \
    --with-pdo-mysql \
    --enable-soap \
    --with-xsl \
    --with-libzip --enable-zip \
    build_alias=x86_64-linux-gnu; \
  make; \
  make install; \

  cp /usr/local/etc/php-fpm.conf.default /usr/local/etc/php-fpm.conf; \
  sed -i 's!=NONE/!=!g' /usr/local/etc/php-fpm.conf; \
  cp /usr/local/etc/php-fpm.d/www.conf.default /usr/local/etc/php-fpm.d/www.conf; \
  /usr/local/sbin/php-fpm;
```


安装 Nginx：

```sh
$ apt-get -y install nginx; \
  /etc/init.d/nginx start;
```

安装 SSH：

```sh
$ apt-get -y install openssh-server; \
  sed -i 's/UsePAM yes/UsePAM no/g' /etc/ssh/sshd_config; \
  sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/g' /etc/ssh/sshd_config; \
  /etc/init.d/ssh start;
```

设置用户密码：

```sh
$ passwd root
```


容器内的 Linux 系统不会随容器的开启而启动守护进程，只能通过镜像的最后一个 CMD 命令来启动。由于我们有多个服务要启用，因此将它们全部写到一个脚本里执行，修改 boot.sh：

```sh
$ echo '#!/bin/sh' > /etc/init.d/boot.sh; \
  echo '/usr/local/sbin/php-fpm;' >> /etc/init.d/boot.sh; \
  echo '/etc/init.d/nginx start;' >> /etc/init.d/boot.sh; \
  echo '/etc/init.d/ssh start;' >> /etc/init.d/boot.sh; \
  echo '/bin/bash;' >> /etc/init.d/boot.sh;
```

这里的最后一个指令 `/bin/bash` 是为了保持容器在服务启动完毕后不会自动关闭而加入的，不能删除。


### 基于 nginx 的请求转发容器

在宿主机创建一个新文件夹，比如 D:\Docker\www\_config\webs，在里边创建一个 nginx 配置文件：

**default.conf**

```
upstream php {
    server php72:80;
}

server {
    listen 80 default_server;
    server_name _;
    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass  http://php;
    }
}
```

在宿主机执行如下指令，创建一个基于 nginx 的名为 `web` 的请求转发容器：

```sh
$ docker run -d \
  --name 'web' \
  --network 'dev' \
  --restart 'on-failure' \
  -p '0.0.0.0:80:80' \
  -v 'D:\Docker\www\_config\webs:/etc/nginx/conf.d' \
  'nginx'
```

这个容器的作用是转发浏览器请求到不同的自定义 web 容器，这样我们就可以同时拥有多个不同版本的 php 开发环境。

以下是各参数的作用：
- *--name 'web'* - 指定容器名为 web
- *--network 'dev'* - 连接名为 dev 的 network
- *--restart 'on-failure'* - 意外关闭后自动重启
- *-p '0.0.0.0:80:80'* - 暴露容器的 80 端口到宿主机的 80 端口。<br />*这里用 0.0.0.0 而非 127.0.0.1 指代本机，否则在通过 Docker Toolbox 安装的 Docker 中，这项参数会不生效*
- *-v 'D:\Docker\www\_config\webs:/etc/nginx/conf.d'* - 绑定容器的配置文件夹和宿主机文件夹，方便以后添加修改配置文件


在宿主机执行以下指令，将配置文件更新到容器中，注意不要将这个文件放到绑定的配置文件夹里：

```sh
$ docker cp nginx.conf web:/etc/nginx/nginx.conf
```

**nginx.conf**

```
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include /etc/nginx/conf.d/*.conf;
}
```


在宿主机执行以下指令，重启 Nginx 以更新设置：

```sh
$ docker exec -it web service nginx reload
```


### MySQL 容器


在宿主机执行以下指令，创建一个基于 mysql:5.7 的名为 `mysql` 的 MySQL 服务容器：

```sh
$ docker run -d \
  --name 'mysql' \
  --network 'dev' \
  --restart 'on-failure' \
  -e 'MYSQL_ROOT_PASSWORD=root' \
  'mysql:5.7'
```


成功后可通过以下指令访问容器，通过输入 MySQL 命令管理数据库：

```sh
$ docker run -it --rm \
  --network 'dev' \
  'mysql:5.7' \
  mysql -h mysql -u root -p
```


### Redis 容器


在宿主机执行以下指令，创建一个基于 redis 的名为 `redis` 的容器：

```sh
$ docker run -d \
  --name 'redis' \
  --network 'dev' \
  --restart 'on-failure' \
  'redis'
```

成功后可通过以下指令访问容器，通过输入 redis 命令管理数据库：

```sh
$ docker run -it --rm \
  --network 'dev' \
  'redis' \
  redis-cli -h redis
```
