;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new TableView.
  @param {HTMLUListElement} element The UL element to initialize as a new TableView.
  @constructor
*/
Pushpop.TableView = function TableView(element) {
  if (!element) return;
  
  var $element = this.$element = $(element);
  var element = this.element = $element[0];
  
  var tableView = element.tableView;
  if (tableView) return tableView;
  
  element.tableView = this;
  
  var scrollViewElement = $element.parents('.sk-scroll-view')[0];
  if (!scrollViewElement) return;
  
  var self = this;
  
  var reusableCells = this._reusableCells = {};
  var visibleCells = this._visibleCells = [];
  var selectedRowIndexes = this._selectedRowIndexes = [];
  
  var scrollView = this.scrollView = scrollViewElement.scrollView;
  
  var containsSearchBar = $element.attr('data-contains-search-bar') || 'false';
  containsSearchBar = containsSearchBar !== 'false';
  
  var searchBar = null;
  if (containsSearchBar) searchBar = this._searchBar = new Pushpop.TableViewSearchBar(this);
  
  var numberOfBufferedCells = this._numberOfBufferedCells;
  var selectionTimeoutDuration = this._selectionTimeoutDuration;
  var lastOffset = -scrollView.y;
  var topMargin = window.parseInt($element.css('margin-top'), 10);
  
  // Render table view cells "virtually" when the view is scrolled.
  scrollView.$element.bind(SKScrollEventType.ScrollChange, function(evt) {
    var offset = -scrollView.y;
    if (offset < 0) return;
    
    var firstCellElement = $element.children('li:first-child')[0];
    var lastCellElement = $element.children('li:last-child')[0];
    if (!firstCellElement || !lastCellElement || firstCellElement === lastCellElement) return;
    
    var dataSource = self.getDataSource();
    var rowHeight = self.getRowHeight();
    var numberOfRows = self._numberOfRows;
    var visibleCellCount = self.getCalculatedNumberOfVisibleCells();
    var selectedRowIndex = self.getIndexForSelectedRow();
    
    var firstCell = firstCellElement.tableViewCell;
    var firstCellIndex = firstCell.getIndex();
    var lastCellIndex = firstCellIndex + visibleCellCount - 1;
    
    // Manually calculate offset instead of calling .offset().
    var margin = scrollView.getMargin();
    var firstCellOffset = margin.top - offset;
    var lastCellOffset = firstCellOffset + (visibleCellCount * rowHeight);
    var delta = offset - lastOffset;
    var visibleHeight = self.getVisibleHeight();
    
    lastOffset = offset;
    
    var newMarginTopDelta = 0;
    var newMarginBottomDelta = 0;
    
    // Handle scrolling when swiping up (scrolling towards the bottom).
    if (delta > 0 && lastCellIndex + 1 < numberOfRows && firstCellOffset < 0 - (rowHeight * numberOfBufferedCells)) {
      $element.children('li:nth-child(-n+' + numberOfBufferedCells + ')').each(function(index, element) {
        var newCellIndex = lastCellIndex + index + 1;
        if (newCellIndex >= numberOfRows) return;
        
        var cell = element.tableViewCell;
        cell.prepareForReuse();
        
        var newCell = dataSource.getCellForRowAtIndex(self, newCellIndex);
        if (self.isRowSelectedAtIndex(newCellIndex)) newCell.setSelected(true);
        $element.append(newCell.$element);
        
        newMarginTopDelta += rowHeight;
        newMarginBottomDelta -= rowHeight;
      });
      
      scrollView.setMargin({
        top: margin.top + newMarginTopDelta,
        bottom: margin.bottom + newMarginBottomDelta
      });
    }
    
    // Handle scrolling when swiping down (scrolling towards the top).
    else if (delta < 0 && firstCellIndex - 1 >= 0 && lastCellOffset > visibleHeight + (rowHeight * numberOfBufferedCells)) {
      $element.children('li:nth-child(n+' + (visibleCellCount - numberOfBufferedCells + 1) + ')').each(function(index, element) {
        var newCellIndex = firstCellIndex - index - 1;
        if (newCellIndex < 0) return;
        
        var cell = element.tableViewCell;
        cell.prepareForReuse();
        
        var newCell = dataSource.getCellForRowAtIndex(self, newCellIndex);
        if (self.isRowSelectedAtIndex(newCellIndex)) newCell.setSelected(true);
        $element.prepend(newCell.$element);
        
        newMarginTopDelta -= rowHeight;
        newMarginBottomDelta += rowHeight;
      });
      
      scrollView.setMargin({
        top: margin.top + newMarginTopDelta,
        bottom: margin.bottom + newMarginBottomDelta
      });
    }
  });
  
  // Handle case when table view is scrolled to the top (e.g.: tapping top of navigation bar).
  scrollView.$element.bind(SKScrollEventType.WillScrollToTop, function(evt) {    
    var firstCellElement = $element.children('li:first-child')[0];
    if (firstCellElement) firstCellElement.tableViewCell.setIndex(0);
  }).bind(SKScrollEventType.DidScrollToTop, function(evt) { self.reloadData(); });
  
  // Handle mouse/touch events to allow the user to tap accessory buttons.
  var isPendingAccessoryButtonTap = false;

  $element.delegate('span.pp-table-view-cell-accessory', !!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    isPendingAccessoryButtonTap = true;
  });
  
  $element.delegate('span.pp-table-view-cell-accessory', !!('ontouchmove' in window) ? 'touchmove' : 'mousemove', function(evt) {
    if (!isPendingAccessoryButtonTap) return;
    isPendingAccessoryButtonTap = false;
  });
  
  $element.delegate('span.pp-table-view-cell-accessory', !!('ontouchend' in window) ? 'touchend' : 'mouseup', function(evt) {
    if (!isPendingAccessoryButtonTap) return;
    isPendingAccessoryButtonTap = false;
    
    var tableViewCell = $(this).parent()[0].tableViewCell;
    if (!tableViewCell) return;
    
    $element.trigger($.Event(Pushpop.TableView.EventType.AccessoryButtonTappedForRowWithIndex, {
      tableView: self,
      tableViewCell: tableViewCell,
      index: tableViewCell.getIndex()
    }));
  });
  
  // Handle mouse/touch events to allow the user to tap editing accessory buttons.
  var isPendingEditingAccessoryButtonTap = false;

  $element.delegate('span.pp-table-view-cell-editing-accessory', !!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    isPendingEditingAccessoryButtonTap = true;
  });
  
  $element.delegate('span.pp-table-view-cell-editing-accessory', !!('ontouchmove' in window) ? 'touchmove' : 'mousemove', function(evt) {
    if (!isPendingEditingAccessoryButtonTap) return;
    isPendingEditingAccessoryButtonTap = false;
  });
  
  $element.delegate('span.pp-table-view-cell-editing-accessory', !!('ontouchend' in window) ? 'touchend' : 'mouseup', function(evt) {
    if (!isPendingEditingAccessoryButtonTap) return;
    isPendingEditingAccessoryButtonTap = false;
    
    var tableViewCell = $(this).parent()[0].tableViewCell;
    if (!tableViewCell) return;
    
    $element.trigger($.Event(Pushpop.TableView.EventType.EditingAccessoryButtonTappedForRowWithIndex, {
      tableView: self,
      tableViewCell: tableViewCell,
      index: tableViewCell.getIndex()
    }));
  });
  
  // Handle mouse/touch events to allow the user to make row selections.
  var isPendingSelection = false, selectionTimeout = null;

  $element.delegate('li', !!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    
    // Don't allow row to be selected if an accessory button is pending a tap.
    if (isPendingAccessoryButtonTap || isPendingEditingAccessoryButtonTap) return;
    
    isPendingSelection = true;
    
    var tableViewCell = this.tableViewCell;
    
    selectionTimeout = window.setTimeout(function() {
      if (!isPendingSelection) return;
      isPendingSelection = false;
      
      self.selectRowAtIndex(tableViewCell.getIndex());
    }, selectionTimeoutDuration);
  });
  
  $element.bind(!!('ontouchmove' in window) ? 'touchmove' : 'mousemove', function(evt) {
    if (!isPendingSelection) return;
    isPendingSelection = false;
    
    window.clearTimeout(selectionTimeout);
  });
  
  $element.delegate('li', !!('ontouchend' in window) ? 'touchend' : 'mouseup', function(evt) {
    if (!isPendingSelection) return;
    isPendingSelection = false;
    
    window.clearTimeout(selectionTimeout);
    self.selectRowAtIndex(this.tableViewCell.getIndex());
  });
  
  // Create a new data source from a data set URL.
  var dataSetUrl = $element.attr('data-set-url');
  if (dataSetUrl) {
    $.getJSON(dataSetUrl, function(dataSet) {
      $element.html(null);
      self.setDataSource(new Pushpop.TableViewDataSource(dataSet));
    });
  }
  
  // Create a new data source from existing <li/> elements.
  else {
    (function(self, $element) {
      var dataSet = [];
      
      var dashAlpha = /-([a-z]|[0-9])/ig;
      var camelCase = function(string) { return string.replace(dashAlpha, function(all, letter) { return (letter + '').toUpperCase(); }); };
      
      $element.children('li').each(function(index, element) {
        var data = { title: $(element).html() };
        
        var attributes = element.attributes;
        var attribute, attributeName;
        for (var i = 0, length = attributes.length; i < length; i++) {
          attribute = attributes[i];
          attributeName = attribute.name;
          
          if (attributeName.indexOf('data-') === 0) data[camelCase(attributeName.substring(5))] = attribute.value;
        }
        
        if (!data['reuseIdentifier']) data.reuseIdentifier = 'pp-table-view-cell-default';
      
        dataSet.push(data);
      });
      
      $element.html(null);
      self.setDataSource(new Pushpop.TableViewDataSource(dataSet));
    })(self, $element);
  }
};

