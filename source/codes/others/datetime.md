时区设置的最小粒度为 Website。

### 获取当前时区的当前时间

```
/* @var $localeDate \Magento\Framework\Stdlib\DateTime\TimezoneInterface */
$now = $localeDate->date()->format( 'Y-m-d H:i:s' );
```

### 获取当前时区时间的 UTC 时间

```
/* @var $localeDate \Magento\Framework\Stdlib\DateTime\TimezoneInterface */
$dateTime = $localeDate->convertConfigTimeToUtc( '2013-09-23 02:23:23', 'Y-m-d H:i:s' );
```

### 获取 GMT 时间在当前时区的表示

```
/* @var $localeDate \Magento\Framework\Stdlib\DateTime\TimezoneInterface */
$dateTime = $localeDate->date( $timestamp )->format( 'Y-m-d H:i:s' );
$dateTime = $localeDate->date( '2013-09-23 02:23:23' )->format( 'Y-m-d H:i:s' );
```

### 获取 GMT 时间在指定时区的表示

```
$time = '2016-07-11 17:30:00';
$timezone = 'Asia/Shanghai';
$format = 'Y-m-d H:i:s';

$dateTime = ( new \DateTime( null, new \DateTimeZone( $timezone ) ) )->setTimestamp( strtotime( $time ) )->format( $format );
```
