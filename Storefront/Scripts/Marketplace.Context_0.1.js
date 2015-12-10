var ctx = {

    Language: "",
    TopicId: "",
    TopicName: "",
    TopicNavPosition: "",
    MediaType: "",
    MediaTypeDisplayName: "",
    SearchText: "",
    SearchMediaType: "",
    SelectedMediaId: "",
    SelectedMediaType: "",
    PagerParam: "&pagenum=1",
    SortDirection: "desc",
    GroupFlag: false,
    UrlTracker: [],
    UserInfo: "",
    SelectedList: { name: '', id: '', selectedMediaIds: [] },

    setLanguage: function (language) {
        this.Language = language;
        this.updateContext();
    },

    setMediaType: function (mediaType, displayName) {
        this.clearSearchParms();
        this.MediaType = mediaType;
        this.MediaTypeDisplayName = displayName;
        this.updateContext();
    },

    setTopic: function (topicId, topicName, topicNavPosition) {
        this.SearchText = "";
        this.SearchMediaType = "";
        this.SelectedMediaId = "";
        this.SelectedMediaType = "";

        this.TopicId = topicId;
        this.TopicName = topicName;
        this.TopicNavPosition = topicNavPosition;
        this.updateContext();
    },

    setSearchText: function (searchText) {
        this.SearchText = searchText;
        this.updateContext();
    },

    setSearchMediaType: function (searchMediaType, displayName) {
        this.MediaType = searchMediaType;
        this.SearchMediaType = searchMediaType;
        this.MediaTypeDisplayName = displayName;
        this.updateContext();
    },

    setSelectedMediaId: function (SelectedMediaId) {
        this.SelectedMediaId = SelectedMediaId;
        this.updateContext();
    },

    setSelectedMediaType: function (SelectedMediaType) {
        this.SelectedMediaType = SelectedMediaType;
        this.updateContext();
    },

    setSortDirection: function (SortDirection) {
        this.SortDirection = SortDirection;
        this.updateContext();
    },

    setGroupFlag: function (GroupFlag) {
        this.GroupFlag = GroupFlag;
        this.updateContext();
    },

    setPagerParam: function (pagingParam) {
        this.PagerParam = pagingParam;
        this.updateContext();
    },

    setUserInfo: function (userInfo) {
        this.UserInfo = userInfo;

        if (userInfo !== undefined && userInfo.syndicationLists.length > 0) {
            var selectedList = userInfo.syndicationLists[0];
            this.setSelectedList(selectedList.listName, selectedList.syndicationListId);
        }

        this.updateContext();
    },

    setSelectedList: function (name, id) {
        if (this.SelectedList === undefined) this.SelectedList = { name: '', id: '', selectedMediaIds: [] };
        this.SelectedList.name = name;
        this.SelectedList.id = id;
        //TODO:
        //        var setMediaForList = function (arIdList) { _ctx.SelectedList.selectedMediaIds = arIdList; handleComplete(); };
        //        CDC.SF.SyndicationList.getIds(this.SelectedList.id, setMediaForList);
        if (!this.SelectedList.selectedMediaIds || this.SelectedList.selectedMediaIds.length === 0) {
            $("<div>").retrieveSyndicationList({ context: this, apiRoot: APIRoot });
        }
        this.updateContext();

    },

    clearUserInfo: function () {
        this.UserInfo = "";
        this.SelectedList = undefined;
        this.updateContext();
    },

    clearSearchParms: function () {
        this.MediaType = "";
        this.MediaTypeDisplayName = "";
        this.TopicId = "";
        this.TopicName = "";
        this.TopicNavPosition = "";
        this.SearchText = "";
        this.SearchMediaType = "";
        this.SelectedMediaId = "";
        this.SelectedMediaType = "";
        this.updateContext();
    },

    resetPagerParam: function () {
        this.PagerParam = "&pagenum=1";
        this.updateContext();
    },

    checkUrl: function (url) {
        // used to track url for paging
        var urlToAdd = url.replace(/page=[0-9]*/gi, '');

        if (this.UrlTracker.length == 1) {
            if (this.UrlTracker[0] !== urlToAdd) {
                this.PagerParam = "&pagenum=1";
                url = url.replace(/page=[0-9]*/gi, "&pagenum=1".match(/page=[0-9]*/gi));
            }
            this.UrlTracker.shift();
        }

        this.UrlTracker.push(urlToAdd);
        this.updateContext();
        return url;
    },

    isEmpty: function () {
        return (
                (typeof this.SelectedMediaId == 'undefined' || this.SelectedMediaId === '' || this.SelectedMediaId === 0)
                && (typeof this.TopicId == 'undefined' || this.TopicId === '' || this.TopicId === 0)
                && (typeof this.MediaType == 'undefined' || this.MediaType === '' || this.MediaType === 0)
                && (typeof this.SearchText == 'undefined' || this.SearchText === '')
            );
    },

    updateContext: function () {
        $.cookie("MarketPlaceContext", JSON.stringify(this));
        this.drawContextDebugger();
    },

    drawContextDebugger: function () {

        $('.contextDebugWindow').remove();
        var $div = $("<div class='contextDebugWindow'>");

        $div.css({
            "color": "#cccccc",
            "position": "absolute",
            "top": "0px",
            "left": "0px",
            "border": "1px dashed #cccccc",
            "padding": "10px",
            "background-color": "white",
            "font-size": "smaller"
        });

        $div.append("<div>Language: " + this.Language + "</div>");
        $div.append("<div>MediaType: " + this.MediaType + "</div>");
        $div.append("<div>MediaTypeDisplayName: " + this.MediaTypeDisplayName + "</div>");
        $div.append("<div>Topic: " + this.TopicId + ": " + this.TopicName + "</div>");
        $div.append("<div>TopicNavPosition: " + this.TopicNavPosition + "</div>");
        $div.append("<div>SearchText: " + this.SearchText + "</div>");
        $div.append("<div>SearchMediaType: " + this.SearchMediaType + "</div>");
        $div.append("<div>SelectedMediaId: " + this.SelectedMediaId + "</div>");
        $div.append("<div>SelectedMediaType: " + this.SelectedMediaType + "</div>");
        $div.append("<div>SortDirection: " + this.SortDirection + "</div>");
        $div.append("<div>GroupFlag: " + this.GroupFlag + "</div>");
        $div.append("<div>UserInfo: " + this.UserInfo + "</div>");

        if (APIRoot.indexOf('nchm-dvss1-srv.cdc') > -1) {
            $("body").append($div);
        }
    }
};

    ctx = getCurrentContext(ctx);

    function getCurrentContext(c) {
        var o;
        var stored = $.cookie("MarketPlaceContext");
        if (stored !== null && stored !== '') {
            o = jQuery.parseJSON(stored);

            c.Language = o.Language;
            c.TopicId = o.TopicId;
            c.TopicName = o.TopicName;
            c.TopicNavPosition = o.TopicNavPosition;
            c.MediaType = o.MediaType;
            c.MediaTypeDisplayName = o.MediaTypeDisplayName;
            c.SearchText = o.SearchText;
            c.SearchMediaType = o.SearchMediaType;
            c.SelectedMediaId = o.SelectedMediaId;
            c.SelectedMediaType = o.SelectedMediaType;
            c.SortDirection = o.SortDirection;
            c.GroupFlag = o.GroupFlag;
            c.PagerParam = o.PagerParam;
            c.UrlTracker = o.UrlTracker;
            c.UserInfo = o.UserInfo;
        }

        return c;
    }

