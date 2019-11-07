## 概述

### 价格的计算

Magento 产品价格的实现思想，主要是将各种计价逻辑的实现寄存在产品对象中，需要计算价钱时通过以下方法执行这些逻辑运算：

```php
/* @var $product \Magento\Catalog\Model\Product */
/* @var $priceType string */
/* @var $priceModel \Magento\Framework\Pricing\Price\PriceInterface */
/* @var $price float */
$priceModel = $product->getPriceInfo()->getPrice( $priceType );
$price = $priceModel->getValue();
```

这些计价逻辑包括 `regular_price`、`final_price`、`tier_price`、`special_price`、`base_price`、`custom_option_price`、`configured_price`、`configured_regular_price` 等等。

系统通过 `Magento\Framework\Pricing\PriceInfo\Factory`（Price Info Factory）为产品对象创建 `Magento\Framework\Pricing\PriceInfo\Base` （Price Info）实例来寄存价格信息。这些实例都有一个 `Magento\Framework\Pricing\Price\Collection`（Price Collection），不同类型产品的  Price Collection 包含不同的 `Magento\Framework\Pricing\Price\Pool`（Price Pool），而各种计价逻辑就包含在这个 Price Pool 中。

不同类型的产品包含不同的计价逻辑，而所有产品又存在一些默认的逻辑。这是通过各组件的 `di.xml` 文件，对各类型产品的 Price Info Factory、Price Collection、Price Pool 指定不同参数来定义的，具体结构后面分产品类型进行描述。


### 价格的显示

Magento 通过以下两个 layout 定义了价格渲染器：

- `Magento_Catalog/view/layout/base/empty.xml`
- `Magento_Catalog/view/layout/base/defalut.xml`

渲染器的具体内容由 `catalog_product_prices.xml` 定义，下边是各原生组件的这个 layout 合并整理后的内容：

