## 基本规则

价格计算有如下基本规则：

- 所有计算均基于 base currency

- 取按不同优惠规则计算后得到的最小值作为基值：<br />
`min( fn( price, catalog price rule ), special_price )`

- 当 ***SALES / Tax / Calculation Settings > Catalog Prices*** 为 Excluding Tax 时（默认），以这个基值作为不含税单价 base\_price<br />
`base_tax_amount = base_price * tax_percent / 100`

- 当 ***SALES / Tax / Calculation Settings > Catalog Prices*** 为 Including Tax 时，以这个基值作为含税单价 base\_price\_incl\_tax<br />
`base_tax_amount = base_price_incl_tax - base_price_incl_tax / ( 1 + tax_percent / 100 )`


## 计价过程简述

下单过程中，商品价格计算由 Quote 组件进行处理，里边涉及两层循环，流程大致如下：

```
\Magento\Quote\Model\Quote :: collectTotals
    \Magento\Quote\Model\Quote\TotalsCollector :: collect
        [ event : sales_quote_collect_totals_before ]

        // 多地址累加，包括 billing（virtual product）及 shipping
        foreach ( \Magento\Quote\Model\Quote :: getAllAddresses )
            \Magento\Quote\Model\Quote\TotalsCollector :: collectAddressTotals
                [ event : sales_quote_address_collect_totals_before ]

                // 多个 collector 分步计算
                foreach ( \Magento\Quote\Model\Quote\TotalsCollectorList :: getCollectors )
                   \Magento\Quote\Model\Quote\Address\Total\CollectorInterface :: collect
                endforeach

                [ event : sales_quote_address_collect_totals_after ]
        endforeach

        [ event : sales_quote_collect_totals_after ]
```

由于 Magento 支持多地址收货，不同地址的商品和运费不一样，因此需要遍历订单中的每个地址并分别进行价格计算，从而最终取得总价，这是第一层循环。

系统对每个地址都用同一套 collector 进行计算，每一个 collector 负责一个类型价格的计算，比如 subtotal、discount、tax 等等，这是第二层循环。


## 原生的 collector

collector 由每个组件的 `etc/sales.xml` 文件定义，原生 collector 的定义就分布在好几个组件中，合并整理后内容如下： 

```xml
<section name="quote">
    <group name="totals">
        <item name="subtotal" instance="Magento\Quote\Model\Quote\Address\Total\Subtotal" sort_order="100">
            <renderer name="adminhtml" instance="Magento\Sales\Block\Adminhtml\Order\Create\Totals\Subtotal"/>
            <renderer name="frontend" instance="Magento\Tax\Block\Checkout\Subtotal"/>
        </item>
        <item name="tax_subtotal" instance="Magento\Tax\Model\Sales\Total\Quote\Subtotal" sort_order="200"/>
        <item name="weee" instance="Magento\Weee\Model\Total\Quote\Weee" sort_order="225"/>
        <item name="shipping" instance="Magento\Quote\Model\Quote\Address\Total\Shipping" sort_order="250">
            <renderer name="adminhtml" instance="Magento\Sales\Block\Adminhtml\Order\Create\Totals\Shipping"/>
            <renderer name="frontend" instance="Magento\Tax\Block\Checkout\Shipping"/>
        </item>
        <item name="tax_shipping" instance="Magento\Tax\Model\Sales\Total\Quote\Shipping" sort_order="300"/>
        <item name="discount" instance="Magento\SalesRule\Model\Quote\Discount" sort_order="400">
            <renderer name="adminhtml" instance="Magento\Sales\Block\Adminhtml\Order\Create\Totals\Discount"/>
            <renderer name="frontend" instance="Magento\Tax\Block\Checkout\Discount"/>
        </item>
        <item name="tax" instance="Magento\Tax\Model\Sales\Total\Quote\Tax" sort_order="450">
            <renderer name="adminhtml" instance="Magento\Sales\Block\Adminhtml\Order\Create\Totals\Tax"/>
            <renderer name="frontend" instance="Magento\Tax\Block\Checkout\Tax"/>
        </item>
        <item name="weee_tax" instance="Magento\Weee\Model\Total\Quote\WeeeTax" sort_order="460"/>
        <item name="grand_total" instance="Magento\Quote\Model\Quote\Address\Total\Grand" sort_order="550">
            <renderer name="adminhtml" instance="Magento\Sales\Block\Adminhtml\Order\Create\Totals\Grandtotal"/>
            <renderer name="frontend" instance="Magento\Tax\Block\Checkout\Grandtotal"/>
        </item>
    </group>
</section>
```


