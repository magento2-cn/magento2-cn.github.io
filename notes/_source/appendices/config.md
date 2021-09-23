# 组件配置文件

## 索引表

下表部分文件链接为外部链接，部分为本页锚点。

|配置文件|说明|适用范围|
|---|---|---|
|[di.xml](notes/codes/others/di.html)|Dependency injection configuration|primary, global, area|
|module.xml|Defines module config data and soft dependency|primary, global|
|cache.xml|Cache type declaration|primary, global|
|config.xml|System configuration|primary, global|
|mview.xml|MView configuration|primary, global|
|address_formats.xml|Address format declaration|primary, global|
|analytics.xml|Advanced reporting|primary, global|
|payment.xml|Payment module configuration|primary, global|
|events.xml|Event/observer configuration|global, area|
|[acl.xml](notes/appendices/config.html#acl.xml)|Access Control List|global|
|catalog_attributes.xml|Catalog attributes configuration|global|
|communication.xml|Defines aspects of the message queue system|global|
|crontab.xml|Configures cron groups|global|
|cron_groups.xml|Specifies cron group options|global|
|db_schema.xml|Declarative schema|global|
|eav_attributes.xml|Provides EAV attributes configuration|global|
|[email_templates.xml](notes/appendices/config.html#email_templates.xml)|Email templates configuration|global|
|esconfig.xml|Elasticsearch locale stopwords config|global|
|export.xml|Export entity configuration|global|
|extension_attributes.xml|Extension attributes|global|
|fieldset.xml|Defines fieldsets|global|
|indexer.xml|Declares indexers|global|
|import.xml|Declares import entities|global|
|persistent.xml|Magento_Persistent configuration file|global|
|pdf.xml|PDF settings|global|
|product_options.xml|Provides product options configuration|global|
|product_types.xml|Defines product type|global|
|queue_consumer.xml|Defines the relationship between an existing queue and its consumer|global|
|queue_publisher.xml|Defines the exchange where a topic is published.|global|
|queue_topology.xml|Defines the message routing rules, declares queues and exchanges|global|
|reports.xml|Advanced reports|global|
|resources.xml|Defines module resource|global|
|sales.xml|Defines sales total configuration|global|
|search_engine.xml|Provides search engine configuration|global|
|search_request.xml|Defines catalog search configuration|global|
|validation.xml|Module validation configuration file|global|
|view.xml|Defines Vendor_Module view config values|global|
|webapi.xml|Configures a web API|global|
|webapi_async.xml|Defines REST custom routes|global|
|widget.xml|Defines widgets|global|
|zip_codes.xml|Defines zip code format for each country|global|
|[routes.xml](notes/appendices/config.html#routes.xml)|Route configuration|area|
|sections.xml|Defines actions that trigger cache invalidation for private content blocks|frontend|
|[menu.xml](notes/appendices/config.html#menu.xml)|Defines menu items for admin panel|adminhtml|
|system.xml|Defines options for system configuration page|adminhtml|

## 示例及说明

### acl.xml

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Acl/etc/acl.xsd">
    <acl>
        <resources>
            <resource id="Magento_Backend::admin">
                <resource id="Vendor_MyModule::menu" title="Custom Menu" sortOrder="10">
                    <resource id="Vendor_MyModule::create" title="Create" sortOrder="50"/>
                    <resource id="Vendor_MyModule::delete" title="Delete" sortOrder="100"/>
                    <resource id="Vendor_MyModule::view" title="View" sortOrder="150">
                        <resource id="Vendor_MyModule::view_additional" title="View Additional Information" sortOrder="10"/>
                    </resource>
                </resource>
            </resource>
        </resources>
    </acl>
</config>
```

|属性|说明|
|---|---|
|`id`|ACL 规则名，格式为 Vendor_ModuleName::resource_name|
|`title`|后台用户角色编辑页面中显示的标题|
|`sortOrder`|排序|

### email_templates.xml

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Email:etc/email_templates.xsd">
    <template id="email_test_template" module="Vendor_Module" area="adminhtml"
              label="Template Label" file="template_file_name.html" type="html"/>
</config>
```

|属性|说明|
|---|---|
|`id`|邮件模板唯一标识|
|`module`|模板的所属组件|
|`area`|邮件发送域，frontend 或 adminhtml|
|`label`|后台 store config 中模板选项的标题|
|`file`|模板文件相对 `[module_root]/view/[area]/email` 的路径|
|`type`|邮件内容的类型，html 或 text|

### menu.xml

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Backend:etc/menu.xsd">
    <menu>
        <add id="Vendor_MyModule::menu" resource="Vendor_MyModule::menu"
             module="Vendor_MyModule"
             title="Custom Menu" sortOrder="10"/>
        <add id="Vendor_MyModule::create" parent="Vendor_MyModule::menu"
             module="Vendor_MyModule" resource="Vendor_MyModule::create"
             title="Create" action="custommenu/create/index" sortOrder="10"/>
    </menu>
</config>
```

|属性|说明|
|---|---|
|`id`|菜单项唯一标识，格式为 Vendor_ModuleName::resource_name|
|`parent`|上级菜单 id|
|`module`|此菜单项的所属组件|
|`resource`|用于控制访问权限的 [ACL 规则](notes/appendices/config.html#acl.xml) 名|
|`title`|菜单标题|
|`action`|链接路径，格式为 front_name/controller_path/action|
|`sortOrder`|排序|

### routes.xml

```xml

<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:App/etc/routes.xsd">
    <router id="adminhtml">
        <route id="route_id" frontName="front-name">
            <module name="Vendor_ModuleName" before="Magento_Backend"/>
        </route>
    </router>
</config>
```

|属性|说明|
|---|---|
|`router/@id`|路由器名，`frontend` 或 `admin`|
|`router/route/@id`|路由名，也是相关 layout 配置文件名的第一部分|
|`router/route/@frontName`|链接路径的第一部分|
|`router/route/module/@name`|所属组件|
|`router/route/module/@before`|设定该路由在哪个组件之前进行处理，通常用于后台配置：Magento_Backend|
|`router/route/module/@after`|设定该路由在哪个组件之后进行处理|