```xml
<block class="Magento\Framework\Pricing\Render\RendererPool" name="render.product.prices">
    <arguments>

        <argument name="default" xsi:type="array">
            <item name="default_render_class" xsi:type="string">Magento\Catalog\Pricing\Render\PriceBox</item>
            <item name="default_render_template" xsi:type="string">Magento_Catalog::product/price/default.phtml</item>
            <item name="default_amount_render_class" xsi:type="string">Magento\Framework\Pricing\Render\Amount</item>
            <item name="default_amount_render_template" xsi:type="string">Magento_Catalog::product/price/amount/default.phtml</item>
            <item name="prices" xsi:type="array">
                <item name="final_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\Catalog\Pricing\Render\FinalPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_Catalog::product/price/final_price.phtml</item>
                </item>
                <item name="special_price" xsi:type="array">
                    <item name="render_template" xsi:type="string">Magento_Catalog::product/price/special_price.phtml</item>
                </item>
                <item name="tier_price" xsi:type="array">
                    <item name="render_template" xsi:type="string">Magento_Catalog::product/price/tier_prices.phtml</item>
                </item>
                <item name="custom_option_price" xsi:type="array">
                    <item name="amount_render_template" xsi:type="string">Magento_Catalog::product/price/amount/default.phtml</item>
                </item>
                <item name="configured_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\Catalog\Pricing\Render\ConfiguredPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_Catalog::product/price/configured_price.phtml</item>
                </item>
                <item name="msrp_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\Catalog\Pricing\Render\PriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_Msrp::product/price/msrp.phtml</item>
                </item>
                <item name="wishlist_configured_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\Wishlist\Pricing\Render\ConfiguredPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_Catalog::product/price/configured_price.phtml</item>
                </item>
            </item>
            <item name="adjustments" xsi:type="array">
                <item name="default" xsi:type="array">
                    <item name="tax" xsi:type="array">
                        <item name="adjustment_render_class" xsi:type="string">Magento\Weee\Pricing\Render\TaxAdjustment</item>
                        <item name="adjustment_render_template" xsi:type="string">Magento_Tax::pricing/adjustment.phtml</item>
                    </item>
                    <item name="weee" xsi:type="array">
                        <item name="adjustment_render_class" xsi:type="string">Magento\Weee\Pricing\Render\Adjustment</item>
                        <item name="adjustment_render_template" xsi:type="string">Magento_Weee::pricing/adjustment.phtml</item>
                    </item>
                </item>
            </item>
        </argument>

        <argument name="configurable" xsi:type="array">
            <item name="prices" xsi:type="array">
                <item name="final_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\ConfigurableProduct\Pricing\Render\FinalPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_ConfigurableProduct::product/price/final_price.phtml</item>
                </item>
                <item name="tier_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\ConfigurableProduct\Pricing\Render\TierPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_ConfigurableProduct::product/price/tier_price.phtml</item>
                </item>
                <item name="wishlist_configured_price" xsi:type="array">
                    <item name="render_template" xsi:type="string">Magento_Wishlist::product/price/configurable/configured_price.phtml</item>
                </item>
            </item>
        </argument>

        <argument name="bundle" xsi:type="array">
            <item name="prices" xsi:type="array">
                <item name="final_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\Bundle\Pricing\Render\FinalPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_Bundle::product/price/final_price.phtml</item>
                </item>
                <item name="tier_price" xsi:type="array">
                    <item name="render_template" xsi:type="string">Magento_Bundle::product/price/tier_prices.phtml</item>
                </item>
                <item name="bundle_option" xsi:type="array">
                    <item name="amount_render_template" xsi:type="string">Magento_Bundle::product/price/selection/amount.phtml</item>
                </item>
                <item name="wishlist_configured_price" xsi:type="array">
                    <item name="render_template" xsi:type="string">Magento_Wishlist::product/price/bundle/configured_price.phtml</item>
                </item>
            </item>
            <item name="adjustments" xsi:type="array">
                <item name="bundle_option" xsi:type="array">
                    <item name="tax" xsi:type="array">
                        <item name="adjustment_render_class" xsi:type="string">Magento\Tax\Pricing\Render\Adjustment</item>
                        <item name="adjustment_render_template" xsi:type="string">Magento_Tax::pricing/adjustment/bundle.phtml</item>
                    </item>
                </item>
            </item>
        </argument>

        <argument name="grouped" xsi:type="array">
            <item name="prices" xsi:type="array">
                <item name="final_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\Catalog\Pricing\Render\FinalPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_GroupedProduct::product/price/final_price.phtml</item>
                </item>
            </item>
        </argument>

        <argument name="giftcard" xsi:type="array">
            <item name="prices" xsi:type="array">
                <item name="final_price" xsi:type="array">
                    <item name="render_class" xsi:type="string">Magento\GiftCard\Pricing\Render\FinalPriceBox</item>
                    <item name="render_template" xsi:type="string">Magento_GiftCard::product/price/final_price.phtml</item>
                </item>
            </item>
        </argument>

    </arguments>
</block>
```

各类型产品（default、configurable、bundle、grouped、giftcard）的各种计价逻辑都是由这里指定的渲染类和模板输出。




## 默认计价逻辑

`Magento_Catalog::etc/di.xml`

```xml
<type name="Magento\Framework\Pricing\PriceInfo\Factory">
    <arguments>
        <argument name="types" xsi:type="array">
            <item name="default" xsi:type="array">
                <item name="infoClass" xsi:type="string">Magento\Framework\Pricing\PriceInfo\Base</item>
                <item name="prices" xsi:type="string">Magento\Catalog\Pricing\Price\Collection</item>
            </item>
        </argument>
    </arguments>
</type>
```

```xml
<virtualType name="Magento\Catalog\Pricing\Price\Collection" type="Magento\Framework\Pricing\Price\Collection">
    <arguments>
        <argument name="pool" xsi:type="object">Magento\Catalog\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

```xml
<virtualType name="Magento\Catalog\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="regular_price" xsi:type="string">Magento\Catalog\Pricing\Price\RegularPrice</item>
            <item name="final_price" xsi:type="string">Magento\Catalog\Pricing\Price\FinalPrice</item>
            <item name="tier_price" xsi:type="string">Magento\Catalog\Pricing\Price\TierPrice</item>
            <item name="special_price" xsi:type="string">Magento\Catalog\Pricing\Price\SpecialPrice</item>
            <item name="base_price" xsi:type="string">Magento\Catalog\Pricing\Price\BasePrice</item>
            <item name="custom_option_price" xsi:type="string">Magento\Catalog\Pricing\Price\CustomOptionPrice</item>
            <item name="configured_price" xsi:type="string">Magento\Catalog\Pricing\Price\ConfiguredPrice</item>
            <item name="configured_regular_price" xsi:type="string">Magento\Catalog\Pricing\Price\ConfiguredRegularPrice</item>
        </argument>
    </arguments>
