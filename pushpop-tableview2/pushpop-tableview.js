'use strict';

var Pushpop = window['Pushpop'] || {};

Pushpop.TableView = function(element) {
  var $window = $(window['addEventListener'] ? window : document.body);
  
  var $element = this.$element = $(element);
  var element = this.element = $element[0];
  
  var tableView = element.tableView;
  if (tableView) return tableView;
  
  element.tableView = this;
  
  var self = this;
  
  var scrollViewElement = $element.parents('.sk-scroll-view')[0];
  var scrollView = this.scrollView = (scrollViewElement) ? scrollViewElement.scrollView : null;
  
  var visibleHeight = this._visibleHeight = scrollView.getSize().height;
  
  scrollView.$element.bind(SKScrollEventType.ScrollChange, function(evt) {
    var offset = -scrollView.y;
    var rowHeight = self.getRowHeight();
    var numberOfVisibleCells = self.getNumberOfVisibleCells();
    
    if (offset < 0) return;
    
    var firstCellElement = $element.children('li:first-child')[0];
    var lastCellElement = $element.children('li:last-child')[0];
    
    if (!firstCellElement || !lastCellElement || firstCellElement === lastCellElement) return;
    
    var dataSource = self.getDataSource();
    
    var firstCell = firstCellElement.tableViewCell;
    var firstCellIndex = firstCell.getIndex();
    var lastCell = lastCellElement.tableViewCell;
    var lastCellIndex = lastCell.getIndex();
    
    var firstCellOffset = firstCell.$element.offset().top;
    var lastCellOffset = firstCellOffset + (numberOfVisibleCells * rowHeight);
    
    if (lastCellIndex + 1 < dataSource.length && firstCellOffset < 0 - (rowHeight * 8)) {
      firstCell.prepareForReuse();
      self._reusableCells.push(firstCell);
      
      var newLastCell = self.dequeueReusableCellWithIdentifier('pushpop.tableviewcell.default');
      newLastCell.setData(dataSource, lastCellIndex + 1);
      
      $element.append(newLastCell.$element);
      
      var margin = scrollView.getMargin();
      scrollView.setMargin({
        top: margin.top + rowHeight,
        bottom: margin.bottom - rowHeight
      });
    }
    
    else if (firstCellIndex - 1 >= 0 && lastCellOffset > visibleHeight + (rowHeight * 8)) {
      lastCell.prepareForReuse();
      self._reusableCells.push(lastCell);
      
      var newFirstCell = self.dequeueReusableCellWithIdentifier('pushpop.tableviewcell.default');
      newFirstCell.setData(dataSource, firstCellIndex - 1);
      
      $element.prepend(newFirstCell.$element);
      
      var margin = scrollView.getMargin();
      scrollView.setMargin({
        top: margin.top - rowHeight,
        bottom: margin.bottom + rowHeight
      });
    }
  });
  
  var reusableCells = this._reusableCells = [];
  var visibleCells = this._visibleCells = [];
  var selectedRowIndexes = this._selectedRowIndexes = [];
  
  var dataSourceUrl = $element.attr('data-source');
  if (dataSourceUrl) $.getJSON(dataSourceUrl, function(dataSource) {
    self.setDataSource(dataSource);
  });
};

Pushpop.TableView.prototype = {
  element: null,
  $element: null,
  
  scrollView: null,
  
  _visibleHeight: 0,
  
  _reusableCells: null,
  dequeueReusableCellWithIdentifier: function(reuseIdentifier) {
    var reusableCells = this._reusableCells;
    var cell = null;
    
    for (var i = 0, length = reusableCells.length; i < length; i++) {
      if (reusableCells[i].reuseIdentifier === reuseIdentifier) {
        cell = reusableCells[i];
        reusableCells.splice(i, 1);
        break;
      }
    }
    
    if (!cell) cell = new Pushpop.TableViewCell(reuseIdentifier);
    
    return cell;
  },
  
  _visibleCells: null,
  getVisibleCells: function() { return this._visibleCells; },
  getNumberOfVisibleCells: function() { return Math.ceil(this._visibleHeight / this.getRowHeight()) + 8 },
  
  _selectedRowIndexes: null,
  getIndexForSelectedRow: function() {
    var selectedRowIndexes = this._selectedRowIndexes;
    return (selectedRowIndexes && selectedRowIndexes.length > 0) ? selectedRowIndexes[0] : -1;
  },
  getIndexesForSelectedRows: function() {
    return this._selectedRowIndexes || [];
  },
  selectRowAtIndex: function(index, animated) {
    
  },
  deselectRowAtIndex: function(index, animated) {
    
  },
  
  reloadData: function() {    
    var totalCellCount = this.getDataSource().length;
    var visibleCellCount = this.getNumberOfVisibleCells();
    var hiddenCellCount = totalCellCount - visibleCellCount;
    
    var scrollView = this.scrollView;
    
    // Scroll to the top of the table view without animating.
    scrollView.setContentOffset({ x: 0, y: 0 }, false);
    
    var visibleCells = this._visibleCells;
    var dataSource = this.getDataSource();
    var $element = this.$element;
    
    for (var i = 0; i < visibleCellCount; i++) {
      var cell = this.dequeueReusableCellWithIdentifier('pushpop.tableviewcell.default');
      cell.setData(dataSource, i);
      
      $element.append(cell.$element);
    }
    
    // Set the scroll view margin.
    scrollView.setMargin({
      top: 0,
      bottom: hiddenCellCount * this.getRowHeight()
    });
  },
  
  _dataSource: null,
  getDataSource: function() { return this._dataSource; },
  setDataSource: function(dataSource) {
    this._dataSource = dataSource;
    this.reloadData();
  },
  
  _rowHeight: 44,
  getRowHeight: function() { return this._rowHeight; },
  setRowHeight: function(rowHeight) {
    this._rowHeight = rowHeight;
  },
  
  _editing: false,
  getEditing: function() { return this._editing; },
  setEditing: function(editing, animated) {
    this._editing = editing;
  }
};

Pushpop.TableViewCell = function(reuseIdentifier) {
  var $element = this.$element = $('<li/>');
  var element = this.element = $element[0];
  
  element.tableViewCell = this;
  
  if (reuseIdentifier) this.reuseIdentifier = reuseIdentifier;
};

Pushpop.TableViewCell.prototype = {
  element: null,
  $element: null,
  reuseIdentifier: 'pushpop.tableviewcell.default',
  
  prepareForReuse: function() {
    this.$element.remove();
    this.setIndex(-1);
    this.setId(-1);
    this.setValue(null);
    this.setTitle('');
  },
  
  _index: -1,
  getIndex: function() { return this._index; },
  setIndex: function(index) { this._index = index; },
  
  _id: -1,
  getId: function() { return this._id; },
  setId: function(id) { this._id = id; },
  
  _value: null,
  getValue: function() { return this._value; },
  setValue: function(value) { this._value = value; },
  
  _title: '',
  getTitle: function() { return this._title; },
  setTitle: function(title) { this.$element.html(this._title = title); },
  
  setData: function(dataSource, index) {
    var data = dataSource[index];
    
    this.setIndex(index);
    
    this.setId(data.id);
    this.setValue(data.value);
    this.setTitle(data.title);
  }
};

$(function() {
  $('.pp-tableview').each(function(index, element) { new Pushpop.TableView(element); });
});
