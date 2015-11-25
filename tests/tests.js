var R = require('ramda');

_plugins = {
    f: function (chain, a) {
        console.log('called F');
        //return chain(a);
    },
    h:function(chain,c){
        console.log('called H:'+c);
        return chain(c)(c);

    },
    g: function (chain, b) {
        console.log('called G:'+b);
        return chain(b);
    }

};
_buildPluginChain = function _buildPluginChain(fn) {
    var previous, currentFn, lastCall;
    previous = service;
    Object.keys(_plugins).forEach(function (a) {
        previous = R.curry(_plugins[a])(previous);
    });
    currentFn=previous;
    return {
        process: function (service) {
            return currentFn.apply(service, arguments);
        }
    };

};

var serviceFunction=function(x){
    return x+1;
}
var result=_buildPluginChain(serviceFunction).process(this,[1]);
console.log(result);