</virtualType>
```

### 关联产品的价格构建

在 Magento 中，高级产品（可配置产品、捆绑产品等）都是由若干个相关联的基础产品（简单产品、虚拟产品等）组成。Catalog 组件为获取这些高级产品的价格，提供了基础的数据库语句构建方法：

通过 Select Builder 创建 Select

```php
Magento\Catalog\Model\ResourceModel\Product\LinkedProductSelectBuilderByBasePrice
Magento\Catalog\Model\ResourceModel\Product\LinkedProductSelectBuilderBySpecialPrice
Magento\Catalog\Model\ResourceModel\Product\LinkedProductSelectBuilderByTierPrice
Magento\Catalog\Model\ResourceModel\Product\Indexer\LinkedProductSelectBuilderByIndexPrice
Magento\CatalogRule\Model\ResourceModel\Product\LinkedProductSelectBuilderByCatalogRulePrice
```

通过 Select Processor 加入过滤条件

```php
Magento\Catalog\Model\ResourceModel\Product\StatusBaseSelectProcessor
Magento\Catalog\Model\ResourceModel\Product\Website\SelectProcessor
Magento\CatalogInventory\Model\ResourceModel\Product\StockStatusBaseSelectProcessor
```


## 可配置产品

`Magento_ConfigurableProduct::etc/di.xml`

```xml
<type name="Magento\Framework\Pricing\PriceInfo\Factory">
    <arguments>
        <argument name="types" xsi:type="array">
            <item name="configurable" xsi:type="array">
                <item name="infoClass" xsi:type="string">Magento\Framework\Pricing\PriceInfo\Base</item>
                <item name="prices" xsi:type="string">Magento\ConfigurableProduct\Pricing\Price\Collection</item>
            </item>
        </argument>
    </arguments>
</type>
```

```xml
<virtualType name="Magento\ConfigurableProduct\Pricing\Price\Collection" type="Magento\Framework\Pricing\Price\Collection">
    <arguments>
        <argument name="pool" xsi:type="object">Magento\ConfigurableProduct\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

```xml
<virtualType name="Magento\ConfigurableProduct\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="regular_price" xsi:type="string">Magento\ConfigurableProduct\Pricing\Price\ConfigurableRegularPrice</item>
            <item name="final_price" xsi:type="string">Magento\ConfigurableProduct\Pricing\Price\FinalPrice</item>
        </argument>
        <argument name="target" xsi:type="object">Magento\Catalog\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

`Magento_Wishlist::etc/di.xml`

```xml
<virtualType name="Magento\ConfigurableProduct\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="wishlist_configured_price" xsi:type="string">Magento\Wishlist\Pricing\ConfiguredPrice\ConfigurableProduct</item>
        </argument>
    </arguments>
</virtualType>
```

Configurable 产品获取每种价格的执行过程当中都会用到 `Magento\ConfigurableProduct\Pricing\Price\LowestPriceOptionsProvider` 这个类，其作用是分别获取各类价格中最低价的那个子产品的 ID。


### 最低价 `final_price`

```
Magento_ConfigurableProduct::product/price/final_price.phtml
    Magento\ConfigurableProduct\Pricing\Render\FinalPriceBox [Magento\Framework\Pricing\Render\PriceBox] :: getPriceType
    Magento\ConfigurableProduct\Pricing\Price\FinalPrice [Magento\Framework\Pricing\Price\AbstractPrice] :: getAmount
        Magento\ConfigurableProduct\Pricing\Price\FinalPrice :: getValue
            Magento\ConfigurableProduct\Pricing\Price\ConfigurablePriceResolver :: resolvePrice( $product )
                $associatedProducts = Magento\ConfigurableProduct\Pricing\Price\LowestPriceOptionsProvider :: getProducts
                foreach ( $associatedProducts as $associatedProduct )
                    $productPrice = Magento\ConfigurableProduct\Pricing\Price\FinalPriceResolver :: resolvePrice( $associatedProduct )
                        Magento\Framework\Pricing\PriceInfo\Base :: getPrice
                        Magento\Catalog\Pricing\Price\FinalPrice :: getValue
                            Magento\Catalog\Pricing\Price\BasePrice :: getValue
                                $associatedProductPrices = Magento\Framework\Pricing\PriceInfo\Base :: getPrices
                                foreach ( $associatedProductPrices as $associatedProductPrice )
                                    if ( $associatedProductPrice instanceof Magento\Framework\Pricing\Price\BasePriceProviderInterface )
                                        min( $associatedProductPrice :: getValue )
                    min( $productPrice )
