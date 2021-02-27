var fs = require('fs');

var isStaticPath = false;
var staticPath = "";

var isRenderEngine = false;
var renderEngine = false;

function renderhtmlFile(res, filePath, ejsUserData){
    var parsedPath = ""
    if(filePath.substring(0, 1) != "./"){
        parsedPath = "./" + filePath;
    }else{
        parsedPath = filePath;
    }
    if (isRenderEngine){
        fs.readFile(parsedPath, 'utf-8', function(error, data){
            if(error){
                res.writeHead(404);
            }else{
                var ejsdata = renderEngine.compile(data);
                if(ejsUserData != null){
                    res.write(ejsdata(ejsUserData));
                }else{
                    res.write(ejsdata());
                }
            }
            res.end();
        });
    }else{
        fs.readFile(parsedPath, null, function(error, data){
            if(error){
                res.writeHead(404);
            }else{
                res.write(data);
            }
            res.end();
        });
    }
    
}

function setRenderEngine(newRenderEngine){
    isRenderEngine = true;
    renderEngine = require(newRenderEngine);
}

function sendJSON(res, jsonObj){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(jsonObj), null, 4);
}

function respond(res){
    response = {
        send: function(textToSend){res.end(textToSend)},
        render: function(filePath, ejsData){renderhtmlFile(res, filePath, ejsData)},
        json: function(jsonObj){sendJSON(res, jsonObj)},
    };

    return response;
}

function parseUrl(urltoparse){
    var bodyParams = {};
    var removedUrl = urltoparse.split('?');
    removedUrl.shift();
    var cleanedUrl = removedUrl.join('').split('&');
    for(var i = 0; i < cleanedUrl.length; i++){
        var getKey = cleanedUrl[i].split('=');
        var keyname = getKey[0];
        var keyvalue = getKey[1];
        bodyParams[keyname] = keyvalue;
    }
    return bodyParams;
}

function bodyParser(req){
    request = req;
    request.body = parseUrl(request.url);
    return request;
}

exports = module.exports = {
    setRenderEngine: function(newrenderEngine){setRenderEngine(newrenderEngine)},
    staticPath: staticPath,
    isStaticPath: isStaticPath,
    response: function(res){return respond(res)},
    request: function(req){return bodyParser(req)}
};