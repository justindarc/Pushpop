;'use strict';

// The base Pushpop object.
var Pushpop = window.Pushpop || {};

/**
  Creates a new PopoverViewStack.
  @param {HTMLDivElement} element The DIV element to initialize as a new PopoverViewStack.
  @constructor
  @extends Pushpop.ViewStack
*/
Pushpop.PopoverViewStack = function PopoverViewStack(element) {
  
  // Call the "super" constructor.
  Pushpop.ViewStack.prototype.constructor.apply(this, arguments);
  
  var self = this;
  
  var $element = this.$element;
  
  // Insert the backdrop element after the popover view stack element.
  var $backdrop = $('<div class="pp-popover-view-stack-backdrop"/>').insertAfter($element);
  
  // Wrap the popover view stack element in a container.
  var popoverStyle = $element.data('popoverStyle');
  var $container = this.$container = $('<div class="pp-popover-view-stack-container' + (popoverStyle ? ' pp-popover-view-stack-container-style-' + popoverStyle : '') + '"/>').insertAfter($element).append($element);
  
  // Insert an arrow element in the container.
  var $arrow = this.$arrow = $('<div class="pp-popover-view-stack-arrow pp-popover-view-stack-arrow-top"/>').appendTo($container);
  
  // Make the popover view stack visible if it is initialized with the .pp-active CSS class.
  this.setHidden(!$element.hasClass('pp-active'));
  $element.removeClass('pp-active');
  
  // Dismiss the popover view stack if the backdrop element is tapped/clicked.
  $backdrop.bind(!!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    self.dismiss();
  });
};

Pushpop.PopoverViewStack.POPOVER_CONTAINER_MARGIN = 10;

// Create the prototype for the Pushpop.PopoverViewStack as a "sub-class" of Pushpop.ViewStack.
Pushpop.PopoverViewStack.prototype = new Pushpop.ViewStack();
Pushpop.PopoverViewStack.prototype.constructor = Pushpop.PopoverViewStack;

Pushpop.PopoverViewStack.prototype.$container = null;
Pushpop.PopoverViewStack.prototype.$arrow = null;

Pushpop.PopoverViewStack.prototype._hidden = true;

/**
  Returns a flag indicating if this popover view stack is hidden.
  @type Boolean
*/
Pushpop.PopoverViewStack.prototype.getHidden = function() { return this._hidden; };

/**
  Sets a flag indicating if this popover view stack should be hidden.
  @param {Boolean} hidden A flag indicating if this popover view stack should be hidden.
*/
Pushpop.PopoverViewStack.prototype.setHidden = function(hidden) { if (hidden) this.dismiss(); else this.present(); };

Pushpop.PopoverViewStack.prototype._targetElement = null;

/**
  Returns the current target element for this popover view stack.
  @type HTMLElement
*/
Pushpop.PopoverViewStack.prototype.getTargetElement = function() { return this._targetElement; };

/**
  Sets the current target element for this popover view stack.
  @param {HTMLElement} targetElement The target element this popover view stack should point to.
*/
Pushpop.PopoverViewStack.prototype.setTargetElement = function(targetElement) {
  this._targetElement = targetElement;
  
  var $targetElement = $(targetElement);
  var $window = $(window);
  var $container = this.$container;
  var $arrow = this.$arrow;
  
  var targetSize = {
    width:  $targetElement.outerWidth(),
    height: $targetElement.outerHeight()
  };
  var windowSize = {
    width:  $window.width(),
    height: $window.height()
  };
  var containerOuterSize = {
    width:  $container.outerWidth(),
    height: $container.outerHeight()
  };
  var containerInnerSize = {
    width:  $container.width(),
    height: $container.height()
  };
  var arrowSize = {
    width:  $arrow.width(),
    height: $arrow.height()
  };
  
  var targetPosition = $targetElement.offset();
  targetPosition = {
    x: targetPosition.left + (targetSize.width / 2),
    y: targetPosition.top + targetSize.height
  };
  
  var containerPosition = {
    x: targetPosition.x - (containerOuterSize.width / 2) - Pushpop.PopoverViewStack.POPOVER_CONTAINER_MARGIN,
    y: targetPosition.y
  };
  
  var minimumContainerPosition = {
    x: -Pushpop.PopoverViewStack.POPOVER_CONTAINER_MARGIN,
    y: -Pushpop.PopoverViewStack.POPOVER_CONTAINER_MARGIN
  };
  
  var maximumContainerPosition = {
    x: windowSize.width  - containerOuterSize.width  - Pushpop.PopoverViewStack.POPOVER_CONTAINER_MARGIN,
    y: windowSize.height - containerOuterSize.height - Pushpop.PopoverViewStack.POPOVER_CONTAINER_MARGIN
  };
  
  var adjustedContainerPosition = {
    x: Math.min(Math.max(containerPosition.x, minimumContainerPosition.x), maximumContainerPosition.x),
    y: containerPosition.y
  };
  
  var adjustmentOffset = {
    x: containerPosition.x - adjustedContainerPosition.x,
    y: containerPosition.y - adjustedContainerPosition.y
  };
  
  var arrowPosition = {
    x: (containerInnerSize.width / 2) - (arrowSize.width / 2) + adjustmentOffset.x,
    y: 1 - arrowSize.height
  };
  
  this.$container.css({ left: adjustedContainerPosition.x + 'px', top: adjustedContainerPosition.y + 'px' });
  this.$arrow.css({ left: arrowPosition.x + 'px', top: arrowPosition.y + 'px' });
};

