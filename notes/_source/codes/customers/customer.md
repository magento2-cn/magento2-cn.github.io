# 用户 Customer

## 用户属性

### 通过 Setup 添加用户属性

```
namespace Namespace\Module\Setup;

use Magento\Customer\Model\Customer;
use Magento\Customer\Model\ResourceModel\Attribute as CustomerAttributeResource;
use Magento\Customer\Setup\CustomerSetupFactory;
use Magento\Eav\Model\Entity\Attribute\ScopedAttributeInterface;
use Magento\Framework\DB\Ddl\Table;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;

class InstallData implements \Magento\Framework\Setup\InstallDataInterface {

    /**
     * @var \Magento\Customer\Model\ResourceModel\Attribute
     */
    private $customerAttributeResource;

    /**
     * @var \Magento\Customer\Setup\CustomerSetup
     */
    private $customerSetup;

    /**
     * @var \Magento\Customer\Setup\CustomerSetupFactory
     */
    private $customerSetupFactory;

    /**
     * @var int
     */
    private $defaultCustomerAttributeSetId;

    public function __construct( CustomerAttributeResource $customerAttributeResource,
            CustomerSetupFactory $customerSetupFactory )
    {
        $this->customerAttributeResource = $customerAttributeResource;
        $this->customerSetupFactory = $customerSetupFactory;
    }

    private function addCustomerAttribute()
    {
        /* @var $attributeCode string */
        /* @var $attributeGroupCode string */

        $this->customerSetup->addAttribute( Customer::ENTITY, $attributeCode, [
            'type' => 'int', // datetime, decimal, int, text, varchar
            'label' => 'Attribute Name',
            'input' => 'boolean', // select, text, date, hidden, boolean, multiline, textarea, image, multiselect
            'source' => 'Magento\Eav\Model\Entity\Attribute\Source\Boolean',
            'required' => false,
            'user_defined' => true, // eav_attribute
            'system' => false, // customer_eav_attribute
            'is_visible' => true, // set to false if no need to show in front-end
            'is_used_in_grid' => true,
            'is_visible_in_grid' => true,
            'is_filterable_in_grid' => true,
            'is_searchable_in_grid' => true
        ] );

        /**
         * Both 'customer_account_edit' and 'adminhtml_customer' are required if we need
         *     to show the attribute in backend customer edit page.
         */
        $attribute = $this->customerSetup->getEavConfig()->getAttribute( Customer::ENTITY, $attributeCode );
        $this->customerAttributeResource->save( $attribute->addData( [ 'used_in_forms' => [
            'adminhtml_checkout', 'adminhtml_customer', 'adminhtml_customer_address',
            'customer_account_create', 'customer_account_edit', 'customer_address_edit', 'customer_register_address'
        ] ] ) );

        $attributeGroupId = (int) $this->customerSetup->getAttributeGroupByCode( Customer::ENTITY, $this->defaultCustomerAttributeSetId, $attributeGroupCode, 'attribute_group_id' ); // eav_attribute_group
        $this->customerSetup->addAttributeToSet( Customer::ENTITY, $this->defaultCustomerAttributeSetId, $attributeGroupId, $attribute->getId() );
    }

    public function install( ModuleDataSetupInterface $setup, ModuleContextInterface $context )
    {
        $this->customerSetup = $this->customerSetupFactory->create( [ 'setup' => $setup ] );
        $this->defaultCustomerAttributeSetId = $this->customerSetup->getDefaultAttributeSetId( Customer::ENTITY );

        $this->addCustomerAttribute();
    }
}
```


## 数据操作


### 保存数据

```php
use Magento\Customer\Api\CustomerMetadataInterface;

/* @var $customerId int */
/* @var $customerFactory \Magento\Customer\Model\CustomerFactory */
/* @var $customerResource \Magento\Customer\Model\ResourceModel\Customer */
$customer = $customerFactory->create()
    ->setAttributeSetId( CustomerMetadataInterface::ATTRIBUTE_SET_ID_CUSTOMER );
$customerResource->load( $customer, $customerId );
$customerResource->save( $customer );
```

### 通过数据库修改密码

```sql
SET @email = 'email@example.com', @passwd = '123456', @salt = MD5( RAND() );

UPDATE `customer_entity`
SET `password_hash` = CONCAT( SHA2( CONCAT( @salt, @passwd ), 256 ), ':', @salt, ':1')
WHERE `email` = @email;
```