/**
  Event types for Pushpop.TableView.
*/
Pushpop.TableView.EventType = {
  DidSelectRowAtIndex: 'Pushpop:TableView:DidSelectRowAtIndex',
  DidDeselectRowAtIndex: 'Pushpop:TableView:DidDeselectRowAtIndex',
  AccessoryButtonTappedForRowWithIndex: 'Pushpop:TableView:AccessoryButtonTappedForRowWithIndex',
  EditingAccessoryButtonTappedForRowWithIndex: 'Pushpop:TableView:EditingAccessoryButtonTappedForRowWithIndex'
};

Pushpop.TableView._reusableCellPrototypes = {};
Pushpop.TableView.getReusableCellPrototypes = function() {
  var reusableCellPrototypes = Pushpop.TableView._reusableCellPrototypes, items = [];
  for (var reusableCellPrototype in reusableCellPrototypes) items.push(reusableCellPrototypes[reusableCellPrototype]);
  return items;
};

Pushpop.TableView.getReusableCellPrototypeWithIdentifier = function(reuseIdentifier) { return Pushpop.TableView._reusableCellPrototypes[reuseIdentifier]; };

Pushpop.TableView.registerReusableCellPrototype = function(cellPrototype) {
  if (!cellPrototype) return;
  
  var reuseIdentifier = cellPrototype.getReuseIdentifier();
  if (!reuseIdentifier) return;
  
  Pushpop.TableView._reusableCellPrototypes[reuseIdentifier] = cellPrototype;
};

