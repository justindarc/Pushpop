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
  
  var $element = this.$element;
  
  // Insert the backdrop element after the popover view stack element.
  var $backdrop = $('<div class="pp-popover-view-stack-backdrop"/>').insertAfter($element);

  // Make the popover view stack visible if it is initialized with the .pp-active CSS class.
  this.setHidden(!$element.hasClass('pp-active'));
};

// Create the prototype for the Pushpop.PopoverViewStack as a "sub-class" of Pushpop.ViewStack.
Pushpop.PopoverViewStack.prototype = new Pushpop.ViewStack();
Pushpop.PopoverViewStack.prototype.constructor = Pushpop.PopoverViewStack;

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

/**
  Presents this popover view stack and transitions it to a visible state.
  @param {Pushpop.View} [view] Optional view to set as the active view before presenting.
*/
Pushpop.PopoverViewStack.prototype.present = function(view) {
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
  
  this.$element.addClass('pp-active');
  
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
    self.$element.removeClass('pp-active');

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
      if (viewStack) viewStack.present(view);
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
      if (viewStack) viewStack.present(view);
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
