;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new ModalViewStack.
  @param {HTMLDivElement} element The DIV element to initialize as a new ModalViewStack.
  @constructor
  @extends Pushpop.ViewStack
*/
Pushpop.ModalViewStack = function ModalViewStack(element) {
  
  // Call the "super" constructor.
  Pushpop.ViewStack.prototype.constructor.apply(this, arguments);
  
  var $element = this.$element;
  
  // Insert the backdrop element after the modal view stack element.
  var $backdrop = $('<div class="pp-modal-view-stack-backdrop"/>').insertAfter($element);
  
  // Initialize the modal view stack's presentation style based on the element's CSS classes.
  var presentationStyles = Pushpop.ModalViewStack.PresentationStyleType, didInitPresentationStyle = false;
  for (var presentationStyle in presentationStyles) {
    if ($element.hasClass('pp-modal-presentation-style-' + presentationStyles[presentationStyle])) {
      this.setPresentationStyle(presentationStyles[presentationStyle]);
      didInitPresentationStyle = true;
      break;
    }
  }
  
  // Set the modal view stack's presentation style to the default if one was not specified.
  if (!didInitPresentationStyle) this.setPresentationStyle(this.constructor.prototype._presentationStyle);
  
  // Initialize the modal view stack's transition style based on the element's CSS classes.
  var transitionStyles = Pushpop.ModalViewStack.TransitionStyleType, didInitTransitionStyle = false;
  for (var transitionStyle in transitionStyles) {
    if ($element.hasClass('pp-modal-transition-style-' + transitionStyles[transitionStyle])) {
      this.setTransitionStyle(transitionStyles[transitionStyle]);
      didInitTransitionStyle = true;
      break;
    }
  }
  
  // Set the modal view stack's transition style to the default if one was not specified.
  if (!didInitTransitionStyle) this.setTransitionStyle(this.constructor.prototype._transitionStyle);
  
  // Make the modal view stack visible if it is initialized with the .pp-active CSS class.
  this.setHidden(!$element.hasClass('pp-active'));
};

/**
  Presentation styles available when presenting a Pushpop.ModalViewStack.
*/
Pushpop.ModalViewStack.PresentationStyleType = {
  FullScreen: 'full-screen',  // 100% x 100%
  PageSheet: 'page-sheet',    // 768px x 100%
  FormSheet: 'form-sheet'     // 540px x 620px
};

/**
  Transition styles available when presenting a Pushpop.ModalViewStack.
*/
Pushpop.ModalViewStack.TransitionStyleType = {
  CoverVertical: 'cover-vertical'
};

// Create the prototype for the Pushpop.ModalViewStack as a "sub-class" of Pushpop.ViewStack.
Pushpop.ModalViewStack.prototype = new Pushpop.ViewStack();
Pushpop.ModalViewStack.prototype.constructor = Pushpop.ModalViewStack;

/**
  Pushes the specified view to the view stack using the optionally specified transition. If a
  transition is not specified, the default will be used. A callback may optionally be provided
  to be called after the transition completes. In the case of a Pushpop.ModalViewStack, the
  modal view stack will first be presented if it is currently hidden.
  @description This method overrides the default implementation of Pushpop.ViewStack to present
  the modal view stack if it is hidden. After presenting the modal view stack (if needed), the
  "super" implementation of this method is then executed.
  @param {Pushpop.View} view The view to be pushed to the view stack.
  @param {String|Function} [transitionOrCallback] Either the name of the transition to use when
  pushing the view or a callback function to be executed upon completion of the default transition.
  If this parameter is omitted, the default transition is used.
  @param {Function} [callback] A callback function to be executed upon completion of the specified
  transition.
*/
Pushpop.ModalViewStack.prototype.push = function(view, transitionOrCallback, callback) {
  if (this.getHidden()) this.present();
  
  // Call the "super" method.
  Pushpop.ViewStack.prototype.push.apply(this, arguments);
};

/**
  Pops the current or specified view off the view stack using the optionally specified transition.
  If a view is not specified, the current view will be popped (unless it is the root view). If a
  transition is not specified, the default will be used. A callback may optionally be provided to
  be called after the transition completes. In the case of a Pushpop.ModalViewStack, the modal
  view stack will be dismissed if this method is called when there is only one remaining view on
  the view stack (e.g.: the "root" view) and no view is specified.
  @description This method overrides the default implementation of Pushpop.ViewStack to dismiss
  the modal view stack if there is only one remaining view on the view stack and no view is
  specified. After dismissing the modal view stack (if needed), the "super" implementation of this
  method is then executed.
  @param {Pushpop.View|String} viewOrTransition Either the view to be popped to on the view stack
  or the name of the transition to use when popping the view. If this parameter is omitted or if
  it specifies a transition name, the current view will be assumed to be popped.
  @param {String|Function} [transitionOrCallback] Either the name of the transition to use when
  popping the view or a callback function to be executed upon completion of the default transition.
  If this parameter is omitted, the default transition is used.
  @param {Function} [callback] A callback function to be executed upon completion of the specified
  transition.
*/
Pushpop.ModalViewStack.prototype.pop = function(viewOrTransition, transitionOrCallback, callback) {
  if (this.views.length <= 1) this.dismiss();
  
  // Call the "super" method.
  Pushpop.ViewStack.prototype.pop.apply(this, arguments);
};

