## 插件 Plugin

在 Magento 2 中，我们可以通过定义插件来修改或者扩展原生类的行为。

插件可以且只可以影响指定类的公有方法。当类 A 被类 B 所继承，作用于类 A 的插件并不会影响类 B 的行为。

插件仅能作用于类，无法作用于接口。


### 插件的定义

通过对组件的 `di.xml` 文件的 `config` 节点加入以下代码定义插件：

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

如果需要修改原生方法的参数，可以在 before 侦听方法中返回一个数组，数组第一到 n 个元素依次为原生方法的入参。


### after 侦听方法

当我们需要修改一个方法的返回值，或者在执行这个方法之后执行一些后续操作的时候，可以为插件添加 after 侦听方法。

after 侦听方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 `after`。

after 侦听方法的第一个参数是原生方法所属类的实例。如果原生方法有返回值，则第二个参数为原生方法的返回值。

after 侦听方法的返回值类型必须与原生方法一致。


### around 侦听方法

当我们需要同时修改一个方法的参数和返回值，或者在执行这个方法前后都要执行额外操作的时候，就用到 around 侦听方法。

around 侦听方法的命名规则是，将原生方法的首字母改成大写，并在原生方法名前添加前缀 `around`。

around 侦听方法的第一个参数是原生方法所属类的实例。第二个参数是针对同一原生方法的下一个插件的 around 侦听方法，或者原生方法本身。如果原生方法有参数，则以同一顺序依次跟在第二个参数之后。

around 侦听方法的返回值类型必须与原生方法一致。


### 优先级处理

当多个插件/侦听方法同时指向同一个原生方法时，将按以下顺序执行：

1. 执行 `sortOrder` 最小的插件的 before 侦听方法
2. 执行 `sortOrder` 最小的插件的 around 侦听方法
3. 按 `sortOrder` 值从小到大顺序执行插件的其他 before 侦听方法
4. 按 `sortOrder` 值从小到大顺序执行插件的其他 around 侦听方法
5. 按 `sortOrder` 值从大到小顺序执行插件的 after 侦听方法
