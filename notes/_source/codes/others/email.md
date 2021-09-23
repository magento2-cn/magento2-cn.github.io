# 邮件发送

Magento 2 采用 Lamina（原 Zend）mail 发邮件。

发送自定义邮件先初始化：

```php
use Magento\Framework\Mail\Template\TransportBuilder;
use Magento\Framework\App\Area;
use Magento\Store\Model\Store;

/** @var TransportBuilder $transportBuilder */
/** @var array $variables */
/** @var string $fromMail */
/** @var string $fromName */
/** @var string $toMail */
$transport = $transportBuilder
    ->setTemplateIdentifier('email_test_template')
    ->setTemplateVars($variables)
    ->setTemplateOptions(['area' => Area::AREA_ADMINHTML, 'store' => Store::DEFAULT_STORE_ID])
    ->setFromByScope(['email' => $fromMail, 'name' => $fromName])
    ->addTo($toMail)
    ->getTransport();
```

其中 `email_test_template` 是邮件模板 ID，通过 [etc/email_templates.xml](notes/appendices/config.html#email_templates.xml) 定义：

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Email:etc/email_templates.xsd">
    <template id="email_test_template" module="Vendor_Module" area="adminhtml"
              label="Template Label" file="template_file_name.html" type="html"/>
</config>
```

如果不用发送附件，只需再添加如下代码：

```php
$transport->sendMessage();
```

如需添加附件则要：

```php
use Laminas\Mail\Message;
use Laminas\Mime\Message as MimeMessage;
use Laminas\Mime\Mime;
use Laminas\Mime\Part as MimePart;

/** @var string $filepath */
$pathInfo = pathinfo($filepath);
$fileInfo = finfo_open(FILEINFO_MIME);
$mime = finfo_file($fileInfo, $filepath);
finfo_close($fileInfo);
$attachment = new MimePart(fopen($filepath, 'r'));
$attachment->setType($mime)
    ->setFileName($pathInfo['basename'])
    ->setDisposition(Mime::DISPOSITION_ATTACHMENT)
    ->setEncoding(Mime::ENCODING_BASE64);

$emailMessage = $transport->getMessage();
$mimeMessage = $emailMessage->getBody();
$mimeMessage->addPart($attachment);

$message = Message::fromString($emailMessage->toString());
$message->setBody($mimeMessage)->setEncoding('utf-8');

$contentTypeHeader = $message->getHeaders()->get('Content-Type');
$contentTypeHeader->setType('multipart/related');

(new Sendmail())->send($message);
```

注意，这里没有使用 `$transport->sendMessage()`，可能导致某些 SMTP 组件不生效，需另找实现方式。
