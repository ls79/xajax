/*
 * Module:  	xajax.js
 * Version: 	0.44 
 * Desc:    	simple ajax class
 * Last Update: 2014-03-24
 * Author:  	ls
 * E-Mail:  	csacred79@gmail.com
 * Site:    	http://www.csacred.com
 * Copyright (c) 2007-2014
 * Thanks dojo (http://dojotoolkit.org)
 */
(function() {    
    if (typeof xajax === 'undefined') {
        xajax = {
            version: {
                major: 0, minor: 4, patch: 4,
                toString: function() {
                    return this.major + '.' + this.minor + '.' + this.patch;
                }
            }
        };
    }

    var _x = xajax;
    var _doc = window.document;

    xajax.ERR_OK = 0;
    xajax.ERR_EXCEPTION = 1;
    xajax.ERR_TIMEOUT = 2;

    xajax.$ = function() {
        var es = new Array(),n = arguments.length;
        for (var i = 0; i < n; i++) {
            var e = arguments[i];
            if (typeof e === 'string') {
                e = _doc.getElementById(e);
            }
            if (n === 1) {
                return(e);
            }
            es.push(e);
        }
        return(es);
    };
    xajax.$N = function() {
        var es = new Array(),n = arguments.length;
        for (var i = 0; i < n; i++) {
            var e = arguments[i];
            if (typeof e === 'string') {
                e = _doc.getElementsByName(e);
            }
            if (n === 1) {
                return(e);
            }
            es.push(e);
        }
        return(es);
    };
    _x.xhrObj = function() {
        var _xhr=null;        
        if (window.XMLHttpRequest) {/* FireFox\Opera\Safari\Chrome ... */
            try {
                _xhr = new XMLHttpRequest();
            } catch (ff) {
            }
        }
        else if (window.ActiveXObject) { /* MSIE */
            var xml = ['Microsoft.XMLHTTP','Msxml2.XMLHTTP','MSXML2.XMLHTTP.4.0'];
            for (var i = 0; i < 3; i++) {
                try {
                    _xhr = new ActiveXObject(xml[i]);
                    break;
                } 
                catch (ie) {
                }
            } /* IE */
        }/*IE */
        return(_xhr);
    };
    _x.ioSetArgs = function(args) {
        var ioArgs = {args: args, url: args.url};
        
        ioArgs.async= (typeof args.async==='undefined')?true:false;        
        ioArgs.query = args.data;
        ioArgs.contentType = args.contentType || null;
        ioArgs.handleAs = args.handleAs || 'text';
        ioArgs.handle = args.handle;
        ioArgs.error = args.error || null;
        ioArgs.timeout = 0 || args.timeout * 1000;
        ioArgs.response = null;
        ioArgs.status = 0;
        ioArgs.err = null;
        ioArgs.errno = xajax.ERR_OK;

        return(ioArgs||null);
    };
    _x.ioresponse = function(ioArgs) {
        var obj = null;

        ioArgs.status = ioArgs.xhr.status;
        ioArgs.response = ioArgs.xhr.responseText;
        switch (ioArgs.handleAs) {
            case 'text':
                obj = ioArgs.response;
                break;
            case 'json':
                try {
                    obj = eval('(' + ioArgs.response + ')');
                }
                catch (e) {
                    ioArgs.err = e.description;
                    ioArgs.errno = xajax.ERR_EXCEPTION;
                }
                break;
            case 'xml':
                obj = ioArgs.xhr.responseXML;
                break;
            case 'javascript':
                try {
                    obj = eval(ioArgs.response);
                }
                catch (e) {
                    ioArgs.err = e.description;
                    ioArgs.errno = xajax.ERR_EXCEPTION;
                }
                break;
            default:
                obj = ioArgs.response;
                break;
        }
        return(obj);
    };
    _x.ioNotifyStart = function(ioArgs) {
        if (ioArgs.timeout > 0) {
            ioArgs.starttime = (new Date()).getTime();
            ioArgs.objTimeout = setInterval(_x.ioInterval, 50);
        }
        ioArgs.xhr.onreadystatechange = function() {
            if (ioArgs.xhr.readyState === 4) {
                if (ioArgs.timeout > 0) {
                    clearInterval(ioArgs.objTimeout);
                }
                ioArgs.handle(_x.ioresponse(ioArgs), ioArgs);
            }
        };
    };
    _x.ioInterval = function() {
        var now = (new Date()).getTime();
        if ((now - _x.ioArgs.starttime) > _x.ioArgs.timeout) {
            _x.cancel();
            _x.ioArgs.errno = xajax.ERR_TIMEOUT;
            if (_x.ioArgs.error) {
                _x.ioArgs.error(_x.ioArgs);
            }
        }
    };
    _x.xhr = function(method, args, hasBody) {
        var xhr = null;

        var ioArgs = _x.ioSetArgs(args);
        xhr = ioArgs.xhr = _x.xhrObj();
        _x.ioArgs = ioArgs;
        if (xhr === null) {
            return(null);
        }
        try {
            xhr.open(method, ioArgs.url, ioArgs.async);
            _x.ioNotifyStart(ioArgs);
            if (args.contentType) {
                xhr.setRequestHeader('Content-Type', args.contentType);
            }
            if (args.headers) {
                for (var hdr in args.headers) {
                    xhr.setRequestHeader(hdr, args.headers[hdr]);
                }
            }
            xhr.send(ioArgs.query);
        }
        catch (e) {
            _x.cancel();
            ioArgs.err = e.description;
            ioArgs.errno = xajax.ERR_EXCEPTION;
            if (ioArgs.error) {
                ioArgs.error(ioArgs);
            }
        }
        return(ioArgs||null);
    };
    xajax.cancel = function() {
        if (_x.ioArgs.xhr) {
            if (_x.ioArgs.timeout > 0) {
                clearInterval(_x.ioArgs.objTimeout);
            }
            _x.ioArgs.xhr.abort();
        }
    };
    xajax.Get = function(args) {
        return(_x.xhr('GET', args));
    };
    xajax.Post = function(args) {
        args.contentType = 'application/x-www-form-urlencoded';
        return(_x.xhr('POST', args, true));
    };    
    xajax.isArray = function(args) {
        return(args && (args instanceof Array || typeof args === 'array')); // Boolean
    };
    xajax.isFunction = function(args) {
        return(args && (typeof args === 'function'));
    };
    xajax.setValue = function(obj, key, value) {        
        if (value === null) {
            return;
        }
        var val = obj[key];
        if (typeof val === 'string') { // inline'd type check
            obj[key] = [val, value];
        }
        else if (_x.isArray(val)) {
            val.push(value);
        }
        else {
            obj[key] = value;
        }
    };
    xajax.fieldToObject = function(item) {
        var ret = null;

        if (item) {
            var name = item.name,type = (item.type || '').toLowerCase();
            if (name && type && !item.disabled) {
                if (type ==='radio' || type === 'checkbox') {
                    if (item.checked) {
                        ret = item.value;
                    }
                }
                else if (item.multiple) {
                    ret = [];
                    var opt = item.options,n = opt.length;
                    for (var i = 0; i < n; i++) {
                        if (opt[i].selected) {
                            ret.push(opt.value);
                        }
                    }
                } else {
                    ret = item.value;
                }
            }
        }
        return(ret); // Object	
    };
    xajax.objectToQuery = function(obj) {
        var enc = encodeURIComponent,pairs = [],backstop = {};
        for (var key in obj) {
            var value = obj[key];
            if (value !== backstop[key]) {
                var assign = enc(key) + '=';
                if (_x.isArray(value)) {
                    for (var i = 0, n = value.length; i < n; i++) {
                        pairs.push(assign + enc(value[i]));
                    }
                }
                else {
                    pairs.push(assign + enc(value));
                }
            }
        }
        return(pairs.join('&')); // String
    };
    xajax.formToObject = function(obj) {
        var el = obj.elements,n = el.length,s = {},exclude = 'file|submit|image|reset|button|';

        for (var i = 0; i < n; i++) {
            var item = el[i],name = item.name,type = (item.type || '').toLowerCase();
            if (name && type && exclude.indexOf(type) === -1 && !item.disabled) {
                _x.setValue(s, name, _x.fieldToObject(item));
            }
        }
        return(s);
    };
    xajax.formToQuery = function(obj) {
        return(_x.objectToQuery(_x.formToObject(obj)));
    };
})();