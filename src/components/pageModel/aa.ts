

interface Funcjson {
    // 方法名称 对应dom中的名称
    // 如果方法名称中含有axios字符串  则认为是需要发请求的方法
    funcName: string,

    // 下面为发请求时的参数
    method: 'get' | 'post' | 'delete'
    url: string
    params: object

    // 执行的方法内容
    // 方法中默认需要的数据为data
    // 点击事件默认接收的参数为obj
    onFunc: string

    // 是否延迟执行
    // 比如图标的执行方法需要放到dom绘制完成之后
    // 默认false
    deferred: boolean
}