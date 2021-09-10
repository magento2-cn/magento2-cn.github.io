# 常用命令及参数

## Magento 命令

以下命令须在站点根目录下执行：

### 清空主题文件

```sh
rm -rf pub/static/*
rm -rf var/view_preprocessed/*
```


### 开启维护模式，清空所有临时文件

```sh
php bin/magento maintenance:enable
```

```sh
rm -rf generated/*
rm -rf pub/static/*
rm -rf var/di
rm -rf var/generation
rm -rf var/view_preprocessed
rm -rf var/cache
rm -rf var/page_cache
```

```sh
chown -R www-data:www-data ./generated
chown -R www-data:www-data ./var
```


### 更新组件数据库，并开启产品模式（自动部署）

```
rm -rf pub/static/*

php bin/magento deploy:mode:set production -vvv
php bin/magento setup:upgrade --keep-generated

```


### 开启产品模式（手动分步部署）

```
php bin/magento maintenance:enable

rm -rf generated/*
rm -rf pub/static/*
rm -rf var/cache/*
rm -rf var/di/*
rm -rf var/view_preprocessed/*

php bin/magento setup:di:compile
php bin/magento setup:static-content:deploy zh_Hant_HK en_US zh_Hans_CN
php bin/magento deploy:mode:set production --skip-compilation
php bin/magento setup:upgrade --keep-generated
php bin/magento maintenance:disable

```


### 更新静态文件（无需开启维护模式）

```sh
rm -rf var/view_preprocessed/*

php bin/magento cache:flush
php bin/magento setup:static-content:deploy zh_Hant_HK en_US zh_Hans_CN

```

```sh
find ./pub/static/ -name '*.css' -print|xargs rm -rf
```

## Linux 命令


### 文件用户组及权限

```sh
chown -R www-data:www-data .
```

```sh
chown -R apache:apache .
```

```sh
find ./ -type f -print|xargs chmod 644;
find ./ -type d -print|xargs chmod 755;
```

```sh
find ./ -type f -print|xargs chmod 664;
find ./ -type d -print|xargs chmod 775;
```


### 打包及解压

.tar
```
解包：tar xvf FileName.tar
打包：tar cvf FileName.tar DirName
```

.tar.gz 和 .tgz

解压：
```
tar zxvf FileName.tar.gz
```
压缩：
```
tar zcvf FileName.tar.gz \
  --exclude=app/etc/env.php \
  --exclude=generated \
  --exclude=pub/media \
  --exclude=pub/static \
  --exclude=var \
  .
```

.zip
```
解压：unzip FileName.zip
压缩：zip FileName.zip DirName
```

.bz2
```
解压：bzip2 -d FileName.bz2
解压：tar -xjvf xxx.bz2
压缩：bzip2 -z FileName
```


### 导出 GIT 文件

最后一次提交修改的文件

```bash
git archive --output=latest.tar HEAD \
  $(git diff-tree -r --no-commit-id --name-only --diff-filter=ACMRT HEAD^)
```

指定版本与最后一次提交相异的文件

```bash
git archive --output=latest.tar HEAD \
  $(git diff-tree -r --no-commit-id --name-only --diff-filter=ACMRT OLD_COMMIT_ID HEAD)
```

指定的两个版本间相异的文件

```bash
git archive --output=latest.tar COMMIT_ID_2 \
  $(git diff-tree -r --no-commit-id --name-only --diff-filter=ACMRT COMMIT_ID_1 COMMIT_ID_2)
```


### 在 GIT 中忽略本地文件

```sh
git update-index --skip-worktree path/to/file
```


## 数据库指令

### 访问数据库

```sh
mysql --default-character-set utf8 -u root -p
```

### 导入数据

```sql
use `magento`;
set FOREIGN_KEY_CHECKS = 0;
source database_source_file.sql;
```

### 导出数据

```sh
mysqldump -h localhost -u root -p magento > database_source_file.sql
```
