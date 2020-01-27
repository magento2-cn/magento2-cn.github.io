使用 docker-compose 为每个项目部署开发所需的容器，这基于[本地开发框架](appendices/dev-windows/dev.html)。

## Github 地址

- [Magento 1.9](https://github.com/zengliwei/dev-magento/tree/1.9-dev)
- [Magento 2.1 简化版](https://github.com/zengliwei/dev-magento/tree/2.1-dev)
- [Magento 2.1 完整版](https://github.com/zengliwei/dev-magento/tree/2.1-dev-full)
- [Magento 2.2 简化版](https://github.com/zengliwei/dev-magento/tree/2.2-dev)
- [Magento 2.2 完整版](https://github.com/zengliwei/dev-magento/tree/2.2-dev-full)
- [Magento 2.3 简化版](https://github.com/zengliwei/dev-magento/tree/2.3-dev)
- [Magento 2.3 完整版](https://github.com/zengliwei/dev-magento/tree/2.3-dev-full)


## 部署内容

### 简化版

这个版本包含三个容器：

- `mysql:5.7` 容器
- `redis:latest` 容器
- 自定义 Web 容器


### 完整版

完整版是在简化版基础上添加了：

- `elasticsearch:6.8.6`（Magento 2.3 +）或 `elasticsearch:2.4.6`（Magento 2.1）容器
- `kibana:6.8.6`（Magento 2.3 +）或 `elastichq/elasticsearch-hq:latest`（Magento 2.1）容器
- 基于 `rabbitmq:management` 的自定义容器，自动创建 magento 用户
- 基于 `varnish:latest` 的自定义容器，添加 Magento 2 对应规则
