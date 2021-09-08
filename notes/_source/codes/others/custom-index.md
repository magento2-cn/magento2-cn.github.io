<br />
`[root]/pub/xxx.php`

```php
require '../app/bootstrap.php';

class Response implements \Magento\Framework\App\ResponseInterface
{
    public function sendResponse()
    {
        // TODO :: Do what you want here
    }
}

class SimpleApp implements \Magento\Framework\AppInterface
{
    /**
     * @var \Magento\Framework\ObjectManager\ObjectManager
     */
    private $objectManager;

    /**
     * @var \Magento\Framework\App\State
     */
    private $state;

    public function __construct(
        \Magento\Framework\App\State $state,
        \Magento\Framework\ObjectManagerInterface $objectManager
    ) {
        $this->objectManager = $objectManager;
        $this->state = $state;
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function launch()
    {
        $this->state->setAreaCode( \Magento\Framework\App\Area::AREA_FRONTEND );
        return $this->objectManager->create( \Response::class );
    }

    /**
     * @param \Magento\Framework\App\Bootstrap $bootstrap
     * @param \Exception                       $exception
     * @return bool
     */
    public function catchException( Bootstrap $bootstrap, \Exception $exception )
    {
        echo $exception->getMessage() . "\n" . $exception->getTraceAsString();
        return true;
    }
}

$bootstrap = Bootstrap::create( BP, array_merge( $_SERVER, [ Bootstrap::INIT_PARAM_FILESYSTEM_DIR_PATHS => [
    DirectoryList::PUB         => [ DirectoryList::URL_PATH => '' ],
    DirectoryList::MEDIA       => [ DirectoryList::URL_PATH => 'media' ],
    DirectoryList::STATIC_VIEW => [ DirectoryList::URL_PATH => 'static' ],
    DirectoryList::UPLOAD      => [ DirectoryList::URL_PATH => 'media/upload' ],
] ] ) );
$bootstrap->run( $bootstrap->createApplication( \SimpleApp::class ) );

```