Pushpop.TableView.prototype = {
  constructor: Pushpop.TableView,
  
  element: null,
  $element: null,
  
  scrollView: null,
  
  _numberOfBufferedCells: 16,
  _numberOfRows: 0,
  _selectionTimeoutDuration: 250,
  
  _visibleHeight: 0,
  
  getVisibleHeight: function() { return (this._visibleHeight = (this._visibleHeight || this.scrollView.getSize().height)); },
  
  /**
    Returns the view that contains this table view.
    @description NOTE: If this table view is not contained within a view, this method will return null.
    @type Pushpop.View
  */
  getView: function() {
    var parents = this.$element.parents();
    var view;
    for (var i = 0, length = parents.length; i < length; i++) if (view = parents[i].view) return view;
    return null;
  },
  
  /**
    Returns the view stack that contains this table view.
    @description NOTE: If this table view is not contained within a view stack, this method will return null.
    @type Pushpop.ViewStack
  */
  getViewStack: function() {
    var parents = this.$element.parents();
    var viewStack;
    for (var i = 0, length = parents.length; i < length; i++) if (viewStack = parents[i].viewStack) return viewStack;
    return null;
  },
  
  _reusableCells: null,
  
  /**
    Returns an object containing arrays of reusable cells that are not currently
    visible.
    @description The object contains an array property for each "reuse identifier"
    in use. For example, if there are two types of TableViewCells in this TableView
    with two different reuse identifiers (cellType1 and cellType2), this object
    would contain two arrays that can be accessed using square bracket notation
    like this: reusableCells['cellType1'] or reusableCells['cellType2']
    @type Object
  */
  getReusableCells: function() { return this._reusableCells; },
  
  /**
    Returns a new or recycled TableViewCell with the specified reuse identifier.
    @description This method will first attempt to reuse a recycled TableViewCell
    with the specified reuse identifier. If no recycled TableViewCells with that
    reuse identifier are available, a new one will be instantiated and returned.
    The TableViewCell that is returned is always added to the |visibleCells| array.
    @type Pushpop.TableViewCell
  */
  dequeueReusableCellWithIdentifier: function(reuseIdentifier) {
    var visibleCells = this.getVisibleCells();
    var reusableCells = this.getReusableCells();
    reusableCells = reusableCells[reuseIdentifier] || (reusableCells[reuseIdentifier] = []);
    
    var cell = null, cellPrototype = null;
    
    if (reusableCells.length > 0) {
      cell = reusableCells.pop();
    } else {
      cellPrototype = Pushpop.TableView.getReusableCellPrototypeWithIdentifier(reuseIdentifier);
      cell = (cellPrototype) ? new cellPrototype.constructor(reuseIdentifier) : new Pushpop.TableViewCell(reuseIdentifier);
    }
    
    visibleCells.push(cell);
    cell.tableView = this;
    
    return cell;
  },
  
  _visibleCells: null,
  
  /**
    Returns an array of all of the currently visible TableViewCells.
    @type Array
  */
  getVisibleCells: function() { return this._visibleCells; },
  
  /**
    Returns the calculated number of how many cells should currently be visible.
    @description NOTE: There may be moments in time where this calculated number
    differs from the number of cells in the array returned from getVisibleCells()
    (e.g.: Immediately following an orientation change or window resize).
    @type Number
  */
  getCalculatedNumberOfVisibleCells: function() { return Math.ceil(this.getVisibleHeight() / this.getRowHeight()) + this._numberOfBufferedCells },
  
  _selectedRowIndexes: null,
  
  /**
    Returns the index in for the first selected row.
    @description NOTE: This is an index of a row in the data source, NOT an index
    of a cell in the DOM. If no rows are selected, this method will return -1.
    @type Number
  */
  getIndexForSelectedRow: function() {
    var selectedRowIndexes = this._selectedRowIndexes;
    return (selectedRowIndexes && selectedRowIndexes.length > 0) ? selectedRowIndexes[0] : -1;
  },
  
  /**
    Returns the indexes in for the selected rows.
    @description NOTE: The array contains indexes of rows in the data source, NOT
    indexes of cells in the DOM. If no rows are selected, this array will be empty.
    @type Array
  */
  getIndexesForSelectedRows: function() {
    return this._selectedRowIndexes;
  },
  
  /**
    Determines if the specified index is a selected row.
    @description NOTE: This is an index of a row in the data source, NOT an index
    of a cell in the DOM.
    @type Boolean
  */
  isRowSelectedAtIndex: function(index) {
    var selectedRowIndexes = this._selectedRowIndexes;
    for (var i = 0, length = selectedRowIndexes.length; i < length; i++) if (selectedRowIndexes[i] === index) return true;
    return false;
  },
  
  /**
    Selects the row at the specified index and triggers the DidSelectRowAtIndex event on
    this and all parent table view elements.
    @description NOTE: If the row contains a child data source, this method will automatically
    push a dynamic table view using the child data source. The DidSelectRowAtIndex event contains
    a flag |hasChildDataSource| to indicate whether or not a new dynamic table view was pushed
    prior to the event.
    @param {Number} index The index of a row in the data source to select.
    @param {Boolean} [animated] A flag indicating if the selection should be animated
    if the row is currently visible.
  */
  selectRowAtIndex: function(index, animated) {
    var dataSource = this.getDataSource();
    var shouldSelectRowAtIndex = dataSource.shouldSelectRowAtIndex(index);
    if (!shouldSelectRowAtIndex) return;
    
    this.deselectAllRows();
    
    var $element = this.$element;
    this._selectedRowIndexes.push(index);
    
    var tableViewCell, $cells = this.$element.children();
    for (var i = 0, length = $cells.length; i < length; i++) {
      tableViewCell = $cells[i].tableViewCell;
      if (tableViewCell.getIndex() === index) {
        tableViewCell.setSelected(true);
        break;
      }
    }
    
    // If this row contains a child data source, automatically push a new dynamic table view with it.
    if (dataSource.rowHasChildDataSourceAtIndex(index)) {
      var childDataSource = dataSource.getChildDataSourceForRowAtIndex(index);
      var viewStack = this.getViewStack();
      var self = this;
      
      if (childDataSource && viewStack) {
        viewStack.pushNewTableView(function(childTableView) {
          if (self.getSearchBar()) childTableView.setSearchBar(new Pushpop.TableViewSearchBar(childTableView));
          childTableView.setDataSource(childDataSource);
          childTableView.setParentTableView(self);
        });
        
        // Trigger the DidSelectRowAtIndex event on this and all parent table view elements.
        this.triggerEventOnParentTableViews($.Event(Pushpop.TableView.EventType.DidSelectRowAtIndex, {
          tableView: this,
          index: index,
          hasChildDataSource: true
        }), true);
        
        return;
      }
    }
    
    // Trigger the DidSelectRowAtIndex event on this and all parent table view elements.
    this.triggerEventOnParentTableViews($.Event(Pushpop.TableView.EventType.DidSelectRowAtIndex, {
      tableView: this,
      index: index,
      hasChildDataSource: false
    }), true);
  },
  
  /**
    De-selects the row at the specified index and optionally animates the de-selection
    if the row is currently visible.
    @description NOTE: This method will not modify any other existing selections.
    @param {Number} index The index of a row in the data source to de-select.
    @param {Boolean} [animated] A flag indicating if the de-selection should be
    animated if the row is currently visible.
  */
  deselectRowAtIndex: function(index, animated) {
    var $element = this.$element;
    var selectedRowIndexes = this._selectedRowIndexes;
    for (var i = 0, length = selectedRowIndexes.length; i < length; i++) {
      if (selectedRowIndexes[i] === index) {
        selectedRowIndexes.splice(i, 1);
        break;
      }
    }
    
    var tableViewCell, $selectedCells = $element.children('.pp-table-view-selected-state');
    for (var i = 0, length = $cells.length; i < length; i++) {
      tableViewCell = $cells[i].tableViewCell;
      if (tableViewCell.getIndex() === index) {
        tableViewCell.setSelected(false);
        break;
      }
    }
    
    $element.trigger($.Event(Pushpop.TableView.EventType.DidDeselectRowAtIndex, {
      tableView: this,
      index: index
    }));
  },
  
  /**
    De-selects all rows in the table.
  */
  deselectAllRows: function() {
    var $element = this.$element;
    var selectedRowIndexes = this._selectedRowIndexes;
    for (var i = 0, length = selectedRowIndexes.length; i < length; i++) {
      $element.trigger($.Event(Pushpop.TableView.EventType.DidDeselectRowAtIndex, {
        tableView: this,
        index: selectedRowIndexes[i]
      }));
    }
    
    selectedRowIndexes.length = 0;
    
    $element.children('.pp-table-view-selected-state').each(function(index, element) {
      element.tableViewCell.setSelected(false);
    });
  },
  
  /**
    Resets the scroll position back to the top of the TableView.
  */
  resetScrollView: function() {
    var numberOfRows = this._numberOfRows;
    var visibleCellCount = Math.min(this.getCalculatedNumberOfVisibleCells(), numberOfRows);
    var hiddenCellCount = numberOfRows - visibleCellCount;
    
    var scrollView = this.scrollView;
    
    // Scroll to the top of the table view without animating.
    scrollView.setContentOffset({ x: 0, y: 0 }, false);
    
    // Set the scroll view margin.
    scrollView.setMargin({
      top: 0,
      bottom: hiddenCellCount * this.getRowHeight()
    });
  },
  
  /**
    Reloads the data source for the TableView and resets the scroll position back
    to the top of the TableView.
    @description Typically this method is called if/when the data source changes or
    if there is a change in the search string.
  */
  reloadData: function() {
    var $element = this.$element;    
    
    var dataSource = this.getDataSource();
    var visibleCells = this.getVisibleCells();
    
    var i, length, visibleCellsToReuse = [];
    for (i = 0, length = visibleCells.length; i < length; i++) visibleCellsToReuse.push(visibleCells[i]);
    for (i = 0, length = visibleCellsToReuse.length; i < length; i++) visibleCellsToReuse[i].prepareForReuse();
    
    var numberOfRows = this._numberOfRows = dataSource.getNumberOfRows();
    var visibleCellCount = Math.min(this.getCalculatedNumberOfVisibleCells(), numberOfRows);
    var hiddenCellCount = numberOfRows - visibleCellCount;
    
    for (i = 0; i < visibleCellCount; i++) {
      var cell = dataSource.getCellForRowAtIndex(this, i);      
      $element.append(cell.$element);
    }
    
    this.resetScrollView();
  },
  
  _parentTableView: null,
  
  /**
    Returns the parent table view if this table view has one.
    @type Pushpop.TableView
  */
  getParentTableView: function() { return this._parentTableView; },
  
  /**
    Sets the parent table view for this table view.
    @description NOTE: To remove this table view from its parent, call this method
    and pass in a |null| value.
  */
  setParentTableView: function(parentTableView) { this._parentTableView = parentTableView; },
  
  /**
    Traverses the parent table views up the chain until it encounters a table view
    with no parent then returns an array of Pushpop.TableView objects.
    @type Array
  */
  getParentTableViews: function() {
    var parentTableViews = [];
    var currentParentTableView = this.getParentTableView();
    
    while (currentParentTableView) {
      parentTableViews.push(currentParentTableView);
      currentParentTableView = currentParentTableView.getParentTableView();
    }
    
    return parentTableViews;
  },
  
  /**
    Triggers the specified event on the parent table view elements and optionally
    also on this own table view's element.
    @param {$.Event|String} evt The event to be triggered on the table view element(s).
    @param {Boolean} [includeSelf] A flag indicating whether or not the event should
    also be triggered on this table view's element.
  */
  triggerEventOnParentTableViews: function(evt, includeSelf) {
    var parentTableViews = this.getParentTableViews();
    for (var i = 0, length = parentTableViews.length; i < length; i++) parentTableViews[i].$element.trigger(evt);
    if (includeSelf) this.$element.trigger(evt);
  },
  
  _searchBar: null,
  
  /**
    Returns the TableViewSearchBar for this TableView if it contains one.
    @type Pushpop.TableViewSearchBar
  */
  getSearchBar: function() { return this._searchBar; },
  
  /**
    Sets a TableViewSearchBar for this TableView.
    @param {Pushpop.TableViewSearchBar} searchBar The TableViewSearchBar to attach
    to this TableView.
  */
  setSearchBar: function(searchBar) { this._searchBar = searchBar; },
  
  _dataSource: null,
  
  /**
    Returns the TableViewDataSource for this TableView.
    @type Pushpop.TableViewDataSource
  */
  getDataSource: function() { return this._dataSource; },
  
  /**
    Sets a TableViewDataSource for this TableView and reloads the data.
    @param {Pushpop.TableViewDataSource} dataSource The TableViewDataSource to bind
    to this TableView.
  */
  setDataSource: function(dataSource) {
    this._dataSource = dataSource;
    dataSource.setTableView(this);
    this.reloadData();
  },
  
  _rowHeight: 44,
  
  /**
    Returns the fixed row height for this TableView.
    @type Number
  */
  getRowHeight: function() { return this._rowHeight; },
  
  /**
    Sets the fixed row height for this TableView and reloads the data.
    @param {Number} rowHeight The fixed row height for this TableView to use
    when drawing TableViewCells.
  */
  setRowHeight: function(rowHeight) {
    this._rowHeight = rowHeight;
    this.reloadData();
  },
  
  _editing: false,
  
  /**
    Determines if this TableView is in editing mode.
    @type Boolean
  */
  getEditing: function() { return this._editing; },
  
  /**
    Used for setting the table view in or out of editing mode.
    @param {Boolean} editing A flag indicating if the TableView should be in editing mode.
    @param {Boolean} [animated] An optional flag indicating if the transition in or out of
    editing mode should be animated (default: true).
  */
  setEditing: function(editing, animated) {
    if (this._editing = editing) {
      this.$element.addClass('pp-table-view-editing');
    } else {
      this.$element.removeClass('pp-table-view-editing');
    }
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
  Creates a new data source for a TableView.
  @param {Array} [dataSet] An optional array of data to initialize a default data source.
  @param {Array} [dataSet.id] The unique identifier for a specific record.
  @param {Array} [dataSet.value] The (sometimes) hidden value for a specific record.
  @param {Array} [dataSet.title] The title to be displayed in a TableViewCell for a specific record.
  @param {String} [defaultReuseIdentifier] The optional reuse identifier to be used for rows that do
  not specify a specific reuse identifier.
  @constructor
*/
Pushpop.TableViewDataSource = function TableViewDataSource(dataSet, defaultReuseIdentifier) {
  if (!dataSet || !(dataSet instanceof Array)) return;
  
  this.setDataSet(dataSet);
  this.setDefaultReuseIdentifier(defaultReuseIdentifier || this.getDefaultReuseIdentifier());
};

Pushpop.TableViewDataSource.prototype = {
  constructor: Pushpop.TableViewDataSource,
  
  /**
    Returns the number of rows provided by this data source.
    @description NOTE: This is the default implementation and should be overridden for data
    sources that are not driven directly from an in-memory data set.
    @type Number
  */
  getNumberOfRows: function() { return this.getNumberOfFilteredItems(); },
  
  /**
    Returns a TableViewCell for the specified index.
    @description NOTE: This is the default implementation and should be overridden for data
    sources that are not driven directly from an in-memory data set.
    @param {Pushpop.TableView} tableView The TableView the TableViewCell should be returned for.
    @param {Number} index The index of the data to be used when populating the TableViewCell.
    @type Pushpop.TableViewCell
  */
  getCellForRowAtIndex: function(tableView, index) {
    var item = this.getFilteredItemAtIndex(index);
    var reuseIdentifier = item.reuseIdentifier || this.getDefaultReuseIdentifier();
    var cell = tableView.dequeueReusableCellWithIdentifier(reuseIdentifier);
    
    cell.setIndex(index);
    cell.setAccessoryType(item.accessoryType);
    cell.setEditingAccessoryType(item.editingAccessoryType);
    cell.setData(item);
    
    return cell;
  },
  
  /**
    Returns an array containing the key/value pairs for all "values" contained within the data
    source. This is typically used for retrieving form fields stored within a table view and
    behaves similarly to jQuery's .serializeArray() function.
    @param {String} [keyFieldName] The name of the field in the data source containing the
    values' keys. If not specified, the default value is 'name'.
    @param {String} [valueFieldName] The name of the field in the data source containing the
    values' values. If not specified, the default value is 'value.
    @type Array
  */
  getValuesArray: function(keyFieldName, valueFieldName) {
    var keyFieldName = keyFieldName || 'name';
    var valueFieldName = valueFieldName || 'value';
    
    var numberOfItems = this.getNumberOfItems();
    var valuesArray = [];
    var item, name, value;
    
    for (var i = 0; i < numberOfItems; i++) {
      item = this.getItemAtIndex(i);
      name = item[keyFieldName];
      value = item[valueFieldName];
      
      if (value !== undefined) valuesArray.push({
        name: item[keyFieldName] || keyFieldName,
        value: item[valueFieldName]
      });
    }
    
    return valuesArray;
  },
  
  /**
    Returns an object containing the data for all "values" contained within the data source.
    This is typically used for retrieving form fields stored within a table view.
    @description NOTE: If a field name occurs more than once, its values will be put into an
    array.
    @param {String} [keyFieldName] The name of the field in the data source containing the
    values' keys. If not specified, the default value is 'name'.
    @param {String} [valueFieldName] The name of the field in the data source containing the
    values' values. If not specified, the default value is 'value.
    @type Object
  */
  getValuesObject: function(keyFieldName, valueFieldName) {
    var valuesArray = this.getValuesArray(keyFieldName, valueFieldName);
    var valuesObject = {};
    
    var value;
    for (var i = 0, length = valuesArray.length; i < length; i++) {
      value = valuesArray[i];
      
      if (valuesObject[value.name] !== undefined) {
        if (!valuesObject[value.name].push) valuesObject[value.name] = [valuesObject[value.name]];
        valuesObject[value.name].push(value.value);
      } else {
        valuesObject[value.name] = value.value; 
      }
    }
    
    return valuesObject;
  },
  
  clearAllValues: function(valueFieldName) {
    var valueFieldName = valueFieldName || 'value';
    
    var numberOfItems = this.getNumberOfItems();
    var item, value;
    
    for (var i = 0; i < numberOfItems; i++) {
      item = this.getItemAtIndex(i);
      value = item[valueFieldName];
      
      if (value !== undefined) item[valueFieldName] = null;
    }
    
    var tableView = this.getTableView();
    if (tableView) tableView.reloadData();
  },
  
  /**
    Determines if the table should be reloaded following a change in the search string.
    @description The default implementation assumes that the data set is fully loaded into
    memory and executes the current filter function against each item in the data set. If the
    filtered data set has changed since the last reload, it will return |true| which will force
    the associated TableViewSearchBar to reload the data for the TableView. In a custom data
    source that does not use an in-memory data set (e.g.: WebSQL or HTML5 LocalStorage), it is
    recommended to override this method to perform any necessary queries asynchronously and
    immediately return |false|. Once the asynchronous queries have completed, the application
    should then manually call .reloadData() on the TableView to force an update (See the WebSQL
    demo for an example on this implementation).
    @param {String} searchString The search string to be used for matching items in the data set.
    @param {Boolean} [isCaseSensitive] An optional boolean flag for forcing a case-sensitive search.
    @type Boolean
  */
  shouldReloadTableForSearchString: function(searchString, isCaseSensitive) {
    var dataSet = this.getDataSet();
    if (!dataSet) return false;
    
    var filterFunction = this.getFilterFunction();
    var tableView = this.getTableView();
    
    if (!filterFunction || typeof filterFunction !== 'function' || !searchString) {
      this._lastSearchString = null;
      
      if (this._filteredDataSet !== dataSet) {
        this._filteredDataSet = dataSet;
        return true;
      }
      
      return false;
    }
    
    var filteredDataSet = [];
    var regExp = new RegExp(searchString + '+', (!isCaseSensitive ? 'i' : '') + 'm');
    var item, i, length;
    
    // The search string is a continuation of the last search string (e.g.: 'ab' -> 'abc').
    if (searchString.indexOf(this._lastSearchString) === 0) {
      
      // Search the previous filtered data set instead of the whole data set.
      var lastFilteredDataSet = this._filteredDataSet;
      for (i = 0, length = lastFilteredDataSet.length; i < length; i++) if (filterFunction(regExp, item = lastFilteredDataSet[i])) filteredDataSet.push(item);
    }
    
    // The search string is NOT a contination of the last search string (e.g.: 'abc' -> 'ab').
    else {
      
      // Search the whole data set.
      for (i = 0, length = dataSet.length; i < length; i++) if (filterFunction(regExp, item = dataSet[i])) filteredDataSet.push(item);
    }
    
    this._filteredDataSet = filteredDataSet;
    this._lastSearchString = searchString;
    return true;
  },
  
  _lastSearchString: null,
  
  /**
    Returns a flag indicating whether or not the row at the specified index should be able
    to be selected.
    @description NOTE: This is the default implementation and should be overridden if certain
    rows should not be able to be selected.
    @param {Number} index The index of the row to determine whether or not it should be selectable.
    @type Boolean
  */
  shouldSelectRowAtIndex: function(index) { return true; },
  
  /**
    Returns a flag indicating whether or not the row at the specified index contains a child
    data source. 
    @description NOTE: This is the default implementation and should be overridden for data
    sources that are not driven directly from an in-memory data set. In the default implementation,
    the |dataSourceKey| that is set using the setDataSourceKey() method is used to determine if an
    array of objects exists for that key on the item at the specified index.
    @param {Number} index The index of the row to determine whether or not it contains a child data source.
    @type Boolean
  */
  rowHasChildDataSourceAtIndex: function(index) {
    var key = this.getChildDataSourceKey();
    if (!key) return;
    
    var item = this.getFilteredItemAtIndex(index);
    return (item && item[key] && item[key] instanceof Array);
  },
  
  /**
    Creates and returns a new data source for the row at the specified index if the item at
    that index contains a child data source as determined by the rowHadChildDataSourceAtIndex()
    method.
    @description NOTE: This is the default implementation and should be overridden for data
    sources that are not driven directly from an in-memory data set. In the default implementation,
    the |dataSourceKey| that is set using the setDataSourceKey() method is used to retrieve the
    array of objects for that key on the item at the specified index. The array of child objects are
    then used to create a new data source. The new data source is automatically given the same child
    data source key in order to continue chaining nested data n-levels deep.
    @param {Number} index The index of the row to retrieve a child data source for.
    @type Pushpop.TableViewDataSource
  */
  getChildDataSourceForRowAtIndex: function(index) {
    var key = this.getChildDataSourceKey();
    if (!key) return null;
    
    var item = this.getFilteredItemAtIndex(index);
    var childDataSet = item[key];
    if (!childDataSet) return null;
    
    var childDataSource = new Pushpop.TableViewDataSource(childDataSet, this.getDefaultReuseIdentifier());
    childDataSource.setChildDataSourceKey(key);
    
    return childDataSource;
  },
  
  _tableView: null,
  
  /**
    Returns the TableView this data source is bound to.
    @type Pushpop.TableView
  */
  getTableView: function() { return this._tableView; },
  
  /**
    Sets the TableView this data source should be bound to.
    @param {Pushpop.TableView} tableView The TableView to bind this data source to.
  */
  setTableView: function(tableView) { this._tableView = tableView; },
  
  _defaultReuseIdentifier: 'pp-table-view-cell-default',
  
  /**
    Returns the default reuse identifier that this data source will use when a
    reuse identifier is not specified for a particular item.
    @type String
  */
  getDefaultReuseIdentifier: function() { return this._defaultReuseIdentifier; },
  
  /**
    Sets the default reuse identifier that this data source will use when a
    reuse identifier is not specified for a particular item.
    @param {String} reuseIdentifier The reuse identifier to set as default.
  */
  setDefaultReuseIdentifier: function(reuseIdentifier) { this._defaultReuseIdentifier = reuseIdentifier; },
  
  _dataSet: null,
  
  /**
    Returns the in-memory data set this data source will provide to the table view.
    @description NOTE: This may not be utilized by a custom data source.
    @type Array
  */
  getDataSet: function() { return this._dataSet; },
  
  /**
    Sets the in-memory data set this data source should provide to the table view.
    @description NOTE: This may not be utilized by a custom data source.
    @param {Array} dataSet The set of data that this data source should provide to the table view.
  */
  setDataSet: function(dataSet) {
    this._dataSet = dataSet;
    this.shouldReloadTableForSearchString()
    
    var tableView = this.getTableView();
    if (tableView) tableView.reloadData();
  },
  
  _childDataSourceKey: null,
  
  /**
    Returns a string that specifies a key on this data source's objects that may contain
    an array of data for a child data source.
    @type String
  */
  getChildDataSourceKey: function() { return this._childDataSourceKey; },
  
  /**
    Sets a string that specifies a key on this data source's objects that may contain
    an array of data for a child data source.
    @param {String} childDataSourceKey A string containing a key on this data source's
    objects that may contain a child data source.
  */
  setChildDataSourceKey: function(childDataSourceKey) { this._childDataSourceKey = childDataSourceKey; },
  
  _filteredDataSet: null,
  
  /**
    Returns the filtered in-memory data set this data source will provide to the table view.
    @description NOTE: This may not be utilized by a custom data source.
    @type Array
  */
  getFilteredDataSet: function() { return this._filteredDataSet; },
  
  /**
    Returns the total number of items contained within this data source.
    @description NOTE: This method is not typically used during the table view's rendering
    process. It is intended more for data-centric operations on this data source
    (e.g.: searching, filtering).
    IMPORTANT: When working with a data source that is driven from an in-memory data set,
    this method should ALWAYS be used to determine the length of the complete data set. It is
    NOT RECOMMENDED that the |length| property be accessed on the data set's array directly.
    @type Number
  */
  getNumberOfItems: function() { return this.getDataSet().length; },
  
  /**
    Returns the item at the specified index of the complete data set contained within this
    data source.
    @description NOTE: This method is not typically used during the table view's rendering
    process. It is intended more for data-centric operations on this data source
    (e.g.: searching, filtering).
    IMPORTANT: When working with a data source that is driven from an in-memory data set,
    this method should ALWAYS be used to access elements from the complete data set. It is NOT
    RECOMMENDED that the elements be accessed using "[ ]" notation on the complete data set's
    array directly.
    @param {Number} index The index of the item in the complete data set to retrieve within
    this data source.
    @type Object
  */
  getItemAtIndex: function(index) { return this.getDataSet()[index]; },
  
  /**
    Returns the number of filtered items contained within this data source.
    @description NOTE: This method is called directly by the table view's rendering process.
    It should yield the same result as the getNumberOfRows method in most cases.
    IMPORTANT: When working with a data source that is driven from an in-memory data set,
    this method should ALWAYS be used to determine the length of the filtered data set. It is
    NOT RECOMMENDED that the |length| property be accessed on the filtered data set's array
    directly.
    @type Number
  */
  getNumberOfFilteredItems: function() { return this.getFilteredDataSet().length; },
  
  /**
    Returns the item at the specified index of the filtered data set contained within this
    data source.
    @description NOTE: This method is called directly by the table view's rendering process.
    It should yield the same data that is used by the getCellForRowAtIndex method in most cases.
    IMPORTANT: When working with a data source that is driven from an in-memory data set,
    this method should ALWAYS be used to access elements from the filtered data set. It is NOT
    RECOMMENDED that the elements be accessed using "[ ]" notation on the filtered data set's
    array directly.
    @param {Number} index The index of the item in the filtered data set to retrieve within
    this data source.
    @type Object
  */
  getFilteredItemAtIndex: function(index) { return this.getFilteredDataSet()[index]; },
  
  _filterFunction: function(regExp, item) {
    
    // Default filter function implementation that searches an item's title.
    return regExp.test(item.title);
  },
  
  /**
    Returns the current filter function for searching this TableView.
    @description NOTE: This may not be utilized by a custom data source.
    @type Function
  */
  getFilterFunction: function() { return this._filterFunction; },
  
  /**
    Sets a filter function to be used when searching this TableView.
    @param {Function} filterFunction The filter function to be used when searching this TableView.
    @description The filter function gets called for each item in the data set during a search. A
    valid filter function must take two parameters (regExp, item) and return a Boolean value. The
    |regExp| parameter contains a RegExp object based on the search string to be used to match items
    in the data set. The |item| parameter contains an item from the data set that the search string
    in the RegExp should be tested against. The provided filter function should return a Boolean
    value: |true| if the item should match the search string or |false| if it should be filtered out.
    NOTE: This may not be utilized by a custom data source.
  */
  setFilterFunction: function(filterFunction) { this._filterFunction = filterFunction; }
};

/**
  Creates a new search bar for a TableView.
  @param {Pushpop.TableView} tableView The TableView this search bar should be attached to.
  @constructor
*/
Pushpop.TableViewSearchBar = function TableViewSearchBar(tableView) {
  var $element = this.$element = $('<div class="pp-table-view-search-bar"/>');
  var element = this.element = $element[0];
  
  element.tableViewSearchBar = this;
  
  var self = this;
  
  var $input = this.$input = $('<input type="text" placeholder="Search"/>').appendTo($element);
  var $cancelButton = this.$cancelButton = $('<a class="pp-table-view-search-bar-button" href="#">Cancel</a>').appendTo($element);
  var $clearButton = this.$clearButton = $('<a class="pp-table-view-search-bar-clear-button" href="#"/>').appendTo($element);
  var $overlay = this.$overlay = $('<div class="pp-table-view-search-bar-overlay"/>');
  
  var willFocus = false;
  
  $input.bind('mousedown touchstart', function(evt) {
    if ($input.is(':focus')) {
      evt.stopPropagation();
      return;
    }
    
    evt.preventDefault();
    willFocus = true;
  });
  $input.bind('mousemove touchmove', function(evt) { willFocus = false; });
  $input.bind('mouseup touchend', function(evt) {
    if ($input.is(':focus')) {
      evt.stopPropagation();
      return;
    }
    
    evt.preventDefault();
    if (willFocus) $input.trigger('focus');
  });
  $input.bind('focus', function(evt) {
    if (!willFocus) {
      $input.trigger('blur');
      return false;
    }
    
    willFocus = false;
    self._tableView.resetScrollView();
    
    window.setTimeout(function() {
      $overlay.addClass('pp-active');
      if ($input.val()) $clearButton.addClass('pp-active');
    }, 0);
  });
  $input.bind('blur', function(evt) { $overlay.removeClass('pp-active'); $clearButton.removeClass('pp-active'); });
  $cancelButton.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); evt.preventDefault(); });
  $cancelButton.bind('mouseup touchend', function(evt) { $input.val(null).trigger('keyup').trigger('blur'); });
  $clearButton.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); evt.preventDefault(); });
  $clearButton.bind('mouseup touchend', function(evt) { $input.val(null).trigger('keyup'); });
  $overlay.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); evt.preventDefault(); });
  $overlay.bind('mouseup touchend', function(evt) { $input.trigger('blur'); });
  
  $input.bind('keyup', function(evt) {
    
    // If 'ESC' key was pressed, cancel the search.
    if (evt.keyCode === 27) {
      $cancelButton.trigger('mouseup');
      return;
    }
    
    var searchString = $input.val();
    var tableView = self._tableView;
    
    if (!searchString) {
      $overlay.addClass('pp-active');
      $clearButton.removeClass('pp-active');
    } else {
      $overlay.removeClass('pp-active');
      $clearButton.addClass('pp-active');
    }
    
    if (tableView.getDataSource().shouldReloadTableForSearchString(searchString)) tableView.reloadData();
  });
  
  this.attachToTableView(tableView);
};

