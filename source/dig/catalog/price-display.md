## 概述

Magento 通过以下两个 layout 定义了每个页面的默认价格渲染器：

- `Magento_Catalog/view/layout/base/empty.xml`
- `Magento_Catalog/view/layout/base/defalut.xml`

渲染器的具体内容则由如下 layout 定义：

- `Magento_Catalog/view/layout/base/catalog_product_prices.xml`

从该 layout 的内容可以看出，产品价格的显示都由 `\Magento\Framework\Pricing\Render\PriceBox` 这个类控制，不同类型的价格（special price、configured price、custom option price、tier price、final price 等）通过不同的模板输出。



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
