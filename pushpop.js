'use strict';

var Pushpop = {
  views: [],
  $topbar: null,
  $backButton: null,
  
  handleEvent: function(evt) {
    switch (evt.type) {
      case 'webkitTransitionEnd':
      case 'oTransitionEnd':
      case 'transitionend':
        var activeView = Pushpop.activeView();
        var $activeViewElement = $('.view.active');
        var $newActiveViewElement = $(activeView.element);
        
        if (!Pushpop.isGecko()) {
          $(document.documentElement).removeClass('transition');
        }
        
        $activeViewElement.removeClass('active push pop transition ' +
          'slideHorizontal slideVertical flipHorizontal flipVertical cardSwap crossFade zoom');
        $newActiveViewElement.removeClass('push pop transition ' +
          'slideHorizontal slideVertical flipHorizontal flipVertical cardSwap crossFade zoom');
        $newActiveViewElement.addClass('active')
          .unbind('webkitTransitionEnd').unbind('oTransitionEnd').unbind('transitionend');
        
        setTimeout(function() {
          window.scrollTo(activeView.scrollX, activeView.scrollY);
        }, 100);
        break;
      default:
        break;
    }
  },
  isGecko: function() {
    if (this._isGecko !== undefined) {
      return this._isGecko;
    }
    
    var cssStyleDeclarations = Object.keys(CSSStyleDeclaration.prototype);
    
    for (var i = 0; i < cssStyleDeclarations.length; i++) {
      if (cssStyleDeclarations[i].match(/^Moz/)) {
        return this._isGecko = true;
      }
    }
    
    return this._isGecko = false;
  },
  animateScrollTo: function(x, y, milliseconds, callback) {
    var stepCount = milliseconds / 15;
    var incrementX = (x - window.pageXOffset) / stepCount;
    var incrementY = (y - window.pageYOffset) / stepCount;
    
    var interval = setInterval(function() {
      var currentX = window.pageXOffset + incrementX;
      var currentY = window.pageYOffset + incrementY;
      
      if (incrementX > 0) {
        if (currentX > x) currentX = x;
      } else {
        if (currentX < x) currentX = x;
      }

      if (incrementY > 0) {
        if (currentY > y) currentY = y;
      } else {
        if (currentY < y) currentY = y;
      }
      
      if (currentX === x && currentY === y) {
        clearInterval(interval);
        
        if (callback && typeof callback === 'function') {
          setTimeout(function() {
            callback();
          }, 100);
        }
      }
      
      window.scroll(currentX, currentY);
      
      incrementX *= 0.925;
      incrementY *= 0.925;
    }, 15);
  },
  activeView: function() {
    var views = this.views;
    
    return views[views.length - 1];
  },
  getView: function(viewOrHref) {
    var views = this.views;
    var view, i;
    
    if (typeof viewOrHref === 'string') {
      for (i = 0; i < views.length; i++) {
        view = views[i];
      
        if (view.href === viewOrHref) {
          return view;
        }
      }
    } else {
      for (i = 0; i < views.length; i++) {
        view = views[i];
      
        if (view === viewOrHref) {
          return view;
        }
      }
    }
    
    return null;
  },
  push: function(view, transition) {
    var views = this.views;
    var isGecko = this.isGecko();
    var $backButton = this.$backButton;
    var transition, activeView, newActiveView;
    
    view.isRoot = views.length === 0;
    
    if (!view.isRoot) {
      $backButton.addClass('active');
      activeView = this.activeView();
      activeView.lastTransition = transition;
      newActiveView = view;
    }
    
    views.push(view);
    
    if (view.isRoot) return;

    activeView.scrollX = window.scrollX;
    activeView.scrollY = window.scrollY;
    
    var $activeViewElement = $(activeView.element);
    var $newActiveViewElement = $(newActiveView.element);
    
    if (isGecko) {
      if (transition === 'flipHorizontal') {
        transition = 'slideHorizontal';
      }

      else if (transition === 'flipVertical') {
        transition = 'slideVertical';
      }
      
      else if (transition === 'cardSwap') {
        transition = 'zoom';
      }
    }
    
    $newActiveViewElement.bind('webkitTransitionEnd oTransitionEnd transitionend', this.handleEvent);
    
    setTimeout(function() {
      window.scrollTo(0, 0);

      $activeViewElement.addClass(transition + ' push');
      $newActiveViewElement.addClass(transition + ' push');

      setTimeout(function() {
        if (!isGecko) {
          $(document.documentElement).addClass('transition');
        }

        $activeViewElement.addClass('transition');
        $newActiveViewElement.addClass('transition');
      }, 100);
    }, 100);
  },
  pop: function(viewOrTransition, transition) {
    var views = this.views;
    var isGecko = this.isGecko();
    var $backButton = this.$backButton;
    var transition, activeView, newActiveView;
    
    if (views.length <= 1) return;
    
    window.scrollTo(0, 0);
    
    activeView = this.activeView();
    
    if (viewOrTransition && typeof viewOrTransition !== 'string') {
      newActiveView = viewOrTransition;
      
      var isOnStack = this.getView(newActiveView) !== null;
  
      if (isOnStack) {
        while (this.activeView() !== newActiveView) {
          views.pop();
        }
      }
    } else {
      if (viewOrTransition) {
        transition = viewOrTransition;
      }
      
      views.pop();
      newActiveView = this.activeView();
    }
    
    if (!transition) {
      transition = newActiveView.lastTransition;
    }
    
    if (views.length === 1) {
      $backButton.removeClass('active');
    }
    
    var $activeViewElement = $(activeView.element);
    var $newActiveViewElement = $(newActiveView.element);
    
    if (isGecko) {
      if (transition === 'flipHorizontal') {
        transition = 'slideHorizontal';
      }

      else if (transition === 'flipVertical') {
        transition = 'slideVertical';
      }
      
      else if (transition === 'cardSwap') {
        transition = 'zoom';
      }
    }
    
    $activeViewElement.addClass(transition + ' pop');
    $newActiveViewElement.addClass(transition + ' pop');
    
    $newActiveViewElement.bind('webkitTransitionEnd oTransitionEnd transitionend', this.handleEvent);
    
    setTimeout(function() {
      if (!isGecko) {
        $(document.documentElement).addClass('transition');
      }
      
      $activeViewElement.addClass('transition');
      $newActiveViewElement.addClass('transition');
    }, 100);
  }
};

