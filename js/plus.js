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

var repostIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+c3RhdHNfcmVwb3N0PC90aXRsZT48ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz48cGF0aCBkPSJNMiA2djUuMDAwMzg1YzAgMS4xMDQzNTY5MDAwMDAwMDA5LjkwMTk1MDM1OTk5OTk5OTggMS45OTk2MTUwMDAwMDAwMDA0IDIuMDA4NTMwMiAxLjk5OTYxNTAwMDAwMDAwMDRoNS45OTE0Njk4bC0yLTJoLTR2LTVoMmwtMy0zLTMgM2gyem00LTNoNS45OTE0Njk4MDAwMDAwMDFjMS4xMDY1Nzk3OTk5OTk5OTg3IDAgMi4wMDg1MzAxOTk5OTk5OTkuODk1MjU4MTE5OTk5OTk5OCAyLjAwODUzMDE5OTk5OTk5OSAxLjk5OTYxNDk3OTk5OTk5OTZ2NS4wMDAzODUwMmgtMnYtNWgtNGwtMi0yem0xMCA3aC02bDMgMyAzLTN6IiBmaWxsPSIjOTk5IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=';

var playlistIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAK0lEQVQ4T2NgGAUMDMabsEGqaojEgPg1oAM8Goz/Y8JRDcRpwAMGoYaRAwCf8KJH7uiMYQAAAABJRU5ErkJggg==';

var searchBarHtml = 
'<div id="soundcloud-plus-bar"><div class="inner">' +
    '<label>Filter by</label>' +
    '<select id="soundcloud-plus-filter-type">' +
        '<option value="tag">Tag</option>' +
        '<option value="title">Title</option>' +
        '<option value="user">User</option>' +
    '</select>' +
    '<input id="soundcloud-plus-search" name="soundcloud-plus-search"/>' +
    '<label>at least</label>' +
    '<input type="number" id="soundcloud-plus-min-counter" name="soundcloud-plus-min-counter"/>' +
    '<select id="soundcloud-plus-counter-type">' +
        '<option value="plays">Plays</option>' +
        '<option value="likes">Likes</option>' +
        '<option value="comments">Comments</option>' +
        '<option value="reposts">Reposts</option>' +
    '</select>' +
    
    '<div id="soundcloud-plus-check-reposts" class="soundcloud-plus-check">' +
        '<input id="reposts-checkbox" type="checkbox" name="reposts" value="reposts"/>' +
        '<label for="reposts-checkbox" title="Include reposted tracks"><img alt="Reposts" src="'+repostIcon+'" /></label>' +
    '</div>' +
    
    '<div id="soundcloud-plus-check-playlists" class="soundcloud-plus-check">' +
        '<input id="playlists-checkbox" type="checkbox" name="playlists" value="playlists"/>' +
        '<label for="playlists-checkbox" title="Include playlists"><img alt="Playlists" src="'+playlistIcon+'" /></label>' +
    '</div>' +
    
    '<button id="soundcloud-plus-apply" class="sc-button sc-button-small sc-button-responsive" tabindex="0" title="Filter">Apply</button>' +
    
    '<button id="soundcloud-plus-reset" class="sc-button sc-button-small sc-button-responsive" tabindex="0" title="Reset">Reset</button>' +
'</div></div>';

var emptyTrackHtml = '<li id="emptyTrack" class="soundList__item emptyTrack"><p>Scroll to load more</p></li>';

// Modify DOM
$("#app header").after(searchBarHtml);
$(".l-container.l-content").css({'padding-top': '80px'});

// State
var hasFilter = false;

var trackInfo = (function() {
    var store = {};
    
    return {
        get: function(track) {
            var id = $(track).find(".soundTitle__title").attr("href").hashCode();
            
            if (!(id in store)) {
                store[id] = getTrackInfo(track);
            }
            return store[id];
        }
    };
})();

// Functions
function getInputValue(sel) {
    if ($(sel).length == 0) return null;
    var value = $(sel).val().trim();
    if (value == null || value.length == 0) return null;
    return value;
}

function getFilterAttrs() {
    var keyword = getInputValue("#soundcloud-plus-search");
    
    return {
        keyword      : (keyword == null) ? null : keyword.toLowerCase(),
        counter      : parseInt(getInputValue("#soundcloud-plus-min-counter")) || null,
        filterType   : $("#soundcloud-plus-filter-type").val(),
        counterType  : $("#soundcloud-plus-counter-type").val(),
        showReposts  : $("#reposts-checkbox").prop("checked"),
        showPlaylists: $("#playlists-checkbox").prop("checked")
    };
}

function getTrackInfo(track) {
    var info = {
        id: $(track).find(".soundTitle__title").attr("href").hashCode(),
        tag: $(track).find(".soundTitle__tagContent").text(),
        title: $(track).find(".soundTitle__title").text().trim(),
        user: $(track).find(".soundTitle__username").text(),
        isRepost: ($(track).find(".repostingUser").length > 0) ? true : false,
        isTracklist: ($(track).find(".activity .playlist").length > 0) ? true : false,
    };
    
    $(track).find(".sc-ministats-item").each(function(i, item) {
        var cItem = $(item).children();
        var stats = cItem.prop("class").replace(/sc-ministats|small|-/g, "").trim();
        info[stats] = parseInt(cItem.find("span").eq(1).text().replace(",", "")) || 0;
    });
    
    return info;
}

function filterStream() {
    var f = getFilterAttrs();
    var hits = 0;
    var items = $(".soundList__item");
    
    items.each(function(i, item) {
        if ($(item).attr("class").indexOf("emptyTrack") != -1) return;
        var info = trackInfo.get(item);

        if ((f.keyword == null || info[f.filterType].toLowerCase().indexOf(f.keyword) != -1)
            && (f.counter == null || info[f.counterType] >= f.counter)
            && (f.showReposts == true || info.isRepost == false)
            && (f.showPlaylists == true || info.isTracklist == false)
        ) {
            hits++;
        } else {
            $(item).remove();
        }
    });

    if (hits < 10) {
        // if emptyTrack item is not the last
        if (items.length > 0 && items.last().attr("class").indexOf("emptyTrack") == -1) {
            $("#emptyTrack").remove();
        }
        
        if ($("#emptyTrack").length == 0) {
            $("ul.lazyLoadingList__list").append(emptyTrackHtml);
        }
    }
    
    if (hits > 10 && $("#emptyTrack").length != 0) {
        $("#emptyTrack").remove();
    }
}


// Events
$("#soundcloud-plus-apply").click(function() {
    hasFilter = true;
    filterStream();
});

$("#soundcloud-plus-reset").click(function() {
    location.reload();
});


var observer = new WebKitMutationObserver(function(mutations, observer) {
    if (hasFilter) filterStream();
});

observer.observe(document, {
  subtree: true,
  childList: true
});
