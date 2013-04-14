var http = require('http')

var host, apikey;

exports.init = function (_host, _port, _apikey)
{
  host = _host;
  port = _port;
  apikey = _apikey;
}

exports.post = function (endpoint, body, cb)
{
  var reqUrl = "/api/1/" + endpoint + "?apikey=" + apikey;
  var options =
    {
      hostname: host,
      port: port,
      path: reqUrl,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
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
        console.log(body);
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

  console.log(body)
  req.write(JSON.stringify(body));
  req.end();
}
