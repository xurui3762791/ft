/**
 * @class AsyValidator - 基于jQuery的异步ajax验证插件
 * @jQuery 1.7.1+
 * @author Jacky.Wei 
 * @email weizeya52@126.com
 * @HomePage http://www.designcss.org
*/


;(function(window, $, undefined){
	if(!window.console){
		window.console = {
			log : function(a){}	
		};	
	};
	var opt = Object.prototype.toString;
	
	function getType(a){
		var ret;
		var l = arguments.length;
		if (l === 0 || typeof(a) === "undefined") {
			ret = "undefined"
		} else {
			ret = (a === null) ? "null": opt.call(a)
		};
		return ret
	}
	
	function uid(){
		var guid = "";
		for (var i = 1; i <= 32; i++){
		  var n = Math.floor(Math.random()*16.0).toString(16);
		  guid +=   n;
		  if((i==8)||(i==12)||(i==16)||(i==20))
			guid += "-";
		}
		return guid;    
	}	
	 
	function Once(){
		this._isSubmit = false;
			
	}
	Once.prototype = {
		holder : function(callBack){
			if(this._isSubmit){
				return;
			}
			this._isSubmit = true;
			callBack.call(this);
		},
		reset : function(){
			this._isSubmit = false;
		}
		
	};
	var type = {
		is_array : function(a){
			return getType(a) === "[object Array]";
		},
		is_string : function(a){
			return getType(a) === "[object String]";
		},
		is_number : function(a){
			return getType(a) === "[object Number]";
		},
		is_object : function(a){
			return getType(a) === "[object Object]";
		},
		is_function : function(a){
			return getType(a) === "[object Function]";
		},
		is_null : function(a){
			return getType(a) === "null";
		},
		is_undefined : function(a){
			 return getType(a) === "undefined";
		}
	};
	
	function hasNullItem(obj){
		for (var key in obj){
			if(obj[key] === null){
				return true;
			}
		}
		return false;
	}
	
	function obj2arr(obj){
		var list = [];
		for(var key in obj){
			list.push(obj[key]);
		}
		return list;
	}
	
	function getObjLen(obj){
		var l = 0;
		for(var key in obj){
			l += 1;
		}
		return l;
	}

		
	/**
	 * 返回一个临时类，其原型克隆于某个类的原型，其实例化后用于赋值给某个类的prototype，避免执行parentClass的构造函数
	*/	
	function getExtendedEventClass(parentClass){
		function f(){}
		f.prototype = parentClass.prototype;
		return f;
	}
	
	/**
	 * 继承类
	 * @param {Class} c - 子类
	 * @param {Class} p - 父类
	*/
	function extend(c, p){
		var _f = getExtendedEventClass(p);
		c.prototype = new _f();
		c.prototype.constructor = c;
		c.baseConstructor = p;
		c.superClass = p.prototype;
	}

	/**
	 * 事件对象
	*/
	function Events(){
		this.eventList = {};
	}
	Events.prototype = {
		getEventList : function(event){
			return typeof(this.eventList[event]) !== "undefined" ? this.eventList[event] : [];
		},
		bind : function(event, func){
			this.eventList[event] = this.getEventList(event);
			this.eventList[event].push(func);
			return this;
		},
		trigger : function(event){
			var targetEventList = this.getEventList(event);
			var i = 0;
			var l = targetEventList.length;
			var args = Array.prototype.slice.call(arguments, 1);
			for(; i < l; i++){
				var func = targetEventList[i];
				var rs = func.apply(this, args);
				if(rs === false){
					return false;
				};
			};
			return true;
			
		},
		unbind : function(event){
			if(arguments.length == 0){
				this.eventList = null;
			}else{
				delete this.eventList[event]; 
			}
		}
	};
	
	function AsyValidator(form, options){
		var _this = this;
		AsyValidator.baseConstructor.call(this);
		this.set = $.extend({}, {
			//开始一个验证队列时，验证错误后禁止继续验证
			stopOnError : false,
			//blur后即时验证
			timely : true,
			//缓存校验结果(输入值没有变化，blur 事件后直接从缓存读取验证结果)
			cacheValidResult : true,
			//验证元素列表
			fields : {},
			//验证规则列表	
			rules : {},
			//xhr数据转换列表
			XHRDataAdapters : {},
			//默认xhr数据转换方法
			defaultXHRDataAdapter : function(json){
				return json.code == 200 ? {type : "ok", msg : json.msg} : {type : "error", msg : json.msg};
			},
			//公共验证规则
			commonRules : {},
			//消息dom组装
			msgMaker : function(msg){
				return "<span class='" + msg.type + "'>" + msg.msg + "</span>";
			}
			
		}, options);
		this.form = null;
		this.set.commonRules = $.extend({}, {
			//输入框文本框必填项
			require : function(input, params, field){
				return $.trim(input.val()) == "" ? { type : "error", msg : field.msg.require } : { type : "ok", msg : ""};
			},
			mobile : function(input, params, field){
				return !/^1[3-9]\d{9}$/.test($.trim(input.val())) ? {type : "error", msg : field.msg.mobile} : {type : "ok", msg : "" };
			},
			//单选按钮组判断选定
			radioChecked : function(input, params, field){
				var has = false;
				input.each(function(){
					if(this.checked){
						has = true;
						return false;
					}
				});
				return !has ? {type : "error", msg : field.msg.radioChecked || "请选择" } : {type : "ok", msg : ""} 
			},
			//复选框,params 有2个参数，默认不填为解释为 [1, null]
			//[min, null] - 最少
			//[null, max] - 最多
			//[min, max] - 区间
			checkBoxChecked : function(input, params, field){
				 
				var min = null, max = null, len = params.length, json = {type : null, msg : ""};
				var checkedSize = 0;
				input.each(function(){
					if(this.checked){
						checkedSize += 1;
					}
				});
				var msgs =  {
					min : function(num){
						return "至少选择" + num + "项";
					},
					max : function(num){
						return "最多只能选择" + num + "项";
					},
					between : function(a, b){
						return "请选择" + a + "-" + b + "项";
					}
				};
			
				if(len == 0){
					min = 1;
				}else if(len == 1){
					min = params[0];
				}else if(len == 2){
					min = params[0];
					max = params[1];
				}
				//console.log(min, max); 
				if(min === null && max !== null){
					if(checkedSize > max){
						json.type = "error";
						json.msg = field.msg.checkBoxChecked || msgs.max(max);
					}else{
						json.type = "ok";
					}	
				}else if(min !== null && max === null){
					if(checkedSize < min){
						json.type = "error";
						 
						json.msg = field.msg.checkBoxChecked || msgs.min(min);
					}else{
						json.type = "ok";
					}
				}else if(min !== null && max !== null){
					if(checkedSize < min || checkedSize > max){
						json.type = "error";
						json.msg = field.msg.checkBoxChecked || msgs.between(min, max);
					}else{
						json.type = "ok";
					}
				}
				return json;
			}

		}, this.set.commonRules);
		this.commonRules = this.set.commonRules;
		this.rules = this.set.rules;
		this.fields = this.set.fields;
		//验证状态列表
		this.fieldsStateList = {};
		this.XHRDataAdapters = this.set.XHRDataAdapters;
		//验证form是否存在
		if(!form){
			console.log("undefined form");
			return false;
		}
		form = $(form).eq(0);
		if(form.size() == 0){
			console.log("undefined form");
			return false;
		}
		this.form = form;
		this.init();
		
	}
	extend(AsyValidator, Events);
	AsyValidator.Once = Once;
	AsyValidator.prototype = $.extend({}, AsyValidator.prototype, {
		isXHRPromise : function(o){
			return type.is_object(o) && type.is_function(o.then);
		},
		getXHRDataAdapter : function(rule){
			return this.XHRDataAdapters[rule] || this.set.defaultXHRDataAdapter;
		},
		getField : function(fieldKey){
			var field = this.fields[fieldKey];
			if(field){
				field.key = fieldKey;
			}
			return field || null;
		},
		
		getRule : function(ruleName){
			return this.rules[ruleName] || this.commonRules[ruleName] || null;
		},
		initField : function(fieldKey){
			var _this = this;
			var input = this.getInput(fieldKey);
			var field = this.getField(fieldKey);
			var isValiding = false;
			var once = new Once();
			field.key = fieldKey;
			if(!input){
				return;
			}
			input.on("blur.asyVaidInput", function(){
				if(!_this.set.timely){
					return false;
				}
				once.holder(function(){
					_this.initFieldValidByFieldKey(fieldKey, function(){
						once.reset();
					}, function(){
						once.reset();
					});
				});
			}).on("change.asyVaidInput", function(){
				_this.resetFieldState(fieldKey);
			});
		},
		resetFieldState : function(fieldKey){
			delete this.fieldsStateList[fieldKey];
		},
		unbindEvents : function(){
			var _this = this;
			$.each(this.fields, function(fieldKey, field){
				var input = _this.getInput(fieldKey);
				var field = _this.getField(fieldKey);
				console.log(field);
				_this.unbindInput(input);
			});
			this.form.off("click.asyValidatorFormBubble");
			this.form.off("submit.asyValidatorForm");
		},
		unbindInput : function(input){
			if(input){
				input.off("blur.asyValidatorInput").off("change.asyValidatorInput");
			}
		},
		destroy : function(){
			this.unbindEvents();
		},
		init : function(){
			var _this = this;
			var form = this.form;
			var once = new Once();
			$.each(this.fields, function(fieldKey, field){
				_this.initField(fieldKey);
			});
			this.form.on("submit.asyVaidForm", function(e){
				e.preventDefault();	
				once.holder(function(){
					var stopOnError = _this.set.stopOnError;
					var rs = _this.trigger("form.beforeValid", form);
					if(rs === false){
						return;
					}
					_this.multiVald(_this.getFieldKeys(), function(errorList, okList){
						_this.trigger("form.afterValid", errorList, form);
						if(errorList.length > 0){
							_this.trigger("form.validError", errorList, form);
						}else{
							_this.trigger("form.validSuccess", okList, form);
						}
						once.reset();
					});
				});
			});
			this.form.on("click.asyValidatorFormBubble", "[type='checkbox'], [type='radio']", function(e){
				var t = $(this);
				_this.resetFieldState(t.attr("name"));
				t.trigger("blur.asyVaidInput");
			});
		},
		
		getFieldKeys : function(){
			var rs = [];
			$.each(this.fields, function(key){
				rs.push(key);
			});
			return rs;
		},
		
		getFields : function(keys){
			var _this = this;
			var fields2Arr = [];
			$.each(keys, function(i, fieldKey){
				var field = _this.getField(fieldKey);
				field.key = fieldKey;
				fields2Arr.push({
					field : field,
					fieldKey : fieldKey
				});
			});
			return fields2Arr;
			
		},
		
		/**
		 * 批量验证
		 * @param {Array} fieldKeyList 验证field key列表
		 * @param {Function} endCallback 验证结束的回调
		*/
		multiVald : function(fieldKeyList, endCallback){
			var _this = this;
			endCallback = endCallback || function(){};
			var stopOnError = _this.set.stopOnError;
			var promiseList = [];
			var fields2Arr = this.getFields(fieldKeyList);
			var closureLen = 0;
			var errorList = [];
			var okList = [];
			var index = -1;
			var fields = {};
			
			if(!stopOnError){
				$.each(fields2Arr, function(i, f){
					var fieldKey = f.fieldKey;
					_this.initFieldValidByFieldKey(fieldKey, function(json){
						okList.push(json);
						closureLen += 1;
						if(closureLen == fields2Arr.length){
							fieldListCall();
						}
					}, function(json){
						closureLen += 1;
						errorList.push(json);
						if(closureLen == fields2Arr.length){
							fieldListCall();
						}
					});
				});
			}else{
				(function(){
					var _f = arguments.callee;
					var f = fields2Arr[closureLen];
					_this.initFieldValidByFieldKey(f.fieldKey, function(json){
						okList.push(json);
						closureLen += 1;
						if(closureLen == fields2Arr.length){
							fieldListCall();
						}else{
							_f();
						}
					}, function(json){
						errorList.push(json);
						fieldListCall();
					});
				})();
			}
			function fieldListCall(){
				endCallback.call(_this, errorList, okList);
			}
		},
		
		
		//解析一个验证规则字符串为对象
		getRuleObj : function(ruleString){
			ruleString = $.trim(ruleString);
			var paramList = [];
			var temp = [];
			var rs = {funcName : ruleString, paramList : []};
			var pat = /(.+)\[(.*)\]$/;
			var matchRs = ruleString.match(pat);
			if(matchRs !== null){
				rs.funcName = matchRs[1];
				paramList = matchRs[2].replace(/^(\,+)/, "").replace(/(\,+)$/, "").split(/\s*,\s*/);
			}
			$.each(paramList, function(i, v){
				if(v === "null"){
					v = null;
				}else if(v === "true"){
					v = true;
				}else if(v === "false"){
					v = false;
				}
				temp.push(v);
			});
			rs.paramList = temp;
			return rs;
		},
		isIdMode : function(fieldKey){
			return /^#/.test(fieldKey);
		},
		getInput : function(fieldKey){
			var isId = this.isIdMode(fieldKey);
			var input = isId ? this.form.find(fieldKey) : this.form.find("[name='" + fieldKey + "']");
			return input;
		},
		renderMsg : function(options){
			var json = $.extend({
				msgWraper : null, 
				msg : "", 
				type : "ok",
				isShow : true
			}, options);
			//msgWraper, msg, isShow
			var isShow = json.isShow;
			var msgWraper = json.msgWraper;
			var type = json.type;
			var html = this.set.msgMaker(json);
			
			if(!msgWraper){
				return;
			}
			msgWraper = $(msgWraper);
			msgWraper.empty().append(html).hide();
			 
			if(isShow){
				msgWraper.show();
			}else{
				msgWraper.hide();
			}
		},
		getFieldState : function(fieldKey){
			return this.fieldsStateList[fieldKey] || null;
		},
		fieldIsValid : function(fieldKey){
			var stateData = this.getFieldState(fieldKey);
			if(stateData === null){
				return false;
			}else{
				return stateData.type === "ok";
			}
		},
		outputMsg : function(msgWraper, field, json){
			var isShow = false;
			if(!msgWraper){
				return;
			}
			if(field.showOkMsg){
				if(json.msg){
					isShow = true;
				}else{
					if(field.showOkEmptyMsg){
						isShow = true;
					}else{
						isShow = false;
					}
				}
			}else{
				isShow = false;
			}
			this.renderMsg({
				msgWraper : msgWraper, 
				msg : json.msg, 
				type : json.type,
				isShow : isShow
			});			
		},
		
		addField : function(fieldKey, field){
			field = $.extend({}, {key : fieldKey}, field);
			this.fields[fieldKey] = field;
			this.initField(fieldKey);
		},
		
		deleteField : function(fieldKey){
			var input = this.getInput(fieldKey);
			this.unbindInput(input);
			delete this.fields[fieldKey];
		},
		
		initFieldValid : function(field, input, done, fail){
			input = input || null;	
			done = done || function(){};
			fail = fail || function(){};
			var _this = this,  fieldKey = field.key || uid(), fieldState, fieldIsValid, msgWraper, ruleNameList, promiseIndex = -1, promiseList = {};
			 
			field = $.extend({}, {
				rule : null,
				target : null,
				showErrorMsg : true,
				showLoadingMsg : true,
				showOkMsg : true,
				showOkEmptyMsg : false,
				msg : {
					
				}
			}, field);
			fieldState = _this.getFieldState(fieldKey),
			fieldIsValid = _this.fieldIsValid(fieldKey);
			
			field.msg = $.extend({}, {
				require : "不能为空",
				mobile : "手机号码格式错误"
			}, field.msg);
			 
			if(input !== null){
				input = $(input);
				if(input.size() == 0){
					input = null;
				}
				
			}
			if(!input){
				console.log("input null");
			}
			
			if(!fieldKey){
				console.log("undefined fieldKey");
				return null;
			}
			
			if(!$.trim(field.rule)){
				console.log("empty rule");
				return null;
			}
			ruleNameList = $.trim(field.rule).replace(/^(\;+)/, "").replace(/(\;+)$/, "").split(/\s*\;\s*/);
			if(ruleNameList.length == 0){
				console.log("ruleNameList empty");
				return null;
			}
			if(!!field.target){
				msgWraper = $(field.target).eq(0);
			}
			if(msgWraper){ 
				msgWraper.attr("data-for-field", fieldKey);
			}	
			if(_this.set.cacheValidResult){
				if(fieldIsValid === true){
					_this.outputMsg(msgWraper, field, fieldState);
					_this.trigger("field." + fieldKey + ".validSuccess", fieldState, input);
					done.call(_this, fieldState);
					return;
				}else{
					if(fieldState !== null){
						_this.outputMsg(msgWraper, field, fieldState);
						_this.trigger("field." + fieldKey + ".validError", fieldState, input);
						fail.call(_this, fieldState);
						return;
					}
				}
			}
			
			(function(){
				if(promiseIndex + 1 == ruleNameList.length ){
					return;
				}
				promiseIndex += 1;
				var d = $.Deferred(), ruleObj, func, is, ruleName, rule,  _f = arguments.callee, json, promise;
				ruleName = ruleNameList[promiseIndex];
				ruleObj = _this.getRuleObj(ruleName);
				rule = ruleObj.funcName;
				func = _this.getRule(ruleObj.funcName);
				if(!!promiseList[ruleObj.funcName]){
					console.log("current rulePromise is runing..");
					return;
				}
				promise = d.promise();
				promiseList[ruleObj.funcName] = promise;				
				if(!func){
					console.log("func " + ruleObj.funcName + " is undefined");
					_f();
					return;
				}
				//Type:
				//a. true, false
				//b. objectObject { type : "error", msg : "error string"} { type : "ok", msg : ""}
				//c. XHRPromiseObject
				is = func.call(_this, input, ruleObj.paramList, field, msgWraper);
				is.fieldKey = fieldKey;
				is.rule = rule;
				if(is === true){
					d.resolve({rule : rule, fieldKey : fieldKey, type : "ok", msg : ""});
				}else if(is === false){
					d.reject({ type : "error", rule : rule, fieldKey : fieldKey, msg : field.msg[ruleName] || ""});
				}else if(_this.isXHRPromise(is)){
					is.done(function(reponseText){
						json = type.is_string(reponseText) ? (new Function("return " + reponseText ))() : reponseText;
						json = (_this.getXHRDataAdapter(ruleObj.funcName))(json);
						json.fieldKey = fieldKey;
						json.rule = rule;
						if(json.type === "ok"){
							d.resolve(json);
						}else{
							d.reject(json);
						}
					}).fail(function(){
						d.reject({rule : rule, fieldKey : fieldKey, type : "error", msg : "reponse error"});
					});
				}else if(type.is_object(is)){
					if(is.type === "ok"){
						d.resolve(is);
					}else{
						d.reject(is);
					}
				}
				promise.done(function(json){
					if(promiseIndex + 1 == ruleNameList.length ){
						_this.fieldsStateList[fieldKey] = json;
						_this.trigger("field." + fieldKey + ".validSuccess", json, input);
						done.call(_this, json);
					}
					if(!msgWraper){
						_f();
						return;
					}
					_this.outputMsg(msgWraper, field, json);
					_f();	
				}).fail(function(json){
					_this.fieldsStateList[fieldKey] = json;
					_this.outputMsg(msgWraper, field, json);
					_this.trigger("field." + fieldKey + ".validError", json, input);
					fail.call(_this, json);
				});
			})();
		},
		initFieldValidByFieldKey : function(fieldKey){
			var args = Array.prototype.slice.call(arguments, 1);
			var input = this.getInput(fieldKey);
			var field = this.getField(fieldKey);
			args.unshift(field, input);
			this.initFieldValid.apply(this, args); 
		}
	});
	//支持AMD
	if(typeof(define) == "function" && define.amd){
		define([], function(){
			return AsyValidator;
		});
	}
	window["AsyValidator"] = AsyValidator;
})(window, jQuery);




