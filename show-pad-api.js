var http = require('http')

var host, apikey;

exports.init = function (_host, _port, _apikey)
{
  host = _host;
  port = _port;
  apikey = _apikey;
}

exports.create = function (endpoint, body, cb)
{
  request("POST", endpoint, body, null, cb);
}

exports.update = function (endpoint, body, entity, cb)
{
  request("PUT",  endpoint, body, entity, cb);
}

function request(method, endpoint, body, entity, cb)
{
  var reqUrl = "/api/1/" + endpoint + (entity ? ("/" + entity) : "") + "?apikey=" + apikey;
  var options =
    {
      hostname: host,
      port: port,
      path: reqUrl,
      method: method,
      headers: {
        'content-type': (body instanceof Object) ? 'application/json' : 'text/plain'
      }
    };

  var req = http.request(options,
    function(res)
    {
      var body = "";

      res.on('data', function (chunk)
      {
        body += chunk;
      });

      res.on('end', function()
      {
        if(res.statusCode == 200)
        {
          cb(null, JSON.parse(body).data);
        }
        else
        {
          cb(res.statusCode);
        }
      });
    }
  );

  if(body instanceof Object)
    body = JSON.stringify(body);

  req.write(body);
  req.end();
}
