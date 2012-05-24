'use strict';

var Pushpop = window['Pushpop'] || {};

/**
  Creates a new TableView.
  @param {HTMLUListElement} element The <ul/> element to initialize as a new TableView.
  @constructor
*/
Pushpop.TableView = function TableView(element) {
  var $window = $(window['addEventListener'] ? window : document.body);
  
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
  
  var visibleHeight = this._visibleHeight = scrollView.getSize().height;
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
    
    lastOffset = offset;
    
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
        
        scrollView.setMargin({
          top: margin.top + (rowHeight * (index + 1)),
          bottom: margin.bottom - (rowHeight * (index + 1))
        });
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
        
        scrollView.setMargin({
          top: margin.top - (rowHeight * (index + 1)),
          bottom: margin.bottom + (rowHeight * (index + 1))
        });
      });
    }
  });
  
  // Handle case when table view is scrolled to the top (e.g.: tapping top of navigation bar).
  scrollView.$element.bind(SKScrollEventType.WillScrollToTop, function(evt) {    
    var firstCellElement = $element.children('li:first-child')[0];
    if (firstCellElement) firstCellElement.tableViewCell.setIndex(0);
  }).bind(SKScrollEventType.DidScrollToTop, function(evt) { self.reloadData(); });
  
  // Handle mouse/touch events to allow the user to make row selections.
  var isPendingSelection = false, selectionTimeout = null;

  $element.delegate('li', !!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    isPendingSelection = true;
    
    var tableViewCell = this.tableViewCell;
    
    selectionTimeout = window.setTimeout(function() {
      if (!isPendingSelection) return;
      isPendingSelection = false;
      
      self.deselectAllRows();
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
  
    var tableViewCell = this.tableViewCell;
    
    self.deselectAllRows();
    self.selectRowAtIndex(tableViewCell.getIndex());
  });
  
  var dataSetUrl = $element.attr('data-set-url');
  
  // Create a new data source from a data set URL.
  if (dataSetUrl) {
    $.getJSON(dataSetUrl, function(dataSet) {
      $element.html(null);
      self.setDataSource(new Pushpop.TableViewDataSource(dataSet));
    });
  }
  
  // Create a new data source from existing <li/> elements.
  else {
    var dataSet = [];
    $element.children('li').each(function(index, element) {
      var $child = $(element);
      dataSet.push({
        id: $child.attr('data-id') || index + 1,
        value: $child.attr('data-value') || index,
        title: $child.html(),
        reuseIdentifier: ($child.attr('data-reuse-identifier') || 'pp-table-view-cell-style-default').replace(' ', '-')
      });
    });
    
    $element.html(null);
    this.setDataSource(new Pushpop.TableViewDataSource(dataSet));
  }
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
  
  _visibleHeight: 0,
  _numberOfBufferedCells: 16,
  _numberOfRows: 0,
  _selectionTimeoutDuration: 250,
  
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
  getCalculatedNumberOfVisibleCells: function() { return Math.ceil(this._visibleHeight / this.getRowHeight()) + this._numberOfBufferedCells },
  
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
    Selects the row at the specified index and optionally animates the selection if
    the row is currently visible.
    @description NOTE: This method will not modify any other existing selections.
    @param {Number} index The index of a row in the data source to select.
    @param {Boolean} [animated] A flag indicating if the selection should be animated
    if the row is currently visible.
  */
  selectRowAtIndex: function(index, animated) {
    this._selectedRowIndexes.push(index);
    
    var tableViewCell, $cells = this.$element.children();
    for (var i = 0, length = $cells.length; i < length; i++) {
      tableViewCell = $cells[i].tableViewCell;
      if (tableViewCell.getIndex() === index) {
        tableViewCell.setSelected(true);
        return;
      }
    }
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
    var selectedRowIndexes = this._selectedRowIndexes;
    for (var i = 0, length = selectedRowIndexes.length; i < length; i++) {
      if (selectedRowIndexes[i] === index) {
        selectedRowIndexes.splice(i, 1);
        break;
      }
    }
    
    var tableViewCell, $selectedCells = this.$element.children('.pp-table-view-selected-state');
    for (var i = 0, length = $cells.length; i < length; i++) {
      tableViewCell = $cells[i].tableViewCell;
      if (tableViewCell.getIndex() === index) {
        tableViewCell.setSelected(false);
        return;
      }
    }
  },
  
  /**
    De-selects all rows in the table.
  */
  deselectAllRows: function() {
    this._selectedRowIndexes.length = 0;
    this.$element.children('.pp-table-view-selected-state').each(function(index, element) {
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
    Sets the fixed row height for this TableView and reloads the data.
    Sets this TableView in or out of editing mode and optionally animates the transition.
    @param {Boolean} editing A flag indicating if the TableView should be in editing mode.
    @param {Boolean} [animated] An optional flag indicating if the transition in or out of
    editing mode should be animated.
  */
  setEditing: function(editing, animated) { this._editing = editing; }
};

/**
  Creates a new data source for a TableView.
  @param {Array} [dataSet] An optional array of data to initialize a default data source.
  @param {Array} [dataSet.id] The unique identifier for a specific record.
  @param {Array} [dataSet.value] The (sometimes) hidden value for a specific record.
  @param {Array} [dataSet.title] The title to be displayed in a TableViewCell for a specific record.
  @constructor
*/
Pushpop.TableViewDataSource = function TableViewDataSource(dataSet) {
  if (!dataSet || dataSet.constructor !== Array) return;
  
  this.setDataSet(dataSet);
  
  // Default implementation if using an in-memory data set.
  this.getNumberOfRows = function() { return this.getFilteredDataSet().length; };
  
  // Default implementation if using an in-memory data set.
  this.getCellForRowAtIndex = function(tableView, index) {
    var data = this.getFilteredDataSet()[index];
    var reuseIdentifier = data.reuseIdentifier || 'pp-table-view-cell-style-default';
    var cell = tableView.dequeueReusableCellWithIdentifier(reuseIdentifier);
    
    cell.setIndex(index);
    cell.setId(data.id);
    cell.setValue(data.value);
    cell.setHtml(data.title);
    
    return cell;
  };
};

/**
  @description NOTE: In order to have a TableView with custom TableViewCells, a custom
  TableViewDataSource must be implemented with at least the two required methods defined
  in this prototype. A third optional method may also be implemented as defined in this
  prototype.
*/
Pushpop.TableViewDataSource.prototype = {
  constructor: Pushpop.TableViewDataSource,
  
  /**
    REQUIRED: Returns the number of rows provided by this data source.
    @type Number
  */
  getNumberOfRows: function() { return 0; },
  
  /**
    REQUIRED: Returns a TableViewCell for the specified index.
    @param {Pushpop.TableView} tableView The TableView the TableViewCell should be returned for.
    @param {Number} index The index of the data to be used when populating the TableViewCell.
    @type Pushpop.TableViewCell
  */
  getCellForRowAtIndex: function(tableView, index) { return null; },
  
  /**
    OPTIONAL: Determines if the table should be reloaded following a change in the search string.
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
  
  _tableView: null,
  
  /**
    Returns the TableView this data source is bound to.
    @type Pushpop.TableView
  */
  getTableView: function() { return this._tableView; },
  
  /**
    Sets the TableView this data source should be bound to.
  */
  setTableView: function(tableView) { this._tableView = tableView; },
  
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
  */
  setDataSet: function(dataSet) {
    this._dataSet = dataSet;
    this.shouldReloadTableForSearchString();
  },
  
  _filteredDataSet: null,
  
  /**
    Returns the filtered in-memory data set this data source will provide to the table view.
    @description NOTE: This may not be utilized by a custom data source.
    @type Array
  */
  getFilteredDataSet: function() { return this._filteredDataSet; },
  
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
  var $overlay = this.$overlay = $('<div class="pp-table-view-search-bar-overlay"/>');
  
  var willFocus = false;
  
  $input.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); });
  $input.bind('mouseup touchend', function(evt) { $input.trigger('focus'); });
  $input.bind('focus', function(evt) { self._tableView.resetScrollView(); window.setTimeout(function() { $overlay.addClass('pp-active'); }, 0); });
  $input.bind('blur', function(evt) { $overlay.removeClass('pp-active'); });
  $cancelButton.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); evt.preventDefault(); });
  $cancelButton.bind('mouseup touchend', function(evt) { $input.val(null).trigger('keyup').trigger('blur'); });
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
    } else {
      $overlay.removeClass('pp-active');
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
  Creates a new table view cell for a TableView.
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

Pushpop.TableViewCell.prototype = {
  constructor: Pushpop.TableViewCell,
  
  element: null,
  $element: null,
  
  tableView: null,
  
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
    this.setId(-1);
    this.setValue(null);
    this.setHtml('');
  },
  
  _reuseIdentifier: 'pp-table-view-cell-style-default',
  
  /**
    Returns a string containing this cell's reuse identifier.
    @type String
  */
  getReuseIdentifier: function() { return this._reuseIdentifier; },
  
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
  
  _id: -1,
  
  /**
    Returns the ID of the item in the data source that corresponds to this cell.
    @type Number|String
  */
  getId: function() { return this._id; },
  
  /**
    Sets the ID of this cell that corresponds to an item in the data source.
    @param {Number|String} id The ID of an item in the data source to assign to this cell.
  */
  setId: function(id) { this._id = id; },
  
  _value: null,
  
  /**
    Returns the value of the item in the data source that corresponds to this cell.
    @type Number|String
  */
  getValue: function() { return this._value; },
  
  /**
    Sets the value of this cell that corresponds to an item in the data source.
    @param {Number|String} value The value of an item in the data source to assign to this cell.
  */
  setValue: function(value) { this._value = value; },
  
  _html: '',
  
  /**
    Returns the HTML of the item in the data source that corresponds to this cell.
    @type String
  */
  getHtml: function() { return this._html; },
  
  /**
    Sets the HTML of this cell that corresponds to an item in the data source.
    @param {String} html The HTML of an item in the data source to assign to this cell.
  */
  setHtml: function(html) { this.$element.html(this._html = html); }
};

Pushpop.TableView.registerReusableCellPrototype(Pushpop.TableViewCell.prototype);

$(function() {
  $('.pp-table-view').each(function(index, element) { new Pushpop.TableView(element); });
});
