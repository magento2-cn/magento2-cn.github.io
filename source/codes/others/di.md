## 插件 Plugin

在 Magento 2 中，插件被用来扩展原生类的行为。这些原生的行为可以通过创建插件来进行修改，但插件改变的是这些类的方法的行为，而不是类本身。就是说，当某个类被其他类所继承，那么作用在该类的插件并不会影响继承这个类的其他类的行为。

p.s. 在 di.xml 中通过插件可以改变类的某个方法，而 preference 则可以改变整个类。插件仅能作用于类，无法作用于接口。


###插件的定义

插件通过 di.xml 定义，以下是插件在该配置文件中的格式及参数说明：

```xml
<config>
    <type name="Original\Class\Name">
        <plugin name="plugin_name"
            type="Namespace\Module\Plugin\Resource\Visitor"
            sortOrder="1" disabled="true" />
    </type>
</config>
```

- type:name - 需要执行插件的类。包含空间名，如 Magento\Customer\Model\Resource\Visitor
- plugin:name - 插件名。全站同一个域内唯一，如 catalogLog
- plugin:type - 插件的类名。包含空间名，如 Magento\Catalog\Model\Plugin\Log
- plugin:sortOrder - 执行顺序。当同一个类有多个插件时，根据这个参数决定插件的执行顺序
- plugin:disabled - 该参数为 true 时不执行该插件


### Before 侦听

当改变一个原生方法的参数，或者在执行这个原生方法之前添加一些行为的时候，就需要在插件中用到 Before-Listener 方法。

Before-Listener 方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 before。

Before-Listener 方法的第一个参数是原生方法所属类的实例。如果原生方法有参数，则第二个参数起往后分别对应原生方法的参数。参数类型可以跟原生方法不一致，相当于在 di.xml 中用 argument 节点指定了对应参数的类。

如果需要修改原生方法的参数内容，可以在 Before-Listener 方法中返回一个数组，数组第一到 n 个元素将依次为原生方法的入参。

以 Magento\Persistent 模块为例，其 di.xml 定义了：

```xml
<type name="Magento\Quote\Model\AddressAdditionalDataProcessor">
    <plugin name="persistent_remember_me_checkbox_processor" type="Magento\Persistent\Model\Checkout\AddressDataProcessorPlugin" />
</type>
```
修改的是原生 Magento\Quote\Model\AddressAdditionalDataProcessor 类的 process 方法：

```php

public function process(AddressAdditionalDataInterface $additionalData)
{
    return;
}
```

在 Magento\Persistent\Model\Checkout\AddressDataProcessorPlugin 中指定了该方法的参数类型，并添加了在其执行前的行为：

```php
public function beforeProcess(AddressAdditionalDataProcessor $subject, AddressAdditionalData $additionalData)
{
    if (!$this->persistentHelper->isEnabled() || !$this->persistentHelper->isRememberMeEnabled()) {
        return;
    }
    $checkboxStatus = $additionalData->getExtensionAttributes()->getPersistentRememberMe();
    $isRememberMeChecked = empty($checkboxStatus) ? false : true;
    $this->persistentSession->setRememberMeChecked($isRememberMeChecked);
    $this->checkoutSession->setRememberMeChecked($isRememberMeChecked);
}
```


### After 侦听

当改变一个原生方法的返回值，或者在执行这个原生方法之后添加一些行为的时候，就需要在插件中用到 After-Listener 方法。

After-Listener 方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 after。

After-Listener 方法的第一个参数是原生方法所属类的实例。如果原生方法有返回值，则第二个参数为原生方法的返回值。

After-Listener 方法的返回值类型与原生方法的返回值一致。

以 Magento\Catalog 模块为例，其 di.xml 定义了：

```xml
<type name="Magento\Customer\Model\Resource\Visitor">
    <plugin name="catalogLog" type="Magento\Catalog\Model\Plugin\Log" />
</type>
```

