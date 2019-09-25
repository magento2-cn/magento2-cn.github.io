## 概述

Magento 通过以下两个 layout 定义了每个页面的默认价格渲染器：

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

从中可看出，不同类型产品（default、configurable、bundle、grouped、giftcard）的各种价格（special price、configured price、custom option price、tier price、final price 等等）都是通过不同的渲染类和模板输出的。






## 普通产品

`Magento_Catalog::product/price/final_price.phtml`

`Magento\Catalog\Pricing\Render\FinalPriceBox`


## 可配置产品

Configurable 产品获取每种价格的执行过程当中都会用到 `Magento\ConfigurableProduct\Pricing\Price\LowestPriceOptionsProvider` 这个类，其作用是分别获取各类价格中最低价的那个子产品的 ID。

`Magento_ConfigurableProduct::product/price/final_price.phtml`

`Magento\ConfigurableProduct\Pricing\Render\FinalPriceBox`

### 原价

```
Magento\ConfigurableProduct\Pricing\Price\ConfigurableRegularPrice :: getAmount
    Magento\ConfigurableProduct\Pricing\Price\ConfigurableRegularPrice ::doGetMinRegularAmount
        $products = Magento\ConfigurableProduct\Pricing\Price\LowestPriceOptionsProvider :: getProducts
            Magento\Catalog\Model\ResourceModel\Product\LinkedProductSelectBuilderComposite
                Magento\Catalog\Model\ResourceModel\Product\LinkedProductSelectBuilderByBasePrice :: build
                Magento\Catalog\Model\ResourceModel\Product\LinkedProductSelectBuilderBySpecialPrice :: build
                Magento\Catalog\Model\ResourceModel\Product\LinkedProductSelectBuilderByTierPrice :: build
                Magento\Catalog\Model\ResourceModel\Product\Indexer\LinkedProductSelectBuilderByIndexPrice :: build
                Magento\CatalogRule\Model\ResourceModel\Product\LinkedProductSelectBuilderByCatalogRulePrice :: build
        [foreach] $products
            Magento\Catalog\Pricing\Price\RegularPrice :: getAmount
    Magento\Framework\Pricing\Price\AbstractPrice :: getAmount
```

### 最低价

```
Magento\ConfigurableProduct\Pricing\Price\FinalPrice [Magento\Framework\Pricing\Price\AbstractPrice] :: getAmount
    Magento\ConfigurableProduct\Pricing\Price\FinalPrice :: getValue
        Magento\ConfigurableProduct\Pricing\Price\FinalPriceResolver :: resolvePrice
            Magento\Framework\Pricing\PriceInfo\Base :: getPrice
            Magento\Catalog\Pricing\Price\FinalPrice :: getValue
                Magento\Catalog\Pricing\Price\BasePrice :: getValue
                    [foreach] $price = $Magento\Framework\Pricing\PriceInfo\Base :: getPrices
                        [if] $price instanceof Magento\Framework\Pricing\Price\BasePriceProviderInterface
                            min( $price :: getValue )
```


## 捆绑产品

`Magento_Bundle::product/price/final_price.phtml`

`Magento\Bundle\Pricing\Render\FinalPriceBox`


## 组合产品

`Magento_GroupedProduct::product/price/final_price.phtml`

`Magento\Catalog\Pricing\Render\FinalPriceBox`


## 礼金券

`Magento_GiftCard::product/price/final_price.phtml`

`Magento\GiftCard\Pricing\Render\FinalPriceBox`
