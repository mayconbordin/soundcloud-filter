/**
 * SoudCloudFilter is a Google Chrome extension that adds a filter bar after the
 * SoundCloud header for sorting and filtering the tracks based on several parameters.
 *
 * @author Maycon Viana Bordin <mayconbordin@gmail.com>
 * @version 1.4.0
 */
var SoundCloudFilter = (function() {
    var store  = {};
    var filter = {
        value: null, type: null, counterValue: null, counterType: null,
        counterOperator: null, showReposts: null, showPlaylists: null
    };
    var sorter = null;
    
    var hasFilter = false;
    
    var html = $(Template.searchBar);
    
    var view = null;
    
    var loadView = function() {
        return {
            list: $(".lazyLoadingList__list")[0],
        
            filterValue: new TextInput(html.find("#soundcloud-plus-search")),
            filterType: new TextInput(html.find("#soundcloud-plus-filter-type")),
            
            counterValue: new TextInput(html.find("#soundcloud-plus-counter"), [Utils.sanitize, Utils.parseInt]),
            counterType: new TextInput(html.find("#soundcloud-plus-counter-type")),
            counterOperator: new TextInput(html.find("#soundcloud-plus-counter-operator")),
            
            repostCheck: new CheckBox(html.find("#soundcloud-plus-check-reposts")),
            playlistCheck: new CheckBox(html.find("#soundcloud-plus-check-playlists")),
            
            applyBtn: html.find("#soundcloud-plus-apply"),
            resetBtn: html.find("#soundcloud-plus-reset"),
            
            sortField: new TextInput(html.find("#soundcloud-plus-sort-field")),
            sortBtn: html.find("#soundcloud-plus-sort"),
            
            loader: new Loader($(".lazyLoadingList .loading"))
        };
    };
    
    var autocompleteOptions = {
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
    };
    
    return {
        initialize: function() {
            var self = this;
            
            // load view variables
            view = loadView();
            
            // append filter bar to page
            $("#app header").after(html);
            $(".l-container.l-content").css({'padding-top': '80px'});
            
            // initialize autocomplete of filter value
            view.filterValue.html.autocomplete(autocompleteOptions);

            // watch for input changes
            view.filterValue.bind(filter, 'value');
            view.filterType.bind(filter, 'type');
            view.counterValue.bind(filter, 'counterValue');
            view.counterType.bind(filter, 'counterType');
            view.counterOperator.bind(filter, 'counterOperator');
            
            view.repostCheck.bind(filter, 'showReposts');
            view.playlistCheck.bind(filter, 'showPlaylists');
            
            // register events
            view.filterType.html.change(function(e) { self.onFilterTypeChange(e); });
            view.applyBtn.click(function(e) { self.applyFilter(); });
            view.resetBtn.click(function() { location.reload(); });
            view.sortBtn.click(function() { self.onSortBtnClick(); });
            
            // start the list observer
            this._createObserver();
        },
        
        /**
         * Update the filter object with the latest values from the input fields,
         * should be called before using the filter values.
         */
        updateFilter: function() {
            for (attr in ['filterValue', 'filterType', 'counterType', 'counterValue',
                          'counterOperator', 'repostCheck', 'playlistCheck']) {
                if (view[attr] instanceof TextInput || view[attr] instanceof CheckBox)
                    view[attr].updateValue();
            }
        },
        
        /**
         * Create a new sorter object if it doesn't exists and fill the field name
         * and sorting order information.
         */
        updateSorter: function() {
            if (sorter == null) sorter = {};
    
            sorter.field = view.sortField.getValue();
            sorter.order = (sorter.order == null || sorter.order == 'desc') ? 'asc' : 'desc';
        },
        
        /**
         * Get the latest filter parameters and apply them to the track list,
         * removing the items that do not fall inside the parameters.
         */
        applyFilter: function() {
            var self = this;
            
            hasFilter = true;
            this.updateFilter();
            
            Log.info("applyFilter: ", filter);
            
            var hits = 0;
    
            $(".soundList__item").each(function(i, item) {
                if ($(item).attr("class").indexOf("emptyTrack") != -1) return;
                var info = self.getTrackInfo(item);

                if (
                    // no keyword or keyword inside track info field (filterType)
                    (filter.value == null || info[filter.type].toLowerCase().indexOf(filter.value) != -1)
                    
                    // no counter or track counter within counter value and operation
                    && (filter.counterValue == null || (
                        (filter.counterOperator == 'at-least' && info[filter.counterType] >= filter.counterValue) ||
                        (filter.counterOperator == 'at-most' && info[filter.counterType] <= filter.counterValue)
                    ))
                    
                    // include or not reposts and playlists
                    && (filter.showReposts == true || info.isRepost == false)
                    && (filter.showPlaylists == true || info.isTracklist == false)
                ) {
                    hits++;
                } else {
                    $(item).remove();
                }
            });
            
            view.loader.update(hits);
        },

        /**
         * Returns an object with the parsed info of a track, extracted from the
         * list item html element. Uses the store object to cache results.
         * @param {HTMLLIElement} track
         * @return {object}
         */
        getTrackInfo: function(track) {
            var id = $(track).find(".soundTitle__title").attr("href").hashCode();
            
            if (!(id in store)) {
                store[id] = this._trackInfo(track);
            }
            return store[id];
        },
        
        /**
         * Extracts the information of the track from the HTML element.
         * @param {HTMLLIElement} track
         * @return {object}
         */
        _trackInfo: function(track) {
            var info = {
                id         : $(track).find(".soundTitle__title").attr("href").hashCode(),
                tag        : $(track).find(".soundTitle__tagContent").text(),
                title      : $(track).find(".soundTitle__title").text().trim(),
                user       : $(track).find(".soundTitle__username").text().trim(),
                isRepost   : ($(track).find(".repostingUser").length > 0) ? true : false,
                isTracklist: ($(track).find(".activity .playlist").length > 0) ? true : false,
                plays      : 0,
                likes      : 0,
                reposts    : 0,
                comments   : 0
            };
            
            $(track).find(".sc-ministats-item").each(function(i, item) {
                var cItem = $(item).children();
                var stats = cItem.prop("class").replace(/sc-ministats|small|-/g, "").trim();
                info[stats] = parseInt(cItem.find("span").eq(1).text().replace(",", "")) || 0;
            });
            
            return info;
        },
        
        /**
         * Stop the list observer. Use when sorting to avoid filtering the list.
         */
        _stopObserver: function() {
            if (this.listObserver != null)
                this.listObserver.disconnect();
        },
        
        /**
         * Create a new observer, if it is the first time, or reactivate the observer.
         */
        _createObserver: function() {
            var self = this;
            
            if (this.listObserver == null)
                this.listObserver = new WebKitMutationObserver(function(mutations, observer) {
                    self.onListChange();
                });

            this.listObserver.observe(view.list, {
              subtree: false,
              childList: true
            });
        },
        
        /**
         * Called when the sort button is clicked, then updates the sorter data
         * and sort the track list. Also changes the view of the button to reflect
         * the sorting order.
         */
        onSortBtnClick: function() {
            this.updateSorter();
            this.sortStream();
            
            view.sortBtn.addClass("sc-button-selected");
            
            if (sorter.order == 'asc') {
                view.sortBtn.addClass("sort-asc").removeClass("sort-desc");
            } else {
                view.sortBtn.addClass("sort-desc").removeClass("sort-asc");
            }
        },
        
        /**
         * Called when the value of the filter type selector changes. It clears
         * the input data of the filter value field.
         */
        onFilterTypeChange: function(e) {
            view.filterValue.setValue("");
        },
        
        /**
         * Called by the list observer every time a change occurs in the list,
         * which means that the list has been updated with new tracks that must be
         * sorted and/or filtered if necessary.
         */
        onListChange: function() {
            if (hasFilter) {
                Log.info("onListChange");
                this.applyFilter();
            }

            if (sorter != null) {
                this._stopObserver();
                
                this.sortStream();
                
                this._createObserver();
            }
        },
        
        /**
         * Detach all tracks from the list, then sorts the array accordingly, based
         * on the data from the sorter object, and then appends the sorted list back
         * to the tracklist.
         */
        sortStream: function() {
            var self = this;
            Log.info("sortStream: ", sorter);

            var tracks = $(".soundList__item");
            tracks.detach();
            
            tracks.sort(function(a, b) {
                var ret = 0;
                var aInfo = self.getTrackInfo(a);
                var bInfo = self.getTrackInfo(b);
                
                if (aInfo[sorter.field] < bInfo[sorter.field]) ret = -1;
                else if (aInfo[sorter.field] > bInfo[sorter.field]) ret = 1;
                
                return (sorter.order == 'asc') ? ret : -ret;
            });
            
            $(view.list).append(tracks);
        }
    };
})();


// start plug-in
$(document).ready(function() {
    SoundCloudFilter.initialize();
});
