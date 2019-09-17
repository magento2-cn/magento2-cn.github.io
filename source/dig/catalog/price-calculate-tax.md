## 税率的匹配逻辑

所有类型的 `Tax Rate`（Product、Shipping）都是通过以下两步获得：

- 由 Customer Tax Class 和 Product Tax Class 决定 `Tax Rule`
- 根据参考地址的 Country、State 和 Post Code 匹配与该 `Tax Rule` 关联的 `Tax Rate`


### 用户组的税费类型

前台 Customer Tax Class 由当前用户的用户组决定，这组关联可在后台 ***STORES / Other Settings / Customer Groups*** 进行设置。

默认状态下，游客属于 `NOT LOGGED IN` 组，其 Customer Tax Class 与登录用户一样都是 `Retail Customer`。


### 参考地址的选取

#### 后台税率计算的参考地址

后台产品信息编辑页以 ***SALES / Shipping Settings / Origin*** 设定的地址作为参考地址。

关于后台产品价格设定需要注意的是，当店铺设置 ***SALES / Tax / Calculation Settings > Catalog Prices*** 为 Including Tax 时，后台设置的产品价格不一定已经含税，还要看该产品的 Tax Class 和参考地址是否匹配。 


#### 前台税率计算的参考地址

前台则根据不同的店铺设置、不同的用户状态，以及不同的情景使用不同的参考地址。当 ***SALES / Tax / Calculation Settings / Tax Calculation Based On*** 为默认值 Shipping Address 时如下表：

|         | Product List / Detail | Cart Page Summary  | Shopping Cart |
| --- | --- | --- | --- |
| **计算依据** | 根据当前用户的默认地址进行计算。 | 根据 Estimate Shipping and Tax 所选地区进行计算。 | 根据 Checkout 所填地址进行计算。 |
| **默认状态** | 游客或未设定默认地址的用户计算依据，通过后台 SALES / Tax / Default Tax Destination Calculation 设定。 | Estimate Shipping and Tax 的默认条件，由当前用户的默认地址决定；游客或未设定默认地址的用户的默认条件，通过后台 SALES / Tax / Default Tax Destination Calculation 设定。<br /><br />若选择了 Country 但不选 State，系统会使用 SALES / Tax / Default Tax Destination Calculation > Default State 作为选项。 | 若未选择运送地址，则使用当前用户的默认地址作为依据；<br /><br />游客或未设定默认地址的用户计算依据，通过后台 SALES / Tax / Default Tax Destination Calculation 设定。 |
| **生命周期** | 更改默认地址，或登录/登出都会马上影响 Product List / Detail 页内 Tax 的计算。 | Estimate Shipping and Tax 的生命周期由手动更改或登录/登出后开始，完成下单或登出后结束；<br /><br />Checkout 中修改订单地址不会对其造成影响；<br /><br />游客添加产品并访问 Cart 页面后，Estimate Shipping and Tax 的选项即已保存到 Session，此时到后台修改设置并刷新 Cart 页亦不会使其变化，需登录后登出才可看到效果。 | Shopping Cart 地址的生命周期由手动更改或登出后开始，完成下单或用户登出后结束。 |


## 税费计算方式

系统取按不同优惠规则计算后得到的最小值作为计算基值：

```
min( fn( price, catalog price rule ), special_price )
```

根据不同的店铺设置，有如下区别：

当 ***SALES / Tax / Calculation Settings > Catalog Prices*** 为 Excluding Tax 时（默认），以这个基值作为不含税单价 `base_price`，税费为

```
base_tax_amount = base_price * tax_percent / 100
```

当 ***SALES / Tax / Calculation Settings > Catalog Prices*** 为 Including Tax 时，以这个基值作为含税单价 `base_price_incl_tax`，税费为

```
base_tax_amount = base_price_incl_tax - base_price_incl_tax / ( 1 + tax_percent / 100 )
```



## 税费相关的店铺设置

***SALES / Tax / Shopping Cart Display Settings***

