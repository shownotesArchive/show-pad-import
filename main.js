var fs     = require('fs')
  , async  = require('async')
  , log4js = require('log4js')
  , argv   = require('optimist').argv
  , csv    = require("csv")

var logger = log4js.getLogger("main")
  , showpadapi = require('./show-pad-api.js')
  , inputfile
  , filetype
  , csvCols
  , template
  , templateContent
  , group
  , type
  , documents

async.series(
  [
    parseArgs,
    loadFile,
    importDocs
  ]
);

function parseArgs(cb)
{
  var host, port, apikey;

  host = argv["showpad-host"];
  port = argv["showpad-port"];
  apikey = argv["showpad-apikey"];

  inputfile = argv["file"];
  filetype = argv["filetype"] || inputfile.split('.').splice(-1);
  prefix = argv["prefix"];
  template = argv["template"];
  group = argv["group"];
  type = argv["type"];

  if(filetype == "csv")
  {
    csvCols = argv["csvCols"].split(',');
  }

  showpadapi.init(host, port,  apikey);

  cb();
}

function loadFile(cb)
{
  templateContent = fs.readFileSync(template, "UTF8");
  documents = [];

  if(filetype == "csv")
  {
    csv()
      .from.stream(fs.createReadStream(inputfile), { delimiter: ";" })
      .on('record', function(row, index)
      {
        var docname = prefix + index;
        var fields = {};
        for(var i = 0; i < row.length; i++)
        {
          if(csvCols[i] == "null") continue;
          fields[csvCols[i]] = row[i];
        }

        var text = prepareText(fields);

        documents.push({ docname: docname, text: text, group: group });
      })
      .on('end', function(count)
      {
        cb();
      })
      .on('error', function(error)
      {
        console.log(error);
        cb(error);
      });
  }
  else
  {
    logger.error("Unknown filetype: %s", filetype);
  }
}

function prepareText(fields)
{
  var text = templateContent;
  for(var field in fields)
  {
    text = text.replace("$" + field, fields[field]);
  }
  return text;
}

function importDocs(cb)
{
  showpadapi.post('groups', { name: group, short: group, type: "open" },
    function ()
    {
      async.each(documents,
        function (doc, cb)
        {
          console.log("Importing %s (%s..)", doc.docname, doc.text.substr(0, 35).replace(/\n/g, ""));

          showpadapi.post('docs', { docname: doc.docname, type: type, group: group }, cb);
        },
        cb
      );
    }
  );
}
