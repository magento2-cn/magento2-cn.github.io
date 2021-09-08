# 集合 Collection

## 普通  Collection

AND 条件使用实例：
```php
/* @var $collection \Magento\Framework\Data\Collection\AbstractDb */
$collection
    ->addFieldToFilter( 'news_from_date', [ 'to' => date( 'Y-m-d' ) ] )
    ->addFieldToFilter( 'title', [ 'like' => '%abc' ] );
```

OR 条件使用实例：
```php
/* @var $collection \Magento\Framework\Data\Collection\AbstractDb */
$collection->addFieldToFilter( [
    'a' => 'news_from_date',
    'b' => 'news_to_date'
], [
    'a' => [ 'from' => date( 'Y-m-d' ) ],
    'b' => [ 'to' => date( 'Y-m-d' ) ]
] );
```


## EAV Collection

AND 条件使用实例：
```php
/* @var $collection \Magento\Eav\Model\Entity\Collection\AbstractCollection */
$collection
    ->addAttributeToFilter( 'news_from_date', [ 'to' => date( 'Y-m-d' ) ] )
    ->addAttributeToFilter( 'title', [ 'like' => '%abc' ] );
```

OR 条件使用实例：
```php
/* @var $collection \Magento\Eav\Model\Entity\Collection\AbstractCollection */
$collection->addAttributeToFilter( [
    [ 'attribute' => 'news_from_date', 'from' => date( 'Y-m-d' ) ],
    [ 'attribute' => 'news_to_date', 'to' => date( 'Y-m-d' ) ]
] );
```


## 可用条件

```
'eq'            => "{{fieldName}} = ?",
'neq'           => "{{fieldName}} != ?",
'like'          => "{{fieldName}} LIKE ?",
'nlike'         => "{{fieldName}} NOT LIKE ?",
'in'            => "{{fieldName}} IN(?)",
'nin'           => "{{fieldName}} NOT IN(?)",
'is'            => "{{fieldName}} IS ?",
'notnull'       => "{{fieldName}} IS NOT NULL",
'null'          => "{{fieldName}} IS NULL",
'gt'            => "{{fieldName}} > ?",
'lt'            => "{{fieldName}} < ?",
'gteq'          => "{{fieldName}} >= ?",
'lteq'          => "{{fieldName}} <= ?",
'finset'        => "FIND_IN_SET(?, {{fieldName}})",
'regexp'        => "{{fieldName}} REGEXP ?",
'from'          => "{{fieldName}} >= ?",
'to'            => "{{fieldName}} <= ?",
'seq'           => null,
'sneq'          => null,
'ntoa'          => "INET_NTOA({{fieldName}}) LIKE ?",
```