Pushpop.View = function(elementOrHref) {
  var $element;
  
  if (typeof elementOrHref === 'string') {
    var isHash = elementOrHref.charAt(0) === '#';
    
    // Target view is a <div/>.
    if (isHash) {
      $element = $(elementOrHref);
    }
    
    // Target view is a new <iframe/>.
    else {
      $element = $('<iframe class="view" src="' + elementOrHref + '"/>');
      $(document.body).append($element);
    }
    
    this.href = elementOrHref;
  }
  
  else if (elementOrHref.hasClass('view')) {
    $element = $(elementOrHref);
    
    // Target view is a <div/>.
    if ($element.is('div')) {
      this.href = '#' + $element.attr('id');
    }
    
    // Target view is a new <iframe/>.
    else {
      this.href = $element.attr('src');
    }
  }
  
  if ($element && $element.size() === 1) {
    $element.data('view', this);
    this.element = $element.get(0);
  }
};

Pushpop.View.prototype = {
  element: null,
  isRoot: false,
  href: '',
  scrollX: 0,
  scrollY: 0,
  lastTransition: 'slideHorizontal'
};

Pushpop.TableView = function(element) {
  var $element = $(element);
  var $body = $(document.body);
  
  if ($element.size() === 1) {
    $element.data('tableview', this);
    
    // Required to enable :active pseudo-state to occur.
    $element.bind('touchstart', function() {});
    
    // Set up picker cells.
    $element.children('li.picker-cell').each(function(index, element) {
      var $element = $(element);
      var $pickerTableView = $element.children('ul.tableview:first');
      
      if ($pickerTableView.size() !== 1) return;
      
      var name = $element.attr('data-name');
      var defaultText = $element.attr('data-default-text');
      var defaultValue = $element.attr('data-default-value') || defaultText;
      
      var $view = $('<div class="view"/>');
      var $span = $('<span>' + defaultText + '</span>');
      var $input = $('<input type="hidden" name="' + name + '" value="' + defaultValue + '"/>');
      
      $view.append($pickerTableView);
      $body.append($view);
      $element.append($span).append($input);
      
      $pickerTableView.delegate('li', 'click', function(evt) {
        var $this = $(this);
        
        if ($this.hasClass('header')) return;
        
        var text = $this.text();
        var value = $this.attr('data-value') || text;
        
        $span.html(text);
        $input.val(value);
        
        Pushpop.pop();
      });
      
      $element.data('picker-view', new Pushpop.View($view));
      $element.data('picker-selection', $span.get(0));
    });
    
    $element.delegate('li.picker-cell', 'click', function(evt) {
      var $this = $(this);
      var pickerView = $this.data('picker-view');
      
      Pushpop.push(pickerView, 'slideHorizontal');
    });
    
    this.element = $element.get(0);
  }
};

Pushpop.TableView.prototype = {
  element: null
};

$(function() {
  
  var $topbar = Pushpop.$topbar = $('.topbar');
  var $backButton = Pushpop.$backButton = $('<a class="btn pop pull-left" href="#">Back</a>');
  $topbar.find('.container').prepend($backButton);
  
  // Set the first <div class="view"/> child of the document body as the root View.
  Pushpop.push(new Pushpop.View($('body > div.view:first').addClass('active')));
  
  // Attach all Views as immediate children of the document body.
  var $body = $(document.body);
  
  $('.view').each(function(index, element) {
    $body.append(element);
  });
  
  // Initialize all TableViews.
  $('.tableview').each(function(index, element) {
    var tableView = new Pushpop.TableView(element);
  });
  
  // Attach a click event handler to all anchor links set up for push or pop.
  $('a.push, a.pop').live('click', function(evt) {
    var $this = $(this);
    var href = $this.attr('href');
    var isPop = $this.hasClass('pop');
    var transition;
    
    if ($this.hasClass('slideHorizontal')) {
      transition = 'slideHorizontal';
    }
    
    else if ($this.hasClass('slideVertical')) {
      transition = 'slideVertical';
    }
    
    else if ($this.hasClass('flipHorizontal')) {
      transition = 'flipHorizontal';
    }
    
    else if ($this.hasClass('flipVertical')) {
      transition = 'flipVertical';
    }
    
    else if ($this.hasClass('cardSwap')) {
      transition = 'cardSwap';
    }
    
    else if ($this.hasClass('crossFade')) {
      transition = 'crossFade';
    }
    
    else if ($this.hasClass('zoom')) {
      transition = 'zoom';
    }
    
    if (isPop && href === '#') {
      Pushpop.pop(transition);
    }

    else {
      var view = Pushpop.getView(href) || new Pushpop.View(href);
  
      if (isPop) {
        Pushpop.pop(view, transition);
      }
  
      else {
        Pushpop.push(view, transition);
      }
    }
    
    evt.preventDefault();
  });
  
});
