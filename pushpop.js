'use strict';

// Load custom build of Modernizr if an appropriate build has not been loaded.
if (!window['Modernizr'] || Modernizr.csstransforms3d === undefined) {

  /* Modernizr 2.5.2 (Custom Build) | MIT & BSD
   * Build: http://www.modernizr.com/download/#-csstransforms3d-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes-load
   */
  ;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a)if(j[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.substr(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.5.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);return f=["&#173;","<style>",a,"</style>"].join(""),k.id=h,m.innerHTML+=f,m.appendChild(k),l||g.appendChild(m),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e});var G=function(a,c){var d=a.join(""),f=c.length;w(d,function(a,c){var d=b.styleSheets[b.styleSheets.length-1],g=d?d.cssRules&&d.cssRules[0]?d.cssRules[0].cssText:d.cssText||"":"",h=a.childNodes,i={};while(f--)i[h[f].id]=h[f];e.csstransforms3d=(i.csstransforms3d&&i.csstransforms3d.offsetLeft)===9&&i.csstransforms3d.offsetHeight===3},f,c)}([,["@media (",m.join("transform-3d),("),h,")","{#csstransforms3d{left:9px;position:absolute;height:3px;}}"].join("")],[,"csstransforms3d"]);q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&(a=e.csstransforms3d),a};for(var H in q)y(q,H)&&(v=H.toLowerCase(),e[v]=q[H](),t.push((e[v]?"":"no-")+v));return z(""),i=k=null,e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return o.call(a)=="[object Function]"}function e(a){return typeof a=="string"}function f(){}function g(a){return!a||a=="loaded"||a=="complete"||a=="uninitialized"}function h(){var a=p.shift();q=1,a?a.t?m(function(){(a.t=="c"?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){a!="img"&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l={},o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};y[c]===1&&(r=1,y[c]=[],l=b.createElement(a)),a=="object"?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),a!="img"&&(r||y[c]===2?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i(b=="c"?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),p.length==1&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=!!b.attachEvent,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return o.call(a)=="[object Array]"},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,i){var j=b(a),l=j.autoCallback;j.url.split(".").pop().split("?").shift(),j.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]||h),j.instead?j.instead(a,e,f,g,i):(y[j.url]?j.noexec=!0:y[j.url]=1,f.load(j.url,j.forceCSS||!j.forceJS&&"css"==j.url.split(".").pop().split("?").shift()?"c":c,j.noexec,j.attrs,j.timeout),(d(e)||d(l))&&f.load(function(){k(),e&&e(j.origUrl,i,g),l&&l(j.origUrl,i,g),y[j.url]=2})))}function i(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var j,l,m=this.yepnope.loader;if(e(a))g(a,0,m,0);else if(w(a))for(j=0;j<a.length;j++)l=a[j],e(l)?g(l,0,m,0):w(l)?B(l):Object(l)===l&&i(l,m);else Object(a)===a&&i(a,m)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,b.readyState==null&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
}

var Pushpop = {
  defaultTransition: 'slide-horizontal'
};

Pushpop.View = function(element) {
  var $element = this.$element = $(element);
  
  var view = $element.data('view');
  if (view) return view;
  
  this.element = $element[0];
  
  $element.data('view', this);
};

Pushpop.View.prototype = {
  element: null,
  $element: null,
  transition: null,
  setTransition: function(value) {
    this.transition = value;
    this.$element.addClass(value);
  },
  getViewStack: function() {
    return this.$element.parents('.pp-view-stack:first').data('viewStack');
  },
  forceReflow: function() {
    this.element.offsetWidth;
  }
};

Pushpop.ViewStack = function(element) {
  var $element = this.$element = $(element);
  this.element = $element[0];
  
  var views = this.views = [];
  
  var $rootViewElement = $element.children('.pp-view.root,.pp-view:first').first().addClass('active');
  var rootView = this.rootView = $rootViewElement.data('view') ||
    new Pushpop.View($rootViewElement.addClass('root'));
  
  views.push(rootView);
  
  $element.data('viewStack', this);
};