Pushpop.TableViewSearchBar.prototype = {
  constructor: Pushpop.TableViewSearchBar,
  
  element: null,
  $element: null,
  $input: null,
  $cancelButton: null,
  $clearButton: null,
  $overlay: null,
  
  _tableView: null,
  
  /**
    Attaches this TableViewSearchBar to a TableView.
    @param {Pushpop.TableView} tableView A TableView to attach this search bar to.
  */
  attachToTableView: function(tableView) {
    this._tableView = tableView;
    this.$overlay.appendTo(tableView.scrollView.$element);
    tableView.$element.before(this.$element);
  },
  
  /**
    Returns the current search string entered in the search bar.
    @type String
  */
  getSearchString: function() { return this.$input.val(); }
};

/**
  Creates a new default table view cell for a TableView with bold black title text.
  @param {String} reuseIdentifier A string containing an identifier that is unique
  to the group of cells that this cell should belong to. This reuse identifier is
  used by the TableView to recycle TableViewCells of the same style and type.
  @constructor
*/
Pushpop.TableViewCell = function TableViewCell(reuseIdentifier) {
  var reuseIdentifier =  this._reuseIdentifier = reuseIdentifier || this._reuseIdentifier;
  var $element = this.$element = $('<li data-reuse-identifier="' + reuseIdentifier + '"/>');
  var element = this.element = $element[0];
  
  element.tableViewCell = this;
};

