(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();function cf(r,e){for(var t=0;t<e.length;t++){var n=e[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(r,n.key,n)}}function ch(r,e,t){return e&&cf(r.prototype,e),t&&cf(r,t),r}function Xr(){return(Xr=Object.assign||function(r){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(r[n]=t[n])}return r}).apply(this,arguments)}function ec(r,e){r.prototype=Object.create(e.prototype),r.prototype.constructor=r,r.__proto__=e}function Qp(r){return(Qp=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(r)}function uh(r,e){return(uh=Object.setPrototypeOf||function(t,n){return t.__proto__=n,t})(r,e)}function em(r,e,t){return(em=function(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch{return!1}}()?Reflect.construct:function(n,i,s){var o=[null];o.push.apply(o,i);var a=new(Function.bind.apply(n,o));return s&&uh(a,s.prototype),a}).apply(null,arguments)}function tm(r){var e=typeof Map=="function"?new Map:void 0;return(tm=function(t){if(t===null||Function.toString.call(t).indexOf("[native code]")===-1)return t;if(typeof t!="function")throw new TypeError("Super expression must either be null or a function");if(e!==void 0){if(e.has(t))return e.get(t);e.set(t,n)}function n(){return em(t,arguments,Qp(this).constructor)}return n.prototype=Object.create(t.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),uh(n,t)})(r)}function Ws(r,e){try{var t=r()}catch(n){return e(n)}return t&&t.then?t.then(void 0,e):t}typeof Symbol<"u"&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator"))),typeof Symbol<"u"&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));var ur,q_="2.9.7",Y_=function(){};(function(r){r[r.off=0]="off",r[r.error=1]="error",r[r.warning=2]="warning",r[r.info=3]="info",r[r.debug=4]="debug"})(ur||(ur={}));var uf=ur.off,qr=function(){function r(t){this.t=t}r.getLevel=function(){return uf},r.setLevel=function(t){return uf=ur[t]};var e=r.prototype;return e.error=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];this.i(console.error,ur.error,n)},e.warn=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];this.i(console.warn,ur.warning,n)},e.info=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];this.i(console.info,ur.info,n)},e.debug=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];this.i(console.log,ur.debug,n)},e.i=function(t,n,i){n<=r.getLevel()&&t.apply(console,["["+this.t+"] "].concat(i))},r}(),Br=dh,j_=im,$_=hh,K_=rm,Z_=sm,nm="/",J_=new RegExp(["(\\\\.)","(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?"].join("|"),"g");function hh(r,e){for(var t,n=[],i=0,s=0,o="",a=e&&e.delimiter||nm,l=e&&e.whitelist||void 0,c=!1;(t=J_.exec(r))!==null;){var u=t[0],h=t[1],f=t.index;if(o+=r.slice(s,f),s=f+u.length,h)o+=h[1],c=!0;else{var d="",g=t[2],_=t[3],p=t[4],m=t[5];if(!c&&o.length){var S=o.length-1,y=o[S];(!l||l.indexOf(y)>-1)&&(d=y,o=o.slice(0,S))}o&&(n.push(o),o="",c=!1);var x=_||p,T=d||a;n.push({name:g||i++,prefix:d,delimiter:T,optional:m==="?"||m==="*",repeat:m==="+"||m==="*",pattern:x?Q_(x):"[^"+Bi(T===a?T:T+a)+"]+?"})}}return(o||s<r.length)&&n.push(o+r.substr(s)),n}function im(r,e){return function(t,n){var i=r.exec(t);if(!i)return!1;for(var s=i[0],o=i.index,a={},l=n&&n.decode||decodeURIComponent,c=1;c<i.length;c++)if(i[c]!==void 0){var u=e[c-1];a[u.name]=u.repeat?i[c].split(u.delimiter).map(function(h){return l(h,u)}):l(i[c],u)}return{path:s,index:o,params:a}}}function rm(r,e){for(var t=new Array(r.length),n=0;n<r.length;n++)typeof r[n]=="object"&&(t[n]=new RegExp("^(?:"+r[n].pattern+")$",fh(e)));return function(i,s){for(var o="",a=s&&s.encode||encodeURIComponent,l=!s||s.validate!==!1,c=0;c<r.length;c++){var u=r[c];if(typeof u!="string"){var h,f=i?i[u.name]:void 0;if(Array.isArray(f)){if(!u.repeat)throw new TypeError('Expected "'+u.name+'" to not repeat, but got array');if(f.length===0){if(u.optional)continue;throw new TypeError('Expected "'+u.name+'" to not be empty')}for(var d=0;d<f.length;d++){if(h=a(f[d],u),l&&!t[c].test(h))throw new TypeError('Expected all "'+u.name+'" to match "'+u.pattern+'"');o+=(d===0?u.prefix:u.delimiter)+h}}else if(typeof f!="string"&&typeof f!="number"&&typeof f!="boolean"){if(!u.optional)throw new TypeError('Expected "'+u.name+'" to be '+(u.repeat?"an array":"a string"))}else{if(h=a(String(f),u),l&&!t[c].test(h))throw new TypeError('Expected "'+u.name+'" to match "'+u.pattern+'", but got "'+h+'"');o+=u.prefix+h}}else o+=u}return o}}function Bi(r){return r.replace(/([.+*?=^!:${}()[\]|/\\])/g,"\\$1")}function Q_(r){return r.replace(/([=!:$/()])/g,"\\$1")}function fh(r){return r&&r.sensitive?"":"i"}function sm(r,e,t){for(var n=(t=t||{}).strict,i=t.start!==!1,s=t.end!==!1,o=t.delimiter||nm,a=[].concat(t.endsWith||[]).map(Bi).concat("$").join("|"),l=i?"^":"",c=0;c<r.length;c++){var u=r[c];if(typeof u=="string")l+=Bi(u);else{var h=u.repeat?"(?:"+u.pattern+")(?:"+Bi(u.delimiter)+"(?:"+u.pattern+"))*":u.pattern;e&&e.push(u),l+=u.optional?u.prefix?"(?:"+Bi(u.prefix)+"("+h+"))?":"("+h+")?":Bi(u.prefix)+"("+h+")"}}if(s)n||(l+="(?:"+Bi(o)+")?"),l+=a==="$"?"$":"(?="+a+")";else{var f=r[r.length-1],d=typeof f=="string"?f[f.length-1]===o:f===void 0;n||(l+="(?:"+Bi(o)+"(?="+a+"))?"),d||(l+="(?="+Bi(o)+"|"+a+")")}return new RegExp(l,fh(t))}function dh(r,e,t){return r instanceof RegExp?function(n,i){if(!i)return n;var s=n.source.match(/\((?!\?)/g);if(s)for(var o=0;o<s.length;o++)i.push({name:o,prefix:null,delimiter:null,optional:!1,repeat:!1,pattern:null});return n}(r,e):Array.isArray(r)?function(n,i,s){for(var o=[],a=0;a<n.length;a++)o.push(dh(n[a],i,s).source);return new RegExp("(?:"+o.join("|")+")",fh(s))}(r,e,t):function(n,i,s){return sm(hh(n,s),i,s)}(r,e,t)}Br.match=function(r,e){var t=[];return im(dh(r,t,e),t)},Br.regexpToFunction=j_,Br.parse=$_,Br.compile=function(r,e){return rm(hh(r,e),e)},Br.tokensToFunction=K_,Br.tokensToRegExp=Z_;var Ei={container:"container",history:"history",namespace:"namespace",prefix:"data-barba",prevent:"prevent",wrapper:"wrapper"},Yr=new(function(){function r(){this.o=Ei,this.u=new DOMParser}var e=r.prototype;return e.toString=function(t){return t.outerHTML},e.toDocument=function(t){return this.u.parseFromString(t,"text/html")},e.toElement=function(t){var n=document.createElement("div");return n.innerHTML=t,n},e.getHtml=function(t){return t===void 0&&(t=document),this.toString(t.documentElement)},e.getWrapper=function(t){return t===void 0&&(t=document),t.querySelector("["+this.o.prefix+'="'+this.o.wrapper+'"]')},e.getContainer=function(t){return t===void 0&&(t=document),t.querySelector("["+this.o.prefix+'="'+this.o.container+'"]')},e.removeContainer=function(t){document.body.contains(t)&&t.parentNode.removeChild(t)},e.addContainer=function(t,n){var i=this.getContainer();i?this.s(t,i):n.appendChild(t)},e.getNamespace=function(t){t===void 0&&(t=document);var n=t.querySelector("["+this.o.prefix+"-"+this.o.namespace+"]");return n?n.getAttribute(this.o.prefix+"-"+this.o.namespace):null},e.getHref=function(t){if(t.tagName&&t.tagName.toLowerCase()==="a"){if(typeof t.href=="string")return t.href;var n=t.getAttribute("href")||t.getAttribute("xlink:href");if(n)return this.resolveUrl(n.baseVal||n)}return null},e.resolveUrl=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];var s=n.length;if(s===0)throw new Error("resolveUrl requires at least one argument; got none.");var o=document.createElement("base");if(o.href=arguments[0],s===1)return o.href;var a=document.getElementsByTagName("head")[0];a.insertBefore(o,a.firstChild);for(var l,c=document.createElement("a"),u=1;u<s;u++)c.href=arguments[u],o.href=l=c.href;return a.removeChild(o),l},e.s=function(t,n){n.parentNode.insertBefore(t,n.nextSibling)},r}()),om=new(function(){function r(){this.h=[],this.v=-1}var e=r.prototype;return e.init=function(t,n){this.l="barba";var i={ns:n,scroll:{x:window.scrollX,y:window.scrollY},url:t};this.h.push(i),this.v=0;var s={from:this.l,index:0,states:[].concat(this.h)};window.history&&window.history.replaceState(s,"",t)},e.change=function(t,n,i){if(i&&i.state){var s=i.state,o=s.index;n=this.m(this.v-o),this.replace(s.states),this.v=o}else this.add(t,n);return n},e.add=function(t,n){var i=this.size,s=this.p(n),o={ns:"tmp",scroll:{x:window.scrollX,y:window.scrollY},url:t};this.h.push(o),this.v=i;var a={from:this.l,index:i,states:[].concat(this.h)};switch(s){case"push":window.history&&window.history.pushState(a,"",t);break;case"replace":window.history&&window.history.replaceState(a,"",t)}},e.update=function(t,n){var i=n||this.v,s=Xr({},this.get(i),{},t);this.set(i,s)},e.remove=function(t){t?this.h.splice(t,1):this.h.pop(),this.v--},e.clear=function(){this.h=[],this.v=-1},e.replace=function(t){this.h=t},e.get=function(t){return this.h[t]},e.set=function(t,n){return this.h[t]=n},e.p=function(t){var n="push",i=t,s=Ei.prefix+"-"+Ei.history;return i.hasAttribute&&i.hasAttribute(s)&&(n=i.getAttribute(s)),n},e.m=function(t){return Math.abs(t)>1?t>0?"forward":"back":t===0?"popstate":t>0?"back":"forward"},ch(r,[{key:"current",get:function(){return this.h[this.v]}},{key:"state",get:function(){return this.h[this.h.length-1]}},{key:"previous",get:function(){return this.v<1?null:this.h[this.v-1]}},{key:"size",get:function(){return this.h.length}}]),r}()),Rl=function(r,e){try{var t=function(){if(!e.next.html)return Promise.resolve(r).then(function(n){var i=e.next;if(n){var s=Yr.toElement(n);i.namespace=Yr.getNamespace(s),i.container=Yr.getContainer(s),i.html=n,om.update({ns:i.namespace});var o=Yr.toDocument(n);document.title=o.title}})}();return Promise.resolve(t&&t.then?t.then(function(){}):void 0)}catch(n){return Promise.reject(n)}},am=Br,e0={__proto__:null,update:Rl,nextTick:function(){return new Promise(function(r){window.requestAnimationFrame(r)})},pathToRegexp:am},lm=function(){return window.location.origin},ca=function(r){return r===void 0&&(r=window.location.href),Cl(r).port},Cl=function(r){var e,t=r.match(/:\d+/);if(t===null)/^http/.test(r)&&(e=80),/^https/.test(r)&&(e=443);else{var n=t[0].substring(1);e=parseInt(n,10)}var i,s=r.replace(lm(),""),o={},a=s.indexOf("#");a>=0&&(i=s.slice(a+1),s=s.slice(0,a));var l=s.indexOf("?");return l>=0&&(o=cm(s.slice(l+1)),s=s.slice(0,l)),{hash:i,path:s,port:e,query:o}},cm=function(r){return r.split("&").reduce(function(e,t){var n=t.split("=");return e[n[0]]=n[1],e},{})},gu=function(r){return r===void 0&&(r=window.location.href),r.replace(/(\/#.*|\/|#.*)$/,"")},t0={__proto__:null,getHref:function(){return window.location.href},getOrigin:lm,getPort:ca,getPath:function(r){return r===void 0&&(r=window.location.href),Cl(r).path},parse:Cl,parseQuery:cm,clean:gu};function n0(r,e,t){return e===void 0&&(e=2e3),new Promise(function(n,i){var s=new XMLHttpRequest;s.onreadystatechange=function(){if(s.readyState===XMLHttpRequest.DONE){if(s.status===200)n(s.responseText);else if(s.status){var o={status:s.status,statusText:s.statusText};t(r,o),i(o)}}},s.ontimeout=function(){var o=new Error("Timeout error ["+e+"]");t(r,o),i(o)},s.onerror=function(){var o=new Error("Fetch error");t(r,o),i(o)},s.open("GET",r),s.timeout=e,s.setRequestHeader("Accept","text/html,application/xhtml+xml,application/xml"),s.setRequestHeader("x-barba","yes"),s.send()})}var i0=function(r){return!!r&&(typeof r=="object"||typeof r=="function")&&typeof r.then=="function"};function js(r,e){return e===void 0&&(e={}),function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];var s=!1,o=new Promise(function(a,l){e.async=function(){return s=!0,function(u,h){u?l(u):a(h)}};var c=r.apply(e,n);s||(i0(c)?c.then(a,l):a(c))});return o}}var ar=new(function(r){function e(){var n;return(n=r.call(this)||this).logger=new qr("@barba/core"),n.all=["ready","page","reset","currentAdded","currentRemoved","nextAdded","nextRemoved","beforeOnce","once","afterOnce","before","beforeLeave","leave","afterLeave","beforeEnter","enter","afterEnter","after"],n.registered=new Map,n.init(),n}ec(e,r);var t=e.prototype;return t.init=function(){var n=this;this.registered.clear(),this.all.forEach(function(i){n[i]||(n[i]=function(s,o){n.registered.has(i)||n.registered.set(i,new Set),n.registered.get(i).add({ctx:o||{},fn:s})})})},t.do=function(n){for(var i=this,s=arguments.length,o=new Array(s>1?s-1:0),a=1;a<s;a++)o[a-1]=arguments[a];if(this.registered.has(n)){var l=Promise.resolve();return this.registered.get(n).forEach(function(c){l=l.then(function(){return js(c.fn,c.ctx).apply(void 0,o)})}),l.catch(function(c){i.logger.debug("Hook error ["+n+"]"),i.logger.error(c)})}return Promise.resolve()},t.clear=function(){var n=this;this.all.forEach(function(i){delete n[i]}),this.init()},t.help=function(){this.logger.info("Available hooks: "+this.all.join(","));var n=[];this.registered.forEach(function(i,s){return n.push(s)}),this.logger.info("Registered hooks: "+n.join(","))},e}(Y_)),um=function(){function r(e){if(this.P=[],typeof e=="boolean")this.g=e;else{var t=Array.isArray(e)?e:[e];this.P=t.map(function(n){return am(n)})}}return r.prototype.checkHref=function(e){if(typeof this.g=="boolean")return this.g;var t=Cl(e).path;return this.P.some(function(n){return n.exec(t)!==null})},r}(),r0=function(r){function e(n){var i;return(i=r.call(this,n)||this).k=new Map,i}ec(e,r);var t=e.prototype;return t.set=function(n,i,s){return this.k.set(n,{action:s,request:i}),{action:s,request:i}},t.get=function(n){return this.k.get(n)},t.getRequest=function(n){return this.k.get(n).request},t.getAction=function(n){return this.k.get(n).action},t.has=function(n){return!this.checkHref(n)&&this.k.has(n)},t.delete=function(n){return this.k.delete(n)},t.update=function(n,i){var s=Xr({},this.k.get(n),{},i);return this.k.set(n,s),s},e}(um),s0=function(){return!window.history.pushState},o0=function(r){return!r.el||!r.href},a0=function(r){var e=r.event;return e.which>1||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey},l0=function(r){var e=r.el;return e.hasAttribute("target")&&e.target==="_blank"},c0=function(r){var e=r.el;return e.protocol!==void 0&&window.location.protocol!==e.protocol||e.hostname!==void 0&&window.location.hostname!==e.hostname},u0=function(r){var e=r.el;return e.port!==void 0&&ca()!==ca(e.href)},h0=function(r){var e=r.el;return e.getAttribute&&typeof e.getAttribute("download")=="string"},f0=function(r){return r.el.hasAttribute(Ei.prefix+"-"+Ei.prevent)},d0=function(r){return!!r.el.closest("["+Ei.prefix+"-"+Ei.prevent+'="all"]')},p0=function(r){var e=r.href;return gu(e)===gu()&&ca(e)===ca()},m0=function(r){function e(n){var i;return(i=r.call(this,n)||this).suite=[],i.tests=new Map,i.init(),i}ec(e,r);var t=e.prototype;return t.init=function(){this.add("pushState",s0),this.add("exists",o0),this.add("newTab",a0),this.add("blank",l0),this.add("corsDomain",c0),this.add("corsPort",u0),this.add("download",h0),this.add("preventSelf",f0),this.add("preventAll",d0),this.add("sameUrl",p0,!1)},t.add=function(n,i,s){s===void 0&&(s=!0),this.tests.set(n,i),s&&this.suite.push(n)},t.run=function(n,i,s,o){return this.tests.get(n)({el:i,event:s,href:o})},t.checkLink=function(n,i,s){var o=this;return this.suite.some(function(a){return o.run(a,n,i,s)})},e}(um),mc=function(r){function e(t,n){var i;n===void 0&&(n="Barba error");for(var s=arguments.length,o=new Array(s>2?s-2:0),a=2;a<s;a++)o[a-2]=arguments[a];return(i=r.call.apply(r,[this].concat(o))||this).error=t,i.label=n,Error.captureStackTrace&&Error.captureStackTrace(function(l){if(l===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return l}(i),e),i.name="BarbaError",i}return ec(e,r),e}(tm(Error)),g0=function(){function r(t){t===void 0&&(t=[]),this.logger=new qr("@barba/core"),this.all=[],this.page=[],this.once=[],this.A=[{name:"namespace",type:"strings"},{name:"custom",type:"function"}],t&&(this.all=this.all.concat(t)),this.update()}var e=r.prototype;return e.add=function(t,n){switch(t){case"rule":this.A.splice(n.position||0,0,n.value);break;case"transition":default:this.all.push(n)}this.update()},e.resolve=function(t,n){var i=this;n===void 0&&(n={});var s=n.once?this.once:this.page;s=s.filter(n.self?function(f){return f.name&&f.name==="self"}:function(f){return!f.name||f.name!=="self"});var o=new Map,a=s.find(function(f){var d=!0,g={};return!(!n.self||f.name!=="self")||(i.A.reverse().forEach(function(_){d&&(d=i.R(f,_,t,g),f.from&&f.to&&(d=i.R(f,_,t,g,"from")&&i.R(f,_,t,g,"to")),f.from&&!f.to&&(d=i.R(f,_,t,g,"from")),!f.from&&f.to&&(d=i.R(f,_,t,g,"to")))}),o.set(f,g),d)}),l=o.get(a),c=[];if(c.push(n.once?"once":"page"),n.self&&c.push("self"),l){var u,h=[a];Object.keys(l).length>0&&h.push(l),(u=this.logger).info.apply(u,["Transition found ["+c.join(",")+"]"].concat(h))}else this.logger.info("No transition found ["+c.join(",")+"]");return a},e.update=function(){var t=this;this.all=this.all.map(function(n){return t.T(n)}).sort(function(n,i){return n.priority-i.priority}).reverse().map(function(n){return delete n.priority,n}),this.page=this.all.filter(function(n){return n.leave!==void 0||n.enter!==void 0}),this.once=this.all.filter(function(n){return n.once!==void 0})},e.R=function(t,n,i,s,o){var a=!0,l=!1,c=t,u=n.name,h=u,f=u,d=u,g=o?c[o]:c,_=o==="to"?i.next:i.current;if(o?g&&g[u]:g[u]){switch(n.type){case"strings":default:var p=Array.isArray(g[h])?g[h]:[g[h]];_[h]&&p.indexOf(_[h])!==-1&&(l=!0),p.indexOf(_[h])===-1&&(a=!1);break;case"object":var m=Array.isArray(g[f])?g[f]:[g[f]];_[f]?(_[f].name&&m.indexOf(_[f].name)!==-1&&(l=!0),m.indexOf(_[f].name)===-1&&(a=!1)):a=!1;break;case"function":g[d](i)?l=!0:a=!1}l&&(o?(s[o]=s[o]||{},s[o][u]=c[o][u]):s[u]=c[u])}return a},e.O=function(t,n,i){var s=0;return(t[n]||t.from&&t.from[n]||t.to&&t.to[n])&&(s+=Math.pow(10,i),t.from&&t.from[n]&&(s+=1),t.to&&t.to[n]&&(s+=2)),s},e.T=function(t){var n=this;t.priority=0;var i=0;return this.A.forEach(function(s,o){i+=n.O(t,s.name,o+1)}),t.priority=i,t},r}(),_0=function(){function r(t){t===void 0&&(t=[]),this.logger=new qr("@barba/core"),this.S=!1,this.store=new g0(t)}var e=r.prototype;return e.get=function(t,n){return this.store.resolve(t,n)},e.doOnce=function(t){var n=t.data,i=t.transition;try{var s=function(){o.S=!1},o=this,a=i||{};o.S=!0;var l=Ws(function(){return Promise.resolve(o.j("beforeOnce",n,a)).then(function(){return Promise.resolve(o.once(n,a)).then(function(){return Promise.resolve(o.j("afterOnce",n,a)).then(function(){})})})},function(c){o.S=!1,o.logger.debug("Transition error [before/after/once]"),o.logger.error(c)});return Promise.resolve(l&&l.then?l.then(s):s())}catch(c){return Promise.reject(c)}},e.doPage=function(t){var n=t.data,i=t.transition,s=t.page,o=t.wrapper;try{var a=function(d){if(l)return d;c.S=!1},l=!1,c=this,u=i||{},h=u.sync===!0||!1;c.S=!0;var f=Ws(function(){function d(){return Promise.resolve(c.j("before",n,u)).then(function(){var _=!1;function p(S){return _?S:Promise.resolve(c.remove(n)).then(function(){return Promise.resolve(c.j("after",n,u)).then(function(){})})}var m=function(){if(h)return Ws(function(){return Promise.resolve(c.add(n,o)).then(function(){return Promise.resolve(c.j("beforeLeave",n,u)).then(function(){return Promise.resolve(c.j("beforeEnter",n,u)).then(function(){return Promise.resolve(Promise.all([c.leave(n,u),c.enter(n,u)])).then(function(){return Promise.resolve(c.j("afterLeave",n,u)).then(function(){return Promise.resolve(c.j("afterEnter",n,u)).then(function(){})})})})})})},function(T){if(c.M(T))throw new mc(T,"Transition error [sync]")});var S=function(T){return _?T:Ws(function(){var b=function(){if(y!==!1)return Promise.resolve(c.add(n,o)).then(function(){return Promise.resolve(c.j("beforeEnter",n,u)).then(function(){return Promise.resolve(c.enter(n,u,y)).then(function(){return Promise.resolve(c.j("afterEnter",n,u)).then(function(){})})})})}();if(b&&b.then)return b.then(function(){})},function(b){if(c.M(b))throw new mc(b,"Transition error [before/after/enter]")})},y=!1,x=Ws(function(){return Promise.resolve(c.j("beforeLeave",n,u)).then(function(){return Promise.resolve(Promise.all([c.leave(n,u),Rl(s,n)]).then(function(T){return T[0]})).then(function(T){return y=T,Promise.resolve(c.j("afterLeave",n,u)).then(function(){})})})},function(T){if(c.M(T))throw new mc(T,"Transition error [before/after/leave]")});return x&&x.then?x.then(S):S(x)}();return m&&m.then?m.then(p):p(m)})}var g=function(){if(h)return Promise.resolve(Rl(s,n)).then(function(){})}();return g&&g.then?g.then(d):d()},function(d){throw c.S=!1,d.name&&d.name==="BarbaError"?(c.logger.debug(d.label),c.logger.error(d.error),d):(c.logger.debug("Transition error [page]"),c.logger.error(d),d)});return Promise.resolve(f&&f.then?f.then(a):a(f))}catch(d){return Promise.reject(d)}},e.once=function(t,n){try{return Promise.resolve(ar.do("once",t,n)).then(function(){return n.once?js(n.once,n)(t):Promise.resolve()})}catch(i){return Promise.reject(i)}},e.leave=function(t,n){try{return Promise.resolve(ar.do("leave",t,n)).then(function(){return n.leave?js(n.leave,n)(t):Promise.resolve()})}catch(i){return Promise.reject(i)}},e.enter=function(t,n,i){try{return Promise.resolve(ar.do("enter",t,n)).then(function(){return n.enter?js(n.enter,n)(t,i):Promise.resolve()})}catch(s){return Promise.reject(s)}},e.add=function(t,n){try{return Yr.addContainer(t.next.container,n),ar.do("nextAdded",t),Promise.resolve()}catch(i){return Promise.reject(i)}},e.remove=function(t){try{return Yr.removeContainer(t.current.container),ar.do("currentRemoved",t),Promise.resolve()}catch(n){return Promise.reject(n)}},e.M=function(t){return t.message?!/Timeout error|Fetch error/.test(t.message):!t.status},e.j=function(t,n,i){try{return Promise.resolve(ar.do(t,n,i)).then(function(){return i[t]?js(i[t],i)(n):Promise.resolve()})}catch(s){return Promise.reject(s)}},ch(r,[{key:"isRunning",get:function(){return this.S},set:function(t){this.S=t}},{key:"hasOnce",get:function(){return this.store.once.length>0}},{key:"hasSelf",get:function(){return this.store.all.some(function(t){return t.name==="self"})}},{key:"shouldWait",get:function(){return this.store.all.some(function(t){return t.to&&!t.to.route||t.sync})}}]),r}(),v0=function(){function r(e){var t=this;this.names=["beforeLeave","afterLeave","beforeEnter","afterEnter"],this.byNamespace=new Map,e.length!==0&&(e.forEach(function(n){t.byNamespace.set(n.namespace,n)}),this.names.forEach(function(n){ar[n](t.L(n))}))}return r.prototype.L=function(e){var t=this;return function(n){var i=e.match(/enter/i)?n.next:n.current,s=t.byNamespace.get(i.namespace);return s&&s[e]?js(s[e],s)(n):Promise.resolve()}},r}();Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(r){var e=this;do{if(e.matches(r))return e;e=e.parentElement||e.parentNode}while(e!==null&&e.nodeType===1);return null});var x0={container:null,html:"",namespace:"",url:{hash:"",href:"",path:"",port:null,query:{}}},Ea=new(function(){function r(){this.version=q_,this.schemaPage=x0,this.Logger=qr,this.logger=new qr("@barba/core"),this.plugins=[],this.hooks=ar,this.dom=Yr,this.helpers=e0,this.history=om,this.request=n0,this.url=t0}var e=r.prototype;return e.use=function(t,n){var i=this.plugins;i.indexOf(t)>-1?this.logger.warn("Plugin ["+t.name+"] already installed."):typeof t.install=="function"?(t.install(this,n),i.push(t)):this.logger.warn("Plugin ["+t.name+'] has no "install" method.')},e.init=function(t){var n=t===void 0?{}:t,i=n.transitions,s=i===void 0?[]:i,o=n.views,a=o===void 0?[]:o,l=n.schema,c=l===void 0?Ei:l,u=n.requestError,h=n.timeout,f=h===void 0?2e3:h,d=n.cacheIgnore,g=d!==void 0&&d,_=n.prefetchIgnore,p=_!==void 0&&_,m=n.preventRunning,S=m!==void 0&&m,y=n.prevent,x=y===void 0?null:y,T=n.debug,b=n.logLevel;if(qr.setLevel((T!==void 0&&T)===!0?"debug":b===void 0?"off":b),this.logger.info(this.version),Object.keys(c).forEach(function(O){Ei[O]&&(Ei[O]=c[O])}),this.$=u,this.timeout=f,this.cacheIgnore=g,this.prefetchIgnore=p,this.preventRunning=S,this._=this.dom.getWrapper(),!this._)throw new Error("[@barba/core] No Barba wrapper found");this._.setAttribute("aria-live","polite"),this.q();var M=this.data.current;if(!M.container)throw new Error("[@barba/core] No Barba container found");if(this.cache=new r0(g),this.prevent=new m0(p),this.transitions=new _0(s),this.views=new v0(a),x!==null){if(typeof x!="function")throw new Error("[@barba/core] Prevent should be a function");this.prevent.add("preventCustom",x)}this.history.init(M.url.href,M.namespace),this.B=this.B.bind(this),this.U=this.U.bind(this),this.D=this.D.bind(this),this.F(),this.plugins.forEach(function(O){return O.init()});var I=this.data;I.trigger="barba",I.next=I.current,I.current=Xr({},this.schemaPage),this.hooks.do("ready",I),this.once(I),this.q()},e.destroy=function(){this.q(),this.H(),this.history.clear(),this.hooks.clear(),this.plugins=[]},e.force=function(t){window.location.assign(t)},e.go=function(t,n,i){var s;if(n===void 0&&(n="barba"),this.transitions.isRunning)this.force(t);else if(!(s=n==="popstate"?this.history.current&&this.url.getPath(this.history.current.url)===this.url.getPath(t):this.prevent.run("sameUrl",null,null,t))||this.transitions.hasSelf)return n=this.history.change(t,n,i),i&&(i.stopPropagation(),i.preventDefault()),this.page(t,n,s)},e.once=function(t){try{var n=this;return Promise.resolve(n.hooks.do("beforeEnter",t)).then(function(){function i(){return Promise.resolve(n.hooks.do("afterEnter",t)).then(function(){})}var s=function(){if(n.transitions.hasOnce){var o=n.transitions.get(t,{once:!0});return Promise.resolve(n.transitions.doOnce({transition:o,data:t})).then(function(){})}}();return s&&s.then?s.then(i):i()})}catch(i){return Promise.reject(i)}},e.page=function(t,n,i){try{var s=function(){var c=o.data;return Promise.resolve(o.hooks.do("page",c)).then(function(){var u=Ws(function(){var h=o.transitions.get(c,{once:!1,self:i});return Promise.resolve(o.transitions.doPage({data:c,page:a,transition:h,wrapper:o._})).then(function(){o.q()})},function(){qr.getLevel()===0&&o.force(c.current.url.href)});if(u&&u.then)return u.then(function(){})})},o=this;o.data.next.url=Xr({href:t},o.url.parse(t)),o.data.trigger=n;var a=o.cache.has(t)?o.cache.update(t,{action:"click"}).request:o.cache.set(t,o.request(t,o.timeout,o.onRequestError.bind(o,n)),"click").request,l=function(){if(o.transitions.shouldWait)return Promise.resolve(Rl(a,o.data)).then(function(){})}();return Promise.resolve(l&&l.then?l.then(s):s())}catch(c){return Promise.reject(c)}},e.onRequestError=function(t){this.transitions.isRunning=!1;for(var n=arguments.length,i=new Array(n>1?n-1:0),s=1;s<n;s++)i[s-1]=arguments[s];var o=i[0],a=i[1],l=this.cache.getAction(o);return this.cache.delete(o),!(this.$&&this.$(t,l,o,a)===!1||(l==="click"&&this.force(o),1))},e.prefetch=function(t){var n=this;this.cache.has(t)||this.cache.set(t,this.request(t,this.timeout,this.onRequestError.bind(this,"barba")).catch(function(i){n.logger.error(i)}),"prefetch")},e.F=function(){this.prefetchIgnore!==!0&&(document.addEventListener("mouseover",this.B),document.addEventListener("touchstart",this.B)),document.addEventListener("click",this.U),window.addEventListener("popstate",this.D)},e.H=function(){this.prefetchIgnore!==!0&&(document.removeEventListener("mouseover",this.B),document.removeEventListener("touchstart",this.B)),document.removeEventListener("click",this.U),window.removeEventListener("popstate",this.D)},e.B=function(t){var n=this,i=this.I(t);if(i){var s=this.dom.getHref(i);this.prevent.checkHref(s)||this.cache.has(s)||this.cache.set(s,this.request(s,this.timeout,this.onRequestError.bind(this,i)).catch(function(o){n.logger.error(o)}),"enter")}},e.U=function(t){var n=this.I(t);if(n)return this.transitions.isRunning&&this.preventRunning?(t.preventDefault(),void t.stopPropagation()):void this.go(this.dom.getHref(n),n,t)},e.D=function(t){this.go(this.url.getHref(),"popstate",t)},e.I=function(t){for(var n=t.target;n&&!this.dom.getHref(n);)n=n.parentNode;if(n&&!this.prevent.checkLink(n,t,this.dom.getHref(n)))return n},e.q=function(){var t=this.url.getHref(),n={container:this.dom.getContainer(),html:this.dom.getHtml(),namespace:this.dom.getNamespace(),url:Xr({href:t},this.url.parse(t))};this.C={current:n,next:Xr({},this.schemaPage),trigger:void 0},this.hooks.do("reset",this.data)},ch(r,[{key:"data",get:function(){return this.C}},{key:"wrapper",get:function(){return this._}}]),r}());function zi(r){if(r===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return r}function hm(r,e){r.prototype=Object.create(e.prototype),r.prototype.constructor=r,r.__proto__=e}/*!
 * GSAP 3.12.5
 * https://gsap.com
 *
 * @license Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var Wn={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},co={duration:.5,overwrite:!1,delay:0},ph,hn,At,ti=1e8,St=1/ti,_u=Math.PI*2,y0=_u/4,S0=0,fm=Math.sqrt,M0=Math.cos,E0=Math.sin,Qt=function(e){return typeof e=="string"},Ot=function(e){return typeof e=="function"},ji=function(e){return typeof e=="number"},mh=function(e){return typeof e>"u"},wi=function(e){return typeof e=="object"},Rn=function(e){return e!==!1},gh=function(){return typeof window<"u"},Ca=function(e){return Ot(e)||Qt(e)},dm=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},fn=Array.isArray,vu=/(?:-?\.?\d|\.)+/gi,pm=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,$s=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,gc=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,mm=/[+-]=-?[.\d]+/,gm=/[^,'"\[\]\s]+/gi,T0=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Ct,di,xu,_h,Xn={},Pl={},_m,vm=function(e){return(Pl=hs(e,Xn))&&In},vh=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},ua=function(e,t){return!t&&console.warn(e)},xm=function(e,t){return e&&(Xn[e]=t)&&Pl&&(Pl[e]=t)||Xn},ha=function(){return 0},b0={suppressEvents:!0,isStart:!0,kill:!1},_l={suppressEvents:!0,kill:!1},A0={suppressEvents:!0},xh={},vr=[],yu={},ym,kn={},_c={},hf=30,vl=[],yh="",Sh=function(e){var t=e[0],n,i;if(wi(t)||Ot(t)||(e=[e]),!(n=(t._gsap||{}).harness)){for(i=vl.length;i--&&!vl[i].targetTest(t););n=vl[i]}for(i=e.length;i--;)e[i]&&(e[i]._gsap||(e[i]._gsap=new Wm(e[i],n)))||e.splice(i,1);return e},es=function(e){return e._gsap||Sh(ni(e))[0]._gsap},Sm=function(e,t,n){return(n=e[t])&&Ot(n)?e[t]():mh(n)&&e.getAttribute&&e.getAttribute(t)||n},Cn=function(e,t){return(e=e.split(",")).forEach(t)||e},Nt=function(e){return Math.round(e*1e5)/1e5||0},Kt=function(e){return Math.round(e*1e7)/1e7||0},eo=function(e,t){var n=t.charAt(0),i=parseFloat(t.substr(2));return e=parseFloat(e),n==="+"?e+i:n==="-"?e-i:n==="*"?e*i:e/i},w0=function(e,t){for(var n=t.length,i=0;e.indexOf(t[i])<0&&++i<n;);return i<n},Ll=function(){var e=vr.length,t=vr.slice(0),n,i;for(yu={},vr.length=0,n=0;n<e;n++)i=t[n],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},Mm=function(e,t,n,i){vr.length&&!hn&&Ll(),e.render(t,n,i||hn&&t<0&&(e._initted||e._startAt)),vr.length&&!hn&&Ll()},Em=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(gm).length<2?t:Qt(e)?e.trim():e},Tm=function(e){return e},ri=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},R0=function(e){return function(t,n){for(var i in n)i in t||i==="duration"&&e||i==="ease"||(t[i]=n[i])}},hs=function(e,t){for(var n in t)e[n]=t[n];return e},ff=function r(e,t){for(var n in t)n!=="__proto__"&&n!=="constructor"&&n!=="prototype"&&(e[n]=wi(t[n])?r(e[n]||(e[n]={}),t[n]):t[n]);return e},Dl=function(e,t){var n={},i;for(i in e)i in t||(n[i]=e[i]);return n},jo=function(e){var t=e.parent||Ct,n=e.keyframes?R0(fn(e.keyframes)):ri;if(Rn(e.inherit))for(;t;)n(e,t.vars.defaults),t=t.parent||t._dp;return e},C0=function(e,t){for(var n=e.length,i=n===t.length;i&&n--&&e[n]===t[n];);return n<0},bm=function(e,t,n,i,s){n===void 0&&(n="_first"),i===void 0&&(i="_last");var o=e[i],a;if(s)for(a=t[s];o&&o[s]>a;)o=o._prev;return o?(t._next=o._next,o._next=t):(t._next=e[n],e[n]=t),t._next?t._next._prev=t:e[i]=t,t._prev=o,t.parent=t._dp=e,t},tc=function(e,t,n,i){n===void 0&&(n="_first"),i===void 0&&(i="_last");var s=t._prev,o=t._next;s?s._next=o:e[n]===t&&(e[n]=o),o?o._prev=s:e[i]===t&&(e[i]=s),t._next=t._prev=t.parent=null},Tr=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},ts=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var n=e;n;)n._dirty=1,n=n.parent;return e},P0=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Su=function(e,t,n,i){return e._startAt&&(hn?e._startAt.revert(_l):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,i))},L0=function r(e){return!e||e._ts&&r(e.parent)},df=function(e){return e._repeat?uo(e._tTime,e=e.duration()+e._rDelay)*e:0},uo=function(e,t){var n=Math.floor(e/=t);return e&&n===e?n-1:n},Il=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},nc=function(e){return e._end=Kt(e._start+(e._tDur/Math.abs(e._ts||e._rts||St)||0))},ic=function(e,t){var n=e._dp;return n&&n.smoothChildTiming&&e._ts&&(e._start=Kt(n._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),nc(e),n._dirty||ts(n,e)),e},Am=function(e,t){var n;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(n=Il(e.rawTime(),t),(!t._dur||Ta(0,t.totalDuration(),n)-t._tTime>St)&&t.render(n,!0)),ts(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(n=e;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;e._zTime=-St}},gi=function(e,t,n,i){return t.parent&&Tr(t),t._start=Kt((ji(n)?n:n||e!==Ct?jn(e,n,t):e._time)+t._delay),t._end=Kt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),bm(e,t,"_first","_last",e._sort?"_start":0),Mu(t)||(e._recent=t),i||Am(e,t),e._ts<0&&ic(e,e._tTime),e},wm=function(e,t){return(Xn.ScrollTrigger||vh("scrollTrigger",t))&&Xn.ScrollTrigger.create(t,e)},Rm=function(e,t,n,i,s){if(Eh(e,t,s),!e._initted)return 1;if(!n&&e._pt&&!hn&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&ym!==zn.frame)return vr.push(e),e._lazy=[s,i],1},D0=function r(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||r(t))},Mu=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},I0=function(e,t,n,i){var s=e.ratio,o=t<0||!t&&(!e._start&&D0(e)&&!(!e._initted&&Mu(e))||(e._ts<0||e._dp._ts<0)&&!Mu(e))?0:1,a=e._rDelay,l=0,c,u,h;if(a&&e._repeat&&(l=Ta(0,e._tDur,t),u=uo(l,a),e._yoyo&&u&1&&(o=1-o),u!==uo(e._tTime,a)&&(s=1-o,e.vars.repeatRefresh&&e._initted&&e.invalidate())),o!==s||hn||i||e._zTime===St||!t&&e._zTime){if(!e._initted&&Rm(e,t,i,n,l))return;for(h=e._zTime,e._zTime=t||(n?St:0),n||(n=t&&!h),e.ratio=o,e._from&&(o=1-o),e._time=0,e._tTime=l,c=e._pt;c;)c.r(o,c.d),c=c._next;t<0&&Su(e,t,n,!0),e._onUpdate&&!n&&Gn(e,"onUpdate"),l&&e._repeat&&!n&&e.parent&&Gn(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===o&&(o&&Tr(e,1),!n&&!hn&&(Gn(e,o?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},O0=function(e,t,n){var i;if(n>t)for(i=e._first;i&&i._start<=n;){if(i.data==="isPause"&&i._start>t)return i;i=i._next}else for(i=e._last;i&&i._start>=n;){if(i.data==="isPause"&&i._start<t)return i;i=i._prev}},ho=function(e,t,n,i){var s=e._repeat,o=Kt(t)||0,a=e._tTime/e._tDur;return a&&!i&&(e._time*=o/e._dur),e._dur=o,e._tDur=s?s<0?1e10:Kt(o*(s+1)+e._rDelay*s):o,a>0&&!i&&ic(e,e._tTime=e._tDur*a),e.parent&&nc(e),n||ts(e.parent,e),e},pf=function(e){return e instanceof En?ts(e):ho(e,e._dur)},N0={_start:0,endTime:ha,totalDuration:ha},jn=function r(e,t,n){var i=e.labels,s=e._recent||N0,o=e.duration()>=ti?s.endTime(!1):e._dur,a,l,c;return Qt(t)&&(isNaN(t)||t in i)?(l=t.charAt(0),c=t.substr(-1)==="%",a=t.indexOf("="),l==="<"||l===">"?(a>=0&&(t=t.replace(/=/,"")),(l==="<"?s._start:s.endTime(s._repeat>=0))+(parseFloat(t.substr(1))||0)*(c?(a<0?s:n).totalDuration()/100:1)):a<0?(t in i||(i[t]=o),i[t]):(l=parseFloat(t.charAt(a-1)+t.substr(a+1)),c&&n&&(l=l/100*(fn(n)?n[0]:n).totalDuration()),a>1?r(e,t.substr(0,a-1),n)+l:o+l)):t==null?o:+t},$o=function(e,t,n){var i=ji(t[1]),s=(i?2:1)+(e<2?0:1),o=t[s],a,l;if(i&&(o.duration=t[1]),o.parent=n,e){for(a=o,l=n;l&&!("immediateRender"in a);)a=l.vars.defaults||{},l=Rn(l.vars.inherit)&&l.parent;o.immediateRender=Rn(a.immediateRender),e<2?o.runBackwards=1:o.startAt=t[s-1]}return new kt(t[0],o,t[s+1])},Rr=function(e,t){return e||e===0?t(e):t},Ta=function(e,t,n){return n<e?e:n>t?t:n},un=function(e,t){return!Qt(e)||!(t=T0.exec(e))?"":t[1]},U0=function(e,t,n){return Rr(n,function(i){return Ta(e,t,i)})},Eu=[].slice,Cm=function(e,t){return e&&wi(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&wi(e[0]))&&!e.nodeType&&e!==di},F0=function(e,t,n){return n===void 0&&(n=[]),e.forEach(function(i){var s;return Qt(i)&&!t||Cm(i,1)?(s=n).push.apply(s,ni(i)):n.push(i)})||n},ni=function(e,t,n){return At&&!t&&At.selector?At.selector(e):Qt(e)&&!n&&(xu||!fo())?Eu.call((t||_h).querySelectorAll(e),0):fn(e)?F0(e,n):Cm(e)?Eu.call(e,0):e?[e]:[]},Tu=function(e){return e=ni(e)[0]||ua("Invalid scope")||{},function(t){var n=e.current||e.nativeElement||e;return ni(t,n.querySelectorAll?n:n===e?ua("Invalid scope")||_h.createElement("div"):e)}},Pm=function(e){return e.sort(function(){return .5-Math.random()})},Lm=function(e){if(Ot(e))return e;var t=wi(e)?e:{each:e},n=ns(t.ease),i=t.from||0,s=parseFloat(t.base)||0,o={},a=i>0&&i<1,l=isNaN(i)||a,c=t.axis,u=i,h=i;return Qt(i)?u=h={center:.5,edges:.5,end:1}[i]||0:!a&&l&&(u=i[0],h=i[1]),function(f,d,g){var _=(g||t).length,p=o[_],m,S,y,x,T,b,M,I,O;if(!p){if(O=t.grid==="auto"?0:(t.grid||[1,ti])[1],!O){for(M=-ti;M<(M=g[O++].getBoundingClientRect().left)&&O<_;);O<_&&O--}for(p=o[_]=[],m=l?Math.min(O,_)*u-.5:i%O,S=O===ti?0:l?_*h/O-.5:i/O|0,M=0,I=ti,b=0;b<_;b++)y=b%O-m,x=S-(b/O|0),p[b]=T=c?Math.abs(c==="y"?x:y):fm(y*y+x*x),T>M&&(M=T),T<I&&(I=T);i==="random"&&Pm(p),p.max=M-I,p.min=I,p.v=_=(parseFloat(t.amount)||parseFloat(t.each)*(O>_?_-1:c?c==="y"?_/O:O:Math.max(O,_/O))||0)*(i==="edges"?-1:1),p.b=_<0?s-_:s,p.u=un(t.amount||t.each)||0,n=n&&_<0?Hm(n):n}return _=(p[f]-p.min)/p.max||0,Kt(p.b+(n?n(_):_)*p.v)+p.u}},bu=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(n){var i=Kt(Math.round(parseFloat(n)/e)*e*t);return(i-i%1)/t+(ji(n)?0:un(n))}},Dm=function(e,t){var n=fn(e),i,s;return!n&&wi(e)&&(i=n=e.radius||ti,e.values?(e=ni(e.values),(s=!ji(e[0]))&&(i*=i)):e=bu(e.increment)),Rr(t,n?Ot(e)?function(o){return s=e(o),Math.abs(s-o)<=i?s:o}:function(o){for(var a=parseFloat(s?o.x:o),l=parseFloat(s?o.y:0),c=ti,u=0,h=e.length,f,d;h--;)s?(f=e[h].x-a,d=e[h].y-l,f=f*f+d*d):f=Math.abs(e[h]-a),f<c&&(c=f,u=h);return u=!i||c<=i?e[u]:o,s||u===o||ji(o)?u:u+un(o)}:bu(e))},Im=function(e,t,n,i){return Rr(fn(e)?!t:n===!0?!!(n=0):!i,function(){return fn(e)?e[~~(Math.random()*e.length)]:(n=n||1e-5)&&(i=n<1?Math.pow(10,(n+"").length-2):1)&&Math.floor(Math.round((e-n/2+Math.random()*(t-e+n*.99))/n)*n*i)/i})},B0=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(i){return t.reduce(function(s,o){return o(s)},i)}},k0=function(e,t){return function(n){return e(parseFloat(n))+(t||un(n))}},z0=function(e,t,n){return Nm(e,t,0,1,n)},Om=function(e,t,n){return Rr(n,function(i){return e[~~t(i)]})},H0=function r(e,t,n){var i=t-e;return fn(e)?Om(e,r(0,e.length),t):Rr(n,function(s){return(i+(s-e)%i)%i+e})},G0=function r(e,t,n){var i=t-e,s=i*2;return fn(e)?Om(e,r(0,e.length-1),t):Rr(n,function(o){return o=(s+(o-e)%s)%s||0,e+(o>i?s-o:o)})},fa=function(e){for(var t=0,n="",i,s,o,a;~(i=e.indexOf("random(",t));)o=e.indexOf(")",i),a=e.charAt(i+7)==="[",s=e.substr(i+7,o-i-7).match(a?gm:vu),n+=e.substr(t,i-t)+Im(a?s:+s[0],a?0:+s[1],+s[2]||1e-5),t=o+1;return n+e.substr(t,e.length-t)},Nm=function(e,t,n,i,s){var o=t-e,a=i-n;return Rr(s,function(l){return n+((l-e)/o*a||0)})},V0=function r(e,t,n,i){var s=isNaN(e+t)?0:function(d){return(1-d)*e+d*t};if(!s){var o=Qt(e),a={},l,c,u,h,f;if(n===!0&&(i=1)&&(n=null),o)e={p:e},t={p:t};else if(fn(e)&&!fn(t)){for(u=[],h=e.length,f=h-2,c=1;c<h;c++)u.push(r(e[c-1],e[c]));h--,s=function(g){g*=h;var _=Math.min(f,~~g);return u[_](g-_)},n=t}else i||(e=hs(fn(e)?[]:{},e));if(!u){for(l in t)Mh.call(a,e,l,"get",t[l]);s=function(g){return Ah(g,a)||(o?e.p:e)}}}return Rr(n,s)},mf=function(e,t,n){var i=e.labels,s=ti,o,a,l;for(o in i)a=i[o]-t,a<0==!!n&&a&&s>(a=Math.abs(a))&&(l=o,s=a);return l},Gn=function(e,t,n){var i=e.vars,s=i[t],o=At,a=e._ctx,l,c,u;if(s)return l=i[t+"Params"],c=i.callbackScope||e,n&&vr.length&&Ll(),a&&(At=a),u=l?s.apply(c,l):s.call(c),At=o,u},Ho=function(e){return Tr(e),e.scrollTrigger&&e.scrollTrigger.kill(!!hn),e.progress()<1&&Gn(e,"onInterrupt"),e},Ks,Um=[],Fm=function(e){if(e)if(e=!e.name&&e.default||e,gh()||e.headless){var t=e.name,n=Ot(e),i=t&&!n&&e.init?function(){this._props=[]}:e,s={init:ha,render:Ah,add:Mh,kill:sv,modifier:rv,rawVars:0},o={targetTest:0,get:0,getSetter:bh,aliases:{},register:0};if(fo(),e!==i){if(kn[t])return;ri(i,ri(Dl(e,s),o)),hs(i.prototype,hs(s,Dl(e,o))),kn[i.prop=t]=i,e.targetTest&&(vl.push(i),xh[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}xm(t,i),e.register&&e.register(In,i,Pn)}else Um.push(e)},_t=255,Go={aqua:[0,_t,_t],lime:[0,_t,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,_t],navy:[0,0,128],white:[_t,_t,_t],olive:[128,128,0],yellow:[_t,_t,0],orange:[_t,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[_t,0,0],pink:[_t,192,203],cyan:[0,_t,_t],transparent:[_t,_t,_t,0]},vc=function(e,t,n){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(n-t)*e*6:e<.5?n:e*3<2?t+(n-t)*(2/3-e)*6:t)*_t+.5|0},Bm=function(e,t,n){var i=e?ji(e)?[e>>16,e>>8&_t,e&_t]:0:Go.black,s,o,a,l,c,u,h,f,d,g;if(!i){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),Go[e])i=Go[e];else if(e.charAt(0)==="#"){if(e.length<6&&(s=e.charAt(1),o=e.charAt(2),a=e.charAt(3),e="#"+s+s+o+o+a+a+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return i=parseInt(e.substr(1,6),16),[i>>16,i>>8&_t,i&_t,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),i=[e>>16,e>>8&_t,e&_t]}else if(e.substr(0,3)==="hsl"){if(i=g=e.match(vu),!t)l=+i[0]%360/360,c=+i[1]/100,u=+i[2]/100,o=u<=.5?u*(c+1):u+c-u*c,s=u*2-o,i.length>3&&(i[3]*=1),i[0]=vc(l+1/3,s,o),i[1]=vc(l,s,o),i[2]=vc(l-1/3,s,o);else if(~e.indexOf("="))return i=e.match(pm),n&&i.length<4&&(i[3]=1),i}else i=e.match(vu)||Go.transparent;i=i.map(Number)}return t&&!g&&(s=i[0]/_t,o=i[1]/_t,a=i[2]/_t,h=Math.max(s,o,a),f=Math.min(s,o,a),u=(h+f)/2,h===f?l=c=0:(d=h-f,c=u>.5?d/(2-h-f):d/(h+f),l=h===s?(o-a)/d+(o<a?6:0):h===o?(a-s)/d+2:(s-o)/d+4,l*=60),i[0]=~~(l+.5),i[1]=~~(c*100+.5),i[2]=~~(u*100+.5)),n&&i.length<4&&(i[3]=1),i},km=function(e){var t=[],n=[],i=-1;return e.split(xr).forEach(function(s){var o=s.match($s)||[];t.push.apply(t,o),n.push(i+=o.length+1)}),t.c=n,t},gf=function(e,t,n){var i="",s=(e+i).match(xr),o=t?"hsla(":"rgba(",a=0,l,c,u,h;if(!s)return e;if(s=s.map(function(f){return(f=Bm(f,t,1))&&o+(t?f[0]+","+f[1]+"%,"+f[2]+"%,"+f[3]:f.join(","))+")"}),n&&(u=km(e),l=n.c,l.join(i)!==u.c.join(i)))for(c=e.replace(xr,"1").split($s),h=c.length-1;a<h;a++)i+=c[a]+(~l.indexOf(a)?s.shift()||o+"0,0,0,0)":(u.length?u:s.length?s:n).shift());if(!c)for(c=e.split(xr),h=c.length-1;a<h;a++)i+=c[a]+s[a];return i+c[h]},xr=function(){var r="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in Go)r+="|"+e+"\\b";return new RegExp(r+")","gi")}(),W0=/hsl[a]?\(/,zm=function(e){var t=e.join(" "),n;if(xr.lastIndex=0,xr.test(t))return n=W0.test(t),e[1]=gf(e[1],n),e[0]=gf(e[0],n,km(e[1])),!0},da,zn=function(){var r=Date.now,e=500,t=33,n=r(),i=n,s=1e3/240,o=s,a=[],l,c,u,h,f,d,g=function _(p){var m=r()-i,S=p===!0,y,x,T,b;if((m>e||m<0)&&(n+=m-t),i+=m,T=i-n,y=T-o,(y>0||S)&&(b=++h.frame,f=T-h.time*1e3,h.time=T=T/1e3,o+=y+(y>=s?4:s-y),x=1),S||(l=c(_)),x)for(d=0;d<a.length;d++)a[d](T,f,b,p)};return h={time:0,frame:0,tick:function(){g(!0)},deltaRatio:function(p){return f/(1e3/(p||60))},wake:function(){_m&&(!xu&&gh()&&(di=xu=window,_h=di.document||{},Xn.gsap=In,(di.gsapVersions||(di.gsapVersions=[])).push(In.version),vm(Pl||di.GreenSockGlobals||!di.gsap&&di||{}),Um.forEach(Fm)),u=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&h.sleep(),c=u||function(p){return setTimeout(p,o-h.time*1e3+1|0)},da=1,g(2))},sleep:function(){(u?cancelAnimationFrame:clearTimeout)(l),da=0,c=ha},lagSmoothing:function(p,m){e=p||1/0,t=Math.min(m||33,e)},fps:function(p){s=1e3/(p||240),o=h.time*1e3+s},add:function(p,m,S){var y=m?function(x,T,b,M){p(x,T,b,M),h.remove(y)}:p;return h.remove(p),a[S?"unshift":"push"](y),fo(),y},remove:function(p,m){~(m=a.indexOf(p))&&a.splice(m,1)&&d>=m&&d--},_listeners:a},h}(),fo=function(){return!da&&zn.wake()},ut={},X0=/^[\d.\-M][\d.\-,\s]/,q0=/["']/g,Y0=function(e){for(var t={},n=e.substr(1,e.length-3).split(":"),i=n[0],s=1,o=n.length,a,l,c;s<o;s++)l=n[s],a=s!==o-1?l.lastIndexOf(","):l.length,c=l.substr(0,a),t[i]=isNaN(c)?c.replace(q0,"").trim():+c,i=l.substr(a+1).trim();return t},j0=function(e){var t=e.indexOf("(")+1,n=e.indexOf(")"),i=e.indexOf("(",t);return e.substring(t,~i&&i<n?e.indexOf(")",n+1):n)},$0=function(e){var t=(e+"").split("("),n=ut[t[0]];return n&&t.length>1&&n.config?n.config.apply(null,~e.indexOf("{")?[Y0(t[1])]:j0(e).split(",").map(Em)):ut._CE&&X0.test(e)?ut._CE("",e):n},Hm=function(e){return function(t){return 1-e(1-t)}},Gm=function r(e,t){for(var n=e._first,i;n;)n instanceof En?r(n,t):n.vars.yoyoEase&&(!n._yoyo||!n._repeat)&&n._yoyo!==t&&(n.timeline?r(n.timeline,t):(i=n._ease,n._ease=n._yEase,n._yEase=i,n._yoyo=t)),n=n._next},ns=function(e,t){return e&&(Ot(e)?e:ut[e]||$0(e))||t},xs=function(e,t,n,i){n===void 0&&(n=function(l){return 1-t(1-l)}),i===void 0&&(i=function(l){return l<.5?t(l*2)/2:1-t((1-l)*2)/2});var s={easeIn:t,easeOut:n,easeInOut:i},o;return Cn(e,function(a){ut[a]=Xn[a]=s,ut[o=a.toLowerCase()]=n;for(var l in s)ut[o+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=ut[a+"."+l]=s[l]}),s},Vm=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},xc=function r(e,t,n){var i=t>=1?t:1,s=(n||(e?.3:.45))/(t<1?t:1),o=s/_u*(Math.asin(1/i)||0),a=function(u){return u===1?1:i*Math.pow(2,-10*u)*E0((u-o)*s)+1},l=e==="out"?a:e==="in"?function(c){return 1-a(1-c)}:Vm(a);return s=_u/s,l.config=function(c,u){return r(e,c,u)},l},yc=function r(e,t){t===void 0&&(t=1.70158);var n=function(o){return o?--o*o*((t+1)*o+t)+1:0},i=e==="out"?n:e==="in"?function(s){return 1-n(1-s)}:Vm(n);return i.config=function(s){return r(e,s)},i};Cn("Linear,Quad,Cubic,Quart,Quint,Strong",function(r,e){var t=e<5?e+1:e;xs(r+",Power"+(t-1),e?function(n){return Math.pow(n,t)}:function(n){return n},function(n){return 1-Math.pow(1-n,t)},function(n){return n<.5?Math.pow(n*2,t)/2:1-Math.pow((1-n)*2,t)/2})});ut.Linear.easeNone=ut.none=ut.Linear.easeIn;xs("Elastic",xc("in"),xc("out"),xc());(function(r,e){var t=1/e,n=2*t,i=2.5*t,s=function(a){return a<t?r*a*a:a<n?r*Math.pow(a-1.5/e,2)+.75:a<i?r*(a-=2.25/e)*a+.9375:r*Math.pow(a-2.625/e,2)+.984375};xs("Bounce",function(o){return 1-s(1-o)},s)})(7.5625,2.75);xs("Expo",function(r){return r?Math.pow(2,10*(r-1)):0});xs("Circ",function(r){return-(fm(1-r*r)-1)});xs("Sine",function(r){return r===1?1:-M0(r*y0)+1});xs("Back",yc("in"),yc("out"),yc());ut.SteppedEase=ut.steps=Xn.SteppedEase={config:function(e,t){e===void 0&&(e=1);var n=1/e,i=e+(t?0:1),s=t?1:0,o=1-St;return function(a){return((i*Ta(0,o,a)|0)+s)*n}}};co.ease=ut["quad.out"];Cn("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(r){return yh+=r+","+r+"Params,"});var Wm=function(e,t){this.id=S0++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:Sm,this.set=t?t.getSetter:bh},pa=function(){function r(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,ho(this,+t.duration,1,1),this.data=t.data,At&&(this._ctx=At,At.data.push(this)),da||zn.wake()}var e=r.prototype;return e.delay=function(n){return n||n===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+n-this._delay),this._delay=n,this):this._delay},e.duration=function(n){return arguments.length?this.totalDuration(this._repeat>0?n+(n+this._rDelay)*this._repeat:n):this.totalDuration()&&this._dur},e.totalDuration=function(n){return arguments.length?(this._dirty=0,ho(this,this._repeat<0?n:(n-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(n,i){if(fo(),!arguments.length)return this._tTime;var s=this._dp;if(s&&s.smoothChildTiming&&this._ts){for(ic(this,n),!s._dp||s.parent||Am(s,this);s&&s.parent;)s.parent._time!==s._start+(s._ts>=0?s._tTime/s._ts:(s.totalDuration()-s._tTime)/-s._ts)&&s.totalTime(s._tTime,!0),s=s.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&n<this._tDur||this._ts<0&&n>0||!this._tDur&&!n)&&gi(this._dp,this,this._start-this._delay)}return(this._tTime!==n||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===St||!n&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=n),Mm(this,n,i)),this},e.time=function(n,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),n+df(this))%(this._dur+this._rDelay)||(n?this._dur:0),i):this._time},e.totalProgress=function(n,i){return arguments.length?this.totalTime(this.totalDuration()*n,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>0?1:0},e.progress=function(n,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-n:n)+df(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(n,i){var s=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(n-1)*s,i):this._repeat?uo(this._tTime,s)+1:1},e.timeScale=function(n,i){if(!arguments.length)return this._rts===-St?0:this._rts;if(this._rts===n)return this;var s=this.parent&&this._ts?Il(this.parent._time,this):this._tTime;return this._rts=+n||0,this._ts=this._ps||n===-St?0:this._rts,this.totalTime(Ta(-Math.abs(this._delay),this._tDur,s),i!==!1),nc(this),P0(this)},e.paused=function(n){return arguments.length?(this._ps!==n&&(this._ps=n,n?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(fo(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==St&&(this._tTime-=St)))),this):this._ps},e.startTime=function(n){if(arguments.length){this._start=n;var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&gi(i,this,n-this._delay),this}return this._start},e.endTime=function(n){return this._start+(Rn(n)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(n){var i=this.parent||this._dp;return i?n&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Il(i.rawTime(n),this):this._tTime:this._tTime},e.revert=function(n){n===void 0&&(n=A0);var i=hn;return hn=n,(this._initted||this._startAt)&&(this.timeline&&this.timeline.revert(n),this.totalTime(-.01,n.suppressEvents)),this.data!=="nested"&&n.kill!==!1&&this.kill(),hn=i,this},e.globalTime=function(n){for(var i=this,s=arguments.length?n:i.rawTime();i;)s=i._start+s/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(n):s},e.repeat=function(n){return arguments.length?(this._repeat=n===1/0?-2:n,pf(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(n){if(arguments.length){var i=this._time;return this._rDelay=n,pf(this),i?this.time(i):this}return this._rDelay},e.yoyo=function(n){return arguments.length?(this._yoyo=n,this):this._yoyo},e.seek=function(n,i){return this.totalTime(jn(this,n),Rn(i))},e.restart=function(n,i){return this.play().totalTime(n?-this._delay:0,Rn(i))},e.play=function(n,i){return n!=null&&this.seek(n,i),this.reversed(!1).paused(!1)},e.reverse=function(n,i){return n!=null&&this.seek(n||this.totalDuration(),i),this.reversed(!0).paused(!1)},e.pause=function(n,i){return n!=null&&this.seek(n,i),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(n){return arguments.length?(!!n!==this.reversed()&&this.timeScale(-this._rts||(n?-St:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-St,this},e.isActive=function(){var n=this.parent||this._dp,i=this._start,s;return!!(!n||this._ts&&this._initted&&n.isActive()&&(s=n.rawTime(!0))>=i&&s<this.endTime(!0)-St)},e.eventCallback=function(n,i,s){var o=this.vars;return arguments.length>1?(i?(o[n]=i,s&&(o[n+"Params"]=s),n==="onUpdate"&&(this._onUpdate=i)):delete o[n],this):o[n]},e.then=function(n){var i=this;return new Promise(function(s){var o=Ot(n)?n:Tm,a=function(){var c=i.then;i.then=null,Ot(o)&&(o=o(i))&&(o.then||o===i)&&(i.then=c),s(o),i.then=c};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?a():i._prom=a})},e.kill=function(){Ho(this)},r}();ri(pa.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-St,_prom:0,_ps:!1,_rts:1});var En=function(r){hm(e,r);function e(n,i){var s;return n===void 0&&(n={}),s=r.call(this,n)||this,s.labels={},s.smoothChildTiming=!!n.smoothChildTiming,s.autoRemoveChildren=!!n.autoRemoveChildren,s._sort=Rn(n.sortChildren),Ct&&gi(n.parent||Ct,zi(s),i),n.reversed&&s.reverse(),n.paused&&s.paused(!0),n.scrollTrigger&&wm(zi(s),n.scrollTrigger),s}var t=e.prototype;return t.to=function(i,s,o){return $o(0,arguments,this),this},t.from=function(i,s,o){return $o(1,arguments,this),this},t.fromTo=function(i,s,o,a){return $o(2,arguments,this),this},t.set=function(i,s,o){return s.duration=0,s.parent=this,jo(s).repeatDelay||(s.repeat=0),s.immediateRender=!!s.immediateRender,new kt(i,s,jn(this,o),1),this},t.call=function(i,s,o){return gi(this,kt.delayedCall(0,i,s),o)},t.staggerTo=function(i,s,o,a,l,c,u){return o.duration=s,o.stagger=o.stagger||a,o.onComplete=c,o.onCompleteParams=u,o.parent=this,new kt(i,o,jn(this,l)),this},t.staggerFrom=function(i,s,o,a,l,c,u){return o.runBackwards=1,jo(o).immediateRender=Rn(o.immediateRender),this.staggerTo(i,s,o,a,l,c,u)},t.staggerFromTo=function(i,s,o,a,l,c,u,h){return a.startAt=o,jo(a).immediateRender=Rn(a.immediateRender),this.staggerTo(i,s,a,l,c,u,h)},t.render=function(i,s,o){var a=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,u=i<=0?0:Kt(i),h=this._zTime<0!=i<0&&(this._initted||!c),f,d,g,_,p,m,S,y,x,T,b,M;if(this!==Ct&&u>l&&i>=0&&(u=l),u!==this._tTime||o||h){if(a!==this._time&&c&&(u+=this._time-a,i+=this._time-a),f=u,x=this._start,y=this._ts,m=!y,h&&(c||(a=this._zTime),(i||!s)&&(this._zTime=i)),this._repeat){if(b=this._yoyo,p=c+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(p*100+i,s,o);if(f=Kt(u%p),u===l?(_=this._repeat,f=c):(_=~~(u/p),_&&_===u/p&&(f=c,_--),f>c&&(f=c)),T=uo(this._tTime,p),!a&&this._tTime&&T!==_&&this._tTime-T*p-this._dur<=0&&(T=_),b&&_&1&&(f=c-f,M=1),_!==T&&!this._lock){var I=b&&T&1,O=I===(b&&_&1);if(_<T&&(I=!I),a=I?0:u%c?c:u,this._lock=1,this.render(a||(M?0:Kt(_*p)),s,!c)._lock=0,this._tTime=u,!s&&this.parent&&Gn(this,"onRepeat"),this.vars.repeatRefresh&&!M&&(this.invalidate()._lock=1),a&&a!==this._time||m!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,O&&(this._lock=2,a=I?c:-1e-4,this.render(a,!0),this.vars.repeatRefresh&&!M&&this.invalidate()),this._lock=0,!this._ts&&!m)return this;Gm(this,M)}}if(this._hasPause&&!this._forcing&&this._lock<2&&(S=O0(this,Kt(a),Kt(f)),S&&(u-=f-(f=S._start))),this._tTime=u,this._time=f,this._act=!y,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,a=0),!a&&f&&!s&&!_&&(Gn(this,"onStart"),this._tTime!==u))return this;if(f>=a&&i>=0)for(d=this._first;d;){if(g=d._next,(d._act||f>=d._start)&&d._ts&&S!==d){if(d.parent!==this)return this.render(i,s,o);if(d.render(d._ts>0?(f-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(f-d._start)*d._ts,s,o),f!==this._time||!this._ts&&!m){S=0,g&&(u+=this._zTime=-St);break}}d=g}else{d=this._last;for(var v=i<0?i:f;d;){if(g=d._prev,(d._act||v<=d._end)&&d._ts&&S!==d){if(d.parent!==this)return this.render(i,s,o);if(d.render(d._ts>0?(v-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(v-d._start)*d._ts,s,o||hn&&(d._initted||d._startAt)),f!==this._time||!this._ts&&!m){S=0,g&&(u+=this._zTime=v?-St:St);break}}d=g}}if(S&&!s&&(this.pause(),S.render(f>=a?0:-St)._zTime=f>=a?1:-1,this._ts))return this._start=x,nc(this),this.render(i,s,o);this._onUpdate&&!s&&Gn(this,"onUpdate",!0),(u===l&&this._tTime>=this.totalDuration()||!u&&a)&&(x===this._start||Math.abs(y)!==Math.abs(this._ts))&&(this._lock||((i||!c)&&(u===l&&this._ts>0||!u&&this._ts<0)&&Tr(this,1),!s&&!(i<0&&!a)&&(u||a||!l)&&(Gn(this,u===l&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(u<l&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(i,s){var o=this;if(ji(s)||(s=jn(this,s,i)),!(i instanceof pa)){if(fn(i))return i.forEach(function(a){return o.add(a,s)}),this;if(Qt(i))return this.addLabel(i,s);if(Ot(i))i=kt.delayedCall(0,i);else return this}return this!==i?gi(this,i,s):this},t.getChildren=function(i,s,o,a){i===void 0&&(i=!0),s===void 0&&(s=!0),o===void 0&&(o=!0),a===void 0&&(a=-ti);for(var l=[],c=this._first;c;)c._start>=a&&(c instanceof kt?s&&l.push(c):(o&&l.push(c),i&&l.push.apply(l,c.getChildren(!0,s,o)))),c=c._next;return l},t.getById=function(i){for(var s=this.getChildren(1,1,1),o=s.length;o--;)if(s[o].vars.id===i)return s[o]},t.remove=function(i){return Qt(i)?this.removeLabel(i):Ot(i)?this.killTweensOf(i):(tc(this,i),i===this._recent&&(this._recent=this._last),ts(this))},t.totalTime=function(i,s){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=Kt(zn.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),r.prototype.totalTime.call(this,i,s),this._forcing=0,this):this._tTime},t.addLabel=function(i,s){return this.labels[i]=jn(this,s),this},t.removeLabel=function(i){return delete this.labels[i],this},t.addPause=function(i,s,o){var a=kt.delayedCall(0,s||ha,o);return a.data="isPause",this._hasPause=1,gi(this,a,jn(this,i))},t.removePause=function(i){var s=this._first;for(i=jn(this,i);s;)s._start===i&&s.data==="isPause"&&Tr(s),s=s._next},t.killTweensOf=function(i,s,o){for(var a=this.getTweensOf(i,o),l=a.length;l--;)hr!==a[l]&&a[l].kill(i,s);return this},t.getTweensOf=function(i,s){for(var o=[],a=ni(i),l=this._first,c=ji(s),u;l;)l instanceof kt?w0(l._targets,a)&&(c?(!hr||l._initted&&l._ts)&&l.globalTime(0)<=s&&l.globalTime(l.totalDuration())>s:!s||l.isActive())&&o.push(l):(u=l.getTweensOf(a,s)).length&&o.push.apply(o,u),l=l._next;return o},t.tweenTo=function(i,s){s=s||{};var o=this,a=jn(o,i),l=s,c=l.startAt,u=l.onStart,h=l.onStartParams,f=l.immediateRender,d,g=kt.to(o,ri({ease:s.ease||"none",lazy:!1,immediateRender:!1,time:a,overwrite:"auto",duration:s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale())||St,onStart:function(){if(o.pause(),!d){var p=s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale());g._dur!==p&&ho(g,p,0,1).render(g._time,!0,!0),d=1}u&&u.apply(g,h||[])}},s));return f?g.render(0):g},t.tweenFromTo=function(i,s,o){return this.tweenTo(s,ri({startAt:{time:jn(this,i)}},o))},t.recent=function(){return this._recent},t.nextLabel=function(i){return i===void 0&&(i=this._time),mf(this,jn(this,i))},t.previousLabel=function(i){return i===void 0&&(i=this._time),mf(this,jn(this,i),1)},t.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+St)},t.shiftChildren=function(i,s,o){o===void 0&&(o=0);for(var a=this._first,l=this.labels,c;a;)a._start>=o&&(a._start+=i,a._end+=i),a=a._next;if(s)for(c in l)l[c]>=o&&(l[c]+=i);return ts(this)},t.invalidate=function(i){var s=this._first;for(this._lock=0;s;)s.invalidate(i),s=s._next;return r.prototype.invalidate.call(this,i)},t.clear=function(i){i===void 0&&(i=!0);for(var s=this._first,o;s;)o=s._next,this.remove(s),s=o;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),ts(this)},t.totalDuration=function(i){var s=0,o=this,a=o._last,l=ti,c,u,h;if(arguments.length)return o.timeScale((o._repeat<0?o.duration():o.totalDuration())/(o.reversed()?-i:i));if(o._dirty){for(h=o.parent;a;)c=a._prev,a._dirty&&a.totalDuration(),u=a._start,u>l&&o._sort&&a._ts&&!o._lock?(o._lock=1,gi(o,a,u-a._delay,1)._lock=0):l=u,u<0&&a._ts&&(s-=u,(!h&&!o._dp||h&&h.smoothChildTiming)&&(o._start+=u/o._ts,o._time-=u,o._tTime-=u),o.shiftChildren(-u,!1,-1/0),l=0),a._end>s&&a._ts&&(s=a._end),a=c;ho(o,o===Ct&&o._time>s?o._time:s,1,1),o._dirty=0}return o._tDur},e.updateRoot=function(i){if(Ct._ts&&(Mm(Ct,Il(i,Ct)),ym=zn.frame),zn.frame>=hf){hf+=Wn.autoSleep||120;var s=Ct._first;if((!s||!s._ts)&&Wn.autoSleep&&zn._listeners.length<2){for(;s&&!s._ts;)s=s._next;s||zn.sleep()}}},e}(pa);ri(En.prototype,{_lock:0,_hasPause:0,_forcing:0});var K0=function(e,t,n,i,s,o,a){var l=new Pn(this._pt,e,t,0,1,Km,null,s),c=0,u=0,h,f,d,g,_,p,m,S;for(l.b=n,l.e=i,n+="",i+="",(m=~i.indexOf("random("))&&(i=fa(i)),o&&(S=[n,i],o(S,e,t),n=S[0],i=S[1]),f=n.match(gc)||[];h=gc.exec(i);)g=h[0],_=i.substring(c,h.index),d?d=(d+1)%5:_.substr(-5)==="rgba("&&(d=1),g!==f[u++]&&(p=parseFloat(f[u-1])||0,l._pt={_next:l._pt,p:_||u===1?_:",",s:p,c:g.charAt(1)==="="?eo(p,g)-p:parseFloat(g)-p,m:d&&d<4?Math.round:0},c=gc.lastIndex);return l.c=c<i.length?i.substring(c,i.length):"",l.fp=a,(mm.test(i)||m)&&(l.e=0),this._pt=l,l},Mh=function(e,t,n,i,s,o,a,l,c,u){Ot(i)&&(i=i(s||0,e,o));var h=e[t],f=n!=="get"?n:Ot(h)?c?e[t.indexOf("set")||!Ot(e["get"+t.substr(3)])?t:"get"+t.substr(3)](c):e[t]():h,d=Ot(h)?c?tv:jm:Th,g;if(Qt(i)&&(~i.indexOf("random(")&&(i=fa(i)),i.charAt(1)==="="&&(g=eo(f,i)+(un(f)||0),(g||g===0)&&(i=g))),!u||f!==i||Au)return!isNaN(f*i)&&i!==""?(g=new Pn(this._pt,e,t,+f||0,i-(f||0),typeof h=="boolean"?iv:$m,0,d),c&&(g.fp=c),a&&g.modifier(a,this,e),this._pt=g):(!h&&!(t in e)&&vh(t,i),K0.call(this,e,t,f,i,d,l||Wn.stringFilter,c))},Z0=function(e,t,n,i,s){if(Ot(e)&&(e=Ko(e,s,t,n,i)),!wi(e)||e.style&&e.nodeType||fn(e)||dm(e))return Qt(e)?Ko(e,s,t,n,i):e;var o={},a;for(a in e)o[a]=Ko(e[a],s,t,n,i);return o},Xm=function(e,t,n,i,s,o){var a,l,c,u;if(kn[e]&&(a=new kn[e]).init(s,a.rawVars?t[e]:Z0(t[e],i,s,o,n),n,i,o)!==!1&&(n._pt=l=new Pn(n._pt,s,e,0,1,a.render,a,0,a.priority),n!==Ks))for(c=n._ptLookup[n._targets.indexOf(s)],u=a._props.length;u--;)c[a._props[u]]=l;return a},hr,Au,Eh=function r(e,t,n){var i=e.vars,s=i.ease,o=i.startAt,a=i.immediateRender,l=i.lazy,c=i.onUpdate,u=i.runBackwards,h=i.yoyoEase,f=i.keyframes,d=i.autoRevert,g=e._dur,_=e._startAt,p=e._targets,m=e.parent,S=m&&m.data==="nested"?m.vars.targets:p,y=e._overwrite==="auto"&&!ph,x=e.timeline,T,b,M,I,O,v,R,N,$,D,H,B,Y;if(x&&(!f||!s)&&(s="none"),e._ease=ns(s,co.ease),e._yEase=h?Hm(ns(h===!0?s:h,co.ease)):0,h&&e._yoyo&&!e._repeat&&(h=e._yEase,e._yEase=e._ease,e._ease=h),e._from=!x&&!!i.runBackwards,!x||f&&!i.stagger){if(N=p[0]?es(p[0]).harness:0,B=N&&i[N.prop],T=Dl(i,xh),_&&(_._zTime<0&&_.progress(1),t<0&&u&&a&&!d?_.render(-1,!0):_.revert(u&&g?_l:b0),_._lazy=0),o){if(Tr(e._startAt=kt.set(p,ri({data:"isStart",overwrite:!1,parent:m,immediateRender:!0,lazy:!_&&Rn(l),startAt:null,delay:0,onUpdate:c&&function(){return Gn(e,"onUpdate")},stagger:0},o))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(hn||!a&&!d)&&e._startAt.revert(_l),a&&g&&t<=0&&n<=0){t&&(e._zTime=t);return}}else if(u&&g&&!_){if(t&&(a=!1),M=ri({overwrite:!1,data:"isFromStart",lazy:a&&!_&&Rn(l),immediateRender:a,stagger:0,parent:m},T),B&&(M[N.prop]=B),Tr(e._startAt=kt.set(p,M)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(hn?e._startAt.revert(_l):e._startAt.render(-1,!0)),e._zTime=t,!a)r(e._startAt,St,St);else if(!t)return}for(e._pt=e._ptCache=0,l=g&&Rn(l)||l&&!g,b=0;b<p.length;b++){if(O=p[b],R=O._gsap||Sh(p)[b]._gsap,e._ptLookup[b]=D={},yu[R.id]&&vr.length&&Ll(),H=S===p?b:S.indexOf(O),N&&($=new N).init(O,B||T,e,H,S)!==!1&&(e._pt=I=new Pn(e._pt,O,$.name,0,1,$.render,$,0,$.priority),$._props.forEach(function(j){D[j]=I}),$.priority&&(v=1)),!N||B)for(M in T)kn[M]&&($=Xm(M,T,e,H,O,S))?$.priority&&(v=1):D[M]=I=Mh.call(e,O,M,"get",T[M],H,S,0,i.stringFilter);e._op&&e._op[b]&&e.kill(O,e._op[b]),y&&e._pt&&(hr=e,Ct.killTweensOf(O,D,e.globalTime(t)),Y=!e.parent,hr=0),e._pt&&l&&(yu[R.id]=1)}v&&Zm(e),e._onInit&&e._onInit(e)}e._onUpdate=c,e._initted=(!e._op||e._pt)&&!Y,f&&t<=0&&x.render(ti,!0,!0)},J0=function(e,t,n,i,s,o,a,l){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],u,h,f,d;if(!c)for(c=e._ptCache[t]=[],f=e._ptLookup,d=e._targets.length;d--;){if(u=f[d][t],u&&u.d&&u.d._pt)for(u=u.d._pt;u&&u.p!==t&&u.fp!==t;)u=u._next;if(!u)return Au=1,e.vars[t]="+=0",Eh(e,a),Au=0,l?ua(t+" not eligible for reset"):1;c.push(u)}for(d=c.length;d--;)h=c[d],u=h._pt||h,u.s=(i||i===0)&&!s?i:u.s+(i||0)+o*u.c,u.c=n-u.s,h.e&&(h.e=Nt(n)+un(h.e)),h.b&&(h.b=u.s+un(h.b))},Q0=function(e,t){var n=e[0]?es(e[0]).harness:0,i=n&&n.aliases,s,o,a,l;if(!i)return t;s=hs({},t);for(o in i)if(o in s)for(l=i[o].split(","),a=l.length;a--;)s[l[a]]=s[o];return s},ev=function(e,t,n,i){var s=t.ease||i||"power1.inOut",o,a;if(fn(t))a=n[e]||(n[e]=[]),t.forEach(function(l,c){return a.push({t:c/(t.length-1)*100,v:l,e:s})});else for(o in t)a=n[o]||(n[o]=[]),o==="ease"||a.push({t:parseFloat(e),v:t[o],e:s})},Ko=function(e,t,n,i,s){return Ot(e)?e.call(t,n,i,s):Qt(e)&&~e.indexOf("random(")?fa(e):e},qm=yh+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",Ym={};Cn(qm+",id,stagger,delay,duration,paused,scrollTrigger",function(r){return Ym[r]=1});var kt=function(r){hm(e,r);function e(n,i,s,o){var a;typeof i=="number"&&(s.duration=i,i=s,s=null),a=r.call(this,o?i:jo(i))||this;var l=a.vars,c=l.duration,u=l.delay,h=l.immediateRender,f=l.stagger,d=l.overwrite,g=l.keyframes,_=l.defaults,p=l.scrollTrigger,m=l.yoyoEase,S=i.parent||Ct,y=(fn(n)||dm(n)?ji(n[0]):"length"in i)?[n]:ni(n),x,T,b,M,I,O,v,R;if(a._targets=y.length?Sh(y):ua("GSAP target "+n+" not found. https://gsap.com",!Wn.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=d,g||f||Ca(c)||Ca(u)){if(i=a.vars,x=a.timeline=new En({data:"nested",defaults:_||{},targets:S&&S.data==="nested"?S.vars.targets:y}),x.kill(),x.parent=x._dp=zi(a),x._start=0,f||Ca(c)||Ca(u)){if(M=y.length,v=f&&Lm(f),wi(f))for(I in f)~qm.indexOf(I)&&(R||(R={}),R[I]=f[I]);for(T=0;T<M;T++)b=Dl(i,Ym),b.stagger=0,m&&(b.yoyoEase=m),R&&hs(b,R),O=y[T],b.duration=+Ko(c,zi(a),T,O,y),b.delay=(+Ko(u,zi(a),T,O,y)||0)-a._delay,!f&&M===1&&b.delay&&(a._delay=u=b.delay,a._start+=u,b.delay=0),x.to(O,b,v?v(T,O,y):0),x._ease=ut.none;x.duration()?c=u=0:a.timeline=0}else if(g){jo(ri(x.vars.defaults,{ease:"none"})),x._ease=ns(g.ease||i.ease||"none");var N=0,$,D,H;if(fn(g))g.forEach(function(B){return x.to(y,B,">")}),x.duration();else{b={};for(I in g)I==="ease"||I==="easeEach"||ev(I,g[I],b,g.easeEach);for(I in b)for($=b[I].sort(function(B,Y){return B.t-Y.t}),N=0,T=0;T<$.length;T++)D=$[T],H={ease:D.e,duration:(D.t-(T?$[T-1].t:0))/100*c},H[I]=D.v,x.to(y,H,N),N+=H.duration;x.duration()<c&&x.to({},{duration:c-x.duration()})}}c||a.duration(c=x.duration())}else a.timeline=0;return d===!0&&!ph&&(hr=zi(a),Ct.killTweensOf(y),hr=0),gi(S,zi(a),s),i.reversed&&a.reverse(),i.paused&&a.paused(!0),(h||!c&&!g&&a._start===Kt(S._time)&&Rn(h)&&L0(zi(a))&&S.data!=="nested")&&(a._tTime=-St,a.render(Math.max(0,-u)||0)),p&&wm(zi(a),p),a}var t=e.prototype;return t.render=function(i,s,o){var a=this._time,l=this._tDur,c=this._dur,u=i<0,h=i>l-St&&!u?l:i<St?0:i,f,d,g,_,p,m,S,y,x;if(!c)I0(this,i,s,o);else if(h!==this._tTime||!i||o||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==u){if(f=h,y=this.timeline,this._repeat){if(_=c+this._rDelay,this._repeat<-1&&u)return this.totalTime(_*100+i,s,o);if(f=Kt(h%_),h===l?(g=this._repeat,f=c):(g=~~(h/_),g&&g===Kt(h/_)&&(f=c,g--),f>c&&(f=c)),m=this._yoyo&&g&1,m&&(x=this._yEase,f=c-f),p=uo(this._tTime,_),f===a&&!o&&this._initted&&g===p)return this._tTime=h,this;g!==p&&(y&&this._yEase&&Gm(y,m),this.vars.repeatRefresh&&!m&&!this._lock&&this._time!==_&&this._initted&&(this._lock=o=1,this.render(Kt(_*g),!0).invalidate()._lock=0))}if(!this._initted){if(Rm(this,u?i:f,o,s,h))return this._tTime=0,this;if(a!==this._time&&!(o&&this.vars.repeatRefresh&&g!==p))return this;if(c!==this._dur)return this.render(i,s,o)}if(this._tTime=h,this._time=f,!this._act&&this._ts&&(this._act=1,this._lazy=0),this.ratio=S=(x||this._ease)(f/c),this._from&&(this.ratio=S=1-S),f&&!a&&!s&&!g&&(Gn(this,"onStart"),this._tTime!==h))return this;for(d=this._pt;d;)d.r(S,d.d),d=d._next;y&&y.render(i<0?i:y._dur*y._ease(f/this._dur),s,o)||this._startAt&&(this._zTime=i),this._onUpdate&&!s&&(u&&Su(this,i,s,o),Gn(this,"onUpdate")),this._repeat&&g!==p&&this.vars.onRepeat&&!s&&this.parent&&Gn(this,"onRepeat"),(h===this._tDur||!h)&&this._tTime===h&&(u&&!this._onUpdate&&Su(this,i,!0,!0),(i||!c)&&(h===this._tDur&&this._ts>0||!h&&this._ts<0)&&Tr(this,1),!s&&!(u&&!a)&&(h||a||m)&&(Gn(this,h===l?"onComplete":"onReverseComplete",!0),this._prom&&!(h<l&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),r.prototype.invalidate.call(this,i)},t.resetTo=function(i,s,o,a,l){da||zn.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),u;return this._initted||Eh(this,c),u=this._ease(c/this._dur),J0(this,i,s,o,a,u,c,l)?this.resetTo(i,s,o,a,1):(ic(this,0),this.parent||bm(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(i,s){if(s===void 0&&(s="all"),!i&&(!s||s==="all"))return this._lazy=this._pt=0,this.parent?Ho(this):this;if(this.timeline){var o=this.timeline.totalDuration();return this.timeline.killTweensOf(i,s,hr&&hr.vars.overwrite!==!0)._first||Ho(this),this.parent&&o!==this.timeline.totalDuration()&&ho(this,this._dur*this.timeline._tDur/o,0,1),this}var a=this._targets,l=i?ni(i):a,c=this._ptLookup,u=this._pt,h,f,d,g,_,p,m;if((!s||s==="all")&&C0(a,l))return s==="all"&&(this._pt=0),Ho(this);for(h=this._op=this._op||[],s!=="all"&&(Qt(s)&&(_={},Cn(s,function(S){return _[S]=1}),s=_),s=Q0(a,s)),m=a.length;m--;)if(~l.indexOf(a[m])){f=c[m],s==="all"?(h[m]=s,g=f,d={}):(d=h[m]=h[m]||{},g=s);for(_ in g)p=f&&f[_],p&&((!("kill"in p.d)||p.d.kill(_)===!0)&&tc(this,p,"_pt"),delete f[_]),d!=="all"&&(d[_]=1)}return this._initted&&!this._pt&&u&&Ho(this),this},e.to=function(i,s){return new e(i,s,arguments[2])},e.from=function(i,s){return $o(1,arguments)},e.delayedCall=function(i,s,o,a){return new e(s,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:s,onReverseComplete:s,onCompleteParams:o,onReverseCompleteParams:o,callbackScope:a})},e.fromTo=function(i,s,o){return $o(2,arguments)},e.set=function(i,s){return s.duration=0,s.repeatDelay||(s.repeat=0),new e(i,s)},e.killTweensOf=function(i,s,o){return Ct.killTweensOf(i,s,o)},e}(pa);ri(kt.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});Cn("staggerTo,staggerFrom,staggerFromTo",function(r){kt[r]=function(){var e=new En,t=Eu.call(arguments,0);return t.splice(r==="staggerFromTo"?5:4,0,0),e[r].apply(e,t)}});var Th=function(e,t,n){return e[t]=n},jm=function(e,t,n){return e[t](n)},tv=function(e,t,n,i){return e[t](i.fp,n)},nv=function(e,t,n){return e.setAttribute(t,n)},bh=function(e,t){return Ot(e[t])?jm:mh(e[t])&&e.setAttribute?nv:Th},$m=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},iv=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},Km=function(e,t){var n=t._pt,i="";if(!e&&t.b)i=t.b;else if(e===1&&t.e)i=t.e;else{for(;n;)i=n.p+(n.m?n.m(n.s+n.c*e):Math.round((n.s+n.c*e)*1e4)/1e4)+i,n=n._next;i+=t.c}t.set(t.t,t.p,i,t)},Ah=function(e,t){for(var n=t._pt;n;)n.r(e,n.d),n=n._next},rv=function(e,t,n,i){for(var s=this._pt,o;s;)o=s._next,s.p===i&&s.modifier(e,t,n),s=o},sv=function(e){for(var t=this._pt,n,i;t;)i=t._next,t.p===e&&!t.op||t.op===e?tc(this,t,"_pt"):t.dep||(n=1),t=i;return!n},ov=function(e,t,n,i){i.mSet(e,t,i.m.call(i.tween,n,i.mt),i)},Zm=function(e){for(var t=e._pt,n,i,s,o;t;){for(n=t._next,i=s;i&&i.pr>t.pr;)i=i._next;(t._prev=i?i._prev:o)?t._prev._next=t:s=t,(t._next=i)?i._prev=t:o=t,t=n}e._pt=s},Pn=function(){function r(t,n,i,s,o,a,l,c,u){this.t=n,this.s=s,this.c=o,this.p=i,this.r=a||$m,this.d=l||this,this.set=c||Th,this.pr=u||0,this._next=t,t&&(t._prev=this)}var e=r.prototype;return e.modifier=function(n,i,s){this.mSet=this.mSet||this.set,this.set=ov,this.m=n,this.mt=s,this.tween=i},r}();Cn(yh+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",function(r){return xh[r]=1});Xn.TweenMax=Xn.TweenLite=kt;Xn.TimelineLite=Xn.TimelineMax=En;Ct=new En({sortChildren:!1,defaults:co,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});Wn.stringFilter=zm;var is=[],xl={},av=[],_f=0,lv=0,Sc=function(e){return(xl[e]||av).map(function(t){return t()})},wu=function(){var e=Date.now(),t=[];e-_f>2&&(Sc("matchMediaInit"),is.forEach(function(n){var i=n.queries,s=n.conditions,o,a,l,c;for(a in i)o=di.matchMedia(i[a]).matches,o&&(l=1),o!==s[a]&&(s[a]=o,c=1);c&&(n.revert(),l&&t.push(n))}),Sc("matchMediaRevert"),t.forEach(function(n){return n.onMatch(n,function(i){return n.add(null,i)})}),_f=e,Sc("matchMedia"))},Jm=function(){function r(t,n){this.selector=n&&Tu(n),this.data=[],this._r=[],this.isReverted=!1,this.id=lv++,t&&this.add(t)}var e=r.prototype;return e.add=function(n,i,s){Ot(n)&&(s=i,i=n,n=Ot);var o=this,a=function(){var c=At,u=o.selector,h;return c&&c!==o&&c.data.push(o),s&&(o.selector=Tu(s)),At=o,h=i.apply(o,arguments),Ot(h)&&o._r.push(h),At=c,o.selector=u,o.isReverted=!1,h};return o.last=a,n===Ot?a(o,function(l){return o.add(null,l)}):n?o[n]=a:a},e.ignore=function(n){var i=At;At=null,n(this),At=i},e.getTweens=function(){var n=[];return this.data.forEach(function(i){return i instanceof r?n.push.apply(n,i.getTweens()):i instanceof kt&&!(i.parent&&i.parent.data==="nested")&&n.push(i)}),n},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(n,i){var s=this;if(n?function(){for(var a=s.getTweens(),l=s.data.length,c;l--;)c=s.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(u){return a.splice(a.indexOf(u),1)}));for(a.map(function(u){return{g:u._dur||u._delay||u._sat&&!u._sat.vars.immediateRender?u.globalTime(0):-1/0,t:u}}).sort(function(u,h){return h.g-u.g||-1/0}).forEach(function(u){return u.t.revert(n)}),l=s.data.length;l--;)c=s.data[l],c instanceof En?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof kt)&&c.revert&&c.revert(n);s._r.forEach(function(u){return u(n,s)}),s.isReverted=!0}():this.data.forEach(function(a){return a.kill&&a.kill()}),this.clear(),i)for(var o=is.length;o--;)is[o].id===this.id&&is.splice(o,1)},e.revert=function(n){this.kill(n||{})},r}(),cv=function(){function r(t){this.contexts=[],this.scope=t,At&&At.data.push(this)}var e=r.prototype;return e.add=function(n,i,s){wi(n)||(n={matches:n});var o=new Jm(0,s||this.scope),a=o.conditions={},l,c,u;At&&!o.selector&&(o.selector=At.selector),this.contexts.push(o),i=o.add("onMatch",i),o.queries=n;for(c in n)c==="all"?u=1:(l=di.matchMedia(n[c]),l&&(is.indexOf(o)<0&&is.push(o),(a[c]=l.matches)&&(u=1),l.addListener?l.addListener(wu):l.addEventListener("change",wu)));return u&&i(o,function(h){return o.add(null,h)}),this},e.revert=function(n){this.kill(n||{})},e.kill=function(n){this.contexts.forEach(function(i){return i.kill(n,!0)})},r}(),Ol={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];t.forEach(function(i){return Fm(i)})},timeline:function(e){return new En(e)},getTweensOf:function(e,t){return Ct.getTweensOf(e,t)},getProperty:function(e,t,n,i){Qt(e)&&(e=ni(e)[0]);var s=es(e||{}).get,o=n?Tm:Em;return n==="native"&&(n=""),e&&(t?o((kn[t]&&kn[t].get||s)(e,t,n,i)):function(a,l,c){return o((kn[a]&&kn[a].get||s)(e,a,l,c))})},quickSetter:function(e,t,n){if(e=ni(e),e.length>1){var i=e.map(function(u){return In.quickSetter(u,t,n)}),s=i.length;return function(u){for(var h=s;h--;)i[h](u)}}e=e[0]||{};var o=kn[t],a=es(e),l=a.harness&&(a.harness.aliases||{})[t]||t,c=o?function(u){var h=new o;Ks._pt=0,h.init(e,n?u+n:u,Ks,0,[e]),h.render(1,h),Ks._pt&&Ah(1,Ks)}:a.set(e,l);return o?c:function(u){return c(e,l,n?u+n:u,a,1)}},quickTo:function(e,t,n){var i,s=In.to(e,hs((i={},i[t]="+=0.1",i.paused=!0,i),n||{})),o=function(l,c,u){return s.resetTo(t,l,c,u)};return o.tween=s,o},isTweening:function(e){return Ct.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=ns(e.ease,co.ease)),ff(co,e||{})},config:function(e){return ff(Wn,e||{})},registerEffect:function(e){var t=e.name,n=e.effect,i=e.plugins,s=e.defaults,o=e.extendTimeline;(i||"").split(",").forEach(function(a){return a&&!kn[a]&&!Xn[a]&&ua(t+" effect requires "+a+" plugin.")}),_c[t]=function(a,l,c){return n(ni(a),ri(l||{},s),c)},o&&(En.prototype[t]=function(a,l,c){return this.add(_c[t](a,wi(l)?l:(c=l)&&{},this),c)})},registerEase:function(e,t){ut[e]=ns(t)},parseEase:function(e,t){return arguments.length?ns(e,t):ut},getById:function(e){return Ct.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var n=new En(e),i,s;for(n.smoothChildTiming=Rn(e.smoothChildTiming),Ct.remove(n),n._dp=0,n._time=n._tTime=Ct._time,i=Ct._first;i;)s=i._next,(t||!(!i._dur&&i instanceof kt&&i.vars.onComplete===i._targets[0]))&&gi(n,i,i._start-i._delay),i=s;return gi(Ct,n,0),n},context:function(e,t){return e?new Jm(e,t):At},matchMedia:function(e){return new cv(e)},matchMediaRefresh:function(){return is.forEach(function(e){var t=e.conditions,n,i;for(i in t)t[i]&&(t[i]=!1,n=1);n&&e.revert()})||wu()},addEventListener:function(e,t){var n=xl[e]||(xl[e]=[]);~n.indexOf(t)||n.push(t)},removeEventListener:function(e,t){var n=xl[e],i=n&&n.indexOf(t);i>=0&&n.splice(i,1)},utils:{wrap:H0,wrapYoyo:G0,distribute:Lm,random:Im,snap:Dm,normalize:z0,getUnit:un,clamp:U0,splitColor:Bm,toArray:ni,selector:Tu,mapRange:Nm,pipe:B0,unitize:k0,interpolate:V0,shuffle:Pm},install:vm,effects:_c,ticker:zn,updateRoot:En.updateRoot,plugins:kn,globalTimeline:Ct,core:{PropTween:Pn,globals:xm,Tween:kt,Timeline:En,Animation:pa,getCache:es,_removeLinkedListItem:tc,reverting:function(){return hn},context:function(e){return e&&At&&(At.data.push(e),e._ctx=At),At},suppressOverwrites:function(e){return ph=e}}};Cn("to,from,fromTo,delayedCall,set,killTweensOf",function(r){return Ol[r]=kt[r]});zn.add(En.updateRoot);Ks=Ol.to({},{duration:0});var uv=function(e,t){for(var n=e._pt;n&&n.p!==t&&n.op!==t&&n.fp!==t;)n=n._next;return n},hv=function(e,t){var n=e._targets,i,s,o;for(i in t)for(s=n.length;s--;)o=e._ptLookup[s][i],o&&(o=o.d)&&(o._pt&&(o=uv(o,i)),o&&o.modifier&&o.modifier(t[i],e,n[s],i))},Mc=function(e,t){return{name:e,rawVars:1,init:function(i,s,o){o._onInit=function(a){var l,c;if(Qt(s)&&(l={},Cn(s,function(u){return l[u]=1}),s=l),t){l={};for(c in s)l[c]=t(s[c]);s=l}hv(a,s)}}}},In=Ol.registerPlugin({name:"attr",init:function(e,t,n,i,s){var o,a,l;this.tween=n;for(o in t)l=e.getAttribute(o)||"",a=this.add(e,"setAttribute",(l||0)+"",t[o],i,s,0,0,o),a.op=o,a.b=l,this._props.push(o)},render:function(e,t){for(var n=t._pt;n;)hn?n.set(n.t,n.p,n.b,n):n.r(e,n.d),n=n._next}},{name:"endArray",init:function(e,t){for(var n=t.length;n--;)this.add(e,n,e[n]||0,t[n],0,0,0,0,0,1)}},Mc("roundProps",bu),Mc("modifiers"),Mc("snap",Dm))||Ol;kt.version=En.version=In.version="3.12.5";_m=1;gh()&&fo();ut.Power0;ut.Power1;ut.Power2;ut.Power3;ut.Power4;ut.Linear;ut.Quad;ut.Cubic;ut.Quart;ut.Quint;ut.Strong;ut.Elastic;ut.Back;ut.SteppedEase;ut.Bounce;ut.Sine;ut.Expo;ut.Circ;/*!
 * CSSPlugin 3.12.5
 * https://gsap.com
 *
 * Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var vf,fr,to,wh,jr,xf,Rh,fv=function(){return typeof window<"u"},$i={},kr=180/Math.PI,no=Math.PI/180,Ss=Math.atan2,yf=1e8,Ch=/([A-Z])/g,dv=/(left|right|width|margin|padding|x)/i,pv=/[\s,\(]\S/,yi={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Ru=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},mv=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},gv=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},_v=function(e,t){var n=t.s+t.c*e;t.set(t.t,t.p,~~(n+(n<0?-.5:.5))+t.u,t)},Qm=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},eg=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},vv=function(e,t,n){return e.style[t]=n},xv=function(e,t,n){return e.style.setProperty(t,n)},yv=function(e,t,n){return e._gsap[t]=n},Sv=function(e,t,n){return e._gsap.scaleX=e._gsap.scaleY=n},Mv=function(e,t,n,i,s){var o=e._gsap;o.scaleX=o.scaleY=n,o.renderTransform(s,o)},Ev=function(e,t,n,i,s){var o=e._gsap;o[t]=n,o.renderTransform(s,o)},Pt="transform",Ln=Pt+"Origin",Tv=function r(e,t){var n=this,i=this.target,s=i.style,o=i._gsap;if(e in $i&&s){if(this.tfm=this.tfm||{},e!=="transform")e=yi[e]||e,~e.indexOf(",")?e.split(",").forEach(function(a){return n.tfm[a]=Hi(i,a)}):this.tfm[e]=o.x?o[e]:Hi(i,e),e===Ln&&(this.tfm.zOrigin=o.zOrigin);else return yi.transform.split(",").forEach(function(a){return r.call(n,a,t)});if(this.props.indexOf(Pt)>=0)return;o.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(Ln,t,"")),e=Pt}(s||t)&&this.props.push(e,t,s[e])},tg=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},bv=function(){var e=this.props,t=this.target,n=t.style,i=t._gsap,s,o;for(s=0;s<e.length;s+=3)e[s+1]?t[e[s]]=e[s+2]:e[s+2]?n[e[s]]=e[s+2]:n.removeProperty(e[s].substr(0,2)==="--"?e[s]:e[s].replace(Ch,"-$1").toLowerCase());if(this.tfm){for(o in this.tfm)i[o]=this.tfm[o];i.svg&&(i.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),s=Rh(),(!s||!s.isStart)&&!n[Pt]&&(tg(n),i.zOrigin&&n[Ln]&&(n[Ln]+=" "+i.zOrigin+"px",i.zOrigin=0,i.renderTransform()),i.uncache=1)}},ng=function(e,t){var n={target:e,props:[],revert:bv,save:Tv};return e._gsap||In.core.getCache(e),t&&t.split(",").forEach(function(i){return n.save(i)}),n},ig,Cu=function(e,t){var n=fr.createElementNS?fr.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):fr.createElement(e);return n&&n.style?n:fr.createElement(e)},Ti=function r(e,t,n){var i=getComputedStyle(e);return i[t]||i.getPropertyValue(t.replace(Ch,"-$1").toLowerCase())||i.getPropertyValue(t)||!n&&r(e,po(t)||t,1)||""},Sf="O,Moz,ms,Ms,Webkit".split(","),po=function(e,t,n){var i=t||jr,s=i.style,o=5;if(e in s&&!n)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);o--&&!(Sf[o]+e in s););return o<0?null:(o===3?"ms":o>=0?Sf[o]:"")+e},Pu=function(){fv()&&window.document&&(vf=window,fr=vf.document,to=fr.documentElement,jr=Cu("div")||{style:{}},Cu("div"),Pt=po(Pt),Ln=Pt+"Origin",jr.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",ig=!!po("perspective"),Rh=In.core.reverting,wh=1)},Ec=function r(e){var t=Cu("svg",this.ownerSVGElement&&this.ownerSVGElement.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),n=this.parentNode,i=this.nextSibling,s=this.style.cssText,o;if(to.appendChild(t),t.appendChild(this),this.style.display="block",e)try{o=this.getBBox(),this._gsapBBox=this.getBBox,this.getBBox=r}catch{}else this._gsapBBox&&(o=this._gsapBBox());return n&&(i?n.insertBefore(this,i):n.appendChild(this)),to.removeChild(t),this.style.cssText=s,o},Mf=function(e,t){for(var n=t.length;n--;)if(e.hasAttribute(t[n]))return e.getAttribute(t[n])},rg=function(e){var t;try{t=e.getBBox()}catch{t=Ec.call(e,!0)}return t&&(t.width||t.height)||e.getBBox===Ec||(t=Ec.call(e,!0)),t&&!t.width&&!t.x&&!t.y?{x:+Mf(e,["x","cx","x1"])||0,y:+Mf(e,["y","cy","y1"])||0,width:0,height:0}:t},sg=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&rg(e))},fs=function(e,t){if(t){var n=e.style,i;t in $i&&t!==Ln&&(t=Pt),n.removeProperty?(i=t.substr(0,2),(i==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),n.removeProperty(i==="--"?t:t.replace(Ch,"-$1").toLowerCase())):n.removeAttribute(t)}},dr=function(e,t,n,i,s,o){var a=new Pn(e._pt,t,n,0,1,o?eg:Qm);return e._pt=a,a.b=i,a.e=s,e._props.push(n),a},Ef={deg:1,rad:1,turn:1},Av={grid:1,flex:1},br=function r(e,t,n,i){var s=parseFloat(n)||0,o=(n+"").trim().substr((s+"").length)||"px",a=jr.style,l=dv.test(t),c=e.tagName.toLowerCase()==="svg",u=(c?"client":"offset")+(l?"Width":"Height"),h=100,f=i==="px",d=i==="%",g,_,p,m;if(i===o||!s||Ef[i]||Ef[o])return s;if(o!=="px"&&!f&&(s=r(e,t,n,"px")),m=e.getCTM&&sg(e),(d||o==="%")&&($i[t]||~t.indexOf("adius")))return g=m?e.getBBox()[l?"width":"height"]:e[u],Nt(d?s/g*h:s/100*g);if(a[l?"width":"height"]=h+(f?o:i),_=~t.indexOf("adius")||i==="em"&&e.appendChild&&!c?e:e.parentNode,m&&(_=(e.ownerSVGElement||{}).parentNode),(!_||_===fr||!_.appendChild)&&(_=fr.body),p=_._gsap,p&&d&&p.width&&l&&p.time===zn.time&&!p.uncache)return Nt(s/p.width*h);if(d&&(t==="height"||t==="width")){var S=e.style[t];e.style[t]=h+i,g=e[u],S?e.style[t]=S:fs(e,t)}else(d||o==="%")&&!Av[Ti(_,"display")]&&(a.position=Ti(e,"position")),_===e&&(a.position="static"),_.appendChild(jr),g=jr[u],_.removeChild(jr),a.position="absolute";return l&&d&&(p=es(_),p.time=zn.time,p.width=_[u]),Nt(f?g*s/h:g&&s?h/g*s:0)},Hi=function(e,t,n,i){var s;return wh||Pu(),t in yi&&t!=="transform"&&(t=yi[t],~t.indexOf(",")&&(t=t.split(",")[0])),$i[t]&&t!=="transform"?(s=ga(e,i),s=t!=="transformOrigin"?s[t]:s.svg?s.origin:Ul(Ti(e,Ln))+" "+s.zOrigin+"px"):(s=e.style[t],(!s||s==="auto"||i||~(s+"").indexOf("calc("))&&(s=Nl[t]&&Nl[t](e,t,n)||Ti(e,t)||Sm(e,t)||(t==="opacity"?1:0))),n&&!~(s+"").trim().indexOf(" ")?br(e,t,s,n)+n:s},wv=function(e,t,n,i){if(!n||n==="none"){var s=po(t,e,1),o=s&&Ti(e,s,1);o&&o!==n?(t=s,n=o):t==="borderColor"&&(n=Ti(e,"borderTopColor"))}var a=new Pn(this._pt,e.style,t,0,1,Km),l=0,c=0,u,h,f,d,g,_,p,m,S,y,x,T;if(a.b=n,a.e=i,n+="",i+="",i==="auto"&&(_=e.style[t],e.style[t]=i,i=Ti(e,t)||i,_?e.style[t]=_:fs(e,t)),u=[n,i],zm(u),n=u[0],i=u[1],f=n.match($s)||[],T=i.match($s)||[],T.length){for(;h=$s.exec(i);)p=h[0],S=i.substring(l,h.index),g?g=(g+1)%5:(S.substr(-5)==="rgba("||S.substr(-5)==="hsla(")&&(g=1),p!==(_=f[c++]||"")&&(d=parseFloat(_)||0,x=_.substr((d+"").length),p.charAt(1)==="="&&(p=eo(d,p)+x),m=parseFloat(p),y=p.substr((m+"").length),l=$s.lastIndex-y.length,y||(y=y||Wn.units[t]||x,l===i.length&&(i+=y,a.e+=y)),x!==y&&(d=br(e,t,_,y)||0),a._pt={_next:a._pt,p:S||c===1?S:",",s:d,c:m-d,m:g&&g<4||t==="zIndex"?Math.round:0});a.c=l<i.length?i.substring(l,i.length):""}else a.r=t==="display"&&i==="none"?eg:Qm;return mm.test(i)&&(a.e=0),this._pt=a,a},Tf={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},Rv=function(e){var t=e.split(" "),n=t[0],i=t[1]||"50%";return(n==="top"||n==="bottom"||i==="left"||i==="right")&&(e=n,n=i,i=e),t[0]=Tf[n]||n,t[1]=Tf[i]||i,t.join(" ")},Cv=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var n=t.t,i=n.style,s=t.u,o=n._gsap,a,l,c;if(s==="all"||s===!0)i.cssText="",l=1;else for(s=s.split(","),c=s.length;--c>-1;)a=s[c],$i[a]&&(l=1,a=a==="transformOrigin"?Ln:Pt),fs(n,a);l&&(fs(n,Pt),o&&(o.svg&&n.removeAttribute("transform"),ga(n,1),o.uncache=1,tg(i)))}},Nl={clearProps:function(e,t,n,i,s){if(s.data!=="isFromStart"){var o=e._pt=new Pn(e._pt,t,n,0,0,Cv);return o.u=i,o.pr=-10,o.tween=s,e._props.push(n),1}}},ma=[1,0,0,1,0,0],og={},ag=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},bf=function(e){var t=Ti(e,Pt);return ag(t)?ma:t.substr(7).match(pm).map(Nt)},Ph=function(e,t){var n=e._gsap||es(e),i=e.style,s=bf(e),o,a,l,c;return n.svg&&e.getAttribute("transform")?(l=e.transform.baseVal.consolidate().matrix,s=[l.a,l.b,l.c,l.d,l.e,l.f],s.join(",")==="1,0,0,1,0,0"?ma:s):(s===ma&&!e.offsetParent&&e!==to&&!n.svg&&(l=i.display,i.display="block",o=e.parentNode,(!o||!e.offsetParent)&&(c=1,a=e.nextElementSibling,to.appendChild(e)),s=bf(e),l?i.display=l:fs(e,"display"),c&&(a?o.insertBefore(e,a):o?o.appendChild(e):to.removeChild(e))),t&&s.length>6?[s[0],s[1],s[4],s[5],s[12],s[13]]:s)},Lu=function(e,t,n,i,s,o){var a=e._gsap,l=s||Ph(e,!0),c=a.xOrigin||0,u=a.yOrigin||0,h=a.xOffset||0,f=a.yOffset||0,d=l[0],g=l[1],_=l[2],p=l[3],m=l[4],S=l[5],y=t.split(" "),x=parseFloat(y[0])||0,T=parseFloat(y[1])||0,b,M,I,O;n?l!==ma&&(M=d*p-g*_)&&(I=x*(p/M)+T*(-_/M)+(_*S-p*m)/M,O=x*(-g/M)+T*(d/M)-(d*S-g*m)/M,x=I,T=O):(b=rg(e),x=b.x+(~y[0].indexOf("%")?x/100*b.width:x),T=b.y+(~(y[1]||y[0]).indexOf("%")?T/100*b.height:T)),i||i!==!1&&a.smooth?(m=x-c,S=T-u,a.xOffset=h+(m*d+S*_)-m,a.yOffset=f+(m*g+S*p)-S):a.xOffset=a.yOffset=0,a.xOrigin=x,a.yOrigin=T,a.smooth=!!i,a.origin=t,a.originIsAbsolute=!!n,e.style[Ln]="0px 0px",o&&(dr(o,a,"xOrigin",c,x),dr(o,a,"yOrigin",u,T),dr(o,a,"xOffset",h,a.xOffset),dr(o,a,"yOffset",f,a.yOffset)),e.setAttribute("data-svg-origin",x+" "+T)},ga=function(e,t){var n=e._gsap||new Wm(e);if("x"in n&&!t&&!n.uncache)return n;var i=e.style,s=n.scaleX<0,o="px",a="deg",l=getComputedStyle(e),c=Ti(e,Ln)||"0",u,h,f,d,g,_,p,m,S,y,x,T,b,M,I,O,v,R,N,$,D,H,B,Y,j,K,C,Z,le,Oe,X,J;return u=h=f=_=p=m=S=y=x=0,d=g=1,n.svg=!!(e.getCTM&&sg(e)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(i[Pt]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[Pt]!=="none"?l[Pt]:"")),i.scale=i.rotate=i.translate="none"),M=Ph(e,n.svg),n.svg&&(n.uncache?(j=e.getBBox(),c=n.xOrigin-j.x+"px "+(n.yOrigin-j.y)+"px",Y=""):Y=!t&&e.getAttribute("data-svg-origin"),Lu(e,Y||c,!!Y||n.originIsAbsolute,n.smooth!==!1,M)),T=n.xOrigin||0,b=n.yOrigin||0,M!==ma&&(R=M[0],N=M[1],$=M[2],D=M[3],u=H=M[4],h=B=M[5],M.length===6?(d=Math.sqrt(R*R+N*N),g=Math.sqrt(D*D+$*$),_=R||N?Ss(N,R)*kr:0,S=$||D?Ss($,D)*kr+_:0,S&&(g*=Math.abs(Math.cos(S*no))),n.svg&&(u-=T-(T*R+b*$),h-=b-(T*N+b*D))):(J=M[6],Oe=M[7],C=M[8],Z=M[9],le=M[10],X=M[11],u=M[12],h=M[13],f=M[14],I=Ss(J,le),p=I*kr,I&&(O=Math.cos(-I),v=Math.sin(-I),Y=H*O+C*v,j=B*O+Z*v,K=J*O+le*v,C=H*-v+C*O,Z=B*-v+Z*O,le=J*-v+le*O,X=Oe*-v+X*O,H=Y,B=j,J=K),I=Ss(-$,le),m=I*kr,I&&(O=Math.cos(-I),v=Math.sin(-I),Y=R*O-C*v,j=N*O-Z*v,K=$*O-le*v,X=D*v+X*O,R=Y,N=j,$=K),I=Ss(N,R),_=I*kr,I&&(O=Math.cos(I),v=Math.sin(I),Y=R*O+N*v,j=H*O+B*v,N=N*O-R*v,B=B*O-H*v,R=Y,H=j),p&&Math.abs(p)+Math.abs(_)>359.9&&(p=_=0,m=180-m),d=Nt(Math.sqrt(R*R+N*N+$*$)),g=Nt(Math.sqrt(B*B+J*J)),I=Ss(H,B),S=Math.abs(I)>2e-4?I*kr:0,x=X?1/(X<0?-X:X):0),n.svg&&(Y=e.getAttribute("transform"),n.forceCSS=e.setAttribute("transform","")||!ag(Ti(e,Pt)),Y&&e.setAttribute("transform",Y))),Math.abs(S)>90&&Math.abs(S)<270&&(s?(d*=-1,S+=_<=0?180:-180,_+=_<=0?180:-180):(g*=-1,S+=S<=0?180:-180)),t=t||n.uncache,n.x=u-((n.xPercent=u&&(!t&&n.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-u)?-50:0)))?e.offsetWidth*n.xPercent/100:0)+o,n.y=h-((n.yPercent=h&&(!t&&n.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-h)?-50:0)))?e.offsetHeight*n.yPercent/100:0)+o,n.z=f+o,n.scaleX=Nt(d),n.scaleY=Nt(g),n.rotation=Nt(_)+a,n.rotationX=Nt(p)+a,n.rotationY=Nt(m)+a,n.skewX=S+a,n.skewY=y+a,n.transformPerspective=x+o,(n.zOrigin=parseFloat(c.split(" ")[2])||!t&&n.zOrigin||0)&&(i[Ln]=Ul(c)),n.xOffset=n.yOffset=0,n.force3D=Wn.force3D,n.renderTransform=n.svg?Lv:ig?lg:Pv,n.uncache=0,n},Ul=function(e){return(e=e.split(" "))[0]+" "+e[1]},Tc=function(e,t,n){var i=un(t);return Nt(parseFloat(t)+parseFloat(br(e,"x",n+"px",i)))+i},Pv=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,lg(e,t)},Lr="0deg",Po="0px",Dr=") ",lg=function(e,t){var n=t||this,i=n.xPercent,s=n.yPercent,o=n.x,a=n.y,l=n.z,c=n.rotation,u=n.rotationY,h=n.rotationX,f=n.skewX,d=n.skewY,g=n.scaleX,_=n.scaleY,p=n.transformPerspective,m=n.force3D,S=n.target,y=n.zOrigin,x="",T=m==="auto"&&e&&e!==1||m===!0;if(y&&(h!==Lr||u!==Lr)){var b=parseFloat(u)*no,M=Math.sin(b),I=Math.cos(b),O;b=parseFloat(h)*no,O=Math.cos(b),o=Tc(S,o,M*O*-y),a=Tc(S,a,-Math.sin(b)*-y),l=Tc(S,l,I*O*-y+y)}p!==Po&&(x+="perspective("+p+Dr),(i||s)&&(x+="translate("+i+"%, "+s+"%) "),(T||o!==Po||a!==Po||l!==Po)&&(x+=l!==Po||T?"translate3d("+o+", "+a+", "+l+") ":"translate("+o+", "+a+Dr),c!==Lr&&(x+="rotate("+c+Dr),u!==Lr&&(x+="rotateY("+u+Dr),h!==Lr&&(x+="rotateX("+h+Dr),(f!==Lr||d!==Lr)&&(x+="skew("+f+", "+d+Dr),(g!==1||_!==1)&&(x+="scale("+g+", "+_+Dr),S.style[Pt]=x||"translate(0, 0)"},Lv=function(e,t){var n=t||this,i=n.xPercent,s=n.yPercent,o=n.x,a=n.y,l=n.rotation,c=n.skewX,u=n.skewY,h=n.scaleX,f=n.scaleY,d=n.target,g=n.xOrigin,_=n.yOrigin,p=n.xOffset,m=n.yOffset,S=n.forceCSS,y=parseFloat(o),x=parseFloat(a),T,b,M,I,O;l=parseFloat(l),c=parseFloat(c),u=parseFloat(u),u&&(u=parseFloat(u),c+=u,l+=u),l||c?(l*=no,c*=no,T=Math.cos(l)*h,b=Math.sin(l)*h,M=Math.sin(l-c)*-f,I=Math.cos(l-c)*f,c&&(u*=no,O=Math.tan(c-u),O=Math.sqrt(1+O*O),M*=O,I*=O,u&&(O=Math.tan(u),O=Math.sqrt(1+O*O),T*=O,b*=O)),T=Nt(T),b=Nt(b),M=Nt(M),I=Nt(I)):(T=h,I=f,b=M=0),(y&&!~(o+"").indexOf("px")||x&&!~(a+"").indexOf("px"))&&(y=br(d,"x",o,"px"),x=br(d,"y",a,"px")),(g||_||p||m)&&(y=Nt(y+g-(g*T+_*M)+p),x=Nt(x+_-(g*b+_*I)+m)),(i||s)&&(O=d.getBBox(),y=Nt(y+i/100*O.width),x=Nt(x+s/100*O.height)),O="matrix("+T+","+b+","+M+","+I+","+y+","+x+")",d.setAttribute("transform",O),S&&(d.style[Pt]=O)},Dv=function(e,t,n,i,s){var o=360,a=Qt(s),l=parseFloat(s)*(a&&~s.indexOf("rad")?kr:1),c=l-i,u=i+c+"deg",h,f;return a&&(h=s.split("_")[1],h==="short"&&(c%=o,c!==c%(o/2)&&(c+=c<0?o:-o)),h==="cw"&&c<0?c=(c+o*yf)%o-~~(c/o)*o:h==="ccw"&&c>0&&(c=(c-o*yf)%o-~~(c/o)*o)),e._pt=f=new Pn(e._pt,t,n,i,c,mv),f.e=u,f.u="deg",e._props.push(n),f},Af=function(e,t){for(var n in t)e[n]=t[n];return e},Iv=function(e,t,n){var i=Af({},n._gsap),s="perspective,force3D,transformOrigin,svgOrigin",o=n.style,a,l,c,u,h,f,d,g;i.svg?(c=n.getAttribute("transform"),n.setAttribute("transform",""),o[Pt]=t,a=ga(n,1),fs(n,Pt),n.setAttribute("transform",c)):(c=getComputedStyle(n)[Pt],o[Pt]=t,a=ga(n,1),o[Pt]=c);for(l in $i)c=i[l],u=a[l],c!==u&&s.indexOf(l)<0&&(d=un(c),g=un(u),h=d!==g?br(n,l,c,g):parseFloat(c),f=parseFloat(u),e._pt=new Pn(e._pt,a,l,h,f-h,Ru),e._pt.u=g||0,e._props.push(l));Af(a,i)};Cn("padding,margin,Width,Radius",function(r,e){var t="Top",n="Right",i="Bottom",s="Left",o=(e<3?[t,n,i,s]:[t+s,t+n,i+n,i+s]).map(function(a){return e<2?r+a:"border"+a+r});Nl[e>1?"border"+r:r]=function(a,l,c,u,h){var f,d;if(arguments.length<4)return f=o.map(function(g){return Hi(a,g,c)}),d=f.join(" "),d.split(f[0]).length===5?f[0]:d;f=(u+"").split(" "),d={},o.forEach(function(g,_){return d[g]=f[_]=f[_]||f[(_-1)/2|0]}),a.init(l,d,h)}});var cg={name:"css",register:Pu,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,n,i,s){var o=this._props,a=e.style,l=n.vars.startAt,c,u,h,f,d,g,_,p,m,S,y,x,T,b,M,I;wh||Pu(),this.styles=this.styles||ng(e),I=this.styles.props,this.tween=n;for(_ in t)if(_!=="autoRound"&&(u=t[_],!(kn[_]&&Xm(_,t,n,i,e,s)))){if(d=typeof u,g=Nl[_],d==="function"&&(u=u.call(n,i,e,s),d=typeof u),d==="string"&&~u.indexOf("random(")&&(u=fa(u)),g)g(this,e,_,u,n)&&(M=1);else if(_.substr(0,2)==="--")c=(getComputedStyle(e).getPropertyValue(_)+"").trim(),u+="",xr.lastIndex=0,xr.test(c)||(p=un(c),m=un(u)),m?p!==m&&(c=br(e,_,c,m)+m):p&&(u+=p),this.add(a,"setProperty",c,u,i,s,0,0,_),o.push(_),I.push(_,0,a[_]);else if(d!=="undefined"){if(l&&_ in l?(c=typeof l[_]=="function"?l[_].call(n,i,e,s):l[_],Qt(c)&&~c.indexOf("random(")&&(c=fa(c)),un(c+"")||c==="auto"||(c+=Wn.units[_]||un(Hi(e,_))||""),(c+"").charAt(1)==="="&&(c=Hi(e,_))):c=Hi(e,_),f=parseFloat(c),S=d==="string"&&u.charAt(1)==="="&&u.substr(0,2),S&&(u=u.substr(2)),h=parseFloat(u),_ in yi&&(_==="autoAlpha"&&(f===1&&Hi(e,"visibility")==="hidden"&&h&&(f=0),I.push("visibility",0,a.visibility),dr(this,a,"visibility",f?"inherit":"hidden",h?"inherit":"hidden",!h)),_!=="scale"&&_!=="transform"&&(_=yi[_],~_.indexOf(",")&&(_=_.split(",")[0]))),y=_ in $i,y){if(this.styles.save(_),x||(T=e._gsap,T.renderTransform&&!t.parseTransform||ga(e,t.parseTransform),b=t.smoothOrigin!==!1&&T.smooth,x=this._pt=new Pn(this._pt,a,Pt,0,1,T.renderTransform,T,0,-1),x.dep=1),_==="scale")this._pt=new Pn(this._pt,T,"scaleY",T.scaleY,(S?eo(T.scaleY,S+h):h)-T.scaleY||0,Ru),this._pt.u=0,o.push("scaleY",_),_+="X";else if(_==="transformOrigin"){I.push(Ln,0,a[Ln]),u=Rv(u),T.svg?Lu(e,u,0,b,0,this):(m=parseFloat(u.split(" ")[2])||0,m!==T.zOrigin&&dr(this,T,"zOrigin",T.zOrigin,m),dr(this,a,_,Ul(c),Ul(u)));continue}else if(_==="svgOrigin"){Lu(e,u,1,b,0,this);continue}else if(_ in og){Dv(this,T,_,f,S?eo(f,S+u):u);continue}else if(_==="smoothOrigin"){dr(this,T,"smooth",T.smooth,u);continue}else if(_==="force3D"){T[_]=u;continue}else if(_==="transform"){Iv(this,u,e);continue}}else _ in a||(_=po(_)||_);if(y||(h||h===0)&&(f||f===0)&&!pv.test(u)&&_ in a)p=(c+"").substr((f+"").length),h||(h=0),m=un(u)||(_ in Wn.units?Wn.units[_]:p),p!==m&&(f=br(e,_,c,m)),this._pt=new Pn(this._pt,y?T:a,_,f,(S?eo(f,S+h):h)-f,!y&&(m==="px"||_==="zIndex")&&t.autoRound!==!1?_v:Ru),this._pt.u=m||0,p!==m&&m!=="%"&&(this._pt.b=c,this._pt.r=gv);else if(_ in a)wv.call(this,e,_,c,S?S+u:u);else if(_ in e)this.add(e,_,c||e[_],S?S+u:u,i,s);else if(_!=="parseTransform"){vh(_,u);continue}y||(_ in a?I.push(_,0,a[_]):I.push(_,1,c||e[_])),o.push(_)}}M&&Zm(this)},render:function(e,t){if(t.tween._time||!Rh())for(var n=t._pt;n;)n.r(e,n.d),n=n._next;else t.styles.revert()},get:Hi,aliases:yi,getSetter:function(e,t,n){var i=yi[t];return i&&i.indexOf(",")<0&&(t=i),t in $i&&t!==Ln&&(e._gsap.x||Hi(e,"x"))?n&&xf===n?t==="scale"?Sv:yv:(xf=n||{})&&(t==="scale"?Mv:Ev):e.style&&!mh(e.style[t])?vv:~t.indexOf("-")?xv:bh(e,t)},core:{_removeProperty:fs,_getMatrix:Ph}};In.utils.checkPrefix=po;In.core.getStyleSaver=ng;(function(r,e,t,n){var i=Cn(r+","+e+","+t,function(s){$i[s]=1});Cn(e,function(s){Wn.units[s]="deg",og[s]=1}),yi[i[13]]=r+","+e,Cn(n,function(s){var o=s.split(":");yi[o[1]]=i[o[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");Cn("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(r){Wn.units[r]="px"});In.registerPlugin(cg);var Zt=In.registerPlugin(cg)||In;Zt.core.Tween;function wf(r,e){for(var t=0;t<e.length;t++){var n=e[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(r,n.key,n)}}function Ov(r,e,t){return e&&wf(r.prototype,e),t&&wf(r,t),r}/*!
 * Observer 3.12.5
 * https://gsap.com
 *
 * @license Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var nn,yl,Hn,pr,mr,io,ug,zr,Zo,hg,Vi,li,fg,dg=function(){return nn||typeof window<"u"&&(nn=window.gsap)&&nn.registerPlugin&&nn},pg=1,Zs=[],ot=[],bi=[],Jo=Date.now,Du=function(e,t){return t},Nv=function(){var e=Zo.core,t=e.bridge||{},n=e._scrollers,i=e._proxies;n.push.apply(n,ot),i.push.apply(i,bi),ot=n,bi=i,Du=function(o,a){return t[o](a)}},yr=function(e,t){return~bi.indexOf(e)&&bi[bi.indexOf(e)+1][t]},Qo=function(e){return!!~hg.indexOf(e)},gn=function(e,t,n,i,s){return e.addEventListener(t,n,{passive:i!==!1,capture:!!s})},pn=function(e,t,n,i){return e.removeEventListener(t,n,!!i)},Pa="scrollLeft",La="scrollTop",Iu=function(){return Vi&&Vi.isPressed||ot.cache++},Fl=function(e,t){var n=function i(s){if(s||s===0){pg&&(Hn.history.scrollRestoration="manual");var o=Vi&&Vi.isPressed;s=i.v=Math.round(s)||(Vi&&Vi.iOS?1:0),e(s),i.cacheID=ot.cache,o&&Du("ss",s)}else(t||ot.cache!==i.cacheID||Du("ref"))&&(i.cacheID=ot.cache,i.v=e());return i.v+i.offset};return n.offset=0,e&&n},Tn={s:Pa,p:"left",p2:"Left",os:"right",os2:"Right",d:"width",d2:"Width",a:"x",sc:Fl(function(r){return arguments.length?Hn.scrollTo(r,Vt.sc()):Hn.pageXOffset||pr[Pa]||mr[Pa]||io[Pa]||0})},Vt={s:La,p:"top",p2:"Top",os:"bottom",os2:"Bottom",d:"height",d2:"Height",a:"y",op:Tn,sc:Fl(function(r){return arguments.length?Hn.scrollTo(Tn.sc(),r):Hn.pageYOffset||pr[La]||mr[La]||io[La]||0})},wn=function(e,t){return(t&&t._ctx&&t._ctx.selector||nn.utils.toArray)(e)[0]||(typeof e=="string"&&nn.config().nullTargetWarn!==!1?console.warn("Element not found:",e):null)},Ar=function(e,t){var n=t.s,i=t.sc;Qo(e)&&(e=pr.scrollingElement||mr);var s=ot.indexOf(e),o=i===Vt.sc?1:2;!~s&&(s=ot.push(e)-1),ot[s+o]||gn(e,"scroll",Iu);var a=ot[s+o],l=a||(ot[s+o]=Fl(yr(e,n),!0)||(Qo(e)?i:Fl(function(c){return arguments.length?e[n]=c:e[n]})));return l.target=e,a||(l.smooth=nn.getProperty(e,"scrollBehavior")==="smooth"),l},Ou=function(e,t,n){var i=e,s=e,o=Jo(),a=o,l=t||50,c=Math.max(500,l*3),u=function(g,_){var p=Jo();_||p-o>l?(s=i,i=g,a=o,o=p):n?i+=g:i=s+(g-s)/(p-a)*(o-a)},h=function(){s=i=n?0:i,a=o=0},f=function(g){var _=a,p=s,m=Jo();return(g||g===0)&&g!==i&&u(g),o===a||m-a>c?0:(i+(n?p:-p))/((n?m:o)-_)*1e3};return{update:u,reset:h,getVelocity:f}},Lo=function(e,t){return t&&!e._gsapAllow&&e.preventDefault(),e.changedTouches?e.changedTouches[0]:e},Rf=function(e){var t=Math.max.apply(Math,e),n=Math.min.apply(Math,e);return Math.abs(t)>=Math.abs(n)?t:n},mg=function(){Zo=nn.core.globals().ScrollTrigger,Zo&&Zo.core&&Nv()},gg=function(e){return nn=e||dg(),!yl&&nn&&typeof document<"u"&&document.body&&(Hn=window,pr=document,mr=pr.documentElement,io=pr.body,hg=[Hn,pr,mr,io],nn.utils.clamp,fg=nn.core.context||function(){},zr="onpointerenter"in io?"pointer":"mouse",ug=Ut.isTouch=Hn.matchMedia&&Hn.matchMedia("(hover: none), (pointer: coarse)").matches?1:"ontouchstart"in Hn||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0?2:0,li=Ut.eventTypes=("ontouchstart"in mr?"touchstart,touchmove,touchcancel,touchend":"onpointerdown"in mr?"pointerdown,pointermove,pointercancel,pointerup":"mousedown,mousemove,mouseup,mouseup").split(","),setTimeout(function(){return pg=0},500),mg(),yl=1),yl};Tn.op=Vt;ot.cache=0;var Ut=function(){function r(t){this.init(t)}var e=r.prototype;return e.init=function(n){yl||gg(nn)||console.warn("Please gsap.registerPlugin(Observer)"),Zo||mg();var i=n.tolerance,s=n.dragMinimum,o=n.type,a=n.target,l=n.lineHeight,c=n.debounce,u=n.preventDefault,h=n.onStop,f=n.onStopDelay,d=n.ignore,g=n.wheelSpeed,_=n.event,p=n.onDragStart,m=n.onDragEnd,S=n.onDrag,y=n.onPress,x=n.onRelease,T=n.onRight,b=n.onLeft,M=n.onUp,I=n.onDown,O=n.onChangeX,v=n.onChangeY,R=n.onChange,N=n.onToggleX,$=n.onToggleY,D=n.onHover,H=n.onHoverEnd,B=n.onMove,Y=n.ignoreCheck,j=n.isNormalizer,K=n.onGestureStart,C=n.onGestureEnd,Z=n.onWheel,le=n.onEnable,Oe=n.onDisable,X=n.onClick,J=n.scrollSpeed,fe=n.capture,ve=n.allowClicks,Ee=n.lockAxis,me=n.onLockAxis;this.target=a=wn(a)||mr,this.vars=n,d&&(d=nn.utils.toArray(d)),i=i||1e-9,s=s||0,g=g||1,J=J||1,o=o||"wheel,touch,pointer",c=c!==!1,l||(l=parseFloat(Hn.getComputedStyle(io).lineHeight)||22);var Ke,De,k,Ve,ge,Le,xe,V=this,Be=0,w=0,E=n.passive||!u,z=Ar(a,Tn),re=Ar(a,Vt),ne=z(),se=re(),pe=~o.indexOf("touch")&&!~o.indexOf("pointer")&&li[0]==="pointerdown",he=Qo(a),ce=a.ownerDocument||pr,Ae=[0,0,0],ke=[0,0,0],te=0,st=function(){return te=Jo()},Ie=function(Me,be){return(V.event=Me)&&d&&~d.indexOf(Me.target)||be&&pe&&Me.pointerType!=="touch"||Y&&Y(Me,be)},We=function(){V._vx.reset(),V._vy.reset(),De.pause(),h&&h(V)},we=function(){var Me=V.deltaX=Rf(Ae),be=V.deltaY=Rf(ke),ae=Math.abs(Me)>=i,Fe=Math.abs(be)>=i;R&&(ae||Fe)&&R(V,Me,be,Ae,ke),ae&&(T&&V.deltaX>0&&T(V),b&&V.deltaX<0&&b(V),O&&O(V),N&&V.deltaX<0!=Be<0&&N(V),Be=V.deltaX,Ae[0]=Ae[1]=Ae[2]=0),Fe&&(I&&V.deltaY>0&&I(V),M&&V.deltaY<0&&M(V),v&&v(V),$&&V.deltaY<0!=w<0&&$(V),w=V.deltaY,ke[0]=ke[1]=ke[2]=0),(Ve||k)&&(B&&B(V),k&&(S(V),k=!1),Ve=!1),Le&&!(Le=!1)&&me&&me(V),ge&&(Z(V),ge=!1),Ke=0},_e=function(Me,be,ae){Ae[ae]+=Me,ke[ae]+=be,V._vx.update(Me),V._vy.update(be),c?Ke||(Ke=requestAnimationFrame(we)):we()},Xe=function(Me,be){Ee&&!xe&&(V.axis=xe=Math.abs(Me)>Math.abs(be)?"x":"y",Le=!0),xe!=="y"&&(Ae[2]+=Me,V._vx.update(Me,!0)),xe!=="x"&&(ke[2]+=be,V._vy.update(be,!0)),c?Ke||(Ke=requestAnimationFrame(we)):we()},L=function(Me){if(!Ie(Me,1)){Me=Lo(Me,u);var be=Me.clientX,ae=Me.clientY,Fe=be-V.x,ze=ae-V.y,Ye=V.isDragging;V.x=be,V.y=ae,(Ye||Math.abs(V.startX-be)>=s||Math.abs(V.startY-ae)>=s)&&(S&&(k=!0),Ye||(V.isDragging=!0),Xe(Fe,ze),Ye||p&&p(V))}},oe=V.onPress=function(ye){Ie(ye,1)||ye&&ye.button||(V.axis=xe=null,De.pause(),V.isPressed=!0,ye=Lo(ye),Be=w=0,V.startX=V.x=ye.clientX,V.startY=V.y=ye.clientY,V._vx.reset(),V._vy.reset(),gn(j?a:ce,li[1],L,E,!0),V.deltaX=V.deltaY=0,y&&y(V))},Q=V.onRelease=function(ye){if(!Ie(ye,1)){pn(j?a:ce,li[1],L,!0);var Me=!isNaN(V.y-V.startY),be=V.isDragging,ae=be&&(Math.abs(V.x-V.startX)>3||Math.abs(V.y-V.startY)>3),Fe=Lo(ye);!ae&&Me&&(V._vx.reset(),V._vy.reset(),u&&ve&&nn.delayedCall(.08,function(){if(Jo()-te>300&&!ye.defaultPrevented){if(ye.target.click)ye.target.click();else if(ce.createEvent){var ze=ce.createEvent("MouseEvents");ze.initMouseEvent("click",!0,!0,Hn,1,Fe.screenX,Fe.screenY,Fe.clientX,Fe.clientY,!1,!1,!1,!1,0,null),ye.target.dispatchEvent(ze)}}})),V.isDragging=V.isGesturing=V.isPressed=!1,h&&be&&!j&&De.restart(!0),m&&be&&m(V),x&&x(V,ae)}},Ce=function(Me){return Me.touches&&Me.touches.length>1&&(V.isGesturing=!0)&&K(Me,V.isDragging)},P=function(){return(V.isGesturing=!1)||C(V)},ie=function(Me){if(!Ie(Me)){var be=z(),ae=re();_e((be-ne)*J,(ae-se)*J,1),ne=be,se=ae,h&&De.restart(!0)}},ee=function(Me){if(!Ie(Me)){Me=Lo(Me,u),Z&&(ge=!0);var be=(Me.deltaMode===1?l:Me.deltaMode===2?Hn.innerHeight:1)*g;_e(Me.deltaX*be,Me.deltaY*be,0),h&&!j&&De.restart(!0)}},Se=function(Me){if(!Ie(Me)){var be=Me.clientX,ae=Me.clientY,Fe=be-V.x,ze=ae-V.y;V.x=be,V.y=ae,Ve=!0,h&&De.restart(!0),(Fe||ze)&&Xe(Fe,ze)}},Ne=function(Me){V.event=Me,D(V)},Je=function(Me){V.event=Me,H(V)},Qe=function(Me){return Ie(Me)||Lo(Me,u)&&X(V)};De=V._dc=nn.delayedCall(f||.25,We).pause(),V.deltaX=V.deltaY=0,V._vx=Ou(0,50,!0),V._vy=Ou(0,50,!0),V.scrollX=z,V.scrollY=re,V.isDragging=V.isGesturing=V.isPressed=!1,fg(this),V.enable=function(ye){return V.isEnabled||(gn(he?ce:a,"scroll",Iu),o.indexOf("scroll")>=0&&gn(he?ce:a,"scroll",ie,E,fe),o.indexOf("wheel")>=0&&gn(a,"wheel",ee,E,fe),(o.indexOf("touch")>=0&&ug||o.indexOf("pointer")>=0)&&(gn(a,li[0],oe,E,fe),gn(ce,li[2],Q),gn(ce,li[3],Q),ve&&gn(a,"click",st,!0,!0),X&&gn(a,"click",Qe),K&&gn(ce,"gesturestart",Ce),C&&gn(ce,"gestureend",P),D&&gn(a,zr+"enter",Ne),H&&gn(a,zr+"leave",Je),B&&gn(a,zr+"move",Se)),V.isEnabled=!0,ye&&ye.type&&oe(ye),le&&le(V)),V},V.disable=function(){V.isEnabled&&(Zs.filter(function(ye){return ye!==V&&Qo(ye.target)}).length||pn(he?ce:a,"scroll",Iu),V.isPressed&&(V._vx.reset(),V._vy.reset(),pn(j?a:ce,li[1],L,!0)),pn(he?ce:a,"scroll",ie,fe),pn(a,"wheel",ee,fe),pn(a,li[0],oe,fe),pn(ce,li[2],Q),pn(ce,li[3],Q),pn(a,"click",st,!0),pn(a,"click",Qe),pn(ce,"gesturestart",Ce),pn(ce,"gestureend",P),pn(a,zr+"enter",Ne),pn(a,zr+"leave",Je),pn(a,zr+"move",Se),V.isEnabled=V.isPressed=V.isDragging=!1,Oe&&Oe(V))},V.kill=V.revert=function(){V.disable();var ye=Zs.indexOf(V);ye>=0&&Zs.splice(ye,1),Vi===V&&(Vi=0)},Zs.push(V),j&&Qo(a)&&(Vi=V),V.enable(_)},Ov(r,[{key:"velocityX",get:function(){return this._vx.getVelocity()}},{key:"velocityY",get:function(){return this._vy.getVelocity()}}]),r}();Ut.version="3.12.5";Ut.create=function(r){return new Ut(r)};Ut.register=gg;Ut.getAll=function(){return Zs.slice()};Ut.getById=function(r){return Zs.filter(function(e){return e.vars.id===r})[0]};dg()&&nn.registerPlugin(Ut);/*!
 * ScrollTrigger 3.12.5
 * https://gsap.com
 *
 * @license Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var Te,Xs,ct,Rt,ci,Tt,_g,Bl,_a,ea,Vo,Da,an,rc,Nu,xn,Cf,Pf,qs,vg,bc,xg,vn,Uu,yg,Sg,or,Fu,Lh,ro,Dh,kl,Bu,Ac,Ia=1,ln=Date.now,wc=ln(),ii=0,Wo=0,Lf=function(e,t,n){var i=Bn(e)&&(e.substr(0,6)==="clamp("||e.indexOf("max")>-1);return n["_"+t+"Clamp"]=i,i?e.substr(6,e.length-7):e},Df=function(e,t){return t&&(!Bn(e)||e.substr(0,6)!=="clamp(")?"clamp("+e+")":e},Uv=function r(){return Wo&&requestAnimationFrame(r)},If=function(){return rc=1},Of=function(){return rc=0},pi=function(e){return e},Xo=function(e){return Math.round(e*1e5)/1e5||0},Mg=function(){return typeof window<"u"},Eg=function(){return Te||Mg()&&(Te=window.gsap)&&Te.registerPlugin&&Te},ds=function(e){return!!~_g.indexOf(e)},Tg=function(e){return(e==="Height"?Dh:ct["inner"+e])||ci["client"+e]||Tt["client"+e]},bg=function(e){return yr(e,"getBoundingClientRect")||(ds(e)?function(){return bl.width=ct.innerWidth,bl.height=Dh,bl}:function(){return Gi(e)})},Fv=function(e,t,n){var i=n.d,s=n.d2,o=n.a;return(o=yr(e,"getBoundingClientRect"))?function(){return o()[i]}:function(){return(t?Tg(s):e["client"+s])||0}},Bv=function(e,t){return!t||~bi.indexOf(e)?bg(e):function(){return bl}},Si=function(e,t){var n=t.s,i=t.d2,s=t.d,o=t.a;return Math.max(0,(n="scroll"+i)&&(o=yr(e,n))?o()-bg(e)()[s]:ds(e)?(ci[n]||Tt[n])-Tg(i):e[n]-e["offset"+i])},Oa=function(e,t){for(var n=0;n<qs.length;n+=3)(!t||~t.indexOf(qs[n+1]))&&e(qs[n],qs[n+1],qs[n+2])},Bn=function(e){return typeof e=="string"},bn=function(e){return typeof e=="function"},qo=function(e){return typeof e=="number"},Hr=function(e){return typeof e=="object"},Do=function(e,t,n){return e&&e.progress(t?0:1)&&n&&e.pause()},Rc=function(e,t){if(e.enabled){var n=e._ctx?e._ctx.add(function(){return t(e)}):t(e);n&&n.totalTime&&(e.callbackAnimation=n)}},Ms=Math.abs,Ag="left",wg="top",Ih="right",Oh="bottom",rs="width",ss="height",ta="Right",na="Left",ia="Top",ra="Bottom",Bt="padding",Kn="margin",mo="Width",Nh="Height",Gt="px",Zn=function(e){return ct.getComputedStyle(e)},kv=function(e){var t=Zn(e).position;e.style.position=t==="absolute"||t==="fixed"?t:"relative"},Nf=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},Gi=function(e,t){var n=t&&Zn(e)[Nu]!=="matrix(1, 0, 0, 1, 0, 0)"&&Te.to(e,{x:0,y:0,xPercent:0,yPercent:0,rotation:0,rotationX:0,rotationY:0,scale:1,skewX:0,skewY:0}).progress(1),i=e.getBoundingClientRect();return n&&n.progress(0).kill(),i},zl=function(e,t){var n=t.d2;return e["offset"+n]||e["client"+n]||0},Rg=function(e){var t=[],n=e.labels,i=e.duration(),s;for(s in n)t.push(n[s]/i);return t},zv=function(e){return function(t){return Te.utils.snap(Rg(e),t)}},Uh=function(e){var t=Te.utils.snap(e),n=Array.isArray(e)&&e.slice(0).sort(function(i,s){return i-s});return n?function(i,s,o){o===void 0&&(o=.001);var a;if(!s)return t(i);if(s>0){for(i-=o,a=0;a<n.length;a++)if(n[a]>=i)return n[a];return n[a-1]}else for(a=n.length,i+=o;a--;)if(n[a]<=i)return n[a];return n[0]}:function(i,s,o){o===void 0&&(o=.001);var a=t(i);return!s||Math.abs(a-i)<o||a-i<0==s<0?a:t(s<0?i-e:i+e)}},Hv=function(e){return function(t,n){return Uh(Rg(e))(t,n.direction)}},Na=function(e,t,n,i){return n.split(",").forEach(function(s){return e(t,s,i)})},jt=function(e,t,n,i,s){return e.addEventListener(t,n,{passive:!i,capture:!!s})},Yt=function(e,t,n,i){return e.removeEventListener(t,n,!!i)},Ua=function(e,t,n){n=n&&n.wheelHandler,n&&(e(t,"wheel",n),e(t,"touchmove",n))},Uf={startColor:"green",endColor:"red",indent:0,fontSize:"16px",fontWeight:"normal"},Fa={toggleActions:"play",anticipatePin:0},Hl={top:0,left:0,center:.5,bottom:1,right:1},Sl=function(e,t){if(Bn(e)){var n=e.indexOf("="),i=~n?+(e.charAt(n-1)+1)*parseFloat(e.substr(n+1)):0;~n&&(e.indexOf("%")>n&&(i*=t/100),e=e.substr(0,n-1)),e=i+(e in Hl?Hl[e]*t:~e.indexOf("%")?parseFloat(e)*t/100:parseFloat(e)||0)}return e},Ba=function(e,t,n,i,s,o,a,l){var c=s.startColor,u=s.endColor,h=s.fontSize,f=s.indent,d=s.fontWeight,g=Rt.createElement("div"),_=ds(n)||yr(n,"pinType")==="fixed",p=e.indexOf("scroller")!==-1,m=_?Tt:n,S=e.indexOf("start")!==-1,y=S?c:u,x="border-color:"+y+";font-size:"+h+";color:"+y+";font-weight:"+d+";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";return x+="position:"+((p||l)&&_?"fixed;":"absolute;"),(p||l||!_)&&(x+=(i===Vt?Ih:Oh)+":"+(o+parseFloat(f))+"px;"),a&&(x+="box-sizing:border-box;text-align:left;width:"+a.offsetWidth+"px;"),g._isStart=S,g.setAttribute("class","gsap-marker-"+e+(t?" marker-"+t:"")),g.style.cssText=x,g.innerText=t||t===0?e+"-"+t:e,m.children[0]?m.insertBefore(g,m.children[0]):m.appendChild(g),g._offset=g["offset"+i.op.d2],Ml(g,0,i,S),g},Ml=function(e,t,n,i){var s={display:"block"},o=n[i?"os2":"p2"],a=n[i?"p2":"os2"];e._isFlipped=i,s[n.a+"Percent"]=i?-100:0,s[n.a]=i?"1px":0,s["border"+o+mo]=1,s["border"+a+mo]=0,s[n.p]=t+"px",Te.set(e,s)},nt=[],ku={},va,Ff=function(){return ln()-ii>34&&(va||(va=requestAnimationFrame(qi)))},Es=function(){(!vn||!vn.isPressed||vn.startX>Tt.clientWidth)&&(ot.cache++,vn?va||(va=requestAnimationFrame(qi)):qi(),ii||ms("scrollStart"),ii=ln())},Cc=function(){Sg=ct.innerWidth,yg=ct.innerHeight},Yo=function(){ot.cache++,!an&&!xg&&!Rt.fullscreenElement&&!Rt.webkitFullscreenElement&&(!Uu||Sg!==ct.innerWidth||Math.abs(ct.innerHeight-yg)>ct.innerHeight*.25)&&Bl.restart(!0)},ps={},Gv=[],Cg=function r(){return Yt(lt,"scrollEnd",r)||$r(!0)},ms=function(e){return ps[e]&&ps[e].map(function(t){return t()})||Gv},Fn=[],Pg=function(e){for(var t=0;t<Fn.length;t+=5)(!e||Fn[t+4]&&Fn[t+4].query===e)&&(Fn[t].style.cssText=Fn[t+1],Fn[t].getBBox&&Fn[t].setAttribute("transform",Fn[t+2]||""),Fn[t+3].uncache=1)},Fh=function(e,t){var n;for(xn=0;xn<nt.length;xn++)n=nt[xn],n&&(!t||n._ctx===t)&&(e?n.kill(1):n.revert(!0,!0));kl=!0,t&&Pg(t),t||ms("revert")},Lg=function(e,t){ot.cache++,(t||!yn)&&ot.forEach(function(n){return bn(n)&&n.cacheID++&&(n.rec=0)}),Bn(e)&&(ct.history.scrollRestoration=Lh=e)},yn,os=0,Bf,Vv=function(){if(Bf!==os){var e=Bf=os;requestAnimationFrame(function(){return e===os&&$r(!0)})}},Dg=function(){Tt.appendChild(ro),Dh=!vn&&ro.offsetHeight||ct.innerHeight,Tt.removeChild(ro)},kf=function(e){return _a(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach(function(t){return t.style.display=e?"none":"block"})},$r=function(e,t){if(ii&&!e&&!kl){jt(lt,"scrollEnd",Cg);return}Dg(),yn=lt.isRefreshing=!0,ot.forEach(function(i){return bn(i)&&++i.cacheID&&(i.rec=i())});var n=ms("refreshInit");vg&&lt.sort(),t||Fh(),ot.forEach(function(i){bn(i)&&(i.smooth&&(i.target.style.scrollBehavior="auto"),i(0))}),nt.slice(0).forEach(function(i){return i.refresh()}),kl=!1,nt.forEach(function(i){if(i._subPinOffset&&i.pin){var s=i.vars.horizontal?"offsetWidth":"offsetHeight",o=i.pin[s];i.revert(!0,1),i.adjustPinSpacing(i.pin[s]-o),i.refresh()}}),Bu=1,kf(!0),nt.forEach(function(i){var s=Si(i.scroller,i._dir),o=i.vars.end==="max"||i._endClamp&&i.end>s,a=i._startClamp&&i.start>=s;(o||a)&&i.setPositions(a?s-1:i.start,o?Math.max(a?s:i.start+1,s):i.end,!0)}),kf(!1),Bu=0,n.forEach(function(i){return i&&i.render&&i.render(-1)}),ot.forEach(function(i){bn(i)&&(i.smooth&&requestAnimationFrame(function(){return i.target.style.scrollBehavior="smooth"}),i.rec&&i(i.rec))}),Lg(Lh,1),Bl.pause(),os++,yn=2,qi(2),nt.forEach(function(i){return bn(i.vars.onRefresh)&&i.vars.onRefresh(i)}),yn=lt.isRefreshing=!1,ms("refresh")},zu=0,El=1,sa,qi=function(e){if(e===2||!yn&&!kl){lt.isUpdating=!0,sa&&sa.update(0);var t=nt.length,n=ln(),i=n-wc>=50,s=t&&nt[0].scroll();if(El=zu>s?-1:1,yn||(zu=s),i&&(ii&&!rc&&n-ii>200&&(ii=0,ms("scrollEnd")),Vo=wc,wc=n),El<0){for(xn=t;xn-- >0;)nt[xn]&&nt[xn].update(0,i);El=1}else for(xn=0;xn<t;xn++)nt[xn]&&nt[xn].update(0,i);lt.isUpdating=!1}va=0},Hu=[Ag,wg,Oh,Ih,Kn+ra,Kn+ta,Kn+ia,Kn+na,"display","flexShrink","float","zIndex","gridColumnStart","gridColumnEnd","gridRowStart","gridRowEnd","gridArea","justifySelf","alignSelf","placeSelf","order"],Tl=Hu.concat([rs,ss,"boxSizing","max"+mo,"max"+Nh,"position",Kn,Bt,Bt+ia,Bt+ta,Bt+ra,Bt+na]),Wv=function(e,t,n){so(n);var i=e._gsap;if(i.spacerIsNative)so(i.spacerState);else if(e._gsap.swappedIn){var s=t.parentNode;s&&(s.insertBefore(e,t),s.removeChild(t))}e._gsap.swappedIn=!1},Pc=function(e,t,n,i){if(!e._gsap.swappedIn){for(var s=Hu.length,o=t.style,a=e.style,l;s--;)l=Hu[s],o[l]=n[l];o.position=n.position==="absolute"?"absolute":"relative",n.display==="inline"&&(o.display="inline-block"),a[Oh]=a[Ih]="auto",o.flexBasis=n.flexBasis||"auto",o.overflow="visible",o.boxSizing="border-box",o[rs]=zl(e,Tn)+Gt,o[ss]=zl(e,Vt)+Gt,o[Bt]=a[Kn]=a[wg]=a[Ag]="0",so(i),a[rs]=a["max"+mo]=n[rs],a[ss]=a["max"+Nh]=n[ss],a[Bt]=n[Bt],e.parentNode!==t&&(e.parentNode.insertBefore(t,e),t.appendChild(e)),e._gsap.swappedIn=!0}},Xv=/([A-Z])/g,so=function(e){if(e){var t=e.t.style,n=e.length,i=0,s,o;for((e.t._gsap||Te.core.getCache(e.t)).uncache=1;i<n;i+=2)o=e[i+1],s=e[i],o?t[s]=o:t[s]&&t.removeProperty(s.replace(Xv,"-$1").toLowerCase())}},ka=function(e){for(var t=Tl.length,n=e.style,i=[],s=0;s<t;s++)i.push(Tl[s],n[Tl[s]]);return i.t=e,i},qv=function(e,t,n){for(var i=[],s=e.length,o=n?8:0,a;o<s;o+=2)a=e[o],i.push(a,a in t?t[a]:e[o+1]);return i.t=e.t,i},bl={left:0,top:0},zf=function(e,t,n,i,s,o,a,l,c,u,h,f,d,g){bn(e)&&(e=e(l)),Bn(e)&&e.substr(0,3)==="max"&&(e=f+(e.charAt(4)==="="?Sl("0"+e.substr(3),n):0));var _=d?d.time():0,p,m,S;if(d&&d.seek(0),isNaN(e)||(e=+e),qo(e))d&&(e=Te.utils.mapRange(d.scrollTrigger.start,d.scrollTrigger.end,0,f,e)),a&&Ml(a,n,i,!0);else{bn(t)&&(t=t(l));var y=(e||"0").split(" "),x,T,b,M;S=wn(t,l)||Tt,x=Gi(S)||{},(!x||!x.left&&!x.top)&&Zn(S).display==="none"&&(M=S.style.display,S.style.display="block",x=Gi(S),M?S.style.display=M:S.style.removeProperty("display")),T=Sl(y[0],x[i.d]),b=Sl(y[1]||"0",n),e=x[i.p]-c[i.p]-u+T+s-b,a&&Ml(a,b,i,n-b<20||a._isStart&&b>20),n-=n-b}if(g&&(l[g]=e||-.001,e<0&&(e=0)),o){var I=e+n,O=o._isStart;p="scroll"+i.d2,Ml(o,I,i,O&&I>20||!O&&(h?Math.max(Tt[p],ci[p]):o.parentNode[p])<=I+1),h&&(c=Gi(a),h&&(o.style[i.op.p]=c[i.op.p]-i.op.m-o._offset+Gt))}return d&&S&&(p=Gi(S),d.seek(f),m=Gi(S),d._caScrollDist=p[i.p]-m[i.p],e=e/d._caScrollDist*f),d&&d.seek(_),d?e:Math.round(e)},Yv=/(webkit|moz|length|cssText|inset)/i,Hf=function(e,t,n,i){if(e.parentNode!==t){var s=e.style,o,a;if(t===Tt){e._stOrig=s.cssText,a=Zn(e);for(o in a)!+o&&!Yv.test(o)&&a[o]&&typeof s[o]=="string"&&o!=="0"&&(s[o]=a[o]);s.top=n,s.left=i}else s.cssText=e._stOrig;Te.core.getCache(e).uncache=1,t.appendChild(e)}},Ig=function(e,t,n){var i=t,s=i;return function(o){var a=Math.round(e());return a!==i&&a!==s&&Math.abs(a-i)>3&&Math.abs(a-s)>3&&(o=a,n&&n()),s=i,i=o,o}},za=function(e,t,n){var i={};i[t.p]="+="+n,Te.set(e,i)},Gf=function(e,t){var n=Ar(e,t),i="_scroll"+t.p2,s=function o(a,l,c,u,h){var f=o.tween,d=l.onComplete,g={};c=c||n();var _=Ig(n,c,function(){f.kill(),o.tween=0});return h=u&&h||0,u=u||a-c,f&&f.kill(),l[i]=a,l.inherit=!1,l.modifiers=g,g[i]=function(){return _(c+u*f.ratio+h*f.ratio*f.ratio)},l.onUpdate=function(){ot.cache++,o.tween&&qi()},l.onComplete=function(){o.tween=0,d&&d.call(f)},f=o.tween=Te.to(e,l),f};return e[i]=n,n.wheelHandler=function(){return s.tween&&s.tween.kill()&&(s.tween=0)},jt(e,"wheel",n.wheelHandler),lt.isTouch&&jt(e,"touchmove",n.wheelHandler),s},lt=function(){function r(t,n){Xs||r.register(Te)||console.warn("Please gsap.registerPlugin(ScrollTrigger)"),Fu(this),this.init(t,n)}var e=r.prototype;return e.init=function(n,i){if(this.progress=this.start=0,this.vars&&this.kill(!0,!0),!Wo){this.update=this.refresh=this.kill=pi;return}n=Nf(Bn(n)||qo(n)||n.nodeType?{trigger:n}:n,Fa);var s=n,o=s.onUpdate,a=s.toggleClass,l=s.id,c=s.onToggle,u=s.onRefresh,h=s.scrub,f=s.trigger,d=s.pin,g=s.pinSpacing,_=s.invalidateOnRefresh,p=s.anticipatePin,m=s.onScrubComplete,S=s.onSnapComplete,y=s.once,x=s.snap,T=s.pinReparent,b=s.pinSpacer,M=s.containerAnimation,I=s.fastScrollEnd,O=s.preventOverlaps,v=n.horizontal||n.containerAnimation&&n.horizontal!==!1?Tn:Vt,R=!h&&h!==0,N=wn(n.scroller||ct),$=Te.core.getCache(N),D=ds(N),H=("pinType"in n?n.pinType:yr(N,"pinType")||D&&"fixed")==="fixed",B=[n.onEnter,n.onLeave,n.onEnterBack,n.onLeaveBack],Y=R&&n.toggleActions.split(" "),j="markers"in n?n.markers:Fa.markers,K=D?0:parseFloat(Zn(N)["border"+v.p2+mo])||0,C=this,Z=n.onRefreshInit&&function(){return n.onRefreshInit(C)},le=Fv(N,D,v),Oe=Bv(N,D),X=0,J=0,fe=0,ve=Ar(N,v),Ee,me,Ke,De,k,Ve,ge,Le,xe,V,Be,w,E,z,re,ne,se,pe,he,ce,Ae,ke,te,st,Ie,We,we,_e,Xe,L,oe,Q,Ce,P,ie,ee,Se,Ne,Je;if(C._startClamp=C._endClamp=!1,C._dir=v,p*=45,C.scroller=N,C.scroll=M?M.time.bind(M):ve,De=ve(),C.vars=n,i=i||n.animation,"refreshPriority"in n&&(vg=1,n.refreshPriority===-9999&&(sa=C)),$.tweenScroll=$.tweenScroll||{top:Gf(N,Vt),left:Gf(N,Tn)},C.tweenTo=Ee=$.tweenScroll[v.p],C.scrubDuration=function(ae){Ce=qo(ae)&&ae,Ce?Q?Q.duration(ae):Q=Te.to(i,{ease:"expo",totalProgress:"+=0",inherit:!1,duration:Ce,paused:!0,onComplete:function(){return m&&m(C)}}):(Q&&Q.progress(1).kill(),Q=0)},i&&(i.vars.lazy=!1,i._initted&&!C.isReverted||i.vars.immediateRender!==!1&&n.immediateRender!==!1&&i.duration()&&i.render(0,!0,!0),C.animation=i.pause(),i.scrollTrigger=C,C.scrubDuration(h),L=0,l||(l=i.vars.id)),x&&((!Hr(x)||x.push)&&(x={snapTo:x}),"scrollBehavior"in Tt.style&&Te.set(D?[Tt,ci]:N,{scrollBehavior:"auto"}),ot.forEach(function(ae){return bn(ae)&&ae.target===(D?Rt.scrollingElement||ci:N)&&(ae.smooth=!1)}),Ke=bn(x.snapTo)?x.snapTo:x.snapTo==="labels"?zv(i):x.snapTo==="labelsDirectional"?Hv(i):x.directional!==!1?function(ae,Fe){return Uh(x.snapTo)(ae,ln()-J<500?0:Fe.direction)}:Te.utils.snap(x.snapTo),P=x.duration||{min:.1,max:2},P=Hr(P)?ea(P.min,P.max):ea(P,P),ie=Te.delayedCall(x.delay||Ce/2||.1,function(){var ae=ve(),Fe=ln()-J<500,ze=Ee.tween;if((Fe||Math.abs(C.getVelocity())<10)&&!ze&&!rc&&X!==ae){var Ye=(ae-Ve)/z,wt=i&&!R?i.totalProgress():Ye,tt=Fe?0:(wt-oe)/(ln()-Vo)*1e3||0,xt=Te.utils.clamp(-Ye,1-Ye,Ms(tt/2)*tt/.185),zt=Ye+(x.inertia===!1?0:xt),Mt,yt,ft=x,On=ft.onStart,A=ft.onInterrupt,F=ft.onComplete;if(Mt=Ke(zt,C),qo(Mt)||(Mt=zt),yt=Math.round(Ve+Mt*z),ae<=ge&&ae>=Ve&&yt!==ae){if(ze&&!ze._initted&&ze.data<=Ms(yt-ae))return;x.inertia===!1&&(xt=Mt-Ye),Ee(yt,{duration:P(Ms(Math.max(Ms(zt-wt),Ms(Mt-wt))*.185/tt/.05||0)),ease:x.ease||"power3",data:Ms(yt-ae),onInterrupt:function(){return ie.restart(!0)&&A&&A(C)},onComplete:function(){C.update(),X=ve(),i&&(Q?Q.resetTo("totalProgress",Mt,i._tTime/i._tDur):i.progress(Mt)),L=oe=i&&!R?i.totalProgress():C.progress,S&&S(C),F&&F(C)}},ae,xt*z,yt-ae-xt*z),On&&On(C,Ee.tween)}}else C.isActive&&X!==ae&&ie.restart(!0)}).pause()),l&&(ku[l]=C),f=C.trigger=wn(f||d!==!0&&d),Je=f&&f._gsap&&f._gsap.stRevert,Je&&(Je=Je(C)),d=d===!0?f:wn(d),Bn(a)&&(a={targets:f,className:a}),d&&(g===!1||g===Kn||(g=!g&&d.parentNode&&d.parentNode.style&&Zn(d.parentNode).display==="flex"?!1:Bt),C.pin=d,me=Te.core.getCache(d),me.spacer?re=me.pinState:(b&&(b=wn(b),b&&!b.nodeType&&(b=b.current||b.nativeElement),me.spacerIsNative=!!b,b&&(me.spacerState=ka(b))),me.spacer=pe=b||Rt.createElement("div"),pe.classList.add("pin-spacer"),l&&pe.classList.add("pin-spacer-"+l),me.pinState=re=ka(d)),n.force3D!==!1&&Te.set(d,{force3D:!0}),C.spacer=pe=me.spacer,Xe=Zn(d),st=Xe[g+v.os2],ce=Te.getProperty(d),Ae=Te.quickSetter(d,v.a,Gt),Pc(d,pe,Xe),se=ka(d)),j){w=Hr(j)?Nf(j,Uf):Uf,V=Ba("scroller-start",l,N,v,w,0),Be=Ba("scroller-end",l,N,v,w,0,V),he=V["offset"+v.op.d2];var Qe=wn(yr(N,"content")||N);Le=this.markerStart=Ba("start",l,Qe,v,w,he,0,M),xe=this.markerEnd=Ba("end",l,Qe,v,w,he,0,M),M&&(Ne=Te.quickSetter([Le,xe],v.a,Gt)),!H&&!(bi.length&&yr(N,"fixedMarkers")===!0)&&(kv(D?Tt:N),Te.set([V,Be],{force3D:!0}),We=Te.quickSetter(V,v.a,Gt),_e=Te.quickSetter(Be,v.a,Gt))}if(M){var ye=M.vars.onUpdate,Me=M.vars.onUpdateParams;M.eventCallback("onUpdate",function(){C.update(0,0,1),ye&&ye.apply(M,Me||[])})}if(C.previous=function(){return nt[nt.indexOf(C)-1]},C.next=function(){return nt[nt.indexOf(C)+1]},C.revert=function(ae,Fe){if(!Fe)return C.kill(!0);var ze=ae!==!1||!C.enabled,Ye=an;ze!==C.isReverted&&(ze&&(ee=Math.max(ve(),C.scroll.rec||0),fe=C.progress,Se=i&&i.progress()),Le&&[Le,xe,V,Be].forEach(function(wt){return wt.style.display=ze?"none":"block"}),ze&&(an=C,C.update(ze)),d&&(!T||!C.isActive)&&(ze?Wv(d,pe,re):Pc(d,pe,Zn(d),Ie)),ze||C.update(ze),an=Ye,C.isReverted=ze)},C.refresh=function(ae,Fe,ze,Ye){if(!((an||!C.enabled)&&!Fe)){if(d&&ae&&ii){jt(r,"scrollEnd",Cg);return}!yn&&Z&&Z(C),an=C,Ee.tween&&!ze&&(Ee.tween.kill(),Ee.tween=0),Q&&Q.pause(),_&&i&&i.revert({kill:!1}).invalidate(),C.isReverted||C.revert(!0,!0),C._subPinOffset=!1;var wt=le(),tt=Oe(),xt=M?M.duration():Si(N,v),zt=z<=.01,Mt=0,yt=Ye||0,ft=Hr(ze)?ze.end:n.end,On=n.endTrigger||f,A=Hr(ze)?ze.start:n.start||(n.start===0||!f?0:d?"0 0":"0 100%"),F=C.pinnedContainer=n.pinnedContainer&&wn(n.pinnedContainer,C),q=f&&Math.max(0,nt.indexOf(C))||0,W=q,G,ue,Re,He,Pe,Ue,Ge,je,bt,Ht,dt,dn,gt;for(j&&Hr(ze)&&(dn=Te.getProperty(V,v.p),gt=Te.getProperty(Be,v.p));W--;)Ue=nt[W],Ue.end||Ue.refresh(0,1)||(an=C),Ge=Ue.pin,Ge&&(Ge===f||Ge===d||Ge===F)&&!Ue.isReverted&&(Ht||(Ht=[]),Ht.unshift(Ue),Ue.revert(!0,!0)),Ue!==nt[W]&&(q--,W--);for(bn(A)&&(A=A(C)),A=Lf(A,"start",C),Ve=zf(A,f,wt,v,ve(),Le,V,C,tt,K,H,xt,M,C._startClamp&&"_startClamp")||(d?-.001:0),bn(ft)&&(ft=ft(C)),Bn(ft)&&!ft.indexOf("+=")&&(~ft.indexOf(" ")?ft=(Bn(A)?A.split(" ")[0]:"")+ft:(Mt=Sl(ft.substr(2),wt),ft=Bn(A)?A:(M?Te.utils.mapRange(0,M.duration(),M.scrollTrigger.start,M.scrollTrigger.end,Ve):Ve)+Mt,On=f)),ft=Lf(ft,"end",C),ge=Math.max(Ve,zf(ft||(On?"100% 0":xt),On,wt,v,ve()+Mt,xe,Be,C,tt,K,H,xt,M,C._endClamp&&"_endClamp"))||-.001,Mt=0,W=q;W--;)Ue=nt[W],Ge=Ue.pin,Ge&&Ue.start-Ue._pinPush<=Ve&&!M&&Ue.end>0&&(G=Ue.end-(C._startClamp?Math.max(0,Ue.start):Ue.start),(Ge===f&&Ue.start-Ue._pinPush<Ve||Ge===F)&&isNaN(A)&&(Mt+=G*(1-Ue.progress)),Ge===d&&(yt+=G));if(Ve+=Mt,ge+=Mt,C._startClamp&&(C._startClamp+=Mt),C._endClamp&&!yn&&(C._endClamp=ge||-.001,ge=Math.min(ge,Si(N,v))),z=ge-Ve||(Ve-=.01)&&.001,zt&&(fe=Te.utils.clamp(0,1,Te.utils.normalize(Ve,ge,ee))),C._pinPush=yt,Le&&Mt&&(G={},G[v.a]="+="+Mt,F&&(G[v.p]="-="+ve()),Te.set([Le,xe],G)),d&&!(Bu&&C.end>=Si(N,v)))G=Zn(d),He=v===Vt,Re=ve(),ke=parseFloat(ce(v.a))+yt,!xt&&ge>1&&(dt=(D?Rt.scrollingElement||ci:N).style,dt={style:dt,value:dt["overflow"+v.a.toUpperCase()]},D&&Zn(Tt)["overflow"+v.a.toUpperCase()]!=="scroll"&&(dt.style["overflow"+v.a.toUpperCase()]="scroll")),Pc(d,pe,G),se=ka(d),ue=Gi(d,!0),je=H&&Ar(N,He?Tn:Vt)(),g?(Ie=[g+v.os2,z+yt+Gt],Ie.t=pe,W=g===Bt?zl(d,v)+z+yt:0,W&&(Ie.push(v.d,W+Gt),pe.style.flexBasis!=="auto"&&(pe.style.flexBasis=W+Gt)),so(Ie),F&&nt.forEach(function($e){$e.pin===F&&$e.vars.pinSpacing!==!1&&($e._subPinOffset=!0)}),H&&ve(ee)):(W=zl(d,v),W&&pe.style.flexBasis!=="auto"&&(pe.style.flexBasis=W+Gt)),H&&(Pe={top:ue.top+(He?Re-Ve:je)+Gt,left:ue.left+(He?je:Re-Ve)+Gt,boxSizing:"border-box",position:"fixed"},Pe[rs]=Pe["max"+mo]=Math.ceil(ue.width)+Gt,Pe[ss]=Pe["max"+Nh]=Math.ceil(ue.height)+Gt,Pe[Kn]=Pe[Kn+ia]=Pe[Kn+ta]=Pe[Kn+ra]=Pe[Kn+na]="0",Pe[Bt]=G[Bt],Pe[Bt+ia]=G[Bt+ia],Pe[Bt+ta]=G[Bt+ta],Pe[Bt+ra]=G[Bt+ra],Pe[Bt+na]=G[Bt+na],ne=qv(re,Pe,T),yn&&ve(0)),i?(bt=i._initted,bc(1),i.render(i.duration(),!0,!0),te=ce(v.a)-ke+z+yt,we=Math.abs(z-te)>1,H&&we&&ne.splice(ne.length-2,2),i.render(0,!0,!0),bt||i.invalidate(!0),i.parent||i.totalTime(i.totalTime()),bc(0)):te=z,dt&&(dt.value?dt.style["overflow"+v.a.toUpperCase()]=dt.value:dt.style.removeProperty("overflow-"+v.a));else if(f&&ve()&&!M)for(ue=f.parentNode;ue&&ue!==Tt;)ue._pinOffset&&(Ve-=ue._pinOffset,ge-=ue._pinOffset),ue=ue.parentNode;Ht&&Ht.forEach(function($e){return $e.revert(!1,!0)}),C.start=Ve,C.end=ge,De=k=yn?ee:ve(),!M&&!yn&&(De<ee&&ve(ee),C.scroll.rec=0),C.revert(!1,!0),J=ln(),ie&&(X=-1,ie.restart(!0)),an=0,i&&R&&(i._initted||Se)&&i.progress()!==Se&&i.progress(Se||0,!0).render(i.time(),!0,!0),(zt||fe!==C.progress||M||_)&&(i&&!R&&i.totalProgress(M&&Ve<-.001&&!fe?Te.utils.normalize(Ve,ge,0):fe,!0),C.progress=zt||(De-Ve)/z===fe?0:fe),d&&g&&(pe._pinOffset=Math.round(C.progress*te)),Q&&Q.invalidate(),isNaN(dn)||(dn-=Te.getProperty(V,v.p),gt-=Te.getProperty(Be,v.p),za(V,v,dn),za(Le,v,dn-(Ye||0)),za(Be,v,gt),za(xe,v,gt-(Ye||0))),zt&&!yn&&C.update(),u&&!yn&&!E&&(E=!0,u(C),E=!1)}},C.getVelocity=function(){return(ve()-k)/(ln()-Vo)*1e3||0},C.endAnimation=function(){Do(C.callbackAnimation),i&&(Q?Q.progress(1):i.paused()?R||Do(i,C.direction<0,1):Do(i,i.reversed()))},C.labelToScroll=function(ae){return i&&i.labels&&(Ve||C.refresh()||Ve)+i.labels[ae]/i.duration()*z||0},C.getTrailing=function(ae){var Fe=nt.indexOf(C),ze=C.direction>0?nt.slice(0,Fe).reverse():nt.slice(Fe+1);return(Bn(ae)?ze.filter(function(Ye){return Ye.vars.preventOverlaps===ae}):ze).filter(function(Ye){return C.direction>0?Ye.end<=Ve:Ye.start>=ge})},C.update=function(ae,Fe,ze){if(!(M&&!ze&&!ae)){var Ye=yn===!0?ee:C.scroll(),wt=ae?0:(Ye-Ve)/z,tt=wt<0?0:wt>1?1:wt||0,xt=C.progress,zt,Mt,yt,ft,On,A,F,q;if(Fe&&(k=De,De=M?ve():Ye,x&&(oe=L,L=i&&!R?i.totalProgress():tt)),p&&d&&!an&&!Ia&&ii&&(!tt&&Ve<Ye+(Ye-k)/(ln()-Vo)*p?tt=1e-4:tt===1&&ge>Ye+(Ye-k)/(ln()-Vo)*p&&(tt=.9999)),tt!==xt&&C.enabled){if(zt=C.isActive=!!tt&&tt<1,Mt=!!xt&&xt<1,A=zt!==Mt,On=A||!!tt!=!!xt,C.direction=tt>xt?1:-1,C.progress=tt,On&&!an&&(yt=tt&&!xt?0:tt===1?1:xt===1?2:3,R&&(ft=!A&&Y[yt+1]!=="none"&&Y[yt+1]||Y[yt],q=i&&(ft==="complete"||ft==="reset"||ft in i))),O&&(A||q)&&(q||h||!i)&&(bn(O)?O(C):C.getTrailing(O).forEach(function(Re){return Re.endAnimation()})),R||(Q&&!an&&!Ia?(Q._dp._time-Q._start!==Q._time&&Q.render(Q._dp._time-Q._start),Q.resetTo?Q.resetTo("totalProgress",tt,i._tTime/i._tDur):(Q.vars.totalProgress=tt,Q.invalidate().restart())):i&&i.totalProgress(tt,!!(an&&(J||ae)))),d){if(ae&&g&&(pe.style[g+v.os2]=st),!H)Ae(Xo(ke+te*tt));else if(On){if(F=!ae&&tt>xt&&ge+1>Ye&&Ye+1>=Si(N,v),T)if(!ae&&(zt||F)){var W=Gi(d,!0),G=Ye-Ve;Hf(d,Tt,W.top+(v===Vt?G:0)+Gt,W.left+(v===Vt?0:G)+Gt)}else Hf(d,pe);so(zt||F?ne:se),we&&tt<1&&zt||Ae(ke+(tt===1&&!F?te:0))}}x&&!Ee.tween&&!an&&!Ia&&ie.restart(!0),a&&(A||y&&tt&&(tt<1||!Ac))&&_a(a.targets).forEach(function(Re){return Re.classList[zt||y?"add":"remove"](a.className)}),o&&!R&&!ae&&o(C),On&&!an?(R&&(q&&(ft==="complete"?i.pause().totalProgress(1):ft==="reset"?i.restart(!0).pause():ft==="restart"?i.restart(!0):i[ft]()),o&&o(C)),(A||!Ac)&&(c&&A&&Rc(C,c),B[yt]&&Rc(C,B[yt]),y&&(tt===1?C.kill(!1,1):B[yt]=0),A||(yt=tt===1?1:3,B[yt]&&Rc(C,B[yt]))),I&&!zt&&Math.abs(C.getVelocity())>(qo(I)?I:2500)&&(Do(C.callbackAnimation),Q?Q.progress(1):Do(i,ft==="reverse"?1:!tt,1))):R&&o&&!an&&o(C)}if(_e){var ue=M?Ye/M.duration()*(M._caScrollDist||0):Ye;We(ue+(V._isFlipped?1:0)),_e(ue)}Ne&&Ne(-Ye/M.duration()*(M._caScrollDist||0))}},C.enable=function(ae,Fe){C.enabled||(C.enabled=!0,jt(N,"resize",Yo),D||jt(N,"scroll",Es),Z&&jt(r,"refreshInit",Z),ae!==!1&&(C.progress=fe=0,De=k=X=ve()),Fe!==!1&&C.refresh())},C.getTween=function(ae){return ae&&Ee?Ee.tween:Q},C.setPositions=function(ae,Fe,ze,Ye){if(M){var wt=M.scrollTrigger,tt=M.duration(),xt=wt.end-wt.start;ae=wt.start+xt*ae/tt,Fe=wt.start+xt*Fe/tt}C.refresh(!1,!1,{start:Df(ae,ze&&!!C._startClamp),end:Df(Fe,ze&&!!C._endClamp)},Ye),C.update()},C.adjustPinSpacing=function(ae){if(Ie&&ae){var Fe=Ie.indexOf(v.d)+1;Ie[Fe]=parseFloat(Ie[Fe])+ae+Gt,Ie[1]=parseFloat(Ie[1])+ae+Gt,so(Ie)}},C.disable=function(ae,Fe){if(C.enabled&&(ae!==!1&&C.revert(!0,!0),C.enabled=C.isActive=!1,Fe||Q&&Q.pause(),ee=0,me&&(me.uncache=1),Z&&Yt(r,"refreshInit",Z),ie&&(ie.pause(),Ee.tween&&Ee.tween.kill()&&(Ee.tween=0)),!D)){for(var ze=nt.length;ze--;)if(nt[ze].scroller===N&&nt[ze]!==C)return;Yt(N,"resize",Yo),D||Yt(N,"scroll",Es)}},C.kill=function(ae,Fe){C.disable(ae,Fe),Q&&!Fe&&Q.kill(),l&&delete ku[l];var ze=nt.indexOf(C);ze>=0&&nt.splice(ze,1),ze===xn&&El>0&&xn--,ze=0,nt.forEach(function(Ye){return Ye.scroller===C.scroller&&(ze=1)}),ze||yn||(C.scroll.rec=0),i&&(i.scrollTrigger=null,ae&&i.revert({kill:!1}),Fe||i.kill()),Le&&[Le,xe,V,Be].forEach(function(Ye){return Ye.parentNode&&Ye.parentNode.removeChild(Ye)}),sa===C&&(sa=0),d&&(me&&(me.uncache=1),ze=0,nt.forEach(function(Ye){return Ye.pin===d&&ze++}),ze||(me.spacer=0)),n.onKill&&n.onKill(C)},nt.push(C),C.enable(!1,!1),Je&&Je(C),i&&i.add&&!z){var be=C.update;C.update=function(){C.update=be,Ve||ge||C.refresh()},Te.delayedCall(.01,C.update),z=.01,Ve=ge=0}else C.refresh();d&&Vv()},r.register=function(n){return Xs||(Te=n||Eg(),Mg()&&window.document&&r.enable(),Xs=Wo),Xs},r.defaults=function(n){if(n)for(var i in n)Fa[i]=n[i];return Fa},r.disable=function(n,i){Wo=0,nt.forEach(function(o){return o[i?"kill":"disable"](n)}),Yt(ct,"wheel",Es),Yt(Rt,"scroll",Es),clearInterval(Da),Yt(Rt,"touchcancel",pi),Yt(Tt,"touchstart",pi),Na(Yt,Rt,"pointerdown,touchstart,mousedown",If),Na(Yt,Rt,"pointerup,touchend,mouseup",Of),Bl.kill(),Oa(Yt);for(var s=0;s<ot.length;s+=3)Ua(Yt,ot[s],ot[s+1]),Ua(Yt,ot[s],ot[s+2])},r.enable=function(){if(ct=window,Rt=document,ci=Rt.documentElement,Tt=Rt.body,Te&&(_a=Te.utils.toArray,ea=Te.utils.clamp,Fu=Te.core.context||pi,bc=Te.core.suppressOverwrites||pi,Lh=ct.history.scrollRestoration||"auto",zu=ct.pageYOffset,Te.core.globals("ScrollTrigger",r),Tt)){Wo=1,ro=document.createElement("div"),ro.style.height="100vh",ro.style.position="absolute",Dg(),Uv(),Ut.register(Te),r.isTouch=Ut.isTouch,or=Ut.isTouch&&/(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent),Uu=Ut.isTouch===1,jt(ct,"wheel",Es),_g=[ct,Rt,ci,Tt],Te.matchMedia?(r.matchMedia=function(l){var c=Te.matchMedia(),u;for(u in l)c.add(u,l[u]);return c},Te.addEventListener("matchMediaInit",function(){return Fh()}),Te.addEventListener("matchMediaRevert",function(){return Pg()}),Te.addEventListener("matchMedia",function(){$r(0,1),ms("matchMedia")}),Te.matchMedia("(orientation: portrait)",function(){return Cc(),Cc})):console.warn("Requires GSAP 3.11.0 or later"),Cc(),jt(Rt,"scroll",Es);var n=Tt.style,i=n.borderTopStyle,s=Te.core.Animation.prototype,o,a;for(s.revert||Object.defineProperty(s,"revert",{value:function(){return this.time(-.01,!0)}}),n.borderTopStyle="solid",o=Gi(Tt),Vt.m=Math.round(o.top+Vt.sc())||0,Tn.m=Math.round(o.left+Tn.sc())||0,i?n.borderTopStyle=i:n.removeProperty("border-top-style"),Da=setInterval(Ff,250),Te.delayedCall(.5,function(){return Ia=0}),jt(Rt,"touchcancel",pi),jt(Tt,"touchstart",pi),Na(jt,Rt,"pointerdown,touchstart,mousedown",If),Na(jt,Rt,"pointerup,touchend,mouseup",Of),Nu=Te.utils.checkPrefix("transform"),Tl.push(Nu),Xs=ln(),Bl=Te.delayedCall(.2,$r).pause(),qs=[Rt,"visibilitychange",function(){var l=ct.innerWidth,c=ct.innerHeight;Rt.hidden?(Cf=l,Pf=c):(Cf!==l||Pf!==c)&&Yo()},Rt,"DOMContentLoaded",$r,ct,"load",$r,ct,"resize",Yo],Oa(jt),nt.forEach(function(l){return l.enable(0,1)}),a=0;a<ot.length;a+=3)Ua(Yt,ot[a],ot[a+1]),Ua(Yt,ot[a],ot[a+2])}},r.config=function(n){"limitCallbacks"in n&&(Ac=!!n.limitCallbacks);var i=n.syncInterval;i&&clearInterval(Da)||(Da=i)&&setInterval(Ff,i),"ignoreMobileResize"in n&&(Uu=r.isTouch===1&&n.ignoreMobileResize),"autoRefreshEvents"in n&&(Oa(Yt)||Oa(jt,n.autoRefreshEvents||"none"),xg=(n.autoRefreshEvents+"").indexOf("resize")===-1)},r.scrollerProxy=function(n,i){var s=wn(n),o=ot.indexOf(s),a=ds(s);~o&&ot.splice(o,a?6:2),i&&(a?bi.unshift(ct,i,Tt,i,ci,i):bi.unshift(s,i))},r.clearMatchMedia=function(n){nt.forEach(function(i){return i._ctx&&i._ctx.query===n&&i._ctx.kill(!0,!0)})},r.isInViewport=function(n,i,s){var o=(Bn(n)?wn(n):n).getBoundingClientRect(),a=o[s?rs:ss]*i||0;return s?o.right-a>0&&o.left+a<ct.innerWidth:o.bottom-a>0&&o.top+a<ct.innerHeight},r.positionInViewport=function(n,i,s){Bn(n)&&(n=wn(n));var o=n.getBoundingClientRect(),a=o[s?rs:ss],l=i==null?a/2:i in Hl?Hl[i]*a:~i.indexOf("%")?parseFloat(i)*a/100:parseFloat(i)||0;return s?(o.left+l)/ct.innerWidth:(o.top+l)/ct.innerHeight},r.killAll=function(n){if(nt.slice(0).forEach(function(s){return s.vars.id!=="ScrollSmoother"&&s.kill()}),n!==!0){var i=ps.killAll||[];ps={},i.forEach(function(s){return s()})}},r}();lt.version="3.12.5";lt.saveStyles=function(r){return r?_a(r).forEach(function(e){if(e&&e.style){var t=Fn.indexOf(e);t>=0&&Fn.splice(t,5),Fn.push(e,e.style.cssText,e.getBBox&&e.getAttribute("transform"),Te.core.getCache(e),Fu())}}):Fn};lt.revert=function(r,e){return Fh(!r,e)};lt.create=function(r,e){return new lt(r,e)};lt.refresh=function(r){return r?Yo():(Xs||lt.register())&&$r(!0)};lt.update=function(r){return++ot.cache&&qi(r===!0?2:0)};lt.clearScrollMemory=Lg;lt.maxScroll=function(r,e){return Si(r,e?Tn:Vt)};lt.getScrollFunc=function(r,e){return Ar(wn(r),e?Tn:Vt)};lt.getById=function(r){return ku[r]};lt.getAll=function(){return nt.filter(function(r){return r.vars.id!=="ScrollSmoother"})};lt.isScrolling=function(){return!!ii};lt.snapDirectional=Uh;lt.addEventListener=function(r,e){var t=ps[r]||(ps[r]=[]);~t.indexOf(e)||t.push(e)};lt.removeEventListener=function(r,e){var t=ps[r],n=t&&t.indexOf(e);n>=0&&t.splice(n,1)};lt.batch=function(r,e){var t=[],n={},i=e.interval||.016,s=e.batchMax||1e9,o=function(c,u){var h=[],f=[],d=Te.delayedCall(i,function(){u(h,f),h=[],f=[]}).pause();return function(g){h.length||d.restart(!0),h.push(g.trigger),f.push(g),s<=h.length&&d.progress(1)}},a;for(a in e)n[a]=a.substr(0,2)==="on"&&bn(e[a])&&a!=="onRefreshInit"?o(a,e[a]):e[a];return bn(s)&&(s=s(),jt(lt,"refresh",function(){return s=e.batchMax()})),_a(r).forEach(function(l){var c={};for(a in n)c[a]=n[a];c.trigger=l,t.push(lt.create(c))}),t};var Vf=function(e,t,n,i){return t>i?e(i):t<0&&e(0),n>i?(i-t)/(n-t):n<0?t/(t-n):1},Lc=function r(e,t){t===!0?e.style.removeProperty("touch-action"):e.style.touchAction=t===!0?"auto":t?"pan-"+t+(Ut.isTouch?" pinch-zoom":""):"none",e===ci&&r(Tt,t)},Ha={auto:1,scroll:1},jv=function(e){var t=e.event,n=e.target,i=e.axis,s=(t.changedTouches?t.changedTouches[0]:t).target,o=s._gsap||Te.core.getCache(s),a=ln(),l;if(!o._isScrollT||a-o._isScrollT>2e3){for(;s&&s!==Tt&&(s.scrollHeight<=s.clientHeight&&s.scrollWidth<=s.clientWidth||!(Ha[(l=Zn(s)).overflowY]||Ha[l.overflowX]));)s=s.parentNode;o._isScroll=s&&s!==n&&!ds(s)&&(Ha[(l=Zn(s)).overflowY]||Ha[l.overflowX]),o._isScrollT=a}(o._isScroll||i==="x")&&(t.stopPropagation(),t._gsapAllow=!0)},Og=function(e,t,n,i){return Ut.create({target:e,capture:!0,debounce:!1,lockAxis:!0,type:t,onWheel:i=i&&jv,onPress:i,onDrag:i,onScroll:i,onEnable:function(){return n&&jt(Rt,Ut.eventTypes[0],Xf,!1,!0)},onDisable:function(){return Yt(Rt,Ut.eventTypes[0],Xf,!0)}})},$v=/(input|label|select|textarea)/i,Wf,Xf=function(e){var t=$v.test(e.target.tagName);(t||Wf)&&(e._gsapAllow=!0,Wf=t)},Kv=function(e){Hr(e)||(e={}),e.preventDefault=e.isNormalizer=e.allowClicks=!0,e.type||(e.type="wheel,touch"),e.debounce=!!e.debounce,e.id=e.id||"normalizer";var t=e,n=t.normalizeScrollX,i=t.momentum,s=t.allowNestedScroll,o=t.onRelease,a,l,c=wn(e.target)||ci,u=Te.core.globals().ScrollSmoother,h=u&&u.get(),f=or&&(e.content&&wn(e.content)||h&&e.content!==!1&&!h.smooth()&&h.content()),d=Ar(c,Vt),g=Ar(c,Tn),_=1,p=(Ut.isTouch&&ct.visualViewport?ct.visualViewport.scale*ct.visualViewport.width:ct.outerWidth)/ct.innerWidth,m=0,S=bn(i)?function(){return i(a)}:function(){return i||2.8},y,x,T=Og(c,e.type,!0,s),b=function(){return x=!1},M=pi,I=pi,O=function(){l=Si(c,Vt),I=ea(or?1:0,l),n&&(M=ea(0,Si(c,Tn))),y=os},v=function(){f._gsap.y=Xo(parseFloat(f._gsap.y)+d.offset)+"px",f.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+parseFloat(f._gsap.y)+", 0, 1)",d.offset=d.cacheID=0},R=function(){if(x){requestAnimationFrame(b);var j=Xo(a.deltaY/2),K=I(d.v-j);if(f&&K!==d.v+d.offset){d.offset=K-d.v;var C=Xo((parseFloat(f&&f._gsap.y)||0)-d.offset);f.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+C+", 0, 1)",f._gsap.y=C+"px",d.cacheID=ot.cache,qi()}return!0}d.offset&&v(),x=!0},N,$,D,H,B=function(){O(),N.isActive()&&N.vars.scrollY>l&&(d()>l?N.progress(1)&&d(l):N.resetTo("scrollY",l))};return f&&Te.set(f,{y:"+=0"}),e.ignoreCheck=function(Y){return or&&Y.type==="touchmove"&&R()||_>1.05&&Y.type!=="touchstart"||a.isGesturing||Y.touches&&Y.touches.length>1},e.onPress=function(){x=!1;var Y=_;_=Xo((ct.visualViewport&&ct.visualViewport.scale||1)/p),N.pause(),Y!==_&&Lc(c,_>1.01?!0:n?!1:"x"),$=g(),D=d(),O(),y=os},e.onRelease=e.onGestureStart=function(Y,j){if(d.offset&&v(),!j)H.restart(!0);else{ot.cache++;var K=S(),C,Z;n&&(C=g(),Z=C+K*.05*-Y.velocityX/.227,K*=Vf(g,C,Z,Si(c,Tn)),N.vars.scrollX=M(Z)),C=d(),Z=C+K*.05*-Y.velocityY/.227,K*=Vf(d,C,Z,Si(c,Vt)),N.vars.scrollY=I(Z),N.invalidate().duration(K).play(.01),(or&&N.vars.scrollY>=l||C>=l-1)&&Te.to({},{onUpdate:B,duration:K})}o&&o(Y)},e.onWheel=function(){N._ts&&N.pause(),ln()-m>1e3&&(y=0,m=ln())},e.onChange=function(Y,j,K,C,Z){if(os!==y&&O(),j&&n&&g(M(C[2]===j?$+(Y.startX-Y.x):g()+j-C[1])),K){d.offset&&v();var le=Z[2]===K,Oe=le?D+Y.startY-Y.y:d()+K-Z[1],X=I(Oe);le&&Oe!==X&&(D+=X-Oe),d(X)}(K||j)&&qi()},e.onEnable=function(){Lc(c,n?!1:"x"),lt.addEventListener("refresh",B),jt(ct,"resize",B),d.smooth&&(d.target.style.scrollBehavior="auto",d.smooth=g.smooth=!1),T.enable()},e.onDisable=function(){Lc(c,!0),Yt(ct,"resize",B),lt.removeEventListener("refresh",B),T.kill()},e.lockAxis=e.lockAxis!==!1,a=new Ut(e),a.iOS=or,or&&!d()&&d(1),or&&Te.ticker.add(pi),H=a._dc,N=Te.to(a,{ease:"power4",paused:!0,inherit:!1,scrollX:n?"+=0.1":"+=0",scrollY:"+=0.1",modifiers:{scrollY:Ig(d,d(),function(){return N.pause()})},onUpdate:qi,onComplete:H.vars.onComplete}),a};lt.sort=function(r){return nt.sort(r||function(e,t){return(e.vars.refreshPriority||0)*-1e6+e.start-(t.start+(t.vars.refreshPriority||0)*-1e6)})};lt.observe=function(r){return new Ut(r)};lt.normalizeScroll=function(r){if(typeof r>"u")return vn;if(r===!0&&vn)return vn.enable();if(r===!1){vn&&vn.kill(),vn=r;return}var e=r instanceof Ut?r:Kv(r);return vn&&vn.target===e.target&&vn.kill(),ds(e.target)&&(vn=e),e};lt.core={_getVelocityProp:Ou,_inputObserver:Og,_scrollers:ot,_proxies:bi,bridge:{ss:function(){ii||ms("scrollStart"),ii=ln()},ref:function(){return an}}};Eg()&&Te.registerPlugin(lt);(function(){function r(){for(var n=arguments.length,i=0;i<n;i++){var s=i<0||arguments.length<=i?void 0:arguments[i];s.nodeType===1||s.nodeType===11?this.appendChild(s):this.appendChild(document.createTextNode(String(s)))}}function e(){for(;this.lastChild;)this.removeChild(this.lastChild);arguments.length&&this.append.apply(this,arguments)}function t(){for(var n=this.parentNode,i=arguments.length,s=new Array(i),o=0;o<i;o++)s[o]=arguments[o];var a=s.length;if(n)for(a||n.removeChild(this);a--;){var l=s[a];typeof l!="object"?l=this.ownerDocument.createTextNode(l):l.parentNode&&l.parentNode.removeChild(l),a?n.insertBefore(this.previousSibling,l):n.replaceChild(l,this)}}typeof Element<"u"&&(Element.prototype.append||(Element.prototype.append=r,DocumentFragment.prototype.append=r),Element.prototype.replaceChildren||(Element.prototype.replaceChildren=e,DocumentFragment.prototype.replaceChildren=e),Element.prototype.replaceWith||(Element.prototype.replaceWith=t,DocumentFragment.prototype.replaceWith=t))})();function Zv(r,e){if(!(r instanceof e))throw new TypeError("Cannot call a class as a function")}function qf(r,e){for(var t=0;t<e.length;t++){var n=e[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(r,n.key,n)}}function Yf(r,e,t){return e&&qf(r.prototype,e),t&&qf(r,t),r}function Jv(r,e,t){return e in r?Object.defineProperty(r,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):r[e]=t,r}function jf(r,e){var t=Object.keys(r);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(r);e&&(n=n.filter(function(i){return Object.getOwnPropertyDescriptor(r,i).enumerable})),t.push.apply(t,n)}return t}function $f(r){for(var e=1;e<arguments.length;e++){var t=arguments[e]!=null?arguments[e]:{};e%2?jf(Object(t),!0).forEach(function(n){Jv(r,n,t[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(t)):jf(Object(t)).forEach(function(n){Object.defineProperty(r,n,Object.getOwnPropertyDescriptor(t,n))})}return r}function Ng(r,e){return ex(r)||nx(r,e)||Ug(r,e)||rx()}function Sn(r){return Qv(r)||tx(r)||Ug(r)||ix()}function Qv(r){if(Array.isArray(r))return Gu(r)}function ex(r){if(Array.isArray(r))return r}function tx(r){if(typeof Symbol<"u"&&Symbol.iterator in Object(r))return Array.from(r)}function nx(r,e){if(!(typeof Symbol>"u"||!(Symbol.iterator in Object(r)))){var t=[],n=!0,i=!1,s=void 0;try{for(var o=r[Symbol.iterator](),a;!(n=(a=o.next()).done)&&(t.push(a.value),!(e&&t.length===e));n=!0);}catch(l){i=!0,s=l}finally{try{!n&&o.return!=null&&o.return()}finally{if(i)throw s}}return t}}function Ug(r,e){if(r){if(typeof r=="string")return Gu(r,e);var t=Object.prototype.toString.call(r).slice(8,-1);if(t==="Object"&&r.constructor&&(t=r.constructor.name),t==="Map"||t==="Set")return Array.from(r);if(t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return Gu(r,e)}}function Gu(r,e){(e==null||e>r.length)&&(e=r.length);for(var t=0,n=new Array(e);t<e;t++)n[t]=r[t];return n}function ix(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function rx(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Kr(r,e){return Object.getOwnPropertyNames(Object(r)).reduce(function(t,n){var i=Object.getOwnPropertyDescriptor(Object(r),n),s=Object.getOwnPropertyDescriptor(Object(e),n);return Object.defineProperty(t,n,s||i)},{})}function ba(r){return typeof r=="string"}function Bh(r){return Array.isArray(r)}function Ga(){var r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},e=Kr(r),t;return e.types!==void 0?t=e.types:e.split!==void 0&&(t=e.split),t!==void 0&&(e.types=(ba(t)||Bh(t)?String(t):"").split(",").map(function(n){return String(n).trim()}).filter(function(n){return/((line)|(word)|(char))/i.test(n)})),(e.absolute||e.position)&&(e.absolute=e.absolute||/absolute/.test(r.position)),e}function kh(r){var e=ba(r)||Bh(r)?String(r):"";return{none:!e,lines:/line/i.test(e),words:/word/i.test(e),chars:/char/i.test(e)}}function sc(r){return r!==null&&typeof r=="object"}function sx(r){return sc(r)&&/^(1|3|11)$/.test(r.nodeType)}function ox(r){return typeof r=="number"&&r>-1&&r%1===0}function ax(r){return sc(r)&&ox(r.length)}function gs(r){return Bh(r)?r:r==null?[]:ax(r)?Array.prototype.slice.call(r):[r]}function Kf(r){var e=r;return ba(r)&&(/^(#[a-z]\w+)$/.test(r.trim())?e=document.getElementById(r.trim().slice(1)):e=document.querySelectorAll(r)),gs(e).reduce(function(t,n){return[].concat(Sn(t),Sn(gs(n).filter(sx)))},[])}var lx=Object.entries,Gl="_splittype",hi={},cx=0;function Mi(r,e,t){if(!sc(r))return console.warn("[data.set] owner is not an object"),null;var n=r[Gl]||(r[Gl]=++cx),i=hi[n]||(hi[n]={});return t===void 0?e&&Object.getPrototypeOf(e)===Object.prototype&&(hi[n]=$f($f({},i),e)):e!==void 0&&(i[e]=t),t}function Zr(r,e){var t=sc(r)?r[Gl]:null,n=t&&hi[t]||{};return e===void 0?n:n[e]}function Fg(r){var e=r&&r[Gl];e&&(delete r[e],delete hi[e])}function ux(){Object.keys(hi).forEach(function(r){delete hi[r]})}function hx(){lx(hi).forEach(function(r){var e=Ng(r,2),t=e[0],n=e[1],i=n.isRoot,s=n.isSplit;(!i||!s)&&(hi[t]=null,delete hi[t])})}function fx(r){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:" ",t=r?String(r):"";return t.trim().replace(/\s+/g," ").split(e)}var zh="\\ud800-\\udfff",Bg="\\u0300-\\u036f\\ufe20-\\ufe23",kg="\\u20d0-\\u20f0",zg="\\ufe0e\\ufe0f",dx="[".concat(zh,"]"),Vu="[".concat(Bg).concat(kg,"]"),Wu="\\ud83c[\\udffb-\\udfff]",px="(?:".concat(Vu,"|").concat(Wu,")"),Hg="[^".concat(zh,"]"),Gg="(?:\\ud83c[\\udde6-\\uddff]){2}",Vg="[\\ud800-\\udbff][\\udc00-\\udfff]",Wg="\\u200d",Xg="".concat(px,"?"),qg="[".concat(zg,"]?"),mx="(?:"+Wg+"(?:"+[Hg,Gg,Vg].join("|")+")"+qg+Xg+")*",gx=qg+Xg+mx,_x="(?:".concat(["".concat(Hg).concat(Vu,"?"),Vu,Gg,Vg,dx].join("|"),`
)`),vx=RegExp("".concat(Wu,"(?=").concat(Wu,")|").concat(_x).concat(gx),"g"),xx=[Wg,zh,Bg,kg,zg],yx=RegExp("[".concat(xx.join(""),"]"));function Sx(r){return r.split("")}function Yg(r){return yx.test(r)}function Mx(r){return r.match(vx)||[]}function Ex(r){return Yg(r)?Mx(r):Sx(r)}function Tx(r){return r==null?"":String(r)}function bx(r){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"";return r=Tx(r),r&&ba(r)&&!e&&Yg(r)?Ex(r):r.split(e)}function Xu(r,e){var t=document.createElement(r);return e&&Object.keys(e).forEach(function(n){var i=e[n],s=ba(i)?i.trim():i;s===null||s===""||(n==="children"?t.append.apply(t,Sn(gs(s))):t.setAttribute(n,s))}),t}var Hh={splitClass:"",lineClass:"line",wordClass:"word",charClass:"char",types:["lines","words","chars"],absolute:!1,tagName:"div"};function Ax(r,e){e=Kr(Hh,e);var t=kh(e.types),n=e.tagName,i=r.nodeValue,s=document.createDocumentFragment(),o=[],a=[];return/^\s/.test(i)&&s.append(" "),o=fx(i).reduce(function(l,c,u,h){var f,d;return t.chars&&(d=bx(c).map(function(g){var _=Xu(n,{class:"".concat(e.splitClass," ").concat(e.charClass),style:"display: inline-block;",children:g});return Mi(_,"isChar",!0),a=[].concat(Sn(a),[_]),_})),t.words||t.lines?(f=Xu(n,{class:"".concat(e.wordClass," ").concat(e.splitClass),style:"display: inline-block; ".concat(t.words&&e.absolute?"position: relative;":""),children:t.chars?d:c}),Mi(f,{isWord:!0,isWordStart:!0,isWordEnd:!0}),s.appendChild(f)):d.forEach(function(g){s.appendChild(g)}),u<h.length-1&&s.append(" "),t.words?l.concat(f):l},[]),/\s$/.test(i)&&s.append(" "),r.replaceWith(s),{words:o,chars:a}}function jg(r,e){var t=r.nodeType,n={words:[],chars:[]};if(!/(1|3|11)/.test(t))return n;if(t===3&&/\S/.test(r.nodeValue))return Ax(r,e);var i=gs(r.childNodes);if(i.length&&(Mi(r,"isSplit",!0),!Zr(r).isRoot)){r.style.display="inline-block",r.style.position="relative";var s=r.nextSibling,o=r.previousSibling,a=r.textContent||"",l=s?s.textContent:" ",c=o?o.textContent:" ";Mi(r,{isWordEnd:/\s$/.test(a)||/^\s/.test(l),isWordStart:/^\s/.test(a)||/\s$/.test(c)})}return i.reduce(function(u,h){var f=jg(h,e),d=f.words,g=f.chars;return{words:[].concat(Sn(u.words),Sn(d)),chars:[].concat(Sn(u.chars),Sn(g))}},n)}function wx(r,e,t,n){if(!t.absolute)return{top:e?r.offsetTop:null};var i=r.offsetParent,s=Ng(n,2),o=s[0],a=s[1],l=0,c=0;if(i&&i!==document.body){var u=i.getBoundingClientRect();l=u.x+o,c=u.y+a}var h=r.getBoundingClientRect(),f=h.width,d=h.height,g=h.x,_=h.y,p=_+a-c,m=g+o-l;return{width:f,height:d,top:p,left:m}}function $g(r){Zr(r).isWord?(Fg(r),r.replaceWith.apply(r,Sn(r.childNodes))):gs(r.children).forEach(function(e){return $g(e)})}var Rx=function(){return document.createDocumentFragment()};function Cx(r,e,t){var n=kh(e.types),i=e.tagName,s=r.getElementsByTagName("*"),o=[],a=[],l=null,c,u,h,f=[],d=r.parentElement,g=r.nextElementSibling,_=Rx(),p=window.getComputedStyle(r),m=p.textAlign,S=parseFloat(p.fontSize),y=S*.2;return e.absolute&&(h={left:r.offsetLeft,top:r.offsetTop,width:r.offsetWidth},u=r.offsetWidth,c=r.offsetHeight,Mi(r,{cssWidth:r.style.width,cssHeight:r.style.height})),gs(s).forEach(function(x){var T=x.parentElement===r,b=wx(x,T,e,t),M=b.width,I=b.height,O=b.top,v=b.left;/^br$/i.test(x.nodeName)||(n.lines&&T&&((l===null||O-l>=y)&&(l=O,o.push(a=[])),a.push(x)),e.absolute&&Mi(x,{top:O,left:v,width:M,height:I}))}),d&&d.removeChild(r),n.lines&&(f=o.map(function(x){var T=Xu(i,{class:"".concat(e.splitClass," ").concat(e.lineClass),style:"display: block; text-align: ".concat(m,"; width: 100%;")});Mi(T,"isLine",!0);var b={height:0,top:1e4};return _.appendChild(T),x.forEach(function(M,I,O){var v=Zr(M),R=v.isWordEnd,N=v.top,$=v.height,D=O[I+1];b.height=Math.max(b.height,$),b.top=Math.min(b.top,N),T.appendChild(M),R&&Zr(D).isWordStart&&T.append(" ")}),e.absolute&&Mi(T,{height:b.height,top:b.top}),T}),n.words||$g(_),r.replaceChildren(_)),e.absolute&&(r.style.width="".concat(r.style.width||u,"px"),r.style.height="".concat(c,"px"),gs(s).forEach(function(x){var T=Zr(x),b=T.isLine,M=T.top,I=T.left,O=T.width,v=T.height,R=Zr(x.parentElement),N=!b&&R.isLine;x.style.top="".concat(N?M-R.top:M,"px"),x.style.left=b?"".concat(h.left,"px"):"".concat(I-(N?h.left:0),"px"),x.style.height="".concat(v,"px"),x.style.width=b?"".concat(h.width,"px"):"".concat(O,"px"),x.style.position="absolute"})),d&&(g?d.insertBefore(r,g):d.appendChild(r)),f}var Ts=Kr(Hh,{}),Gh=function(){Yf(r,null,[{key:"clearData",value:function(){ux()}},{key:"setDefaults",value:function(t){return Ts=Kr(Ts,Ga(t)),Hh}},{key:"revert",value:function(t){Kf(t).forEach(function(n){var i=Zr(n),s=i.isSplit,o=i.html,a=i.cssWidth,l=i.cssHeight;s&&(n.innerHTML=o,n.style.width=a||"",n.style.height=l||"",Fg(n))})}},{key:"create",value:function(t,n){return new r(t,n)}},{key:"data",get:function(){return hi}},{key:"defaults",get:function(){return Ts},set:function(t){Ts=Kr(Ts,Ga(t))}}]);function r(e,t){Zv(this,r),this.isSplit=!1,this.settings=Kr(Ts,Ga(t)),this.elements=Kf(e),this.split()}return Yf(r,[{key:"split",value:function(t){var n=this;this.revert(),this.elements.forEach(function(o){Mi(o,"html",o.innerHTML)}),this.lines=[],this.words=[],this.chars=[];var i=[window.pageXOffset,window.pageYOffset];t!==void 0&&(this.settings=Kr(this.settings,Ga(t)));var s=kh(this.settings.types);s.none||(this.elements.forEach(function(o){Mi(o,"isRoot",!0);var a=jg(o,n.settings),l=a.words,c=a.chars;n.words=[].concat(Sn(n.words),Sn(l)),n.chars=[].concat(Sn(n.chars),Sn(c))}),this.elements.forEach(function(o){if(s.lines||n.settings.absolute){var a=Cx(o,n.settings,i);n.lines=[].concat(Sn(n.lines),Sn(a))}}),this.isSplit=!0,window.scrollTo(i[0],i[1]),hx())}},{key:"revert",value:function(){this.isSplit&&(this.lines=null,this.words=null,this.chars=null,this.isSplit=!1),r.revert(this.elements)}}]),r}();function qu(){return qu=Object.assign?Object.assign.bind():function(r){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(r[n]=t[n])}return r},qu.apply(this,arguments)}function Vl(r,e,t){return Math.max(r,Math.min(e,t))}let Px=class{advance(e){var t;if(!this.isRunning)return;let n=!1;if(this.lerp)this.value=(i=this.value,s=this.to,(1-(o=1-Math.exp(-60*this.lerp*e)))*i+o*s),Math.round(this.value)===this.to&&(this.value=this.to,n=!0);else{this.currentTime+=e;const a=Vl(0,this.currentTime/this.duration,1);n=a>=1;const l=n?1:this.easing(a);this.value=this.from+(this.to-this.from)*l}var i,s,o;(t=this.onUpdate)==null||t.call(this,this.value,n),n&&this.stop()}stop(){this.isRunning=!1}fromTo(e,t,{lerp:n=.1,duration:i=1,easing:s=l=>l,onStart:o,onUpdate:a}){this.from=this.value=e,this.to=t,this.lerp=n,this.duration=i,this.easing=s,this.currentTime=0,this.isRunning=!0,o==null||o(),this.onUpdate=a}},Lx=class{constructor({wrapper:e,content:t,autoResize:n=!0}={}){if(this.resize=()=>{this.onWrapperResize(),this.onContentResize()},this.onWrapperResize=()=>{this.wrapper===window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)},this.onContentResize=()=>{this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth},this.wrapper=e,this.content=t,n){const i=function(s,o){let a;return function(){let l=arguments,c=this;clearTimeout(a),a=setTimeout(function(){s.apply(c,l)},250)}}(this.resize);this.wrapper!==window&&(this.wrapperResizeObserver=new ResizeObserver(i),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(i),this.contentResizeObserver.observe(this.content)}this.resize()}destroy(){var e,t;(e=this.wrapperResizeObserver)==null||e.disconnect(),(t=this.contentResizeObserver)==null||t.disconnect()}get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},Kg=class{constructor(){this.events={}}emit(e,...t){let n=this.events[e]||[];for(let i=0,s=n.length;i<s;i++)n[i](...t)}on(e,t){var n;return(n=this.events[e])!=null&&n.push(t)||(this.events[e]=[t]),()=>{var i;this.events[e]=(i=this.events[e])==null?void 0:i.filter(s=>t!==s)}}off(e,t){var n;this.events[e]=(n=this.events[e])==null?void 0:n.filter(i=>t!==i)}destroy(){this.events={}}},Dx=class{constructor(e,{wheelMultiplier:t=1,touchMultiplier:n=2,normalizeWheel:i=!1}){this.onTouchStart=s=>{const{clientX:o,clientY:a}=s.targetTouches?s.targetTouches[0]:s;this.touchStart.x=o,this.touchStart.y=a,this.lastDelta={x:0,y:0}},this.onTouchMove=s=>{const{clientX:o,clientY:a}=s.targetTouches?s.targetTouches[0]:s,l=-(o-this.touchStart.x)*this.touchMultiplier,c=-(a-this.touchStart.y)*this.touchMultiplier;this.touchStart.x=o,this.touchStart.y=a,this.lastDelta={x:l,y:c},this.emitter.emit("scroll",{deltaX:l,deltaY:c,event:s})},this.onTouchEnd=s=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:s})},this.onWheel=s=>{let{deltaX:o,deltaY:a}=s;this.normalizeWheel&&(o=Vl(-100,o,100),a=Vl(-100,a,100)),o*=this.wheelMultiplier,a*=this.wheelMultiplier,this.emitter.emit("scroll",{deltaX:o,deltaY:a,event:s})},this.element=e,this.wheelMultiplier=t,this.touchMultiplier=n,this.normalizeWheel=i,this.touchStart={x:null,y:null},this.emitter=new Kg,this.element.addEventListener("wheel",this.onWheel,{passive:!1}),this.element.addEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.addEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.addEventListener("touchend",this.onTouchEnd,{passive:!1})}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),this.element.removeEventListener("wheel",this.onWheel,{passive:!1}),this.element.removeEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.removeEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.removeEventListener("touchend",this.onTouchEnd,{passive:!1})}},Ix=class{constructor({wrapper:e=window,content:t=document.documentElement,wheelEventsTarget:n=e,eventsTarget:i=n,smoothWheel:s=!0,smoothTouch:o=!1,syncTouch:a=!1,syncTouchLerp:l=.1,__iosNoInertiaSyncTouchLerp:c=.4,touchInertiaMultiplier:u=35,duration:h,easing:f=T=>Math.min(1,1.001-Math.pow(2,-10*T)),lerp:d=!h&&.1,infinite:g=!1,orientation:_="vertical",gestureOrientation:p="vertical",touchMultiplier:m=1,wheelMultiplier:S=1,normalizeWheel:y=!1,autoResize:x=!0}={}){this.onVirtualScroll=({deltaX:T,deltaY:b,event:M})=>{if(M.ctrlKey)return;const I=M.type.includes("touch"),O=M.type.includes("wheel");if(this.options.gestureOrientation==="both"&&T===0&&b===0||this.options.gestureOrientation==="vertical"&&b===0||this.options.gestureOrientation==="horizontal"&&T===0||I&&this.options.gestureOrientation==="vertical"&&this.scroll===0&&!this.options.infinite&&b<=0)return;let v=M.composedPath();if(v=v.slice(0,v.indexOf(this.rootElement)),v.find(D=>{var H;return(D.hasAttribute==null?void 0:D.hasAttribute("data-lenis-prevent"))||I&&(D.hasAttribute==null?void 0:D.hasAttribute("data-lenis-prevent-touch"))||O&&(D.hasAttribute==null?void 0:D.hasAttribute("data-lenis-prevent-wheel"))||((H=D.classList)==null?void 0:H.contains("lenis"))}))return;if(this.isStopped||this.isLocked)return void M.preventDefault();if(this.isSmooth=(this.options.smoothTouch||this.options.syncTouch)&&I||this.options.smoothWheel&&O,!this.isSmooth)return this.isScrolling=!1,void this.animate.stop();M.preventDefault();let R=b;this.options.gestureOrientation==="both"?R=Math.abs(b)>Math.abs(T)?b:T:this.options.gestureOrientation==="horizontal"&&(R=T);const N=I&&this.options.syncTouch,$=I&&M.type==="touchend"&&Math.abs(R)>1;$&&(R=this.velocity*this.options.touchInertiaMultiplier),this.scrollTo(this.targetScroll+R,qu({programmatic:!1},N&&{lerp:$?this.syncTouchLerp:this.options.__iosNoInertiaSyncTouchLerp}))},this.onNativeScroll=()=>{if(!this.__preventNextScrollEvent&&!this.isScrolling){const T=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.velocity=0,this.direction=Math.sign(this.animatedScroll-T),this.emit()}},window.lenisVersion="1.0.29",e!==document.documentElement&&e!==document.body||(e=window),this.options={wrapper:e,content:t,wheelEventsTarget:n,eventsTarget:i,smoothWheel:s,smoothTouch:o,syncTouch:a,syncTouchLerp:l,__iosNoInertiaSyncTouchLerp:c,touchInertiaMultiplier:u,duration:h,easing:f,lerp:d,infinite:g,gestureOrientation:p,orientation:_,touchMultiplier:m,wheelMultiplier:S,normalizeWheel:y,autoResize:x},this.animate=new Px,this.emitter=new Kg,this.dimensions=new Lx({wrapper:e,content:t,autoResize:x}),this.toggleClass("lenis",!0),this.velocity=0,this.isLocked=!1,this.isStopped=!1,this.isSmooth=a||s||o,this.isScrolling=!1,this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll,{passive:!1}),this.virtualScroll=new Dx(i,{touchMultiplier:m,wheelMultiplier:S,normalizeWheel:y}),this.virtualScroll.on("scroll",this.onVirtualScroll)}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll,{passive:!1}),this.virtualScroll.destroy(),this.dimensions.destroy(),this.toggleClass("lenis",!1),this.toggleClass("lenis-smooth",!1),this.toggleClass("lenis-scrolling",!1),this.toggleClass("lenis-stopped",!1),this.toggleClass("lenis-locked",!1)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}setScroll(e){this.isHorizontal?this.rootElement.scrollLeft=e:this.rootElement.scrollTop=e}resize(){this.dimensions.resize()}emit(){this.emitter.emit("scroll",this)}reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.velocity=0,this.animate.stop()}start(){this.isStopped=!1,this.reset()}stop(){this.isStopped=!0,this.animate.stop(),this.reset()}raf(e){const t=e-(this.time||e);this.time=e,this.animate.advance(.001*t)}scrollTo(e,{offset:t=0,immediate:n=!1,lock:i=!1,duration:s=this.options.duration,easing:o=this.options.easing,lerp:a=!s&&this.options.lerp,onComplete:l=null,force:c=!1,programmatic:u=!0}={}){if(!this.isStopped&&!this.isLocked||c){if(["top","left","start"].includes(e))e=0;else if(["bottom","right","end"].includes(e))e=this.limit;else{var h;let f;if(typeof e=="string"?f=document.querySelector(e):(h=e)!=null&&h.nodeType&&(f=e),f){if(this.options.wrapper!==window){const g=this.options.wrapper.getBoundingClientRect();t-=this.isHorizontal?g.left:g.top}const d=f.getBoundingClientRect();e=(this.isHorizontal?d.left:d.top)+this.animatedScroll}}if(typeof e=="number"){if(e+=t,e=Math.round(e),this.options.infinite?u&&(this.targetScroll=this.animatedScroll=this.scroll):e=Vl(0,e,this.limit),n)return this.animatedScroll=this.targetScroll=e,this.setScroll(this.scroll),this.reset(),void(l==null||l(this));if(!u){if(e===this.targetScroll)return;this.targetScroll=e}this.animate.fromTo(this.animatedScroll,e,{duration:s,easing:o,lerp:a,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling=!0},onUpdate:(f,d)=>{this.isScrolling=!0,this.velocity=f-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=f,this.setScroll(this.scroll),u&&(this.targetScroll=f),d||this.emit(),d&&(this.reset(),this.emit(),l==null||l(this),this.__preventNextScrollEvent=!0,requestAnimationFrame(()=>{delete this.__preventNextScrollEvent}))}})}}}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){return this.isHorizontal?this.rootElement.scrollLeft:this.rootElement.scrollTop}get scroll(){return this.options.infinite?(this.animatedScroll%(e=this.limit)+e)%e:this.animatedScroll;var e}get progress(){return this.limit===0?1:this.scroll/this.limit}get isSmooth(){return this.__isSmooth}set isSmooth(e){this.__isSmooth!==e&&(this.__isSmooth=e,this.toggleClass("lenis-smooth",e))}get isScrolling(){return this.__isScrolling}set isScrolling(e){this.__isScrolling!==e&&(this.__isScrolling=e,this.toggleClass("lenis-scrolling",e))}get isStopped(){return this.__isStopped}set isStopped(e){this.__isStopped!==e&&(this.__isStopped=e,this.toggleClass("lenis-stopped",e))}get isLocked(){return this.__isLocked}set isLocked(e){this.__isLocked!==e&&(this.__isLocked=e,this.toggleClass("lenis-locked",e))}get className(){let e="lenis";return this.isStopped&&(e+=" lenis-stopped"),this.isLocked&&(e+=" lenis-locked"),this.isScrolling&&(e+=" lenis-scrolling"),this.isSmooth&&(e+=" lenis-smooth"),e}toggleClass(e,t){this.rootElement.classList.toggle(e,t),this.emitter.emit("className change",this)}};function Yu(){return Yu=Object.assign?Object.assign.bind():function(r){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(r[n]=t[n])}return r},Yu.apply(this,arguments)}class Zf{constructor({scrollElements:e,rootMargin:t="-1px -1px -1px -1px",IORaf:n}){this.scrollElements=void 0,this.rootMargin=void 0,this.IORaf=void 0,this.observer=void 0,this.scrollElements=e,this.rootMargin=t,this.IORaf=n,this._init()}_init(){this.observer=new IntersectionObserver(e=>{e.forEach(t=>{const n=this.scrollElements.find(i=>i.$el===t.target);t.isIntersecting?(n&&(n.isAlreadyIntersected=!0),this._setInview(t)):n&&n.isAlreadyIntersected&&this._setOutOfView(t)})},{rootMargin:this.rootMargin});for(const e of this.scrollElements)this.observe(e.$el)}destroy(){this.observer.disconnect()}observe(e){e&&this.observer.observe(e)}unobserve(e){e&&this.observer.unobserve(e)}_setInview(e){const t=this.scrollElements.find(n=>n.$el===e.target);this.IORaf&&(t==null||t.setInteractivityOn()),!this.IORaf&&(t==null||t.setInview())}_setOutOfView(e){const t=this.scrollElements.find(n=>n.$el===e.target);this.IORaf&&(t==null||t.setInteractivityOff()),!this.IORaf&&(t==null||t.setOutOfView()),t!=null&&t.attributes.scrollRepeat||this.IORaf||this.unobserve(e.target)}}function Jf(r,e,t,n,i){return t+((i-r)/(e-r)*(n-t)||0)}function Qf(r,e){return r.reduce((t,n)=>Math.abs(n-e)<Math.abs(t-e)?n:t)}class Ox{constructor({$el:e,id:t,modularInstance:n,subscribeElementUpdateFn:i,unsubscribeElementUpdateFn:s,needRaf:o,scrollOrientation:a}){var l,c,u,h,f;this.$el=void 0,this.id=void 0,this.needRaf=void 0,this.attributes=void 0,this.scrollOrientation=void 0,this.isAlreadyIntersected=void 0,this.intersection=void 0,this.metrics=void 0,this.currentScroll=void 0,this.translateValue=void 0,this.progress=void 0,this.lastProgress=void 0,this.modularInstance=void 0,this.progressModularModules=void 0,this.isInview=void 0,this.isInteractive=void 0,this.isInFold=void 0,this.isFirstResize=void 0,this.subscribeElementUpdateFn=void 0,this.unsubscribeElementUpdateFn=void 0,this.$el=e,this.id=t,this.needRaf=o,this.scrollOrientation=a,this.modularInstance=n,this.subscribeElementUpdateFn=i,this.unsubscribeElementUpdateFn=s,this.attributes={scrollClass:(l=this.$el.dataset.scrollClass)!=null?l:"is-inview",scrollOffset:(c=this.$el.dataset.scrollOffset)!=null?c:"0,0",scrollPosition:(u=this.$el.dataset.scrollPosition)!=null?u:"start,end",scrollModuleProgress:this.$el.dataset.scrollModuleProgress!=null,scrollCssProgress:this.$el.dataset.scrollCssProgress!=null,scrollEventProgress:(h=this.$el.dataset.scrollEventProgress)!=null?h:null,scrollSpeed:this.$el.dataset.scrollSpeed!=null?parseFloat(this.$el.dataset.scrollSpeed):null,scrollRepeat:this.$el.dataset.scrollRepeat!=null,scrollCall:(f=this.$el.dataset.scrollCall)!=null?f:null,scrollCallSelf:this.$el.dataset.scrollCallSelf!=null,scrollIgnoreFold:this.$el.dataset.scrollIgnoreFold!=null,scrollEnableTouchSpeed:this.$el.dataset.scrollEnableTouchSpeed!=null},this.intersection={start:0,end:0},this.metrics={offsetStart:0,offsetEnd:0,bcr:{}},this.currentScroll=this.scrollOrientation==="vertical"?window.scrollY:window.scrollX,this.translateValue=0,this.progress=0,this.lastProgress=null,this.progressModularModules=[],this.isInview=!1,this.isInteractive=!1,this.isAlreadyIntersected=!1,this.isInFold=!1,this.isFirstResize=!0,this._init()}_init(){this.needRaf&&(this.modularInstance&&this.attributes.scrollModuleProgress&&this._getProgressModularModules(),this._resize())}onResize({currentScroll:e}){this.currentScroll=e,this._resize()}onRender({currentScroll:e,smooth:t}){const n=this.scrollOrientation==="vertical"?window.innerHeight:window.innerWidth;if(this.currentScroll=e,this._computeProgress(),this.attributes.scrollSpeed&&!isNaN(this.attributes.scrollSpeed))if(this.attributes.scrollEnableTouchSpeed||t){if(this.isInFold){const i=Math.max(0,this.progress);this.translateValue=i*n*this.attributes.scrollSpeed*-1}else{const i=Jf(0,1,-1,1,this.progress);this.translateValue=i*n*this.attributes.scrollSpeed*-1}this.$el.style.transform=this.scrollOrientation==="vertical"?`translate3d(0, ${this.translateValue}px, 0)`:`translate3d(${this.translateValue}px, 0, 0)`}else this.translateValue&&(this.$el.style.transform="translate3d(0, 0, 0)"),this.translateValue=0}setInview(){if(this.isInview)return;this.isInview=!0,this.$el.classList.add(this.attributes.scrollClass);const e=this._getScrollCallFrom();this.attributes.scrollCall&&this._dispatchCall("enter",e)}setOutOfView(){if(!this.isInview||!this.attributes.scrollRepeat)return;this.isInview=!1,this.$el.classList.remove(this.attributes.scrollClass);const e=this._getScrollCallFrom();this.attributes.scrollCall&&this._dispatchCall("leave",e)}setInteractivityOn(){this.isInteractive||(this.isInteractive=!0,this.subscribeElementUpdateFn(this))}setInteractivityOff(){this.isInteractive&&(this.isInteractive=!1,this.unsubscribeElementUpdateFn(this),this.lastProgress!=null&&this._computeProgress(Qf([0,1],this.lastProgress)))}_resize(){this.metrics.bcr=this.$el.getBoundingClientRect(),this._computeMetrics(),this._computeIntersection(),this.isFirstResize&&(this.isFirstResize=!1,this.isInFold&&this.setInview())}_computeMetrics(){const{top:e,left:t,height:n,width:i}=this.metrics.bcr,s=this.scrollOrientation==="vertical"?window.innerHeight:window.innerWidth,o=this.scrollOrientation==="vertical"?n:i;this.metrics.offsetStart=this.currentScroll+(this.scrollOrientation==="vertical"?e:t)-this.translateValue,this.metrics.offsetEnd=this.metrics.offsetStart+o,this.isInFold=this.metrics.offsetStart<s&&!this.attributes.scrollIgnoreFold}_computeIntersection(){const e=this.scrollOrientation==="vertical"?window.innerHeight:window.innerWidth,t=this.scrollOrientation==="vertical"?this.metrics.bcr.height:this.metrics.bcr.width,n=this.attributes.scrollOffset.split(","),i=n[0]!=null?n[0].trim():"0",s=n[1]!=null?n[1].trim():"0",o=this.attributes.scrollPosition.split(",");let a=o[0]!=null?o[0].trim():"start";const l=o[1]!=null?o[1].trim():"end",c=i.includes("%")?e*parseInt(i.replace("%","").trim())*.01:parseInt(i),u=s.includes("%")?e*parseInt(s.replace("%","").trim())*.01:parseInt(s);switch(this.isInFold&&(a="fold"),a){case"start":default:this.intersection.start=this.metrics.offsetStart-e+c;break;case"middle":this.intersection.start=this.metrics.offsetStart-e+c+.5*t;break;case"end":this.intersection.start=this.metrics.offsetStart-e+c+t;break;case"fold":this.intersection.start=0}switch(l){case"start":this.intersection.end=this.metrics.offsetStart-u;break;case"middle":this.intersection.end=this.metrics.offsetStart-u+.5*t;break;default:this.intersection.end=this.metrics.offsetStart-u+t}if(this.intersection.end<=this.intersection.start)switch(l){case"start":default:this.intersection.end=this.intersection.start+1;break;case"middle":this.intersection.end=this.intersection.start+.5*t;break;case"end":this.intersection.end=this.intersection.start+t}}_computeProgress(e){const t=e??((n=Jf(this.intersection.start,this.intersection.end,0,1,this.currentScroll))<0?0:n>1?1:n);var n;if(this.progress=t,t!=this.lastProgress){if(this.lastProgress=t,this.attributes.scrollCssProgress&&this._setCssProgress(t),this.attributes.scrollEventProgress&&this._setCustomEventProgress(t),this.attributes.scrollModuleProgress)for(const i of this.progressModularModules)this.modularInstance&&this.modularInstance.call("onScrollProgress",t,i.moduleName,i.moduleId);t>0&&t<1&&this.setInview(),t===0&&this.setOutOfView(),t===1&&this.setOutOfView()}}_setCssProgress(e=0){this.$el.style.setProperty("--progress",e.toString())}_setCustomEventProgress(e=0){const t=this.attributes.scrollEventProgress;if(!t)return;const n=new CustomEvent(t,{detail:{target:this.$el,progress:e}});window.dispatchEvent(n)}_getProgressModularModules(){if(!this.modularInstance)return;const e=Object.keys(this.$el.dataset).filter(n=>n.includes("module")),t=Object.entries(this.modularInstance.modules);if(e.length)for(const n of e){const i=this.$el.dataset[n];if(!i)return;for(const s of t){const[o,a]=s;i in a&&this.progressModularModules.push({moduleName:o,moduleId:i})}}}_getScrollCallFrom(){const e=Qf([this.intersection.start,this.intersection.end],this.currentScroll);return this.intersection.start===e?"start":"end"}_dispatchCall(e,t){var n,i;const s=(n=this.attributes.scrollCall)==null?void 0:n.split(","),o=(i=this.attributes)==null?void 0:i.scrollCallSelf;if(s&&s.length>1){var a;const[l,c,u]=s;let h;h=o?this.$el.dataset[`module${c.trim()}`]:u,this.modularInstance&&this.modularInstance.call(l.trim(),{target:this.$el,way:e,from:t},c.trim(),(a=h)==null?void 0:a.trim())}else if(s){const[l]=s,c=new CustomEvent(l,{detail:{target:this.$el,way:e,from:t}});window.dispatchEvent(c)}}}const Nx=["scrollOffset","scrollPosition","scrollModuleProgress","scrollCssProgress","scrollEventProgress","scrollSpeed"];class Ux{constructor({$el:e,modularInstance:t,triggerRootMargin:n,rafRootMargin:i,scrollOrientation:s}){this.$scrollContainer=void 0,this.modularInstance=void 0,this.triggerRootMargin=void 0,this.rafRootMargin=void 0,this.scrollElements=void 0,this.triggeredScrollElements=void 0,this.RAFScrollElements=void 0,this.scrollElementsToUpdate=void 0,this.IOTriggerInstance=void 0,this.IORafInstance=void 0,this.scrollOrientation=void 0,e?(this.$scrollContainer=e,this.modularInstance=t,this.scrollOrientation=s,this.triggerRootMargin=n??"-1px -1px -1px -1px",this.rafRootMargin=i??"100% 100% 100% 100%",this.scrollElements=[],this.triggeredScrollElements=[],this.RAFScrollElements=[],this.scrollElementsToUpdate=[],this._init()):console.error("Please provide a DOM Element as scrollContainer")}_init(){const e=this.$scrollContainer.querySelectorAll("[data-scroll]"),t=Array.from(e);this._subscribeScrollElements(t),this.IOTriggerInstance=new Zf({scrollElements:[...this.triggeredScrollElements],rootMargin:this.triggerRootMargin,IORaf:!1}),this.IORafInstance=new Zf({scrollElements:[...this.RAFScrollElements],rootMargin:this.rafRootMargin,IORaf:!0})}destroy(){this.IOTriggerInstance.destroy(),this.IORafInstance.destroy(),this._unsubscribeAllScrollElements()}onResize({currentScroll:e}){for(const t of this.RAFScrollElements)t.onResize({currentScroll:e})}onRender({currentScroll:e,smooth:t}){for(const n of this.scrollElementsToUpdate)n.onRender({currentScroll:e,smooth:t})}removeScrollElements(e){const t=e.querySelectorAll("[data-scroll]");if(t.length){for(let n=0;n<this.triggeredScrollElements.length;n++){const i=this.triggeredScrollElements[n];Array.from(t).indexOf(i.$el)>-1&&(this.IOTriggerInstance.unobserve(i.$el),this.triggeredScrollElements.splice(n,1))}for(let n=0;n<this.RAFScrollElements.length;n++){const i=this.RAFScrollElements[n];Array.from(t).indexOf(i.$el)>-1&&(this.IORafInstance.unobserve(i.$el),this.RAFScrollElements.splice(n,1))}t.forEach(n=>{const i=this.scrollElementsToUpdate.find(o=>o.$el===n),s=this.scrollElements.find(o=>o.$el===n);i&&this._unsubscribeElementUpdate(i),s&&(this.scrollElements=this.scrollElements.filter(o=>o.id!=s.id))})}}addScrollElements(e){const t=e.querySelectorAll("[data-scroll]"),n=[];this.scrollElements.forEach(o=>{n.push(o.id)});const i=Math.max(...n)+1,s=Array.from(t);this._subscribeScrollElements(s,i,!0)}_subscribeScrollElements(e,t=0,n=!1){for(let i=0;i<e.length;i++){const s=e[i],o=this._checkRafNeeded(s),a=new Ox({$el:s,id:t+i,scrollOrientation:this.scrollOrientation,modularInstance:this.modularInstance,subscribeElementUpdateFn:this._subscribeElementUpdate.bind(this),unsubscribeElementUpdateFn:this._unsubscribeElementUpdate.bind(this),needRaf:o});this.scrollElements.push(a),o?(this.RAFScrollElements.push(a),n&&(this.IORafInstance.scrollElements.push(a),this.IORafInstance.observe(a.$el))):(this.triggeredScrollElements.push(a),n&&(this.IOTriggerInstance.scrollElements.push(a),this.IOTriggerInstance.observe(a.$el)))}}_unsubscribeAllScrollElements(){this.scrollElements=[],this.RAFScrollElements=[],this.triggeredScrollElements=[],this.scrollElementsToUpdate=[]}_subscribeElementUpdate(e){this.scrollElementsToUpdate.push(e)}_unsubscribeElementUpdate(e){this.scrollElementsToUpdate=this.scrollElementsToUpdate.filter(t=>t.id!=e.id)}_checkRafNeeded(e){let t=[...Nx];const n=i=>{t=t.filter(s=>s!=i)};if(e.dataset.scrollOffset){if(e.dataset.scrollOffset.split(",").map(i=>i.replace("%","").trim()).join(",")!="0,0")return!0;n("scrollOffset")}else n("scrollOffset");if(e.dataset.scrollPosition){if(e.dataset.scrollPosition.trim()!="top,bottom")return!0;n("scrollPosition")}else n("scrollPosition");if(e.dataset.scrollSpeed&&!isNaN(parseFloat(e.dataset.scrollSpeed)))return!0;n("scrollSpeed");for(const i of t)if(i in e.dataset)return!0;return!1}}class Fx{constructor({resizeElements:e,resizeCallback:t=()=>{}}){this.$resizeElements=void 0,this.isFirstObserve=void 0,this.observer=void 0,this.resizeCallback=void 0,this.$resizeElements=e,this.resizeCallback=t,this.isFirstObserve=!0,this._init()}_init(){this.observer=new ResizeObserver(e=>{var t;!this.isFirstObserve&&((t=this.resizeCallback)==null||t.call(this)),this.isFirstObserve=!1});for(const e of this.$resizeElements)this.observer.observe(e)}destroy(){this.observer.disconnect()}}const ed={wrapper:window,content:document.documentElement,eventsTarget:window,lerp:.1,duration:.75,orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,smoothTouch:!1,syncTouch:!1,syncTouchLerp:.1,touchInertiaMultiplier:35,wheelMultiplier:1,touchMultiplier:2,normalizeWheel:!1,autoResize:!0,easing:r=>Math.min(1,1.001-Math.pow(2,-10*r))};class Bx{constructor({lenisOptions:e={},modularInstance:t,triggerRootMargin:n,rafRootMargin:i,autoResize:s=!0,autoStart:o=!0,scrollCallback:a=()=>{},initCustomTicker:l,destroyCustomTicker:c}={}){this.rafPlaying=void 0,this.lenisInstance=void 0,this.coreInstance=void 0,this.lenisOptions=void 0,this.modularInstance=void 0,this.triggerRootMargin=void 0,this.rafRootMargin=void 0,this.rafInstance=void 0,this.autoResize=void 0,this.autoStart=void 0,this.ROInstance=void 0,this.initCustomTicker=void 0,this.destroyCustomTicker=void 0,this._onRenderBind=void 0,this._onResizeBind=void 0,this._onScrollToBind=void 0,this.lenisOptions=Yu({},ed,e),Object.assign(this,{lenisOptions:e,modularInstance:t,triggerRootMargin:n,rafRootMargin:i,autoResize:s,autoStart:o,scrollCallback:a,initCustomTicker:l,destroyCustomTicker:c}),this._onRenderBind=this._onRender.bind(this),this._onScrollToBind=this._onScrollTo.bind(this),this._onResizeBind=this._onResize.bind(this),this.rafPlaying=!1,this._init()}_init(){var e;this.lenisInstance=new Ix({wrapper:this.lenisOptions.wrapper,content:this.lenisOptions.content,eventsTarget:this.lenisOptions.eventsTarget,lerp:this.lenisOptions.lerp,duration:this.lenisOptions.duration,orientation:this.lenisOptions.orientation,gestureOrientation:this.lenisOptions.gestureOrientation,smoothWheel:this.lenisOptions.smoothWheel,smoothTouch:this.lenisOptions.smoothTouch,syncTouch:this.lenisOptions.syncTouch,syncTouchLerp:this.lenisOptions.syncTouchLerp,touchInertiaMultiplier:this.lenisOptions.touchInertiaMultiplier,wheelMultiplier:this.lenisOptions.wheelMultiplier,touchMultiplier:this.lenisOptions.touchMultiplier,normalizeWheel:this.lenisOptions.normalizeWheel,easing:this.lenisOptions.easing}),(e=this.lenisInstance)==null||e.on("scroll",this.scrollCallback),document.documentElement.setAttribute("data-scroll-orientation",this.lenisInstance.options.orientation),requestAnimationFrame(()=>{this.coreInstance=new Ux({$el:this.lenisInstance.rootElement,modularInstance:this.modularInstance,triggerRootMargin:this.triggerRootMargin,rafRootMargin:this.rafRootMargin,scrollOrientation:this.lenisInstance.options.orientation}),this._bindEvents(),this.initCustomTicker&&!this.destroyCustomTicker?console.warn("initCustomTicker callback is declared, but destroyCustomTicker is not. Please pay attention. It could cause trouble."):!this.initCustomTicker&&this.destroyCustomTicker&&console.warn("destroyCustomTicker callback is declared, but initCustomTicker is not. Please pay attention. It could cause trouble."),this.autoStart&&this.start()})}destroy(){var e;this.stop(),this._unbindEvents(),this.lenisInstance.destroy(),(e=this.coreInstance)==null||e.destroy(),requestAnimationFrame(()=>{var t;(t=this.coreInstance)==null||t.destroy()})}_bindEvents(){this._bindScrollToEvents(),this.autoResize&&("ResizeObserver"in window?this.ROInstance=new Fx({resizeElements:[document.body],resizeCallback:this._onResizeBind}):window.addEventListener("resize",this._onResizeBind))}_unbindEvents(){this._unbindScrollToEvents(),this.autoResize&&("ResizeObserver"in window?this.ROInstance&&this.ROInstance.destroy():window.removeEventListener("resize",this._onResizeBind))}_bindScrollToEvents(e){const t=e||this.lenisInstance.rootElement,n=t==null?void 0:t.querySelectorAll("[data-scroll-to]");n!=null&&n.length&&n.forEach(i=>{i.addEventListener("click",this._onScrollToBind,!1)})}_unbindScrollToEvents(e){const t=e||this.lenisInstance.rootElement,n=t==null?void 0:t.querySelectorAll("[data-scroll-to]");n!=null&&n.length&&n.forEach(i=>{i.removeEventListener("click",this._onScrollToBind,!1)})}_onResize(){requestAnimationFrame(()=>{var e;(e=this.coreInstance)==null||e.onResize({currentScroll:this.lenisInstance.scroll})})}_onRender(){var e,t;(e=this.lenisInstance)==null||e.raf(Date.now()),(t=this.coreInstance)==null||t.onRender({currentScroll:this.lenisInstance.scroll,smooth:this.lenisInstance.isSmooth})}_onScrollTo(e){var t;e.preventDefault();const n=(t=e.currentTarget)!=null?t:null;if(!n)return;const i=n.getAttribute("data-scroll-to-href")||n.getAttribute("href"),s=n.getAttribute("data-scroll-to-offset")||0,o=n.getAttribute("data-scroll-to-duration")||this.lenisOptions.duration||ed.duration;i&&this.scrollTo(i,{offset:typeof s=="string"?parseInt(s):s,duration:typeof o=="string"?parseInt(o):o})}start(){var e;this.rafPlaying||((e=this.lenisInstance)==null||e.start(),this.rafPlaying=!0,this.initCustomTicker?this.initCustomTicker(this._onRenderBind):this._raf())}stop(){var e;this.rafPlaying&&((e=this.lenisInstance)==null||e.stop(),this.rafPlaying=!1,this.destroyCustomTicker?this.destroyCustomTicker(this._onRenderBind):this.rafInstance&&cancelAnimationFrame(this.rafInstance))}removeScrollElements(e){var t;e?(this._unbindScrollToEvents(e),(t=this.coreInstance)==null||t.removeScrollElements(e)):console.error("Please provide a DOM Element as $oldContainer")}addScrollElements(e){var t;e?((t=this.coreInstance)==null||t.addScrollElements(e),requestAnimationFrame(()=>{this._bindScrollToEvents(e)})):console.error("Please provide a DOM Element as $newContainer")}resize(){this._onResizeBind()}scrollTo(e,t){var n;(n=this.lenisInstance)==null||n.scrollTo(e,{offset:t==null?void 0:t.offset,lerp:t==null?void 0:t.lerp,duration:t==null?void 0:t.duration,immediate:t==null?void 0:t.immediate,lock:t==null?void 0:t.lock,force:t==null?void 0:t.force,easing:t==null?void 0:t.easing,onComplete:t==null?void 0:t.onComplete})}_raf(){this._onRenderBind(),this.rafInstance=requestAnimationFrame(()=>this._raf())}}new Bx;var Zg=function(){document.getElementById("time").innerHTML=new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",timeStyle:"long",hourCycle:"h24"})};function Jg(){Zt.set("#overlay",{autoAlpha:0}),Zt.set("#divider",{width:0}),Zt.set("#nav-cluster a",{x:0,autoAlpha:1}),Zt.matchMedia().add("(max-width: 900px)",()=>{Zt.set("#nav-cluster a",{autoAlpha:0})})}function kx(){var r=Zt.timeline();r.to(".loader",{delay:3,duration:2,ease:"power4.inOut",scale:0,opacity:.3}),document.querySelectorAll("[loader-split]").forEach((t,n)=>{const i=new Gh(t,{types:"chars"});var s=Zt.timeline();s.from(i.chars,{y:"-100%",ease:"power4.inOut",duration:2,stagger:.1}).to(i.chars,{y:"100%",ease:"power4.inOut",duration:2,stagger:.1})})}function zx(){var r=Zt.timeline();r.to("#bar",{duration:1.25,scaleY:1,transformOrigin:"top",ease:"power4.inOut",stagger:.07,delay:1}).to("#bar",{transformOrigin:"bottom",duration:1.25,scaleY:0,ease:"power4.inOut",stagger:.07})}function Qg(){var r=Zt.timeline({paused:!0,reversed:!0});r.to("#home",{autoAlpha:0,duration:1,ease:"power4.inOut"},"<").to("#nav-cluster a",{ease:"power4.inOut",duration:1,x:"-100%",stagger:.07,autoAlpha:0},"<").to("#overlay",{ease:"power4.inOut",duration:.75,autoAlpha:1},"<").to("#seperator",{duration:2.25,ease:"power4.inOut",stagger:.065,width:"100%"},"<"),Array.from(document.querySelectorAll(".menu-close, .menu-open")).forEach(e=>e.addEventListener("click",function(){r.reversed()?r.play():r.reverse()}))}function Vh(){Qg();var r=Zt.timeline({paused:!0,reversed:!0});const e=document.getElementById("menu");e.onclick=function(t){r.reversed(!r.reversed())}}function ju(){Zt.matchMedia().add("(min-width: 900px)",()=>{Zt.to("#nav-cluster a",{ease:"power4.inOut",duration:1,x:"-100%",stagger:.07,autoAlpha:0,scrollTrigger:{scrub:4,trigger:"nav",start:"top",scroller:"body"}})})}function Wl(){document.querySelectorAll("[text-split]").forEach((e,t)=>{const n=new Gh(e,{types:"words"});Zt.from(n.words,{scrollTrigger:{trigger:"#about",start:"top top",end:"bottom bottom",scrub:!0},opacity:.15,stagger:.7})})}function Xl(){Zt.to("#divider",{duration:2,ease:"power4.inOut",stagger:.075,width:"100%",scrollTrigger:{trigger:".divider",start:"top 90%"}})}function Hx(){document.querySelectorAll("[header-split]").forEach((e,t)=>{const n=new Gh(e,{types:"words"});Zt.from(n.words,{y:"105%",delay:.35,opacity:0,ease:"power4.inOut",stagger:{amount:.1},duration:1.75,scrollTrigger:{trigger:"#about"}})})}function Gx(r){return r=r||1500,new Promise(e=>{setTimeout(()=>{e()},r)})}Ea.init({transitions:[{once(r){console.log("once"),ju(),Wl(),Xl(),Vh()},async leave(r){console.log("leave");const e=this.async();zx(),await Gx(2500),e()},async after(r){console.log("after"),ju(),Wl(),Xl()}}]});Ea.hooks.once(r=>{kx()});Ea.hooks.enter(r=>{});Ea.hooks.beforeEnter(r=>{console.log("beforeEnter"),Jg(),console.log("Reset values"),window.scrollTo(0,0),console.log("scroll 0"),Vh()});Ea.hooks.afterEnter(function(){console.log("afterEnter"),ju(),Wl(),Xl()});Zt.registerPlugin(lt);Zt.config({nullTargetWarn:!1});Jg();Wl();Vh();Qg();Xl();Hx();Zg();setInterval(Zg,1e3);/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Wh="161",bs={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},As={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Vx=0,td=1,Wx=2,e_=1,Xx=2,ki=3,Ki=0,Dn=1,_i=2,Sr=0,oo=1,nd=2,id=3,rd=4,qx=5,Vr=100,Yx=101,jx=102,sd=103,od=104,$x=200,Kx=201,Zx=202,Jx=203,$u=204,Ku=205,Qx=206,ey=207,ty=208,ny=209,iy=210,ry=211,sy=212,oy=213,ay=214,ly=0,cy=1,uy=2,ql=3,hy=4,fy=5,dy=6,py=7,t_=0,my=1,gy=2,Mr=0,_y=1,vy=2,xy=3,yy=4,Sy=5,My=6,ad="attached",Ey="detached",n_=300,go=301,_o=302,Zu=303,Ju=304,oc=306,vo=1e3,Jn=1001,Yl=1002,$t=1003,Qu=1004,Ys=1005,cn=1006,Al=1007,Wi=1008,Er=1009,Ty=1010,by=1011,Xh=1012,i_=1013,gr=1014,vi=1015,xa=1016,r_=1017,s_=1018,as=1020,Ay=1021,Qn=1023,wy=1024,Ry=1025,ls=1026,xo=1027,Cy=1028,o_=1029,Py=1030,a_=1031,l_=1033,Dc=33776,Ic=33777,Oc=33778,Nc=33779,ld=35840,cd=35841,ud=35842,hd=35843,c_=36196,fd=37492,dd=37496,pd=37808,md=37809,gd=37810,_d=37811,vd=37812,xd=37813,yd=37814,Sd=37815,Md=37816,Ed=37817,Td=37818,bd=37819,Ad=37820,wd=37821,Uc=36492,Rd=36494,Cd=36495,Ly=36283,Pd=36284,Ld=36285,Dd=36286,ya=2300,yo=2301,Fc=2302,Id=2400,Od=2401,Nd=2402,Dy=2500,Iy=0,u_=1,eh=2,h_=3e3,cs=3001,Oy=3200,Ny=3201,f_=0,Uy=1,ei="",It="srgb",en="srgb-linear",qh="display-p3",ac="display-p3-linear",jl="linear",Et="srgb",$l="rec709",Kl="p3",ws=7680,Ud=519,Fy=512,By=513,ky=514,d_=515,zy=516,Hy=517,Gy=518,Vy=519,th=35044,Fd="300 es",nh=1035,Xi=2e3,Zl=2001;class ys{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,o=i.length;s<o;s++)i[s].call(this,e);e.target=null}}}const sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Bd=1234567;const oa=Math.PI/180,So=180/Math.PI;function fi(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(sn[r&255]+sn[r>>8&255]+sn[r>>16&255]+sn[r>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]).toLowerCase()}function tn(r,e,t){return Math.max(e,Math.min(t,r))}function Yh(r,e){return(r%e+e)%e}function Wy(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function Xy(r,e,t){return r!==e?(t-r)/(e-r):0}function aa(r,e,t){return(1-t)*r+t*e}function qy(r,e,t,n){return aa(r,e,1-Math.exp(-t*n))}function Yy(r,e=1){return e-Math.abs(Yh(r,e*2)-e)}function jy(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function $y(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function Ky(r,e){return r+Math.floor(Math.random()*(e-r+1))}function Zy(r,e){return r+Math.random()*(e-r)}function Jy(r){return r*(.5-Math.random())}function Qy(r){r!==void 0&&(Bd=r);let e=Bd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function eS(r){return r*oa}function tS(r){return r*So}function ih(r){return(r&r-1)===0&&r!==0}function nS(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function Jl(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function iS(r,e,t,n,i){const s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+n)/2),u=o((e+n)/2),h=s((e-n)/2),f=o((e-n)/2),d=s((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":r.set(a*u,l*h,l*f,a*c);break;case"YZY":r.set(l*f,a*u,l*h,a*c);break;case"ZXZ":r.set(l*h,l*f,a*u,a*c);break;case"XZX":r.set(a*u,l*g,l*d,a*c);break;case"YXY":r.set(l*d,a*u,l*g,a*c);break;case"ZYZ":r.set(l*g,l*d,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function ui(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function pt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const p_={DEG2RAD:oa,RAD2DEG:So,generateUUID:fi,clamp:tn,euclideanModulo:Yh,mapLinear:Wy,inverseLerp:Xy,lerp:aa,damp:qy,pingpong:Yy,smoothstep:jy,smootherstep:$y,randInt:Ky,randFloat:Zy,randFloatSpread:Jy,seededRandom:Qy,degToRad:eS,radToDeg:tS,isPowerOfTwo:ih,ceilPowerOfTwo:nS,floorPowerOfTwo:Jl,setQuaternionFromProperEuler:iS,normalize:pt,denormalize:ui};class qe{constructor(e=0,t=0){qe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(tn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*i+e.x,this.y=s*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class it{constructor(e,t,n,i,s,o,a,l,c){it.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,o,a,l,c)}set(e,t,n,i,s,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=i,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],f=n[2],d=n[5],g=n[8],_=i[0],p=i[3],m=i[6],S=i[1],y=i[4],x=i[7],T=i[2],b=i[5],M=i[8];return s[0]=o*_+a*S+l*T,s[3]=o*p+a*y+l*b,s[6]=o*m+a*x+l*M,s[1]=c*_+u*S+h*T,s[4]=c*p+u*y+h*b,s[7]=c*m+u*x+h*M,s[2]=f*_+d*S+g*T,s[5]=f*p+d*y+g*b,s[8]=f*m+d*x+g*M,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+i*s*c-i*o*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,f=a*l-u*s,d=c*s-o*l,g=t*h+n*f+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=h*_,e[1]=(i*c-u*n)*_,e[2]=(a*n-i*o)*_,e[3]=f*_,e[4]=(u*t-i*l)*_,e[5]=(i*s-a*t)*_,e[6]=d*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Bc.makeScale(e,t)),this}rotate(e){return this.premultiply(Bc.makeRotation(-e)),this}translate(e,t){return this.premultiply(Bc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Bc=new it;function m_(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Sa(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function rS(){const r=Sa("canvas");return r.style.display="block",r}const kd={};function us(r){r in kd||(kd[r]=!0,console.warn(r))}const zd=new it().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Hd=new it().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Va={[en]:{transfer:jl,primaries:$l,toReference:r=>r,fromReference:r=>r},[It]:{transfer:Et,primaries:$l,toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[ac]:{transfer:jl,primaries:Kl,toReference:r=>r.applyMatrix3(Hd),fromReference:r=>r.applyMatrix3(zd)},[qh]:{transfer:Et,primaries:Kl,toReference:r=>r.convertSRGBToLinear().applyMatrix3(Hd),fromReference:r=>r.applyMatrix3(zd).convertLinearToSRGB()}},sS=new Set([en,ac]),ht={enabled:!0,_workingColorSpace:en,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!sS.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,e,t){if(this.enabled===!1||e===t||!e||!t)return r;const n=Va[e].toReference,i=Va[t].fromReference;return i(n(r))},fromWorkingColorSpace:function(r,e){return this.convert(r,this._workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this._workingColorSpace)},getPrimaries:function(r){return Va[r].primaries},getTransfer:function(r){return r===ei?jl:Va[r].transfer}};function ao(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function kc(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let Rs;class g_{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Rs===void 0&&(Rs=Sa("canvas")),Rs.width=e.width,Rs.height=e.height;const n=Rs.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Rs}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Sa("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let o=0;o<s.length;o++)s[o]=ao(s[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ao(t[n]/255)*255):t[n]=ao(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let oS=0;class __{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:oS++}),this.uuid=fi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?s.push(zc(i[o].image)):s.push(zc(i[o]))}else s=zc(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function zc(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?g_.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let aS=0;class Jt extends ys{constructor(e=Jt.DEFAULT_IMAGE,t=Jt.DEFAULT_MAPPING,n=Jn,i=Jn,s=cn,o=Wi,a=Qn,l=Er,c=Jt.DEFAULT_ANISOTROPY,u=ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:aS++}),this.uuid=fi(),this.name="",this.source=new __(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new qe(0,0),this.repeat=new qe(1,1),this.center=new qe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new it,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(us("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===cs?It:ei),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==n_)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case vo:e.x=e.x-Math.floor(e.x);break;case Jn:e.x=e.x<0?0:1;break;case Yl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case vo:e.y=e.y-Math.floor(e.y);break;case Jn:e.y=e.y<0?0:1;break;case Yl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return us("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===It?cs:h_}set encoding(e){us("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===cs?It:ei}}Jt.DEFAULT_IMAGE=null;Jt.DEFAULT_MAPPING=n_;Jt.DEFAULT_ANISOTROPY=1;class vt{constructor(e=0,t=0,n=0,i=1){vt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,x=(d+1)/2,T=(m+1)/2,b=(u+f)/4,M=(h+_)/4,I=(g+p)/4;return y>x&&y>T?y<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(y),i=b/n,s=M/n):x>T?x<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(x),n=b/i,s=I/i):T<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(T),n=M/s,i=I/s),this.set(n,i,s,t),this}let S=Math.sqrt((p-g)*(p-g)+(h-_)*(h-_)+(f-u)*(f-u));return Math.abs(S)<.001&&(S=1),this.x=(p-g)/S,this.y=(h-_)/S,this.z=(f-u)/S,this.w=Math.acos((c+d+m-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class lS extends ys{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t);const i={width:e,height:t,depth:1};n.encoding!==void 0&&(us("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===cs?It:ei),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:cn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new Jt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new __(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class _s extends lS{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class v_ extends Jt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=$t,this.minFilter=$t,this.wrapR=Jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class cS extends Jt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=$t,this.minFilter=$t,this.wrapR=Jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ri{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,o,a){let l=n[i+0],c=n[i+1],u=n[i+2],h=n[i+3];const f=s[o+0],d=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==f||c!==d||u!==g){let p=1-a;const m=l*f+c*d+u*g+h*_,S=m>=0?1:-1,y=1-m*m;if(y>Number.EPSILON){const T=Math.sqrt(y),b=Math.atan2(T,m*S);p=Math.sin(p*b)/T,a=Math.sin(a*b)/T}const x=a*S;if(l=l*p+f*x,c=c*p+d*x,u=u*p+g*x,h=h*p+_*x,p===1-a){const T=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=T,c*=T,u*=T,h*=T}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,s,o){const a=n[i],l=n[i+1],c=n[i+2],u=n[i+3],h=s[o],f=s[o+1],d=s[o+2],g=s[o+3];return e[t]=a*g+u*h+l*d-c*f,e[t+1]=l*g+u*f+c*h-a*d,e[t+2]=c*g+u*d+a*f-l*h,e[t+3]=u*g-a*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(i/2),h=a(s/2),f=l(n/2),d=l(i/2),g=l(s/2);switch(o){case"XYZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"YXZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"ZXY":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"ZYX":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"YZX":this._x=f*u*h+c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h-f*d*g;break;case"XZY":this._x=f*u*h-c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=n+a+h;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(s-c)*d,this._z=(o-i)*d}else if(n>a&&n>h){const d=2*Math.sqrt(1+n-a-h);this._w=(u-l)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(s+c)/d}else if(a>h){const d=2*Math.sqrt(1+a-n-h);this._w=(s-c)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(l+u)/d}else{const d=2*Math.sqrt(1+h-n-a);this._w=(o-i)/d,this._x=(s+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(tn(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+i*c-s*l,this._y=i*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-i*a,this._w=o*u-n*a-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+i*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const d=1-t;return this._w=d*o+t*this._w,this._x=d*n+t*this._x,this._y=d*i+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,f=Math.sin(t*u)/c;return this._w=o*h+this._w*f,this._x=n*h+this._x*f,this._y=i*h+this._y*f,this._z=s*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),i=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(i),n*Math.sin(s),n*Math.cos(s),t*Math.sin(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(e=0,t=0,n=0){U.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Gd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Gd.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),u=2*(a*t-s*i),h=2*(s*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-s*h,this.z=i+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-s*a,this.y=s*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Hc.copy(this).projectOnVector(e),this.sub(Hc)}reflect(e){return this.sub(Hc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(tn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Hc=new U,Gd=new Ri;class Zi{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(si.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(si.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=si.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,si):si.fromBufferAttribute(s,o),si.applyMatrix4(e.matrixWorld),this.expandByPoint(si);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wa.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Wa.copy(n.boundingBox)),Wa.applyMatrix4(e.matrixWorld),this.union(Wa)}const i=e.children;for(let s=0,o=i.length;s<o;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,si),si.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Io),Xa.subVectors(this.max,Io),Cs.subVectors(e.a,Io),Ps.subVectors(e.b,Io),Ls.subVectors(e.c,Io),Qi.subVectors(Ps,Cs),er.subVectors(Ls,Ps),Ir.subVectors(Cs,Ls);let t=[0,-Qi.z,Qi.y,0,-er.z,er.y,0,-Ir.z,Ir.y,Qi.z,0,-Qi.x,er.z,0,-er.x,Ir.z,0,-Ir.x,-Qi.y,Qi.x,0,-er.y,er.x,0,-Ir.y,Ir.x,0];return!Gc(t,Cs,Ps,Ls,Xa)||(t=[1,0,0,0,1,0,0,0,1],!Gc(t,Cs,Ps,Ls,Xa))?!1:(qa.crossVectors(Qi,er),t=[qa.x,qa.y,qa.z],Gc(t,Cs,Ps,Ls,Xa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,si).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(si).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Di[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Di[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Di[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Di[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Di[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Di[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Di[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Di[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Di),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Di=[new U,new U,new U,new U,new U,new U,new U,new U],si=new U,Wa=new Zi,Cs=new U,Ps=new U,Ls=new U,Qi=new U,er=new U,Ir=new U,Io=new U,Xa=new U,qa=new U,Or=new U;function Gc(r,e,t,n,i){for(let s=0,o=r.length-3;s<=o;s+=3){Or.fromArray(r,s);const a=i.x*Math.abs(Or.x)+i.y*Math.abs(Or.y)+i.z*Math.abs(Or.z),l=e.dot(Or),c=t.dot(Or),u=n.dot(Or);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const uS=new Zi,Oo=new U,Vc=new U;class Ci{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):uS.setFromPoints(e).getCenter(n);let i=0;for(let s=0,o=e.length;s<o;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Oo.subVectors(e,this.center);const t=Oo.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Oo,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Vc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Oo.copy(e.center).add(Vc)),this.expandByPoint(Oo.copy(e.center).sub(Vc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ii=new U,Wc=new U,Ya=new U,tr=new U,Xc=new U,ja=new U,qc=new U;class Aa{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ii)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ii.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ii.copy(this.origin).addScaledVector(this.direction,t),Ii.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Wc.copy(e).add(t).multiplyScalar(.5),Ya.copy(t).sub(e).normalize(),tr.copy(this.origin).sub(Wc);const s=e.distanceTo(t)*.5,o=-this.direction.dot(Ya),a=tr.dot(this.direction),l=-tr.dot(Ya),c=tr.lengthSq(),u=Math.abs(1-o*o);let h,f,d,g;if(u>0)if(h=o*l-a,f=o*a-l,g=s*u,h>=0)if(f>=-g)if(f<=g){const _=1/u;h*=_,f*=_,d=h*(h+o*f+2*a)+f*(o*h+f+2*l)+c}else f=s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f=-s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f<=-g?(h=Math.max(0,-(-o*s+a)),f=h>0?-s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c):f<=g?(h=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+c):(h=Math.max(0,-(o*s+a)),f=h>0?s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c);else f=o>0?-s:s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(Wc).addScaledVector(Ya,f),d}intersectSphere(e,t){Ii.subVectors(e.center,this.origin);const n=Ii.dot(this.direction),i=Ii.dot(Ii)-n*n,s=e.radius*e.radius;if(i>s)return null;const o=Math.sqrt(s-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,i=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,i=(e.min.x-f.x)*c),u>=0?(s=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),n>o||s>i||((s>n||isNaN(n))&&(n=s),(o<i||isNaN(i))&&(i=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Ii)!==null}intersectTriangle(e,t,n,i,s){Xc.subVectors(t,e),ja.subVectors(n,e),qc.crossVectors(Xc,ja);let o=this.direction.dot(qc),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;tr.subVectors(this.origin,e);const l=a*this.direction.dot(ja.crossVectors(tr,ja));if(l<0)return null;const c=a*this.direction.dot(Xc.cross(tr));if(c<0||l+c>o)return null;const u=-a*tr.dot(qc);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class rt{constructor(e,t,n,i,s,o,a,l,c,u,h,f,d,g,_,p){rt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,o,a,l,c,u,h,f,d,g,_,p)}set(e,t,n,i,s,o,a,l,c,u,h,f,d,g,_,p){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=h,m[14]=f,m[3]=d,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/Ds.setFromMatrixColumn(e,0).length(),s=1/Ds.setFromMatrixColumn(e,1).length(),o=1/Ds.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const f=o*u,d=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+g*c,t[5]=f-_*c,t[9]=-a*l,t[2]=_-f*c,t[6]=g+d*c,t[10]=o*l}else if(e.order==="YXZ"){const f=l*u,d=l*h,g=c*u,_=c*h;t[0]=f+_*a,t[4]=g*a-d,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=d*a-g,t[6]=_+f*a,t[10]=o*l}else if(e.order==="ZXY"){const f=l*u,d=l*h,g=c*u,_=c*h;t[0]=f-_*a,t[4]=-o*h,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*u,t[9]=_-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const f=o*u,d=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=g*c-d,t[8]=f*c+_,t[1]=l*h,t[5]=_*c+f,t[9]=d*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const f=o*l,d=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-f*h,t[8]=g*h+d,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=d*h+g,t[10]=f-_*h}else if(e.order==="XZY"){const f=o*l,d=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+_,t[5]=o*u,t[9]=d*h-g,t[2]=g*h-d,t[6]=a*u,t[10]=_*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(hS,e,fS)}lookAt(e,t,n){const i=this.elements;return Nn.subVectors(e,t),Nn.lengthSq()===0&&(Nn.z=1),Nn.normalize(),nr.crossVectors(n,Nn),nr.lengthSq()===0&&(Math.abs(n.z)===1?Nn.x+=1e-4:Nn.z+=1e-4,Nn.normalize(),nr.crossVectors(n,Nn)),nr.normalize(),$a.crossVectors(Nn,nr),i[0]=nr.x,i[4]=$a.x,i[8]=Nn.x,i[1]=nr.y,i[5]=$a.y,i[9]=Nn.y,i[2]=nr.z,i[6]=$a.z,i[10]=Nn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],f=n[9],d=n[13],g=n[2],_=n[6],p=n[10],m=n[14],S=n[3],y=n[7],x=n[11],T=n[15],b=i[0],M=i[4],I=i[8],O=i[12],v=i[1],R=i[5],N=i[9],$=i[13],D=i[2],H=i[6],B=i[10],Y=i[14],j=i[3],K=i[7],C=i[11],Z=i[15];return s[0]=o*b+a*v+l*D+c*j,s[4]=o*M+a*R+l*H+c*K,s[8]=o*I+a*N+l*B+c*C,s[12]=o*O+a*$+l*Y+c*Z,s[1]=u*b+h*v+f*D+d*j,s[5]=u*M+h*R+f*H+d*K,s[9]=u*I+h*N+f*B+d*C,s[13]=u*O+h*$+f*Y+d*Z,s[2]=g*b+_*v+p*D+m*j,s[6]=g*M+_*R+p*H+m*K,s[10]=g*I+_*N+p*B+m*C,s[14]=g*O+_*$+p*Y+m*Z,s[3]=S*b+y*v+x*D+T*j,s[7]=S*M+y*R+x*H+T*K,s[11]=S*I+y*N+x*B+T*C,s[15]=S*O+y*$+x*Y+T*Z,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],g=e[3],_=e[7],p=e[11],m=e[15];return g*(+s*l*h-i*c*h-s*a*f+n*c*f+i*a*d-n*l*d)+_*(+t*l*d-t*c*f+s*o*f-i*o*d+i*c*u-s*l*u)+p*(+t*c*h-t*a*d-s*o*h+n*o*d+s*a*u-n*c*u)+m*(-i*a*u-t*l*h+t*a*f+i*o*h-n*o*f+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],g=e[12],_=e[13],p=e[14],m=e[15],S=h*p*c-_*f*c+_*l*d-a*p*d-h*l*m+a*f*m,y=g*f*c-u*p*c-g*l*d+o*p*d+u*l*m-o*f*m,x=u*_*c-g*h*c+g*a*d-o*_*d-u*a*m+o*h*m,T=g*h*l-u*_*l-g*a*f+o*_*f+u*a*p-o*h*p,b=t*S+n*y+i*x+s*T;if(b===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const M=1/b;return e[0]=S*M,e[1]=(_*f*s-h*p*s-_*i*d+n*p*d+h*i*m-n*f*m)*M,e[2]=(a*p*s-_*l*s+_*i*c-n*p*c-a*i*m+n*l*m)*M,e[3]=(h*l*s-a*f*s-h*i*c+n*f*c+a*i*d-n*l*d)*M,e[4]=y*M,e[5]=(u*p*s-g*f*s+g*i*d-t*p*d-u*i*m+t*f*m)*M,e[6]=(g*l*s-o*p*s-g*i*c+t*p*c+o*i*m-t*l*m)*M,e[7]=(o*f*s-u*l*s+u*i*c-t*f*c-o*i*d+t*l*d)*M,e[8]=x*M,e[9]=(g*h*s-u*_*s-g*n*d+t*_*d+u*n*m-t*h*m)*M,e[10]=(o*_*s-g*a*s+g*n*c-t*_*c-o*n*m+t*a*m)*M,e[11]=(u*a*s-o*h*s-u*n*c+t*h*c+o*n*d-t*a*d)*M,e[12]=T*M,e[13]=(u*_*i-g*h*i+g*n*f-t*_*f-u*n*p+t*h*p)*M,e[14]=(g*a*i-o*_*i-g*n*l+t*_*l+o*n*p-t*a*p)*M,e[15]=(o*h*i-u*a*i+u*n*l-t*h*l-o*n*f+t*a*f)*M,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,u*a+n,u*l-i*o,0,c*l-i*a,u*l+i*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,o){return this.set(1,n,s,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,f=s*c,d=s*u,g=s*h,_=o*u,p=o*h,m=a*h,S=l*c,y=l*u,x=l*h,T=n.x,b=n.y,M=n.z;return i[0]=(1-(_+m))*T,i[1]=(d+x)*T,i[2]=(g-y)*T,i[3]=0,i[4]=(d-x)*b,i[5]=(1-(f+m))*b,i[6]=(p+S)*b,i[7]=0,i[8]=(g+y)*M,i[9]=(p-S)*M,i[10]=(1-(f+_))*M,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=Ds.set(i[0],i[1],i[2]).length();const o=Ds.set(i[4],i[5],i[6]).length(),a=Ds.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],oi.copy(this);const c=1/s,u=1/o,h=1/a;return oi.elements[0]*=c,oi.elements[1]*=c,oi.elements[2]*=c,oi.elements[4]*=u,oi.elements[5]*=u,oi.elements[6]*=u,oi.elements[8]*=h,oi.elements[9]*=h,oi.elements[10]*=h,t.setFromRotationMatrix(oi),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,i,s,o,a=Xi){const l=this.elements,c=2*s/(t-e),u=2*s/(n-i),h=(t+e)/(t-e),f=(n+i)/(n-i);let d,g;if(a===Xi)d=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===Zl)d=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,o,a=Xi){const l=this.elements,c=1/(t-e),u=1/(n-i),h=1/(o-s),f=(t+e)*c,d=(n+i)*u;let g,_;if(a===Xi)g=(o+s)*h,_=-2*h;else if(a===Zl)g=s*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Ds=new U,oi=new rt,hS=new U(0,0,0),fS=new U(1,1,1),nr=new U,$a=new U,Nn=new U,Vd=new rt,Wd=new Ri;class lc{constructor(e=0,t=0,n=0,i=lc.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],o=i[4],a=i[8],l=i[1],c=i[5],u=i[9],h=i[2],f=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(tn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-tn(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(tn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-tn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(tn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-tn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Vd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Vd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Wd.setFromEuler(this),this.setFromQuaternion(Wd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}lc.DEFAULT_ORDER="XYZ";class x_{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let dS=0;const Xd=new U,Is=new Ri,Oi=new rt,Ka=new U,No=new U,pS=new U,mS=new Ri,qd=new U(1,0,0),Yd=new U(0,1,0),jd=new U(0,0,1),gS={type:"added"},_S={type:"removed"};class Lt extends ys{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dS++}),this.uuid=fi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Lt.DEFAULT_UP.clone();const e=new U,t=new lc,n=new Ri,i=new U(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new rt},normalMatrix:{value:new it}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=Lt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Lt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new x_,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Is.setFromAxisAngle(e,t),this.quaternion.multiply(Is),this}rotateOnWorldAxis(e,t){return Is.setFromAxisAngle(e,t),this.quaternion.premultiply(Is),this}rotateX(e){return this.rotateOnAxis(qd,e)}rotateY(e){return this.rotateOnAxis(Yd,e)}rotateZ(e){return this.rotateOnAxis(jd,e)}translateOnAxis(e,t){return Xd.copy(e).applyQuaternion(this.quaternion),this.position.add(Xd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(qd,e)}translateY(e){return this.translateOnAxis(Yd,e)}translateZ(e){return this.translateOnAxis(jd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Oi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ka.copy(e):Ka.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),No.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Oi.lookAt(No,Ka,this.up):Oi.lookAt(Ka,No,this.up),this.quaternion.setFromRotationMatrix(Oi),i&&(Oi.extractRotation(i.matrixWorld),Is.setFromRotationMatrix(Oi),this.quaternion.premultiply(Is.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(gS)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(_S)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Oi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Oi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Oi),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(No,e,pS),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(No,mS,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++){const s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const i=this.children;for(let s=0,o=i.length;s<o;s++){const a=i[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxGeometryCount=this._maxGeometryCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));i.material=a}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Lt.DEFAULT_UP=new U(0,1,0);Lt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Lt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const ai=new U,Ni=new U,Yc=new U,Ui=new U,Os=new U,Ns=new U,$d=new U,jc=new U,$c=new U,Kc=new U;class xi{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),ai.subVectors(e,t),i.cross(ai);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){ai.subVectors(i,t),Ni.subVectors(n,t),Yc.subVectors(e,t);const o=ai.dot(ai),a=ai.dot(Ni),l=ai.dot(Yc),c=Ni.dot(Ni),u=Ni.dot(Yc),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;const f=1/h,d=(c*l-a*u)*f,g=(o*u-a*l)*f;return s.set(1-d-g,g,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Ui)===null?!1:Ui.x>=0&&Ui.y>=0&&Ui.x+Ui.y<=1}static getInterpolation(e,t,n,i,s,o,a,l){return this.getBarycoord(e,t,n,i,Ui)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Ui.x),l.addScaledVector(o,Ui.y),l.addScaledVector(a,Ui.z),l)}static isFrontFacing(e,t,n,i){return ai.subVectors(n,t),Ni.subVectors(e,t),ai.cross(Ni).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ai.subVectors(this.c,this.b),Ni.subVectors(this.a,this.b),ai.cross(Ni).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return xi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return xi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return xi.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return xi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return xi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let o,a;Os.subVectors(i,n),Ns.subVectors(s,n),jc.subVectors(e,n);const l=Os.dot(jc),c=Ns.dot(jc);if(l<=0&&c<=0)return t.copy(n);$c.subVectors(e,i);const u=Os.dot($c),h=Ns.dot($c);if(u>=0&&h<=u)return t.copy(i);const f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(Os,o);Kc.subVectors(e,s);const d=Os.dot(Kc),g=Ns.dot(Kc);if(g>=0&&d<=g)return t.copy(s);const _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Ns,a);const p=u*g-d*h;if(p<=0&&h-u>=0&&d-g>=0)return $d.subVectors(s,i),a=(h-u)/(h-u+(d-g)),t.copy(i).addScaledVector($d,a);const m=1/(p+_+f);return o=_*m,a=f*m,t.copy(n).addScaledVector(Os,o).addScaledVector(Ns,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const y_={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ir={h:0,s:0,l:0},Za={h:0,s:0,l:0};function Zc(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Ze{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=It){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ht.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=ht.workingColorSpace){return this.r=e,this.g=t,this.b=n,ht.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=ht.workingColorSpace){if(e=Yh(e,1),t=tn(t,0,1),n=tn(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=Zc(o,s,e+1/3),this.g=Zc(o,s,e),this.b=Zc(o,s,e-1/3)}return ht.toWorkingColorSpace(this,i),this}setStyle(e,t=It){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=It){const n=y_[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ao(e.r),this.g=ao(e.g),this.b=ao(e.b),this}copyLinearToSRGB(e){return this.r=kc(e.r),this.g=kc(e.g),this.b=kc(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=It){return ht.fromWorkingColorSpace(on.copy(this),e),Math.round(tn(on.r*255,0,255))*65536+Math.round(tn(on.g*255,0,255))*256+Math.round(tn(on.b*255,0,255))}getHexString(e=It){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ht.workingColorSpace){ht.fromWorkingColorSpace(on.copy(this),t);const n=on.r,i=on.g,s=on.b,o=Math.max(n,i,s),a=Math.min(n,i,s);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(i-s)/h+(i<s?6:0);break;case i:l=(s-n)/h+2;break;case s:l=(n-i)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ht.workingColorSpace){return ht.fromWorkingColorSpace(on.copy(this),t),e.r=on.r,e.g=on.g,e.b=on.b,e}getStyle(e=It){ht.fromWorkingColorSpace(on.copy(this),e);const t=on.r,n=on.g,i=on.b;return e!==It?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ir),this.setHSL(ir.h+e,ir.s+t,ir.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ir),e.getHSL(Za);const n=aa(ir.h,Za.h,t),i=aa(ir.s,Za.s,t),s=aa(ir.l,Za.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const on=new Ze;Ze.NAMES=y_;let vS=0;class Ai extends ys{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:vS++}),this.uuid=fi(),this.name="",this.type="Material",this.blending=oo,this.side=Ki,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$u,this.blendDst=Ku,this.blendEquation=Vr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=ql,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ud,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ws,this.stencilZFail=ws,this.stencilZPass=ws,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==oo&&(n.blending=this.blending),this.side!==Ki&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==$u&&(n.blendSrc=this.blendSrc),this.blendDst!==Ku&&(n.blendDst=this.blendDst),this.blendEquation!==Vr&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ql&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ud&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ws&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ws&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ws&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=i(e.textures),o=i(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Jr extends Ai{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=t_,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Ft=new U,Ja=new qe;class An{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=th,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=vi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return us("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ja.fromBufferAttribute(this,t),Ja.applyMatrix3(e),this.setXY(t,Ja.x,Ja.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix3(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix4(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.applyNormalMatrix(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.transformDirection(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ui(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ui(t,this.array)),t}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ui(t,this.array)),t}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ui(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ui(t,this.array)),t}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array),s=pt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==th&&(e.usage=this.usage),e}}class S_ extends An{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class M_ extends An{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Yi extends An{constructor(e,t,n){super(new Float32Array(e),t,n)}}let xS=0;const Yn=new rt,Jc=new Lt,Us=new U,Un=new Zi,Uo=new Zi,qt=new U;class Pi extends ys{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:xS++}),this.uuid=fi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(m_(e)?M_:S_)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new it().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Yn.makeRotationFromQuaternion(e),this.applyMatrix4(Yn),this}rotateX(e){return Yn.makeRotationX(e),this.applyMatrix4(Yn),this}rotateY(e){return Yn.makeRotationY(e),this.applyMatrix4(Yn),this}rotateZ(e){return Yn.makeRotationZ(e),this.applyMatrix4(Yn),this}translate(e,t,n){return Yn.makeTranslation(e,t,n),this.applyMatrix4(Yn),this}scale(e,t,n){return Yn.makeScale(e,t,n),this.applyMatrix4(Yn),this}lookAt(e){return Jc.lookAt(e),Jc.updateMatrix(),this.applyMatrix4(Jc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Us).negate(),this.translate(Us.x,Us.y,Us.z),this}setFromPoints(e){const t=[];for(let n=0,i=e.length;n<i;n++){const s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Yi(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Zi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];Un.setFromBufferAttribute(s),this.morphTargetsRelative?(qt.addVectors(this.boundingBox.min,Un.min),this.boundingBox.expandByPoint(qt),qt.addVectors(this.boundingBox.max,Un.max),this.boundingBox.expandByPoint(qt)):(this.boundingBox.expandByPoint(Un.min),this.boundingBox.expandByPoint(Un.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ci);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new U,1/0);return}if(e){const n=this.boundingSphere.center;if(Un.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Uo.setFromBufferAttribute(a),this.morphTargetsRelative?(qt.addVectors(Un.min,Uo.min),Un.expandByPoint(qt),qt.addVectors(Un.max,Uo.max),Un.expandByPoint(qt)):(Un.expandByPoint(Uo.min),Un.expandByPoint(Uo.max))}Un.getCenter(n);let i=0;for(let s=0,o=e.count;s<o;s++)qt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(qt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)qt.fromBufferAttribute(a,c),l&&(Us.fromBufferAttribute(e,c),qt.add(Us)),i=Math.max(i,n.distanceToSquared(qt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.array,i=t.position.array,s=t.normal.array,o=t.uv.array,a=i.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new An(new Float32Array(4*a),4));const l=this.getAttribute("tangent").array,c=[],u=[];for(let v=0;v<a;v++)c[v]=new U,u[v]=new U;const h=new U,f=new U,d=new U,g=new qe,_=new qe,p=new qe,m=new U,S=new U;function y(v,R,N){h.fromArray(i,v*3),f.fromArray(i,R*3),d.fromArray(i,N*3),g.fromArray(o,v*2),_.fromArray(o,R*2),p.fromArray(o,N*2),f.sub(h),d.sub(h),_.sub(g),p.sub(g);const $=1/(_.x*p.y-p.x*_.y);isFinite($)&&(m.copy(f).multiplyScalar(p.y).addScaledVector(d,-_.y).multiplyScalar($),S.copy(d).multiplyScalar(_.x).addScaledVector(f,-p.x).multiplyScalar($),c[v].add(m),c[R].add(m),c[N].add(m),u[v].add(S),u[R].add(S),u[N].add(S))}let x=this.groups;x.length===0&&(x=[{start:0,count:n.length}]);for(let v=0,R=x.length;v<R;++v){const N=x[v],$=N.start,D=N.count;for(let H=$,B=$+D;H<B;H+=3)y(n[H+0],n[H+1],n[H+2])}const T=new U,b=new U,M=new U,I=new U;function O(v){M.fromArray(s,v*3),I.copy(M);const R=c[v];T.copy(R),T.sub(M.multiplyScalar(M.dot(R))).normalize(),b.crossVectors(I,R);const $=b.dot(u[v])<0?-1:1;l[v*4]=T.x,l[v*4+1]=T.y,l[v*4+2]=T.z,l[v*4+3]=$}for(let v=0,R=x.length;v<R;++v){const N=x[v],$=N.start,D=N.count;for(let H=$,B=$+D;H<B;H+=3)O(n[H+0]),O(n[H+1]),O(n[H+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new An(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const i=new U,s=new U,o=new U,a=new U,l=new U,c=new U,u=new U,h=new U;if(e)for(let f=0,d=e.count;f<d;f+=3){const g=e.getX(f+0),_=e.getX(f+1),p=e.getX(f+2);i.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,p),u.subVectors(o,s),h.subVectors(i,s),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)i.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,s),h.subVectors(i,s),u.cross(h),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)qt.fromBufferAttribute(e,t),qt.normalize(),e.setXYZ(t,qt.x,qt.y,qt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,h=a.normalized,f=new c.constructor(l.length*u);let d=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?d=l[_]*a.data.stride+a.offset:d=l[_]*u;for(let m=0;m<u;m++)f[g++]=c[d++]}return new An(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Pi,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){const f=c[u],d=e(f,n);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){const d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(i[l]=u,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const u=i[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],h=s[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Kd=new rt,Nr=new Aa,Qa=new Ci,Zd=new U,Fs=new U,Bs=new U,ks=new U,Qc=new U,el=new U,tl=new qe,nl=new qe,il=new qe,Jd=new U,Qd=new U,ep=new U,rl=new U,sl=new U;class Vn extends Lt{constructor(e=new Pi,t=new Jr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(s&&a){el.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=a[l],h=s[l];u!==0&&(Qc.fromBufferAttribute(h,e),o?el.addScaledVector(Qc,u):el.addScaledVector(Qc.sub(t),u))}t.add(el)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Qa.copy(n.boundingSphere),Qa.applyMatrix4(s),Nr.copy(e.ray).recast(e.near),!(Qa.containsPoint(Nr.origin)===!1&&(Nr.intersectSphere(Qa,Zd)===null||Nr.origin.distanceToSquared(Zd)>(e.far-e.near)**2))&&(Kd.copy(s).invert(),Nr.copy(e.ray).applyMatrix4(Kd),!(n.boundingBox!==null&&Nr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Nr)))}_computeIntersections(e,t,n){let i;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,f=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){const p=f[g],m=o[p.materialIndex],S=Math.max(p.start,d.start),y=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let x=S,T=y;x<T;x+=3){const b=a.getX(x),M=a.getX(x+1),I=a.getX(x+2);i=ol(this,m,e,n,c,u,h,b,M,I),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const g=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let p=g,m=_;p<m;p+=3){const S=a.getX(p),y=a.getX(p+1),x=a.getX(p+2);i=ol(this,o,e,n,c,u,h,S,y,x),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){const p=f[g],m=o[p.materialIndex],S=Math.max(p.start,d.start),y=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let x=S,T=y;x<T;x+=3){const b=x,M=x+1,I=x+2;i=ol(this,m,e,n,c,u,h,b,M,I),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let p=g,m=_;p<m;p+=3){const S=p,y=p+1,x=p+2;i=ol(this,o,e,n,c,u,h,S,y,x),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}}}function yS(r,e,t,n,i,s,o,a){let l;if(e.side===Dn?l=n.intersectTriangle(o,s,i,!0,a):l=n.intersectTriangle(i,s,o,e.side===Ki,a),l===null)return null;sl.copy(a),sl.applyMatrix4(r.matrixWorld);const c=t.ray.origin.distanceTo(sl);return c<t.near||c>t.far?null:{distance:c,point:sl.clone(),object:r}}function ol(r,e,t,n,i,s,o,a,l,c){r.getVertexPosition(a,Fs),r.getVertexPosition(l,Bs),r.getVertexPosition(c,ks);const u=yS(r,e,t,n,Fs,Bs,ks,rl);if(u){i&&(tl.fromBufferAttribute(i,a),nl.fromBufferAttribute(i,l),il.fromBufferAttribute(i,c),u.uv=xi.getInterpolation(rl,Fs,Bs,ks,tl,nl,il,new qe)),s&&(tl.fromBufferAttribute(s,a),nl.fromBufferAttribute(s,l),il.fromBufferAttribute(s,c),u.uv1=xi.getInterpolation(rl,Fs,Bs,ks,tl,nl,il,new qe),u.uv2=u.uv1),o&&(Jd.fromBufferAttribute(o,a),Qd.fromBufferAttribute(o,l),ep.fromBufferAttribute(o,c),u.normal=xi.getInterpolation(rl,Fs,Bs,ks,Jd,Qd,ep,new U),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new U,materialIndex:0};xi.getNormal(Fs,Bs,ks,h.normal),u.face=h}return u}class wa extends Pi{constructor(e=1,t=1,n=1,i=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:o};const a=this;i=Math.floor(i),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],u=[],h=[];let f=0,d=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,s,4),g("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new Yi(c,3)),this.setAttribute("normal",new Yi(u,3)),this.setAttribute("uv",new Yi(h,2));function g(_,p,m,S,y,x,T,b,M,I,O){const v=x/M,R=T/I,N=x/2,$=T/2,D=b/2,H=M+1,B=I+1;let Y=0,j=0;const K=new U;for(let C=0;C<B;C++){const Z=C*R-$;for(let le=0;le<H;le++){const Oe=le*v-N;K[_]=Oe*S,K[p]=Z*y,K[m]=D,c.push(K.x,K.y,K.z),K[_]=0,K[p]=0,K[m]=b>0?1:-1,u.push(K.x,K.y,K.z),h.push(le/M),h.push(1-C/I),Y+=1}}for(let C=0;C<I;C++)for(let Z=0;Z<M;Z++){const le=f+Z+H*C,Oe=f+Z+H*(C+1),X=f+(Z+1)+H*(C+1),J=f+(Z+1)+H*C;l.push(le,Oe,J),l.push(Oe,X,J),j+=6}a.addGroup(d,j,O),d+=j,f+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wa(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Mo(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function _n(r){const e={};for(let t=0;t<r.length;t++){const n=Mo(r[t]);for(const i in n)e[i]=n[i]}return e}function SS(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function E_(r){return r.getRenderTarget()===null?r.outputColorSpace:ht.workingColorSpace}const MS={clone:Mo,merge:_n};var ES=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,TS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class wr extends Ai{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ES,this.fragmentShader=TS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Mo(e.uniforms),this.uniformsGroups=SS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class T_ extends Lt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=Xi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const rr=new U,tp=new qe,np=new qe;class Mn extends T_{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=So*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(oa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return So*2*Math.atan(Math.tan(oa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){rr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(rr.x,rr.y).multiplyScalar(-e/rr.z),rr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(rr.x,rr.y).multiplyScalar(-e/rr.z)}getViewSize(e,t){return this.getViewBounds(e,tp,np),t.subVectors(np,tp)}setViewOffset(e,t,n,i,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(oa*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const zs=-90,Hs=1;class bS extends Lt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Mn(zs,Hs,e,t);i.layers=this.layers,this.add(i);const s=new Mn(zs,Hs,e,t);s.layers=this.layers,this.add(s);const o=new Mn(zs,Hs,e,t);o.layers=this.layers,this.add(o);const a=new Mn(zs,Hs,e,t);a.layers=this.layers,this.add(a);const l=new Mn(zs,Hs,e,t);l.layers=this.layers,this.add(l);const c=new Mn(zs,Hs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===Xi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Zl)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class b_ extends Jt{constructor(e,t,n,i,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:go,super(e,t,n,i,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class AS extends _s{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];t.encoding!==void 0&&(us("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===cs?It:ei),this.texture=new b_(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:cn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new wa(5,5,5),s=new wr({name:"CubemapFromEquirect",uniforms:Mo(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Dn,blending:Sr});s.uniforms.tEquirect.value=t;const o=new Vn(i,s),a=t.minFilter;return t.minFilter===Wi&&(t.minFilter=cn),new bS(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,i){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(s)}}const eu=new U,wS=new U,RS=new it;class lr{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=eu.subVectors(n,t).cross(wS.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(eu),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||RS.getNormalMatrix(e),i=this.coplanarPoint(eu).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ur=new Ci,al=new U;class jh{constructor(e=new lr,t=new lr,n=new lr,i=new lr,s=new lr,o=new lr){this.planes=[e,t,n,i,s,o]}set(e,t,n,i,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Xi){const n=this.planes,i=e.elements,s=i[0],o=i[1],a=i[2],l=i[3],c=i[4],u=i[5],h=i[6],f=i[7],d=i[8],g=i[9],_=i[10],p=i[11],m=i[12],S=i[13],y=i[14],x=i[15];if(n[0].setComponents(l-s,f-c,p-d,x-m).normalize(),n[1].setComponents(l+s,f+c,p+d,x+m).normalize(),n[2].setComponents(l+o,f+u,p+g,x+S).normalize(),n[3].setComponents(l-o,f-u,p-g,x-S).normalize(),n[4].setComponents(l-a,f-h,p-_,x-y).normalize(),t===Xi)n[5].setComponents(l+a,f+h,p+_,x+y).normalize();else if(t===Zl)n[5].setComponents(a,h,_,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ur.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ur.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ur)}intersectsSprite(e){return Ur.center.set(0,0,0),Ur.radius=.7071067811865476,Ur.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ur)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(al.x=i.normal.x>0?e.max.x:e.min.x,al.y=i.normal.y>0?e.max.y:e.min.y,al.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(al)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function A_(){let r=null,e=!1,t=null,n=null;function i(s,o){t(s,o),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function CS(r,e){const t=e.isWebGL2,n=new WeakMap;function i(c,u){const h=c.array,f=c.usage,d=h.byteLength,g=r.createBuffer();r.bindBuffer(u,g),r.bufferData(u,h,f),c.onUploadCallback();let _;if(h instanceof Float32Array)_=r.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)_=r.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=r.UNSIGNED_SHORT;else if(h instanceof Int16Array)_=r.SHORT;else if(h instanceof Uint32Array)_=r.UNSIGNED_INT;else if(h instanceof Int32Array)_=r.INT;else if(h instanceof Int8Array)_=r.BYTE;else if(h instanceof Uint8Array)_=r.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)_=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:_,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:d}}function s(c,u,h){const f=u.array,d=u._updateRange,g=u.updateRanges;if(r.bindBuffer(h,c),d.count===-1&&g.length===0&&r.bufferSubData(h,0,f),g.length!==0){for(let _=0,p=g.length;_<p;_++){const m=g[_];t?r.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f,m.start,m.count):r.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f.subarray(m.start,m.start+m.count))}u.clearUpdateRanges()}d.count!==-1&&(t?r.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f,d.offset,d.count):r.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f.subarray(d.offset,d.offset+d.count)),d.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const u=n.get(c);u&&(r.deleteBuffer(u.buffer),n.delete(c))}function l(c,u){if(c.isGLBufferAttribute){const f=n.get(c);(!f||f.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);if(h===void 0)n.set(c,i(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}class cc extends Pi{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,u=l+1,h=e/a,f=t/l,d=[],g=[],_=[],p=[];for(let m=0;m<u;m++){const S=m*f-o;for(let y=0;y<c;y++){const x=y*h-s;g.push(x,-S,0),_.push(0,0,1),p.push(y/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let S=0;S<a;S++){const y=S+c*m,x=S+c*(m+1),T=S+1+c*(m+1),b=S+1+c*m;d.push(y,x,b),d.push(x,T,b)}this.setIndex(d),this.setAttribute("position",new Yi(g,3)),this.setAttribute("normal",new Yi(_,3)),this.setAttribute("uv",new Yi(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cc(e.width,e.height,e.widthSegments,e.heightSegments)}}var PS=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,LS=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,DS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,IS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,OS=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,NS=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,US=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,FS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,BS=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,kS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,zS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,HS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,GS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,VS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,WS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,XS=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,qS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,YS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$S=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,KS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,ZS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,JS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,QS=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,eM=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,tM=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,nM=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,iM=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,rM=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,sM=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,oM="gl_FragColor = linearToOutputTexel( gl_FragColor );",aM=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,lM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,cM=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,uM=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,hM=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,fM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,dM=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,pM=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,mM=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,gM=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_M=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,vM=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,xM=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,yM=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,SM=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,MM=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,EM=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,TM=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,bM=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,AM=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,wM=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,RM=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,CM=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,PM=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,LM=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,DM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,IM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,OM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,NM=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,UM=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,FM=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,BM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,kM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,zM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,HM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,GM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,VM=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,WM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,XM=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,qM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,YM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,jM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,$M=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,KM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ZM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,JM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,QM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,eE=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,tE=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,nE=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,iE=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,rE=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,sE=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,oE=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,aE=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,lE=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,cE=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,uE=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,hE=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,fE=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,dE=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,pE=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,mE=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,gE=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,_E=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vE=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,xE=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,yE=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,SE=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ME=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,EE=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,TE=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,bE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,AE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,wE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,RE=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const CE=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,PE=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,LE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,DE=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,IE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,OE=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,NE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,UE=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,FE=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,BE=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,kE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,zE=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,HE=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,GE=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,VE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,WE=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,XE=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qE=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,YE=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,jE=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$E=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,KE=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ZE=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,JE=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,QE=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,eT=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tT=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nT=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,iT=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,rT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sT=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,oT=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,aT=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,et={alphahash_fragment:PS,alphahash_pars_fragment:LS,alphamap_fragment:DS,alphamap_pars_fragment:IS,alphatest_fragment:OS,alphatest_pars_fragment:NS,aomap_fragment:US,aomap_pars_fragment:FS,batching_pars_vertex:BS,batching_vertex:kS,begin_vertex:zS,beginnormal_vertex:HS,bsdfs:GS,iridescence_fragment:VS,bumpmap_pars_fragment:WS,clipping_planes_fragment:XS,clipping_planes_pars_fragment:qS,clipping_planes_pars_vertex:YS,clipping_planes_vertex:jS,color_fragment:$S,color_pars_fragment:KS,color_pars_vertex:ZS,color_vertex:JS,common:QS,cube_uv_reflection_fragment:eM,defaultnormal_vertex:tM,displacementmap_pars_vertex:nM,displacementmap_vertex:iM,emissivemap_fragment:rM,emissivemap_pars_fragment:sM,colorspace_fragment:oM,colorspace_pars_fragment:aM,envmap_fragment:lM,envmap_common_pars_fragment:cM,envmap_pars_fragment:uM,envmap_pars_vertex:hM,envmap_physical_pars_fragment:EM,envmap_vertex:fM,fog_vertex:dM,fog_pars_vertex:pM,fog_fragment:mM,fog_pars_fragment:gM,gradientmap_pars_fragment:_M,lightmap_fragment:vM,lightmap_pars_fragment:xM,lights_lambert_fragment:yM,lights_lambert_pars_fragment:SM,lights_pars_begin:MM,lights_toon_fragment:TM,lights_toon_pars_fragment:bM,lights_phong_fragment:AM,lights_phong_pars_fragment:wM,lights_physical_fragment:RM,lights_physical_pars_fragment:CM,lights_fragment_begin:PM,lights_fragment_maps:LM,lights_fragment_end:DM,logdepthbuf_fragment:IM,logdepthbuf_pars_fragment:OM,logdepthbuf_pars_vertex:NM,logdepthbuf_vertex:UM,map_fragment:FM,map_pars_fragment:BM,map_particle_fragment:kM,map_particle_pars_fragment:zM,metalnessmap_fragment:HM,metalnessmap_pars_fragment:GM,morphcolor_vertex:VM,morphnormal_vertex:WM,morphtarget_pars_vertex:XM,morphtarget_vertex:qM,normal_fragment_begin:YM,normal_fragment_maps:jM,normal_pars_fragment:$M,normal_pars_vertex:KM,normal_vertex:ZM,normalmap_pars_fragment:JM,clearcoat_normal_fragment_begin:QM,clearcoat_normal_fragment_maps:eE,clearcoat_pars_fragment:tE,iridescence_pars_fragment:nE,opaque_fragment:iE,packing:rE,premultiplied_alpha_fragment:sE,project_vertex:oE,dithering_fragment:aE,dithering_pars_fragment:lE,roughnessmap_fragment:cE,roughnessmap_pars_fragment:uE,shadowmap_pars_fragment:hE,shadowmap_pars_vertex:fE,shadowmap_vertex:dE,shadowmask_pars_fragment:pE,skinbase_vertex:mE,skinning_pars_vertex:gE,skinning_vertex:_E,skinnormal_vertex:vE,specularmap_fragment:xE,specularmap_pars_fragment:yE,tonemapping_fragment:SE,tonemapping_pars_fragment:ME,transmission_fragment:EE,transmission_pars_fragment:TE,uv_pars_fragment:bE,uv_pars_vertex:AE,uv_vertex:wE,worldpos_vertex:RE,background_vert:CE,background_frag:PE,backgroundCube_vert:LE,backgroundCube_frag:DE,cube_vert:IE,cube_frag:OE,depth_vert:NE,depth_frag:UE,distanceRGBA_vert:FE,distanceRGBA_frag:BE,equirect_vert:kE,equirect_frag:zE,linedashed_vert:HE,linedashed_frag:GE,meshbasic_vert:VE,meshbasic_frag:WE,meshlambert_vert:XE,meshlambert_frag:qE,meshmatcap_vert:YE,meshmatcap_frag:jE,meshnormal_vert:$E,meshnormal_frag:KE,meshphong_vert:ZE,meshphong_frag:JE,meshphysical_vert:QE,meshphysical_frag:eT,meshtoon_vert:tT,meshtoon_frag:nT,points_vert:iT,points_frag:rT,shadow_vert:sT,shadow_frag:oT,sprite_vert:aT,sprite_frag:lT},de={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new it}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new it}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new it}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new it},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new it},normalScale:{value:new qe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new it},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new it}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new it}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new it}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0},uvTransform:{value:new it}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new qe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}}},mi={basic:{uniforms:_n([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.fog]),vertexShader:et.meshbasic_vert,fragmentShader:et.meshbasic_frag},lambert:{uniforms:_n([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new Ze(0)}}]),vertexShader:et.meshlambert_vert,fragmentShader:et.meshlambert_frag},phong:{uniforms:_n([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30}}]),vertexShader:et.meshphong_vert,fragmentShader:et.meshphong_frag},standard:{uniforms:_n([de.common,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.roughnessmap,de.metalnessmap,de.fog,de.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag},toon:{uniforms:_n([de.common,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.gradientmap,de.fog,de.lights,{emissive:{value:new Ze(0)}}]),vertexShader:et.meshtoon_vert,fragmentShader:et.meshtoon_frag},matcap:{uniforms:_n([de.common,de.bumpmap,de.normalmap,de.displacementmap,de.fog,{matcap:{value:null}}]),vertexShader:et.meshmatcap_vert,fragmentShader:et.meshmatcap_frag},points:{uniforms:_n([de.points,de.fog]),vertexShader:et.points_vert,fragmentShader:et.points_frag},dashed:{uniforms:_n([de.common,de.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:et.linedashed_vert,fragmentShader:et.linedashed_frag},depth:{uniforms:_n([de.common,de.displacementmap]),vertexShader:et.depth_vert,fragmentShader:et.depth_frag},normal:{uniforms:_n([de.common,de.bumpmap,de.normalmap,de.displacementmap,{opacity:{value:1}}]),vertexShader:et.meshnormal_vert,fragmentShader:et.meshnormal_frag},sprite:{uniforms:_n([de.sprite,de.fog]),vertexShader:et.sprite_vert,fragmentShader:et.sprite_frag},background:{uniforms:{uvTransform:{value:new it},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:et.background_vert,fragmentShader:et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:et.backgroundCube_vert,fragmentShader:et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:et.cube_vert,fragmentShader:et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:et.equirect_vert,fragmentShader:et.equirect_frag},distanceRGBA:{uniforms:_n([de.common,de.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:et.distanceRGBA_vert,fragmentShader:et.distanceRGBA_frag},shadow:{uniforms:_n([de.lights,de.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:et.shadow_vert,fragmentShader:et.shadow_frag}};mi.physical={uniforms:_n([mi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new it},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new it},clearcoatNormalScale:{value:new qe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new it},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new it},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new it},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new it},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new it},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new it},transmissionSamplerSize:{value:new qe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new it},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new it},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new it},anisotropyVector:{value:new qe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new it}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag};const ll={r:0,b:0,g:0};function cT(r,e,t,n,i,s,o){const a=new Ze(0);let l=s===!0?0:1,c,u,h=null,f=0,d=null;function g(p,m){let S=!1,y=m.isScene===!0?m.background:null;y&&y.isTexture&&(y=(m.backgroundBlurriness>0?t:e).get(y)),y===null?_(a,l):y&&y.isColor&&(_(y,1),S=!0);const x=r.xr.getEnvironmentBlendMode();x==="additive"?n.buffers.color.setClear(0,0,0,1,o):x==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(r.autoClear||S)&&r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil),y&&(y.isCubeTexture||y.mapping===oc)?(u===void 0&&(u=new Vn(new wa(1,1,1),new wr({name:"BackgroundCubeMaterial",uniforms:Mo(mi.backgroundCube.uniforms),vertexShader:mi.backgroundCube.vertexShader,fragmentShader:mi.backgroundCube.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,b,M){this.matrixWorld.copyPosition(M.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),u.material.uniforms.envMap.value=y,u.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,u.material.toneMapped=ht.getTransfer(y.colorSpace)!==Et,(h!==y||f!==y.version||d!==r.toneMapping)&&(u.material.needsUpdate=!0,h=y,f=y.version,d=r.toneMapping),u.layers.enableAll(),p.unshift(u,u.geometry,u.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Vn(new cc(2,2),new wr({name:"BackgroundMaterial",uniforms:Mo(mi.background.uniforms),vertexShader:mi.background.vertexShader,fragmentShader:mi.background.fragmentShader,side:Ki,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,c.material.toneMapped=ht.getTransfer(y.colorSpace)!==Et,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||f!==y.version||d!==r.toneMapping)&&(c.material.needsUpdate=!0,h=y,f=y.version,d=r.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function _(p,m){p.getRGB(ll,E_(r)),n.buffers.color.setClear(ll.r,ll.g,ll.b,m,o)}return{getClearColor:function(){return a},setClearColor:function(p,m=1){a.set(p),l=m,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,_(a,l)},render:g}}function uT(r,e,t,n){const i=r.getParameter(r.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||s!==null,a={},l=p(null);let c=l,u=!1;function h(D,H,B,Y,j){let K=!1;if(o){const C=_(Y,B,H);c!==C&&(c=C,d(c.object)),K=m(D,Y,B,j),K&&S(D,Y,B,j)}else{const C=H.wireframe===!0;(c.geometry!==Y.id||c.program!==B.id||c.wireframe!==C)&&(c.geometry=Y.id,c.program=B.id,c.wireframe=C,K=!0)}j!==null&&t.update(j,r.ELEMENT_ARRAY_BUFFER),(K||u)&&(u=!1,I(D,H,B,Y),j!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(j).buffer))}function f(){return n.isWebGL2?r.createVertexArray():s.createVertexArrayOES()}function d(D){return n.isWebGL2?r.bindVertexArray(D):s.bindVertexArrayOES(D)}function g(D){return n.isWebGL2?r.deleteVertexArray(D):s.deleteVertexArrayOES(D)}function _(D,H,B){const Y=B.wireframe===!0;let j=a[D.id];j===void 0&&(j={},a[D.id]=j);let K=j[H.id];K===void 0&&(K={},j[H.id]=K);let C=K[Y];return C===void 0&&(C=p(f()),K[Y]=C),C}function p(D){const H=[],B=[],Y=[];for(let j=0;j<i;j++)H[j]=0,B[j]=0,Y[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:B,attributeDivisors:Y,object:D,attributes:{},index:null}}function m(D,H,B,Y){const j=c.attributes,K=H.attributes;let C=0;const Z=B.getAttributes();for(const le in Z)if(Z[le].location>=0){const X=j[le];let J=K[le];if(J===void 0&&(le==="instanceMatrix"&&D.instanceMatrix&&(J=D.instanceMatrix),le==="instanceColor"&&D.instanceColor&&(J=D.instanceColor)),X===void 0||X.attribute!==J||J&&X.data!==J.data)return!0;C++}return c.attributesNum!==C||c.index!==Y}function S(D,H,B,Y){const j={},K=H.attributes;let C=0;const Z=B.getAttributes();for(const le in Z)if(Z[le].location>=0){let X=K[le];X===void 0&&(le==="instanceMatrix"&&D.instanceMatrix&&(X=D.instanceMatrix),le==="instanceColor"&&D.instanceColor&&(X=D.instanceColor));const J={};J.attribute=X,X&&X.data&&(J.data=X.data),j[le]=J,C++}c.attributes=j,c.attributesNum=C,c.index=Y}function y(){const D=c.newAttributes;for(let H=0,B=D.length;H<B;H++)D[H]=0}function x(D){T(D,0)}function T(D,H){const B=c.newAttributes,Y=c.enabledAttributes,j=c.attributeDivisors;B[D]=1,Y[D]===0&&(r.enableVertexAttribArray(D),Y[D]=1),j[D]!==H&&((n.isWebGL2?r:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](D,H),j[D]=H)}function b(){const D=c.newAttributes,H=c.enabledAttributes;for(let B=0,Y=H.length;B<Y;B++)H[B]!==D[B]&&(r.disableVertexAttribArray(B),H[B]=0)}function M(D,H,B,Y,j,K,C){C===!0?r.vertexAttribIPointer(D,H,B,j,K):r.vertexAttribPointer(D,H,B,Y,j,K)}function I(D,H,B,Y){if(n.isWebGL2===!1&&(D.isInstancedMesh||Y.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;y();const j=Y.attributes,K=B.getAttributes(),C=H.defaultAttributeValues;for(const Z in K){const le=K[Z];if(le.location>=0){let Oe=j[Z];if(Oe===void 0&&(Z==="instanceMatrix"&&D.instanceMatrix&&(Oe=D.instanceMatrix),Z==="instanceColor"&&D.instanceColor&&(Oe=D.instanceColor)),Oe!==void 0){const X=Oe.normalized,J=Oe.itemSize,fe=t.get(Oe);if(fe===void 0)continue;const ve=fe.buffer,Ee=fe.type,me=fe.bytesPerElement,Ke=n.isWebGL2===!0&&(Ee===r.INT||Ee===r.UNSIGNED_INT||Oe.gpuType===i_);if(Oe.isInterleavedBufferAttribute){const De=Oe.data,k=De.stride,Ve=Oe.offset;if(De.isInstancedInterleavedBuffer){for(let ge=0;ge<le.locationSize;ge++)T(le.location+ge,De.meshPerAttribute);D.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=De.meshPerAttribute*De.count)}else for(let ge=0;ge<le.locationSize;ge++)x(le.location+ge);r.bindBuffer(r.ARRAY_BUFFER,ve);for(let ge=0;ge<le.locationSize;ge++)M(le.location+ge,J/le.locationSize,Ee,X,k*me,(Ve+J/le.locationSize*ge)*me,Ke)}else{if(Oe.isInstancedBufferAttribute){for(let De=0;De<le.locationSize;De++)T(le.location+De,Oe.meshPerAttribute);D.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=Oe.meshPerAttribute*Oe.count)}else for(let De=0;De<le.locationSize;De++)x(le.location+De);r.bindBuffer(r.ARRAY_BUFFER,ve);for(let De=0;De<le.locationSize;De++)M(le.location+De,J/le.locationSize,Ee,X,J*me,J/le.locationSize*De*me,Ke)}}else if(C!==void 0){const X=C[Z];if(X!==void 0)switch(X.length){case 2:r.vertexAttrib2fv(le.location,X);break;case 3:r.vertexAttrib3fv(le.location,X);break;case 4:r.vertexAttrib4fv(le.location,X);break;default:r.vertexAttrib1fv(le.location,X)}}}}b()}function O(){N();for(const D in a){const H=a[D];for(const B in H){const Y=H[B];for(const j in Y)g(Y[j].object),delete Y[j];delete H[B]}delete a[D]}}function v(D){if(a[D.id]===void 0)return;const H=a[D.id];for(const B in H){const Y=H[B];for(const j in Y)g(Y[j].object),delete Y[j];delete H[B]}delete a[D.id]}function R(D){for(const H in a){const B=a[H];if(B[D.id]===void 0)continue;const Y=B[D.id];for(const j in Y)g(Y[j].object),delete Y[j];delete B[D.id]}}function N(){$(),u=!0,c!==l&&(c=l,d(c.object))}function $(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:N,resetDefaultState:$,dispose:O,releaseStatesOfGeometry:v,releaseStatesOfProgram:R,initAttributes:y,enableAttribute:x,disableUnusedAttributes:b}}function hT(r,e,t,n){const i=n.isWebGL2;let s;function o(u){s=u}function a(u,h){r.drawArrays(s,u,h),t.update(h,s,1)}function l(u,h,f){if(f===0)return;let d,g;if(i)d=r,g="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[g](s,u,h,f),t.update(h,s,f)}function c(u,h,f){if(f===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<f;g++)this.render(u[g],h[g]);else{d.multiDrawArraysWEBGL(s,u,0,h,0,f);let g=0;for(let _=0;_<f;_++)g+=h[_];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function fT(r,e,t){let n;function i(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const M=e.get("EXT_texture_filter_anisotropic");n=r.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(M){if(M==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&r.constructor.name==="WebGL2RenderingContext";let a=t.precision!==void 0?t.precision:"highp";const l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),f=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),d=r.getParameter(r.MAX_TEXTURE_SIZE),g=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),_=r.getParameter(r.MAX_VERTEX_ATTRIBS),p=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),m=r.getParameter(r.MAX_VARYING_VECTORS),S=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),y=f>0,x=o||e.has("OES_texture_float"),T=y&&x,b=o?r.getParameter(r.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:i,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:f,maxTextureSize:d,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:p,maxVaryings:m,maxFragmentUniforms:S,vertexTextures:y,floatFragmentTextures:x,floatVertexTextures:T,maxSamples:b}}function dT(r){const e=this;let t=null,n=0,i=!1,s=!1;const o=new lr,a=new it,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){const d=h.length!==0||f||n!==0||i;return i=f,n=h.length,d},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){const g=h.clippingPlanes,_=h.clipIntersection,p=h.clipShadows,m=r.get(h);if(!i||g===null||g.length===0||s&&!p)s?u(null):c();else{const S=s?0:n,y=S*4;let x=m.clippingState||null;l.value=x,x=u(g,f,y,d);for(let T=0;T!==y;++T)x[T]=t[T];m.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,f,d,g){const _=h!==null?h.length:0;let p=null;if(_!==0){if(p=l.value,g!==!0||p===null){const m=d+_*4,S=f.matrixWorldInverse;a.getNormalMatrix(S),(p===null||p.length<m)&&(p=new Float32Array(m));for(let y=0,x=d;y!==_;++y,x+=4)o.copy(h[y]).applyMatrix4(S,a),o.normal.toArray(p,x),p[x+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,p}}function pT(r){let e=new WeakMap;function t(o,a){return a===Zu?o.mapping=go:a===Ju&&(o.mapping=_o),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Zu||a===Ju)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new AS(l.height);return c.fromEquirectangularTexture(r,o),e.set(o,c),o.addEventListener("dispose",i),t(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class $h extends T_{constructor(e=-1,t=1,n=1,i=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Js=4,ip=[.125,.215,.35,.446,.526,.582],Wr=20,tu=new $h,rp=new Ze;let nu=null,iu=0,ru=0;const Gr=(1+Math.sqrt(5))/2,Gs=1/Gr,sp=[new U(1,1,1),new U(-1,1,1),new U(1,1,-1),new U(-1,1,-1),new U(0,Gr,Gs),new U(0,Gr,-Gs),new U(Gs,0,Gr),new U(-Gs,0,Gr),new U(Gr,Gs,0),new U(-Gr,Gs,0)];class op{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){nu=this._renderer.getRenderTarget(),iu=this._renderer.getActiveCubeFace(),ru=this._renderer.getActiveMipmapLevel(),this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=cp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=lp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(nu,iu,ru),e.scissorTest=!1,cl(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===go||e.mapping===_o?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),nu=this._renderer.getRenderTarget(),iu=this._renderer.getActiveCubeFace(),ru=this._renderer.getActiveMipmapLevel();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:cn,minFilter:cn,generateMipmaps:!1,type:xa,format:Qn,colorSpace:en,depthBuffer:!1},i=ap(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ap(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=mT(s)),this._blurMaterial=gT(s,e,t)}return i}_compileMaterial(e){const t=new Vn(this._lodPlanes[0],e);this._renderer.compile(t,tu)}_sceneToCubeUV(e,t,n,i){const a=new Mn(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(rp),u.toneMapping=Mr,u.autoClear=!1;const d=new Jr({name:"PMREM.Background",side:Dn,depthWrite:!1,depthTest:!1}),g=new Vn(new wa,d);let _=!1;const p=e.background;p?p.isColor&&(d.color.copy(p),e.background=null,_=!0):(d.color.copy(rp),_=!0);for(let m=0;m<6;m++){const S=m%3;S===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):S===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));const y=this._cubeSize;cl(i,S*y,m>2?y:0,y,y),u.setRenderTarget(i),_&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===go||e.mapping===_o;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=cp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=lp());const s=i?this._cubemapMaterial:this._equirectMaterial,o=new Vn(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;cl(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,tu)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let i=1;i<this._lodPlanes.length;i++){const s=Math.sqrt(this._sigmas[i]*this._sigmas[i]-this._sigmas[i-1]*this._sigmas[i-1]),o=sp[(i-1)%sp.length];this._blur(e,i-1,i,s,o)}t.autoClear=n}_blur(e,t,n,i,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",s),this._halfBlur(o,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Vn(this._lodPlanes[i],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Wr-1),_=s/g,p=isFinite(s)?1+Math.floor(u*_):Wr;p>Wr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Wr}`);const m=[];let S=0;for(let M=0;M<Wr;++M){const I=M/_,O=Math.exp(-I*I/2);m.push(O),M===0?S+=O:M<p&&(S+=2*O)}for(let M=0;M<m.length;M++)m[M]=m[M]/S;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:y}=this;f.dTheta.value=g,f.mipInt.value=y-n;const x=this._sizeLods[i],T=3*x*(i>y-Js?i-y+Js:0),b=4*(this._cubeSize-x);cl(t,T,b,3*x,2*x),l.setRenderTarget(t),l.render(h,tu)}}function mT(r){const e=[],t=[],n=[];let i=r;const s=r-Js+1+ip.length;for(let o=0;o<s;o++){const a=Math.pow(2,i);t.push(a);let l=1/a;o>r-Js?l=ip[o-r+Js-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,g=6,_=3,p=2,m=1,S=new Float32Array(_*g*d),y=new Float32Array(p*g*d),x=new Float32Array(m*g*d);for(let b=0;b<d;b++){const M=b%3*2/3-1,I=b>2?0:-1,O=[M,I,0,M+2/3,I,0,M+2/3,I+1,0,M,I,0,M+2/3,I+1,0,M,I+1,0];S.set(O,_*g*b),y.set(f,p*g*b);const v=[b,b,b,b,b,b];x.set(v,m*g*b)}const T=new Pi;T.setAttribute("position",new An(S,_)),T.setAttribute("uv",new An(y,p)),T.setAttribute("faceIndex",new An(x,m)),e.push(T),i>Js&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function ap(r,e,t){const n=new _s(r,e,t);return n.texture.mapping=oc,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function cl(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function gT(r,e,t){const n=new Float32Array(Wr),i=new U(0,1,0);return new wr({name:"SphericalGaussianBlur",defines:{n:Wr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Sr,depthTest:!1,depthWrite:!1})}function lp(){return new wr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Sr,depthTest:!1,depthWrite:!1})}function cp(){return new wr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sr,depthTest:!1,depthWrite:!1})}function Kh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function _T(r){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Zu||l===Ju,u=l===go||l===_o;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new op(r)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{const h=a.image;if(c&&h&&h.height>0||u&&h&&i(h)){t===null&&(t=new op(r));const f=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,f),a.addEventListener("dispose",s),f.texture}else return null}}}return a}function i(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function vT(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const i=t(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function xT(r,e,t,n){const i={},s=new WeakMap;function o(h){const f=h.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);for(const g in f.morphAttributes){const _=f.morphAttributes[g];for(let p=0,m=_.length;p<m;p++)e.remove(_[p])}f.removeEventListener("dispose",o),delete i[f.id];const d=s.get(f);d&&(e.remove(d),s.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return i[f.id]===!0||(f.addEventListener("dispose",o),i[f.id]=!0,t.memory.geometries++),f}function l(h){const f=h.attributes;for(const g in f)e.update(f[g],r.ARRAY_BUFFER);const d=h.morphAttributes;for(const g in d){const _=d[g];for(let p=0,m=_.length;p<m;p++)e.update(_[p],r.ARRAY_BUFFER)}}function c(h){const f=[],d=h.index,g=h.attributes.position;let _=0;if(d!==null){const S=d.array;_=d.version;for(let y=0,x=S.length;y<x;y+=3){const T=S[y+0],b=S[y+1],M=S[y+2];f.push(T,b,b,M,M,T)}}else if(g!==void 0){const S=g.array;_=g.version;for(let y=0,x=S.length/3-1;y<x;y+=3){const T=y+0,b=y+1,M=y+2;f.push(T,b,b,M,M,T)}}else return;const p=new(m_(f)?M_:S_)(f,1);p.version=_;const m=s.get(h);m&&e.remove(m),s.set(h,p)}function u(h){const f=s.get(h);if(f){const d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function yT(r,e,t,n){const i=n.isWebGL2;let s;function o(d){s=d}let a,l;function c(d){a=d.type,l=d.bytesPerElement}function u(d,g){r.drawElements(s,g,a,d*l),t.update(g,s,1)}function h(d,g,_){if(_===0)return;let p,m;if(i)p=r,m="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[m](s,g,a,d*l,_),t.update(g,s,_)}function f(d,g,_){if(_===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<_;m++)this.render(d[m]/l,g[m]);else{p.multiDrawElementsWEBGL(s,g,0,a,d,0,_);let m=0;for(let S=0;S<_;S++)m+=g[S];t.update(m,s,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=f}function ST(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case r.TRIANGLES:t.triangles+=a*(s/3);break;case r.LINES:t.lines+=a*(s/2);break;case r.LINE_STRIP:t.lines+=a*(s-1);break;case r.LINE_LOOP:t.lines+=a*s;break;case r.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function MT(r,e){return r[0]-e[0]}function ET(r,e){return Math.abs(e[1])-Math.abs(r[1])}function TT(r,e,t){const n={},i=new Float32Array(8),s=new WeakMap,o=new vt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){const f=c.morphTargetInfluences;if(e.isWebGL2===!0){const g=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,_=g!==void 0?g.length:0;let p=s.get(u);if(p===void 0||p.count!==_){let H=function(){$.dispose(),s.delete(u),u.removeEventListener("dispose",H)};var d=H;p!==void 0&&p.texture.dispose();const y=u.morphAttributes.position!==void 0,x=u.morphAttributes.normal!==void 0,T=u.morphAttributes.color!==void 0,b=u.morphAttributes.position||[],M=u.morphAttributes.normal||[],I=u.morphAttributes.color||[];let O=0;y===!0&&(O=1),x===!0&&(O=2),T===!0&&(O=3);let v=u.attributes.position.count*O,R=1;v>e.maxTextureSize&&(R=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);const N=new Float32Array(v*R*4*_),$=new v_(N,v,R,_);$.type=vi,$.needsUpdate=!0;const D=O*4;for(let B=0;B<_;B++){const Y=b[B],j=M[B],K=I[B],C=v*R*4*B;for(let Z=0;Z<Y.count;Z++){const le=Z*D;y===!0&&(o.fromBufferAttribute(Y,Z),N[C+le+0]=o.x,N[C+le+1]=o.y,N[C+le+2]=o.z,N[C+le+3]=0),x===!0&&(o.fromBufferAttribute(j,Z),N[C+le+4]=o.x,N[C+le+5]=o.y,N[C+le+6]=o.z,N[C+le+7]=0),T===!0&&(o.fromBufferAttribute(K,Z),N[C+le+8]=o.x,N[C+le+9]=o.y,N[C+le+10]=o.z,N[C+le+11]=K.itemSize===4?o.w:1)}}p={count:_,texture:$,size:new qe(v,R)},s.set(u,p),u.addEventListener("dispose",H)}let m=0;for(let y=0;y<f.length;y++)m+=f[y];const S=u.morphTargetsRelative?1:1-m;h.getUniforms().setValue(r,"morphTargetBaseInfluence",S),h.getUniforms().setValue(r,"morphTargetInfluences",f),h.getUniforms().setValue(r,"morphTargetsTexture",p.texture,t),h.getUniforms().setValue(r,"morphTargetsTextureSize",p.size)}else{const g=f===void 0?0:f.length;let _=n[u.id];if(_===void 0||_.length!==g){_=[];for(let x=0;x<g;x++)_[x]=[x,0];n[u.id]=_}for(let x=0;x<g;x++){const T=_[x];T[0]=x,T[1]=f[x]}_.sort(ET);for(let x=0;x<8;x++)x<g&&_[x][1]?(a[x][0]=_[x][0],a[x][1]=_[x][1]):(a[x][0]=Number.MAX_SAFE_INTEGER,a[x][1]=0);a.sort(MT);const p=u.morphAttributes.position,m=u.morphAttributes.normal;let S=0;for(let x=0;x<8;x++){const T=a[x],b=T[0],M=T[1];b!==Number.MAX_SAFE_INTEGER&&M?(p&&u.getAttribute("morphTarget"+x)!==p[b]&&u.setAttribute("morphTarget"+x,p[b]),m&&u.getAttribute("morphNormal"+x)!==m[b]&&u.setAttribute("morphNormal"+x,m[b]),i[x]=M,S+=M):(p&&u.hasAttribute("morphTarget"+x)===!0&&u.deleteAttribute("morphTarget"+x),m&&u.hasAttribute("morphNormal"+x)===!0&&u.deleteAttribute("morphNormal"+x),i[x]=0)}const y=u.morphTargetsRelative?1:1-S;h.getUniforms().setValue(r,"morphTargetBaseInfluence",y),h.getUniforms().setValue(r,"morphTargetInfluences",i)}}return{update:l}}function bT(r,e,t,n){let i=new WeakMap;function s(l){const c=n.render.frame,u=l.geometry,h=e.get(l,u);if(i.get(h)!==c&&(e.update(h),i.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;i.get(f)!==c&&(f.update(),i.set(f,c))}return h}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class w_ extends Jt{constructor(e,t,n,i,s,o,a,l,c,u){if(u=u!==void 0?u:ls,u!==ls&&u!==xo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===ls&&(n=gr),n===void 0&&u===xo&&(n=as),super(null,i,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:$t,this.minFilter=l!==void 0?l:$t,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const R_=new Jt,C_=new w_(1,1);C_.compareFunction=d_;const P_=new v_,L_=new cS,D_=new b_,up=[],hp=[],fp=new Float32Array(16),dp=new Float32Array(9),pp=new Float32Array(4);function bo(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=up[i];if(s===void 0&&(s=new Float32Array(i),up[i]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,r[o].toArray(s,a)}return s}function Wt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Xt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function uc(r,e){let t=hp[e];t===void 0&&(t=new Int32Array(e),hp[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function AT(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function wT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;r.uniform2fv(this.addr,e),Xt(t,e)}}function RT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Wt(t,e))return;r.uniform3fv(this.addr,e),Xt(t,e)}}function CT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;r.uniform4fv(this.addr,e),Xt(t,e)}}function PT(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Wt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,n))return;pp.set(n),r.uniformMatrix2fv(this.addr,!1,pp),Xt(t,n)}}function LT(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Wt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,n))return;dp.set(n),r.uniformMatrix3fv(this.addr,!1,dp),Xt(t,n)}}function DT(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Wt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,n))return;fp.set(n),r.uniformMatrix4fv(this.addr,!1,fp),Xt(t,n)}}function IT(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function OT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;r.uniform2iv(this.addr,e),Xt(t,e)}}function NT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;r.uniform3iv(this.addr,e),Xt(t,e)}}function UT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;r.uniform4iv(this.addr,e),Xt(t,e)}}function FT(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function BT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;r.uniform2uiv(this.addr,e),Xt(t,e)}}function kT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;r.uniform3uiv(this.addr,e),Xt(t,e)}}function zT(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;r.uniform4uiv(this.addr,e),Xt(t,e)}}function HT(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);const s=this.type===r.SAMPLER_2D_SHADOW?C_:R_;t.setTexture2D(e||s,i)}function GT(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||L_,i)}function VT(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||D_,i)}function WT(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||P_,i)}function XT(r){switch(r){case 5126:return AT;case 35664:return wT;case 35665:return RT;case 35666:return CT;case 35674:return PT;case 35675:return LT;case 35676:return DT;case 5124:case 35670:return IT;case 35667:case 35671:return OT;case 35668:case 35672:return NT;case 35669:case 35673:return UT;case 5125:return FT;case 36294:return BT;case 36295:return kT;case 36296:return zT;case 35678:case 36198:case 36298:case 36306:case 35682:return HT;case 35679:case 36299:case 36307:return GT;case 35680:case 36300:case 36308:case 36293:return VT;case 36289:case 36303:case 36311:case 36292:return WT}}function qT(r,e){r.uniform1fv(this.addr,e)}function YT(r,e){const t=bo(e,this.size,2);r.uniform2fv(this.addr,t)}function jT(r,e){const t=bo(e,this.size,3);r.uniform3fv(this.addr,t)}function $T(r,e){const t=bo(e,this.size,4);r.uniform4fv(this.addr,t)}function KT(r,e){const t=bo(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function ZT(r,e){const t=bo(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function JT(r,e){const t=bo(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function QT(r,e){r.uniform1iv(this.addr,e)}function eb(r,e){r.uniform2iv(this.addr,e)}function tb(r,e){r.uniform3iv(this.addr,e)}function nb(r,e){r.uniform4iv(this.addr,e)}function ib(r,e){r.uniform1uiv(this.addr,e)}function rb(r,e){r.uniform2uiv(this.addr,e)}function sb(r,e){r.uniform3uiv(this.addr,e)}function ob(r,e){r.uniform4uiv(this.addr,e)}function ab(r,e,t){const n=this.cache,i=e.length,s=uc(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||R_,s[o])}function lb(r,e,t){const n=this.cache,i=e.length,s=uc(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||L_,s[o])}function cb(r,e,t){const n=this.cache,i=e.length,s=uc(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||D_,s[o])}function ub(r,e,t){const n=this.cache,i=e.length,s=uc(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||P_,s[o])}function hb(r){switch(r){case 5126:return qT;case 35664:return YT;case 35665:return jT;case 35666:return $T;case 35674:return KT;case 35675:return ZT;case 35676:return JT;case 5124:case 35670:return QT;case 35667:case 35671:return eb;case 35668:case 35672:return tb;case 35669:case 35673:return nb;case 5125:return ib;case 36294:return rb;case 36295:return sb;case 36296:return ob;case 35678:case 36198:case 36298:case 36306:case 35682:return ab;case 35679:case 36299:case 36307:return lb;case 35680:case 36300:case 36308:case 36293:return cb;case 36289:case 36303:case 36311:case 36292:return ub}}class fb{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=XT(t.type)}}class db{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=hb(t.type)}}class pb{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,o=i.length;s!==o;++s){const a=i[s];a.setValue(e,t[a.id],n)}}}const su=/(\w+)(\])?(\[|\.)?/g;function mp(r,e){r.seq.push(e),r.map[e.id]=e}function mb(r,e,t){const n=r.name,i=n.length;for(su.lastIndex=0;;){const s=su.exec(n),o=su.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){mp(t,c===void 0?new fb(a,r,e):new db(a,r,e));break}else{let h=t.map[a];h===void 0&&(h=new pb(a),mp(t,h)),t=h}}}class wl{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),o=e.getUniformLocation(t,s.name);mb(s,o,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function gp(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const gb=37297;let _b=0;function vb(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=i;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function xb(r){const e=ht.getPrimaries(ht.workingColorSpace),t=ht.getPrimaries(r);let n;switch(e===t?n="":e===Kl&&t===$l?n="LinearDisplayP3ToLinearSRGB":e===$l&&t===Kl&&(n="LinearSRGBToLinearDisplayP3"),r){case en:case ac:return[n,"LinearTransferOETF"];case It:case qh:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",r),[n,"LinearTransferOETF"]}}function _p(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+vb(r.getShaderSource(e),o)}else return i}function yb(r,e){const t=xb(e);return`vec4 ${r}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function Sb(r,e){let t;switch(e){case _y:t="Linear";break;case vy:t="Reinhard";break;case xy:t="OptimizedCineon";break;case yy:t="ACESFilmic";break;case My:t="AgX";break;case Sy:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Mb(r){return[r.extensionDerivatives||r.envMapCubeUVHeight||r.bumpMap||r.normalMapTangentSpace||r.clearcoatNormalMap||r.flatShading||r.alphaToCoverage||r.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(r.extensionFragDepth||r.logarithmicDepthBuffer)&&r.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",r.extensionDrawBuffers&&r.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(r.extensionShaderTextureLOD||r.envMap||r.transmission)&&r.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Qs).join(`
`)}function Eb(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qs).join(`
`)}function Tb(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function bb(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),o=s.name;let a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:r.getAttribLocation(e,o),locationSize:a}}return t}function Qs(r){return r!==""}function vp(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xp(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Ab=/^[ \t]*#include +<([\w\d./]+)>/gm;function rh(r){return r.replace(Ab,Rb)}const wb=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Rb(r,e){let t=et[e];if(t===void 0){const n=wb.get(e);if(n!==void 0)t=et[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return rh(t)}const Cb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function yp(r){return r.replace(Cb,Pb)}function Pb(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function Sp(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	`;return r.isWebGL2&&(e+=`precision ${r.precision} sampler3D;
		precision ${r.precision} sampler2DArray;
		precision ${r.precision} sampler2DShadow;
		precision ${r.precision} samplerCubeShadow;
		precision ${r.precision} sampler2DArrayShadow;
		precision ${r.precision} isampler2D;
		precision ${r.precision} isampler3D;
		precision ${r.precision} isamplerCube;
		precision ${r.precision} isampler2DArray;
		precision ${r.precision} usampler2D;
		precision ${r.precision} usampler3D;
		precision ${r.precision} usamplerCube;
		precision ${r.precision} usampler2DArray;
		`),r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Lb(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===e_?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===Xx?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===ki&&(e="SHADOWMAP_TYPE_VSM"),e}function Db(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case go:case _o:e="ENVMAP_TYPE_CUBE";break;case oc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Ib(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case _o:e="ENVMAP_MODE_REFRACTION";break}return e}function Ob(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case t_:e="ENVMAP_BLENDING_MULTIPLY";break;case my:e="ENVMAP_BLENDING_MIX";break;case gy:e="ENVMAP_BLENDING_ADD";break}return e}function Nb(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Ub(r,e,t,n){const i=r.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Lb(t),c=Db(t),u=Ib(t),h=Ob(t),f=Nb(t),d=t.isWebGL2?"":Mb(t),g=Eb(t),_=Tb(s),p=i.createProgram();let m,S,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Qs).join(`
`),m.length>0&&(m+=`
`),S=[d,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Qs).join(`
`),S.length>0&&(S+=`
`)):(m=[Sp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qs).join(`
`),S=[d,Sp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Mr?"#define TONE_MAPPING":"",t.toneMapping!==Mr?et.tonemapping_pars_fragment:"",t.toneMapping!==Mr?Sb("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",et.colorspace_pars_fragment,yb("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Qs).join(`
`)),o=rh(o),o=vp(o,t),o=xp(o,t),a=rh(a),a=vp(a,t),a=xp(a,t),o=yp(o),a=yp(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,S=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Fd?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Fd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+S);const x=y+m+o,T=y+S+a,b=gp(i,i.VERTEX_SHADER,x),M=gp(i,i.FRAGMENT_SHADER,T);i.attachShader(p,b),i.attachShader(p,M),t.index0AttributeName!==void 0?i.bindAttribLocation(p,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(p,0,"position"),i.linkProgram(p);function I(N){if(r.debug.checkShaderErrors){const $=i.getProgramInfoLog(p).trim(),D=i.getShaderInfoLog(b).trim(),H=i.getShaderInfoLog(M).trim();let B=!0,Y=!0;if(i.getProgramParameter(p,i.LINK_STATUS)===!1)if(B=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,p,b,M);else{const j=_p(i,b,"vertex"),K=_p(i,M,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(p,i.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+$+`
`+j+`
`+K)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(D===""||H==="")&&(Y=!1);Y&&(N.diagnostics={runnable:B,programLog:$,vertexShader:{log:D,prefix:m},fragmentShader:{log:H,prefix:S}})}i.deleteShader(b),i.deleteShader(M),O=new wl(i,p),v=bb(i,p)}let O;this.getUniforms=function(){return O===void 0&&I(this),O};let v;this.getAttributes=function(){return v===void 0&&I(this),v};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=i.getProgramParameter(p,gb)),R},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=_b++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=b,this.fragmentShader=M,this}let Fb=0;class Bb{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new kb(e),t.set(e,n)),n}}class kb{constructor(e){this.id=Fb++,this.code=e,this.usedTimes=0}}function zb(r,e,t,n,i,s,o){const a=new x_,l=new Bb,c=new Set,u=[],h=i.isWebGL2,f=i.logarithmicDepthBuffer,d=i.vertexTextures;let g=i.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(v){return c.add(v),v===0?"uv":`uv${v}`}function m(v,R,N,$,D){const H=$.fog,B=D.geometry,Y=v.isMeshStandardMaterial?$.environment:null,j=(v.isMeshStandardMaterial?t:e).get(v.envMap||Y),K=j&&j.mapping===oc?j.image.height:null,C=_[v.type];v.precision!==null&&(g=i.getMaxPrecision(v.precision),g!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",g,"instead."));const Z=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,le=Z!==void 0?Z.length:0;let Oe=0;B.morphAttributes.position!==void 0&&(Oe=1),B.morphAttributes.normal!==void 0&&(Oe=2),B.morphAttributes.color!==void 0&&(Oe=3);let X,J,fe,ve;if(C){const Qe=mi[C];X=Qe.vertexShader,J=Qe.fragmentShader}else X=v.vertexShader,J=v.fragmentShader,l.update(v),fe=l.getVertexShaderID(v),ve=l.getFragmentShaderID(v);const Ee=r.getRenderTarget(),me=D.isInstancedMesh===!0,Ke=D.isBatchedMesh===!0,De=!!v.map,k=!!v.matcap,Ve=!!j,ge=!!v.aoMap,Le=!!v.lightMap,xe=!!v.bumpMap,V=!!v.normalMap,Be=!!v.displacementMap,w=!!v.emissiveMap,E=!!v.metalnessMap,z=!!v.roughnessMap,re=v.anisotropy>0,ne=v.clearcoat>0,se=v.iridescence>0,pe=v.sheen>0,he=v.transmission>0,ce=re&&!!v.anisotropyMap,Ae=ne&&!!v.clearcoatMap,ke=ne&&!!v.clearcoatNormalMap,te=ne&&!!v.clearcoatRoughnessMap,st=se&&!!v.iridescenceMap,Ie=se&&!!v.iridescenceThicknessMap,We=pe&&!!v.sheenColorMap,we=pe&&!!v.sheenRoughnessMap,_e=!!v.specularMap,Xe=!!v.specularColorMap,L=!!v.specularIntensityMap,oe=he&&!!v.transmissionMap,Q=he&&!!v.thicknessMap,Ce=!!v.gradientMap,P=!!v.alphaMap,ie=v.alphaTest>0,ee=!!v.alphaHash,Se=!!v.extensions;let Ne=Mr;v.toneMapped&&(Ee===null||Ee.isXRRenderTarget===!0)&&(Ne=r.toneMapping);const Je={isWebGL2:h,shaderID:C,shaderType:v.type,shaderName:v.name,vertexShader:X,fragmentShader:J,defines:v.defines,customVertexShaderID:fe,customFragmentShaderID:ve,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:g,batching:Ke,instancing:me,instancingColor:me&&D.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:Ee===null?r.outputColorSpace:Ee.isXRRenderTarget===!0?Ee.texture.colorSpace:en,alphaToCoverage:!!v.alphaToCoverage,map:De,matcap:k,envMap:Ve,envMapMode:Ve&&j.mapping,envMapCubeUVHeight:K,aoMap:ge,lightMap:Le,bumpMap:xe,normalMap:V,displacementMap:d&&Be,emissiveMap:w,normalMapObjectSpace:V&&v.normalMapType===Uy,normalMapTangentSpace:V&&v.normalMapType===f_,metalnessMap:E,roughnessMap:z,anisotropy:re,anisotropyMap:ce,clearcoat:ne,clearcoatMap:Ae,clearcoatNormalMap:ke,clearcoatRoughnessMap:te,iridescence:se,iridescenceMap:st,iridescenceThicknessMap:Ie,sheen:pe,sheenColorMap:We,sheenRoughnessMap:we,specularMap:_e,specularColorMap:Xe,specularIntensityMap:L,transmission:he,transmissionMap:oe,thicknessMap:Q,gradientMap:Ce,opaque:v.transparent===!1&&v.blending===oo&&v.alphaToCoverage===!1,alphaMap:P,alphaTest:ie,alphaHash:ee,combine:v.combine,mapUv:De&&p(v.map.channel),aoMapUv:ge&&p(v.aoMap.channel),lightMapUv:Le&&p(v.lightMap.channel),bumpMapUv:xe&&p(v.bumpMap.channel),normalMapUv:V&&p(v.normalMap.channel),displacementMapUv:Be&&p(v.displacementMap.channel),emissiveMapUv:w&&p(v.emissiveMap.channel),metalnessMapUv:E&&p(v.metalnessMap.channel),roughnessMapUv:z&&p(v.roughnessMap.channel),anisotropyMapUv:ce&&p(v.anisotropyMap.channel),clearcoatMapUv:Ae&&p(v.clearcoatMap.channel),clearcoatNormalMapUv:ke&&p(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&p(v.clearcoatRoughnessMap.channel),iridescenceMapUv:st&&p(v.iridescenceMap.channel),iridescenceThicknessMapUv:Ie&&p(v.iridescenceThicknessMap.channel),sheenColorMapUv:We&&p(v.sheenColorMap.channel),sheenRoughnessMapUv:we&&p(v.sheenRoughnessMap.channel),specularMapUv:_e&&p(v.specularMap.channel),specularColorMapUv:Xe&&p(v.specularColorMap.channel),specularIntensityMapUv:L&&p(v.specularIntensityMap.channel),transmissionMapUv:oe&&p(v.transmissionMap.channel),thicknessMapUv:Q&&p(v.thicknessMap.channel),alphaMapUv:P&&p(v.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(V||re),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!B.attributes.uv&&(De||P),fog:!!H,useFog:v.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,skinning:D.isSkinnedMesh===!0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:le,morphTextureStride:Oe,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:r.shadowMap.enabled&&N.length>0,shadowMapType:r.shadowMap.type,toneMapping:Ne,useLegacyLights:r._useLegacyLights,decodeVideoTexture:De&&v.map.isVideoTexture===!0&&ht.getTransfer(v.map.colorSpace)===Et,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===_i,flipSided:v.side===Dn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:Se&&v.extensions.derivatives===!0,extensionFragDepth:Se&&v.extensions.fragDepth===!0,extensionDrawBuffers:Se&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:Se&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:Se&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:Se&&v.extensions.multiDraw===!0&&n.has("WEBGL_multi_draw"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Je.vertexUv1s=c.has(1),Je.vertexUv2s=c.has(2),Je.vertexUv3s=c.has(3),c.clear(),Je}function S(v){const R=[];if(v.shaderID?R.push(v.shaderID):(R.push(v.customVertexShaderID),R.push(v.customFragmentShaderID)),v.defines!==void 0)for(const N in v.defines)R.push(N),R.push(v.defines[N]);return v.isRawShaderMaterial===!1&&(y(R,v),x(R,v),R.push(r.outputColorSpace)),R.push(v.customProgramCacheKey),R.join()}function y(v,R){v.push(R.precision),v.push(R.outputColorSpace),v.push(R.envMapMode),v.push(R.envMapCubeUVHeight),v.push(R.mapUv),v.push(R.alphaMapUv),v.push(R.lightMapUv),v.push(R.aoMapUv),v.push(R.bumpMapUv),v.push(R.normalMapUv),v.push(R.displacementMapUv),v.push(R.emissiveMapUv),v.push(R.metalnessMapUv),v.push(R.roughnessMapUv),v.push(R.anisotropyMapUv),v.push(R.clearcoatMapUv),v.push(R.clearcoatNormalMapUv),v.push(R.clearcoatRoughnessMapUv),v.push(R.iridescenceMapUv),v.push(R.iridescenceThicknessMapUv),v.push(R.sheenColorMapUv),v.push(R.sheenRoughnessMapUv),v.push(R.specularMapUv),v.push(R.specularColorMapUv),v.push(R.specularIntensityMapUv),v.push(R.transmissionMapUv),v.push(R.thicknessMapUv),v.push(R.combine),v.push(R.fogExp2),v.push(R.sizeAttenuation),v.push(R.morphTargetsCount),v.push(R.morphAttributeCount),v.push(R.numDirLights),v.push(R.numPointLights),v.push(R.numSpotLights),v.push(R.numSpotLightMaps),v.push(R.numHemiLights),v.push(R.numRectAreaLights),v.push(R.numDirLightShadows),v.push(R.numPointLightShadows),v.push(R.numSpotLightShadows),v.push(R.numSpotLightShadowsWithMaps),v.push(R.numLightProbes),v.push(R.shadowMapType),v.push(R.toneMapping),v.push(R.numClippingPlanes),v.push(R.numClipIntersection),v.push(R.depthPacking)}function x(v,R){a.disableAll(),R.isWebGL2&&a.enable(0),R.supportsVertexTextures&&a.enable(1),R.instancing&&a.enable(2),R.instancingColor&&a.enable(3),R.matcap&&a.enable(4),R.envMap&&a.enable(5),R.normalMapObjectSpace&&a.enable(6),R.normalMapTangentSpace&&a.enable(7),R.clearcoat&&a.enable(8),R.iridescence&&a.enable(9),R.alphaTest&&a.enable(10),R.vertexColors&&a.enable(11),R.vertexAlphas&&a.enable(12),R.vertexUv1s&&a.enable(13),R.vertexUv2s&&a.enable(14),R.vertexUv3s&&a.enable(15),R.vertexTangents&&a.enable(16),R.anisotropy&&a.enable(17),R.alphaHash&&a.enable(18),R.batching&&a.enable(19),v.push(a.mask),a.disableAll(),R.fog&&a.enable(0),R.useFog&&a.enable(1),R.flatShading&&a.enable(2),R.logarithmicDepthBuffer&&a.enable(3),R.skinning&&a.enable(4),R.morphTargets&&a.enable(5),R.morphNormals&&a.enable(6),R.morphColors&&a.enable(7),R.premultipliedAlpha&&a.enable(8),R.shadowMapEnabled&&a.enable(9),R.useLegacyLights&&a.enable(10),R.doubleSided&&a.enable(11),R.flipSided&&a.enable(12),R.useDepthPacking&&a.enable(13),R.dithering&&a.enable(14),R.transmission&&a.enable(15),R.sheen&&a.enable(16),R.opaque&&a.enable(17),R.pointsUvs&&a.enable(18),R.decodeVideoTexture&&a.enable(19),R.alphaToCoverage&&a.enable(20),v.push(a.mask)}function T(v){const R=_[v.type];let N;if(R){const $=mi[R];N=MS.clone($.uniforms)}else N=v.uniforms;return N}function b(v,R){let N;for(let $=0,D=u.length;$<D;$++){const H=u[$];if(H.cacheKey===R){N=H,++N.usedTimes;break}}return N===void 0&&(N=new Ub(r,R,v,s),u.push(N)),N}function M(v){if(--v.usedTimes===0){const R=u.indexOf(v);u[R]=u[u.length-1],u.pop(),v.destroy()}}function I(v){l.remove(v)}function O(){l.dispose()}return{getParameters:m,getProgramCacheKey:S,getUniforms:T,acquireProgram:b,releaseProgram:M,releaseShaderCache:I,programs:u,dispose:O}}function Hb(){let r=new WeakMap;function e(s){let o=r.get(s);return o===void 0&&(o={},r.set(s,o)),o}function t(s){r.delete(s)}function n(s,o,a){r.get(s)[o]=a}function i(){r=new WeakMap}return{get:e,remove:t,update:n,dispose:i}}function Gb(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function Mp(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Ep(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function o(h,f,d,g,_,p){let m=r[e];return m===void 0?(m={id:h.id,object:h,geometry:f,material:d,groupOrder:g,renderOrder:h.renderOrder,z:_,group:p},r[e]=m):(m.id=h.id,m.object=h,m.geometry=f,m.material=d,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=_,m.group=p),e++,m}function a(h,f,d,g,_,p){const m=o(h,f,d,g,_,p);d.transmission>0?n.push(m):d.transparent===!0?i.push(m):t.push(m)}function l(h,f,d,g,_,p){const m=o(h,f,d,g,_,p);d.transmission>0?n.unshift(m):d.transparent===!0?i.unshift(m):t.unshift(m)}function c(h,f){t.length>1&&t.sort(h||Gb),n.length>1&&n.sort(f||Mp),i.length>1&&i.sort(f||Mp)}function u(){for(let h=e,f=r.length;h<f;h++){const d=r[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:a,unshift:l,finish:u,sort:c}}function Vb(){let r=new WeakMap;function e(n,i){const s=r.get(n);let o;return s===void 0?(o=new Ep,r.set(n,[o])):i>=s.length?(o=new Ep,s.push(o)):o=s[i],o}function t(){r=new WeakMap}return{get:e,dispose:t}}function Wb(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new U,color:new Ze};break;case"SpotLight":t={position:new U,direction:new U,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new U,halfWidth:new U,halfHeight:new U};break}return r[e.id]=t,t}}}function Xb(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let qb=0;function Yb(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function jb(r,e){const t=new Wb,n=Xb(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new U);const s=new U,o=new rt,a=new rt;function l(u,h){let f=0,d=0,g=0;for(let N=0;N<9;N++)i.probe[N].set(0,0,0);let _=0,p=0,m=0,S=0,y=0,x=0,T=0,b=0,M=0,I=0,O=0;u.sort(Yb);const v=h===!0?Math.PI:1;for(let N=0,$=u.length;N<$;N++){const D=u[N],H=D.color,B=D.intensity,Y=D.distance,j=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)f+=H.r*B*v,d+=H.g*B*v,g+=H.b*B*v;else if(D.isLightProbe){for(let K=0;K<9;K++)i.probe[K].addScaledVector(D.sh.coefficients[K],B);O++}else if(D.isDirectionalLight){const K=t.get(D);if(K.color.copy(D.color).multiplyScalar(D.intensity*v),D.castShadow){const C=D.shadow,Z=n.get(D);Z.shadowBias=C.bias,Z.shadowNormalBias=C.normalBias,Z.shadowRadius=C.radius,Z.shadowMapSize=C.mapSize,i.directionalShadow[_]=Z,i.directionalShadowMap[_]=j,i.directionalShadowMatrix[_]=D.shadow.matrix,x++}i.directional[_]=K,_++}else if(D.isSpotLight){const K=t.get(D);K.position.setFromMatrixPosition(D.matrixWorld),K.color.copy(H).multiplyScalar(B*v),K.distance=Y,K.coneCos=Math.cos(D.angle),K.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),K.decay=D.decay,i.spot[m]=K;const C=D.shadow;if(D.map&&(i.spotLightMap[M]=D.map,M++,C.updateMatrices(D),D.castShadow&&I++),i.spotLightMatrix[m]=C.matrix,D.castShadow){const Z=n.get(D);Z.shadowBias=C.bias,Z.shadowNormalBias=C.normalBias,Z.shadowRadius=C.radius,Z.shadowMapSize=C.mapSize,i.spotShadow[m]=Z,i.spotShadowMap[m]=j,b++}m++}else if(D.isRectAreaLight){const K=t.get(D);K.color.copy(H).multiplyScalar(B),K.halfWidth.set(D.width*.5,0,0),K.halfHeight.set(0,D.height*.5,0),i.rectArea[S]=K,S++}else if(D.isPointLight){const K=t.get(D);if(K.color.copy(D.color).multiplyScalar(D.intensity*v),K.distance=D.distance,K.decay=D.decay,D.castShadow){const C=D.shadow,Z=n.get(D);Z.shadowBias=C.bias,Z.shadowNormalBias=C.normalBias,Z.shadowRadius=C.radius,Z.shadowMapSize=C.mapSize,Z.shadowCameraNear=C.camera.near,Z.shadowCameraFar=C.camera.far,i.pointShadow[p]=Z,i.pointShadowMap[p]=j,i.pointShadowMatrix[p]=D.shadow.matrix,T++}i.point[p]=K,p++}else if(D.isHemisphereLight){const K=t.get(D);K.skyColor.copy(D.color).multiplyScalar(B*v),K.groundColor.copy(D.groundColor).multiplyScalar(B*v),i.hemi[y]=K,y++}}S>0&&(e.isWebGL2?r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=de.LTC_FLOAT_1,i.rectAreaLTC2=de.LTC_FLOAT_2):(i.rectAreaLTC1=de.LTC_HALF_1,i.rectAreaLTC2=de.LTC_HALF_2):r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=de.LTC_FLOAT_1,i.rectAreaLTC2=de.LTC_FLOAT_2):r.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=de.LTC_HALF_1,i.rectAreaLTC2=de.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=f,i.ambient[1]=d,i.ambient[2]=g;const R=i.hash;(R.directionalLength!==_||R.pointLength!==p||R.spotLength!==m||R.rectAreaLength!==S||R.hemiLength!==y||R.numDirectionalShadows!==x||R.numPointShadows!==T||R.numSpotShadows!==b||R.numSpotMaps!==M||R.numLightProbes!==O)&&(i.directional.length=_,i.spot.length=m,i.rectArea.length=S,i.point.length=p,i.hemi.length=y,i.directionalShadow.length=x,i.directionalShadowMap.length=x,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=x,i.pointShadowMatrix.length=T,i.spotLightMatrix.length=b+M-I,i.spotLightMap.length=M,i.numSpotLightShadowsWithMaps=I,i.numLightProbes=O,R.directionalLength=_,R.pointLength=p,R.spotLength=m,R.rectAreaLength=S,R.hemiLength=y,R.numDirectionalShadows=x,R.numPointShadows=T,R.numSpotShadows=b,R.numSpotMaps=M,R.numLightProbes=O,i.version=qb++)}function c(u,h){let f=0,d=0,g=0,_=0,p=0;const m=h.matrixWorldInverse;for(let S=0,y=u.length;S<y;S++){const x=u[S];if(x.isDirectionalLight){const T=i.directional[f];T.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),f++}else if(x.isSpotLight){const T=i.spot[g];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),T.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),g++}else if(x.isRectAreaLight){const T=i.rectArea[_];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),a.identity(),o.copy(x.matrixWorld),o.premultiply(m),a.extractRotation(o),T.halfWidth.set(x.width*.5,0,0),T.halfHeight.set(0,x.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),_++}else if(x.isPointLight){const T=i.point[d];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),d++}else if(x.isHemisphereLight){const T=i.hemi[p];T.direction.setFromMatrixPosition(x.matrixWorld),T.direction.transformDirection(m),p++}}}return{setup:l,setupView:c,state:i}}function Tp(r,e){const t=new jb(r,e),n=[],i=[];function s(){n.length=0,i.length=0}function o(h){n.push(h)}function a(h){i.push(h)}function l(h){t.setup(n,h)}function c(h){t.setupView(n,h)}return{init:s,state:{lightsArray:n,shadowsArray:i,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function $b(r,e){let t=new WeakMap;function n(s,o=0){const a=t.get(s);let l;return a===void 0?(l=new Tp(r,e),t.set(s,[l])):o>=a.length?(l=new Tp(r,e),a.push(l)):l=a[o],l}function i(){t=new WeakMap}return{get:n,dispose:i}}class Kb extends Ai{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Oy,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Zb extends Ai{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Jb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Qb=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function eA(r,e,t){let n=new jh;const i=new qe,s=new qe,o=new vt,a=new Kb({depthPacking:Ny}),l=new Zb,c={},u=t.maxTextureSize,h={[Ki]:Dn,[Dn]:Ki,[_i]:_i},f=new wr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new qe},radius:{value:4}},vertexShader:Jb,fragmentShader:Qb}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const g=new Pi;g.setAttribute("position",new An(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Vn(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=e_;let m=this.type;this.render=function(b,M,I){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||b.length===0)return;const O=r.getRenderTarget(),v=r.getActiveCubeFace(),R=r.getActiveMipmapLevel(),N=r.state;N.setBlending(Sr),N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const $=m!==ki&&this.type===ki,D=m===ki&&this.type!==ki;for(let H=0,B=b.length;H<B;H++){const Y=b[H],j=Y.shadow;if(j===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(j.autoUpdate===!1&&j.needsUpdate===!1)continue;i.copy(j.mapSize);const K=j.getFrameExtents();if(i.multiply(K),s.copy(j.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(s.x=Math.floor(u/K.x),i.x=s.x*K.x,j.mapSize.x=s.x),i.y>u&&(s.y=Math.floor(u/K.y),i.y=s.y*K.y,j.mapSize.y=s.y)),j.map===null||$===!0||D===!0){const Z=this.type!==ki?{minFilter:$t,magFilter:$t}:{};j.map!==null&&j.map.dispose(),j.map=new _s(i.x,i.y,Z),j.map.texture.name=Y.name+".shadowMap",j.camera.updateProjectionMatrix()}r.setRenderTarget(j.map),r.clear();const C=j.getViewportCount();for(let Z=0;Z<C;Z++){const le=j.getViewport(Z);o.set(s.x*le.x,s.y*le.y,s.x*le.z,s.y*le.w),N.viewport(o),j.updateMatrices(Y,Z),n=j.getFrustum(),x(M,I,j.camera,Y,this.type)}j.isPointLightShadow!==!0&&this.type===ki&&S(j,I),j.needsUpdate=!1}m=this.type,p.needsUpdate=!1,r.setRenderTarget(O,v,R)};function S(b,M){const I=e.update(_);f.defines.VSM_SAMPLES!==b.blurSamples&&(f.defines.VSM_SAMPLES=b.blurSamples,d.defines.VSM_SAMPLES=b.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new _s(i.x,i.y)),f.uniforms.shadow_pass.value=b.map.texture,f.uniforms.resolution.value=b.mapSize,f.uniforms.radius.value=b.radius,r.setRenderTarget(b.mapPass),r.clear(),r.renderBufferDirect(M,null,I,f,_,null),d.uniforms.shadow_pass.value=b.mapPass.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,r.setRenderTarget(b.map),r.clear(),r.renderBufferDirect(M,null,I,d,_,null)}function y(b,M,I,O){let v=null;const R=I.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(R!==void 0)v=R;else if(v=I.isPointLight===!0?l:a,r.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0){const N=v.uuid,$=M.uuid;let D=c[N];D===void 0&&(D={},c[N]=D);let H=D[$];H===void 0&&(H=v.clone(),D[$]=H,M.addEventListener("dispose",T)),v=H}if(v.visible=M.visible,v.wireframe=M.wireframe,O===ki?v.side=M.shadowSide!==null?M.shadowSide:M.side:v.side=M.shadowSide!==null?M.shadowSide:h[M.side],v.alphaMap=M.alphaMap,v.alphaTest=M.alphaTest,v.map=M.map,v.clipShadows=M.clipShadows,v.clippingPlanes=M.clippingPlanes,v.clipIntersection=M.clipIntersection,v.displacementMap=M.displacementMap,v.displacementScale=M.displacementScale,v.displacementBias=M.displacementBias,v.wireframeLinewidth=M.wireframeLinewidth,v.linewidth=M.linewidth,I.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const N=r.properties.get(v);N.light=I}return v}function x(b,M,I,O,v){if(b.visible===!1)return;if(b.layers.test(M.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&v===ki)&&(!b.frustumCulled||n.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,b.matrixWorld);const $=e.update(b),D=b.material;if(Array.isArray(D)){const H=$.groups;for(let B=0,Y=H.length;B<Y;B++){const j=H[B],K=D[j.materialIndex];if(K&&K.visible){const C=y(b,K,O,v);b.onBeforeShadow(r,b,M,I,$,C,j),r.renderBufferDirect(I,null,$,C,b,j),b.onAfterShadow(r,b,M,I,$,C,j)}}}else if(D.visible){const H=y(b,D,O,v);b.onBeforeShadow(r,b,M,I,$,H,null),r.renderBufferDirect(I,null,$,H,b,null),b.onAfterShadow(r,b,M,I,$,H,null)}}const N=b.children;for(let $=0,D=N.length;$<D;$++)x(N[$],M,I,O,v)}function T(b){b.target.removeEventListener("dispose",T);for(const I in c){const O=c[I],v=b.target.uuid;v in O&&(O[v].dispose(),delete O[v])}}}function tA(r,e,t){const n=t.isWebGL2;function i(){let P=!1;const ie=new vt;let ee=null;const Se=new vt(0,0,0,0);return{setMask:function(Ne){ee!==Ne&&!P&&(r.colorMask(Ne,Ne,Ne,Ne),ee=Ne)},setLocked:function(Ne){P=Ne},setClear:function(Ne,Je,Qe,ye,Me){Me===!0&&(Ne*=ye,Je*=ye,Qe*=ye),ie.set(Ne,Je,Qe,ye),Se.equals(ie)===!1&&(r.clearColor(Ne,Je,Qe,ye),Se.copy(ie))},reset:function(){P=!1,ee=null,Se.set(-1,0,0,0)}}}function s(){let P=!1,ie=null,ee=null,Se=null;return{setTest:function(Ne){Ne?me(r.DEPTH_TEST):Ke(r.DEPTH_TEST)},setMask:function(Ne){ie!==Ne&&!P&&(r.depthMask(Ne),ie=Ne)},setFunc:function(Ne){if(ee!==Ne){switch(Ne){case ly:r.depthFunc(r.NEVER);break;case cy:r.depthFunc(r.ALWAYS);break;case uy:r.depthFunc(r.LESS);break;case ql:r.depthFunc(r.LEQUAL);break;case hy:r.depthFunc(r.EQUAL);break;case fy:r.depthFunc(r.GEQUAL);break;case dy:r.depthFunc(r.GREATER);break;case py:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}ee=Ne}},setLocked:function(Ne){P=Ne},setClear:function(Ne){Se!==Ne&&(r.clearDepth(Ne),Se=Ne)},reset:function(){P=!1,ie=null,ee=null,Se=null}}}function o(){let P=!1,ie=null,ee=null,Se=null,Ne=null,Je=null,Qe=null,ye=null,Me=null;return{setTest:function(be){P||(be?me(r.STENCIL_TEST):Ke(r.STENCIL_TEST))},setMask:function(be){ie!==be&&!P&&(r.stencilMask(be),ie=be)},setFunc:function(be,ae,Fe){(ee!==be||Se!==ae||Ne!==Fe)&&(r.stencilFunc(be,ae,Fe),ee=be,Se=ae,Ne=Fe)},setOp:function(be,ae,Fe){(Je!==be||Qe!==ae||ye!==Fe)&&(r.stencilOp(be,ae,Fe),Je=be,Qe=ae,ye=Fe)},setLocked:function(be){P=be},setClear:function(be){Me!==be&&(r.clearStencil(be),Me=be)},reset:function(){P=!1,ie=null,ee=null,Se=null,Ne=null,Je=null,Qe=null,ye=null,Me=null}}}const a=new i,l=new s,c=new o,u=new WeakMap,h=new WeakMap;let f={},d={},g=new WeakMap,_=[],p=null,m=!1,S=null,y=null,x=null,T=null,b=null,M=null,I=null,O=new Ze(0,0,0),v=0,R=!1,N=null,$=null,D=null,H=null,B=null;const Y=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let j=!1,K=0;const C=r.getParameter(r.VERSION);C.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(C)[1]),j=K>=1):C.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(C)[1]),j=K>=2);let Z=null,le={};const Oe=r.getParameter(r.SCISSOR_BOX),X=r.getParameter(r.VIEWPORT),J=new vt().fromArray(Oe),fe=new vt().fromArray(X);function ve(P,ie,ee,Se){const Ne=new Uint8Array(4),Je=r.createTexture();r.bindTexture(P,Je),r.texParameteri(P,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(P,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Qe=0;Qe<ee;Qe++)n&&(P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY)?r.texImage3D(ie,0,r.RGBA,1,1,Se,0,r.RGBA,r.UNSIGNED_BYTE,Ne):r.texImage2D(ie+Qe,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Ne);return Je}const Ee={};Ee[r.TEXTURE_2D]=ve(r.TEXTURE_2D,r.TEXTURE_2D,1),Ee[r.TEXTURE_CUBE_MAP]=ve(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Ee[r.TEXTURE_2D_ARRAY]=ve(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),Ee[r.TEXTURE_3D]=ve(r.TEXTURE_3D,r.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),me(r.DEPTH_TEST),l.setFunc(ql),Be(!1),w(td),me(r.CULL_FACE),xe(Sr);function me(P){f[P]!==!0&&(r.enable(P),f[P]=!0)}function Ke(P){f[P]!==!1&&(r.disable(P),f[P]=!1)}function De(P,ie){return d[P]!==ie?(r.bindFramebuffer(P,ie),d[P]=ie,n&&(P===r.DRAW_FRAMEBUFFER&&(d[r.FRAMEBUFFER]=ie),P===r.FRAMEBUFFER&&(d[r.DRAW_FRAMEBUFFER]=ie)),!0):!1}function k(P,ie){let ee=_,Se=!1;if(P)if(ee=g.get(ie),ee===void 0&&(ee=[],g.set(ie,ee)),P.isWebGLMultipleRenderTargets){const Ne=P.texture;if(ee.length!==Ne.length||ee[0]!==r.COLOR_ATTACHMENT0){for(let Je=0,Qe=Ne.length;Je<Qe;Je++)ee[Je]=r.COLOR_ATTACHMENT0+Je;ee.length=Ne.length,Se=!0}}else ee[0]!==r.COLOR_ATTACHMENT0&&(ee[0]=r.COLOR_ATTACHMENT0,Se=!0);else ee[0]!==r.BACK&&(ee[0]=r.BACK,Se=!0);Se&&(t.isWebGL2?r.drawBuffers(ee):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ee))}function Ve(P){return p!==P?(r.useProgram(P),p=P,!0):!1}const ge={[Vr]:r.FUNC_ADD,[Yx]:r.FUNC_SUBTRACT,[jx]:r.FUNC_REVERSE_SUBTRACT};if(n)ge[sd]=r.MIN,ge[od]=r.MAX;else{const P=e.get("EXT_blend_minmax");P!==null&&(ge[sd]=P.MIN_EXT,ge[od]=P.MAX_EXT)}const Le={[$x]:r.ZERO,[Kx]:r.ONE,[Zx]:r.SRC_COLOR,[$u]:r.SRC_ALPHA,[iy]:r.SRC_ALPHA_SATURATE,[ty]:r.DST_COLOR,[Qx]:r.DST_ALPHA,[Jx]:r.ONE_MINUS_SRC_COLOR,[Ku]:r.ONE_MINUS_SRC_ALPHA,[ny]:r.ONE_MINUS_DST_COLOR,[ey]:r.ONE_MINUS_DST_ALPHA,[ry]:r.CONSTANT_COLOR,[sy]:r.ONE_MINUS_CONSTANT_COLOR,[oy]:r.CONSTANT_ALPHA,[ay]:r.ONE_MINUS_CONSTANT_ALPHA};function xe(P,ie,ee,Se,Ne,Je,Qe,ye,Me,be){if(P===Sr){m===!0&&(Ke(r.BLEND),m=!1);return}if(m===!1&&(me(r.BLEND),m=!0),P!==qx){if(P!==S||be!==R){if((y!==Vr||b!==Vr)&&(r.blendEquation(r.FUNC_ADD),y=Vr,b=Vr),be)switch(P){case oo:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nd:r.blendFunc(r.ONE,r.ONE);break;case id:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case rd:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}else switch(P){case oo:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nd:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case id:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case rd:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}x=null,T=null,M=null,I=null,O.set(0,0,0),v=0,S=P,R=be}return}Ne=Ne||ie,Je=Je||ee,Qe=Qe||Se,(ie!==y||Ne!==b)&&(r.blendEquationSeparate(ge[ie],ge[Ne]),y=ie,b=Ne),(ee!==x||Se!==T||Je!==M||Qe!==I)&&(r.blendFuncSeparate(Le[ee],Le[Se],Le[Je],Le[Qe]),x=ee,T=Se,M=Je,I=Qe),(ye.equals(O)===!1||Me!==v)&&(r.blendColor(ye.r,ye.g,ye.b,Me),O.copy(ye),v=Me),S=P,R=!1}function V(P,ie){P.side===_i?Ke(r.CULL_FACE):me(r.CULL_FACE);let ee=P.side===Dn;ie&&(ee=!ee),Be(ee),P.blending===oo&&P.transparent===!1?xe(Sr):xe(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),l.setFunc(P.depthFunc),l.setTest(P.depthTest),l.setMask(P.depthWrite),a.setMask(P.colorWrite);const Se=P.stencilWrite;c.setTest(Se),Se&&(c.setMask(P.stencilWriteMask),c.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),c.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),z(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?me(r.SAMPLE_ALPHA_TO_COVERAGE):Ke(r.SAMPLE_ALPHA_TO_COVERAGE)}function Be(P){N!==P&&(P?r.frontFace(r.CW):r.frontFace(r.CCW),N=P)}function w(P){P!==Vx?(me(r.CULL_FACE),P!==$&&(P===td?r.cullFace(r.BACK):P===Wx?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):Ke(r.CULL_FACE),$=P}function E(P){P!==D&&(j&&r.lineWidth(P),D=P)}function z(P,ie,ee){P?(me(r.POLYGON_OFFSET_FILL),(H!==ie||B!==ee)&&(r.polygonOffset(ie,ee),H=ie,B=ee)):Ke(r.POLYGON_OFFSET_FILL)}function re(P){P?me(r.SCISSOR_TEST):Ke(r.SCISSOR_TEST)}function ne(P){P===void 0&&(P=r.TEXTURE0+Y-1),Z!==P&&(r.activeTexture(P),Z=P)}function se(P,ie,ee){ee===void 0&&(Z===null?ee=r.TEXTURE0+Y-1:ee=Z);let Se=le[ee];Se===void 0&&(Se={type:void 0,texture:void 0},le[ee]=Se),(Se.type!==P||Se.texture!==ie)&&(Z!==ee&&(r.activeTexture(ee),Z=ee),r.bindTexture(P,ie||Ee[P]),Se.type=P,Se.texture=ie)}function pe(){const P=le[Z];P!==void 0&&P.type!==void 0&&(r.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function he(){try{r.compressedTexImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ce(){try{r.compressedTexImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Ae(){try{r.texSubImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ke(){try{r.texSubImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function te(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function st(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Ie(){try{r.texStorage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function We(){try{r.texStorage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function we(){try{r.texImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function _e(){try{r.texImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Xe(P){J.equals(P)===!1&&(r.scissor(P.x,P.y,P.z,P.w),J.copy(P))}function L(P){fe.equals(P)===!1&&(r.viewport(P.x,P.y,P.z,P.w),fe.copy(P))}function oe(P,ie){let ee=h.get(ie);ee===void 0&&(ee=new WeakMap,h.set(ie,ee));let Se=ee.get(P);Se===void 0&&(Se=r.getUniformBlockIndex(ie,P.name),ee.set(P,Se))}function Q(P,ie){const Se=h.get(ie).get(P);u.get(ie)!==Se&&(r.uniformBlockBinding(ie,Se,P.__bindingPointIndex),u.set(ie,Se))}function Ce(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),n===!0&&(r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null)),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),f={},Z=null,le={},d={},g=new WeakMap,_=[],p=null,m=!1,S=null,y=null,x=null,T=null,b=null,M=null,I=null,O=new Ze(0,0,0),v=0,R=!1,N=null,$=null,D=null,H=null,B=null,J.set(0,0,r.canvas.width,r.canvas.height),fe.set(0,0,r.canvas.width,r.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:me,disable:Ke,bindFramebuffer:De,drawBuffers:k,useProgram:Ve,setBlending:xe,setMaterial:V,setFlipSided:Be,setCullFace:w,setLineWidth:E,setPolygonOffset:z,setScissorTest:re,activeTexture:ne,bindTexture:se,unbindTexture:pe,compressedTexImage2D:he,compressedTexImage3D:ce,texImage2D:we,texImage3D:_e,updateUBOMapping:oe,uniformBlockBinding:Q,texStorage2D:Ie,texStorage3D:We,texSubImage2D:Ae,texSubImage3D:ke,compressedTexSubImage2D:te,compressedTexSubImage3D:st,scissor:Xe,viewport:L,reset:Ce}}function nA(r,e,t,n,i,s,o){const a=i.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap;let h;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,E){return d?new OffscreenCanvas(w,E):Sa("canvas")}function _(w,E,z,re){let ne=1;if((w.width>re||w.height>re)&&(ne=re/Math.max(w.width,w.height)),ne<1||E===!0)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap){const se=E?Jl:Math.floor,pe=se(ne*w.width),he=se(ne*w.height);h===void 0&&(h=g(pe,he));const ce=z?g(pe,he):h;return ce.width=pe,ce.height=he,ce.getContext("2d").drawImage(w,0,0,pe,he),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+w.width+"x"+w.height+") to ("+pe+"x"+he+")."),ce}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+w.width+"x"+w.height+")."),w;return w}function p(w){return ih(w.width)&&ih(w.height)}function m(w){return a?!1:w.wrapS!==Jn||w.wrapT!==Jn||w.minFilter!==$t&&w.minFilter!==cn}function S(w,E){return w.generateMipmaps&&E&&w.minFilter!==$t&&w.minFilter!==cn}function y(w){r.generateMipmap(w)}function x(w,E,z,re,ne=!1){if(a===!1)return E;if(w!==null){if(r[w]!==void 0)return r[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let se=E;if(E===r.RED&&(z===r.FLOAT&&(se=r.R32F),z===r.HALF_FLOAT&&(se=r.R16F),z===r.UNSIGNED_BYTE&&(se=r.R8)),E===r.RED_INTEGER&&(z===r.UNSIGNED_BYTE&&(se=r.R8UI),z===r.UNSIGNED_SHORT&&(se=r.R16UI),z===r.UNSIGNED_INT&&(se=r.R32UI),z===r.BYTE&&(se=r.R8I),z===r.SHORT&&(se=r.R16I),z===r.INT&&(se=r.R32I)),E===r.RG&&(z===r.FLOAT&&(se=r.RG32F),z===r.HALF_FLOAT&&(se=r.RG16F),z===r.UNSIGNED_BYTE&&(se=r.RG8)),E===r.RGBA){const pe=ne?jl:ht.getTransfer(re);z===r.FLOAT&&(se=r.RGBA32F),z===r.HALF_FLOAT&&(se=r.RGBA16F),z===r.UNSIGNED_BYTE&&(se=pe===Et?r.SRGB8_ALPHA8:r.RGBA8),z===r.UNSIGNED_SHORT_4_4_4_4&&(se=r.RGBA4),z===r.UNSIGNED_SHORT_5_5_5_1&&(se=r.RGB5_A1)}return(se===r.R16F||se===r.R32F||se===r.RG16F||se===r.RG32F||se===r.RGBA16F||se===r.RGBA32F)&&e.get("EXT_color_buffer_float"),se}function T(w,E,z){return S(w,z)===!0||w.isFramebufferTexture&&w.minFilter!==$t&&w.minFilter!==cn?Math.log2(Math.max(E.width,E.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?E.mipmaps.length:1}function b(w){return w===$t||w===Qu||w===Ys?r.NEAREST:r.LINEAR}function M(w){const E=w.target;E.removeEventListener("dispose",M),O(E),E.isVideoTexture&&u.delete(E)}function I(w){const E=w.target;E.removeEventListener("dispose",I),R(E)}function O(w){const E=n.get(w);if(E.__webglInit===void 0)return;const z=w.source,re=f.get(z);if(re){const ne=re[E.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&v(w),Object.keys(re).length===0&&f.delete(z)}n.remove(w)}function v(w){const E=n.get(w);r.deleteTexture(E.__webglTexture);const z=w.source,re=f.get(z);delete re[E.__cacheKey],o.memory.textures--}function R(w){const E=w.texture,z=n.get(w),re=n.get(E);if(re.__webglTexture!==void 0&&(r.deleteTexture(re.__webglTexture),o.memory.textures--),w.depthTexture&&w.depthTexture.dispose(),w.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(z.__webglFramebuffer[ne]))for(let se=0;se<z.__webglFramebuffer[ne].length;se++)r.deleteFramebuffer(z.__webglFramebuffer[ne][se]);else r.deleteFramebuffer(z.__webglFramebuffer[ne]);z.__webglDepthbuffer&&r.deleteRenderbuffer(z.__webglDepthbuffer[ne])}else{if(Array.isArray(z.__webglFramebuffer))for(let ne=0;ne<z.__webglFramebuffer.length;ne++)r.deleteFramebuffer(z.__webglFramebuffer[ne]);else r.deleteFramebuffer(z.__webglFramebuffer);if(z.__webglDepthbuffer&&r.deleteRenderbuffer(z.__webglDepthbuffer),z.__webglMultisampledFramebuffer&&r.deleteFramebuffer(z.__webglMultisampledFramebuffer),z.__webglColorRenderbuffer)for(let ne=0;ne<z.__webglColorRenderbuffer.length;ne++)z.__webglColorRenderbuffer[ne]&&r.deleteRenderbuffer(z.__webglColorRenderbuffer[ne]);z.__webglDepthRenderbuffer&&r.deleteRenderbuffer(z.__webglDepthRenderbuffer)}if(w.isWebGLMultipleRenderTargets)for(let ne=0,se=E.length;ne<se;ne++){const pe=n.get(E[ne]);pe.__webglTexture&&(r.deleteTexture(pe.__webglTexture),o.memory.textures--),n.remove(E[ne])}n.remove(E),n.remove(w)}let N=0;function $(){N=0}function D(){const w=N;return w>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+i.maxTextures),N+=1,w}function H(w){const E=[];return E.push(w.wrapS),E.push(w.wrapT),E.push(w.wrapR||0),E.push(w.magFilter),E.push(w.minFilter),E.push(w.anisotropy),E.push(w.internalFormat),E.push(w.format),E.push(w.type),E.push(w.generateMipmaps),E.push(w.premultiplyAlpha),E.push(w.flipY),E.push(w.unpackAlignment),E.push(w.colorSpace),E.join()}function B(w,E){const z=n.get(w);if(w.isVideoTexture&&V(w),w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){const re=w.image;if(re===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(re.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J(z,w,E);return}}t.bindTexture(r.TEXTURE_2D,z.__webglTexture,r.TEXTURE0+E)}function Y(w,E){const z=n.get(w);if(w.version>0&&z.__version!==w.version){J(z,w,E);return}t.bindTexture(r.TEXTURE_2D_ARRAY,z.__webglTexture,r.TEXTURE0+E)}function j(w,E){const z=n.get(w);if(w.version>0&&z.__version!==w.version){J(z,w,E);return}t.bindTexture(r.TEXTURE_3D,z.__webglTexture,r.TEXTURE0+E)}function K(w,E){const z=n.get(w);if(w.version>0&&z.__version!==w.version){fe(z,w,E);return}t.bindTexture(r.TEXTURE_CUBE_MAP,z.__webglTexture,r.TEXTURE0+E)}const C={[vo]:r.REPEAT,[Jn]:r.CLAMP_TO_EDGE,[Yl]:r.MIRRORED_REPEAT},Z={[$t]:r.NEAREST,[Qu]:r.NEAREST_MIPMAP_NEAREST,[Ys]:r.NEAREST_MIPMAP_LINEAR,[cn]:r.LINEAR,[Al]:r.LINEAR_MIPMAP_NEAREST,[Wi]:r.LINEAR_MIPMAP_LINEAR},le={[Fy]:r.NEVER,[Vy]:r.ALWAYS,[By]:r.LESS,[d_]:r.LEQUAL,[ky]:r.EQUAL,[Gy]:r.GEQUAL,[zy]:r.GREATER,[Hy]:r.NOTEQUAL};function Oe(w,E,z){if(E.type===vi&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===cn||E.magFilter===Al||E.magFilter===Ys||E.magFilter===Wi||E.minFilter===cn||E.minFilter===Al||E.minFilter===Ys||E.minFilter===Wi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),z?(r.texParameteri(w,r.TEXTURE_WRAP_S,C[E.wrapS]),r.texParameteri(w,r.TEXTURE_WRAP_T,C[E.wrapT]),(w===r.TEXTURE_3D||w===r.TEXTURE_2D_ARRAY)&&r.texParameteri(w,r.TEXTURE_WRAP_R,C[E.wrapR]),r.texParameteri(w,r.TEXTURE_MAG_FILTER,Z[E.magFilter]),r.texParameteri(w,r.TEXTURE_MIN_FILTER,Z[E.minFilter])):(r.texParameteri(w,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(w,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),(w===r.TEXTURE_3D||w===r.TEXTURE_2D_ARRAY)&&r.texParameteri(w,r.TEXTURE_WRAP_R,r.CLAMP_TO_EDGE),(E.wrapS!==Jn||E.wrapT!==Jn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),r.texParameteri(w,r.TEXTURE_MAG_FILTER,b(E.magFilter)),r.texParameteri(w,r.TEXTURE_MIN_FILTER,b(E.minFilter)),E.minFilter!==$t&&E.minFilter!==cn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),E.compareFunction&&(r.texParameteri(w,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(w,r.TEXTURE_COMPARE_FUNC,le[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const re=e.get("EXT_texture_filter_anisotropic");if(E.magFilter===$t||E.minFilter!==Ys&&E.minFilter!==Wi||E.type===vi&&e.has("OES_texture_float_linear")===!1||a===!1&&E.type===xa&&e.has("OES_texture_half_float_linear")===!1)return;(E.anisotropy>1||n.get(E).__currentAnisotropy)&&(r.texParameterf(w,re.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,i.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy)}}function X(w,E){let z=!1;w.__webglInit===void 0&&(w.__webglInit=!0,E.addEventListener("dispose",M));const re=E.source;let ne=f.get(re);ne===void 0&&(ne={},f.set(re,ne));const se=H(E);if(se!==w.__cacheKey){ne[se]===void 0&&(ne[se]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,z=!0),ne[se].usedTimes++;const pe=ne[w.__cacheKey];pe!==void 0&&(ne[w.__cacheKey].usedTimes--,pe.usedTimes===0&&v(E)),w.__cacheKey=se,w.__webglTexture=ne[se].texture}return z}function J(w,E,z){let re=r.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(re=r.TEXTURE_2D_ARRAY),E.isData3DTexture&&(re=r.TEXTURE_3D);const ne=X(w,E),se=E.source;t.bindTexture(re,w.__webglTexture,r.TEXTURE0+z);const pe=n.get(se);if(se.version!==pe.__version||ne===!0){t.activeTexture(r.TEXTURE0+z);const he=ht.getPrimaries(ht.workingColorSpace),ce=E.colorSpace===ei?null:ht.getPrimaries(E.colorSpace),Ae=E.colorSpace===ei||he===ce?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,E.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,E.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae);const ke=m(E)&&p(E.image)===!1;let te=_(E.image,ke,!1,i.maxTextureSize);te=Be(E,te);const st=p(te)||a,Ie=s.convert(E.format,E.colorSpace);let We=s.convert(E.type),we=x(E.internalFormat,Ie,We,E.colorSpace,E.isVideoTexture);Oe(re,E,st);let _e;const Xe=E.mipmaps,L=a&&E.isVideoTexture!==!0&&we!==c_,oe=pe.__version===void 0||ne===!0,Q=se.dataReady,Ce=T(E,te,st);if(E.isDepthTexture)we=r.DEPTH_COMPONENT,a?E.type===vi?we=r.DEPTH_COMPONENT32F:E.type===gr?we=r.DEPTH_COMPONENT24:E.type===as?we=r.DEPTH24_STENCIL8:we=r.DEPTH_COMPONENT16:E.type===vi&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),E.format===ls&&we===r.DEPTH_COMPONENT&&E.type!==Xh&&E.type!==gr&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),E.type=gr,We=s.convert(E.type)),E.format===xo&&we===r.DEPTH_COMPONENT&&(we=r.DEPTH_STENCIL,E.type!==as&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),E.type=as,We=s.convert(E.type))),oe&&(L?t.texStorage2D(r.TEXTURE_2D,1,we,te.width,te.height):t.texImage2D(r.TEXTURE_2D,0,we,te.width,te.height,0,Ie,We,null));else if(E.isDataTexture)if(Xe.length>0&&st){L&&oe&&t.texStorage2D(r.TEXTURE_2D,Ce,we,Xe[0].width,Xe[0].height);for(let P=0,ie=Xe.length;P<ie;P++)_e=Xe[P],L?Q&&t.texSubImage2D(r.TEXTURE_2D,P,0,0,_e.width,_e.height,Ie,We,_e.data):t.texImage2D(r.TEXTURE_2D,P,we,_e.width,_e.height,0,Ie,We,_e.data);E.generateMipmaps=!1}else L?(oe&&t.texStorage2D(r.TEXTURE_2D,Ce,we,te.width,te.height),Q&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,te.width,te.height,Ie,We,te.data)):t.texImage2D(r.TEXTURE_2D,0,we,te.width,te.height,0,Ie,We,te.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){L&&oe&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Ce,we,Xe[0].width,Xe[0].height,te.depth);for(let P=0,ie=Xe.length;P<ie;P++)_e=Xe[P],E.format!==Qn?Ie!==null?L?Q&&t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,P,0,0,0,_e.width,_e.height,te.depth,Ie,_e.data,0,0):t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,P,we,_e.width,_e.height,te.depth,0,_e.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?Q&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,P,0,0,0,_e.width,_e.height,te.depth,Ie,We,_e.data):t.texImage3D(r.TEXTURE_2D_ARRAY,P,we,_e.width,_e.height,te.depth,0,Ie,We,_e.data)}else{L&&oe&&t.texStorage2D(r.TEXTURE_2D,Ce,we,Xe[0].width,Xe[0].height);for(let P=0,ie=Xe.length;P<ie;P++)_e=Xe[P],E.format!==Qn?Ie!==null?L?Q&&t.compressedTexSubImage2D(r.TEXTURE_2D,P,0,0,_e.width,_e.height,Ie,_e.data):t.compressedTexImage2D(r.TEXTURE_2D,P,we,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?Q&&t.texSubImage2D(r.TEXTURE_2D,P,0,0,_e.width,_e.height,Ie,We,_e.data):t.texImage2D(r.TEXTURE_2D,P,we,_e.width,_e.height,0,Ie,We,_e.data)}else if(E.isDataArrayTexture)L?(oe&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Ce,we,te.width,te.height,te.depth),Q&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,Ie,We,te.data)):t.texImage3D(r.TEXTURE_2D_ARRAY,0,we,te.width,te.height,te.depth,0,Ie,We,te.data);else if(E.isData3DTexture)L?(oe&&t.texStorage3D(r.TEXTURE_3D,Ce,we,te.width,te.height,te.depth),Q&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,Ie,We,te.data)):t.texImage3D(r.TEXTURE_3D,0,we,te.width,te.height,te.depth,0,Ie,We,te.data);else if(E.isFramebufferTexture){if(oe)if(L)t.texStorage2D(r.TEXTURE_2D,Ce,we,te.width,te.height);else{let P=te.width,ie=te.height;for(let ee=0;ee<Ce;ee++)t.texImage2D(r.TEXTURE_2D,ee,we,P,ie,0,Ie,We,null),P>>=1,ie>>=1}}else if(Xe.length>0&&st){L&&oe&&t.texStorage2D(r.TEXTURE_2D,Ce,we,Xe[0].width,Xe[0].height);for(let P=0,ie=Xe.length;P<ie;P++)_e=Xe[P],L?Q&&t.texSubImage2D(r.TEXTURE_2D,P,0,0,Ie,We,_e):t.texImage2D(r.TEXTURE_2D,P,we,Ie,We,_e);E.generateMipmaps=!1}else L?(oe&&t.texStorage2D(r.TEXTURE_2D,Ce,we,te.width,te.height),Q&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,Ie,We,te)):t.texImage2D(r.TEXTURE_2D,0,we,Ie,We,te);S(E,st)&&y(re),pe.__version=se.version,E.onUpdate&&E.onUpdate(E)}w.__version=E.version}function fe(w,E,z){if(E.image.length!==6)return;const re=X(w,E),ne=E.source;t.bindTexture(r.TEXTURE_CUBE_MAP,w.__webglTexture,r.TEXTURE0+z);const se=n.get(ne);if(ne.version!==se.__version||re===!0){t.activeTexture(r.TEXTURE0+z);const pe=ht.getPrimaries(ht.workingColorSpace),he=E.colorSpace===ei?null:ht.getPrimaries(E.colorSpace),ce=E.colorSpace===ei||pe===he?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,E.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,E.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce);const Ae=E.isCompressedTexture||E.image[0].isCompressedTexture,ke=E.image[0]&&E.image[0].isDataTexture,te=[];for(let P=0;P<6;P++)!Ae&&!ke?te[P]=_(E.image[P],!1,!0,i.maxCubemapSize):te[P]=ke?E.image[P].image:E.image[P],te[P]=Be(E,te[P]);const st=te[0],Ie=p(st)||a,We=s.convert(E.format,E.colorSpace),we=s.convert(E.type),_e=x(E.internalFormat,We,we,E.colorSpace),Xe=a&&E.isVideoTexture!==!0,L=se.__version===void 0||re===!0,oe=ne.dataReady;let Q=T(E,st,Ie);Oe(r.TEXTURE_CUBE_MAP,E,Ie);let Ce;if(Ae){Xe&&L&&t.texStorage2D(r.TEXTURE_CUBE_MAP,Q,_e,st.width,st.height);for(let P=0;P<6;P++){Ce=te[P].mipmaps;for(let ie=0;ie<Ce.length;ie++){const ee=Ce[ie];E.format!==Qn?We!==null?Xe?oe&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie,0,0,ee.width,ee.height,We,ee.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie,_e,ee.width,ee.height,0,ee.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Xe?oe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie,0,0,ee.width,ee.height,We,we,ee.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie,_e,ee.width,ee.height,0,We,we,ee.data)}}}else{Ce=E.mipmaps,Xe&&L&&(Ce.length>0&&Q++,t.texStorage2D(r.TEXTURE_CUBE_MAP,Q,_e,te[0].width,te[0].height));for(let P=0;P<6;P++)if(ke){Xe?oe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,0,0,te[P].width,te[P].height,We,we,te[P].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,_e,te[P].width,te[P].height,0,We,we,te[P].data);for(let ie=0;ie<Ce.length;ie++){const Se=Ce[ie].image[P].image;Xe?oe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie+1,0,0,Se.width,Se.height,We,we,Se.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie+1,_e,Se.width,Se.height,0,We,we,Se.data)}}else{Xe?oe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,0,0,We,we,te[P]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,_e,We,we,te[P]);for(let ie=0;ie<Ce.length;ie++){const ee=Ce[ie];Xe?oe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie+1,0,0,We,we,ee.image[P]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+P,ie+1,_e,We,we,ee.image[P])}}}S(E,Ie)&&y(r.TEXTURE_CUBE_MAP),se.__version=ne.version,E.onUpdate&&E.onUpdate(E)}w.__version=E.version}function ve(w,E,z,re,ne,se){const pe=s.convert(z.format,z.colorSpace),he=s.convert(z.type),ce=x(z.internalFormat,pe,he,z.colorSpace);if(!n.get(E).__hasExternalTextures){const ke=Math.max(1,E.width>>se),te=Math.max(1,E.height>>se);ne===r.TEXTURE_3D||ne===r.TEXTURE_2D_ARRAY?t.texImage3D(ne,se,ce,ke,te,E.depth,0,pe,he,null):t.texImage2D(ne,se,ce,ke,te,0,pe,he,null)}t.bindFramebuffer(r.FRAMEBUFFER,w),xe(E)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,re,ne,n.get(z).__webglTexture,0,Le(E)):(ne===r.TEXTURE_2D||ne>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,re,ne,n.get(z).__webglTexture,se),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Ee(w,E,z){if(r.bindRenderbuffer(r.RENDERBUFFER,w),E.depthBuffer&&!E.stencilBuffer){let re=a===!0?r.DEPTH_COMPONENT24:r.DEPTH_COMPONENT16;if(z||xe(E)){const ne=E.depthTexture;ne&&ne.isDepthTexture&&(ne.type===vi?re=r.DEPTH_COMPONENT32F:ne.type===gr&&(re=r.DEPTH_COMPONENT24));const se=Le(E);xe(E)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,se,re,E.width,E.height):r.renderbufferStorageMultisample(r.RENDERBUFFER,se,re,E.width,E.height)}else r.renderbufferStorage(r.RENDERBUFFER,re,E.width,E.height);r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,w)}else if(E.depthBuffer&&E.stencilBuffer){const re=Le(E);z&&xe(E)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,re,r.DEPTH24_STENCIL8,E.width,E.height):xe(E)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,re,r.DEPTH24_STENCIL8,E.width,E.height):r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,E.width,E.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,w)}else{const re=E.isWebGLMultipleRenderTargets===!0?E.texture:[E.texture];for(let ne=0;ne<re.length;ne++){const se=re[ne],pe=s.convert(se.format,se.colorSpace),he=s.convert(se.type),ce=x(se.internalFormat,pe,he,se.colorSpace),Ae=Le(E);z&&xe(E)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ae,ce,E.width,E.height):xe(E)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ae,ce,E.width,E.height):r.renderbufferStorage(r.RENDERBUFFER,ce,E.width,E.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function me(w,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,w),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(E.depthTexture).__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),B(E.depthTexture,0);const re=n.get(E.depthTexture).__webglTexture,ne=Le(E);if(E.depthTexture.format===ls)xe(E)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,re,0,ne):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,re,0);else if(E.depthTexture.format===xo)xe(E)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,re,0,ne):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,re,0);else throw new Error("Unknown depthTexture format")}function Ke(w){const E=n.get(w),z=w.isWebGLCubeRenderTarget===!0;if(w.depthTexture&&!E.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");me(E.__webglFramebuffer,w)}else if(z){E.__webglDepthbuffer=[];for(let re=0;re<6;re++)t.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer[re]),E.__webglDepthbuffer[re]=r.createRenderbuffer(),Ee(E.__webglDepthbuffer[re],w,!1)}else t.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer=r.createRenderbuffer(),Ee(E.__webglDepthbuffer,w,!1);t.bindFramebuffer(r.FRAMEBUFFER,null)}function De(w,E,z){const re=n.get(w);E!==void 0&&ve(re.__webglFramebuffer,w,w.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),z!==void 0&&Ke(w)}function k(w){const E=w.texture,z=n.get(w),re=n.get(E);w.addEventListener("dispose",I),w.isWebGLMultipleRenderTargets!==!0&&(re.__webglTexture===void 0&&(re.__webglTexture=r.createTexture()),re.__version=E.version,o.memory.textures++);const ne=w.isWebGLCubeRenderTarget===!0,se=w.isWebGLMultipleRenderTargets===!0,pe=p(w)||a;if(ne){z.__webglFramebuffer=[];for(let he=0;he<6;he++)if(a&&E.mipmaps&&E.mipmaps.length>0){z.__webglFramebuffer[he]=[];for(let ce=0;ce<E.mipmaps.length;ce++)z.__webglFramebuffer[he][ce]=r.createFramebuffer()}else z.__webglFramebuffer[he]=r.createFramebuffer()}else{if(a&&E.mipmaps&&E.mipmaps.length>0){z.__webglFramebuffer=[];for(let he=0;he<E.mipmaps.length;he++)z.__webglFramebuffer[he]=r.createFramebuffer()}else z.__webglFramebuffer=r.createFramebuffer();if(se)if(i.drawBuffers){const he=w.texture;for(let ce=0,Ae=he.length;ce<Ae;ce++){const ke=n.get(he[ce]);ke.__webglTexture===void 0&&(ke.__webglTexture=r.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&w.samples>0&&xe(w)===!1){const he=se?E:[E];z.__webglMultisampledFramebuffer=r.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let ce=0;ce<he.length;ce++){const Ae=he[ce];z.__webglColorRenderbuffer[ce]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,z.__webglColorRenderbuffer[ce]);const ke=s.convert(Ae.format,Ae.colorSpace),te=s.convert(Ae.type),st=x(Ae.internalFormat,ke,te,Ae.colorSpace,w.isXRRenderTarget===!0),Ie=Le(w);r.renderbufferStorageMultisample(r.RENDERBUFFER,Ie,st,w.width,w.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ce,r.RENDERBUFFER,z.__webglColorRenderbuffer[ce])}r.bindRenderbuffer(r.RENDERBUFFER,null),w.depthBuffer&&(z.__webglDepthRenderbuffer=r.createRenderbuffer(),Ee(z.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ne){t.bindTexture(r.TEXTURE_CUBE_MAP,re.__webglTexture),Oe(r.TEXTURE_CUBE_MAP,E,pe);for(let he=0;he<6;he++)if(a&&E.mipmaps&&E.mipmaps.length>0)for(let ce=0;ce<E.mipmaps.length;ce++)ve(z.__webglFramebuffer[he][ce],w,E,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+he,ce);else ve(z.__webglFramebuffer[he],w,E,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+he,0);S(E,pe)&&y(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(se){const he=w.texture;for(let ce=0,Ae=he.length;ce<Ae;ce++){const ke=he[ce],te=n.get(ke);t.bindTexture(r.TEXTURE_2D,te.__webglTexture),Oe(r.TEXTURE_2D,ke,pe),ve(z.__webglFramebuffer,w,ke,r.COLOR_ATTACHMENT0+ce,r.TEXTURE_2D,0),S(ke,pe)&&y(r.TEXTURE_2D)}t.unbindTexture()}else{let he=r.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(a?he=w.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(he,re.__webglTexture),Oe(he,E,pe),a&&E.mipmaps&&E.mipmaps.length>0)for(let ce=0;ce<E.mipmaps.length;ce++)ve(z.__webglFramebuffer[ce],w,E,r.COLOR_ATTACHMENT0,he,ce);else ve(z.__webglFramebuffer,w,E,r.COLOR_ATTACHMENT0,he,0);S(E,pe)&&y(he),t.unbindTexture()}w.depthBuffer&&Ke(w)}function Ve(w){const E=p(w)||a,z=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let re=0,ne=z.length;re<ne;re++){const se=z[re];if(S(se,E)){const pe=w.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,he=n.get(se).__webglTexture;t.bindTexture(pe,he),y(pe),t.unbindTexture()}}}function ge(w){if(a&&w.samples>0&&xe(w)===!1){const E=w.isWebGLMultipleRenderTargets?w.texture:[w.texture],z=w.width,re=w.height;let ne=r.COLOR_BUFFER_BIT;const se=[],pe=w.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,he=n.get(w),ce=w.isWebGLMultipleRenderTargets===!0;if(ce)for(let Ae=0;Ae<E.length;Ae++)t.bindFramebuffer(r.FRAMEBUFFER,he.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ae,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,he.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ae,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let Ae=0;Ae<E.length;Ae++){se.push(r.COLOR_ATTACHMENT0+Ae),w.depthBuffer&&se.push(pe);const ke=he.__ignoreDepthValues!==void 0?he.__ignoreDepthValues:!1;if(ke===!1&&(w.depthBuffer&&(ne|=r.DEPTH_BUFFER_BIT),w.stencilBuffer&&(ne|=r.STENCIL_BUFFER_BIT)),ce&&r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,he.__webglColorRenderbuffer[Ae]),ke===!0&&(r.invalidateFramebuffer(r.READ_FRAMEBUFFER,[pe]),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[pe])),ce){const te=n.get(E[Ae]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,te,0)}r.blitFramebuffer(0,0,z,re,0,0,z,re,ne,r.NEAREST),c&&r.invalidateFramebuffer(r.READ_FRAMEBUFFER,se)}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ce)for(let Ae=0;Ae<E.length;Ae++){t.bindFramebuffer(r.FRAMEBUFFER,he.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ae,r.RENDERBUFFER,he.__webglColorRenderbuffer[Ae]);const ke=n.get(E[Ae]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,he.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ae,r.TEXTURE_2D,ke,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}}function Le(w){return Math.min(i.maxSamples,w.samples)}function xe(w){const E=n.get(w);return a&&w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function V(w){const E=o.render.frame;u.get(w)!==E&&(u.set(w,E),w.update())}function Be(w,E){const z=w.colorSpace,re=w.format,ne=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||w.format===nh||z!==en&&z!==ei&&(ht.getTransfer(z)===Et?a===!1?e.has("EXT_sRGB")===!0&&re===Qn?(w.format=nh,w.minFilter=cn,w.generateMipmaps=!1):E=g_.sRGBToLinear(E):(re!==Qn||ne!==Er)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),E}this.allocateTextureUnit=D,this.resetTextureUnits=$,this.setTexture2D=B,this.setTexture2DArray=Y,this.setTexture3D=j,this.setTextureCube=K,this.rebindTextures=De,this.setupRenderTarget=k,this.updateRenderTargetMipmap=Ve,this.updateMultisampleRenderTarget=ge,this.setupDepthRenderbuffer=Ke,this.setupFrameBufferTexture=ve,this.useMultisampledRTT=xe}function iA(r,e,t){const n=t.isWebGL2;function i(s,o=ei){let a;const l=ht.getTransfer(o);if(s===Er)return r.UNSIGNED_BYTE;if(s===r_)return r.UNSIGNED_SHORT_4_4_4_4;if(s===s_)return r.UNSIGNED_SHORT_5_5_5_1;if(s===Ty)return r.BYTE;if(s===by)return r.SHORT;if(s===Xh)return r.UNSIGNED_SHORT;if(s===i_)return r.INT;if(s===gr)return r.UNSIGNED_INT;if(s===vi)return r.FLOAT;if(s===xa)return n?r.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Ay)return r.ALPHA;if(s===Qn)return r.RGBA;if(s===wy)return r.LUMINANCE;if(s===Ry)return r.LUMINANCE_ALPHA;if(s===ls)return r.DEPTH_COMPONENT;if(s===xo)return r.DEPTH_STENCIL;if(s===nh)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===Cy)return r.RED;if(s===o_)return r.RED_INTEGER;if(s===Py)return r.RG;if(s===a_)return r.RG_INTEGER;if(s===l_)return r.RGBA_INTEGER;if(s===Dc||s===Ic||s===Oc||s===Nc)if(l===Et)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===Dc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Ic)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Oc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Nc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===Dc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Ic)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Oc)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Nc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===ld||s===cd||s===ud||s===hd)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===ld)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===cd)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===ud)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===hd)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===c_)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===fd||s===dd)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===fd)return l===Et?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===dd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===pd||s===md||s===gd||s===_d||s===vd||s===xd||s===yd||s===Sd||s===Md||s===Ed||s===Td||s===bd||s===Ad||s===wd)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===pd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===md)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===gd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===_d)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===vd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===xd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===yd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Sd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Md)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Ed)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Td)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===bd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Ad)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===wd)return l===Et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Uc||s===Rd||s===Cd)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===Uc)return l===Et?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Rd)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Cd)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Ly||s===Pd||s===Ld||s===Dd)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===Uc)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Pd)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Ld)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Dd)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===as?n?r.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):r[s]!==void 0?r[s]:null}return{convert:i}}class rA extends Mn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Qr extends Lt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const sA={type:"move"};class ou{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const p=t.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(sA)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Qr;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const oA=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,aA=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class lA{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new Jt,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}render(e,t){if(this.texture!==null){if(this.mesh===null){const n=t.cameras[0].viewport,i=new wr({extensions:{fragDepth:!0},vertexShader:oA,fragmentShader:aA,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Vn(new cc(20,20),i)}e.render(this.mesh,t)}}reset(){this.texture=null,this.mesh=null}}class cA extends ys{constructor(e,t){super();const n=this;let i=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,g=null;const _=new lA,p=t.getContextAttributes();let m=null,S=null;const y=[],x=[],T=new qe;let b=null;const M=new Mn;M.layers.enable(1),M.viewport=new vt;const I=new Mn;I.layers.enable(2),I.viewport=new vt;const O=[M,I],v=new rA;v.layers.enable(1),v.layers.enable(2);let R=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let J=y[X];return J===void 0&&(J=new ou,y[X]=J),J.getTargetRaySpace()},this.getControllerGrip=function(X){let J=y[X];return J===void 0&&(J=new ou,y[X]=J),J.getGripSpace()},this.getHand=function(X){let J=y[X];return J===void 0&&(J=new ou,y[X]=J),J.getHandSpace()};function $(X){const J=x.indexOf(X.inputSource);if(J===-1)return;const fe=y[J];fe!==void 0&&(fe.update(X.inputSource,X.frame,c||o),fe.dispatchEvent({type:X.type,data:X.inputSource}))}function D(){i.removeEventListener("select",$),i.removeEventListener("selectstart",$),i.removeEventListener("selectend",$),i.removeEventListener("squeeze",$),i.removeEventListener("squeezestart",$),i.removeEventListener("squeezeend",$),i.removeEventListener("end",D),i.removeEventListener("inputsourceschange",H);for(let X=0;X<y.length;X++){const J=x[X];J!==null&&(x[X]=null,y[X].disconnect(J))}R=null,N=null,_.reset(),e.setRenderTarget(m),d=null,f=null,h=null,i=null,S=null,Oe.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(T.width,T.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){s=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(X){if(i=X,i!==null){if(m=e.getRenderTarget(),i.addEventListener("select",$),i.addEventListener("selectstart",$),i.addEventListener("selectend",$),i.addEventListener("squeeze",$),i.addEventListener("squeezestart",$),i.addEventListener("squeezeend",$),i.addEventListener("end",D),i.addEventListener("inputsourceschange",H),p.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(T),i.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const J={antialias:i.renderState.layers===void 0?p.antialias:!0,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,J),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),S=new _s(d.framebufferWidth,d.framebufferHeight,{format:Qn,type:Er,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil})}else{let J=null,fe=null,ve=null;p.depth&&(ve=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,J=p.stencil?xo:ls,fe=p.stencil?as:gr);const Ee={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:s};h=new XRWebGLBinding(i,t),f=h.createProjectionLayer(Ee),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new _s(f.textureWidth,f.textureHeight,{format:Qn,type:Er,depthTexture:new w_(f.textureWidth,f.textureHeight,fe,void 0,void 0,void 0,void 0,void 0,void 0,J),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0});const me=e.properties.get(S);me.__ignoreDepthValues=f.ignoreDepthValues}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),Oe.setContext(i),Oe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode};function H(X){for(let J=0;J<X.removed.length;J++){const fe=X.removed[J],ve=x.indexOf(fe);ve>=0&&(x[ve]=null,y[ve].disconnect(fe))}for(let J=0;J<X.added.length;J++){const fe=X.added[J];let ve=x.indexOf(fe);if(ve===-1){for(let me=0;me<y.length;me++)if(me>=x.length){x.push(fe),ve=me;break}else if(x[me]===null){x[me]=fe,ve=me;break}if(ve===-1)break}const Ee=y[ve];Ee&&Ee.connect(fe)}}const B=new U,Y=new U;function j(X,J,fe){B.setFromMatrixPosition(J.matrixWorld),Y.setFromMatrixPosition(fe.matrixWorld);const ve=B.distanceTo(Y),Ee=J.projectionMatrix.elements,me=fe.projectionMatrix.elements,Ke=Ee[14]/(Ee[10]-1),De=Ee[14]/(Ee[10]+1),k=(Ee[9]+1)/Ee[5],Ve=(Ee[9]-1)/Ee[5],ge=(Ee[8]-1)/Ee[0],Le=(me[8]+1)/me[0],xe=Ke*ge,V=Ke*Le,Be=ve/(-ge+Le),w=Be*-ge;J.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(w),X.translateZ(Be),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert();const E=Ke+Be,z=De+Be,re=xe-w,ne=V+(ve-w),se=k*De/z*E,pe=Ve*De/z*E;X.projectionMatrix.makePerspective(re,ne,se,pe,E,z),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}function K(X,J){J===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(J.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(i===null)return;_.texture!==null&&(X.near=_.depthNear,X.far=_.depthFar),v.near=I.near=M.near=X.near,v.far=I.far=M.far=X.far,(R!==v.near||N!==v.far)&&(i.updateRenderState({depthNear:v.near,depthFar:v.far}),R=v.near,N=v.far,M.near=R,M.far=N,I.near=R,I.far=N,M.updateProjectionMatrix(),I.updateProjectionMatrix(),X.updateProjectionMatrix());const J=X.parent,fe=v.cameras;K(v,J);for(let ve=0;ve<fe.length;ve++)K(fe[ve],J);fe.length===2?j(v,M,I):v.projectionMatrix.copy(M.projectionMatrix),C(X,v,J)};function C(X,J,fe){fe===null?X.matrix.copy(J.matrixWorld):(X.matrix.copy(fe.matrixWorld),X.matrix.invert(),X.matrix.multiply(J.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(J.projectionMatrix),X.projectionMatrixInverse.copy(J.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=So*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(X){l=X,f!==null&&(f.fixedFoveation=X),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=X)},this.hasDepthSensing=function(){return _.texture!==null};let Z=null;function le(X,J){if(u=J.getViewerPose(c||o),g=J,u!==null){const fe=u.views;d!==null&&(e.setRenderTargetFramebuffer(S,d.framebuffer),e.setRenderTarget(S));let ve=!1;fe.length!==v.cameras.length&&(v.cameras.length=0,ve=!0);for(let me=0;me<fe.length;me++){const Ke=fe[me];let De=null;if(d!==null)De=d.getViewport(Ke);else{const Ve=h.getViewSubImage(f,Ke);De=Ve.viewport,me===0&&(e.setRenderTargetTextures(S,Ve.colorTexture,f.ignoreDepthValues?void 0:Ve.depthStencilTexture),e.setRenderTarget(S))}let k=O[me];k===void 0&&(k=new Mn,k.layers.enable(me),k.viewport=new vt,O[me]=k),k.matrix.fromArray(Ke.transform.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale),k.projectionMatrix.fromArray(Ke.projectionMatrix),k.projectionMatrixInverse.copy(k.projectionMatrix).invert(),k.viewport.set(De.x,De.y,De.width,De.height),me===0&&(v.matrix.copy(k.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),ve===!0&&v.cameras.push(k)}const Ee=i.enabledFeatures;if(Ee&&Ee.includes("depth-sensing")){const me=h.getDepthInformation(fe[0]);me&&me.isValid&&me.texture&&_.init(e,me,i.renderState)}}for(let fe=0;fe<y.length;fe++){const ve=x[fe],Ee=y[fe];ve!==null&&Ee!==void 0&&Ee.update(ve,J,c||o)}_.render(e,v),Z&&Z(X,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),g=null}const Oe=new A_;Oe.setAnimationLoop(le),this.setAnimationLoop=function(X){Z=X},this.dispose=function(){}}}function uA(r,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,E_(r)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,S,y,x){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(p,m):m.isMeshToonMaterial?(s(p,m),h(p,m)):m.isMeshPhongMaterial?(s(p,m),u(p,m)):m.isMeshStandardMaterial?(s(p,m),f(p,m),m.isMeshPhysicalMaterial&&d(p,m,x)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),_(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,S,y):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Dn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Dn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const S=e.get(m).envMap;if(S&&(p.envMap.value=S,p.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap){p.lightMap.value=m.lightMap;const y=r._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=m.lightMapIntensity*y,t(m.lightMap,p.lightMapTransform)}m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,S,y){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*S,p.scale.value=y*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function h(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),e.get(m).envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,S){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Dn&&p.clearcoatNormalScale.value.negate())),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=S.texture,p.transmissionSamplerSize.value.set(S.width,S.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){const S=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(S.matrixWorld),p.nearDistance.value=S.shadow.camera.near,p.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function hA(r,e,t,n){let i={},s={},o=[];const a=t.isWebGL2?r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(S,y){const x=y.program;n.uniformBlockBinding(S,x)}function c(S,y){let x=i[S.id];x===void 0&&(g(S),x=u(S),i[S.id]=x,S.addEventListener("dispose",p));const T=y.program;n.updateUBOMapping(S,T);const b=e.render.frame;s[S.id]!==b&&(f(S),s[S.id]=b)}function u(S){const y=h();S.__bindingPointIndex=y;const x=r.createBuffer(),T=S.__size,b=S.usage;return r.bindBuffer(r.UNIFORM_BUFFER,x),r.bufferData(r.UNIFORM_BUFFER,T,b),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,y,x),x}function h(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(S){const y=i[S.id],x=S.uniforms,T=S.__cache;r.bindBuffer(r.UNIFORM_BUFFER,y);for(let b=0,M=x.length;b<M;b++){const I=Array.isArray(x[b])?x[b]:[x[b]];for(let O=0,v=I.length;O<v;O++){const R=I[O];if(d(R,b,O,T)===!0){const N=R.__offset,$=Array.isArray(R.value)?R.value:[R.value];let D=0;for(let H=0;H<$.length;H++){const B=$[H],Y=_(B);typeof B=="number"||typeof B=="boolean"?(R.__data[0]=B,r.bufferSubData(r.UNIFORM_BUFFER,N+D,R.__data)):B.isMatrix3?(R.__data[0]=B.elements[0],R.__data[1]=B.elements[1],R.__data[2]=B.elements[2],R.__data[3]=0,R.__data[4]=B.elements[3],R.__data[5]=B.elements[4],R.__data[6]=B.elements[5],R.__data[7]=0,R.__data[8]=B.elements[6],R.__data[9]=B.elements[7],R.__data[10]=B.elements[8],R.__data[11]=0):(B.toArray(R.__data,D),D+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,N,R.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function d(S,y,x,T){const b=S.value,M=y+"_"+x;if(T[M]===void 0)return typeof b=="number"||typeof b=="boolean"?T[M]=b:T[M]=b.clone(),!0;{const I=T[M];if(typeof b=="number"||typeof b=="boolean"){if(I!==b)return T[M]=b,!0}else if(I.equals(b)===!1)return I.copy(b),!0}return!1}function g(S){const y=S.uniforms;let x=0;const T=16;for(let M=0,I=y.length;M<I;M++){const O=Array.isArray(y[M])?y[M]:[y[M]];for(let v=0,R=O.length;v<R;v++){const N=O[v],$=Array.isArray(N.value)?N.value:[N.value];for(let D=0,H=$.length;D<H;D++){const B=$[D],Y=_(B),j=x%T;j!==0&&T-j<Y.boundary&&(x+=T-j),N.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=x,x+=Y.storage}}}const b=x%T;return b>0&&(x+=T-b),S.__size=x,S.__cache={},this}function _(S){const y={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(y.boundary=4,y.storage=4):S.isVector2?(y.boundary=8,y.storage=8):S.isVector3||S.isColor?(y.boundary=16,y.storage=12):S.isVector4?(y.boundary=16,y.storage=16):S.isMatrix3?(y.boundary=48,y.storage=48):S.isMatrix4?(y.boundary=64,y.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),y}function p(S){const y=S.target;y.removeEventListener("dispose",p);const x=o.indexOf(y.__bindingPointIndex);o.splice(x,1),r.deleteBuffer(i[y.id]),delete i[y.id],delete s[y.id]}function m(){for(const S in i)r.deleteBuffer(i[S]);o=[],i={},s={}}return{bind:l,update:c,dispose:m}}class I_{constructor(e={}){const{canvas:t=rS(),context:n=null,depth:i=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let f;n!==null?f=n.getContextAttributes().alpha:f=o;const d=new Uint32Array(4),g=new Int32Array(4);let _=null,p=null;const m=[],S=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=It,this._useLegacyLights=!1,this.toneMapping=Mr,this.toneMappingExposure=1;const y=this;let x=!1,T=0,b=0,M=null,I=-1,O=null;const v=new vt,R=new vt;let N=null;const $=new Ze(0);let D=0,H=t.width,B=t.height,Y=1,j=null,K=null;const C=new vt(0,0,H,B),Z=new vt(0,0,H,B);let le=!1;const Oe=new jh;let X=!1,J=!1,fe=null;const ve=new rt,Ee=new qe,me=new U,Ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function De(){return M===null?Y:1}let k=n;function Ve(A,F){for(let q=0;q<A.length;q++){const W=A[q],G=t.getContext(W,F);if(G!==null)return G}return null}try{const A={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Wh}`),t.addEventListener("webglcontextlost",Ce,!1),t.addEventListener("webglcontextrestored",P,!1),t.addEventListener("webglcontextcreationerror",ie,!1),k===null){const F=["webgl2","webgl","experimental-webgl"];if(y.isWebGL1Renderer===!0&&F.shift(),k=Ve(F,A),k===null)throw Ve(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&k instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),k.getShaderPrecisionFormat===void 0&&(k.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let ge,Le,xe,V,Be,w,E,z,re,ne,se,pe,he,ce,Ae,ke,te,st,Ie,We,we,_e,Xe,L;function oe(){ge=new vT(k),Le=new fT(k,ge,e),ge.init(Le),_e=new iA(k,ge,Le),xe=new tA(k,ge,Le),V=new ST(k),Be=new Hb,w=new nA(k,ge,xe,Be,Le,_e,V),E=new pT(y),z=new _T(y),re=new CS(k,Le),Xe=new uT(k,ge,re,Le),ne=new xT(k,re,V,Xe),se=new bT(k,ne,re,V),Ie=new TT(k,Le,w),ke=new dT(Be),pe=new zb(y,E,z,ge,Le,Xe,ke),he=new uA(y,Be),ce=new Vb,Ae=new $b(ge,Le),st=new cT(y,E,z,xe,se,f,l),te=new eA(y,se,Le),L=new hA(k,V,Le,xe),We=new hT(k,ge,V,Le),we=new yT(k,ge,V,Le),V.programs=pe.programs,y.capabilities=Le,y.extensions=ge,y.properties=Be,y.renderLists=ce,y.shadowMap=te,y.state=xe,y.info=V}oe();const Q=new cA(y,k);this.xr=Q,this.getContext=function(){return k},this.getContextAttributes=function(){return k.getContextAttributes()},this.forceContextLoss=function(){const A=ge.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=ge.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(A){A!==void 0&&(Y=A,this.setSize(H,B,!1))},this.getSize=function(A){return A.set(H,B)},this.setSize=function(A,F,q=!0){if(Q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=A,B=F,t.width=Math.floor(A*Y),t.height=Math.floor(F*Y),q===!0&&(t.style.width=A+"px",t.style.height=F+"px"),this.setViewport(0,0,A,F)},this.getDrawingBufferSize=function(A){return A.set(H*Y,B*Y).floor()},this.setDrawingBufferSize=function(A,F,q){H=A,B=F,Y=q,t.width=Math.floor(A*q),t.height=Math.floor(F*q),this.setViewport(0,0,A,F)},this.getCurrentViewport=function(A){return A.copy(v)},this.getViewport=function(A){return A.copy(C)},this.setViewport=function(A,F,q,W){A.isVector4?C.set(A.x,A.y,A.z,A.w):C.set(A,F,q,W),xe.viewport(v.copy(C).multiplyScalar(Y).floor())},this.getScissor=function(A){return A.copy(Z)},this.setScissor=function(A,F,q,W){A.isVector4?Z.set(A.x,A.y,A.z,A.w):Z.set(A,F,q,W),xe.scissor(R.copy(Z).multiplyScalar(Y).floor())},this.getScissorTest=function(){return le},this.setScissorTest=function(A){xe.setScissorTest(le=A)},this.setOpaqueSort=function(A){j=A},this.setTransparentSort=function(A){K=A},this.getClearColor=function(A){return A.copy(st.getClearColor())},this.setClearColor=function(){st.setClearColor.apply(st,arguments)},this.getClearAlpha=function(){return st.getClearAlpha()},this.setClearAlpha=function(){st.setClearAlpha.apply(st,arguments)},this.clear=function(A=!0,F=!0,q=!0){let W=0;if(A){let G=!1;if(M!==null){const ue=M.texture.format;G=ue===l_||ue===a_||ue===o_}if(G){const ue=M.texture.type,Re=ue===Er||ue===gr||ue===Xh||ue===as||ue===r_||ue===s_,He=st.getClearColor(),Pe=st.getClearAlpha(),Ue=He.r,Ge=He.g,je=He.b;Re?(d[0]=Ue,d[1]=Ge,d[2]=je,d[3]=Pe,k.clearBufferuiv(k.COLOR,0,d)):(g[0]=Ue,g[1]=Ge,g[2]=je,g[3]=Pe,k.clearBufferiv(k.COLOR,0,g))}else W|=k.COLOR_BUFFER_BIT}F&&(W|=k.DEPTH_BUFFER_BIT),q&&(W|=k.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Ce,!1),t.removeEventListener("webglcontextrestored",P,!1),t.removeEventListener("webglcontextcreationerror",ie,!1),ce.dispose(),Ae.dispose(),Be.dispose(),E.dispose(),z.dispose(),se.dispose(),Xe.dispose(),L.dispose(),pe.dispose(),Q.dispose(),Q.removeEventListener("sessionstart",Me),Q.removeEventListener("sessionend",be),fe&&(fe.dispose(),fe=null),ae.stop()};function Ce(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),x=!0}function P(){console.log("THREE.WebGLRenderer: Context Restored."),x=!1;const A=V.autoReset,F=te.enabled,q=te.autoUpdate,W=te.needsUpdate,G=te.type;oe(),V.autoReset=A,te.enabled=F,te.autoUpdate=q,te.needsUpdate=W,te.type=G}function ie(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function ee(A){const F=A.target;F.removeEventListener("dispose",ee),Se(F)}function Se(A){Ne(A),Be.remove(A)}function Ne(A){const F=Be.get(A).programs;F!==void 0&&(F.forEach(function(q){pe.releaseProgram(q)}),A.isShaderMaterial&&pe.releaseShaderCache(A))}this.renderBufferDirect=function(A,F,q,W,G,ue){F===null&&(F=Ke);const Re=G.isMesh&&G.matrixWorld.determinant()<0,He=yt(A,F,q,W,G);xe.setMaterial(W,Re);let Pe=q.index,Ue=1;if(W.wireframe===!0){if(Pe=ne.getWireframeAttribute(q),Pe===void 0)return;Ue=2}const Ge=q.drawRange,je=q.attributes.position;let bt=Ge.start*Ue,Ht=(Ge.start+Ge.count)*Ue;ue!==null&&(bt=Math.max(bt,ue.start*Ue),Ht=Math.min(Ht,(ue.start+ue.count)*Ue)),Pe!==null?(bt=Math.max(bt,0),Ht=Math.min(Ht,Pe.count)):je!=null&&(bt=Math.max(bt,0),Ht=Math.min(Ht,je.count));const dt=Ht-bt;if(dt<0||dt===1/0)return;Xe.setup(G,W,He,q,Pe);let dn,gt=We;if(Pe!==null&&(dn=re.get(Pe),gt=we,gt.setIndex(dn)),G.isMesh)W.wireframe===!0?(xe.setLineWidth(W.wireframeLinewidth*De()),gt.setMode(k.LINES)):gt.setMode(k.TRIANGLES);else if(G.isLine){let $e=W.linewidth;$e===void 0&&($e=1),xe.setLineWidth($e*De()),G.isLineSegments?gt.setMode(k.LINES):G.isLineLoop?gt.setMode(k.LINE_LOOP):gt.setMode(k.LINE_STRIP)}else G.isPoints?gt.setMode(k.POINTS):G.isSprite&&gt.setMode(k.TRIANGLES);if(G.isBatchedMesh)gt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else if(G.isInstancedMesh)gt.renderInstances(bt,dt,G.count);else if(q.isInstancedBufferGeometry){const $e=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,hc=Math.min(q.instanceCount,$e);gt.renderInstances(bt,dt,hc)}else gt.render(bt,dt)};function Je(A,F,q){A.transparent===!0&&A.side===_i&&A.forceSinglePass===!1?(A.side=Dn,A.needsUpdate=!0,xt(A,F,q),A.side=Ki,A.needsUpdate=!0,xt(A,F,q),A.side=_i):xt(A,F,q)}this.compile=function(A,F,q=null){q===null&&(q=A),p=Ae.get(q),p.init(),S.push(p),q.traverseVisible(function(G){G.isLight&&G.layers.test(F.layers)&&(p.pushLight(G),G.castShadow&&p.pushShadow(G))}),A!==q&&A.traverseVisible(function(G){G.isLight&&G.layers.test(F.layers)&&(p.pushLight(G),G.castShadow&&p.pushShadow(G))}),p.setupLights(y._useLegacyLights);const W=new Set;return A.traverse(function(G){const ue=G.material;if(ue)if(Array.isArray(ue))for(let Re=0;Re<ue.length;Re++){const He=ue[Re];Je(He,q,G),W.add(He)}else Je(ue,q,G),W.add(ue)}),S.pop(),p=null,W},this.compileAsync=function(A,F,q=null){const W=this.compile(A,F,q);return new Promise(G=>{function ue(){if(W.forEach(function(Re){Be.get(Re).currentProgram.isReady()&&W.delete(Re)}),W.size===0){G(A);return}setTimeout(ue,10)}ge.get("KHR_parallel_shader_compile")!==null?ue():setTimeout(ue,10)})};let Qe=null;function ye(A){Qe&&Qe(A)}function Me(){ae.stop()}function be(){ae.start()}const ae=new A_;ae.setAnimationLoop(ye),typeof self<"u"&&ae.setContext(self),this.setAnimationLoop=function(A){Qe=A,Q.setAnimationLoop(A),A===null?ae.stop():ae.start()},Q.addEventListener("sessionstart",Me),Q.addEventListener("sessionend",be),this.render=function(A,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(x===!0)return;A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Q.enabled===!0&&Q.isPresenting===!0&&(Q.cameraAutoUpdate===!0&&Q.updateCamera(F),F=Q.getCamera()),A.isScene===!0&&A.onBeforeRender(y,A,F,M),p=Ae.get(A,S.length),p.init(),S.push(p),ve.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),Oe.setFromProjectionMatrix(ve),J=this.localClippingEnabled,X=ke.init(this.clippingPlanes,J),_=ce.get(A,m.length),_.init(),m.push(_),Fe(A,F,0,y.sortObjects),_.finish(),y.sortObjects===!0&&_.sort(j,K),this.info.render.frame++,X===!0&&ke.beginShadows();const q=p.state.shadowsArray;if(te.render(q,A,F),X===!0&&ke.endShadows(),this.info.autoReset===!0&&this.info.reset(),(Q.enabled===!1||Q.isPresenting===!1||Q.hasDepthSensing()===!1)&&st.render(_,A),p.setupLights(y._useLegacyLights),F.isArrayCamera){const W=F.cameras;for(let G=0,ue=W.length;G<ue;G++){const Re=W[G];ze(_,A,Re,Re.viewport)}}else ze(_,A,F);M!==null&&(w.updateMultisampleRenderTarget(M),w.updateRenderTargetMipmap(M)),A.isScene===!0&&A.onAfterRender(y,A,F),Xe.resetDefaultState(),I=-1,O=null,S.pop(),S.length>0?p=S[S.length-1]:p=null,m.pop(),m.length>0?_=m[m.length-1]:_=null};function Fe(A,F,q,W){if(A.visible===!1)return;if(A.layers.test(F.layers)){if(A.isGroup)q=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(F);else if(A.isLight)p.pushLight(A),A.castShadow&&p.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||Oe.intersectsSprite(A)){W&&me.setFromMatrixPosition(A.matrixWorld).applyMatrix4(ve);const Re=se.update(A),He=A.material;He.visible&&_.push(A,Re,He,q,me.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||Oe.intersectsObject(A))){const Re=se.update(A),He=A.material;if(W&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),me.copy(A.boundingSphere.center)):(Re.boundingSphere===null&&Re.computeBoundingSphere(),me.copy(Re.boundingSphere.center)),me.applyMatrix4(A.matrixWorld).applyMatrix4(ve)),Array.isArray(He)){const Pe=Re.groups;for(let Ue=0,Ge=Pe.length;Ue<Ge;Ue++){const je=Pe[Ue],bt=He[je.materialIndex];bt&&bt.visible&&_.push(A,Re,bt,q,me.z,je)}}else He.visible&&_.push(A,Re,He,q,me.z,null)}}const ue=A.children;for(let Re=0,He=ue.length;Re<He;Re++)Fe(ue[Re],F,q,W)}function ze(A,F,q,W){const G=A.opaque,ue=A.transmissive,Re=A.transparent;p.setupLightsView(q),X===!0&&ke.setGlobalState(y.clippingPlanes,q),ue.length>0&&Ye(G,ue,F,q),W&&xe.viewport(v.copy(W)),G.length>0&&wt(G,F,q),ue.length>0&&wt(ue,F,q),Re.length>0&&wt(Re,F,q),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function Ye(A,F,q,W){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;const ue=Le.isWebGL2;fe===null&&(fe=new _s(1,1,{generateMipmaps:!0,type:ge.has("EXT_color_buffer_half_float")?xa:Er,minFilter:Wi,samples:ue?4:0})),y.getDrawingBufferSize(Ee),ue?fe.setSize(Ee.x,Ee.y):fe.setSize(Jl(Ee.x),Jl(Ee.y));const Re=y.getRenderTarget();y.setRenderTarget(fe),y.getClearColor($),D=y.getClearAlpha(),D<1&&y.setClearColor(16777215,.5),y.clear();const He=y.toneMapping;y.toneMapping=Mr,wt(A,q,W),w.updateMultisampleRenderTarget(fe),w.updateRenderTargetMipmap(fe);let Pe=!1;for(let Ue=0,Ge=F.length;Ue<Ge;Ue++){const je=F[Ue],bt=je.object,Ht=je.geometry,dt=je.material,dn=je.group;if(dt.side===_i&&bt.layers.test(W.layers)){const gt=dt.side;dt.side=Dn,dt.needsUpdate=!0,tt(bt,q,W,Ht,dt,dn),dt.side=gt,dt.needsUpdate=!0,Pe=!0}}Pe===!0&&(w.updateMultisampleRenderTarget(fe),w.updateRenderTargetMipmap(fe)),y.setRenderTarget(Re),y.setClearColor($,D),y.toneMapping=He}function wt(A,F,q){const W=F.isScene===!0?F.overrideMaterial:null;for(let G=0,ue=A.length;G<ue;G++){const Re=A[G],He=Re.object,Pe=Re.geometry,Ue=W===null?Re.material:W,Ge=Re.group;He.layers.test(q.layers)&&tt(He,F,q,Pe,Ue,Ge)}}function tt(A,F,q,W,G,ue){A.onBeforeRender(y,F,q,W,G,ue),A.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),G.onBeforeRender(y,F,q,W,A,ue),G.transparent===!0&&G.side===_i&&G.forceSinglePass===!1?(G.side=Dn,G.needsUpdate=!0,y.renderBufferDirect(q,F,W,G,A,ue),G.side=Ki,G.needsUpdate=!0,y.renderBufferDirect(q,F,W,G,A,ue),G.side=_i):y.renderBufferDirect(q,F,W,G,A,ue),A.onAfterRender(y,F,q,W,G,ue)}function xt(A,F,q){F.isScene!==!0&&(F=Ke);const W=Be.get(A),G=p.state.lights,ue=p.state.shadowsArray,Re=G.state.version,He=pe.getParameters(A,G.state,ue,F,q),Pe=pe.getProgramCacheKey(He);let Ue=W.programs;W.environment=A.isMeshStandardMaterial?F.environment:null,W.fog=F.fog,W.envMap=(A.isMeshStandardMaterial?z:E).get(A.envMap||W.environment),Ue===void 0&&(A.addEventListener("dispose",ee),Ue=new Map,W.programs=Ue);let Ge=Ue.get(Pe);if(Ge!==void 0){if(W.currentProgram===Ge&&W.lightsStateVersion===Re)return Mt(A,He),Ge}else He.uniforms=pe.getUniforms(A),A.onBuild(q,He,y),A.onBeforeCompile(He,y),Ge=pe.acquireProgram(He,Pe),Ue.set(Pe,Ge),W.uniforms=He.uniforms;const je=W.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(je.clippingPlanes=ke.uniform),Mt(A,He),W.needsLights=On(A),W.lightsStateVersion=Re,W.needsLights&&(je.ambientLightColor.value=G.state.ambient,je.lightProbe.value=G.state.probe,je.directionalLights.value=G.state.directional,je.directionalLightShadows.value=G.state.directionalShadow,je.spotLights.value=G.state.spot,je.spotLightShadows.value=G.state.spotShadow,je.rectAreaLights.value=G.state.rectArea,je.ltc_1.value=G.state.rectAreaLTC1,je.ltc_2.value=G.state.rectAreaLTC2,je.pointLights.value=G.state.point,je.pointLightShadows.value=G.state.pointShadow,je.hemisphereLights.value=G.state.hemi,je.directionalShadowMap.value=G.state.directionalShadowMap,je.directionalShadowMatrix.value=G.state.directionalShadowMatrix,je.spotShadowMap.value=G.state.spotShadowMap,je.spotLightMatrix.value=G.state.spotLightMatrix,je.spotLightMap.value=G.state.spotLightMap,je.pointShadowMap.value=G.state.pointShadowMap,je.pointShadowMatrix.value=G.state.pointShadowMatrix),W.currentProgram=Ge,W.uniformsList=null,Ge}function zt(A){if(A.uniformsList===null){const F=A.currentProgram.getUniforms();A.uniformsList=wl.seqWithValue(F.seq,A.uniforms)}return A.uniformsList}function Mt(A,F){const q=Be.get(A);q.outputColorSpace=F.outputColorSpace,q.batching=F.batching,q.instancing=F.instancing,q.instancingColor=F.instancingColor,q.skinning=F.skinning,q.morphTargets=F.morphTargets,q.morphNormals=F.morphNormals,q.morphColors=F.morphColors,q.morphTargetsCount=F.morphTargetsCount,q.numClippingPlanes=F.numClippingPlanes,q.numIntersection=F.numClipIntersection,q.vertexAlphas=F.vertexAlphas,q.vertexTangents=F.vertexTangents,q.toneMapping=F.toneMapping}function yt(A,F,q,W,G){F.isScene!==!0&&(F=Ke),w.resetTextureUnits();const ue=F.fog,Re=W.isMeshStandardMaterial?F.environment:null,He=M===null?y.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:en,Pe=(W.isMeshStandardMaterial?z:E).get(W.envMap||Re),Ue=W.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Ge=!!q.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),je=!!q.morphAttributes.position,bt=!!q.morphAttributes.normal,Ht=!!q.morphAttributes.color;let dt=Mr;W.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(dt=y.toneMapping);const dn=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,gt=dn!==void 0?dn.length:0,$e=Be.get(W),hc=p.state.lights;if(X===!0&&(J===!0||A!==O)){const qn=A===O&&W.id===I;ke.setState(W,A,qn)}let Dt=!1;W.version===$e.__version?($e.needsLights&&$e.lightsStateVersion!==hc.state.version||$e.outputColorSpace!==He||G.isBatchedMesh&&$e.batching===!1||!G.isBatchedMesh&&$e.batching===!0||G.isInstancedMesh&&$e.instancing===!1||!G.isInstancedMesh&&$e.instancing===!0||G.isSkinnedMesh&&$e.skinning===!1||!G.isSkinnedMesh&&$e.skinning===!0||G.isInstancedMesh&&$e.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&$e.instancingColor===!1&&G.instanceColor!==null||$e.envMap!==Pe||W.fog===!0&&$e.fog!==ue||$e.numClippingPlanes!==void 0&&($e.numClippingPlanes!==ke.numPlanes||$e.numIntersection!==ke.numIntersection)||$e.vertexAlphas!==Ue||$e.vertexTangents!==Ge||$e.morphTargets!==je||$e.morphNormals!==bt||$e.morphColors!==Ht||$e.toneMapping!==dt||Le.isWebGL2===!0&&$e.morphTargetsCount!==gt)&&(Dt=!0):(Dt=!0,$e.__version=W.version);let Cr=$e.currentProgram;Dt===!0&&(Cr=xt(W,F,G));let af=!1,Co=!1,fc=!1;const rn=Cr.getUniforms(),Pr=$e.uniforms;if(xe.useProgram(Cr.program)&&(af=!0,Co=!0,fc=!0),W.id!==I&&(I=W.id,Co=!0),af||O!==A){rn.setValue(k,"projectionMatrix",A.projectionMatrix),rn.setValue(k,"viewMatrix",A.matrixWorldInverse);const qn=rn.map.cameraPosition;qn!==void 0&&qn.setValue(k,me.setFromMatrixPosition(A.matrixWorld)),Le.logarithmicDepthBuffer&&rn.setValue(k,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&rn.setValue(k,"isOrthographic",A.isOrthographicCamera===!0),O!==A&&(O=A,Co=!0,fc=!0)}if(G.isSkinnedMesh){rn.setOptional(k,G,"bindMatrix"),rn.setOptional(k,G,"bindMatrixInverse");const qn=G.skeleton;qn&&(Le.floatVertexTextures?(qn.boneTexture===null&&qn.computeBoneTexture(),rn.setValue(k,"boneTexture",qn.boneTexture,w)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}G.isBatchedMesh&&(rn.setOptional(k,G,"batchingTexture"),rn.setValue(k,"batchingTexture",G._matricesTexture,w));const dc=q.morphAttributes;if((dc.position!==void 0||dc.normal!==void 0||dc.color!==void 0&&Le.isWebGL2===!0)&&Ie.update(G,q,Cr),(Co||$e.receiveShadow!==G.receiveShadow)&&($e.receiveShadow=G.receiveShadow,rn.setValue(k,"receiveShadow",G.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(Pr.envMap.value=Pe,Pr.flipEnvMap.value=Pe.isCubeTexture&&Pe.isRenderTargetTexture===!1?-1:1),Co&&(rn.setValue(k,"toneMappingExposure",y.toneMappingExposure),$e.needsLights&&ft(Pr,fc),ue&&W.fog===!0&&he.refreshFogUniforms(Pr,ue),he.refreshMaterialUniforms(Pr,W,Y,B,fe),wl.upload(k,zt($e),Pr,w)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(wl.upload(k,zt($e),Pr,w),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&rn.setValue(k,"center",G.center),rn.setValue(k,"modelViewMatrix",G.modelViewMatrix),rn.setValue(k,"normalMatrix",G.normalMatrix),rn.setValue(k,"modelMatrix",G.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){const qn=W.uniformsGroups;for(let pc=0,X_=qn.length;pc<X_;pc++)if(Le.isWebGL2){const lf=qn[pc];L.update(lf,Cr),L.bind(lf,Cr)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Cr}function ft(A,F){A.ambientLightColor.needsUpdate=F,A.lightProbe.needsUpdate=F,A.directionalLights.needsUpdate=F,A.directionalLightShadows.needsUpdate=F,A.pointLights.needsUpdate=F,A.pointLightShadows.needsUpdate=F,A.spotLights.needsUpdate=F,A.spotLightShadows.needsUpdate=F,A.rectAreaLights.needsUpdate=F,A.hemisphereLights.needsUpdate=F}function On(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(A,F,q){Be.get(A.texture).__webglTexture=F,Be.get(A.depthTexture).__webglTexture=q;const W=Be.get(A);W.__hasExternalTextures=!0,W.__hasExternalTextures&&(W.__autoAllocateDepthBuffer=q===void 0,W.__autoAllocateDepthBuffer||ge.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),W.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(A,F){const q=Be.get(A);q.__webglFramebuffer=F,q.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(A,F=0,q=0){M=A,T=F,b=q;let W=!0,G=null,ue=!1,Re=!1;if(A){const Pe=Be.get(A);Pe.__useDefaultFramebuffer!==void 0?(xe.bindFramebuffer(k.FRAMEBUFFER,null),W=!1):Pe.__webglFramebuffer===void 0?w.setupRenderTarget(A):Pe.__hasExternalTextures&&w.rebindTextures(A,Be.get(A.texture).__webglTexture,Be.get(A.depthTexture).__webglTexture);const Ue=A.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(Re=!0);const Ge=Be.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ge[F])?G=Ge[F][q]:G=Ge[F],ue=!0):Le.isWebGL2&&A.samples>0&&w.useMultisampledRTT(A)===!1?G=Be.get(A).__webglMultisampledFramebuffer:Array.isArray(Ge)?G=Ge[q]:G=Ge,v.copy(A.viewport),R.copy(A.scissor),N=A.scissorTest}else v.copy(C).multiplyScalar(Y).floor(),R.copy(Z).multiplyScalar(Y).floor(),N=le;if(xe.bindFramebuffer(k.FRAMEBUFFER,G)&&Le.drawBuffers&&W&&xe.drawBuffers(A,G),xe.viewport(v),xe.scissor(R),xe.setScissorTest(N),ue){const Pe=Be.get(A.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_CUBE_MAP_POSITIVE_X+F,Pe.__webglTexture,q)}else if(Re){const Pe=Be.get(A.texture),Ue=F||0;k.framebufferTextureLayer(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,Pe.__webglTexture,q||0,Ue)}I=-1},this.readRenderTargetPixels=function(A,F,q,W,G,ue,Re){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let He=Be.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Re!==void 0&&(He=He[Re]),He){xe.bindFramebuffer(k.FRAMEBUFFER,He);try{const Pe=A.texture,Ue=Pe.format,Ge=Pe.type;if(Ue!==Qn&&_e.convert(Ue)!==k.getParameter(k.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const je=Ge===xa&&(ge.has("EXT_color_buffer_half_float")||Le.isWebGL2&&ge.has("EXT_color_buffer_float"));if(Ge!==Er&&_e.convert(Ge)!==k.getParameter(k.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ge===vi&&(Le.isWebGL2||ge.has("OES_texture_float")||ge.has("WEBGL_color_buffer_float")))&&!je){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=A.width-W&&q>=0&&q<=A.height-G&&k.readPixels(F,q,W,G,_e.convert(Ue),_e.convert(Ge),ue)}finally{const Pe=M!==null?Be.get(M).__webglFramebuffer:null;xe.bindFramebuffer(k.FRAMEBUFFER,Pe)}}},this.copyFramebufferToTexture=function(A,F,q=0){const W=Math.pow(2,-q),G=Math.floor(F.image.width*W),ue=Math.floor(F.image.height*W);w.setTexture2D(F,0),k.copyTexSubImage2D(k.TEXTURE_2D,q,0,0,A.x,A.y,G,ue),xe.unbindTexture()},this.copyTextureToTexture=function(A,F,q,W=0){const G=F.image.width,ue=F.image.height,Re=_e.convert(q.format),He=_e.convert(q.type);w.setTexture2D(q,0),k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,q.flipY),k.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),k.pixelStorei(k.UNPACK_ALIGNMENT,q.unpackAlignment),F.isDataTexture?k.texSubImage2D(k.TEXTURE_2D,W,A.x,A.y,G,ue,Re,He,F.image.data):F.isCompressedTexture?k.compressedTexSubImage2D(k.TEXTURE_2D,W,A.x,A.y,F.mipmaps[0].width,F.mipmaps[0].height,Re,F.mipmaps[0].data):k.texSubImage2D(k.TEXTURE_2D,W,A.x,A.y,Re,He,F.image),W===0&&q.generateMipmaps&&k.generateMipmap(k.TEXTURE_2D),xe.unbindTexture()},this.copyTextureToTexture3D=function(A,F,q,W,G=0){if(y.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const ue=A.max.x-A.min.x+1,Re=A.max.y-A.min.y+1,He=A.max.z-A.min.z+1,Pe=_e.convert(W.format),Ue=_e.convert(W.type);let Ge;if(W.isData3DTexture)w.setTexture3D(W,0),Ge=k.TEXTURE_3D;else if(W.isDataArrayTexture||W.isCompressedArrayTexture)w.setTexture2DArray(W,0),Ge=k.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,W.flipY),k.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),k.pixelStorei(k.UNPACK_ALIGNMENT,W.unpackAlignment);const je=k.getParameter(k.UNPACK_ROW_LENGTH),bt=k.getParameter(k.UNPACK_IMAGE_HEIGHT),Ht=k.getParameter(k.UNPACK_SKIP_PIXELS),dt=k.getParameter(k.UNPACK_SKIP_ROWS),dn=k.getParameter(k.UNPACK_SKIP_IMAGES),gt=q.isCompressedTexture?q.mipmaps[G]:q.image;k.pixelStorei(k.UNPACK_ROW_LENGTH,gt.width),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,gt.height),k.pixelStorei(k.UNPACK_SKIP_PIXELS,A.min.x),k.pixelStorei(k.UNPACK_SKIP_ROWS,A.min.y),k.pixelStorei(k.UNPACK_SKIP_IMAGES,A.min.z),q.isDataTexture||q.isData3DTexture?k.texSubImage3D(Ge,G,F.x,F.y,F.z,ue,Re,He,Pe,Ue,gt.data):q.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),k.compressedTexSubImage3D(Ge,G,F.x,F.y,F.z,ue,Re,He,Pe,gt.data)):k.texSubImage3D(Ge,G,F.x,F.y,F.z,ue,Re,He,Pe,Ue,gt),k.pixelStorei(k.UNPACK_ROW_LENGTH,je),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,bt),k.pixelStorei(k.UNPACK_SKIP_PIXELS,Ht),k.pixelStorei(k.UNPACK_SKIP_ROWS,dt),k.pixelStorei(k.UNPACK_SKIP_IMAGES,dn),G===0&&W.generateMipmaps&&k.generateMipmap(Ge),xe.unbindTexture()},this.initTexture=function(A){A.isCubeTexture?w.setTextureCube(A,0):A.isData3DTexture?w.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?w.setTexture2DArray(A,0):w.setTexture2D(A,0),xe.unbindTexture()},this.resetState=function(){T=0,b=0,M=null,xe.reset(),Xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===qh?"display-p3":"srgb",t.unpackColorSpace=ht.workingColorSpace===ac?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===It?cs:h_}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===cs?It:en}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class fA extends I_{}fA.prototype.isWebGL1Renderer=!0;class dA extends Lt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class pA{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=th,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=fi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return us("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=fi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=fi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const mn=new U;class Zh{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyMatrix4(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyNormalMatrix(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.transformDirection(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=ui(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ui(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ui(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ui(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ui(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array),s=pt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new An(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Zh(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const bp=new U,Ap=new vt,wp=new vt,mA=new U,Rp=new rt,ul=new U,au=new Ci,Cp=new rt,lu=new Aa;class gA extends Vn{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ad,this.bindMatrix=new rt,this.bindMatrixInverse=new rt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Zi),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ul),this.boundingBox.expandByPoint(ul)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Ci),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ul),this.boundingSphere.expandByPoint(ul)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),au.copy(this.boundingSphere),au.applyMatrix4(i),e.ray.intersectsSphere(au)!==!1&&(Cp.copy(i).invert(),lu.copy(e.ray).applyMatrix4(Cp),!(this.boundingBox!==null&&lu.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,lu)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new vt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ad?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Ey?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;Ap.fromBufferAttribute(i.attributes.skinIndex,e),wp.fromBufferAttribute(i.attributes.skinWeight,e),bp.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const o=wp.getComponent(s);if(o!==0){const a=Ap.getComponent(s);Rp.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(mA.copy(bp).applyMatrix4(Rp),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class O_ extends Lt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class _A extends Jt{constructor(e=null,t=1,n=1,i,s,o,a,l,c=$t,u=$t,h,f){super(null,o,a,l,c,u,i,s,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Pp=new rt,vA=new rt;class Jh{constructor(e=[],t=[]){this.uuid=fi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new rt)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new rt;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:vA;Pp.multiplyMatrices(a,t[s]),Pp.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Jh(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new _A(t,e,e,Qn,vi);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const s=e.bones[n];let o=t[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new O_),this.bones.push(o),this.boneInverses.push(new rt().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){const o=t[i];e.bones.push(o.uuid);const a=n[i];e.boneInverses.push(a.toArray())}return e}}class sh extends An{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Vs=new rt,Lp=new rt,hl=[],Dp=new Zi,xA=new rt,Fo=new Vn,Bo=new Ci;class yA extends Vn{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new sh(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,xA)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Zi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vs),Dp.copy(e.boundingBox).applyMatrix4(Vs),this.boundingBox.union(Dp)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ci),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vs),Bo.copy(e.boundingSphere).applyMatrix4(Vs),this.boundingSphere.union(Bo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){const n=this.matrixWorld,i=this.count;if(Fo.geometry=this.geometry,Fo.material=this.material,Fo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bo.copy(this.boundingSphere),Bo.applyMatrix4(n),e.ray.intersectsSphere(Bo)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Vs),Lp.multiplyMatrices(n,Vs),Fo.matrixWorld=Lp,Fo.raycast(e,hl);for(let o=0,a=hl.length;o<a;o++){const l=hl[o];l.instanceId=s,l.object=this,t.push(l)}hl.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new sh(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}}class N_ extends Ai{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ze(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ip=new U,Op=new U,Np=new rt,cu=new Aa,fl=new Ci;class Qh extends Lt{constructor(e=new Pi,t=new N_){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)Ip.fromBufferAttribute(t,i-1),Op.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ip.distanceTo(Op);e.setAttribute("lineDistance",new Yi(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fl.copy(n.boundingSphere),fl.applyMatrix4(i),fl.radius+=s,e.ray.intersectsSphere(fl)===!1)return;Np.copy(i).invert(),cu.copy(e.ray).applyMatrix4(Np);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new U,u=new U,h=new U,f=new U,d=this.isLineSegments?2:1,g=n.index,p=n.attributes.position;if(g!==null){const m=Math.max(0,o.start),S=Math.min(g.count,o.start+o.count);for(let y=m,x=S-1;y<x;y+=d){const T=g.getX(y),b=g.getX(y+1);if(c.fromBufferAttribute(p,T),u.fromBufferAttribute(p,b),cu.distanceSqToSegment(c,u,f,h)>l)continue;f.applyMatrix4(this.matrixWorld);const I=e.ray.origin.distanceTo(f);I<e.near||I>e.far||t.push({distance:I,point:h.clone().applyMatrix4(this.matrixWorld),index:y,face:null,faceIndex:null,object:this})}}else{const m=Math.max(0,o.start),S=Math.min(p.count,o.start+o.count);for(let y=m,x=S-1;y<x;y+=d){if(c.fromBufferAttribute(p,y),u.fromBufferAttribute(p,y+1),cu.distanceSqToSegment(c,u,f,h)>l)continue;f.applyMatrix4(this.matrixWorld);const b=e.ray.origin.distanceTo(f);b<e.near||b>e.far||t.push({distance:b,point:h.clone().applyMatrix4(this.matrixWorld),index:y,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}const Up=new U,Fp=new U;class SA extends Qh{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)Up.fromBufferAttribute(t,i),Fp.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Up.distanceTo(Fp);e.setAttribute("lineDistance",new Yi(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class MA extends Qh{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class U_ extends Ai{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ze(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Bp=new rt,oh=new Aa,dl=new Ci,pl=new U;class EA extends Lt{constructor(e=new Pi,t=new U_){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),dl.copy(n.boundingSphere),dl.applyMatrix4(i),dl.radius+=s,e.ray.intersectsSphere(dl)===!1)return;Bp.copy(i).invert(),oh.copy(e.ray).applyMatrix4(Bp);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const f=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let g=f,_=d;g<_;g++){const p=c.getX(g);pl.fromBufferAttribute(h,p),kp(pl,p,l,i,e,t,this)}}else{const f=Math.max(0,o.start),d=Math.min(h.count,o.start+o.count);for(let g=f,_=d;g<_;g++)pl.fromBufferAttribute(h,g),kp(pl,g,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function kp(r,e,t,n,i,s,o){const a=oh.distanceSqToPoint(r);if(a<t){const l=new U;oh.closestPointToPoint(r,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,object:o})}}class ef extends Ai{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=f_,this.normalScale=new qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ji extends ef{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new qe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return tn(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ze(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ze(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ze(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}function ml(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function TA(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function bA(r){function e(i,s){return r[i]-r[s]}const t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function zp(r,e,t){const n=r.length,i=new r.constructor(n);for(let s=0,o=0;o!==n;++s){const a=t[s]*e;for(let l=0;l!==e;++l)i[o++]=r[a+l]}return i}function F_(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let o=s[n];if(o!==void 0)if(Array.isArray(o))do o=s[n],o!==void 0&&(e.push(s.time),t.push.apply(t,o)),s=r[i++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[n],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do o=s[n],o!==void 0&&(e.push(s.time),t.push(o)),s=r[i++];while(s!==void 0)}class Ra{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=i,i=t[++n],e<i)break e}o=t.length;break t}if(!(e>=s)){const a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let o=0;o!==i;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class AA extends Ra{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Id,endingEnd:Id}}intervalChanged_(e,t,n){const i=this.parameterPositions;let s=e-2,o=e+1,a=i[s],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Od:s=e,a=2*t-n;break;case Nd:s=i.length-2,a=t+i[s]-i[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Od:o=e,l=2*n-t;break;case Nd:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}const c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,n,i){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(n-t)/(i-t),_=g*g,p=_*g,m=-f*p+2*f*_-f*g,S=(1+f)*p+(-1.5-2*f)*_+(-.5+f)*g+1,y=(-1-d)*p+(1.5+d)*_+.5*g,x=d*p-d*_;for(let T=0;T!==a;++T)s[T]=m*o[u+T]+S*o[c+T]+y*o[l+T]+x*o[h+T];return s}}class wA extends Ra{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(i-t),h=1-u;for(let f=0;f!==a;++f)s[f]=o[c+f]*h+o[l+f]*u;return s}}class RA extends Ra{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Li{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ml(t,this.TimeBufferType),this.values=ml(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ml(e.times,Array),values:ml(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new RA(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new wA(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new AA(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ya:t=this.InterpolantFactoryMethodDiscrete;break;case yo:t=this.InterpolantFactoryMethodLinear;break;case Fc:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ya;case this.InterpolantFactoryMethodLinear:return yo;case this.InterpolantFactoryMethodSmooth:return Fc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let s=0,o=i-1;for(;s!==i&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==i){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&TA(i))for(let a=0,l=i.length;a!==l;++a){const c=i[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Fc,s=e.length-1;let o=1;for(let a=1;a<s;++a){let l=!1;const c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(i)l=!0;else{const h=a*n,f=h-n,d=h+n;for(let g=0;g!==n;++g){const _=t[h+g];if(_!==t[f+g]||_!==t[d+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const h=a*n,f=o*n;for(let d=0;d!==n;++d)t[f+d]=t[h+d]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Li.prototype.TimeBufferType=Float32Array;Li.prototype.ValueBufferType=Float32Array;Li.prototype.DefaultInterpolation=yo;class Ao extends Li{}Ao.prototype.ValueTypeName="bool";Ao.prototype.ValueBufferType=Array;Ao.prototype.DefaultInterpolation=ya;Ao.prototype.InterpolantFactoryMethodLinear=void 0;Ao.prototype.InterpolantFactoryMethodSmooth=void 0;class B_ extends Li{}B_.prototype.ValueTypeName="color";class Eo extends Li{}Eo.prototype.ValueTypeName="number";class CA extends Ra{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t);let c=e*a;for(let u=c+a;c!==u;c+=4)Ri.slerpFlat(s,0,o,c-a,o,c,l);return s}}class vs extends Li{InterpolantFactoryMethodLinear(e){return new CA(this.times,this.values,this.getValueSize(),e)}}vs.prototype.ValueTypeName="quaternion";vs.prototype.DefaultInterpolation=yo;vs.prototype.InterpolantFactoryMethodSmooth=void 0;class wo extends Li{}wo.prototype.ValueTypeName="string";wo.prototype.ValueBufferType=Array;wo.prototype.DefaultInterpolation=ya;wo.prototype.InterpolantFactoryMethodLinear=void 0;wo.prototype.InterpolantFactoryMethodSmooth=void 0;class To extends Li{}To.prototype.ValueTypeName="vector";class PA{constructor(e,t=-1,n,i=Dy){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=fi(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(DA(n[o]).scale(i));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,o=n.length;s!==o;++s)t.push(Li.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const s=t.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);const u=bA(l);l=zp(l,1,u),c=zp(c,1,u),!i&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new Eo(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],u=c.name.match(s);if(u&&u.length>1){const h=u[1];let f=i[h];f||(i[h]=f=[]),f.push(c)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(h,f,d,g,_){if(d.length!==0){const p=[],m=[];F_(d,p,m,g),p.length!==0&&_.push(new h(f,p,m))}},i=[],s=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let h=0;h<c.length;h++){const f=c[h].keys;if(!(!f||f.length===0))if(f[0].morphTargets){const d={};let g;for(g=0;g<f.length;g++)if(f[g].morphTargets)for(let _=0;_<f[g].morphTargets.length;_++)d[f[g].morphTargets[_]]=-1;for(const _ in d){const p=[],m=[];for(let S=0;S!==f[g].morphTargets.length;++S){const y=f[g];p.push(y.time),m.push(y.morphTarget===_?1:0)}i.push(new Eo(".morphTargetInfluence["+_+"]",p,m))}l=d.length*o}else{const d=".bones["+t[h].name+"]";n(To,d+".position",f,"pos",i),n(vs,d+".quaternion",f,"rot",i),n(To,d+".scale",f,"scl",i)}}return i.length===0?null:new this(s,l,i,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function LA(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Eo;case"vector":case"vector2":case"vector3":case"vector4":return To;case"color":return B_;case"quaternion":return vs;case"bool":case"boolean":return Ao;case"string":return wo}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function DA(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=LA(r.type);if(r.times===void 0){const t=[],n=[];F_(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const _r={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class IA{constructor(e,t,n){const i=this;let s=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,s===!1&&i.onStart!==void 0&&i.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){const h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){const d=c[h],g=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null}}}const OA=new IA;class Ro{constructor(e){this.manager=e!==void 0?e:OA,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Ro.DEFAULT_MATERIAL_NAME="__DEFAULT";const Fi={};class NA extends Error{constructor(e,t){super(e),this.response=t}}class k_ extends Ro{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=_r.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(Fi[e]!==void 0){Fi[e].push({onLoad:t,onProgress:n,onError:i});return}Fi[e]=[],Fi[e].push({onLoad:t,onProgress:n,onError:i});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const u=Fi[e],h=c.body.getReader(),f=c.headers.get("Content-Length")||c.headers.get("X-File-Size"),d=f?parseInt(f):0,g=d!==0;let _=0;const p=new ReadableStream({start(m){S();function S(){h.read().then(({done:y,value:x})=>{if(y)m.close();else{_+=x.byteLength;const T=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:d});for(let b=0,M=u.length;b<M;b++){const I=u[b];I.onProgress&&I.onProgress(T)}m.enqueue(x),S()}})}}});return new Response(p)}else throw new NA(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a===void 0)return c.text();{const h=/charset="?([^;"\s]*)"?/i.exec(a),f=h&&h[1]?h[1].toLowerCase():void 0,d=new TextDecoder(f);return c.arrayBuffer().then(g=>d.decode(g))}}}).then(c=>{_r.add(e,c);const u=Fi[e];delete Fi[e];for(let h=0,f=u.length;h<f;h++){const d=u[h];d.onLoad&&d.onLoad(c)}}).catch(c=>{const u=Fi[e];if(u===void 0)throw this.manager.itemError(e),c;delete Fi[e];for(let h=0,f=u.length;h<f;h++){const d=u[h];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class UA extends Ro{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=_r.get(e);if(o!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o;const a=Sa("img");function l(){u(),_r.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(h){u(),i&&i(h),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),s.manager.itemStart(e),a.src=e,a}}class FA extends Ro{constructor(e){super(e)}load(e,t,n,i){const s=new Jt,o=new UA(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}}class tf extends Lt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}const uu=new rt,Hp=new U,Gp=new U;class nf{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new qe(512,512),this.map=null,this.mapPass=null,this.matrix=new rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new jh,this._frameExtents=new qe(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Hp.setFromMatrixPosition(e.matrixWorld),t.position.copy(Hp),Gp.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Gp),t.updateMatrixWorld(),uu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(uu),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(uu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class BA extends nf{constructor(){super(new Mn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=So*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class kA extends tf{constructor(e,t,n=0,i=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Lt.DEFAULT_UP),this.updateMatrix(),this.target=new Lt,this.distance=n,this.angle=i,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new BA}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Vp=new rt,ko=new U,hu=new U;class zA extends nf{constructor(){super(new Mn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new qe(4,2),this._viewportCount=6,this._viewports=[new vt(2,1,1,1),new vt(0,1,1,1),new vt(3,1,1,1),new vt(1,1,1,1),new vt(3,0,1,1),new vt(1,0,1,1)],this._cubeDirections=[new U(1,0,0),new U(-1,0,0),new U(0,0,1),new U(0,0,-1),new U(0,1,0),new U(0,-1,0)],this._cubeUps=[new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,0,1),new U(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),ko.setFromMatrixPosition(e.matrixWorld),n.position.copy(ko),hu.copy(n.position),hu.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(hu),n.updateMatrixWorld(),i.makeTranslation(-ko.x,-ko.y,-ko.z),Vp.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vp)}}class HA extends tf{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new zA}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class GA extends nf{constructor(){super(new $h(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class z_ extends tf{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Lt.DEFAULT_UP),this.updateMatrix(),this.target=new Lt,this.shadow=new GA}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class la{static decodeText(e){if(typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class VA extends Ro{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=_r.get(e);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{i&&i(c)});return}return setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return _r.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){i&&i(c),_r.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});_r.add(e,l),s.manager.itemStart(e)}}const rf="\\[\\]\\.:\\/",WA=new RegExp("["+rf+"]","g"),sf="[^"+rf+"]",XA="[^"+rf.replace("\\.","")+"]",qA=/((?:WC+[\/:])*)/.source.replace("WC",sf),YA=/(WCOD+)?/.source.replace("WCOD",XA),jA=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",sf),$A=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",sf),KA=new RegExp("^"+qA+YA+jA+$A+"$"),ZA=["material","materials","bones","map"];class JA{constructor(e,t,n){const i=n||mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class mt{constructor(e,t,n){this.path=t,this.parsedPath=n||mt.parseTrackName(t),this.node=mt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new mt.Composite(e,t,n):new mt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(WA,"")}static parseTrackName(e){const t=KA.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const s=n.nodeName.substring(i+1);ZA.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let o=0;o<s.length;o++){const a=s[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let s=t.propertyIndex;if(e||(e=mt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[i];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}mt.Composite=JA;mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};mt.prototype.GetterByBindingType=[mt.prototype._getValue_direct,mt.prototype._getValue_array,mt.prototype._getValue_arrayElement,mt.prototype._getValue_toArray];mt.prototype.SetterByBindingTypeAndVersioning=[[mt.prototype._setValue_direct,mt.prototype._setValue_direct_setNeedsUpdate,mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_array,mt.prototype._setValue_array_setNeedsUpdate,mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_arrayElement,mt.prototype._setValue_arrayElement_setNeedsUpdate,mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_fromArray,mt.prototype._setValue_fromArray_setNeedsUpdate,mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Wp{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(tn(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Wh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Wh);function Xp(r,e){if(e===Iy)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),r;if(e===eh||e===u_){let t=r.getIndex();if(t===null){const o=[],a=r.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);r.setIndex(o),t=r.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),r}const n=t.count-2,i=[];if(e===eh)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=r.clone();return s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),r}class QA extends Ro{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new rw(t)}),this.register(function(t){return new dw(t)}),this.register(function(t){return new pw(t)}),this.register(function(t){return new mw(t)}),this.register(function(t){return new ow(t)}),this.register(function(t){return new aw(t)}),this.register(function(t){return new lw(t)}),this.register(function(t){return new cw(t)}),this.register(function(t){return new iw(t)}),this.register(function(t){return new uw(t)}),this.register(function(t){return new sw(t)}),this.register(function(t){return new fw(t)}),this.register(function(t){return new hw(t)}),this.register(function(t){return new tw(t)}),this.register(function(t){return new gw(t)}),this.register(function(t){return new _w(t)})}load(e,t,n,i){const s=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=la.extractUrlBase(e);o=la.resolveURL(c,this.path)}else o=la.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){i?i(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new k_(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,o,function(u){t(u),s.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let s;const o={},a={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===H_){try{o[at.KHR_BINARY_GLTF]=new vw(e)}catch(h){i&&i(h);return}s=JSON.parse(o[at.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new Lw(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const h=this.pluginCallbacks[u](c);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){const h=s.extensionsUsed[u],f=s.extensionsRequired||[];switch(h){case at.KHR_MATERIALS_UNLIT:o[h]=new nw;break;case at.KHR_DRACO_MESH_COMPRESSION:o[h]=new xw(s,this.dracoLoader);break;case at.KHR_TEXTURE_TRANSFORM:o[h]=new yw;break;case at.KHR_MESH_QUANTIZATION:o[h]=new Sw;break;default:f.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function ew(){let r={};return{get:function(e){return r[e]},add:function(e,t){r[e]=t},remove:function(e){delete r[e]},removeAll:function(){r={}}}}const at={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class tw{constructor(e){this.parser=e,this.name=at.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let c;const u=new Ze(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],en);const h=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new z_(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new HA(u),c.distance=h;break;case"spot":c=new kA(u),c.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,cr(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}class nw{constructor(){this.name=at.KHR_MATERIALS_UNLIT}getMaterialType(){return Jr}extendParams(e,t,n){const i=[];e.color=new Ze(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const o=s.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],en),e.opacity=o[3]}s.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",s.baseColorTexture,It))}return Promise.all(i)}}class iw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}}class rw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new qe(a,a)}return Promise.all(s)}}class sw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(s)}}class ow{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new Ze(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],en)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,It)),o.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(s)}}class aw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(s)}}class lw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ze().setRGB(a[0],a[1],a[2],en),Promise.all(s)}}class cw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class uw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ze().setRGB(a[0],a[1],a[2],en),o.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,It)),Promise.all(s)}}class hw{constructor(e){this.parser=e,this.name=at.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(s)}}class fw{constructor(e){this.parser=e,this.name=at.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ji}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(s)}}class dw{constructor(e){this.parser=e,this.name=at.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const s=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,o)}}class pw{constructor(e){this.parser=e,this.name=at.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const o=s.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class mw{constructor(e){this.parser=e,this.name=at.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const o=s.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class gw{constructor(e){this.name=at.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(a){const l=i.byteOffset||0,c=i.byteLength||0,u=i.count,h=i.byteStride,f=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,f,i.mode,i.filter).then(function(d){return d.buffer}):o.ready.then(function(){const d=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(d),u,h,f,i.mode,i.filter),d})})}else return null}}class _w{constructor(e){this.name=at.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==$n.TRIANGLES&&c.mode!==$n.TRIANGLE_STRIP&&c.mode!==$n.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const u=c.pop(),h=u.isGroup?u.children:[u],f=c[0].count,d=[];for(const g of h){const _=new rt,p=new U,m=new Ri,S=new U(1,1,1),y=new yA(g.geometry,g.material,f);for(let x=0;x<f;x++)l.TRANSLATION&&p.fromBufferAttribute(l.TRANSLATION,x),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,x),l.SCALE&&S.fromBufferAttribute(l.SCALE,x),y.setMatrixAt(x,_.compose(p,m,S));for(const x in l)if(x==="_COLOR_0"){const T=l[x];y.instanceColor=new sh(T.array,T.itemSize,T.normalized)}else x!=="TRANSLATION"&&x!=="ROTATION"&&x!=="SCALE"&&g.geometry.setAttribute(x,l[x]);Lt.prototype.copy.call(y,g),this.parser.assignFinalMaterial(y),d.push(y)}return u.isGroup?(u.clear(),u.add(...d),u):d[0]}))}}const H_="glTF",zo=12,qp={JSON:1313821514,BIN:5130562};class vw{constructor(e){this.name=at.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,zo),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==H_)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-zo,s=new DataView(e,zo);let o=0;for(;o<i;){const a=s.getUint32(o,!0);o+=4;const l=s.getUint32(o,!0);if(o+=4,l===qp.JSON){const c=new Uint8Array(e,zo+o,a);this.content=n.decode(c)}else if(l===qp.BIN){const c=zo+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class xw{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=at.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const u in o){const h=ah[u]||u.toLowerCase();a[h]=o[u]}for(const u in e.attributes){const h=ah[u]||u.toLowerCase();if(o[u]!==void 0){const f=n.accessors[e.attributes[u]],d=lo[f.componentType];c[h]=d.name,l[h]=f.normalized===!0}}return t.getDependency("bufferView",s).then(function(u){return new Promise(function(h,f){i.decodeDracoFile(u,function(d){for(const g in d.attributes){const _=d.attributes[g],p=l[g];p!==void 0&&(_.normalized=p)}h(d)},a,c,en,f)})})}}class yw{constructor(){this.name=at.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class Sw{constructor(){this.name=at.KHR_MESH_QUANTIZATION}}class G_ extends Ra{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[s+o];return t}interpolate_(e,t,n,i){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=i-t,h=(n-t)/u,f=h*h,d=f*h,g=e*c,_=g-c,p=-2*d+3*f,m=d-f,S=1-p,y=m-f+h;for(let x=0;x!==a;x++){const T=o[_+x+a],b=o[_+x+l]*u,M=o[g+x+a],I=o[g+x]*u;s[x]=S*T+y*b+p*M+m*I}return s}}const Mw=new Ri;class Ew extends G_{interpolate_(e,t,n,i){const s=super.interpolate_(e,t,n,i);return Mw.fromArray(s).normalize().toArray(s),s}}const $n={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},lo={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Yp={9728:$t,9729:cn,9984:Qu,9985:Al,9986:Ys,9987:Wi},jp={33071:Jn,33648:Yl,10497:vo},fu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},ah={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},sr={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Tw={CUBICSPLINE:void 0,LINEAR:yo,STEP:ya},du={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function bw(r){return r.DefaultMaterial===void 0&&(r.DefaultMaterial=new ef({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Ki})),r.DefaultMaterial}function Fr(r,e,t){for(const n in t.extensions)r[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function cr(r,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(r.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Aw(r,e,t){let n=!1,i=!1,s=!1;for(let c=0,u=e.length;c<u;c++){const h=e[c];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(i=!0),h.COLOR_0!==void 0&&(s=!0),n&&i&&s)break}if(!n&&!i&&!s)return Promise.resolve(r);const o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){const h=e[c];if(n){const f=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):r.attributes.position;o.push(f)}if(i){const f=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):r.attributes.normal;a.push(f)}if(s){const f=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):r.attributes.color;l.push(f)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const u=c[0],h=c[1],f=c[2];return n&&(r.morphAttributes.position=u),i&&(r.morphAttributes.normal=h),s&&(r.morphAttributes.color=f),r.morphTargetsRelative=!0,r})}function ww(r,e){if(r.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)r.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(r.morphTargetInfluences.length===t.length){r.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)r.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Rw(r){let e;const t=r.extensions&&r.extensions[at.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+pu(t.attributes):e=r.indices+":"+pu(r.attributes)+":"+r.mode,r.targets!==void 0)for(let n=0,i=r.targets.length;n<i;n++)e+=":"+pu(r.targets[n]);return e}function pu(r){let e="";const t=Object.keys(r).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+r[t[n]]+";";return e}function lh(r){switch(r){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Cw(r){return r.search(/\.jpe?g($|\?)/i)>0||r.search(/^data\:image\/jpeg/)===0?"image/jpeg":r.search(/\.webp($|\?)/i)>0||r.search(/^data\:image\/webp/)===0?"image/webp":"image/png"}const Pw=new rt;class Lw{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new ew,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=!1,s=-1;typeof navigator<"u"&&(n=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)===!0,i=navigator.userAgent.indexOf("Firefox")>-1,s=i?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),typeof createImageBitmap>"u"||n||i&&s<98?this.textureLoader=new FA(this.options.manager):this.textureLoader=new VA(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new k_(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return Fr(s,a,i),cr(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){const o=t[i].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let i=0,s=e.length;i<s;i++){const o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),s=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,u]of o.children.entries())s(u,a.children[c])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const s=e(t[i]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[at.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(s,o){n.load(la.resolveURL(t.uri,i.path),s,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const o=fu[i.type],a=lo[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new An(c,o,l))}const s=[];return i.bufferView!==void 0?s.push(this.getDependency("bufferView",i.bufferView)):s.push(null),i.sparse!==void 0&&(s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(s).then(function(o){const a=o[0],l=fu[i.type],c=lo[i.componentType],u=c.BYTES_PER_ELEMENT,h=u*l,f=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0;let _,p;if(d&&d!==h){const m=Math.floor(f/d),S="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+m+":"+i.count;let y=t.cache.get(S);y||(_=new c(a,m*d,i.count*d/u),y=new pA(_,d/u),t.cache.add(S,y)),p=new Zh(y,l,f%d/u,g)}else a===null?_=new c(i.count*l):_=new c(a,f,i.count*l),p=new An(_,l,g);if(i.sparse!==void 0){const m=fu.SCALAR,S=lo[i.sparse.indices.componentType],y=i.sparse.indices.byteOffset||0,x=i.sparse.values.byteOffset||0,T=new S(o[1],y,i.sparse.count*m),b=new c(o[2],x,i.sparse.count*l);a!==null&&(p=new An(p.array.slice(),p.itemSize,p.normalized));for(let M=0,I=T.length;M<I;M++){const O=T[M];if(p.setX(O,b[M*l]),l>=2&&p.setY(O,b[M*l+1]),l>=3&&p.setZ(O,b[M*l+2]),l>=4&&p.setW(O,b[M*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return p})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,o=t.images[s];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,s,a)}loadTextureImage(e,t,n){const i=this,s=this.json,o=s.textures[e],a=s.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);const f=(s.samplers||{})[o.sampler]||{};return u.magFilter=Yp[f.magFilter]||cn,u.minFilter=Yp[f.minFilter]||Wi,u.wrapS=jp[f.wrapS]||vo,u.wrapT=jp[f.wrapT]||vo,i.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());const o=i.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(h){c=!0;const f=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(f),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const u=Promise.resolve(l).then(function(h){return new Promise(function(f,d){let g=f;t.isImageBitmapLoader===!0&&(g=function(_){const p=new Jt(_);p.needsUpdate=!0,f(p)}),t.load(la.resolveURL(h,s.path),g,void 0,d)})}).then(function(h){return c===!0&&a.revokeObjectURL(l),h.userData.mimeType=o.mimeType||Cw(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,i){const s=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),s.extensions[at.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[at.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=s.associations.get(o);o=s.extensions[at.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),s.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new U_,Ai.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new N_,Ai.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||s||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),s&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),s&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return ef}loadMaterial(e){const t=this,n=this.json,i=this.extensions,s=n.materials[e];let o;const a={},l=s.extensions||{},c=[];if(l[at.KHR_MATERIALS_UNLIT]){const h=i[at.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),c.push(h.extendParams(a,s,t))}else{const h=s.pbrMetallicRoughness||{};if(a.color=new Ze(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){const f=h.baseColorFactor;a.color.setRGB(f[0],f[1],f[2],en),a.opacity=f[3]}h.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",h.baseColorTexture,It)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,a)})))}s.doubleSided===!0&&(a.side=_i);const u=s.alphaMode||du.OPAQUE;if(u===du.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===du.MASK&&(a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&o!==Jr&&(c.push(t.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new qe(1,1),s.normalTexture.scale!==void 0)){const h=s.normalTexture.scale;a.normalScale.set(h,h)}if(s.occlusionTexture!==void 0&&o!==Jr&&(c.push(t.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&o!==Jr){const h=s.emissiveFactor;a.emissive=new Ze().setRGB(h[0],h[1],h[2],en)}return s.emissiveTexture!==void 0&&o!==Jr&&c.push(t.assignTexture(a,"emissiveMap",s.emissiveTexture,It)),Promise.all(c).then(function(){const h=new o(a);return s.name&&(h.name=s.name),cr(h,s),t.associations.set(h,{materials:e}),s.extensions&&Fr(i,h,s),h})}createUniqueName(e){const t=mt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function s(a){return n[at.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return $p(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],u=Rw(c),h=i[u];if(h)o.push(h.promise);else{let f;c.extensions&&c.extensions[at.KHR_DRACO_MESH_COMPRESSION]?f=s(c):f=$p(new Pi,c,t),i[u]={primitive:c,promise:f},o.push(f)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,i=this.extensions,s=n.meshes[e],o=s.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const u=o[l].material===void 0?bw(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),u=l[l.length-1],h=[];for(let d=0,g=u.length;d<g;d++){const _=u[d],p=o[d];let m;const S=c[d];if(p.mode===$n.TRIANGLES||p.mode===$n.TRIANGLE_STRIP||p.mode===$n.TRIANGLE_FAN||p.mode===void 0)m=s.isSkinnedMesh===!0?new gA(_,S):new Vn(_,S),m.isSkinnedMesh===!0&&m.normalizeSkinWeights(),p.mode===$n.TRIANGLE_STRIP?m.geometry=Xp(m.geometry,u_):p.mode===$n.TRIANGLE_FAN&&(m.geometry=Xp(m.geometry,eh));else if(p.mode===$n.LINES)m=new SA(_,S);else if(p.mode===$n.LINE_STRIP)m=new Qh(_,S);else if(p.mode===$n.LINE_LOOP)m=new MA(_,S);else if(p.mode===$n.POINTS)m=new EA(_,S);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(m.geometry.morphAttributes).length>0&&ww(m,s),m.name=t.createUniqueName(s.name||"mesh_"+e),cr(m,s),p.extensions&&Fr(i,m,p),t.assignFinalMaterial(m),h.push(m)}for(let d=0,g=h.length;d<g;d++)t.associations.set(h[d],{meshes:e,primitives:d});if(h.length===1)return s.extensions&&Fr(i,h[0],s),h[0];const f=new Qr;s.extensions&&Fr(i,f,s),t.associations.set(f,{meshes:e});for(let d=0,g=h.length;d<g;d++)f.add(h[d]);return f})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Mn(p_.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new $h(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),cr(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const s=i.pop(),o=i,a=[],l=[];for(let c=0,u=o.length;c<u;c++){const h=o[c];if(h){a.push(h);const f=new rt;s!==null&&f.fromArray(s.array,c*16),l.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Jh(a,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let h=0,f=i.channels.length;h<f;h++){const d=i.channels[h],g=i.samplers[d.sampler],_=d.target,p=_.node,m=i.parameters!==void 0?i.parameters[g.input]:g.input,S=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",p)),a.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",S)),c.push(g),u.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(h){const f=h[0],d=h[1],g=h[2],_=h[3],p=h[4],m=[];for(let S=0,y=f.length;S<y;S++){const x=f[S],T=d[S],b=g[S],M=_[S],I=p[S];if(x===void 0)continue;x.updateMatrix&&x.updateMatrix();const O=n._createAnimationTracks(x,T,b,M,I);if(O)for(let v=0;v<O.length;v++)m.push(O[v])}return new PA(s,void 0,m)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(s){const o=n._getNodeRef(n.meshCache,i.mesh,s);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),o=[],a=i.children||[];for(let c=0,u=a.length;c<u;c++)o.push(n.getDependency("node",a[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(o),l]).then(function(c){const u=c[0],h=c[1],f=c[2];f!==null&&u.traverse(function(d){d.isSkinnedMesh&&d.bind(f,Pw)});for(let d=0,g=h.length;d<g;d++)u.add(h[d]);return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],o=s.name?i.createUniqueName(s.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),s.camera!==void 0&&a.push(i.getDependency("camera",s.camera).then(function(c){return i._getNodeRef(i.cameraCache,s.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(s.isBone===!0?u=new O_:c.length>1?u=new Qr:c.length===1?u=c[0]:u=new Lt,u!==c[0])for(let h=0,f=c.length;h<f;h++)u.add(c[h]);if(s.name&&(u.userData.name=s.name,u.name=o),cr(u,s),s.extensions&&Fr(n,u,s),s.matrix!==void 0){const h=new rt;h.fromArray(s.matrix),u.applyMatrix4(h)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);return i.associations.has(u)||i.associations.set(u,{}),i.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,s=new Qr;n.name&&(s.name=i.createUniqueName(n.name)),cr(s,n),n.extensions&&Fr(t,s,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,h=l.length;u<h;u++)s.add(l[u]);const c=u=>{const h=new Map;for(const[f,d]of i.associations)(f instanceof Ai||f instanceof Jt)&&h.set(f,d);return u.traverse(f=>{const d=i.associations.get(f);d!=null&&h.set(f,d)}),h};return i.associations=c(s),s})}_createAnimationTracks(e,t,n,i,s){const o=[],a=e.name?e.name:e.uuid,l=[];sr[s.path]===sr.weights?e.traverse(function(f){f.morphTargetInfluences&&l.push(f.name?f.name:f.uuid)}):l.push(a);let c;switch(sr[s.path]){case sr.weights:c=Eo;break;case sr.rotation:c=vs;break;case sr.position:case sr.scale:c=To;break;default:switch(n.itemSize){case 1:c=Eo;break;case 2:case 3:default:c=To;break}break}const u=i.interpolation!==void 0?Tw[i.interpolation]:yo,h=this._getArrayFromAccessor(n);for(let f=0,d=l.length;f<d;f++){const g=new c(l[f]+"."+sr[s.path],t.array,h,u);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=lh(t.constructor),i=new Float32Array(t.length);for(let s=0,o=t.length;s<o;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof vs?Ew:G_;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Dw(r,e,t){const n=e.attributes,i=new Zi;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new U(l[0],l[1],l[2]),new U(c[0],c[1],c[2])),a.normalized){const u=lh(lo[a.componentType]);i.min.multiplyScalar(u),i.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const a=new U,l=new U;for(let c=0,u=s.length;c<u;c++){const h=s[c];if(h.POSITION!==void 0){const f=t.json.accessors[h.POSITION],d=f.min,g=f.max;if(d!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(g[2]))),f.normalized){const _=lh(lo[f.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}r.boundingBox=i;const o=new Ci;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,r.boundingSphere=o}function $p(r,e,t){const n=e.attributes,i=[];function s(o,a){return t.getDependency("accessor",o).then(function(l){r.setAttribute(a,l)})}for(const o in n){const a=ah[o]||o.toLowerCase();a in r.attributes||i.push(s(n[o],a))}if(e.indices!==void 0&&!r.index){const o=t.getDependency("accessor",e.indices).then(function(a){r.setIndex(a)});i.push(o)}return ht.workingColorSpace!==en&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ht.workingColorSpace}" not supported.`),cr(r,e),Dw(r,e,t),Promise.all(i).then(function(){return e.targets!==void 0?Aw(r,e.targets,t):r})}const Kp={type:"change"},mu={type:"start"},Zp={type:"end"},gl=new Aa,Jp=new lr,Iw=Math.cos(70*p_.DEG2RAD);class Ow extends ys{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new U,this.cursor=new U,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:bs.ROTATE,MIDDLE:bs.DOLLY,RIGHT:bs.PAN},this.touches={ONE:As.ROTATE,TWO:As.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return a.phi},this.getAzimuthalAngle=function(){return a.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(L){L.addEventListener("keydown",Ae),this._domElementKeyEvents=L},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",Ae),this._domElementKeyEvents=null},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(Kp),n.update(),s=i.NONE},this.update=function(){const L=new U,oe=new Ri().setFromUnitVectors(e.up,new U(0,1,0)),Q=oe.clone().invert(),Ce=new U,P=new Ri,ie=new U,ee=2*Math.PI;return function(Ne=null){const Je=n.object.position;L.copy(Je).sub(n.target),L.applyQuaternion(oe),a.setFromVector3(L),n.autoRotate&&s===i.NONE&&N(v(Ne)),n.enableDamping?(a.theta+=l.theta*n.dampingFactor,a.phi+=l.phi*n.dampingFactor):(a.theta+=l.theta,a.phi+=l.phi);let Qe=n.minAzimuthAngle,ye=n.maxAzimuthAngle;isFinite(Qe)&&isFinite(ye)&&(Qe<-Math.PI?Qe+=ee:Qe>Math.PI&&(Qe-=ee),ye<-Math.PI?ye+=ee:ye>Math.PI&&(ye-=ee),Qe<=ye?a.theta=Math.max(Qe,Math.min(ye,a.theta)):a.theta=a.theta>(Qe+ye)/2?Math.max(Qe,a.theta):Math.min(ye,a.theta)),a.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,a.phi)),a.makeSafe(),n.enableDamping===!0?n.target.addScaledVector(u,n.dampingFactor):n.target.add(u),n.target.sub(n.cursor),n.target.clampLength(n.minTargetRadius,n.maxTargetRadius),n.target.add(n.cursor),n.zoomToCursor&&b||n.object.isOrthographicCamera?a.radius=C(a.radius):a.radius=C(a.radius*c),L.setFromSpherical(a),L.applyQuaternion(Q),Je.copy(n.target).add(L),n.object.lookAt(n.target),n.enableDamping===!0?(l.theta*=1-n.dampingFactor,l.phi*=1-n.dampingFactor,u.multiplyScalar(1-n.dampingFactor)):(l.set(0,0,0),u.set(0,0,0));let Me=!1;if(n.zoomToCursor&&b){let be=null;if(n.object.isPerspectiveCamera){const ae=L.length();be=C(ae*c);const Fe=ae-be;n.object.position.addScaledVector(x,Fe),n.object.updateMatrixWorld()}else if(n.object.isOrthographicCamera){const ae=new U(T.x,T.y,0);ae.unproject(n.object),n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),Me=!0;const Fe=new U(T.x,T.y,0);Fe.unproject(n.object),n.object.position.sub(Fe).add(ae),n.object.updateMatrixWorld(),be=L.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),n.zoomToCursor=!1;be!==null&&(this.screenSpacePanning?n.target.set(0,0,-1).transformDirection(n.object.matrix).multiplyScalar(be).add(n.object.position):(gl.origin.copy(n.object.position),gl.direction.set(0,0,-1).transformDirection(n.object.matrix),Math.abs(n.object.up.dot(gl.direction))<Iw?e.lookAt(n.target):(Jp.setFromNormalAndCoplanarPoint(n.object.up,n.target),gl.intersectPlane(Jp,n.target))))}else n.object.isOrthographicCamera&&(Me=c!==1,Me&&(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix()));return c=1,b=!1,Me||Ce.distanceToSquared(n.object.position)>o||8*(1-P.dot(n.object.quaternion))>o||ie.distanceToSquared(n.target)>0?(n.dispatchEvent(Kp),Ce.copy(n.object.position),P.copy(n.object.quaternion),ie.copy(n.target),!0):!1}}(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",st),n.domElement.removeEventListener("pointerdown",w),n.domElement.removeEventListener("pointercancel",z),n.domElement.removeEventListener("wheel",se),n.domElement.removeEventListener("pointermove",E),n.domElement.removeEventListener("pointerup",z),n._domElementKeyEvents!==null&&(n._domElementKeyEvents.removeEventListener("keydown",Ae),n._domElementKeyEvents=null)};const n=this,i={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let s=i.NONE;const o=1e-6,a=new Wp,l=new Wp;let c=1;const u=new U,h=new qe,f=new qe,d=new qe,g=new qe,_=new qe,p=new qe,m=new qe,S=new qe,y=new qe,x=new U,T=new qe;let b=!1;const M=[],I={};let O=!1;function v(L){return L!==null?2*Math.PI/60*n.autoRotateSpeed*L:2*Math.PI/60/60*n.autoRotateSpeed}function R(L){const oe=Math.abs(L*.01);return Math.pow(.95,n.zoomSpeed*oe)}function N(L){l.theta-=L}function $(L){l.phi-=L}const D=function(){const L=new U;return function(Q,Ce){L.setFromMatrixColumn(Ce,0),L.multiplyScalar(-Q),u.add(L)}}(),H=function(){const L=new U;return function(Q,Ce){n.screenSpacePanning===!0?L.setFromMatrixColumn(Ce,1):(L.setFromMatrixColumn(Ce,0),L.crossVectors(n.object.up,L)),L.multiplyScalar(Q),u.add(L)}}(),B=function(){const L=new U;return function(Q,Ce){const P=n.domElement;if(n.object.isPerspectiveCamera){const ie=n.object.position;L.copy(ie).sub(n.target);let ee=L.length();ee*=Math.tan(n.object.fov/2*Math.PI/180),D(2*Q*ee/P.clientHeight,n.object.matrix),H(2*Ce*ee/P.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?(D(Q*(n.object.right-n.object.left)/n.object.zoom/P.clientWidth,n.object.matrix),H(Ce*(n.object.top-n.object.bottom)/n.object.zoom/P.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}}();function Y(L){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c/=L:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function j(L){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c*=L:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function K(L,oe){if(!n.zoomToCursor)return;b=!0;const Q=n.domElement.getBoundingClientRect(),Ce=L-Q.left,P=oe-Q.top,ie=Q.width,ee=Q.height;T.x=Ce/ie*2-1,T.y=-(P/ee)*2+1,x.set(T.x,T.y,1).unproject(n.object).sub(n.object.position).normalize()}function C(L){return Math.max(n.minDistance,Math.min(n.maxDistance,L))}function Z(L){h.set(L.clientX,L.clientY)}function le(L){K(L.clientX,L.clientX),m.set(L.clientX,L.clientY)}function Oe(L){g.set(L.clientX,L.clientY)}function X(L){f.set(L.clientX,L.clientY),d.subVectors(f,h).multiplyScalar(n.rotateSpeed);const oe=n.domElement;N(2*Math.PI*d.x/oe.clientHeight),$(2*Math.PI*d.y/oe.clientHeight),h.copy(f),n.update()}function J(L){S.set(L.clientX,L.clientY),y.subVectors(S,m),y.y>0?Y(R(y.y)):y.y<0&&j(R(y.y)),m.copy(S),n.update()}function fe(L){_.set(L.clientX,L.clientY),p.subVectors(_,g).multiplyScalar(n.panSpeed),B(p.x,p.y),g.copy(_),n.update()}function ve(L){K(L.clientX,L.clientY),L.deltaY<0?j(R(L.deltaY)):L.deltaY>0&&Y(R(L.deltaY)),n.update()}function Ee(L){let oe=!1;switch(L.code){case n.keys.UP:L.ctrlKey||L.metaKey||L.shiftKey?$(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(0,n.keyPanSpeed),oe=!0;break;case n.keys.BOTTOM:L.ctrlKey||L.metaKey||L.shiftKey?$(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(0,-n.keyPanSpeed),oe=!0;break;case n.keys.LEFT:L.ctrlKey||L.metaKey||L.shiftKey?N(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(n.keyPanSpeed,0),oe=!0;break;case n.keys.RIGHT:L.ctrlKey||L.metaKey||L.shiftKey?N(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(-n.keyPanSpeed,0),oe=!0;break}oe&&(L.preventDefault(),n.update())}function me(L){if(M.length===1)h.set(L.pageX,L.pageY);else{const oe=_e(L),Q=.5*(L.pageX+oe.x),Ce=.5*(L.pageY+oe.y);h.set(Q,Ce)}}function Ke(L){if(M.length===1)g.set(L.pageX,L.pageY);else{const oe=_e(L),Q=.5*(L.pageX+oe.x),Ce=.5*(L.pageY+oe.y);g.set(Q,Ce)}}function De(L){const oe=_e(L),Q=L.pageX-oe.x,Ce=L.pageY-oe.y,P=Math.sqrt(Q*Q+Ce*Ce);m.set(0,P)}function k(L){n.enableZoom&&De(L),n.enablePan&&Ke(L)}function Ve(L){n.enableZoom&&De(L),n.enableRotate&&me(L)}function ge(L){if(M.length==1)f.set(L.pageX,L.pageY);else{const Q=_e(L),Ce=.5*(L.pageX+Q.x),P=.5*(L.pageY+Q.y);f.set(Ce,P)}d.subVectors(f,h).multiplyScalar(n.rotateSpeed);const oe=n.domElement;N(2*Math.PI*d.x/oe.clientHeight),$(2*Math.PI*d.y/oe.clientHeight),h.copy(f)}function Le(L){if(M.length===1)_.set(L.pageX,L.pageY);else{const oe=_e(L),Q=.5*(L.pageX+oe.x),Ce=.5*(L.pageY+oe.y);_.set(Q,Ce)}p.subVectors(_,g).multiplyScalar(n.panSpeed),B(p.x,p.y),g.copy(_)}function xe(L){const oe=_e(L),Q=L.pageX-oe.x,Ce=L.pageY-oe.y,P=Math.sqrt(Q*Q+Ce*Ce);S.set(0,P),y.set(0,Math.pow(S.y/m.y,n.zoomSpeed)),Y(y.y),m.copy(S);const ie=(L.pageX+oe.x)*.5,ee=(L.pageY+oe.y)*.5;K(ie,ee)}function V(L){n.enableZoom&&xe(L),n.enablePan&&Le(L)}function Be(L){n.enableZoom&&xe(L),n.enableRotate&&ge(L)}function w(L){n.enabled!==!1&&(M.length===0&&(n.domElement.setPointerCapture(L.pointerId),n.domElement.addEventListener("pointermove",E),n.domElement.addEventListener("pointerup",z)),Ie(L),L.pointerType==="touch"?ke(L):re(L))}function E(L){n.enabled!==!1&&(L.pointerType==="touch"?te(L):ne(L))}function z(L){switch(We(L),M.length){case 0:n.domElement.releasePointerCapture(L.pointerId),n.domElement.removeEventListener("pointermove",E),n.domElement.removeEventListener("pointerup",z),n.dispatchEvent(Zp),s=i.NONE;break;case 1:const oe=M[0],Q=I[oe];ke({pointerId:oe,pageX:Q.x,pageY:Q.y});break}}function re(L){let oe;switch(L.button){case 0:oe=n.mouseButtons.LEFT;break;case 1:oe=n.mouseButtons.MIDDLE;break;case 2:oe=n.mouseButtons.RIGHT;break;default:oe=-1}switch(oe){case bs.DOLLY:if(n.enableZoom===!1)return;le(L),s=i.DOLLY;break;case bs.ROTATE:if(L.ctrlKey||L.metaKey||L.shiftKey){if(n.enablePan===!1)return;Oe(L),s=i.PAN}else{if(n.enableRotate===!1)return;Z(L),s=i.ROTATE}break;case bs.PAN:if(L.ctrlKey||L.metaKey||L.shiftKey){if(n.enableRotate===!1)return;Z(L),s=i.ROTATE}else{if(n.enablePan===!1)return;Oe(L),s=i.PAN}break;default:s=i.NONE}s!==i.NONE&&n.dispatchEvent(mu)}function ne(L){switch(s){case i.ROTATE:if(n.enableRotate===!1)return;X(L);break;case i.DOLLY:if(n.enableZoom===!1)return;J(L);break;case i.PAN:if(n.enablePan===!1)return;fe(L);break}}function se(L){n.enabled===!1||n.enableZoom===!1||s!==i.NONE||(L.preventDefault(),n.dispatchEvent(mu),ve(pe(L)),n.dispatchEvent(Zp))}function pe(L){const oe=L.deltaMode,Q={clientX:L.clientX,clientY:L.clientY,deltaY:L.deltaY};switch(oe){case 1:Q.deltaY*=16;break;case 2:Q.deltaY*=100;break}return L.ctrlKey&&!O&&(Q.deltaY*=10),Q}function he(L){L.key==="Control"&&(O=!0,n.domElement.getRootNode().addEventListener("keyup",ce,{passive:!0,capture:!0}))}function ce(L){L.key==="Control"&&(O=!1,n.domElement.getRootNode().removeEventListener("keyup",ce,{passive:!0,capture:!0}))}function Ae(L){n.enabled===!1||n.enablePan===!1||Ee(L)}function ke(L){switch(we(L),M.length){case 1:switch(n.touches.ONE){case As.ROTATE:if(n.enableRotate===!1)return;me(L),s=i.TOUCH_ROTATE;break;case As.PAN:if(n.enablePan===!1)return;Ke(L),s=i.TOUCH_PAN;break;default:s=i.NONE}break;case 2:switch(n.touches.TWO){case As.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;k(L),s=i.TOUCH_DOLLY_PAN;break;case As.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Ve(L),s=i.TOUCH_DOLLY_ROTATE;break;default:s=i.NONE}break;default:s=i.NONE}s!==i.NONE&&n.dispatchEvent(mu)}function te(L){switch(we(L),s){case i.TOUCH_ROTATE:if(n.enableRotate===!1)return;ge(L),n.update();break;case i.TOUCH_PAN:if(n.enablePan===!1)return;Le(L),n.update();break;case i.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;V(L),n.update();break;case i.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Be(L),n.update();break;default:s=i.NONE}}function st(L){n.enabled!==!1&&L.preventDefault()}function Ie(L){M.push(L.pointerId)}function We(L){delete I[L.pointerId];for(let oe=0;oe<M.length;oe++)if(M[oe]==L.pointerId){M.splice(oe,1);return}}function we(L){let oe=I[L.pointerId];oe===void 0&&(oe=new qe,I[L.pointerId]=oe),oe.set(L.pageX,L.pageY)}function _e(L){const oe=L.pointerId===M[0]?M[1]:M[0];return I[oe]}n.domElement.addEventListener("contextmenu",st),n.domElement.addEventListener("pointerdown",w),n.domElement.addEventListener("pointercancel",z),n.domElement.addEventListener("wheel",se,{passive:!1}),n.domElement.getRootNode().addEventListener("keydown",he,{passive:!0,capture:!0}),this.update()}}const of=new dA,Ma=new Mn(75,window.innerWidth/window.innerHeight,.1,1e3);function Nw(){const r=Ql.domElement,e=r.clientWidth,t=r.clientHeight;(r.width!==e||r.height!==t)&&(Ql.setSize(e,t,!1),Ma.aspect=e/t,Ma.updateProjectionMatrix())}const Ql=new I_({canvas:document.querySelector("#logo"),alpha:!0,antialiasing:!0}),Uw=new QA;Uw.load("./logo.glb",function(r){console.log(r);const e=r.scene;e.scale.set(3.5,3.5,3.5),of.add(e)});Ma.position.set(0,0,2.5);const Fw=new Ow(Ma,Ql.domElement),V_=new z_(16777215,3);V_.position.set(3,3,9);of.add(V_);function W_(){Fw.update(),Nw(),Ql.render(of,Ma),requestAnimationFrame(W_)}requestAnimationFrame(W_);
