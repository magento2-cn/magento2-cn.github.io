
Magento 2 允许开发者通过组件的 `di.xml` 文件对类进行配置。 这个机制方便我们在不修改核心代码的前提下对原生功能进行修改，令定制开发在不影响系统升级的同时也非常灵活。

指定 `area` 下的 `di.xml` 文件（比如 `etc/frontend/di.xml`）只会在这个作用域里起作用，对其他作用域的同一个类/接口都没有影响。

`di.xml` 文件的所有配置内容都在 `config` 节点中进行：

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="urn:magento:framework:ObjectManager/etc/config.xsd">
    ...
</config>
```

需要注意的是，di 文件的设置只对系统自动加载的类，或者通过 ObjectManager 加载的类起作用，对直接 new 出来的实例不生效。


## 指定单例

通过 `peference` 标签可以指定接口所对应的类：

```xml
<preference for="Magento\Catalog\Api\Data\ProductInterface"
    type="Namespace\Module\Model\Product" />
```

或者设置使用一个新的类来代替（重写）已经存在的类：

```xml
<preference for="Magento\Catalog\Model\ResourceModel\Product\Collection"
    type="Namespace\Module\Override\Magento\Catalog\Model\ResourceModel\Product\Collection" />
```


## 指定注入某个类的参数

```xml
<type name="Magento\Catalog\Helper\Product">
    <arguments>
        <argument name="catalogSession" xsi:type="object">Magento\Catalog\Model\Session\Proxy</argument>
        <argument name="reindexPriceIndexerData" xsi:type="array">
            <item name="byDataResult" xsi:type="array">
                <item name="tier_price_changed" xsi:type="string">tier_price_changed</item>
            </item>
            <item name="byDataChange" xsi:type="array">
                <item name="status" xsi:type="string">status</item>
                <item name="price" xsi:type="string">price</item>
                <item name="special_price" xsi:type="string">special_price</item>
                <item name="special_from_date" xsi:type="string">special_from_date</item>
                <item name="special_to_date" xsi:type="string">special_to_date</item>
                <item name="website_ids" xsi:type="string">website_ids</item>
                <item name="gift_wrapping_price" xsi:type="string">gift_wrapping_price</item>
                <item name="tax_class_id" xsi:type="string">tax_class_id</item>
            </item>
        </argument>
        <argument name="reindexProductCategoryIndexerData" xsi:type="array">
            <item name="byDataChange" xsi:type="array">
                <item name="category_ids" xsi:type="string">category_ids</item>
                <item name="entity_id" xsi:type="string">entity_id</item>
                <item name="store_id" xsi:type="string">store_id</item>
                <item name="website_ids" xsi:type="string">website_ids</item>
                <item name="visibility" xsi:type="string">visibility</item>
                <item name="status" xsi:type="string">status</item>
            </item>
        </argument>
        <argument name="productRepository" xsi:type="object">Magento\Catalog\Api\ProductRepositoryInterface\Proxy</argument>
    </arguments>
</type>
```


## 插件 Plugin

在 Magento 2 中，我们可以通过定义插件来修改或者扩展原生类的行为。

插件可以且只可以影响指定类的公有方法。且若类 A 被类 B 所继承，作用于类 A 的插件不会影响类 B 的行为。

插件仅能作用于类，无法作用于接口。


### 插件的定义

```xml
<type name="Original\Class\Name">
    <plugin name="plugin_name"
        type="Namespace\Module\Plugin\Resource\Visitor"
        sortOrder="1" disabled="true" />
</type>
```

- **type:name** - 需要执行插件的类。包含空间名，如 Magento\Customer\Model\Resource\Visitor
- **plugin:name** - 插件名。全站同一个域内唯一，如 catalogLog
- **plugin:type** - 插件的类名。包含空间名，如 Magento\Catalog\Model\Plugin\Log
- **plugin:sortOrder** - 执行顺序。当同一个类有多个插件时，根据这个参数决定插件的执行顺序
- **plugin:disabled** - 该参数为 true 时不执行该插件


### before 侦听方法

当我们需要修改一个方法的参数，或者在执行这个方法之前执行一些预操作的时候，可以为插件添加 before 侦听方法。

before 侦听方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 `before`。

before 侦听方法的第一个参数是原生方法所属类的实例。如果原生方法有参数，则从第二个参数起往后分别对应原生方法的各个参数。参数类型可以与原生方法不一致，这相当于在 di.xml 中指定对应参数的类。

如果需要修改原生方法的参数，可以在 before 侦听方法中返回一个数组，数组第一到 n 个元素依次为原生方法的入参；不返回任何值则原生方法的入参内容不变。

下边是原生插件 `Magento\Catalog\Model\Indexer\Product\Flat\Plugin` 的 before 侦听方法的内容：

```php
public function beforeSave(\Magento\Store\Model\ResourceModel\Store $subject, \Magento\Framework\Model\AbstractModel $object)
{
    if (!$object->getId() || $object->dataHasChangedFor('group_id')) {
        $this->_productFlatIndexerProcessor->markIndexerAsInvalid();
    }
}
```


### after 侦听方法

当我们需要修改一个方法的返回值，或者在执行这个方法之后执行一些后续操作的时候，可以为插件添加 after 侦听方法。

after 侦听方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 `after`。

after 侦听方法的第一个参数是原生方法所属类的实例。如果原生方法有返回值，则第二个参数为原生方法的返回值。

after 侦听方法的返回值类型必须与原生方法一致。

下边是原生插件 `Magento\Catalog\Plugin\Model\Indexer\Category\Product\Execute` 的 after 侦听方法的内容：

```php
public function afterExecute(AbstractAction $subject, AbstractAction $result)
{
    if ($this->config->isEnabled()) {
        $this->typeList->invalidate('full_page');
    }
    return $result;
}
```


### around 侦听方法

当我们需要同时修改一个方法的参数和返回值，或者在执行这个方法前后都要执行额外操作的时候，就用到 around 侦听方法。

around 侦听方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 `around`。

around 侦听方法的第一个参数是原生方法所属类的实例。第二个参数是针对同一原生方法的下一个插件的 around 侦听方法，或者原生方法本身。如果原生方法有参数，则以同一顺序依次跟在第二个参数之后。

around 侦听方法的返回值类型必须与原生方法一致。

下边是原生插件 `Magento\Catalog\Plugin\Model\ResourceModel\Attribute\Save` 的 around 侦听方法的内容：

```php
public function aroundSave(
    \Magento\Catalog\Model\ResourceModel\Attribute $subject,
    \Closure $proceed,
    \Magento\Framework\Model\AbstractModel $attribute
) {
    $result = $proceed($attribute);
    if ($this->config->isEnabled()) {
        $this->typeList->invalidate('full_page');
    }
    return $result;
}
```


### 执行顺序

当多个插件/侦听方法同时指向同一个原生方法时，将按以下顺序执行：

1. 执行 `sortOrder` 最小的插件的 before 侦听方法
2. 执行 `sortOrder` 最小的插件的 around 侦听方法
3. 按 `sortOrder` 值从小到大顺序执行插件的其他 before 侦听方法
4. 按 `sortOrder` 值从小到大顺序执行插件的其他 around 侦听方法
5. 按 `sortOrder` 值从大到小顺序执行插件的 after 侦听方法