Pushpop.ViewStack.prototype = {
  element: null,
  $element: null,
  views: null,
  rootView: null,
  isTransitioning: false,
  handleEvent: function(evt) {
    switch (evt.type) {
      case 'webkitTransitionEnd':
      case 'transitionend':
      case 'oTransitionEnd':
      case 'transitionEnd':
        var eventData = evt.data;
        if (!eventData) return;
        
        var newActiveView = eventData.newActiveView;
        if (!newActiveView || evt.target !== newActiveView.element) return;
        
        var viewStack = newActiveView.getViewStack();
        var oldActiveView = viewStack.$element.children('.pp-view.active').data('view');
        if (!oldActiveView) return;
        
        var $newActiveViewElement = newActiveView.$element;
        var $oldActiveViewElement = oldActiveView.$element;
        
        $newActiveViewElement.unbind(evt);
        $newActiveViewElement.addClass('active');
        $newActiveViewElement.removeClass('transition push pop ' + newActiveView.transition);
        $oldActiveViewElement.removeClass('active transition push pop ' + newActiveView.transition);
        
        viewStack.isTransitioning = false;
        break;
      default:
        break;
    }
  },
  push: function(view, transition) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    var oldActiveView = this.getActiveView();
    var newActiveView = view;
    
    this.views.push(newActiveView);
    
    var $oldActiveViewElement = oldActiveView.$element;
    var $newActiveViewElement = newActiveView.$element;

    $newActiveViewElement.bind('webkitTransitionEnd transitionend oTransitionEnd transitionEnd', {
      newActiveView: newActiveView
    }, this.handleEvent);
    
    transition = newActiveView.transition = transition || newActiveView.transition || Pushpop.defaultTransition;
    
    $oldActiveViewElement.addClass('push ' + transition);
    $newActiveViewElement.addClass('push ' + transition);
    
    oldActiveView.forceReflow();
    newActiveView.forceReflow();
    
    $oldActiveViewElement.addClass('transition');
    $newActiveViewElement.addClass('transition');
  },
  pop: function(viewOrTransition, transition) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    var views = this.views;
    if (views.length <= 1) return;
    
    var oldActiveView = this.getActiveView();
    var newActiveView;
    
    if (viewOrTransition && typeof viewOrTransition !== 'string') {
      newActiveView = viewOrTransition;
      
      if (this.containsView(newActiveView)) {
        while (views.length > 1 && this.getActiveView() !== newActiveView) {
          views.pop();
        }
      }
    } else {
      if (viewOrTransition) transition = viewOrTransition;
      
      views.pop();
      newActiveView = this.getActiveView();
    }
    
    var $oldActiveViewElement = oldActiveView.$element;
    var $newActiveViewElement = newActiveView.$element;

    $newActiveViewElement.bind('webkitTransitionEnd transitionend oTransitionEnd transitionEnd', {
      newActiveView: newActiveView
    }, this.handleEvent);
    
    transition = newActiveView.transition = transition || oldActiveView.transition || Pushpop.defaultTransition;
    
    $oldActiveViewElement.addClass('pop ' + transition);
    $newActiveViewElement.addClass('pop ' + transition);
    
    oldActiveView.forceReflow();
    newActiveView.forceReflow();
    
    $oldActiveViewElement.addClass('transition');
    $newActiveViewElement.addClass('transition');
  },
  getActiveView: function() {
    var views = this.views;
    var viewCount = views.length;
    
    return (viewCount === 0) ? null : views[viewCount - 1];
  },
  containsView: function(view) {
    var views = this.views;
    var viewCount = views.length;
    
    for (var i = viewCount - 1; i >= 0; i--) if (views[i] === view) return true;
    return false;
  }
};

$(function() {
  var $views = $('.pp-view');
  
  $views.each(function(index, element) {
    new Pushpop.View(element);
  });
  
  var $viewStacks = $('.pp-view-stack');
  
  $viewStacks.each(function(index, element) {
    new Pushpop.ViewStack(element);
  });
  
  $('a.push').live('click', function(evt) {
    var $this = $(this);
    var href = $this.attr('href');
    var $viewElement = $(href);
    
    var view = $viewElement.data('view') || new Pushpop.View($viewElement);
    var viewStack = view.getViewStack();
    if (viewStack) viewStack.push(view, $this.data('transition'));
    
    evt.preventDefault();
  });
  
  $('a.pop').live('click', function(evt) {
    var $this = $(this);
    var href = $this.attr('href');
    var viewStack;
    
    if (href === '#') {
      viewStack = $this.parents('.pp-view-stack:first').data('viewStack');
      if (viewStack) viewStack.pop($this.data('transition'));
    } else {
      var $viewElement = $(href);
    
      var view = $viewElement.data('view') || new Pushpop.View($viewElement);
      viewStack = view.getViewStack();
      if (viewStack) viewStack.pop(view, $this.data('transition'));
    }
    
    evt.preventDefault();
  });
});
