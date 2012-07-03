;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new PickerTableView.
  @param {HTMLDivElement} element The <div/> element to initialize as a new ModalViewStack.
  @constructor
*/
Pushpop.PickerTableView = function PickerTableView(element) {
  
  // Call the "super" constructor.
  Pushpop.TableView.prototype.constructor.apply(this, arguments);
  
  var dataSource = this.getDataSource();
  var dataSet = dataSource.getDataSet();
  var defaultReuseIdentifier = dataSource.getDefaultReuseIdentifier();
  
  dataSource = new Pushpop.PickerTableViewDataSource(dataSet, defaultReuseIdentifier);
  this.setDataSource(dataSource);
  
  console.log(dataSource);
};

// Create the prototype for the Pushpop.PickerTableView as a "sub-class" of Pushpop.TableView.
Pushpop.PickerTableView.prototype = new Pushpop.TableView();
Pushpop.PickerTableView.prototype.constructor = Pushpop.PickerTableView;

/**
  Creates a new data source for a PickerTableView.
  @param {Array} [dataSet] An optional array of data to initialize a default data source.
  @param {Array} [dataSet.id] The unique identifier for a specific record.
  @param {Array} [dataSet.value] The (sometimes) hidden value for a specific record.
  @param {Array} [dataSet.title] The title to be displayed in a TableViewCell for a specific record.
  @param {String} [defaultReuseIdentifier] The optional reuse identifier to be used for rows that do
  not specify a specific reuse identifier.
  @constructor
*/
Pushpop.PickerTableViewDataSource = function PickerTableViewDataSource(dataSet, defaultReuseIdentifier, pickerCellTitle) {
  
  // Call the "super" constructor.
  Pushpop.TableViewDataSource.prototype.constructor.apply(this, arguments);
  
  // Set the picker cell's title.
  this.setPickerCellTitle(pickerCellTitle || this.getPickerCellTitle());
};

// Create the prototype for the Pushpop.PickerTableViewDataSource as a "sub-class" of Pushpop.TableViewDataSource.
Pushpop.PickerTableViewDataSource.prototype = new Pushpop.TableViewDataSource();
Pushpop.PickerTableViewDataSource.prototype.constructor = Pushpop.PickerTableViewDataSource;

/**
  REQUIRED: Returns the number of rows provided by this data source.
  @description NOTE: This is the default implementation and should be overridden for data
  sources that are not driven directly from an in-memory data set. Also, in order to account
  for the picker cell, this method should always return the number of rows in the data source
  plus one.
  @type Number
*/
Pushpop.PickerTableViewDataSource.prototype.getNumberOfRows = function() { return this.getFilteredDataSet().length + 1; },

/**
  REQUIRED: Returns a TableViewCell for the specified index.
  @description NOTE: This is the default implementation and should be overridden for data
  sources that are not driven directly from an in-memory data set. Also, in order to account
  for the picker cell, this method should always return the picker cell for the last available
  index.
  @param {Pushpop.TableView} tableView The TableView the TableViewCell should be returned for.
  @param {Number} index The index of the data to be used when populating the TableViewCell.
  @type Pushpop.TableViewCell
*/
Pushpop.PickerTableViewDataSource.prototype.getCellForRowAtIndex = function(tableView, index) {
  var numberOfRows = this.getNumberOfRows();
  var data, reuseIdentifier, cell;
  
  data = (index === numberOfRows - 1) ? {
    title: this.getPickerCellTitle(),
    reuseIdentifier: this.getPickerCellReuseIdentifier()
  } : this.getFilteredDataSet()[index];
  
  reuseIdentifier = data.reuseIdentifier || this.getDefaultReuseIdentifier();
  cell = tableView.dequeueReusableCellWithIdentifier(reuseIdentifier);
  
  cell.setIndex(index);
  cell.setAccessoryType(data.accessoryType);
  cell.setData(data);
  
  return cell;
}

Pushpop.PickerTableViewDataSource.prototype._pickerCellTitle = 'Add Item';

Pushpop.PickerTableViewDataSource.prototype.getPickerCellTitle = function() { return this._pickerCellTitle; };

Pushpop.PickerTableViewDataSource.prototype.setPickerCellTitle = function(pickerCellTitle) {
  this._pickerCellTitle = pickerCellTitle;
};

Pushpop.PickerTableViewDataSource.prototype._pickerCellReuseIdentifier = 'pp-table-view-cell-default';

Pushpop.PickerTableViewDataSource.prototype.getPickerCellReuseIdentifier = function() { return this._pickerCellReuseIdentifier; };

Pushpop.PickerTableViewDataSource.prototype.setPickerCellReuseIdentifier = function(pickerCellReuseIdentifier) {
  this._pickerCellReuseIdentifier = pickerCellReuseIdentifier;
};

$(function() {
  $('.pp-picker-table-view').each(function(index, element) { new Pushpop.PickerTableView(element); });
});
