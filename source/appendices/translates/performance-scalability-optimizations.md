原文链接：[White-Paper-Magento-2_0-Performance-and-Scalability-03_31_16.pdf](https://magento.com/sites/default/files8/2018-10/White-Paper-Magento-2_0-Performance-and-Scalability-03_31_16.pdf)

## Introduction - 简介

> Magento 2.0 was designed for the next era in eCommerce-to make it faster, easier and more cost effective than ever 
  before to create shopping experiences that are tailored precisely to your business needs.

Magento 2.0 是专为新时代设计的电子商务系统，让您更快速、轻松、低成本地根据业务需求为客户创建优质的购物体验。

> It all starts with a modern architecture based on popular frameworks and coding patterns that gives you full 
  flexibility to meet virtually any business need with speed and agility. Magento 2.0’s modular design reduces 
  application complexity and enables you to easily extend or customize core functionality with off-the-shelf extensions 
  or your own code so you can bring innovative ideas to market fast. A built-in automated testing framework also speeds 
  development and you can easily integrate Magento 2.0 with 3rd party solutions thanks to enhanced and efficient APIs.

基于流行框架和编码模式的现代架构使系统具有高可扩展性，能快速、灵活地满足几乎所有业务需求。模块化设计有效降低了应用复杂度，让你可轻松通过
现成组件或编写代码来定制核心功能，将创意快速推向市场。内置的自动化测试框架可提高开发效率，强大高效的 API 可让你轻松地将第三方解决方案集
成到 Magento。

> Magento 2.0 also offers new functionality to help you create powerful shopping experiences. An all-new, streamlined 
  checkout and enhanced responsive designs provide you with an improved toolset for differentiating your site and 
  growing sales across devices. Redesigned administrative controls and merchandising tools enable more efficient 
  business operations and faster onboarding of new team members so you can deliver better service to your customers. 
  And, with easier upgrades enabled by Magento 2.0’s modular architecture, you can immediately take advantage of new 
  functionality as it becomes available.

Magento 2.0 提供了更多新功能来帮助你为客户制造优质的购物体验。全新精简的支付流程、增强的自适应设计为你提高网站辨识度，跨设备平台为你提
高销售额。重新设计的后台管理和销售工具提供高效的业务管理能力，让新成员可在更短时间内投入工作，从而为你的客户提供更好的服务。同时，凭借模
块化架构所提供的升级功能，一但新功能开发完成即可马上投入使用。

> On top of this flexible and feature-rich new platform, Magento 2.0 also includes comprehensive changes that set a new 
  standard for performance and scalability. Out-of-the-box, Magento 2.0 can now:
  - Process significantly more orders per hour on the same hardware
  - Offer near-instant server response times for catalog browsing
  - Deliver double-digit decreases in response times for cart and checkout pages
  - Better handle peak order volume, extra-large catalogs, and outsized customer lists 
  - Support significantly more simultaneous administrative users on the backend

Magento 2.0 还为性能和可扩展性的提升进行了全面修改，现在的 Magento 2.0 可以：
- 在同样硬件条件下处理更大量订单
- 为产品浏览提供几乎瞬时的服务器响应
- 购物车和支付页面有双倍于旧版的响应速度
- 针对高峰订单量、超大型产品目录、超大用户数量有更出色的表现
- 对后台管理员同时在线的数量支持有显著提高

> This paper explores the Magento 2.0 performance and scalability enhancements in depth to help you understand how the 
  new platform can benefit your business and support your long-term growth plans. It also provides configuration 
  recommendations and benchmark testing results that you can use to optimize your Magento 2.0 site performance.

本文将深入探讨 Magento 2.0 的性能和可扩展性，帮你了解新平台如何使你的业务长期受益。同时还提供用于优化站点性能的配置建议和基准测试结果。


## Recommended Magento Configurations - 推荐配置

> Magento provides a wide range of deployment and configuration options to support different use cases. To optimize 
  performance, many of the settings within Magento must be correctly configured in order to take advantage of the 
  performance and scalability enhancements that are included in Magento 2.0. There are also specific recommended 
  environment configurations that are beyond the scope of this white paper.

Magento 为各种不同使用情景提供了大量部署和配置选项。必须正确设置这些选项，才能充分发挥系统的性能和可扩展性。相关环境设置不在本文讨论范围内。

> IMPORTANT NOTE: All tests referenced in this paper are based on recommended and supported configurations for Magento 
  platforms. Deviation from these configurations may results in varied results, which may not accurately reflect the 
  nature in which the product was designed and architected.

重要说明：本文引用的所有测试均基于推荐配置，偏离这些设置可能导致结果多样化，不能准确反映系统架构的设计思想。


### Core Configuration - 核心设置

> Magento 2.0 is optimized to run using PHP 7 and Varnish. Although it is possible to run with PHP 5.6 and without Varnish, it is not recommended. It is advised that sites use both PHP 7 and Varnish to support the operation of their business and to achieve optimal performance results.

Magento 2.0 为 PHP 7 和 Varnish 进行了优化。尽管在 PHP 5.6 下不使用 Varnish 也能运行，但不推荐。建议将项目运行于 PHP 7 及 
Varnish 下以获得最佳性能。


### Static Asset Settings - 静态文件设置

> The static assets setting controls how assets such as CSS, JavaScript, HTML, and images are prepared for use by the 
  website.

静态文件设置控制 CSS、JavaScript、HTML、图片等静态资源是如何被网站应用的。

Stores / Configuration > Advanced / Developer
- Grid Settings / Asynchronous indexing: Enable
- CSS Settings / Minify CSS Files: Yes
- JavaScript Settings / Merge JavaScript Files: No
- JavaScript Settings / Enable JavaScript Bundling: Yes 
- JavaScript Settings / Minify JS Files: Yes
- Template Settings / Minify HTML: Yes


### Page Cache - 页面缓存

> The page cache setting controls which version of the page cache is used. For the best performance, enabling the 
  Varnish cache is strongly recommended. Note that this requires the deployment and configuration of Varnish.

页面缓存设置用于决定采用哪种类型缓存，强烈推荐使用 Varnish 以获得最佳性能。注意，开启这项设置要先正确部署 Varnish。

Stores / Configuration > Advanced / System > Full page cache
- Caching Application: Varnish Caching


### Email Settings - 邮件设置

> Email settings control when emails are sent relative to when they are generated.

邮件设置控制邮件是否使用异步发送。

Stores / Configuration > Sales / Sales Emails
- General settings / Asynchronous sending: Enable


### Index Settings - 索引设置

System / Index Management:
- All indexers should be in “Update on schedule” mode


### Application Cache - 应用缓存

修改 env.php 文件来设置使用 Redis
- 要先正确部署 Redis


### Production Mode - 产品模式

通过一行命令开启：

```sh
php bin/magento deploy:mode:set production
```

或拆分成几个指令，方便开发者调试：

```sh
php bin/magento deploy:mode:set production --skip-compilation
php bin/magento setup:di:compile
php bin/magento setup:static-content:deploy
```


## Layered Architecture - 分层架构

> The Magento 2.0 platform is a layered architecture with four tiers that are optimized for performance and scalability. 
  These are: the client, the page cache, the application, and the database tiers. 

Magento 2.0 针对 4 个层级来优化性能和可扩展性：客户端、页面缓存、应用层、数据库层。

> This standard web application structure allows for different components of the architecture to be scaled independently 
  in order to meet the requirements of different business use cases and different loads on the system.

这套标准网页应用结构让各个部件可以独立扩展，以适应不同的业务需求和系统负载需求。

![Layered Architecture - 分层架构](web/images/appendices/translates/performance-scalability-optimizations/layered-architecture.png)

> The following section describes the performance and scalability improvements made in each of these tiers in Magento 2.0.

下面根据这些分层讲述 Magento 2.0 如何提升性能和扩展性。


## Performance and Scalability Improvements - 性能和可扩展性的改进

> Magento 2.0 improves how the application interacts with the browser as well as reduces the amount of data that must
  be returned from the server to render web pages. These changes significantly improve page response and load times, 
  giving you a much better starting point for developing a fast site.

Magento 2.0 改进了程序与浏览器的交互方式，降低了服务器返回的用于渲染页面所必须的数据量。这些修改显著提升页面的响应速度。


### Client-side Improvements - 客户端的改进

> Page load time is a critical factor for creating a successful eCommerce site and has been shown to 
  directly impact consumer engagement and conversion rates. One key factor in providing a fast page load 
  and good customer experience is reducing the overall page weight or the amount of data that must be 
  loaded to render the page. The amount of data required to render a web page is both a function of the 
  visual design of the page and the technologies and web development strategies used.

页面加载时间是电子商务网站成功与否的关键因素，它直接影响消费者的参与度和转化率。改善页面加载速度和用户体验的一个关键因素，是降低页面
的整体体积，或者说渲染页面所必须的数据量。而渲染页面所必须的数据量既取决于页面设计，也取决于所使用的技术和网页开发策略。

> Magento 2.0 provides a number of optimizations to reduce page weight and improve response times:
- **Magento 2.0 optimizes the assets required to render the page by using minification.**<br /> 
  Minification is a process of removing whitespace, comments, and other unnecessary characters 
  in order to reduce the size of files served to the browser. With Magento 2.0, all HTML, CSS, and 
  JavaScript served by the application are minified to reduce their size. This minification is carried 
  out in advance of requests and is cached so the minified files are available for all website requests. 
  Magento uses industry-standard minification engines such as jShrink for Javascript and cssmin for 
  CSS, as well as an internally-developed engine for HTML. These engines were selected to maximize 
  compression, but merchants can choose to use others if they desire. To further reduce page 
  weight, image files used by Magento websites are compressed using the PHP gd2 library to provide 
  high quality images in the smallest file size. 
- **Magento 2.0 maximizes the usage of the browser cache for storing assets.**<br />
  All JavaScript and CSS are loaded to the browser and cached on the initial web page visited. This minimizes 
  the amount of content that needs to be downloaded to render any subsequent page. To further 
  improve the ability of the cache to service page requests and allow the browser to begin rendering 
  the page, private data (such as consumers’ names) are no longer provided as HTML blocks. Now 
  they are returned to the browser as JSON and are inserted into the rendered page when available. 
- **Magento 2.0 improves response time by using asynchronous processing during checkout and cart operations.**<br />
  Items are added to the cart asynchronously to improve response times for 
  the browsing experience. Many checkout operations are also done asynchronously to improve 
  response time, such as address validation and cart updates.

Magento 2.0 通过以下几方面减小页面体积，加速响应时间：
- **压缩静态文件**<br />
  通过删除多余的空格、注释，以及其他字符来压缩文件，所有 HTML、CSS、JavaScript 都使用这种方式进行处理。这个压缩操作是在请求之前执行并
  已生成缓存文件，它被应用于所有页面。


### Page Caching - 页面缓存

> Another key to delivering fast page loads is improving the server response time. Magento 2.0 makes 
extensive use of caching of page content and static assets on the server to accelerate response times. 
With Magento 2.0, the application now directly integrates with Varnish page caching out-of-the-box. 
Varnish is a reverse-HTTP proxy or web accelerator. The Varnish application stores HTML and other files or 
fragments so that they can be returned extremely quickly. 

实现快速页面加载的另一个关键是缩短服务器响应时间，Magento 2.0 为页面内容和静态资源大量采用缓存以加快响应速度。Varnish 是一个反向 HTTP 代理或者说网络加速器，它可为网站缓存并快速重新访问 HTML 和其他文件。Magento 2.0 可通过 Varnish 进行整页缓存。

> Varnish provides a very fast and efficient mechanism for serving content that is highly scalable. The 
requests that are served by the Varnish cache never need to reach the Magento application servers, 
which reduces the load on the web nodes while dramatically improving the response time. One or more 
Varnish servers can be used in front of the Magento server(s), an approach that provides a much faster 
and more efficient system. 

> Cached content can be composed of different elements with different lifespans or times-to-live using 
Edge Side Includes (ESI). Edge Side Includes allow for different cached elements to be combined 
dynamically before being served from the cache. Page elements that cannot be cached, such as cart 
contents, customer name, or other private data, are provided separately. These page elements are passed 
to the browser as JSON that can be rendered asynchronously in the browser rather than on the server. 
This approach allows the page to begin rendering as quickly as possible with the other content added in 
when it is available, creating a superior user experience. Magento 2.0 handles invalidation of content in 
the page cache to ensure the right content is served to the website.

> Magento 2.0 opens the benefits of Varnish caching to a much broader set of merchants by fully 
supporting and providing configuration files (.vcl files) for Varnish 3.X and 4.X. These configurations must 
be updated to reflect the deployment topology, but provide a starting point that makes it significantly 
easier and less expensive to implement Varnish to improve performance and scalability.
There can be a number of different ways to architect Varnish in the application. The simplest option is to 
deploy Varnish on the same server that is running Magento. More sophisticated deployment architectures 
can be used to scale out multiple Varnish servers using a load balancer to distribute traffic between 
multiple Varnish instances on multiple servers. These deployments can improve scalability and provide 
redundancy as part of a high availability system.

> To use Varnish with secure pages or sites (i.e., served using HTTPS), another application (such as Nginx) 
must be placed in front of the Varnish server(s) to handle SSL termination. 

> Magento 2.0 does provide an alternative Page Cache in addition to Varnish. This cache is intended 
for use in development or in single web node situations where Varnish cannot be used. However, the 
Page Cache uses a PHP implementation that requires the Magento application to process the caching 
requests, which causes it to be less efficient and to not yield the same performance benefits. Due to 
the superior performance and scalability characteristics of Varnish, it is strongly recommended for 
use in production deployments.



### Application Enhancements


### Database Improvements


### Performance Toolkit


## Performance Results


### Test Configuration


### Small Merchant Deployment


### Large Merchant Deployment


## Conclusion


## Small Merchant Deployment


## Large Merchant Deployment


## Appendix


### Merchant Profile Details


### Small Merchant Deployment (4 web node cores)


### Larger Merchant Deployment (20 web node cores)