```



## 捆绑产品

`Magento_Bundle::etc/di.xml`

```xml
<type name="Magento\Framework\Pricing\PriceInfo\Factory">
    <arguments>
        <argument name="types" xsi:type="array">
            <item name="bundle" xsi:type="array">
                <item name="infoClass" xsi:type="string">Magento\Bundle\Pricing\PriceInfo</item>
                <item name="prices" xsi:type="string">Magento\Bundle\Pricing\Price\Collection</item>
            </item>
        </argument>
    </arguments>
</type>
```

```xml
<virtualType name="Magento\Bundle\Pricing\Price\Collection" type="Magento\Framework\Pricing\Price\Collection">
    <arguments>
        <argument name="pool" xsi:type="object">Magento\Bundle\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

```xml
<virtualType name="Magento\Bundle\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="regular_price" xsi:type="string">Magento\Bundle\Pricing\Price\BundleRegularPrice</item>
            <item name="final_price" xsi:type="string">Magento\Bundle\Pricing\Price\FinalPrice</item>
            <item name="tier_price" xsi:type="string">Magento\Bundle\Pricing\Price\TierPrice</item>
            <item name="special_price" xsi:type="string">Magento\Bundle\Pricing\Price\SpecialPrice</item>
            <item name="custom_option_price" xsi:type="string">Magento\Catalog\Pricing\Price\CustomOptionPrice</item>
            <item name="base_price" xsi:type="string">Magento\Catalog\Pricing\Price\BasePrice</item>
            <item name="configured_price" xsi:type="string">Magento\Bundle\Pricing\Price\ConfiguredPrice</item>
            <item name="configured_regular_price" xsi:type="string">Magento\Bundle\Pricing\Price\ConfiguredRegularPrice</item>
            <item name="bundle_option" xsi:type="string">Magento\Bundle\Pricing\Price\BundleOptionPrice</item>
            <item name="bundle_option_regular_price" xsi:type="string">Magento\Bundle\Pricing\Price\BundleOptionRegularPrice</item>
            <item name="catalog_rule_price" xsi:type="string">Magento\CatalogRule\Pricing\Price\CatalogRulePrice</item>
        </argument>
    </arguments>
</virtualType>
```

`Magento_Msrp::etc/di.xml`

```xml
<virtualType name="Magento\Bundle\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="msrp_price" xsi:type="string">Magento\Msrp\Pricing\Price\MsrpPrice</item>
        </argument>
    </arguments>
</virtualType>
```

`Magento_Wishlist::etc/di.xml`

```xml
<virtualType name="Magento\Bundle\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="wishlist_configured_price" xsi:type="string">Magento\Bundle\Pricing\Price\ConfiguredPrice</item>
        </argument>
    </arguments>
</virtualType>
```


## 组合产品

`Magento_GroupedProduct::etc/di.xml`

```xml
<type name="Magento\Framework\Pricing\PriceInfo\Factory">
    <arguments>
        <argument name="types" xsi:type="array">
            <item name="grouped" xsi:type="array">
                <item name="infoClass" xsi:type="string">Magento\Framework\Pricing\PriceInfo\Base</item>
                <item name="prices" xsi:type="string">Magento\GroupedProduct\Pricing\Price\Collection</item>
            </item>
        </argument>
    </arguments>
</type>
```

```xml
<virtualType name="Magento\GroupedProduct\Pricing\Price\Collection" type="Magento\Framework\Pricing\Price\Collection">
    <arguments>
        <argument name="pool" xsi:type="object">Magento\GroupedProduct\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

```xml
<virtualType name="Magento\GroupedProduct\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="final_price" xsi:type="string">Magento\GroupedProduct\Pricing\Price\FinalPrice</item>
            <item name="configured_price" xsi:type="string">Magento\GroupedProduct\Pricing\Price\ConfiguredPrice</item>
            <item name="configured_regular_price" xsi:type="string">Magento\GroupedProduct\Pricing\Price\ConfiguredRegularPrice</item>
        </argument>
        <argument name="target" xsi:type="object">Magento\Catalog\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

