# 购物车的价格记录

## 数据表字段分析

### quote

|字段|描述|
|---|---|
|global\_currency\_code|默认 currency code|
|base\_currency\_code|下单网站的 base currency code|
|store\_currency\_code|下单网站的默认 currency code|
|quote\_currency\_code|订单 currency code|
|store\_to\_base\_rate|？|
|store\_to\_quote\_rate|？|
|base\_to\_global\_rate|？|
|base\_to\_quote\_rate|用于计算的汇率|
|base\_subtotal|折前不含税总额|
|base\_subtotal\_with\_discount|折后不含税总额|
|subtotal|折前不含税总额|
|subtotal\_with\_discount|折后不含税总额|


### quote_item

|字段|描述|
|---|---|
|base\_price|不含税单价：<br />- Catalog Prices 为 Excluding Tax：min price<br />- Catalog Prices 为 Including Tax：`base_price_incl_tax` - `base_tax_amount`|
|base\_price\_incl\_tax|含税单价：<br />- Catalog Prices 为 Excluding Tax：`base_price` + `base_tax_amount`<br />- Catalog Prices 为 Including Tax：min price|
|qty|行数量|
|discount\_percent|折扣百分比|
|base\_discount\_amount|行总折扣金额|
|tax\_percent|税率|
|base\_tax\_amount|行税额：<br />- Catalog Prices 为 Excluding Tax：`base_price` * `tax_percent` / 100<br />- Catalog Prices 为 Including Tax：`base_price_incl_tax` * (1 - 1 / (1 + `tax_percent` / 100))|
|base\_row\_total|行不含税总额 base\_price * qty|
|base\_row\_total\_incl\_tax|行含税总额 base\_price\_incl\_tax * qty|
|base\_discount\_tax\_compensation\_amount|行折后税差额：<br />- Apply Customer Tax 为 Before Discount：0<br />- Apply Customer Tax 为 After Discount，Catalog Prices 为 Excluding Tax：`base_tax_amount` - (`base_row_total_incl_tax` - `base_discount_amount`) * `tax_percent` / 100<br />- Apply Customer Tax 为 After Discount，Catalog Prices 为 Excluding Tax：`base_tax_amount` - (`base_row_total_incl_tax` - `base_discount_amount`) * (1 - 1 / (1 + `tax_percent` / 100))|
|base\_tax\_before\_discount|?|
|price|不含税单价|
|price_incl\_tax|含税单价|
|discount\_amount|行总折扣金额|
|tax\_amount|行税额|
|row\_total|行不含税总价|
|row\_total\_incl\_tax|行含税总价|
|discount\_tax\_compensation\_amount|行折后税差额|
|tax\_before\_discount|?|

