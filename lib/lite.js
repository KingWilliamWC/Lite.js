const http = require('http');
const url = require('url');
const path = require('path');

// framework requires
const responseObject = require('./response');
const staticHandler = require('./static');

var isStaticPath = false;
var staticPath = "";

var isMiddleWare = false;

var renderEngine = false;

var supportedRenderEngines = ['ejs'] //only one so far, sorry, there will be more(hopefully) :)

'use strict'

var getpaths = [];
var postpaths = [];

var middleware = [];

//route types
function get(path, callback){
    getpaths.push({urlPath: path, callback: callback,});
}

function post(path, callback){
    postpaths.push({urlPath: path, callback: callback,});
}

function add(pleaseWork){
    isMiddleWare = true;
    middleware.push(pleaseWork);
}

function static(userstaticPath){
    var cleanedPath = userstaticPath;
    isStaticPath = true;
    if(cleanedPath.substring(0,1) != "./"){
        cleanedPath = "./" + cleanedPath;
    }
    staticPath = userstaticPath;
}

function SetRenderEngine(newrenderEngine){
    if(supportedRenderEngines.includes(newrenderEngine)){
        renderEngine = require(newrenderEngine);
        responseObject.setRenderEngine(newrenderEngine);
    }else{
        throw new Error(`UnsupportedEngineError: The rendering engine ${newrenderEngine} is not supported\nplease see the docs for the currently supported rendering engines`);
    }
}

function set(WhatToSet, setTo){
    if(WhatToSet == 'view-engine'){
        SetRenderEngine(setTo); //response object
    }
}

function listen(port, callback){
    http.createServer(function (req, res){
        
        const parsedUrl = url.parse(req.url);

        donePageCallBack = false;

        const pathname = parsedUrl.pathname;

        var ext = path.parse(pathname).ext;

        // console.log(ext); // log extension type

        if(isMiddleWare){
            for(var x = 0; x < middleware.length; x++){
                middleware[x]();
            }
        }

        
        if(req.method == "GET"){
            for(var i = 0; i < getpaths.length; i++){
                if(pathname == getpaths[i].urlPath){
                    // handle get request if the path has been found
                    getpaths[i].callback(req, responseObject.response(res));
                    donePageCallBack = true;
                }
            }
        }else if(req.method == "POST"){
            for(var i = 0; i < postpaths.length; i++){
                if(pathname == postpaths[i].urlPath){
                    // handle post request if valid url has been found
                    postpaths[i].callback(responseObject.request(req), responseObject.response(res));
                    donePageCallBack = true;
                }
            }
        }

        // serve static file if no other url matches and there is an extension
        if(ext.length != 0 && !donePageCallBack && isStaticPath){
            staticHandler.serve(res, pathname, ext, staticPath);
        }
        
        
    }).listen(port)
    
    // check to see if the callback has been called
    if(!callback){return;}
    if(callback != null){
        callback();
    }
}

exports = module.exports = {
    listen: listen,
    get: get,
    post: post,
    static: static,
    add: add,
    set: set,
};