修改的是原生 Magento\Customer\Model\Resource\Visitor 类的 clean 方法：

```

public function clean(\Magento\Customer\Model\Visitor $object)
{
    $cleanTime = $object->getCleanTime();
    $connection = $this->getConnection();
    $timeLimit = $this->dateTime->formatDate($this->date->gmtTimestamp() - $cleanTime);
    while (true) {
        $select = $connection->select()->from(
            ['visitor_table' => $this->getTable('customer_visitor')],
            ['visitor_id' => 'visitor_table.visitor_id']
        )->where(
            'visitor_table.last_visit_at < ?',
            $timeLimit
        )->limit(
            100
        );
        $visitorIds = $connection->fetchCol($select);
        if (!$visitorIds) {
            break;
        }
        $condition = ['visitor_id IN (?)' => $visitorIds];
        $connection->delete($this->getTable('customer_visitor'), $condition);
    }

    return $this;
}
```

在 Magento\Catalog\Model\Plugin\Log 中添加了在其执行后的行为：

```php
public function afterClean(\Magento\Customer\Model\Resource\Visitor $subject, $logResourceModel)
{
    $this->_productCompareItem->clean();
    return $logResourceModel;
}
```


### Around 侦听

需要同时改变一个原生方法的参数及返回值，或者在执行这个原生方法前后都添加一些行为的时候，就用到 Around-Listener 方法。

Around-Listener 方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 around。

Around-Listener 方法的第一个参数是原生方法所属类的实例；第二个参数是下一个插件的类名或方法名。如果原生方法有参数，则以同一顺序依次跟在第二个参数之后。

Around-Listener 方法的返回值类型与原生方法的返回值一致。

以 Magento\Catalog 模块为例，其 di.xml 定义了：

```xml
<type name="Magento\Eav\Model\Entity\Attribute\Set">
    <plugin name="invalidateEavIndexerOnAttributeSetSave" type="Magento\Catalog\Model\Indexer\Product\Eav\Plugin\AttributeSet" />
</type>
```

修改的是原生 Magento\Eav\Model\Entity\Attribute\Set 类的 save 方法（继承自 Magento\Framework\Model\AbstractModel）：

```php
public function save()
{
    $this->_getResource()->save($this);
    return $this;
}
```

在 Magento\Catalog\Model\Indexer\Product\Eav\Plugin\AttributeSet 中添加了在其执行前后的行为：

```php
public function aroundSave(\Magento\Eav\Model\Entity\Attribute\Set $subject, \Closure $proceed)
{
    $requiresReindex = false;
    if ($subject->getId()) {
        /** @var \Magento\Eav\Model\Entity\Attribute\Set $originalSet */
        $originalSet = clone $subject;
        $originalSet->initFromSkeleton($subject->getId());
        $originalAttributeCodes = array_flip($this->_attributeFilter->filter($originalSet));
        $subjectAttributeCodes = array_flip($this->_attributeFilter->filter($subject));
        $requiresReindex = (bool)count(array_merge(
            array_diff_key($subjectAttributeCodes, $originalAttributeCodes),
            array_diff_key($originalAttributeCodes, $subjectAttributeCodes)
        ));
    }
    $result = $proceed();
    if ($requiresReindex) {
        $this->_indexerEavProcessor->markIndexerAsInvalid();
    }
    return $result;
}
```


###插件的优先处理

当多个插件同时指向同一个原生方法时，将按以下顺序执行：

1. 执行 ```sortOrder``` 最小的插件的 Before-Listener 方法
2. 执行 ```sortOrder``` 最小的插件的 Around-Listener 方法
3. 按 ```sortOrder``` 值从小到大顺序执行插件的其他 Before-Listener 方法
4. 按 ```sortOrder``` 值从小到大顺序执行插件的其他 Around-Listener 方法
5. 按 ```sortOrder``` 值从大到小顺序执行插件的 After-Listener 方法

