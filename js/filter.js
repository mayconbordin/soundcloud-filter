var Filter = function() {
    this.value           = null;
    this.type            = null;
    this.counterValue    = null;
    this.counterType     = null;
    this.counterOperator = null;
    this.showReposts     = null;
    this.showPlaylists   = null;
};

Filter.prototype = {
    match: function(info) {
        return (this._matchFilterValue(info) && this._matchCounterValue(info) 
            && this._matchReposts(info) && this._matchPlaylists(info));
    },
    
    _matchFilterValue: function(info) {
        if (this.value == null) return true;
        
        var trackValue = info[this.type].toLowerCase();
        var value = this.value.toLowerCase();
        
        return (trackValue.indexOf(value) != -1);
    },
    
    _matchCounterValue: function(info) {
        if (this.counterValue == null) return true;
        
        if (this.counterOperator == 'at-least')
            return (info[this.counterType] >= this.counterValue);
        else if (this.counterOperator == 'at-most')
            return (info[this.counterType] <= this.counterValue);
        
        return false;
    },
    
    _matchReposts: function(info) {
        return (this.showReposts == true || info.isRepost == false);
    },
    
    _matchPlaylists: function(info) {
        return (this.showPlaylists == true || info.isTracklist == false);
    }
};
