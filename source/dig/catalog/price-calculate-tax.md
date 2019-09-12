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

#### 前台税率计算的参考地址

前台则根据不同的商铺设置、不同的用户状态，以及不同的情景使用不同的参考地址。当 ***SALES / Tax / Calculation Settings / Tax Calculation Based On*** 为默认值 Shipping Address 时如下表：

|         | Product List / Detail | Cart Page Summary  | Shopping Cart |
| --- | --- | --- | --- |
| **计算依据** | 根据当前用户的默认地址进行计算。 | 根据 Estimate Shipping and Tax 所选地区进行计算。 | 根据 Checkout 所填地址进行计算。 |
| **默认状态** | 游客或未设定默认地址的用户计算依据，通过后台 SALES / Tax / Default Tax Destination Calculation 设定。 | Estimate Shipping and Tax 的默认条件，由当前用户的默认地址决定；游客或未设定默认地址的用户的默认条件，通过后台 SALES / Tax / Default Tax Destination Calculation 设定。<br /><br />若选择了 Country 但不选 State，系统会使用 SALES / Tax / Default Tax Destination Calculation > Default State 作为选项。 | 若未选择运送地址，则使用当前用户的默认地址作为依据；<br /><br />游客或未设定默认地址的用户计算依据，通过后台 SALES / Tax / Default Tax Destination Calculation 设定。 |
| **生命周期** | 更改默认地址，或登录/登出都会马上影响 Product List / Detail 页内 Tax 的计算。 | Estimate Shipping and Tax 的生命周期由手动更改或登录/登出后开始，完成下单或登出后结束；<br /><br />Checkout 中修改订单地址不会对其造成影响；<br /><br />游客添加产品并访问 Cart 页面后，Estimate Shipping and Tax 的选项即已保存到 Session，此时到后台修改设置并刷新 Cart 页亦不会使其变化，需登录后登出才可看到效果。 | Shopping Cart 地址的生命周期由手动更改或登出后开始，完成下单或用户登出后结束。 |


## 税费计算方式

税费计算方式根据不同的商铺设置，以及不同的情景而有所区别。