Pushpop.TableViewCell.AccessoryType = {
  None: 'pp-table-view-cell-accessory-none',
  DisclosureIndicator: 'pp-table-view-cell-accessory-disclosure-indicator',
  DetailDisclosureButton: 'pp-table-view-cell-accessory-detail-disclosure-button',
  Checkmark: 'pp-table-view-cell-accessory-checkmark',
  ConfirmDeleteButton: 'pp-table-view-cell-accessory-confirm-delete-button'
};

Pushpop.TableViewCell.EditingAccessoryType = {
  None: 'pp-table-view-cell-editing-accessory-none',
  AddButton: 'pp-table-view-cell-editing-accessory-add-button',
  DeleteButton: 'pp-table-view-cell-editing-accessory-delete-button'
};

Pushpop.TableViewCell.prototype = {
  constructor: Pushpop.TableViewCell,
  
  element: null,
  $element: null,
  
  tableView: null,
  
  _reuseIdentifier: 'pp-table-view-cell-default',
  
  /**
    Returns a string containing this cell's reuse identifier.
    @type String
  */
  getReuseIdentifier: function() { return this._reuseIdentifier; },
  
  /**
    Returns a string containing HTML to be used to render the cell's contents based
    on the cell's data.
    @description NOTE: When creating a custom cell class, this method should be
    overridden to provide the appropriate HTML markup for the cell.
    @type String
  */
  getHtml: function() {
    var data = this.getData();
    var title = $.trim((data && data.title) ? data.title : '&nbsp;');
    return title;
  },

  /**
    Returns a string containing HTML to be used to render the cell's accessories
    based on the cell's accessory type.
    @type String
  */
  getEditingAccessoryHtml: function() {
    var editingAccessoryType = this.getEditingAccessoryType();
    if (!editingAccessoryType || editingAccessoryType === Pushpop.TableViewCell.EditingAccessoryType.None) return '';
    return '<span class="pp-table-view-cell-editing-accessory ' + editingAccessoryType + '"/>';
  },
  
  /**
    Returns a string containing HTML to be used to render the cell's accessories
    based on the cell's accessory type.
    @type String
  */
  getAccessoryHtml: function() {
    var accessoryType = this.getAccessoryType();
    if (!accessoryType || accessoryType === Pushpop.TableViewCell.AccessoryType.None) return '';
    return '<span class="pp-table-view-cell-accessory ' + accessoryType + '"/>';
  },
  
  /**
    Renders the cell using HTML provided by the getHtml() and getAccessoryHtml()
    methods.
    @description NOTE: In most circumstances, this method shouldn't need to be
    overridden when creating a custom cell class. Typically, when creating a custom
    cell class, only the getHtml() method should need to be overridden.
  */
  draw: function() {
    this.$element.html(this.getEditingAccessoryHtml() + this.getHtml() + this.getAccessoryHtml());
  },
  
  /**
    Removes this TableViewCell from the TableView's visible cells, resets its
    data and prepares it to be reused by the TableView by placing it in the
    reusable cells queue.
  */
  prepareForReuse: function() {
    
    // Detach the TableViewCell from the DOM.
    // NOTE: Using .detach() will preserve any attached event handlers.
    this.$element.detach();
    
    var tableView = this.tableView;
    var reuseIdentifier = this.getReuseIdentifier();
    var visibleCells = tableView.getVisibleCells();
    var reusableCells = tableView.getReusableCells();
    reusableCells = reusableCells[reuseIdentifier] || (reusableCells[reuseIdentifier] = []);
    
    reusableCells.push(this);
    
    for (var i = 0, length = visibleCells.length; i < length; i++) {
      if (visibleCells[i] === this) {
        visibleCells.splice(i, 1);
        break;
      }
    }
    
    this.setSelected(false);
    this.setIndex(-1);
    this.setAccessoryType(null);
    this.setEditingAccessoryType(null);
    this.setData(null);
  },
  
  _data: null,
  
  /**
    Returns the data of the item in the data source that corresponds to this cell.
    @type Object
  */
  getData: function() { return this._data; },
  
  /**
    Sets the data of this cell that corresponds to an item in the data source.
    @description NOTE: This method will set the cell's value to the |value| property
    of the provided data.
    @param {Object} data The data of an item in the data source to assign to this cell.
  */
  setData: function(data) {
    this._data = data;
    if (!data) return;
    if (data.value) this.setValue(data.value);
    this.draw();
  },
  
  _accessoryType: null,
  
  /**
    Returns the type of accessory to render for this cell. The types of available
    accessories are specified in Pushpop.TableViewCell.AccessoryType.
    @description NOTE: Table view cell accessories are rendered on the right-hand
    side of the cell.
    @type String
  */
  getAccessoryType: function() { return this._accessoryType; },
  
  /**
    Sets the type of accessory to render for this cell. The types of available
    accessories are specified in Pushpop.TableViewCell.AccessoryType.
    @description NOTE: Table view cell accessories are rendered on the right-hand
    side of the cell.
    @param {String} accessoryType The type of accessory to render for this cell.
  */
  setAccessoryType: function(accessoryType) { this._accessoryType = accessoryType; },
  
  _editingAccessoryType: null,
  
  /**
    Returns the type of editing accessory to render for this cell. The types of available
    editing accessories are specified in Pushpop.TableViewCell.EditingAccessoryType.
    @description NOTE: Table view cell editing accessories are rendered on the left-hand
    side of the cell.
    @type String
  */
  getEditingAccessoryType: function() { return this._editingAccessoryType; },
  
  /**
    Sets the type of editing accessory to render for this cell. The types of available
    editing accessories are specified in Pushpop.TableViewCell.EditingAccessoryType.
    @description NOTE: Table view cell editing accessories are rendered on the left-hand
    side of the cell.
    @param {String} editingAccessoryType The type of editing accessory to render for this cell.
  */
  setEditingAccessoryType: function(editingAccessoryType) { this._editingAccessoryType = editingAccessoryType; },
  
  _value: null,
  
  /**
    Returns the value of the item in the data source that corresponds to this cell.
    @description NOTE: This method is typically only used by "input" cell types. When
    setData() is called, the cell's value will be set to the |value| property of the
    cell's data (e.g.: this.getData().value). The value that is returned by this method
    originates from the |value| property of the cell's data.
    @type Number|String|Object
  */
  getValue: function() { return this._value; },
  
  /**
    Sets the value of this cell that corresponds to an item in the data source.
    @description NOTE: This method is typically only used by "input" cell types. When
    setData() is called, this method is called to set the |value| property of the
    cell's data (e.g.: this.getData().value). The value that is set by this method
    will also replace the value of the |value| property of the cell's data.
    @param {Number|String|Object} value The value of an item in the data source to assign to this cell.
  */
  setValue: function(value) {
    var data = this.getData();
    if (data) data.value = value;
    this._value = value;
  },
  
  _index: -1,
  
  /**
    Returns the index of the item in the data source that corresponds to this cell.
    @type Number
  */
  getIndex: function() { return this._index; },
  
  /**
    Sets the index of this cell that corresponds to an item in the data source.
    @param {Number} index The index of an item in the data source to assign to this cell.
  */
  setIndex: function(index) { this._index = index; },
  
  _isSelected: false,
  
  /**
    Returns a flag indicating whether or not this TableViewCell is currently selected.
    @type Boolean
  */
  getSelected: function() { return this._isSelected; },
  
  /**
    Sets a flag to indicate if this TableViewCell should be selected.
    @param {Boolean} value A boolean value to determine if this cell should be selected.
  */
  setSelected: function(value) {
    if (this._isSelected = value) {
      this.$element.addClass('pp-table-view-selected-state');
    } else {
      this.$element.removeClass('pp-table-view-selected-state');
    }
  },
};

