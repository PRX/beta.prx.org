/* jshint ignore:start */
!function(n,e,r,z,i,o,x){function u(){var t;return (t=n.createElement("img"),x=t.style,x.position="fixed",x.top=0,x.left=0,x.width=z,x.height=z,n.body.appendChild(t)),t.onload=function(){n.body.removeChild(t)},t.onerror=t.onload,t}function c(){return i.user_id||""}function f(){return i.url||n.location.href}function d(){return i[r]||n[r]}function m(){return i.embedder||""}function p(n,e,r,t){r={};for(t in n)r[t]=n[t];for(t in e)r[t]=e[t];return r}e.TheCount=i={logAction:function(n,e){e=[],n=p({referrer:d(),user_id:c(),embedder:m(),url:f()},n);for(o in n)e.push(o+"="+escape(n[o]));e.push("timestamp="+(new Date).getTime()),u().src=FEAT.COUNT_HOST+"/action.gif?"+e.join("&"),u().src=FEAT.COUNT_HOST_NEW+"/action.gif?"+e.join("&")}}}(document,window,"referrer","1px");
/* jshint ignore:end */
