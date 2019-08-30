## 获取 URL

### 当前页面 URL

```php
/* @var $objectManager \Magento\Framework\ObjectManagerInterface */
$currentUrl = $objectManager->get( \Magento\Framework\UrlInterface::class )->getCurrentUrl();
```

### 指定路由及参数的 URL

```php
/* @var $objectManager \Magento\Framework\ObjectManagerInterface */
/* @var $path string */
/* @var $params array */
$url = $objectManager->get( \Magento\Store\Model\StoreManagerInterface::class )->getStore()->getUrl( $path, $params );
```

### 各种目录 URL

```php
/* @var $objectManager \Magento\Framework\ObjectManagerInterface */
$store = $objectManager->get( \Magento\Store\Model\StoreManagerInterface::class )->getStore();

$url = $store->getBaseUrl( \Magento\Framework\UrlInterface::URL_TYPE_LINK );
$url = $store->getBaseUrl( \Magento\Framework\UrlInterface::URL_TYPE_DIRECT_LINK );
$url = $store->getBaseUrl( \Magento\Framework\UrlInterface::URL_TYPE_WEB );
$url = $store->getBaseUrl( \Magento\Framework\UrlInterface::URL_TYPE_MEDIA );
$url = $store->getBaseUrl( \Magento\Framework\UrlInterface::URL_TYPE_STATIC );
```

### 在模板中获取完整 URL

首页 URL
```
$block->getBaseUrl();
```

指定路由及参数的 URL
```
/* @var $path string */
/* @var $params array */
$block->getUrl( $path, $params );
```

指定静态文件的 URL
```
$block->getViewFileUrl( 'Magento_Checkout::cvv.png' );
$block->getViewFileUrl( 'images/loader-2.gif' );
```

### 在后台环境下获取前台 URL

```
/* @var $objectManager \Magento\Framework\ObjectManagerInterface */
/* @var $store \Magento\Store\Api\Data\StoreInterface */
/* @var $path string */
$scopeResolver = $objectManager->create( \Magento\Framework\Url\ScopeResolverInterface::class, [ 'areaCode' => \Magento\Framework\App\Area::AREA_FRONTEND ] );
$url = $objectManager->create( \Magento\Framework\Url::class, [ 'scopeResolver' => $scopeResolver ] )->setScope( $store )->getUrl( $path, [ '_scope_to_url' => false, '_nosid' => true ] );
```

### 指定店铺视图的 URL

```
/* @var $urlHandler \Magento\Framework\UrlInterface */
/* @var $urlHelper \Magento\Framework\Url\Helper\Data */
/* @var $targetUrl string */
/* @var $storeViewCode string */
$url = $urlHandler->getUrl( 'stores/store/switch', [
    \Magento\Framework\App\ActionInterface::PARAM_NAME_URL_ENCODED => $urlHelper->getEncodedUrl( $targetUrl ),
    \Magento\Store\Api\StoreResolverInterface::PARAM_NAME => $storeViewCode 
] );
```

### 资源文件 URL

```php
/* @var $objectManager \Magento\Framework\ObjectManagerInterface */
$assetRepo = $objectManager->get( \Magento\Framework\View\Asset\Repository::class );
$asset = $assetRepo->createAsset( 'Vendor_Module::js/script.js' );
$url = $asset->getUrl();
```


## 获取文件或目录路径

### 文件目录路径

```php
use Magento\Framework\App\Filesystem\DirectoryList;

/* @var $objectManager \Magento\Framework\ObjectManagerInterface */
$filesystem = $objectManager->get( \Magento\Framework\Filesystem::class );

$dirSource = $filesystem->getDirectoryRead( DirectoryList::ROOT ); // [root]
$dirSource = $filesystem->getDirectoryRead( DirectoryList::APP ); // [root]/app
$dirSource = $filesystem->getDirectoryRead( DirectoryList::CONFIG ); // [root]/app/etc
$dirSource = $filesystem->getDirectoryRead( DirectoryList::LIB_INTERNAL ); // [root]/lib/internal
$dirSource = $filesystem->getDirectoryRead( DirectoryList::LIB_WEB ); // [root]/lib/web
$dirSource = $filesystem->getDirectoryRead( DirectoryList::PUB ); // [root]/pub
$dirSource = $filesystem->getDirectoryRead( DirectoryList::MEDIA ); // [root]/pub/media
$dirSource = $filesystem->getDirectoryRead( DirectoryList::UPLOAD ); // [root]/pub/media/upload
$dirSource = $filesystem->getDirectoryRead( DirectoryList::STATIC_VIEW ); // [root]/pub/static
$dirSource = $filesystem->getDirectoryRead( DirectoryList::SETUP ); // [root]/setup/src
$dirSource = $filesystem->getDirectoryRead( DirectoryList::VAR_DIR ); // [root]/var
$dirSource = $filesystem->getDirectoryRead( DirectoryList::TMP ); // [root]/var/tmp
$dirSource = $filesystem->getDirectoryRead( DirectoryList::CACHE ); // [root]/var/cache
$dirSource = $filesystem->getDirectoryRead( DirectoryList::LOG ); // [root]/var/log
$dirSource = $filesystem->getDirectoryRead( DirectoryList::SESSION ); // [root]/var/session
$dirSource = $filesystem->getDirectoryRead( DirectoryList::DI ); // [root]/var/di
$dirSource = $filesystem->getDirectoryRead( DirectoryList::GENERATION ); // [root]/var/generation
$dirSource = $filesystem->getDirectoryRead( DirectoryList::COMPOSER_HOME ); // [root]/var/composer_home
$dirSource = $filesystem->getDirectoryRead( DirectoryList::TMP_MATERIALIZATION_DIR ); // [root]/var/view_preprocessed
$dirSource = $filesystem->getDirectoryRead( DirectoryList::TEMPLATE_MINIFICATION_DIR ); // [root]/var/view_preprocessed/html

$absolutePath = $dirSource->getAbsolutePath();
$relativePath = $dirSource->getRelativePath();
```

### 资源文件路径

```php
/* @var $objectManager \Magento\Framework\ObjectManagerInterface */
$assetRepo = $objectManager->get( \Magento\Framework\View\Asset\Repository::class );
$asset = $assetRepo->createAsset( 'Vendor_Module::js/script.js' );
$filePath = $asset->getFilePath();
```

### 模板文件路径

```php
/* @var $templateFileResolver \Magento\Framework\View\Element\Template\File\Resolver */
/* @var $templateName string */
$filePath = $templateFileResolver->getTemplateFileName( $templateName )
```
