## 概述

### 价格的计算

Magento 通过 `Magento\Framework\Pricing\PriceInfo\Factory`（`Price Info Factory`）为产品对象创建 `Magento\Framework\Pricing\PriceInfo\Base` （`Price Info`）实例来寄存价格信息。这些实例都有一个 `Magento\Framework\Pricing\Price\Collection`（`Price Collection`），不同类型产品的  `Price Collection` 包含不同的 `Magento\Framework\Pricing\Price\Pool`（`Price Pool`），每个 `Price Pool` 又包含若干种计价逻辑。

不同组件的 `di.xml` 定义了不同类型产品的 `Price Info Factory`、`Price Collection`、`Price Pool`，具体结构后面分类型描述。

通过产品对象 `Magento\Catalog\Model\Product` 的 `getPriceInfo` 方法可获得 `Price Info`，再由 `Price Info` 的 `getPrice` 方法得到指定计价逻辑（`regular_price`、`final_price`、`tier_price`、`special_price`、`base_price`、`custom_option_price`、`configured_price`、`configured_regular_price` 等等）的对应类的实例，而价格的显示则是基于这些计价逻辑。


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

各类型产品（default、configurable、bundle、grouped、giftcard）的各种计价逻辑都是由这里指定的渲染类和模板输出的。




## 默认

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

```
Magento\Catalog\Model\Product
    Magento\Framework\Pricing\PriceInfo\Base
        Magento\Framework\Pricing\Price\Collection
            Magento\Framework\Pricing\Price\Pool
                regular_price : Magento\Catalog\Pricing\Price\RegularPrice
                final_price : Magento\Catalog\Pricing\Price\FinalPrice
                tier_price : Magento\Catalog\Pricing\Price\TierPrice
                special_price : Magento\Catalog\Pricing\Price\SpecialPrice
                base_price : Magento\Catalog\Pricing\Price\BasePrice
                custom_option_price : Magento\Catalog\Pricing\Price\CustomOptionPrice
                configured_price : Magento\Catalog\Pricing\Price\ConfiguredPrice
                configured_regular_price : Magento\Catalog\Pricing\Price\ConfiguredRegularPrice
```


`Magento_Catalog::product/price/final_price.phtml`

`Magento\Catalog\Pricing\Render\FinalPriceBox`


## 可配置产品

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

```
Magento\Catalog\Model\Product
    Magento\Framework\Pricing\PriceInfo\Base
        Magento\Framework\Pricing\Price\Collection
            Magento\Framework\Pricing\Price\Pool
                regular_price : Magento\Catalog\Pricing\Price\RegularPrice
                final_price : Magento\Catalog\Pricing\Price\FinalPrice
                tier_price : Magento\Catalog\Pricing\Price\TierPrice
                special_price : Magento\Catalog\Pricing\Price\SpecialPrice
                base_price : Magento\Catalog\Pricing\Price\BasePrice
                custom_option_price : Magento\Catalog\Pricing\Price\CustomOptionPrice
                configured_price : Magento\Catalog\Pricing\Price\ConfiguredPrice
                configured_regular_price : Magento\Catalog\Pricing\Price\ConfiguredRegularPrice
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


### `tier_price`


### `wishlist_configured_price`



## 捆绑产品



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

`Magento_Bundle::product/price/final_price.phtml`

`Magento\Bundle\Pricing\Render\FinalPriceBox`


## 组合产品

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

`Magento_GroupedProduct::product/price/final_price.phtml`

`Magento\Catalog\Pricing\Render\FinalPriceBox`


## 可下载产品



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



## 礼金券



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

`Magento_GiftCard::product/price/final_price.phtml`

`Magento\GiftCard\Pricing\Render\FinalPriceBox`
