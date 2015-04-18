xajax使用文档

刚接触ajax时(2007年)，自己开始封装ajax函数，最早是函数形式；2011年用js比较多，参照dojo定型为现在的模式（再次致谢dojo）。
提交数据时通常是提交form，最早每次去组合http格式提交字符串，嫌麻烦，剥离dojo的代码封装了form提交函数（参数自动编码,函数名都和dojo的一样,致谢dojo）。
* 虽然可以增加其他如PUT、DELETE等函数，考虑日常没有使用到没有添加(减小体积?!谁知道呢，我觉得还是自己懒的缘故)。
* 可以添加xajax.PostForm(...)这样的函数，考虑到有些时候提交几个form或者还要附加一些其他数据，故此不加！
	例子： var data = xajax.formToQuery(xajax.$('frmid')) + '&' + xajax.objectToQuery({'_xsrf':'0ed7684bffc4425883b1e3f824b53259','encoding':'utf-8'})

	ps: 挺灵活的，可能是用C久了后遗症吧，能封装一些库函数就满足了。

废话完毕，下面是简单示例：

GET请求：
xajax.Get({
	url : '/ajax/get?name=ls&age=36&f='+Math.random(),
	handleAs : 'json',
	timeout: 60,
	error : function(ioargs){
		switch(ioargs.errno){
			case xajax.ERR_TIMEOUT:
				alert('timeout');
				break;
			case xajax.ERR_EXCEPTION:
				alert(ioargs.err);
				break;
			default:
				alert('error');
				break;
		}
	},
	handle : function(obj, ioargs) {
		if(obj){
			alert('ok');
		}
		else{
			alert('error')
		}
	}
});

POST请求：

var data = 'name=ls&age=35';
/**
	form窗体提交
	data = xajax.formToQuery(xajax.$('frmid'));
	// frmid可以是字符串或form对象
 */
xajax.Post({
	url : '/upload',
	handleAs : 'json',
	headers: {'X-Power': 'xajax0.4', 'Accept-Encoding': 'gzip, deflate, sdch'},
	error : function(ioargs){
		alert('error');
	},
	handle : function(obj, ioargs) {
		alert('response');
	},
	data : data
});

属性
ERR_OK			成功
ERR_EXCEPTION	异常
ERR_TIMEOUT		超时

方法
公有
***********************
$				返回指定对象[数组],内部由document.getElementById获取对象;传入多个参数时返回对象数组,参数可以是对象或字符串
***********************
$N				同$,内部由document.getElementsByName获取对象
***********************
xhrObj			获取ajax对象，兼容主流浏览器
***********************
xhr 			ajax请求
    ----------------------------
	@param method	string      // 请求方法，如：GET、POST、PUT、DELETE、HEAD等
	@param args 	object 		// 请求参数对象
	    ----------------------------
		{
			url: '/ajax/...',   // 请求地址,必须;GET时浏览器有缓存,不需要缓存的请添加随机参数
			async: true,		// 是否一步请求: true 是,false 否(同步请求)
			data: null,		    /**
								 * 请求数据,默认为null,通常用于POST等提交数据操作,遵循http标准。
								 *	格式："name=value&key=value"
								 * 注意:GET时不用设置该项
								 */
			contentType: null,	// 请求数据类型
			headers: null,		/**
								 * 请求数据头，keyvalue对象(每项为keyvalue格式)，默认为null，如：
								 * {'Content-Type': 'application/x-www-form-urlencoded', 'X-Power': 'xajax0.4'}
								 */
			handleAs: 'text',	// 请求返回的数据类型,默认为'text',其他可选:'json'、'xml'、'javascript'
			// 返回数据处理回调函数,必须
			handle: function(obj, ioargs){
				/**
				 *	@param obj    object、string或xml object  返回对象(或字符串)
				 *	@param ioargs object  请求状态对象(见下说明)
				*/
			},
			// 错误回调处理函数,默认为null,不处理错误信息
			error: function(ioargs){
				/**
				 * @param ioargs object  请求状态对象(见下说明)
				 */
			},
			timeout: 0			// 请求超时，默认为0时不设置超时时间
		}
		----------------------------
		// 请求状态对象
		{
			status: 0,			// HTTP请求返回状态,如：200,302,404等;为0时请求未完成错误
			err: null,			// 异常错误信息描述
			errno: xajax.ERR_OK	// 错误码, xajax.ERR_OK : 成功, xajax.ERR_EXCEPTION: 异常, xajax.ERR_TIMEOUT: 超时
		}
		----------------------------
	@param hasBody  boolean		是否有请求数据
***********************
cancel			取消请求
***********************
Get 			GET方式发送请求
	@param	args 请求参数，见xhr说明
***********************
Post 			POST方式发送请求，增加请求数据头："Content-Type: application/x-www-form-urlencoded"
	@param	args 请求参数，见xhr说明
***********************
isArray			指定参数是否是数组类型
***********************	
isFunction		指定参数是否是函数类型
***********************
setValue		html input对象keyvalue值存储
	@param obj   object 		  // 值存储对象
	@param key   string/object    // key对象或字符串(checkbox多选、multiple或name相同的为对象)
	@param value string/object    // key对象或字符串(checkbox多选、multiple或name相同的为对象)
***********************
fieldToObject	html input对象转换为keyvalue对象
***********************
objectToQuery	object转换为http请求字符串(自动url编码，编码为utf8格式)，如：{name:'ls',age:36}转换为name=ls&age=35
	@param obj object 转换对象
***********************
formToObject	指定form对象转换为keyvalue对象
	@param obj object form对象
***********************
formToQuery		指定form对象转换为http请求字符串(自动url编码，编码为utf8格式)
	@param obj object form对象

私有
_ioSetArgs		初始参数设置
***********************
_ioResponse		请求返回处理
***********************
_ioNotifyStart  请求通知
***********************
_ioInterval 	超时处理函数