// Register the prototype for Pushpop.TableViewCell as a reusable cell type.
Pushpop.TableView.registerReusableCellPrototype(Pushpop.TableViewCell.prototype);

/**
  Creates a new table view cell for a TableView with bold black title text and grey
  subtitle text.
  @param {String} reuseIdentifier A string containing an identifier that is unique
  to the group of cells that this cell should belong to.
  @constructor
  @extends Pushpop.TableViewCell
*/
Pushpop.SubtitleTableViewCell = function SubtitleTableViewCell(reuseIdentifier) {
  
  // Call the "super" constructor.
  Pushpop.TableViewCell.prototype.constructor.apply(this, arguments);
  
  // Assign a CSS class to this cell to add specific styles to it.
  this.$element.addClass('pp-subtitle-table-view-cell');
};

Pushpop.SubtitleTableViewCell.prototype = new Pushpop.TableViewCell('pp-subtitle-table-view-cell');
Pushpop.SubtitleTableViewCell.prototype.constructor = Pushpop.SubtitleTableViewCell;

Pushpop.SubtitleTableViewCell.prototype.getHtml = function() {
  var data = this.getData();
  var title = $.trim((data && data.title) ? data.title : '&nbsp;');
  var subtitle = $.trim((data && data.subtitle) ? data.subtitle : '&nbsp;');
  return '<h1>' + title + '</h1><h2>' + subtitle + '</h2>';
};

