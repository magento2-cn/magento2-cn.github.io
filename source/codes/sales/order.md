## 获取订单

### 通过 Increment ID 获得订单

```php
/* @var $objectManager \Magento\Framework\ObjectManager\ObjectManager */
/* @var $incrementId string */
$order = $objectManager->create( \Magento\Sales\Model\Order::class )->loadByIncrementId( $incrementId );
```