`Magento_Wishlist::etc/di.xml`

```xml
<virtualType name="Magento\GroupedProduct\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="wishlist_configured_price" xsi:type="string">Magento\GroupedProduct\Pricing\Price\ConfiguredPrice</item>
        </argument>
    </arguments>
</virtualType>
```


## 可下载产品

`Magento_Downloadable::etc/di.xml`

```xml
<type name="Magento\Framework\Pricing\PriceInfo\Factory">
    <arguments>
        <argument name="types" xsi:type="array">
            <item name="downloadable" xsi:type="array">
                <item name="infoClass" xsi:type="string">Magento\Framework\Pricing\PriceInfo\Base</item>
                <item name="prices" xsi:type="string">Magento\Downloadable\Pricing\Price\Collection</item>
            </item>
        </argument>
    </arguments>
</type>
```

```xml
<virtualType name="Magento\Downloadable\Pricing\Price\Collection" type="Magento\Framework\Pricing\Price\Collection">
    <arguments>
        <argument name="pool" xsi:type="object">Magento\Downloadable\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

```xml
<virtualType name="Magento\Downloadable\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="link_price" xsi:type="string">Magento\Downloadable\Pricing\Price\LinkPrice</item>
        </argument>
        <argument name="target" xsi:type="object">Magento\Catalog\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

`Magento_Wishlist::etc/di.xml`

```xml
<virtualType name="Magento\Downloadable\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="wishlist_configured_price" xsi:type="string">Magento\Wishlist\Pricing\ConfiguredPrice\Downloadable</item>
        </argument>
    </arguments>
</virtualType>
```


## 礼金券

`Magento_GiftCard::etc/di.xml`

```xml
<type name="Magento\Framework\Pricing\PriceInfo\Factory">
    <arguments>
        <argument name="types" xsi:type="array">
            <item name="giftcard" xsi:type="array">
                <item name="infoClass" xsi:type="string">Magento\Framework\Pricing\PriceInfo\Base</item>
                <item name="prices" xsi:type="string">Magento\GiftCard\Pricing\Price\Collection</item>
            </item>
        </argument>
    </arguments>
</type>
```

```xml
<virtualType name="Magento\GiftCard\Pricing\Price\Collection" type="Magento\Framework\Pricing\Price\Collection">
    <arguments>
        <argument name="pool" xsi:type="object">Magento\GiftCard\Pricing\Price\Pool</argument>
    </arguments>
</virtualType>
```

```xml
<virtualType name="Magento\GiftCard\Pricing\Price\Pool" type="Magento\Framework\Pricing\Price\Pool">
    <arguments>
        <argument name="prices" xsi:type="array">
            <item name="regular_price" xsi:type="string">Magento\Catalog\Pricing\Price\RegularPrice</item>
            <item name="final_price" xsi:type="string">Magento\GiftCard\Pricing\Price\FinalPrice</item>
            <item name="tier_price" xsi:type="string">Magento\Catalog\Pricing\Price\TierPrice</item>
            <item name="special_price" xsi:type="string">Magento\Catalog\Pricing\Price\SpecialPrice</item>
            <item name="msrp_price" xsi:type="string">Magento\Msrp\Pricing\Price\MsrpPrice</item>
            <item name="custom_option_price" xsi:type="string">Magento\Catalog\Pricing\Price\CustomOptionPrice</item>
            <item name="base_price" xsi:type="string">Magento\Catalog\Pricing\Price\BasePrice</item>
            <item name="configured_price" xsi:type="string">Magento\GiftCard\Pricing\Price\ConfiguredPrice</item>
            <item name="configured_regular_price" xsi:type="string">Magento\Bundle\Pricing\Price\ConfiguredRegularPrice</item>
            <item name="bundle_option" xsi:type="string">Magento\Bundle\Pricing\Price\BundleOptionPrice</item>
            <item name="bundle_option_regular_price" xsi:type="string">Magento\Bundle\Pricing\Price\BundleOptionRegularPrice</item>
            <item name="wishlist_configured_price" xsi:type="string">Magento\GiftCard\Pricing\Price\ConfiguredPrice</item>
        </argument>
    </arguments>
</virtualType>
```