/**
  Presents this popover view stack and transitions it to a visible state.
  @param {Pushpop.View} [view] Optional view to set as the active view before presenting.
*/
Pushpop.PopoverViewStack.prototype.present = function(view, targetElement) {
  if (!this.getHidden()) return;
  
  this._hidden = false;

  var oldActiveView = this.getActiveView();
  if (view && oldActiveView !== view) {
    oldActiveView.$element.removeClass('pp-active');
    view.$element.addClass('pp-active');
    
    this.views.length = 0;
    this.views.push(view);
  } else {
    this.views.length = 0;
    this.views.push(oldActiveView);
  }
  
  var activeView = this.getActiveView();
  activeView.$trigger($.Event(Pushpop.EventType.WillPresentView, {
    view: activeView,
    action: 'popover-present'
  }));
  
  if (targetElement) this.setTargetElement(targetElement);
  
  this.$container.addClass('pp-active');
  
  activeView.$trigger($.Event(Pushpop.EventType.DidPresentView, {
    view: activeView,
    action: 'popover-present'
  }));
};

/**
  Dismisses this popover view stack and transitions it to a hidden state.
*/
Pushpop.PopoverViewStack.prototype.dismiss = function() {
  if (this.getHidden()) return;
  
  this._hidden = true;
  
  var activeView = this.getActiveView();
  activeView.$trigger($.Event(Pushpop.EventType.WillDismissView, {
    view: activeView,
    action: 'popover-dismiss'
  }));
  
  var self = this;
  window.setTimeout(function() {
    self.$container.removeClass('pp-active');

    activeView.$trigger($.Event(Pushpop.EventType.DidDismissView, {
      view: activeView,
      action: 'popover-dismiss'
    }));
  }, 50);
};

$(function() {
  var $window = $(window['addEventListener'] ? window : document.body);
  
  // Handle actions for buttons set up to automatically present/dismiss popovers.
  $window.delegate('.pp-button.pp-present-popover, .pp-button.pp-dismiss-popover', Pushpop.Button.EventType.DidTriggerAction, function(evt) {
    var button = evt.button;
    var $element = button.$element;
    var href = $element.attr('href');
    var $viewElement, view, viewStack;
    
    if ($element.hasClass('pp-present-popover')) {
      $viewElement = $(href);
      if ($viewElement.length === 0) return;
      
      view = $viewElement[0].view || new Pushpop.View($viewElement);
      
      viewStack = view.getViewStack();
      if (viewStack) viewStack.present(view, button.element);
    }
    
    else if ($element.hasClass('pp-dismiss-popover')) {
      if (href === '#') {
        viewStack = button.getViewStack();
        if (viewStack) viewStack.dismiss();
      } else {
        $viewElement = $(href);
        if ($viewElement.length === 0) return;

        view = $viewElement[0].view || new Pushpop.View($viewElement);

        viewStack = view.getViewStack();
        if (viewStack) viewStack.dismiss();
      }
    }
  });
  
  // Handle clicks for anchor links set up to automatically present/dismiss popovers.
  $window.delegate('a.pp-present-popover, a.pp-dismiss-popover', 'click', function(evt) {
    var $element = $(this);
    if ($element.hasClass('pp-button')) return;
    
    evt.preventDefault();
    
    var href = $element.attr('href');
    var $viewElement, view, viewStack;
    
    if ($element.hasClass('pp-present-popover')) {
      $viewElement = $(href);
      if ($viewElement.length === 0) return;

      view = $viewElement[0].view || new Pushpop.View($viewElement);

      viewStack = view.getViewStack();
      if (viewStack) viewStack.present(view, this);
    }
    
    else if ($element.hasClass('pp-dismiss-popover')) {
      if (href === '#') {
        viewStack = Pushpop.getViewStackForElement($element);
        if (viewStack) viewStack.dismiss();
      } else {
        $viewElement = $(href);
        if ($viewElement.length === 0) return;

        view = $viewElement[0].view || new Pushpop.View($viewElement);

        viewStack = view.getViewStack();
        if (viewStack) viewStack.dismiss();
      }
    }
  });
});