// Register the prototype for Pushpop.SubtitleTableViewCell as a reusable cell type.
Pushpop.TableView.registerReusableCellPrototype(Pushpop.SubtitleTableViewCell.prototype);

/**
  Creates a new table view cell for a TableView with a bold black text label and a
  blue text value.
  @param {String} reuseIdentifier A string containing an identifier that is unique
  to the group of cells that this cell should belong to.
  @constructor
  @extends Pushpop.TableViewCell
*/
Pushpop.ValueTableViewCell = function ValueTableViewCell(reuseIdentifier) {
  
  // Call the "super" constructor.
  Pushpop.TableViewCell.prototype.constructor.apply(this, arguments);
  
  // Assign a CSS class to this cell to add specific styles to it.
  this.$element.addClass('pp-value-table-view-cell');
};

Pushpop.ValueTableViewCell.prototype = new Pushpop.TableViewCell('pp-value-table-view-cell');
Pushpop.ValueTableViewCell.prototype.constructor = Pushpop.ValueTableViewCell;

Pushpop.ValueTableViewCell.prototype.getHtml = function() {
  var data = this.getData();
  var title = $.trim((data && data.title) ? data.title : '&nbsp;');
  var value = $.trim((data && data.value) ? data.value : '&nbsp;');
  return '<h1>' + title + '</h1><h2>' + value + '</h2>';
};

