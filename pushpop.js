'use strict';

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
