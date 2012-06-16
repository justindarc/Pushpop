;'use strict';

/**
  The base Pushpop object.
*/
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new ModalViewStack.
  @param {HTMLDivElement} element The <div/> element to initialize as a new ModalViewStack.
  @constructor
*/
Pushpop.ModalViewStack = function ModalViewStack(element) {
  
  // Call the "super" constructor.
  Pushpop.ViewStack.prototype.constructor.apply(this, arguments);
  
  var $element = this.$element;
  
  var $backdrop = $('<div class="pp-modal-view-stack-backdrop"/>').insertAfter($element);
  
  var presentationStyles = Pushpop.ModalViewStack.PresentationStyleType, didInitPresentationStyle = false;
  for (var presentationStyle in presentationStyles) {
    if ($element.hasClass('pp-modal-presentation-style-' + presentationStyles[presentationStyle])) {
      this.setPresentationStyle(presentationStyles[presentationStyle]);
      didInitPresentationStyle = true;
      break;
    }
  }
  
  if (!didInitPresentationStyle) this.setPresentationStyle(this.constructor.prototype._presentationStyle);
  
  var transitionStyles = Pushpop.ModalViewStack.TransitionStyleType, didInitTransitionStyle = false;
  for (var transitionStyle in transitionStyles) {
    if ($element.hasClass('pp-modal-transition-style-' + transitionStyles[transitionStyle])) {
      this.setTransitionStyle(transitionStyles[transitionStyle]);
      didInitTransitionStyle = true;
      break;
    }
  }
  
  if (!didInitTransitionStyle) this.setTransitionStyle(this.constructor.prototype._transitionStyle);
};

Pushpop.ModalViewStack.PresentationStyleType = {
  FullScreen: 'full-screen',
  PageSheet: 'page-sheet',
  FormSheet: 'form-sheet'
};

Pushpop.ModalViewStack.TransitionStyleType = {
  CoverVertical: 'cover-vertical'
};

Pushpop.ModalViewStack.prototype = new Pushpop.ViewStack();
Pushpop.ModalViewStack.prototype.constructor = Pushpop.ModalViewStack;

Pushpop.ModalViewStack.prototype.push = function(view, transitionOrCallback, callback) {
  
  // Call the "super" method.
  Pushpop.ViewStack.prototype.push.apply(this, arguments);
};

Pushpop.ModalViewStack.prototype.pop = function(viewOrTransition, transitionOrCallback, callback) {
  
  // Call the "super" method.
  Pushpop.ViewStack.prototype.pop.apply(this, arguments);
};

Pushpop.ModalViewStack.prototype.present = function() { this.$element.addClass('pp-active'); };

Pushpop.ModalViewStack.prototype.dismiss = function() { this.$element.removeClass('pp-active'); };

Pushpop.ModalViewStack.prototype._presentationStyle = Pushpop.ModalViewStack.PresentationStyleType.FormSheet;

Pushpop.ModalViewStack.prototype.getPresentationStyle = function() { return this._presentationStyle; };

Pushpop.ModalViewStack.prototype.setPresentationStyle = function(presentationStyle) {
  this._presentationStyle = presentationStyle;
  
  var $element = this.$element, presentationStyles = Pushpop.ModalViewStack.PresentationStyleType;
  for (var p in presentationStyles) $element.removeClass('pp-modal-presentation-style-' + presentationStyles[p]);
  $element.addClass('pp-modal-presentation-style-' + presentationStyle);
};

Pushpop.ModalViewStack.prototype._transitionStyle = Pushpop.ModalViewStack.TransitionStyleType.CoverVertical;

Pushpop.ModalViewStack.prototype.getTransitionStyle = function() { return this._transitionStyle; };

Pushpop.ModalViewStack.prototype.setTransitionStyle = function(transitionStyle) {
  this._transitionStyle = transitionStyle;
  
  var $element = this.$element, transitionStyles = Pushpop.ModalViewStack.TransitionStyleType;
  for (var t in transitionStyles) $element.removeClass('pp-modal-transition-style-' + transitionStyles[t]);
  $element.addClass('pp-modal-transition-style-' + transitionStyle);
};

$(function() {
  $('.pp-modal-view-stack').each(function(index, element) { new Pushpop.ModalViewStack(element); });
  
  $('a.pp-present-modal').live('click', function(evt) {
    evt.preventDefault();
    
    var $this = $(this);
    var href = $this.attr('href');
    var $viewElement = $(href);
    
    var view = $viewElement[0];
    if (view) view = view.view || new Pushpop.View($viewElement);
    
    var viewStack = view.getViewStack();    
    if (viewStack) viewStack.present();
  });
  
  $('a.pp-dismiss-modal').live('click', function(evt) {
    evt.preventDefault();
    
    var $this = $(this);
    var href = $this.attr('href');
    var $viewElement, view, viewStack;
    
    if (href === '#') {
      $viewElement = $this.parents('.pp-view').first();
    } else {
      $viewElement = $(href);
    }
    
    if ($viewElement.length > 0) view = $viewElement[0].view;
    
    view = view || new Pushpop.View($viewElement);
    
    viewStack = view.getViewStack();      
    if (viewStack) viewStack.dismiss();
  });
});