// Register the prototype for Pushpop.ValueTableViewCell as a reusable cell type.
Pushpop.TableView.registerReusableCellPrototype(Pushpop.ValueTableViewCell.prototype);

/**
  Creates a new table view cell for a TableView with a small bold blue text label
  and a long black bold text value.
  @param {String} reuseIdentifier A string containing an identifier that is unique
  to the group of cells that this cell should belong to.
  @constructor
  @extends Pushpop.TableViewCell
*/
Pushpop.Value2TableViewCell = function Value2TableViewCell(reuseIdentifier) {
  
  // Call the "super" constructor.
  Pushpop.TableViewCell.prototype.constructor.apply(this, arguments);
  
  // Assign a CSS class to this cell to add specific styles to it.
  this.$element.addClass('pp-value2-table-view-cell');
};

Pushpop.Value2TableViewCell.prototype = new Pushpop.TableViewCell('pp-value2-table-view-cell');
Pushpop.Value2TableViewCell.prototype.constructor = Pushpop.Value2TableViewCell;

Pushpop.Value2TableViewCell.prototype.getHtml = function() {
  var data = this.getData();
  var title = $.trim((data && data.title) ? data.title : '&nbsp;');
  var value = $.trim((data && data.value) ? data.value : '&nbsp;');
  return '<h1>' + title + '</h1><h2>' + value + '</h2>';
};

// Register the prototype for Pushpop.Value2TableViewCell as a reusable cell type.
Pushpop.TableView.registerReusableCellPrototype(Pushpop.Value2TableViewCell.prototype);

/**
  Creates a new table view cell for a TableView with a small bold blue text label
  and an inline text input field.
  @param {String} reuseIdentifier A string containing an identifier that is unique
  to the group of cells that this cell should belong to.
  @constructor
  @extends Pushpop.TableViewCell
*/
Pushpop.InlineTextInputTableViewCell = function InlineTextInputTableViewCell(reuseIdentifier) {
  
  // Call the "super" constructor.
  Pushpop.TableViewCell.prototype.constructor.apply(this, arguments);
  
  var self = this, $element = this.$element;
  
  // Assign a CSS class to this cell to add specific styles to it.
  $element.addClass('pp-inline-text-input-table-view-cell');
  
  // Attach an event handler to this cell to update its value when the input changes.
  $element.delegate('input', 'keyup change', function(evt) { self.setValue($(this).val()); });
};

Pushpop.InlineTextInputTableViewCell.prototype = new Pushpop.TableViewCell('pp-inline-text-input-table-view-cell');
Pushpop.InlineTextInputTableViewCell.prototype.constructor = Pushpop.InlineTextInputTableViewCell;

Pushpop.InlineTextInputTableViewCell.prototype.getHtml = function() {
  var data = this.getData();
  var title = $.trim((data && data.title) ? data.title : '&nbsp;');
  var name = $.trim((data && data.name) ? data.name : '');
  var value = $.trim((data && data.value) ? data.value : '');
  var isPassword = (data) ? (data.password || 'false') : 'false';
  isPassword = isPassword !== 'false';
  return '<h1>' + title + '</h1><input type="' + (isPassword ? 'password' : 'text') + '" name="' + name + '" value="' + value + '"/>';
};

Pushpop.InlineTextInputTableViewCell.prototype.setSelected = function(value) {
  
  // Call the "super" method.
  Pushpop.TableViewCell.prototype.setSelected.apply(this, arguments);
  
  var $element = this.$element;
  
  if (value) {
    $element.children('input').focus();
    window.setTimeout(function() { $element.removeClass('pp-table-view-selected-state'); }, 100);
  } else {
    $element.children('input').blur();
  }
};

// Register the prototype for Pushpop.InlineTextInputTableViewCell as a reusable cell type.
Pushpop.TableView.registerReusableCellPrototype(Pushpop.InlineTextInputTableViewCell.prototype);

/**
  Creates a new table view cell for a TableView with a small bold blue text label
  and a long black bold text value. When this type of cell is tapped, a new view
  is presented with a large text area for entering long strings of text.
  @param {String} reuseIdentifier A string containing an identifier that is unique
  to the group of cells that this cell should belong to.
  @constructor
  @extends Pushpop.TableViewCell
*/
Pushpop.TextAreaInputTableViewCell = function TextAreaInputTableViewCell(reuseIdentifier) {
  
  // Call the "super" constructor.
  Pushpop.TableViewCell.prototype.constructor.apply(this, arguments);
  
  var self = this, $element = this.$element;
  
  // Assign a CSS class to this cell to add specific styles to it.
  $element.addClass('pp-text-area-input-table-view-cell');
};

Pushpop.TextAreaInputTableViewCell.prototype = new Pushpop.TableViewCell('pp-text-area-input-table-view-cell');
Pushpop.TextAreaInputTableViewCell.prototype.constructor = Pushpop.TextAreaInputTableViewCell;

Pushpop.TextAreaInputTableViewCell.prototype.getHtml = function() {
  var data = this.getData();
  var title = $.trim((data && data.title) ? data.title : '&nbsp;');
  var value = $.trim((data && data.value) ? data.value : '&nbsp;');
  return '<h1>' + title + '</h1><h2>' + value + '</h2>';
};

Pushpop.TextAreaInputTableViewCell.prototype.setSelected = function(value) {
  
  // Call the "super" method.
  Pushpop.TableViewCell.prototype.setSelected.apply(this, arguments);
  
  if (!value) return;
  
  var tableView = this.tableView;
  var viewStack = tableView.getViewStack();
  if (!viewStack) return;
  
  var data = this.getData();
  if (!data) return;
  
  var title = data.title || '';
  var name = data.name || '';
  var value = data.value || '';
  
  var self = this;
  
  // Push a new view with a large text area input.
  viewStack.pushNewView(function(newView) {
    var $textarea = $('<textarea class="pp-text-area-input-table-view-cell-textarea" name="' + name + '">' + value + '</textarea>');
    var $doneButton = $('<a class="pp-barbutton pp-barbutton-align-right pp-barbutton-style-blue active" href="#">Done</a>');
    
    $doneButton.bind('click', function(evt) {
      evt.preventDefault();
      
      self.setValue($textarea.val());
      tableView.reloadData();
      viewStack.pop();
    });
    
    newView.setTitle(title);
    newView.$navbarButtons = $doneButton;
    newView.$element.append($textarea);
  });
};

// Register the prototype for Pushpop.TextAreaInputTableViewCell as a reusable cell type.
Pushpop.TableView.registerReusableCellPrototype(Pushpop.TextAreaInputTableViewCell.prototype);

$(function() {
  $('.pp-table-view').each(function(index, element) { new Pushpop.TableView(element); });
  
  // Set up table view "edit" buttons (ex.: in a navigation bar) to toggle the "editing"
  // flag of the table view its "href" points to.
  $(document.body).delegate('.pp-table-view-edit-button', 'click', function(evt) {
    var $this = $(this);
    var $tableViewElement = $($this.attr('href'));
    if ($tableViewElement.length === 0) return;
    
    var tableView = $tableViewElement[0].tableView;
    if (!tableView) return;
    
    var isEditing = !tableView.getEditing()
    if (isEditing) $this.addClass('pp-barbutton-style-blue'); else $this.removeClass('pp-barbutton-style-blue');
    tableView.setEditing(isEditing);
    
    evt.preventDefault();
  });
});