### Subtotal

```
\Magento\Quote\Model\Quote\Address\Total\Subtotal :: collect
    \Magento\Quote\Model\Quote\Address\Total\Subtotal :: _initItem

        $product = $quoteItem->getProduct()

        if ( $quoteItem->getParentItem() && $quoteItem->isChildrenCalculated() ) :
            $parentItem = $quoteItem->getParentItem()
            $parentProduct = $parentItem->getProduct()
            $finalPrice = $parentProduct->getPriceModel()->getChildFinalPrice( $parentProduct, $parentItem->getQty(), $product, $quoteItem->getQty() )

        else : // 所有原生产品类型（simple、configurable、bundle 等等）均在此列
            $finalPrice = $product->getFinalPrice( $quoteItem->getQty() )
                \Magento\Bundle\Model\Product\Price :: getFinalPrice( $qty, $product )
                \Magento\Downloadable\Model\Product\Price :: getFinalPrice( $qty, $product )
                \Magento\GiftCard\Model\Catalog\Product\Price\Giftcard :: getFinalPrice( $qty, $product )
                \Magento\GroupedProduct\Model\Product\Type\Grouped\Price :: getFinalPrice( $qty, $product )
                \Magento\ConfigurableProduct\Model\Product\Type\Configurable\Price :: getFinalPrice( $qty, $product )
                \Magento\Catalog\Model\Product\Type\Price :: getFinalPrice( $qty, $product )
                    [ event :: catalog_product_get_final_price ]
        endif

        \Magento\Quote\Model\Quote\Address\Total\Subtotal :: _calculateRowTotal
            \Magento\Quote\Model\Quote\Item\AbstractItem :: setPrice
            \Magento\Quote\Model\Quote\Item\AbstractItem :: setBaseOriginalPrice
            \Magento\Quote\Model\Quote\Item\AbstractItem :: calcRowTotal
```


### Subtotal Tax

```
\Magento\Tax\Model\Sales\Total\Quote\Subtotal :: collect
    // 这里会通过有别于 \Magento\Quote\Model\Quote\Address\Total\Subtotal 的方法改变 subtotal 的值
    \Magento\Tax\Model\Sales\Total\Quote\CommonTaxCollector :: mapItems
    \Magento\Tax\Model\Sales\Total\Quote\CommonTaxCollector :: processProductItems
```


### WEEE

WEEE 是欧盟关于报废电子电器的回收指令，出口到欧盟的电子产品都需要注册回收，认证检测需要一定的费用。

```
\Magento\Weee\Model\Total\Quote\Weee :: collect
```


### Shipping

```
\Magento\Quote\Model\Quote\Address\Total\Shipping :: collect
```


### Shipping Tax

```
\Magento\Tax\Model\Sales\Total\Quote\Shipping :: collect
```


### Discount

```
\Magento\SalesRule\Model\Quote\Discount :: collect
    foreach ( $items as $item )
        \Magento\SalesRule\Model\Validator :: process( $item )
            \Magento\SalesRule\Model\RulesApplier :: applyRules( $item, $rules )
                foreach ( $rules as $rule )
                    \Magento\SalesRule\Model\Utility :: canProcessRule
                    \Magento\Rule\Model\Action\Collection [ Magento\Rule\Model\Condition\Combine ] :: validate
                    \Magento\SalesRule\Model\RulesApplier :: applyRule( $item, $rule )
                        \Magento\SalesRule\Model\RulesApplier :: getDiscountData( $item, $rule )
                            xxx [ Magento\SalesRule\Model\Rule\Action\Discount\AbstractDiscount ] :: fixQuantity( $qty, $rule )
                            xxx [ Magento\SalesRule\Model\Rule\Action\Discount\AbstractDiscount ] :: calculate( $rule, $item, $qty )
```


### Tax

```
\Magento\Tax\Model\Sales\Total\Quote\Tax :: collect
```


### WEEE Tax

```
\Magento\Weee\Model\Total\Quote\WeeeTax :: collect
```


### Grand Total

```
\Magento\Quote\Model\Quote\Address\Total\Grand :: collect
```
