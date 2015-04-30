var Icons = {
    repost: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+c3RhdHNfcmVwb3N0PC90aXRsZT48ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz48cGF0aCBkPSJNMiA2djUuMDAwMzg1YzAgMS4xMDQzNTY5MDAwMDAwMDA5LjkwMTk1MDM1OTk5OTk5OTggMS45OTk2MTUwMDAwMDAwMDA0IDIuMDA4NTMwMiAxLjk5OTYxNTAwMDAwMDAwMDRoNS45OTE0Njk4bC0yLTJoLTR2LTVoMmwtMy0zLTMgM2gyem00LTNoNS45OTE0Njk4MDAwMDAwMDFjMS4xMDY1Nzk3OTk5OTk5OTg3IDAgMi4wMDg1MzAxOTk5OTk5OTkuODk1MjU4MTE5OTk5OTk5OCAyLjAwODUzMDE5OTk5OTk5OSAxLjk5OTYxNDk3OTk5OTk5OTZ2NS4wMDAzODUwMmgtMnYtNWgtNGwtMi0yem0xMCA3aC02bDMgMyAzLTN6IiBmaWxsPSIjOTk5IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=',
    playlist: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAK0lEQVQ4T2NgGAUMDMabsEGqaojEgPg1oAM8Goz/Y8JRDcRpwAMGoYaRAwCf8KJH7uiMYQAAAABJRU5ErkJggg=='
}

var Template = {
    searchBar: 
'<div id="soundcloud-plus-bar"><div class="inner">' +
    '<div class="left">' +
        '<label>Filter by</label>' +
        '<select id="soundcloud-plus-filter-type">' +
            '<option value="tag">Tag</option>' +
            '<option value="title">Title</option>' +
            '<option value="user">User</option>' +
        '</select>' +
        '<input id="soundcloud-plus-search" name="soundcloud-plus-search"/>' +
        '<label>with</label>' +
        
        '<select id="soundcloud-plus-counter-operator">' +
            '<option value="at-least">at least</option>' +
            '<option value="at-most">at most</option>' +
        '</select>' +
        
        '<input type="number" id="soundcloud-plus-counter" name="soundcloud-plus-counter"/>' +
        '<select id="soundcloud-plus-counter-type">' +
            '<option value="plays">Plays</option>' +
            '<option value="likes">Likes</option>' +
            '<option value="comments">Comments</option>' +
            '<option value="reposts">Reposts</option>' +
        '</select>' +
        
        '<div id="soundcloud-plus-check-reposts" class="soundcloud-plus-check">' +
            '<input id="reposts-checkbox" type="checkbox" name="reposts" value="reposts" checked="checked"/>' +
            '<label for="reposts-checkbox" title="Include reposted tracks"><img alt="Reposts" src="'+Icons.repost+'" /></label>' +
        '</div>' +
        
        '<div id="soundcloud-plus-check-playlists" class="soundcloud-plus-check">' +
            '<input id="playlists-checkbox" type="checkbox" name="playlists" value="playlists"/>' +
            '<label for="playlists-checkbox" title="Include playlists"><img alt="Playlists" src="'+Icons.playlist+'" /></label>' +
        '</div>' +
        
        '<button id="soundcloud-plus-apply" class="sc-button sc-button-small sc-button-responsive" tabindex="0" title="Filter">Apply</button>' +
        
        '<button id="soundcloud-plus-reset" class="sc-button sc-button-small sc-button-responsive" tabindex="0" title="Reset">Reset</button>' +
    '</div>' +
    
    '<div class="right">' +
        '<select id="soundcloud-plus-sort-field">' +
            '<option value="plays">Plays</option>' +
            '<option value="title">Title</option>' +
            '<option value="user">User</option>' +
            '<option value="likes">Likes</option>' +
            '<option value="date">Date</option>' +
            '<option value="comments">Comments</option>' +
            '<option value="reposts">Reposts</option>' +
        '</select>' +
        '<button id="soundcloud-plus-sort" class="sort-asc sc-button sc-button-small sc-button-responsive" tabindex="0" title="Sort">Sort</button>' +
    '</div>' +
'</div></div>'
};






var View = function() {};

View.prototype = {
    initialize: function(el) {
        this.html = $(el);
    }
};

var TextInput = function(el, filters) {
    View.prototype.initialize.call(this, el);
    
    if (typeof(filters) == 'undefined')
        this.filters = [Utils.sanitize];
    else
        this.filters = filters;
};

TextInput.prototype = new View();
TextInput.prototype.constructor = TextInput;
TextInput.prototype.bind = function(obj, fieldName) {
    var self = this;
    
    this.bindObject = obj;
    this.bindField = fieldName;
    
    this.updateValue();
    
    this.html.on('input propertychange paste', function(e) {
        self.updateValue();
    });
};

TextInput.prototype.updateValue = function() {
    var value = this.getValue();
    Log.info("Updating value of bind object field '", this.bindField, "' to '", value, "'");
    this.bindObject[this.bindField] = value;
};

TextInput.prototype.getValue = function() {
    var value = this.html.val();
    for (i=0; i<this.filters.length; i++)
        value = this.filters[i](value);
    return value;
};

TextInput.prototype.setValue = function(v) {
    this.html.val(v);
};

// checkbox
var CheckBox = function(el) {
    View.prototype.initialize.call(this, el);
};

CheckBox.prototype = new View();
CheckBox.prototype.constructor = CheckBox;
CheckBox.prototype.bind = function(obj, fieldName) {
    var self = this;
    
    this.bindObject = obj;
    this.bindField = fieldName;
    
    this.updateValue();
    
    this.html.change(function(e) {
        self.updateValue();
    });
};

CheckBox.prototype.updateValue = function() {
    var value = this.getValue();
    Log.info("Updating value of bind object field '", this.bindField, "' to '", value, "'");
    this.bindObject[this.bindField] = value;
};

CheckBox.prototype.getValue = function() {
    var value = this.html.prop('checked');
    return value;
};

// loader
var Loader = function(el) {
    View.prototype.initialize.call(this, el);
};

Loader.prototype = new View();
Loader.prototype.constructor = Loader;
Loader.prototype.update = function(hits) {
    if (hits < 10) {
        if (this.html.css("margin-top") == "0px") {
            this.html.css({"margin-top":"800px"});
        }
        
        var pos = this.html.offset();
        $(window).scrollTop(pos.top);
    }
    
    if (hits > 10) {
        this.html.css({"margin-top":"0px"});
    }
};