| 设置 | 描述 |
| --- | --- |
| Include Tax In Order Total | Yes - 仅显示带税的 Order Total。<br />No  - 同时显示 Order Total Incl. Tax 及 Order Total Excl. Tax。 |
| Display Full Tax Summary | Yes - 在 Tax 栏出现折叠内容，展开后显示购物车内所有税目的详细情况。<br />No  - 在 Tax 栏仅显示总税价。 |
| Display Zero Tax Subtotal | Yes - 当购物车内所有项目（包括产品及运费）均不含税时，仍显示 Tax 栏。<br />No  - 当购物车内所有项目（包括产品及运费）均不含税时，不显示 Tax 栏。 |

***SALES / Tax / Tax Classes***

| 设置 | 描述 |
| --- | --- |
| Tax Class for Shipping | 选择用于计算运输税的 Tax Rule 关联的 Product Tax Class。 |
| Default Tax Class for Product | 选择用于匹配 Tax Rule 的默认 Customer Tax Class。 |
| Default Tax Class for Customer | 选择用于匹配 Tax Rule 的默认 Product Tax Class。 |

***SALES / Tax / Calculation Settings***

| 设置 | 描述 |
| --- | --- |
| Tax Calculation Method Based On | Unit Price - 基于单个产品计算税费。<br />Row Total  - 基于购物车的一行产品计算税费。<br />Total      - 基于所有产品总价计算税费。 |
| Tax Calculation Based On | Shipping Address - 基于收货地址计算税费，虚拟订单基于账单地址计算税费。<br />Billing Address  - 基于账单地址计算税费。<br />Shipping Orign   - 基于发货地址计算税费。 |
| Catalog Prices | Excluding Tax - 后台产品价格设定不包含税费。<br />Including Tax - 后台产品价格设定已包含税费。 |
| Shipping Prices | Excluding Tax - 后台运费设定不包含税费。<br />Including Tax - 后台运费设定已包含税费。 |
| Apply Customer Tax | After Discount  - 在计算折扣价之后计算税费。<br />Before Discount - 在这算折扣价之前计算税费。 |
| Apply Discount On Prices | 这项设置仅在 Apply Customer Tax 为 After Discount 时生效：<br /><br />Excluding Tax - 折扣不含税费。<br />Including Tax - 折扣已包含税费。 |
| Apply Tax On | Custom price if available - 基于不同产品设置生效之后的价格计算税费。<br />Original price only       - 仅基于产品原价计算税费。 |
| Enable Cross Border Trade | Yes - 当 Catalog Prices 为 Including Tax 时，不管税率为多少均保持该税后价不变。下边举例说明：<br /><br />*设置 Tax Calculation Based On 为 Shipping Address，Catalog Prices 为 Including Tax，一产品在后台设定含税价为 $66.50，默认目的地对应税率为 10%，前台列表页时显示为 $66.50。<br /><br />该项设置为 No（默认值）：当用户把产品加入到购物车并选择一个税率不同于默认地址的运送地，系统会先通过默认地址对应税率和含税价计算得到不含税的价格 $60.45，然后乘上所选运送地对应税率得出最终价格。<br /><br />该项设置为 Yes：用户把产品加入到购物车后，不管选择任何收货地址都不会影响产品含税价，始终为 $66.50。* |

***SALES / Tax / Default Tax Destination Calculation***

| 设置 | 描述 |
| --- | --- |
| Default Country | 用于匹配 Tax Rate 的默认地址。 |
| Default State | 用于匹配 Tax Rate 的默认地址。 |
| Default Post Code | 用于匹配 Tax Rate 的默认地址。 |

***SALES / Shipping Settings / Origin***

| 设置 | 描述 |
| --- | --- |
| Country | 发货地址，后台以此地址作为税价计算依据。 |
| Region/State | 发货地址，后台以此地址作为税价计算依据。 |
| ZIP/Postal Code | 发货地址，后台以此地址作为税价计算依据。 |
