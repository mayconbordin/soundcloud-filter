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
    '<div class="left">' +
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
            '<input id="reposts-checkbox" type="checkbox" name="reposts" value="reposts" checked="checked"/>' +
            '<label for="reposts-checkbox" title="Include reposted tracks"><img alt="Reposts" src="'+repostIcon+'" /></label>' +
        '</div>' +
        
        '<div id="soundcloud-plus-check-playlists" class="soundcloud-plus-check">' +
            '<input id="playlists-checkbox" type="checkbox" name="playlists" value="playlists"/>' +
            '<label for="playlists-checkbox" title="Include playlists"><img alt="Playlists" src="'+playlistIcon+'" /></label>' +
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
            '<option value="comments">Comments</option>' +
            '<option value="reposts">Reposts</option>' +
        '</select>' +
        '<button id="soundcloud-plus-sort" class="sort-asc sc-button sc-button-small sc-button-responsive" tabindex="0" title="Sort">Sort</button>' +
    '</div>' +
'</div></div>';


// State
var hasFilter = false;
var sorter = null;

var app = (function() {
    var store = {};
    var filter = null;
    
    return {
        getTrackInfo: function(track) {
            var id = $(track).find(".soundTitle__title").attr("href").hashCode();
            
            if (!(id in store)) {
                store[id] = getTrackInfo(track);
            }
            return store[id];
        },
        
        setFilter: function(f) {
            filter = f;
        },
        
        getFilter: function() {
            return filter;
        }
    };
})();


// Modify DOM
$( document ).ready(function() {
    $("#app header").after(searchBarHtml);
    $(".l-container.l-content").css({'padding-top': '80px'});

    $("#soundcloud-plus-search").autocomplete({
        serviceUrl: function(query) {
            var baseUrl = 'https://api.soundcloud.com/search/suggest/';
            var args = 'highlight_mode=offsets&limit=10';
            var type = $("#soundcloud-plus-filter-type").val();

            var resource = 'tags';
            if (type == 'title') resource = 'sounds';
            else if (type == 'user') resource = 'people';

            return baseUrl + resource + '?' + args;
        },
        paramName: 'q',
        ajaxSettings: { dataType: "json" },
        transformResult: function(response) {
            return {
                suggestions: $.map(response.suggestions, function(dataItem) {
                    return { value: dataItem.query, data: dataItem.query };
                })
            };
        }
    });
    
    $("#soundcloud-plus-filter-type").change(function() {
        $("#soundcloud-plus-search").val("");
    });
    
    // Events
    $("#soundcloud-plus-apply").click(function() {
        hasFilter = true;
        filterStream();
    });

    $("#soundcloud-plus-reset").click(function() {
        location.reload();
    });
    
    $("#soundcloud-plus-sort").click(function() {
        if (sorter == null) sorter = {};
    
        sorter.field = $("#soundcloud-plus-sort-field").val();
        sorter.order = (sorter.order == null || sorter.order == 'desc') ? 'asc' : 'desc';
        sortStream();
        var sortBtn = $("#soundcloud-plus-sort");
        sortBtn.addClass("sc-button-selected");
        
        if (sorter.order == 'asc') {
            sortBtn.addClass("sort-asc").removeClass("sort-desc");
        } else {
            sortBtn.addClass("sort-desc").removeClass("sort-asc");
        }
    });
    
    var observer = new WebKitMutationObserver(function(mutations, observer) {
        /*var changes = mutations.filter(function(mutation) {
            if ($(mutation.target).prop('class').indexOf('lazyLoadingList__list') != -1) {
                return mutation.target;
            }
        });*/
        
        if (hasFilter) {
            console.log("observer filterStream()");
            filterStream();
        }
        
        
        if (/*changes.length > 0 && */sorter != null) {
            observer.disconnect();
            sortStream();
            observer.observe($(".lazyLoadingList__list")[0], {
              subtree: false,
              childList: true
            });
        }
        
    });

    observer.observe($(".lazyLoadingList__list")[0], {
      subtree: false,
      childList: true
    });
    
    $(document).on("urlChange", function() {
        console.log("url changed");
    });
    
    setInterval((function() {
        var currentUrl = location.href;
        
        return function() {
            if (location.href != currentUrl) {
                currentUrl = location.href;
                $(document).trigger("urlChange");
            }
        }
    })(), 100);
});

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
        user: $(track).find(".soundTitle__username").text().trim(),
        isRepost: ($(track).find(".repostingUser").length > 0) ? true : false,
        isTracklist: ($(track).find(".activity .playlist").length > 0) ? true : false,
        plays: 0, likes: 0, reposts: 0, comments: 0
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
    app.setFilter(f);
    
    var hits = 0;
    
    $(".soundList__item").each(function(i, item) {
        if ($(item).attr("class").indexOf("emptyTrack") != -1) return;
        var info = app.getTrackInfo(item);

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
    
    var loader = $(".lazyLoadingList .loading");

    if (hits < 10) {
        if (loader.css("margin-top") == "0px") {
            loader.css({"margin-top":"800px"});
        }
        
        var pos = loader.offset();
        $(window).scrollTop(pos.top);
    }
    
    if (hits > 10) {
        loader.css({"margin-top":"0px"});
    }
}

function sortStream() {
    console.log("sortStream");

    var tracks = $(".soundList__item");
    tracks.detach();
    
    tracks.sort(function(a, b) {
        var ret = 0;
        var aInfo = app.getTrackInfo(a);
        var bInfo = app.getTrackInfo(b);
        
        if (aInfo[sorter.field] < bInfo[sorter.field]) ret = -1;
        else if (aInfo[sorter.field] > bInfo[sorter.field]) ret = 1;
        
        return (sorter.order == 'asc') ? ret : -ret;
    });
    
    $(".lazyLoadingList__list").append(tracks);
    
    
}



