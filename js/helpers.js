String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function isDevMode() {
    return !('update_url' in chrome.runtime.getManifest());
}

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

var Utils = {
    sanitize: function(v) {
        if (v == null) return null;
        var value = v.trim();
        if (value.length == 0) return null;
        return value;
    },
    
    parseInt: function(n) {
        if (n == null) return null;
        return parseInt(n);
    },
    
    isNumeric: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    parseIntegerString: function(numStr) {
        if (numStr == null || numStr.trim().length == 0)
            return 0;
        
        numStr = numStr.trim().replace(/,/gi, "");
        numStr = numStr.replace(/K|M|G/gi, function(x) {
            if (x == 'K') return '000';
            else if (x == 'M') return '000000';
            else if (x == 'G') return '000000000';
        });
        
        if (!Utils.isNumeric(numStr))
            return 0;
    
        return parseInt(numStr);
    }
};

var Log = (function() {
    
    function concatArgs(args) {
        var str = "";
        for (i=0; i<args.length; i++) {
            var arg = args[i];
            
            if (typeof(arg) == 'string')
                str += arg;
            else
                str += JSON.stringify(arg);
        }
        return str;
    }
    
    return {
        info: function() {
            if (isDevMode())
                console.log(concatArgs(arguments));
        },
        
        error: function() {
            if (isDevMode())
                console.error(concatArgs(arguments));
        }
    };
    
})();
