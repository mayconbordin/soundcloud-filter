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
        
        // get the track value for the field being filtered
        var trackValue = info[this.type].toLowerCase().trim();
        // and the value in the filter bar
        var value = this.value.toLowerCase().trim();
        
        if (this.operator == 'exactly')
            return this._hasExactly(value, trackValue);
        else if (this.operator == 'at-least')
            return this._hasAtLeast(value, trackValue);
        else if (this.operator == 'all-words')
            return this._hasAllWords(value, trackValue);
        else if (this.operator == 'any-word')
            return this._hasAnyWord(value, trackValue);
        else if (this.operator == 'not-exactly')
            return this._hasNotExactly(value, trackValue);
        else if (this.operator == 'not-any-word')
            return this._hasNotAnyWord(value, trackValue);
        else if (this.operator == 'not-all-words')
            return this._hasNotAllWords(value, trackValue);
        
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
    
    _hasNotAnyWord: function(filterValue, trackValue) {
        var words = filterValue.split(" ");
        
        for (i=0; i<words.length; i++)
            if (trackValue.indexOf(words[i]) != -1)
                return false;
                
        return true;
    },
    
    _hasAllWords: function(filterValue, trackValue) {
        var words = filterValue.split(" ");
        trackWords = trackValue.split(" ");
        
        for (i=0; i<words.length; i++)
            if (trackWords.indexOf(words[i]) == -1)
                return false;
                
        return true;
    },
    
    _hasNotAllWords: function(filterValue, trackValue) {
        var words = filterValue.split(" ");
        trackWords = trackValue.split(" ");
        var matchCount = 0;
        
        for (i=0; i<words.length; i++)
            if (trackWords.indexOf(words[i]) != -1)
                matchCount++;
                
        return (matchCount != words.length);
    },
    
    _hasExactly: function(filterValue, trackValue) {
        return filterValue == trackValue;
    },
    
    _hasNotExactly: function(filterValue, trackValue) {
        return filterValue != trackValue;
    },
    
    _hasAtLeast: function(filterValue, trackValue) {
        return (trackValue.indexOf(filterValue) != -1);
    }
};
