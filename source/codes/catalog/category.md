## 获取分类数据集 Collection

```
/* @var $categoryCollectionFactory \Magento\Catalog\Model\ResourceModel\Category\CollectionFactory */
$categoryCollection = $categoryCollectionFactory->create();
```

### 获取当前店铺的所有分类

这个方法仅限于前台使用：

```php
/* @var $categoryRepository \Magento\Catalog\Api\CategoryRepositoryInterface */
/* @var $storeManager \Magento\Store\Model\StoreManagerInterface */
$rootCategoryId = $storeManager->getStore()->getRootCategoryId();
$categories = $categoryRepository->get( $rootCategoryId )->getChildrenCategories();
```

获取分类树：
```php
/* @var $categoryTreeFactory \Magento\Catalog\Model\ResourceModel\Category\TreeFactory */
/* @var $storeManager \Magento\Store\Model\StoreManagerInterface */
/* @var $categoryCollectionFactory \Magento\Catalog\Model\ResourceModel\Category\CollectionFactory */
$categoryCollection = $categoryCollectionFactory->create()
    ->addAttributeToSelect( [ 'name' ] )
    ->addAttributeToSort( 'name' );
$rootCategoryId = $storeManager->getStore()->getRootCategoryId();
$categoryTree = $categoryTreeFactory->create();
$nodes = $categoryTree->loadNode( $rootCategoryId )->loadChildren( 0 )->getChildren();
$categoryTree->addCollectionData( $categoryCollection, true, [], true, true ); // this line MUST execute after `loadNode` method
```


## 其他

### 创建新分类

```php
use Magento\Store\Model\Store;

/* @var $resourceModel \Magento\Catalog\Model\ResourceModel\Category */
/* @var $categoryFactory \Magento\Catalog\Model\CategoryFactory */
/* @var $parentId int */
/* @var $path string */
/* @var $name string */
/* @var $description string */

$category = $categoryFactory->create()
    ->setStoreId( Store::DEFAULT_STORE_ID )
    ->addData( [
    'parent_id' => $parentId,
    'path' => $path, // use ID path of parent for creating new category
    'name' => $name,
    'description' => $description
] );

$resourceModel->save( $category );
```