Pushpop.ModalViewStack.prototype._hidden = true;

/**
  Returns a flag indicating if this modal view stack is hidden.
  @type Boolean
*/
Pushpop.ModalViewStack.prototype.getHidden = function() { return this._hidden; };

/**
  Sets a flag indicating if this modal view stack should be hidden.
  @param {Boolean} hidden A flag indicating if this modal view stack should be hidden.
*/
Pushpop.ModalViewStack.prototype.setHidden = function(hidden) { if (hidden) this.dismiss(); else this.present(); };

/**
  Presents this modal view stack and transitions it to a visible state.
  @param {Pushpop.View} [view] Optional view to set as the active view before presenting.
*/
Pushpop.ModalViewStack.prototype.present = function(view) {
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
    action: 'modal-present'
  }));
  
  this.$element.addClass('pp-active');
  
  activeView.$trigger($.Event(Pushpop.EventType.DidPresentView, {
    view: activeView,
    action: 'modal-present'
  }));
};

/**
  Dismisses this modal view stack and transitions it to a hidden state.
*/
Pushpop.ModalViewStack.prototype.dismiss = function() {
  if (this.getHidden()) return;
  
  this._hidden = true;
  
  var activeView = this.getActiveView();
  activeView.$trigger($.Event(Pushpop.EventType.WillDismissView, {
    view: activeView,
    action: 'modal-dismiss'
  }));
  
  var self = this;
  window.setTimeout(function() {
    self.$element.removeClass('pp-active');

    activeView.$trigger($.Event(Pushpop.EventType.DidDismissView, {
      view: activeView,
      action: 'modal-dismiss'
    }));
  }, 50);
};

Pushpop.ModalViewStack.prototype._presentationStyle = Pushpop.ModalViewStack.PresentationStyleType.FormSheet;

/**
  Returns the presentation style of this modal view stack.
  @type String
*/
Pushpop.ModalViewStack.prototype.getPresentationStyle = function() { return this._presentationStyle; };

/**
  Sets the presentation style to use when presenting this modal view stack.
  @param {String} presentationStyle The presentation style for this modal view stack.
*/
Pushpop.ModalViewStack.prototype.setPresentationStyle = function(presentationStyle) {
  this._presentationStyle = presentationStyle;
  
  var $element = this.$element, presentationStyles = Pushpop.ModalViewStack.PresentationStyleType;
  for (var p in presentationStyles) $element.removeClass('pp-modal-presentation-style-' + presentationStyles[p]);
  $element.addClass('pp-modal-presentation-style-' + presentationStyle);
};

Pushpop.ModalViewStack.prototype._transitionStyle = Pushpop.ModalViewStack.TransitionStyleType.CoverVertical;

/**
  Returns the transition style of this modal view stack.
  @type String
*/
Pushpop.ModalViewStack.prototype.getTransitionStyle = function() { return this._transitionStyle; };

/**
  Sets the transition style to use when presenting this modal view stack.
  @param {String} transitionStyle The transition style for this modal view stack.
*/
Pushpop.ModalViewStack.prototype.setTransitionStyle = function(transitionStyle) {
  this._transitionStyle = transitionStyle;
  
  var $element = this.$element, transitionStyles = Pushpop.ModalViewStack.TransitionStyleType;
  for (var t in transitionStyles) $element.removeClass('pp-modal-transition-style-' + transitionStyles[t]);
  $element.addClass('pp-modal-transition-style-' + transitionStyle);
};

$(function() {
  var $window = $(window['addEventListener'] ? window : document.body);
  
  // Handle actions for buttons set up to automatically present/dismiss modals.
  $window.delegate('.pp-button.pp-present-modal, .pp-button.pp-dismiss-modal', Pushpop.Button.EventType.DidTriggerAction, function(evt) {
    var button = evt.button;
    var $element = button.$element;
    var href = $element.attr('href');
    var $viewElement, view, viewStack;
    
    if ($element.hasClass('pp-present-modal')) {
      $viewElement = $(href);
      if ($viewElement.length === 0) return;
      
      view = $viewElement[0].view || new Pushpop.View($viewElement);
      
      viewStack = view.getViewStack();
      if (viewStack) viewStack.present(view);
    }
    
    else if ($element.hasClass('pp-dismiss-modal')) {
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
  
  // Handle clicks for anchor links set up to automatically present/dismiss modals.
  $window.delegate('a.pp-present-modal, a.pp-dismiss-modal', 'click', function(evt) {
    var $element = $(this);
    if ($element.hasClass('pp-button')) return;
    
    evt.preventDefault();
    
    var href = $element.attr('href');
    var $viewElement, view, viewStack;
    
    if ($element.hasClass('pp-present-modal')) {
      $viewElement = $(href);
      if ($viewElement.length === 0) return;

      view = $viewElement[0].view || new Pushpop.View($viewElement);

      viewStack = view.getViewStack();
      if (viewStack) viewStack.present(view);
    }
    
    else if ($element.hasClass('pp-dismiss-modal')) {
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
