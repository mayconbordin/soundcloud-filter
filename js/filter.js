var Filter = function() {
    this.value           = null;
    this.type            = null;
    this.operator        = null;
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
        
        if (this.operator == 'exactly')
            return this._hasExactly(value, trackValue);
        else if (this.operator == 'at-least')
            return this._hasAtLeast(value, trackValue);
        else if (this.operator == 'all-words')
            return this._hasAllWords(value, trackValue);
        else if (this.operator == 'any-word')
            return this._hasAnyWord(value, trackValue);
        
        return false;
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
    },
    
    
    _hasAnyWord: function(filterValue, trackValue) {
        var words = filterValue.split(" ");
        
        for (i=0; i<words.length; i++)
            if (trackValue.indexOf(words[i]) != -1)
                return true;
                
        return false;
    },
    
    _hasAllWords: function(filterValue, trackValue) {
        var words = filterValue.split(" ");
        trackWords = trackValue.split(" ");
        
        for (i=0; i<words.length; i++)
            if (trackWords.indexOf(words[i]) == -1)
                return false;
                
        return true;
    },
    
    _hasExactly: function(filterValue, trackValue) {
        return filterValue == trackValue;
    },
    
    _hasAtLeast: function(filterValue, trackValue) {
        return (trackValue.indexOf(filterValue) != -1);
    }
};
