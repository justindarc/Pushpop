if (process.argv.length < 4) return console.log('Usage: node generate-data.js number_of_records output.json\n');

var fs = require('fs');

var numberOfRecords = process.argv[2];
var outputFile = process.argv[3];

var records = [];

for (var i = 0; i < numberOfRecords; i++) {
  records.push({
    id: i + 1,
    value: i,
    title: 'Row ' + i
  });
}
  
var json = JSON.stringify(records, null, 2);

fs.writeFile(outputFile, json, function(err) {
  if (err) return console.log(err);
  
  console.log(outputFile + ' saved successfully!');
});
