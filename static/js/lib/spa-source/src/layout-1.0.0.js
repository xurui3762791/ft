var layout=(function(host){var helper={addClass:function(node,className){var oldClassName=node.className;if(oldClassName){if((' '+oldClassName+' ').indexOf(className)===-1){node.className=oldClassName+' '+className}}else{node.className=className}},removeClass:function(node,className){var oldClassName=node.className,newClassName=(' '+oldClassName+' ').replace(' '+className+' ',' ').replace(/^\s+/,'').replace(/\s+$/,'');if(newClassName!==oldClassName){node.className=newClassName}}};var pageResizeTimer,pageResizeCallbacks;function onPageResize(execNow){if(!pageResizeCallbacks){return}if(pageResizeTimer){clearTimeout(pageResizeTimer);pageResizeTimer=null}function exec(){var browserSize={width:document.documentElement.clientWidth,height:document.documentElement.clientHeight};for(var i=0;i<pageResizeCallbacks.length;i++){pageResizeCallbacks[i].call(host,browserSize,helper)}}if(execNow===true){exec()}else{pageResizeTimer=setTimeout(exec,50)}}var scrollCallbacks;function onPageScroll(){if(!scrollCallbacks){return}var scrollLength={top:host.pageYOffset||host.document.documentElement.scrollTop||0,left:host.pageXOffset||host.document.documentElement.scrollLeft||0};for(var i=0;i<scrollCallbacks.length;i++){scrollCallbacks[i].call(host,scrollLength,helper)}}if(host.addEventListener){host.addEventListener('resize',onPageResize,false);host.addEventListener('scroll',onPageScroll,false)}else if(host.attachEvent){host.attachEvent('onresize',onPageResize);host.attachEvent('onscroll',onPageScroll)}return{onPageResize:function(callback){pageResizeCallbacks=pageResizeCallbacks||[];pageResizeCallbacks.push(callback);onPageResize(true)},onPageScroll:function(callback){scrollCallbacks=scrollCallbacks||[];scrollCallbacks.push(callback);onPageScroll()}}})(window);