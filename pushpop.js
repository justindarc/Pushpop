;'use strict';

// Load custom build of Modernizr if an appropriate build has not been loaded.
if (!window['Modernizr'] || Modernizr.touch === undefined || Modernizr.csstransitions === undefined || Modernizr.csstransforms === undefined || Modernizr.csstransforms3d === undefined) {

  /* Modernizr 2.5.2 (Custom Build) | MIT & BSD
   * Build: http://www.modernizr.com/download/#-csstransforms-csstransforms3d-csstransitions-touch-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes
   */
  ;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a)if(j[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.substr(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.5.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);return f=["&#173;","<style>",a,"</style>"].join(""),k.id=h,m.innerHTML+=f,m.appendChild(k),l||g.appendChild(m),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e});var G=function(c,d){var f=c.join(""),g=d.length;w(f,function(c,d){var f=b.styleSheets[b.styleSheets.length-1],h=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"",i=c.childNodes,j={};while(g--)j[i[g].id]=i[g];e.touch="ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch||(j.touch&&j.touch.offsetTop)===9,e.csstransforms3d=(j.csstransforms3d&&j.csstransforms3d.offsetLeft)===9&&j.csstransforms3d.offsetHeight===3},g,d)}([,["@media (",m.join("touch-enabled),("),h,")","{#touch{top:9px;position:absolute}}"].join(""),["@media (",m.join("transform-3d),("),h,")","{#csstransforms3d{left:9px;position:absolute;height:3px;}}"].join("")],[,"touch","csstransforms3d"]);q.touch=function(){return e.touch},q.csstransforms=function(){return!!F("transform")},q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&(a=e.csstransforms3d),a},q.csstransitions=function(){return F("transition")};for(var H in q)y(q,H)&&(v=H.toLowerCase(),e[v]=q[H](),t.push((e[v]?"":"no-")+v));return z(""),i=k=null,e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document);
}

/**
  The base Pushpop object.
*/
var Pushpop = window['Pushpop'] || {};

/**
  Event types for Pushpop.
*/
Pushpop.EventType = {
  WillPushView: 'Pushpop:WillPushView',
  DidPushView: 'Pushpop:DidPushView',
  WillPopView: 'Pushpop:WillPopView',
  DidPopView: 'Pushpop:DidPopView',
  WillDismissView: 'Pushpop:WillDismissView',
  DidDismissView: 'Pushpop:DidDismissView',
  WillPresentView: 'Pushpop:WillPresentView',
  DidPresentView: 'Pushpop:DidPresentView'
};

/**
  Default transition to use for pushing and popping views when no transition is specified.
*/
Pushpop.defaultTransition = 'slide-horizontal';

/**

*/
Pushpop.Util = {
  _dashedToCamelCaseRegExp: /(\-[a-z])/g,
  _dashedToCamelCaseReplacer: function($1) { return $1.toUpperCase().replace('-', ''); },
  convertDashedStringToCamelCase: function(dashedString) {
    return ('' + dashedString).replace(this._dashedToCamelCaseRegExp, this._dashedToCamelCaseReplacer);
  },
  
  _camelCaseToDashedRegExp: /([A-Z])/g,
  _camelCaseToDashedReplacer: function($1) { return '-' + $1.toLowerCase(); },
  convertCamelCaseStringToDashed: function(camelCaseString) {
    var dashedString = ('' + camelCaseString).replace(this._camelCaseToDashedRegExp, this._camelCaseToDashedReplacer);
    if (dashedString.length > 0 && dashedString.charAt(0) === '-') dashedString = dashedString.slice(1);
    return dashedString;
  }
};

/**
  Traverses the parents of the specified element and returns the closest Pushpop.ViewStack.
  @param {HTMLElement} element The element for which to find the closest parent view stack.
  @type Pushpop.ViewStack
*/
Pushpop.getViewStackForElement = function(element) {
  var $parents = $(element).parents();
  var viewStack;
  for (var i = 0, length = $parents.length; i < length; i++) if (!!(viewStack = $parents[i].viewStack) && viewStack instanceof Pushpop.ViewStack) return viewStack;
  return null;
};

/**
  Creates a new ViewStack.
  @param {HTMLDivElement} element The DIV element to initialize as a new ViewStack.
  @constructor
*/
Pushpop.ViewStack = function ViewStack(element) {
  if (!element) return;
  
  var $element = this.$element = $(element);
  element = this.element = $element[0];
  
  var viewStack = element.viewStack;
  if (viewStack) return viewStack;
  
  var self = element.viewStack = this;
  
  var views = this.views = [];
  
  var $rootViewElement = $element.children('.pp-view, .pp-split-view').first().addClass('pp-active');
  var rootViewElement = $rootViewElement[0];
  
  if (!rootViewElement) return;
  
  var rootView = this.rootView = rootViewElement.view || new Pushpop.View($rootViewElement.addClass('root'));
  views.push(rootView);
};

Pushpop.ViewStack.prototype = {
  constructor: Pushpop.ViewStack,
  
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
        var target = evt.target;
        if (!target.view || $(target).hasClass('pp-active')) return;
        
        var newActiveView = target;
        newActiveView = (newActiveView) ? newActiveView.view : null;
        if (!newActiveView) return;
        
        var viewStack = newActiveView.getViewStack();
        if (!viewStack || !viewStack.isTransitioning) return;
        
        var oldActiveView = viewStack.$element.children('.pp-view.pp-active')[0];
        oldActiveView = (oldActiveView) ? oldActiveView.view : null;
        if (!oldActiveView) return;
        
        viewStack.isTransitioning = false;
        $(target).unbind(evt);
        
        var $newActiveViewElement = newActiveView.$element;
        var $oldActiveViewElement = oldActiveView.$element;
        var action = ($newActiveViewElement.hasClass('push') ? 'push' : 'pop');

        $newActiveViewElement.addClass('pp-active');
        $newActiveViewElement.removeClass('transition push pop ' + newActiveView.transition);
        $oldActiveViewElement.removeClass('pp-active transition push pop ' + newActiveView.transition);
        
        if (action === 'push') {
          
          // Trigger an event indicating that the new view was pushed.
          $newActiveViewElement.trigger($.Event(Pushpop.EventType.DidPushView, {
            view: newActiveView
          }));
        } else {
          
          // Trigger an event indicating that the previous view was popped.
          $oldActiveViewElement.trigger($.Event(Pushpop.EventType.DidPopView, {
            view: oldActiveView
          }));
        }
        
        // Trigger an event indicating that the previous view was dismissed.
        $oldActiveViewElement.trigger($.Event(Pushpop.EventType.DidDismissView, {
          view: oldActiveView,
          action: action
        }));
        
        // Trigger an event for each active child view of the previous view indicating
        // that their parent was dismissed.
        $oldActiveViewElement.find('.pp-view-stack').each(function(index, element) {
          var viewStack = element.viewStack;
          var activeView = viewStack.getActiveView();
          if (!activeView) return;
        
          activeView.$element.trigger($.Event(Pushpop.EventType.DidDismissView, {
            view: activeView,
            action: 'parent-' + action
          }));
        });
        
        // Trigger an event indicating that the new view was presented.
        $newActiveViewElement.trigger($.Event(Pushpop.EventType.DidPresentView, {
          view: newActiveView,
          action: action
        }));
        
        // Trigger an event for each active child view of the new view indicating
        // that their parent was presented.
        $newActiveViewElement.find('.pp-view-stack').each(function(index, element) {
          var viewStack = element.viewStack;
          var activeView = viewStack.getActiveView();
          if (!activeView) return;
        
          activeView.$element.trigger($.Event(Pushpop.EventType.DidPresentView, {
            view: activeView,
            action: 'parent-' + action
          }));
        });
        
        // Hack to reset the scroll view position for views using ScrollKit on desktop browsers.
        var newActiveScrollView, newActiveScrollPosition;
        if ($newActiveViewElement.hasClass('sk-no-touch') && (newActiveScrollView = newActiveView.getScrollView())) {
          newActiveScrollPosition = newActiveScrollView.getScrollPosition();
          newActiveScrollView.setScrollPosition(newActiveScrollPosition.x - 1, newActiveScrollPosition.y - 1);
          newActiveScrollView.setScrollPosition(newActiveScrollPosition.x + 1, newActiveScrollPosition.y + 1);
        }
        
        // Remove the previous active view from the DOM if it is marked for removal when popped.
        if (action === 'pop' && oldActiveView.getShouldRemoveWhenPopped()) $oldActiveViewElement.remove();
        
        // Call the callback to execute when a push/pop transition completes if one exists.
				if (!viewStack.callback) return;
				viewStack.callback();
				viewStack.callback = null;
        break;
      default:
        break;
    }
  },
  
  /**
    Pushes the specified view to the view stack using the optionally specified transition. If a
    transition is not specified, the default will be used. A callback may optionally be provided
    to be called after the transition completes.
    @param {Pushpop.View} view The view to be pushed to the view stack.
    @param {String|Function} [transitionOrCallback] Either the name of the transition to use when
    pushing the view or a callback function to be executed upon completion of the default transition.
    If this parameter is omitted, the default transition is used.
    @param {Function} [callback] A callback function to be executed upon completion of the specified
    transition.
  */
  push: function(view, transitionOrCallback, callback) {
    var oldActiveView = this.getActiveView();
    var newActiveView = view;
    
    if (newActiveView === oldActiveView) return;
    
    if (this.isTransitioning) {
      // Manually kick off transitionEnd event.  Chances are it should have fired, but didn't.
      if (!oldActiveView) return;
      
      oldActiveView.$element.trigger('transitionend');
    }
    
    this.isTransitioning = true;

    // Hide the onscreen keyboard if it is currently visible.
    $(document.activeElement).blur();
    
    var $element = this.$element;
    
    var $oldActiveViewElement = oldActiveView.$element;
    var $newActiveViewElement = newActiveView.$element;
    
    this.views.push(newActiveView);

    $newActiveViewElement.bind('webkitTransitionEnd transitionend oTransitionEnd transitionEnd', this.handleEvent);
    
		var transition;
		if (transitionOrCallback) {
			if (typeof transitionOrCallback === 'function') {
				this.callback = transitionOrCallback;
			} else {
				transition = transitionOrCallback;
				this.callback = callback;
			}
		}

    transition = newActiveView.transition = transition || newActiveView.transition || Pushpop.defaultTransition;
    
    $oldActiveViewElement.addClass('push ' + transition);
    $newActiveViewElement.addClass('push ' + transition);
    
    oldActiveView.forceReflow();
    newActiveView.forceReflow();
    
    // Trigger an event indicating that the new view is about to be pushed.
    $newActiveViewElement.trigger($.Event(Pushpop.EventType.WillPushView, {
      view: newActiveView
    }));
    
    // Trigger an event indicating that the previous view is about to be dismissed.
    $oldActiveViewElement.trigger($.Event(Pushpop.EventType.WillDismissView, {
      view: oldActiveView,
      action: 'push'
    }));
    
    // Trigger an event for each active child view of the previous view indicating that
    // their parent is about to be dismissed.
    $oldActiveViewElement.find('.pp-view-stack').each(function(index, element) {
      var viewStack = element.viewStack;
      var activeView = viewStack.getActiveView();
      if (!activeView) return;
      
      activeView.$element.trigger($.Event(Pushpop.EventType.WillDismissView, {
        view: activeView,
        action: 'parent-push'
      }));
    });
    
    // Trigger an event indicating that the new view is about to be presented.
    $newActiveViewElement.trigger($.Event(Pushpop.EventType.WillPresentView, {
      view: newActiveView,
      action: 'push'
    }));
    
    // Trigger an event for each active child view of the new view indicating that
    // their parent is about to be presented.
    $newActiveViewElement.find('.pp-view-stack').each(function(index, element) {
      var viewStack = element.viewStack;
      var activeView = viewStack.getActiveView();
      if (!activeView) return;
      
      activeView.$element.trigger($.Event(Pushpop.EventType.WillPresentView, {
        view: activeView,
        action: 'parent-push'
      }));
    });
    
    $oldActiveViewElement.addClass('transition');
    $newActiveViewElement.addClass('transition');
  },
  
  /**
    Pops the current or specified view off the view stack using the optionally specified transition.
    If a view is not specified, the current view will be popped (unless it is the root view). If a
    transition is not specified, the default will be used. A callback may optionally be provided to
    be called after the transition completes.
    @param {Pushpop.View|String} viewOrTransition Either the view to be popped to on the view stack
    or the name of the transition to use when popping the view. If this parameter is omitted or if
    it specifies a transition name, the current view will be assumed to be popped.
    @param {String|Function} [transitionOrCallback] Either the name of the transition to use when
    popping the view or a callback function to be executed upon completion of the default transition.
    If this parameter is omitted, the default transition is used.
    @param {Function} [callback] A callback function to be executed upon completion of the specified
    transition.
  */
  pop: function(viewOrTransition, transitionOrCallback, callback) {
    var oldActiveView = this.getActiveView();
    var newActiveView, transition;
    
    if (this.isTransitioning) {
      // Manually kick off transitionEnd event.  Chances are it should have fired, but didn't.
      if (!oldActiveView) return;
      
      oldActiveView.$element.trigger('transitionend');
    }
    
    this.isTransitioning = true;

    // Hide the onscreen keyboard if it is currently visible.
    $(document.activeElement).blur();
    
    var views = this.views;
    if (views.length <= 1) return;
    
    if (viewOrTransition && typeof viewOrTransition !== 'string') {
      newActiveView = viewOrTransition;
      
      if (newActiveView === oldActiveView) return;
      
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

		if (transitionOrCallback) {
			if (typeof transitionOrCallback === 'function') {
				this.callback = transitionOrCallback;
			} else {
				transition = transitionOrCallback;
				this.callback = callback;
			}
		}
    
    var $element = this.$element;
    
    var $oldActiveViewElement = oldActiveView.$element;
    var $newActiveViewElement = newActiveView.$element;
    
    $newActiveViewElement.bind('webkitTransitionEnd transitionend oTransitionEnd transitionEnd', this.handleEvent);
    
    transition = newActiveView.transition = transition || oldActiveView.transition || Pushpop.defaultTransition;
    
    $oldActiveViewElement.addClass('pop ' + transition);
    $newActiveViewElement.addClass('pop ' + transition);
    
    oldActiveView.forceReflow();
    newActiveView.forceReflow();
    
    // Trigger an event indicating that the previous view is about to be popped.
    $oldActiveViewElement.trigger($.Event(Pushpop.EventType.WillPopView, {
      view: oldActiveView
    }));
    
    // Trigger an event indicating that the previous view is about to be dismissed.
    $oldActiveViewElement.trigger($.Event(Pushpop.EventType.WillDismissView, {
      view: oldActiveView,
      action: 'pop'
    }));
    
    // Trigger an event for each active child view of the previous view indicating that
    // their parent is about to be dismissed.
    $oldActiveViewElement.find('.pp-view-stack').each(function(index, element) {
      var viewStack = element.viewStack;
      var activeView = viewStack.getActiveView();
      if (!activeView) return;
      
      activeView.$element.trigger($.Event(Pushpop.EventType.WillDismissView, {
        view: activeView,
        action: 'parent-pop'
      }));
    });
    
    // Trigger an event indicating that the new view is about to be presented.
    $newActiveViewElement.trigger($.Event(Pushpop.EventType.WillPresentView, {
      view: newActiveView,
      action: 'pop'
    }));
    
    // Trigger an event for each active child view of the new view indicating that
    // their parent is about to be presented.
    $newActiveViewElement.find('.pp-view-stack').each(function(index, element) {
      var viewStack = element.viewStack;
      var activeView = viewStack.getActiveView();
      if (!activeView) return;
      
      activeView.$element.trigger($.Event(Pushpop.EventType.WillPresentView, {
        view: activeView,
        action: 'parent-pop'
      }));
    });
    
    $oldActiveViewElement.addClass('transition');
    $newActiveViewElement.addClass('transition');
  },
  
  /**
    Returns the current active (topmost) Pushpop.View on this view stack.
    @type Pushpop.View
  */
  getActiveView: function() {
    var views = this.views;
    var viewCount = views.length;
    
    return (viewCount === 0) ? null : views[viewCount - 1];
  },
  
  /**
    Returns a flag indicating if the specified Pushpop.View is contained wihin this
    view stack.
    @param {Pushpop.View} view The view to search for in this view stack.
    @type Boolean
  */
  containsView: function(view) {
    var views = this.views;
    var viewCount = views.length;
    
    for (var i = viewCount - 1; i >= 0; i--) if (views[i] === view) return true;
    return false;
  },
  
  /**
    Creates a new view and pushes it to the view stack using the optionally specified transition.
    Before pushing the view, a required callback is called that passes in the newly-created view to
    give an opportunity to set up the view's content. If a transition is not specified, the default
    will be used. A callback may optionally be provided to be called after the transition completes.
    @description NOTE: By default, the newly-created view is marked for removal from the DOM when it
    is popped.
    @param {Function} beforePushCallback A callback function to be executed before the newly-created
    view is pushed. The function is called with a single parameter passing the view to be pushed.
    @param {String|Function} [transitionOrCallback] Either the name of the transition to use when
    pushing the view or a callback function to be executed upon completion of the default transition.
    If this parameter is omitted, the default transition is used.
    @param {Function} [callback] A callback function to be executed upon completion of the specified
    transition.
  */
  pushNewView: function(beforePushCallback, transitionOrCallback, callback) {
    var $viewElement = $('<div class="pp-view"/>').appendTo(this.$element);
    var view = new Pushpop.View($viewElement);
    
    view.setShouldRemoveWhenPopped(true);
    
    if (beforePushCallback && typeof beforePushCallback === 'function') beforePushCallback(view);
    
    this.push(view, transitionOrCallback, callback);
  },
  
  /**
    Creates a new view with a new table view and pushes it to the view stack using the optionally
    specified transition. Before pushing the view, a required callback is called that passes in the
    newly-created table view to give an opportunity to set up the table view's data source and other
    properties. If a transition is not specified, the default will be used. A callback may optionally
    be provided to be called after the transition completes.
    @description NOTE: By default, the newly-created view containing the newly-created table view is
    marked for removal from the DOM when it is popped.
    @param {Function} beforePushCallback A callback function to be executed before the newly-created
    view is pushed. The function is called with a single parameter passing the newly-created table
    view contained in the view to be pushed.
    @param {String|Function} [transitionOrCallback] Either the name of the transition to use when
    pushing the view or a callback function to be executed upon completion of the default transition.
    If this parameter is omitted, the default transition is used.
    @param {Function} [callback] A callback function to be executed upon completion of the specified
    transition.
  */
  pushNewTableView: function(beforePushCallback, transitionOrCallback, callback) {
    var $viewElement = $('<div class="pp-view"/>').appendTo(this.$element);
    var $scrollViewElement = $('<div class="sk-scroll-view" data-always-bounce-vertical="true"/>').appendTo($viewElement);
    var $tableViewElement = $('<ul class="pp-table-view"/>').appendTo($scrollViewElement);
    var view = new Pushpop.View($viewElement);
    var scrollView = new ScrollKit.ScrollView($scrollViewElement);
    var tableView = new Pushpop.TableView($tableViewElement);
    
    view.setShouldRemoveWhenPopped(true);
    
    if (beforePushCallback && typeof beforePushCallback === 'function') beforePushCallback(tableView);
    
    this.push(view, transitionOrCallback, callback);
  },
  
	/**
    Convenience accessor for jQuery's .bind() method.
	*/
	$bind: function() { this.$element.bind.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .unbind() method.
	*/
	$unbind: function() { this.$element.unbind.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .delegate() method.
	*/
	$delegate: function() { this.$element.delegate.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .undelegate() method.
	*/
	$undelegate: function() { this.$element.undelegate.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .trigger() method.
	*/
	$trigger: function() { this.$element.trigger.apply(this.$element, arguments); }
};

/**
  Creates a new View.
  @param {HTMLDivElement} element The DIV element to initialize as a new View.
  @constructor
*/
Pushpop.View = function View(element) {
  if (!element) return;
  
  var $element = this.$element = $(element);
  element = this.element = $element[0];
  
  var view = element.view;
  if (view) return view;
  
  var self = element.view = this;
  
  this.title = $element.attr('data-view-title');
  
  // Set up this view's navigation bar button items.
  var barButtonItems = this._barButtonItems = [];
  $element.find('.pp-navigation-bar-button-items > .pp-button').each(function(index, element) {
    self.addBarButtonItem(element.button || new Pushpop.Button(element));
  });
  
  $element.find('.pp-navigation-bar-button-items').remove();
  
  // Determine if the back bar button item should be hidden when this view is active.
  var hideBackBarButtonItem = $element.attr('data-hide-back-bar-button-item') || 'false';
  hideBackBarButtonItem = hideBackBarButtonItem !== 'false';
  this.setHideBackBarButtonItem(hideBackBarButtonItem);
  
  //////
  // OLD
  var $navbarButtonsContainer = $element.find('.pp-navigationbar-buttons');
  var $navbarButtons = this.$navbarButtons = $navbarButtonsContainer.find('.pp-barbutton');
  
  // Hide the back button if data-hide-back-button="true" or if there is a left navigation bar
  var dataHideBackButton = $navbarButtonsContainer.attr('data-hide-back-button');
  this.hideNavBackButton = ((dataHideBackButton && dataHideBackButton !== 'false') || $navbarButtons.filter('.pp-barbutton-align-left').length > 0);
  // OLD
  //////
};

Pushpop.View.prototype = {
  constructor: Pushpop.View,
  
  element: null,
  $element: null,
  
  $navbarButtons: null, // OLD
  hideNavBackButton: false, // OLD
  
  transition: null,
  
  /**
    Sets the transition that should be used when pushing or popping to this view.
    @param {String} value The name of the transition to be used when pushing or popping
    to this view.
  */
  setTransition: function(value) {
    this.transition = value;
    this.$element.addClass(value);
  },
  
  title: null,
  
  getTitle: function() { return this.title; },
  
  /**
    Sets the title for this view.
    @description The title is stored in the |data-view-title| attribute of this view's
    element. NOTE: When a Pushpop.NavigationBar is used in conjunction with this view's
    view stack, this view's title will appear in the navigation bar when it is the active
    view.
    @param {String} value The title for this view.
  */
  setTitle: function(value) {
    this.title = value;
    this.$element.attr('data-view-title', value);
    
    var navigationBar = this.getNavigationBar();
    if (navigationBar) navigationBar.setTitle(value);
  },
  
  /**
  
  */
  getActive: function() { return this.$element.hasClass('pp-active'); },
  
  _barButtonItems: null,
  
  /**
  
  */
  getBarButtonItems: function() { return this._barButtonItems; },
  
  /**
  
  */
  setBarButtonItems: function(barButtonItems, animated) {
    this.removeAllBarButtonItems();
    for (var i = 0, length = barButtonItems.length; i < length; i++) this.addBarButtonItem(barButtonItems[i], animated);
  },
  
  /**
  
  */
  addBarButtonItem: function(barButtonItem, animated) {
    if (this.getActive()) {
      var navigationBar = this.getNavigationBar();
      if (navigationBar) navigationBar.addBarButtonItem(barButtonItem, animated);
    } else {
      barButtonItem.remove();
    }
    
    this._barButtonItems.push(barButtonItem);
  },
  
  /**
  
  */
  removeBarButtonItem: function(barButtonItem, animated) {
    var barButtonItems = this._barButtonItems;
    for (var i = 0, length = barButtonItems.length; i < length; i++) {
      if (barButtonItems[i] === barButtonItem) {
        if (this.getActive()) {
          var navigationBar = this.getNavigationBar();
          if (navigationBar) navigationBar.removeBarButtonItem(barButtonItem, animated);
        }
        
        barButtonItems.splice(i, 1);
        break;
      }
    }
  },
  
  /**
  
  */
  removeAllBarButtonItems: function(animated) {
    var barButtonItems = this._barButtonItems;
    if (this.getActive()) {
      var navigationBar = this.getNavigationBar();
      if (navigationBar) for (var i = 0, length = barButtonItems.length; i < length; i++) navigationBar.removeBarButtonItem(barButtonItems[i], animated);
    }
    
    barButtonItems.length = 0;
  },
  
  _hideBackBarButtonItem: false,
  
  /**
  
  */
  getHideBackBarButtonItem: function() { return this._hideBackBarButtonItem; },
  
  /**
  
  */
  setHideBackBarButtonItem: function(hideBackBarButtonItem) {
    this._hideBackBarButtonItem = hideBackBarButtonItem;
  },
  
  _shouldRemoveWhenPopped: false,
  
  /**
  
  */
  getShouldRemoveWhenPopped: function() { return this._shouldRemoveWhenPopped; },
  
  /**
  
  */
  setShouldRemoveWhenPopped: function(shouldRemoveWhenPopped) { this._shouldRemoveWhenPopped = shouldRemoveWhenPopped; },
  
  /**
    Traverses the parents of this view's element and returns the closest Pushpop.ViewStack.
    @type Pushpop.ViewStack
  */
  getViewStack: function() { return Pushpop.getViewStackForElement(this.$element); },
  
  /**
  
  */
  getNavigationBar: function() {
    var viewStack = this.getViewStack();
    if (!viewStack) return null;
    
    var navigationBar = viewStack.$element.children('.pp-navigation-bar')[0];
    navigationBar = (navigationBar) ? navigationBar.navigationBar : null;
    
    return navigationBar;
  },
  
  /**
  
  */
  getScrollView: function() { return this.element.scrollView || null; },
  
  /**
    Forces a reflow in the browser for this view.
  */
  forceReflow: function() { var doNothing = this.element.offsetWidth; },
  
	setBackButtonVisible: function(visible) {
    if (this.$navbarButtons.filter('.pp-barbutton-align-left').length === 0) this.hideNavBackButton = !visible;
	},
	
	/**
    Convenience accessor for jQuery's .bind() method.
	*/
	$bind: function() { this.$element.bind.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .unbind() method.
	*/
	$unbind: function() { this.$element.unbind.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .delegate() method.
	*/
	$delegate: function() { this.$element.delegate.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .undelegate() method.
	*/
	$undelegate: function() { this.$element.undelegate.apply(this.$element, arguments); },
	
	/**
    Convenience accessor for jQuery's .trigger() method.
	*/
	$trigger: function() { this.$element.trigger.apply(this.$element, arguments); }
};

/**
  Creates a new NavigationBar.
  @param {HTMLDivElement} element The DIV element to initialize as a new NavigationBar.
  @constructor
*/
Pushpop.NavigationBar = function NavigationBar(element) {
  if (!element) return;
  
  var $element = this.$element = $(element);
  element = this.element = $element[0];
  
  var navigationBar = element.navigationBar;
  if (navigationBar) return navigationBar;
  
  var self = element.navigationBar = this;
  
  // Set up this navigation bar's style type.
  var barStyleTypes = Pushpop.NavigationBar.BarStyleType;
  var barStyleType;
  for (var key in barStyleTypes) {
    if ($element.hasClass(barStyleTypes[key])) {
      barStyleType = barStyleTypes[key];
      break;
    }
  }
  
  this.setBarStyleType(barStyleType || Pushpop.NavigationBar.Default);
  
  // Set up this navigation bar's button items.
  this._barButtonItems = [];
  
  // Set up the title container.
  this.$titleElement = $('<h1 class="pp-navigation-bar-title"/>').appendTo($element);
  
  // Set up the bar button item containers. NOTE: Two containers are created and are
  // alternated each time setBarButtonItems() is called to provide a smooth transition.
  this.$barButtonItemContainerElement = this.$barButtonItemContainerElementA = $('<div class="pp-navigation-bar-button-item-container"/>').appendTo($element);
  this.$barButtonItemContainerElementB = $('<div class="pp-navigation-bar-button-item-container"/>').appendTo($element);
  
  // Set up the back button.
  var backBarButtonItem = new Pushpop.Button('Back', function(button) {
    var viewStack = button.getViewStack();
    if (viewStack) viewStack.pop();
  });
  
  this.setBackBarButtonItem(backBarButtonItem);
  
  // Prevent dragging of the navigation bar.
  $element.bind('touchmove', function(evt) { evt.preventDefault(); });
  
  // Handle the "tap-to-top" action (automatically scroll to the top of the
  // scroll view when the top of the navigation bar is tapped).
  var tapToTop = $element.attr('data-tap-to-top') || 'false';
  tapToTop = this. _tapToTop = tapToTop !== 'false';
  
  $('<div class="pp-navigation-bar-tap-to-top-target"/>').appendTo($element).bind('click', function(evt) {
    if (!self.getTapToTop()) return;
    
    var activeView = self.getActiveView();
    if (!activeView) return;
    
    var scrollView = activeView.getScrollView();
    if (scrollView && !scrollView.isScrolling) scrollView.scrollToTop();
  });
  
  // Handle view changes for the navigation bar's view stack.
  var viewStack = this.getViewStack();
  if (viewStack) {
    viewStack.$bind(Pushpop.EventType.WillPresentView, function(evt) {
      var view = evt.view;
      self.setTitle(view.getTitle());
      
      var backBarButtonItem = self.getBackBarButtonItem();
      if (backBarButtonItem) backBarButtonItem.setHidden(view.getHideBackBarButtonItem() || (viewStack.containsView(view) && viewStack.views.length === 1));
      
      self.setBarButtonItems(view.getBarButtonItems(), true);
    });
  }
  
  // Set up the navigation bar for the initial active view.
  var activeView = this.getActiveView();
  if (activeView) {
    this.setTitle(activeView.getTitle());
    this.setBarButtonItems(activeView.getBarButtonItems());
    
    backBarButtonItem.setHidden(activeView.getHideBackBarButtonItem() || (viewStack.containsView(activeView) && viewStack.views.length === 1));
  }
};

/**
  Style types for Pushpop.NavigationBar.
*/
Pushpop.NavigationBar.BarStyleType = {
  Default: 'pp-navigation-bar-style-default',
  Black: 'pp-navigation-bar-style-black'
};

Pushpop.NavigationBar.prototype = {
  constructor: Pushpop.NavigationBar,
  
  element: null,
  $element: null,
  
  $titleElement: null,
  $barButtonItemContainerElement: null,
  $barButtonItemContainerElementA: null,
  $barButtonItemContainerElementB: null,
  
  _title: '',
  
  /**
  
  */
  getTitle: function() { return this._title; },
  
  /**
  
  */
  setTitle: function(title) { this.$titleElement.html(_title = title || ''); },
  
  _tapToTop: false,
  
  /**
  
  */
  getTapToTop: function() { return this._tapToTop; },
  
  /**
  
  */
  setTapToTop: function(tapToTop) { this._tapToTop = tapToTop; },
  
  _barStyle: Pushpop.NavigationBar.BarStyleType.Default,
  
  /**
  
  */
  getBarStyleType: function() { return this._barStyle; },
  
  /**
  
  */
  setBarStyleType: function(barStyle) {
    this._barStyle = barStyle;
  },
  
  _translucent: false,
  
  /**
  
  */
  getTranslucent: function() { return this._translucent; },
  
  /**
  
  */
  setTranslucent: function(translucent) {
    this._translucent = translucent;
  },
  
  _tintColor: null,
  
  /**
  
  */
  getTintColor: function() { return this._tintColor; },
  
  /**
  
  */
  setTintColor: function(tintColor) {
    this._tintColor = tintColor;
  },
  
  _barButtonItems: null,
  
  /**
  
  */
  getBarButtonItems: function() { return this._barButtonItems; },
  
  /**
  
  */
  setBarButtonItems: function(barButtonItems, animated) {
    this.removeAllBarButtonItems(animated);
    
    // Toggle the current bar button item container before adding the new items to
    // create a smooth transition.
    this.$barButtonItemContainerElement = (this.$barButtonItemContainerElement === this.$barButtonItemContainerElementA) ? this.$barButtonItemContainerElementB : this.$barButtonItemContainerElementA;
    
    for (var i = 0, length = barButtonItems.length; i < length; i++) this.addBarButtonItem(barButtonItems[i], animated);
  },
  
  /**
  
  */
  addBarButtonItem: function(barButtonItem, animated) {
    var barStyle = this.getBarStyleType();
    if (barButtonItem.getButtonStyleType() === Pushpop.Button.ButtonStyleType.Default) {
      if (barStyle === Pushpop.NavigationBar.BarStyleType.Default) {
         barButtonItem.setButtonStyleType(Pushpop.Button.ButtonStyleType.Default);
      } else if (barStyle === Pushpop.NavigationBar.BarStyleType.Black) {
        barButtonItem.setButtonStyleType(Pushpop.Button.ButtonStyleType.Black);
      }
    }
    
    this._barButtonItems.push(barButtonItem);
    barButtonItem.appendTo(this.$barButtonItemContainerElement, animated);
  },
  
  /**
  
  */
  removeBarButtonItem: function(barButtonItem, animated) {
    var barButtonItems = this._barButtonItems;
    for (var i = 0, length = barButtonItems.length; i < length; i++) {
      if (barButtonItems[i] === barButtonItem) {
        barButtonItems.splice(i, 1);
        barButtonItem.remove(animated);
        break;
      }
    }
  },
  
  /**
  
  */
  removeAllBarButtonItems: function(animated) {
    var barButtonItems = this._barButtonItems;
    for (var i = 0, length = barButtonItems.length; i < length; i++) barButtonItems[i].remove(animated);
    barButtonItems.length = 0;
  },
  
  _backBarButtonItem: null,
  
  /**
  
  */
  getBackBarButtonItem: function() { return this._backBarButtonItem; },
  
  /**
  
  */
  setBackBarButtonItem: function(backBarButtonItem) {
    var previousBackBarButtonItem = this._backBarButtonItem;
    if (previousBackBarButtonItem) previousBackBarButtonItem.$element.removeClass('pp-navigation-bar-back-bar-button-item');
    this.$element.prepend((this._backBarButtonItem = backBarButtonItem).$element);
    
    backBarButtonItem.$element.addClass('pp-navigation-bar-back-bar-button-item');
    
    var viewStack = this.getViewStack();
    if (viewStack) backBarButtonItem.setHidden(viewStack.views.length === 1);
    
    var barStyle = this.getBarStyleType();
    if (barStyle === Pushpop.NavigationBar.BarStyleType.Default) {
      backBarButtonItem.setButtonStyleType(Pushpop.Button.ButtonStyleType.Default);
    } else if (barStyle === Pushpop.NavigationBar.BarStyleType.Black) {
      backBarButtonItem.setButtonStyleType(Pushpop.Button.ButtonStyleType.Black);
    }
  },
  
  /**
    Returns the view stack that contains this navigation bar.
    @description NOTE: If this navigation bar is not contained within a view stack,
    this method will return null.
    @type Pushpop.ViewStack
  */
  getViewStack: function() {
    var parents = this.$element.parents();
    var viewStack;
    for (var i = 0, length = parents.length; i < length; i++) if ((viewStack = parents[i].viewStack)) return viewStack;
    return null;
  },
  
  /**
    Returns the active view that this navigation bar currently represents.
    @description NOTE: If this navigation bar is not contained within a view stack
    or there is no active view, this method will return null.
    @type Pushpop.View
  */
  getActiveView: function() {
    var viewStack = this.getViewStack();
    return (viewStack) ? viewStack.getActiveView() : null;
  }
};

/**
  Creates a new Button.
  @param {HTMLAnchorElement} element The A element to initialize as a new Button.
  @param {Function} [action] Optional callback function to execute for the button's action.
  @param {String} [buttonAlignmentType] Optional alignment type specified by Pushpop.Button.ButtonAlignmentType.
  @param {String} [buttonStyleType] Optional style type specified by Pushpop.Button.ButtonStyleType.
  @constructor
*/
Pushpop.Button = function Button(elementOrTitle, action, buttonAlignmentType, buttonStyleType) {
  var $element = this.$element = (!elementOrTitle || typeof elementOrTitle === 'string') ?
    $('<a class="pp-button" href="#">' + (elementOrTitle || '') + '</a>') : $(elementOrTitle);
  
  var element = this.element = $element[0];
  
  var button = element.button;
  if (button) return button;
  
  var self = element.button = this;
  
  var buttonAlignmentTypes = Pushpop.Button.ButtonAlignmentType;
  var buttonStyleTypes = Pushpop.Button.ButtonStyleType;
  var key;
  
  if (!buttonAlignmentType) for (key in buttonAlignmentTypes) {
    if ($element.hasClass(buttonAlignmentTypes[key])) {
      buttonAlignmentType = buttonAlignmentTypes[key];
      break;
    }
  }
  
  if (!buttonStyleType) for (key in buttonStyleTypes) {
    if ($element.hasClass(buttonStyleTypes[key])) {
      buttonStyleType = buttonStyleTypes[key];
      break;
    }
  }
  
  this.setTitle($element.html());
  this.setAction(action || null);
  this.setButtonAlignmentType(buttonAlignmentType || Pushpop.Button.ButtonAlignmentType.Default);
  this.setButtonStyleType(buttonStyleType || Pushpop.Button.ButtonStyleType.Default);
};

/**
  Alignment types for Pushpop.Button.
*/
Pushpop.Button.ButtonAlignmentType = {
  Default: 'pp-button-alignment-default',
  Left: 'pp-button-alignment-left',
  Right: 'pp-button-alignment-right'
};

/**
  Style types for Pushpop.Button.
*/
Pushpop.Button.ButtonStyleType = {
  Default: 'pp-button-style-default',
  Black: 'pp-button-style-black',
  Blue: 'pp-button-style-blue',
  Green: 'pp-button-style-green',
  Red: 'pp-button-style-red'
};

/**
  Event types for Pushpop.Button.
*/
Pushpop.Button.EventType = {
  WillTriggerAction: 'Pushpop:Button:WillTriggerAction',
  DidTriggerAction: 'Pushpop:Button:DidTriggerAction'
};

Pushpop.Button.prototype = {
  constructor: Pushpop.Button,
  
  element: null,
  $element: null,
  
  _title: '',
  
  /**
  
  */
  getTitle: function() { return this._title; },
  
  /**
  
  */
  setTitle: function(title) { this.$element.html(_title = title || ''); },
  
  _action: null,
  
  /**
  
  */
  getAction: function() { return this._action; },
  
  /**
  
  */
  setAction: function(action) { this._action = action; },
  
  _active: false,
  
  /**
  
  */
  getActive: function() { return this._active; },
  
  /**
  
  */
  setActive: function(active) {
    if ((this._active = active)) {
      this.$element.addClass('pp-button-state-active');
    } else {
      this.$element.removeClass('pp-button-state-active');
    }
  },

  _buttonAlignmentType: Pushpop.Button.ButtonAlignmentType.Default,
  
  getButtonAlignmentType: function() { return this._buttonAlignmentType; },
  
  setButtonAlignmentType: function(buttonAlignmentType) {
    var $element = this.$element, buttonAlignmentTypes = Pushpop.Button.ButtonAlignmentType;
    for (var i in buttonAlignmentTypes) $element.removeClass(buttonAlignmentTypes[i]);
    $element.addClass(this._buttonAlignmentType = buttonAlignmentType);
  },
  
  _buttonStyleType: Pushpop.Button.ButtonStyleType.Default,
  
  getButtonStyleType: function() { return this._buttonStyleType; },
  
  setButtonStyleType: function(buttonStyleType) {
    var $element = this.$element, buttonStyleTypes = Pushpop.Button.ButtonStyleType;
    for (var i in buttonStyleTypes) $element.removeClass(buttonStyleTypes[i]);
    $element.addClass(this._buttonStyleType = buttonStyleType);
  },
  
  _hidden: false,
  
  /**
  
  */
  getHidden: function() { return this._hidden; },
  
  /**
  
  */
  setHidden: function(hidden) {
    if ((this._hidden = hidden)) {
      this.$element.addClass('pp-hidden');
    } else {
      this.$element.removeClass('pp-hidden');
    }
  },
  
  /**
  
  */
  triggerAction: function() {
    var $element = this.$element;
    var action = this.getAction();
    
    $element.trigger($.Event(Pushpop.Button.EventType.WillTriggerAction, {
      button: this,
      action: action
    }));
    
    if (action) {
      if (typeof action === 'string') window[action](this);
      else if (typeof action === 'function') action(this);
    }
    
    $element.trigger($.Event(Pushpop.Button.EventType.DidTriggerAction, {
      button: this,
      action: action
    }));
  },
  
  _pendingRemovalTimeout: null,
  
  remove: function(animated) {
    var $element = this.$element;
    
    if (animated) {
      this.setHidden(true);
      this._pendingRemovalTimeout = window.setTimeout(function() {
        $element.detach();
      }, 300);
    } else {
      $element.detach();
      this.setHidden(true);
    }
  },
  
  appendTo: function(element, animated) {
    if (this._pendingRemovalTimeout) window.clearTimeout(this._pendingRemovalTimeout);
    if (animated) {
      this.setHidden(true);
      $(element).append(this.$element);
      this.forceReflow();
      this.setHidden(false);
    } else {
      this.setHidden(false);
      $(element).append(this.$element);
    }
  },
  
  /**
    Forces a reflow in the browser for this button.
  */
  forceReflow: function() { var doNothing = this.element.offsetWidth; },
  
  /**
    Returns the view that contains this button.
    @description NOTE: If this button is not contained within a view, this method will return null.
    @type Pushpop.View
  */
  getView: function() {
    var parents = this.$element.parents();
    var view;
    for (var i = 0, length = parents.length; i < length; i++) if ((view = parents[i].view)) return view;
    return null;
  },
  
  /**
    Returns the view stack that contains this button.
    @description NOTE: If this button is not contained within a view stack, this method will return null.
    @type Pushpop.ViewStack
  */
  getViewStack: function() {
    var parents = this.$element.parents();
    var viewStack;
    for (var i = 0, length = parents.length; i < length; i++) if ((viewStack = parents[i].viewStack)) return viewStack;
    return null;
  }
};

$(function() {
  var buttons = Pushpop.buttons = Pushpop.buttons || {};
  var views = Pushpop.views = Pushpop.views || {};
  var viewStacks = Pushpop.viewStacks = Pushpop.viewStacks || {};
  var navigationBars = Pushpop.navigationBars = Pushpop.navigationBars || {};
  
  $('.pp-button').each(function(index, element) {
    var button = new Pushpop.Button(element);
    if (element.id) buttons[Pushpop.Util.convertDashedStringToCamelCase(element.id)] = button;
  });
  
  $('.pp-view').each(function(index, element) {
    var view = new Pushpop.View(element);
    if (element.id) views[Pushpop.Util.convertDashedStringToCamelCase(element.id)] = view;
  });
  
  $('.pp-view-stack').each(function(index, element) {
    var viewStack = new Pushpop.ViewStack(element);
    if (element.id) viewStacks[Pushpop.Util.convertDashedStringToCamelCase(element.id)] = viewStack;
  });
  
  if (Pushpop.ModalViewStack) $('.pp-modal-view-stack').each(function(index, element) {
    var viewStack = new Pushpop.ModalViewStack(element);
    if (element.id) viewStacks[Pushpop.Util.convertDashedStringToCamelCase(element.id)] = viewStack;
  });
  
  if (Pushpop.SplitView) $('.pp-split-view').each(function(index, element) { new Pushpop.SplitView(element); });
  
  $('.pp-navigation-bar').each(function(index, element) {
    var navigationBar = new Pushpop.NavigationBar(element);
    if (element.id) navigationBars[Pushpop.Util.convertDashedStringToCamelCase(element.id)] = navigationBar;
  });
  
  // Handle mouse/touch events globally to trigger button actions.
  var $body = $(document.body);
  
  $body.delegate('.pp-button', 'click', function(evt) { evt.preventDefault(); });
  
  $body.delegate('.pp-button', !!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    var button = this.button;
    if (!button) return;
    button.setActive(true);
  });
  
  $body.delegate('.pp-button', !!('ontouchmove' in window) ? 'touchmove' : 'mousemove', function(evt) {
    var button = this.button;
    if (!button || !button.getActive()) return;
    
    button.setActive(false);
  });
  
  $body.delegate('.pp-button', !!('ontouchend' in window) ? 'touchend' : 'mouseup', function(evt) {
    var button = this.button;
    if (!button || !button.getActive()) return;
    
    button.setActive(false);
    button.triggerAction();
  });
  
  // Handle actions for buttons set up to automatically push/pop views.
  $body.delegate('.pp-button.pp-push, .pp-button.pp-pop', Pushpop.Button.EventType.DidTriggerAction, function(evt) {
    var button = evt.button;
    var $element = button.$element;
    var href = $element.attr('href');
    var transition = $element.attr('data-transition');
    var $viewElement, view, viewStack;
    
    if ($element.hasClass('pp-push')) {
      $viewElement = $(href);
      if ($viewElement.length === 0) return;

      view = $viewElement[0].view || new Pushpop.View($viewElement);

      viewStack = view.getViewStack();
      if (viewStack) viewStack.push(view, transition);
    }
    
    else if ($element.hasClass('pp-pop')) {
      if (href === '#') {
        viewStack = button.getViewStack();
        if (viewStack) viewStack.pop(transition);
      } else {
        $viewElement = $(href);
        if ($viewElement.length === 0) return;

        view = $viewElement[0].view || new Pushpop.View($viewElement);

        viewStack = view.getViewStack();
        if (viewStack) viewStack.pop(view, transition);
      }
    }
  });
  
  // TODO: Is this still needed?
  $(document).bind('touchstart', function() {});
  
  // TODO: Clean up (use new events?)
  $('a.pp-push').live('click', function(evt) {
    var $this = $(this);
    if ($this.hasClass('pp-button')) return;
    
    evt.preventDefault();
    
    var href = $this.attr('href');
    var $viewElement, view, viewStack;
    
    $viewElement = $(href);
    if ($viewElement.length === 0) return;
    
    view = $viewElement[0].view || new Pushpop.View($viewElement);
    
    viewStack = view.getViewStack();
    if (viewStack) viewStack.push(view, $this.attr('data-transition'));
  });
  
  // TODO: Clean up (use new events?)
  $('a.pp-pop').live('click', function(evt) {
    var $this = $(this);
    if ($this.hasClass('pp-button')) return;
    
    evt.preventDefault();
    
    var href = $this.attr('href');
    var $viewElement, view, viewStack;
    
    if (href === '#') {
      viewStack = Pushpop.getViewStackForElement($this);
      if (viewStack) viewStack.pop($this.attr('data-transition'));
    } else {
      $viewElement = $(href);
      if ($viewElement.length === 0) return;
      
      view = $viewElement[0].view || new Pushpop.View($viewElement);
      
      viewStack = view.getViewStack();
      if (viewStack) viewStack.pop(view, $this.attr('data-transition'));
    }
  });
});
