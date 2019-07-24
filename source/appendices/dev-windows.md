<br>
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

在本机 Windows（宿主机）下通过 Bash Shell 或 Docker Engine 执行如下指令，创建一个名为 dev 的 network 来连接几个容器：

```sh
$ docker network create --driver 'bridge' 'dev'
```

必须使用自建 network 才能在容器的配置文件中通过容器名来指定其他容器，否则只能通过 IP 指定。

要知道更多 network 相关信息，请移步 [https://docs.docker.com/network/network-tutorial-standalone/](https://docs.docker.com/network/network-tutorial-standalone/)。



### 基于 nginx 的请求转发容器

在宿主机执行如下指令，创建一个基于 nginx 的请求转发容器：

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
- *-p '0.0.0.0:80:80'* - 暴露容器的 80 端口到宿主机的 80 端口。<br>*这里用 0.0.0.0 而非 127.0.0.1 指代本机，否则通过 Docker Toolbox 安装的 Docker 会不生效*
- *-v 'D:\Docker\www\_config\webs:/etc/nginx/conf.d'* - 绑定容器的文件夹和宿主机文件夹，方便以后添加修改配置文件


### 自定义 web 容器

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

这时新建的文件夹包含 3 个文件，我们在这个目录下执行如下指令，创建一个自定义 web 镜像：

```sh
docker build -t web-php-7.2 .
```

生成容器

```sh
$ docker run -it \
--name 'web-php-7.2' \
--network 'dev' \
--restart 'on-failure' \
-p '0.0.0.0:2272:22' \
'web-php-7.2'
```


在容器内执行以下指令：

使用国内源
```sh
$ mv /etc/apt/sources.list /etc/apt/sources.list.bak; \
  echo 'deb http://mirrors.ustc.edu.cn/debian stretch main' >> /etc/apt/sources.list; \
  echo 'deb http://mirrors.ustc.edu.cn/debian-security stretch/updates main' >> /etc/apt/sources.list; \
  echo 'deb http://mirrors.ustc.edu.cn/debian stretch-updates main' >> /etc/apt/sources.list;
```

PHP 7.2
```sh
apt-get update; \
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

Nginx
```sh
$ apt-get -y install nginx; \
  /etc/init.d/nginx start;
```

SSH
```sh
$ apt-get -y install openssh-server; \
  sed -i 's/UsePAM yes/UsePAM no/g' /etc/ssh/sshd_config; \
  sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/g' /etc/ssh/sshd_config; \
  /etc/init.d/ssh start;
```

boot.sh
```sh
$ echo '#!/bin/sh' > /etc/init.d/boot.sh; \
  echo '/usr/local/sbin/php-fpm;' >> /etc/init.d/boot.sh; \
  echo '/etc/init.d/nginx start;' >> /etc/init.d/boot.sh; \
  echo '/etc/init.d/ssh start;' >> /etc/init.d/boot.sh; \
  echo '/bin/bash;' >> /etc/init.d/boot.sh;
```


## PHP 组件及依赖库列表

- libterm-ui-perl - Can't locate Term/ReadLine.pm in @INC (you may need to install the Term::ReadLine module)

| PHP | Reference | Debian Library | Compile |
| - | - | - | - |
| bcmath | https://www.php.net/manual/zh/book.bc.php | - | --enable-bcmath |
| ctype | https://www.php.net/manual/zh/book.ctype.php | - | - |
| curl | https://www.php.net/manual/zh/book.curl.php | libcurl4-openssl-dev | -with-curl |
| dom | https://www.php.net/manual/zh/book.dom.php | libxml2-dev | - |
| fpm | https://www.php.net/manual/zh/book.fpm.php | - | --enable-fpm <br>--with-fpm-user=www-data <br>--with-fpm-group=www-data |
| gd | https://www.php.net/manual/zh/book.image.php | libjpeg62-turbo-dev libpng-dev libxpm-dev libfreetype6-dev | --with-jpeg-dir<br>--with-png-dir<br>--with-zlib-dir<br>--with-freetype-dir<br>--enable-gd-native-ttf<br>--with-gd |
| hash | https://www.php.net/manual/zh/book.hash.php | - | - |
| iconv | https://www.php.net/manual/zh/book.iconv.php | - | - |
| intl | https://www.php.net/manual/zh/book.intl.php | libicu-dev | --enable-intl |
| mbstring | https://www.php.net/manual/zh/book.mbstring.php | - | --enable-mbstring |
| openssl | https://www.php.net/manual/zh/book.openssl.php | libssl-dev | --with-openssl |
| pdo_mysql | https://www.php.net/manual/zh/ref.pdo-mysql.php | - | --with-pdo-mysql |
| simplexml | https://www.php.net/manual/zh/book.simplexml.php | libxml2-dev | - |
| soap | https://www.php.net/manual/zh/book.soap.php | libxml2-dev | --enable-soap |
| spl | https://www.php.net/manual/zh/book.spl.php | - | - |
| xsl | https://www.php.net/manual/zh/book.xsl.php | libxml2-dev libxslt-dev | --with-xsl |
| zip | https://www.php.net/manual/zh/book.zip.php | libzip-dev | --with-libzip --enable-zip |
| libxml | https://www.php.net/manual/zh/book.libxml.php | libxml2-dev | - |
