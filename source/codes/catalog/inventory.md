## 获取产品库存


## 其他

### 批量更新库存

```php
/* @var $objectManager \Magento\Framework\App\ObjectManager */
/* @var $websiteId int */
/* @var $qtys array */

$dataObjectHelper = $objectManager->get( \Magento\Framework\Api\DataObjectHelper::class );
$stockRegistry = $objectManager->create( \Magento\CatalogInventory\Api\StockRegistryInterface::class );
$stockItemRepository = $objectManager->create( \Magento\CatalogInventory\Api\StockItemRepositoryInterface::class );

// prepare inventory data
$inventoryData = [ ];
$options = $objectManager->get( \Magento\CatalogInventory\Api\StockConfigurationInterface::class )->getConfigItemOptions();
foreach ( $options as $option ) {
    if ( isset( $inventoryData[$option] ) && !isset( $inventoryData['use_config_' . $option] ) ) {
        $inventoryData['use_config_' . $option] = 0;
    }
}

// update stock items
$productIds = [ ];
foreach ( $qtys as $sku => $qty ) {
    try {
        $stockItem = $stockRegistry->getStockItemBySku( $sku, $websiteId );
        $stockItemId = $stockItem->getId();
        $productIds[] = $stockItem->getProductId();
        $inventoryData['qty'] = $qty;
        $dataObjectHelper->populateWithArray( $stockItem, $inventoryData, '\Magento\CatalogInventory\Api\Data\StockItemInterface' );
        $stockItem->setItemId( $stockItemId );
        $stockItemRepository->save( $stockItem );
    }
    catch ( \Exception $e ) {
        $e->getMessage();
    }
}

// update index
$objectManager->get( \Magento\CatalogInventory\Model\Indexer\Stock\Processor::class )->reindexList( $productIds );
```
