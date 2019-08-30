## Framework

```php
Magento\Framework\App\Config\ScopeConfigInterface // Magento\Framework\App\Config
Magento\Framework\App\RequestInterface // Magento\Framework\App\Request\Http
Magento\Framework\App\ResponseInterface // Magento\Framework\App\Response\Http
Magento\Framework\ObjectManagerInterface // Magento\Framework\ObjectManager\ObjectManager

Magento\Framework\App\DeploymentConfig
Magento\Framework\App\ResourceConnection
Magento\Framework\App\State
Magento\Framework\Registry
```


## Store

```php
Magento\Store\Model\StoreManagerInterface // Magento\Store\Model\StoreManager
```


## Catalog

```php
Magento\Catalog\Api\CategoryRepositoryInterface // Magento\Catalog\Model\CategoryRepository
Magento\Catalog\Api\ProductRepositoryInterface // Magento\Catalog\Model\ProductRepository

Magento\Catalog\Model\CategoryFactory
Magento\Catalog\Model\ProductFactory

Magento\Catalog\Model\ResourceModel\Category
Magento\Catalog\Model\ResourceModel\Product
```


## Customer

```php
Magento\Customer\Api\AddressRepositoryInterface // Magento\Customer\Model\ResourceModel\AddressRepository
Magento\Customer\Api\CustomerRepositoryInterface // Magento\Customer\Model\ResourceModel\CustomerRepository
Magento\Customer\Api\GroupRepositoryInterface // Magento\Customer\Model\ResourceModel\GroupRepository

Magento\Customer\Model\AddressFactory
Magento\Customer\Model\CustomerFactory
Magento\Customer\Model\GroupFactory

Magento\Catalog\Model\ResourceModel\Address
Magento\Catalog\Model\ResourceModel\Customer
Magento\Catalog\Model\ResourceModel\Group
```


## Log

```php
Psr\Log\LoggerInterface // Magento\Framework\Logger\Monolog
```
