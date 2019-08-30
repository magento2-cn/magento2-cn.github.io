### 记录指定内容到 system.log 文件

```php
/* @var $target mixed */
\Magento\Framework\App\ObjectManager::getInstance()
    ->get( \Psr\Log\LoggerInterface::class )->addCritical( print_r( $target, true ) );
```


### 追踪当前代码的位置

```php
try {
    throw new \Exception( 'debug' );
}
catch ( \Exception $ex ) {
    \Magento\Framework\App\ObjectManager::getInstance()
        ->get( \Psr\Log\LoggerInterface::class )->addCritical( $ex->getTraceAsString() );
}
```


### 通过定制 Helper 记录任意类型变量

类似于 Model 的 `debug` 方法

```php
namespace Namespace\Module\Helper;

use Magento\Framework\App\ObjectManager;
use Psr\Log\LoggerInterface;

class Debug {

    const FLAG_PACKAGE = '__is_debug_data__';
    const STR_PAD = '    ';
    const STR_RECURSION = '*** RECURSION ***';

    /**
     * @var array
     */
    static private $getDataMethods = [ 'getData', 'toArray', '__toArray' ];

    /**
     * @param string $type
     * @param array $result
     * @return array
     */
    static private function encode( $type, $result )
    {
        return [ self::FLAG_PACKAGE => true, 'type' => $type, 'result' => $result ];
    }

    /**
     * @param array $result
     * @param int $level
     * @return string
     */
    static private function getTraceString( $result, $level = 0 )
    {
        $string = '';
        if ( isset( $result[self::FLAG_PACKAGE] ) ) {
            if ( is_array( $result['result'] ) ) {
                $string .= $result['type'] . " {\n" .
                        self::getTraceString( $result['result'], $level + 1 ) .
                        str_repeat( self::STR_PAD, $level ) . "}\n";
            }
            else {
                $string .= $result['type'];
                if ( $result['result'] !== null ) {
                    $string .= '( ' . $result['result'] . ' )';
                }
            }
        }
        else {
            $padding = str_repeat( self::STR_PAD, $level );
            foreach ( $result as $k => $v ) {
                $string .= $padding . '\'' . $k . '\' => ' . self::getTraceString( $v, $level ) . "\n";
            }
        }
        return $string;
    }

    /**
     * @param mixed $var
     * @param boolean $print
     * @param boolean $isInternal
     * @param object $tracedObjects
     * @return string
     */
    static public function traceVar( $var, $print = false, $isInternal = false, &$tracedObjects = [] )
    {
        if ( !$isInternal ) {
            $stringVar = self::getTraceString( self::traceVar( $var, false, true ) );
            if ( $print ) {
                echo $stringVar;
            }
            else {
                ObjectManager::getInstance()->get( LoggerInterface::class )
                        ->addCritical( $stringVar );
            }
            return $stringVar;
        }

        if ( is_scalar( $var ) || $var === null ) {
            return self::encode( gettype( $var ), $var );
        }
        elseif ( is_array( $var ) ) {
            $result = [];
            foreach ( $var as $k => $v ) {
                $result[$k] = self::traceVar( $v, false, true );
            }
            return self::encode( gettype( $var ), $result );
        }
        else if ( is_object( $var ) ) {
            $hash = spl_object_hash( $var );
            if ( isset( $tracedObjects[$hash] ) ) {
                return self::encode( get_class( $var ), self::STR_RECURSION );
            }
            $tracedObjects[$hash] = true;
            $result = [];
            foreach ( get_object_vars( $var ) as $k => $v ) {
                $result[$k] = self::traceVar( $v, false, true );
            }
            foreach ( self::$getDataMethods as $method ) {
                if ( is_callable( [ $var, $method ] ) ) {
                    $result['data'] = self::traceVar( call_user_func( [ $var, $method ] ), false, true );
                    break;
                }
            }
            return self::encode( get_class( $var ), $result );
        }
        else if ( is_callable( $var ) ) {
            return self::encode( gettype( $var ), $var );
        }
    }

}
```

创建此 Helper 后可在任意位置调用如下代码：

```php
/* @var $target mixed */
/* @var $print boolean */
\Namespace\Module\Helper\Debug::traceVar( $target, $print );
```

`$print` 为 true 时直接打印结果，否则将内容记录到 system.log 文件中。
