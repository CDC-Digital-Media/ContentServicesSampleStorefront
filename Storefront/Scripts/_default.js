
// global page vars
var $mediaTypeNavigation;
var pgnum = null;  // placeholder until page is returned in result set.
var $centerPanel = null;
var $featuredContent;
var $mediaContent;

//fix for IE
if (!window.console) { console = {}; }
console.log = console.log || function () { };
console.warn = console.warn || function () { };
console.error = console.error || function () { };
console.info = console.info || function () { };
console.debug = console.debug || console.log;

$(document).ready(function () {

    $centerPanel = $(".centerPanel");
    $mediaContent = $centerPanel.find(".mediaContent");
    $featuredContent = $centerPanel.find(".featuredContent");

    var url = $.url();
    if (url.param('mediaId') !== "undefined") {
        ctx.setSelectedMediaId(url.param('mediaId'));
    }
    if (url.param('ecardReceiptId') !== undefined) {
        $mediaContent.showSpinner().receiveEcard({ receiptId: url.param('ecardReceiptId'), apiRoot: APIRoot });
        if (ctx.UserInfo !== '') {
            setupUserHeader(ctx.UserInfo);
            //            setUserAccountView(false, ctx.UserInfo);
        }
        $featuredContent.hide();
        setUpPageNav();
        $(".searchPanel").hide();
        return;
    }
    if (url.param("prt") !== undefined) {
        setLoginView(false);
        //preProcessForLogin();
        $mediaContent.reset({ cancelHandler: generateTiles, apiRoot: APIRoot });
        return;
    }

    setUpPageNav();

    //    if (ctx.UserInfo !== '') {
    //        setupUserHeader(ctx.UserInfo);
    //        setUserAccountView(false, ctx.UserInfo);
    //        showResults();
    //    }
    //    else {
    //        showResults();
    //    }

    if (ctx.UserInfo !== '') {
        setupUserHeader(ctx.UserInfo);
    }
    showResults();
});

function setUpPageNav() {

    $(".languagePicker").languagePulldown({
        selectedValue: ctx.Language,
        selectHandler: function (l) { ctx.setLanguage(l); }
    });

    $(".mediaTypeFilter").mediaPulldown({
        selectedValue: ctx.SearchMediaType,
        selectHandler: function (mt, displayName) { ctx.setSearchMediaType(mt, displayName); }
    });

    $mediaTypeNavigation = $(".panmedia ul").mediaNav({
        selectedValue: ctx.MediaType,
        navigationHandler: mediaTypeNavHandler
    });

    buildLeftNav();

    $('a[href*="Default.htm"],a[href*="Default.htm"]').click(function () {
        $(".panmedia").find("a").removeClass("active");
        $(".leftNav").find("li").removeClass("active");
        $(".mediaTypeFilter").parent().show();
        $(".searchPanel .header").text("Search Media");

        setDefaultView();
        return false;
    });

    $(".btnSearch").click(function () {
        var searchTerm = $(".txtSearch").val();
        if (searchTerm !== '') {
            validateDomain(searchTerm, $(".txtSearch"));
            textSearchHandler($(".txtSearch").val());
            return false;
        }
    });

    $(".btnCreateAccount").click(function() {
        setRegistrationView();
        return false;
    });

    $(".btnSignIn").click(function () {
        setLoginView(false);
        return false;
    });
    $('.divSignedIn').hide();

    $(document).keypress(function (e) {
        if (e.which == 13) {
            // enter pressed
            if ($(".txtSearch").val() !== '') {
                $(".btnSearch").click();
                return false;
            }
            return true;
        }
    });

}

var showResults = function () {
    // What do I display based on stored context?
    if (typeof ctx.SelectedMediaId !== 'undefined' && ctx.SelectedMediaId !== '' && ctx.SelectedMediaId !== 0) { // do I have a media Id?
        mediaHandler(ctx.SelectedMediaId);
    }
    else if (typeof ctx.TopicId !== 'undefined' && ctx.TopicId !== '' && ctx.TopicId !== 0) { // do I have a topic?
        topicNavHandler(ctx.TopicId, ctx.TopicName);
    }
    else if ((typeof ctx.MediaType !== 'undefined' && ctx.MediaType !== '' && ctx.MediaType !== 0)) { // do I have a media type?
        mediaTypeNavHandler(ctx.MediaType);
    }
    else { // else show default view
        setDefaultView();
    }
};

function buildLeftNav() {

    $(".leftNav ul").topicNav({
        navDataUrl: APIRoot + '/api/v1/resources/topics.json?mediatype=' + ctx.MediaType + '&showchild=true&ttl=900&callback=?',
        navigationHandler: topicNavHandler,
        insertAfter: 0,
        selectedValue: ctx.TopicNavPosition
    });

}

function getDataUrl() {

    var url = APIRoot + '/api/v1/resources/media.json?max=12&ttl=900';

    var sort = "";
    var mt = "";

    // media type filter
    if (ctx.SearchMediaType !== '') {
        url += '&mediatype=' + ctx.SearchMediaType;

    } else if (ctx.MediaType !== '') {
        mt = ctx.MediaType;
        if (ctx.MediaType == 'Podcast') {
            mt = 'Podcast Series,Podcast';
            sort = '-mediatype';
        }
        url += '&mediatype=' + mt;
    }

    // sortign setup
    // http://nchm-dvss1-srv.cdc.gov/api/v1/resources/media/?sort=mediatype,-activedate&max=5&page=1


    // sort filter
    if (ctx.GroupFlag) {
        sort = 'mediatype';
    }
    else {
        if (sort === '') {
            sort = ctx.SortDirection == 'asc' ? '' : '-';
            sort += 'datepublished';
        }
    }

    url += sort === '' ? '' : '&sort=' + sort;
    url += ctx.TopicId !== '' ? '&topicid=' + ctx.TopicId : '';
    url += ctx.SearchText !== '' ? '&q=' + ctx.SearchText : '';
    url += ctx.PagerParam;
    url += '&callback=?';

    
    url = ctx.checkUrl(url);

    // debugger
    if (APIRoot.indexOf('nchm-dvss1-srv.cdc.gov')>-1){
        if ($(".urlDebugWindow").length === 0) {
            var $div = $("<div class='urlDebugWindow'></div>");
            $div.css({
                "color": "#cccccc",
                "border": "1px dashed #cccccc",
                "padding": "10px",
                "background-color": "white",
                "font-size": "smaller"
            });

            $(".versionNumber").append($div);
        }

        var $url = $("<div>" + url + "</div>");
        $(".urlDebugWindow").append($url);
    }

    return url;
}

function getContentHeader() {
    var headerText = 'All Media Content';
    if (ctx.MediaType !== '') {
        var type = ctx.MediaTypeDisplayName;
        type = type == "Podcasts" ? 'Podcast Series and Podcasts' : type;
        headerText = type;
    }
    if (ctx.TopicName !== '') { headerText = ctx.TopicName; }
    if (ctx.SearchText !== '') {
        if (ctx.SearchMediaType !== '') {
            headerText = "Results for '" + ctx.SearchText + "' in " + ctx.MediaTypeDisplayName;
        }
        else {
            headerText = "Results for '" + ctx.SearchText + "'";
        }
    }
    
    return headerText;
}

var mediaTypeNavHandler = function (mediaType) {

    //mediaType = mediaType === 'Podcast Series' ? 'Podcast' : mediaType;

    var displayName = $mediaTypeNavigation.setSelected(mediaType);

    preProcessForResults();

    if (ctx.MediaType !== mediaType) {
        ctx.setMediaType(mediaType, displayName);
    }

    $(".mediaTypeFilter").parent().hide();
    $(".searchPanel .header").text("Search " + ctx.MediaTypeDisplayName);
    $(".searchPanel .txtSearch").val('');

    buildLeftNav();
    $(".searchPanel .crumb").crumb({ context: ctx });
    generateTiles();
};

var topicNavHandler = function (id, title, navPosition) {
    preProcessForResults();
    ctx.setTopic(id, title, navPosition);
    $(".searchPanel .crumb").crumb({ context: ctx });
    $(".searchPanel .txtSearch").val("");
    generateTiles();
};

var textSearchHandler = function (txtSearch) {

    preProcessForResults();
    ctx.setSearchText(txtSearch);
    $(".searchPanel .crumb").crumb({ context: ctx });
    generateTiles();

};

var mediaHandler = function (mediaId) {

    preProcessForItem();

    $.ajax({
        url: APIRoot + '/api/v1/resources/media/' + mediaId + '.json?ttl=900&callback=?',
        dataType: 'jsonp'
    })
    .done(function (response) {
        var mediaItem;
        if (response.meta.status !== 200) {
            alert(response.meta.message[0].userMessage);
            return;
        }
        if (response.results.length > 0) {
            mediaItem = response.results[0];
            if (!mediaItem.mediaId) {
                mediaItem.mediaId = mediaItem.id;
            }
            displayMediaItem(mediaItem);
        }
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
    });
};

function displayMediaItem(mediaItem) {

    var $mediaHeader = $centerPanel.find(".csMediaHeader").mediaHeader({
        mediaItem: mediaItem,
        topicNavHandler: topicNavHandler,
        postProcessHandler: postProcessForItem,
        dateFormatter: formatDateForDisplay,
        htmlDecoder: decode
    });

    $centerPanel.find(".csMediaContainer").empty();

    var returnFunct = typeof returnHandler === 'function' ? returnHandler : returnToResults;

    switch (mediaItem.mediaType) {
        case 'HTML':
            $centerPanel.find(".csMediaContainer").htmlContentEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'eCard':
            $centerPanel.find(".csMediaContainer").ecardEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'Widget':
            $centerPanel.find(".csMediaContainer").widgetEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'Image':
            $centerPanel.find(".csMediaContainer").imageEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'Button':
            $centerPanel.find(".csMediaContainer").buttonEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'Badge':
            $centerPanel.find(".csMediaContainer").badgeEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'Infographic':
            $centerPanel.find(".csMediaContainer").infographicEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'Video':
            $centerPanel.find(".csMediaContainer").videoEmbed({ mediaItem: mediaItem, returnHandler: returnToResults }); break;
        case 'Podcast':
            $centerPanel.find(".csMediaContainer").podcastEmbed({ mediaItem: mediaItem, returnHandler: returnToResults, navigationHandler: mediaHandler }); break;
        case 'Podcast Series':
            $centerPanel.find(".csMediaContainer").podcastChannel({
                mediaId: mediaItem.mediaId,
                apiRoot: APIRoot,
                syndicateHandler: childMediaSelected,
                returnHandler: returnToResults
                }); break;
    }
    
}


var childMediaSelected = function (mediaId) {
    var ids = [ctx.SelectedMediaId];
    ids.push(mediaId);
    ctx.setSelectedMediaId(ids);

    mediaHandler(mediaId);
};

var returnToResults = function () {

    if ($.isArray(ctx.SelectedMediaId)) {
        // media id is a list, indicating that a child of a media was selected and the return needs to
        // point to the parent. Currently handling just one level of child item.
        ctx.setSelectedMediaId(ctx.SelectedMediaId[0]);
        mediaHandler(ctx.SelectedMediaId);
    }
    else {

        ctx.setSelectedMediaId("");
        if (ctx.isEmpty()) {
            // returning to home page where featured content should be visible.
            $(".featuredContent").show();
        }
        $(".dynamic").show();
        $(".pagination").show();
        $mediaContent.find(".csMediaHeader, .csMediaContainer").remove();

    }

};

var setDefaultView = function () {

    preProcessForResults();

    //reset everything
    ctx.clearSearchParms();
    ctx.resetPagerParam();

    $(".mediaTypeFilter").parent().show();
    $(".searchPanel .header").text("Search Media");
    $(".searchPanel .txtSearch").val("");
    $(".searchPanel .crumb").crumb({ context: ctx });
    generateTiles();

    setupFeaturedCarousel();

};


var setRegistrationView = function () {
    preProcessForRegistration();
    $mediaContent.registration({
        submitHandler: setUserAccountView,
        cancelHandler: setDefaultView,
        postProcess: postProcessForRegistration
    });
};

var setLoginView = function () {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////@@@@@@@@@@@@@@@@

    preProcessForLogin();
    $mediaContent.login({
        submitHandler: setUserAccountView,
        cancelHandler: setDefaultView,
        context: ctx
    });
};

var setUserAccountView = function (isNewAccount, userInfo) {

    ctx.setUserInfo(userInfo);

    setupUserHeader(userInfo);

    preProcessForUserAccount();
    $mediaContent.account({
        showNewMsg: isNewAccount,
        context: ctx,
        mediaHandler: mediaHandler
    });
};

var setLogoutView = function () {
    $('.divSignIn').show();
    $('.divSignedIn').hide();

    var $newUserLbl = $("<a class='btn btn-link btn-small nolink' href='#'>New user?</a>");
    var $newUserLink = $("<a class='btn btn-link btn-small btnCreateAccount' data-toggle='dropdown' href='#'>Create Account</a>");

    $newUserLink.click(function () {
        setRegistrationView();
        return false;
    });

    $('.newUser').empty()
        .append($newUserLbl)
        .append($newUserLink);

    setDefaultView();
};

var setupUserHeader = function (userInfo) {
    $('.divSignIn').hide();
    //$('.divSignedIn .userName').text(userInfo.firstName + " " + userInfo.middleName + " " + userInfo.lastName + ", default domain name ");
    $(".divSignedIn .userName").text(userInfo.User.firstName + " " + userInfo.User.middleName + " " + userInfo.User.lastName);
    $('.divSignedIn').show();

    var $logout = $("<a class='btn btn-link btn-small' href='#'>Log Out</a>");
    $logout.click(function () {
        setLogoutView();
        ctx.clearUserInfo();
    });

    $(".syndicationlistPicker").domainPicker({ selectHandler: '', postProcess: '', context: ctx });

    $("a.btnUsername").click(function () {
        setUserAccountView(false, userInfo);
    });
    $('.newUser').empty().append($logout);
};

var generateTiles = function (dataUrl) {

    if (typeof dataUrl === "undefined") { dataUrl = getDataUrl(); pgnum = 1; }

    $centerPanel.find(".dynamic").empty().showSpinner();

    // define function to call when paging.
    var performPaging = function (pageNumber) {
        dataUrl = dataUrl.replace("pagenum=" + pgnum, "pagenum=" + pageNumber);
        pgnum = pageNumber;
        generateTiles(dataUrl);
    };

    $.ajax({
        url: dataUrl,
        dataType: 'jsonp'
    })
    .done(function (response) {

        if (response.results) {

            $centerPanel.find(".pagination").pager({
                count: response.meta.pagination.count,
                displayCount: response.meta.pagination.max,
                totalPages: response.meta.pagination.totalPages,
                currentPageNum: pgnum,
                pagingHandler: performPaging
            });

            setupSortOptions();

            $centerPanel.find(".dynamic").genTiles({
                mediaData: response.results,
                apiRoot: APIRoot,
                headerText: getContentHeader(),
                navigationHandler: tileNavigationHandler,
                mediaNavigationHandler: mediaTypeNavHandler,
                showGroupHeaders: ctx.GroupFlag,
                context: ctx
            });

            $centerPanel.hideSpinner();
            $centerPanel.find(".dynamic").show();
            $centerPanel.find(".dynamic .mediaTile .title").ellipsis({ "setTitle": "always" });
            $centerPanel.find(".dynamic").setupRatings();

        }

    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        alert(xhr.status); alert(thrownError); alert(ajaxOptions.dataUrl);
    });

};

var tileNavigationHandler = function (mediaId, mediaType) {
    ctx.setSelectedMediaId(mediaId);
    ctx.setSelectedMediaType(mediaType);
    mediaHandler(mediaId);
};


var preProcessForRegistration = function () {
    $featuredContent.hide();
    $mediaContent.empty();

    $centerPanel.showSpinner();
};

var postProcessForRegistration = function () {
    $centerPanel.hideSpinner();
};

var preProcessForLogin = function () {
    $featuredContent.hide();
    $mediaContent.empty();
    $mediaContent.showSpinner();
};

var preProcessForUserAccount = function () {
    $featuredContent.hide();
    $mediaContent.empty();
    $mediaContent.showSpinner();
};

var postProcessForUserAccount = function () {
    $centerPanel.hideSpinner();
};

var preProcessForResults = function () {
    $featuredContent.hide();
    $mediaContent.empty();

    $mediaContent.append("<div class='pagination pagination-small text-right'></div>");
    $mediaContent.append("<div class='dynamic'>");

    $centerPanel.showSpinner();
    $(".pagination").show();
};

var preProcessForItem = function () {
    $featuredContent.hide();

    $(".mediaContent > div:not(.dynamic, .pagination, .whatever)").empty();
    $mediaContent.find(".dynamic").hide();
    $mediaContent.find(".pagination").hide();

    $mediaContent.find('.csMediaHeader, .csMediaContainer').remove();
    $mediaContent.append("<div class='csMediaHeader'>");
    $mediaContent.append("<div class='csMediaContainer'>");

    $centerPanel.showSpinner();
};

var postProcessForItem = function () {
    $centerPanel.hideSpinner();
    $centerPanel.setupRatings();
};


var setupFeaturedCarousel = function () {
    $featuredContent.empty();
    $featuredContent.show();

    var dataUrl = APIRoot + "/api/v1/resources/media/98081?showchildlevel=1&callback=?";
    console.log(dataUrl);

    var applyCarouselToItems = function (shorty) {
        var options = {
            moreText: '',
            moreTarget: '',
            pageLoaded: ''
        };
        if (shorty) options.maxVisible = shorty;
        $featuredContent.setupTileCarousel(options);
    };

    $.ajax({
        url: dataUrl,
        dataType: 'jsonp'
    })
    .done(function (response) {
        if (response.meta.status !== 200) {
            alert(response.meta.message[0].userMessage);
            return;
        }

        if (response.results) {
            $featuredContent.genTiles({
                mediaData: $.map(response.results[0].children, function (item) {
                    if (!item.mediaId) { item.mediaId = item.id; }
                    return item;
                }),
                apiRoot: APIRoot,
                headerText: "Featured Content",
                navigationHandler: tileNavigationHandler,
                mediaNavigationHandler: mediaTypeNavHandler,
                showGroupHeaders: false,
                context: ctx
            });

            $centerPanel.find(".featuredContent .mediaTile .title").ellipsis({ "setTitle": "always" });
            if (response.results[0].children.length < 4) {
                applyCarouselToItems(response.results[0].children.length);
            }
            else {
                applyCarouselToItems();
            }
        }
    })
    .fail(function (xhr, ajaxOptions, thrownError) {
        alert(xhr.status); alert(thrownError); alert(ajaxOptions.dataUrl);
    });

};


var setupSortOptions = function () {
    var $sortOptions;
    if ($mediaContent.find(".sortOptions").length === 0) {
        $sortOptions = $(".sortOptions").first().clone();
        $centerPanel.find(".pagination").before($sortOptions);
        $sortOptions.show();
    }

    if (ctx.MediaType !== '' || ctx.SearchMediaType !== '' || ctx.SelectedMediaType !== '') {
        $('.sortOptions label.checkbox').prop('disabled', true);
    }
    else {
        $('.sortOptions label.checkbox').prop('disabled', false);
    }

    if (ctx.GroupFlag) {
        $('#cbxGroupByType').prop('checked', 'checked');
    }
    else {
        $('#cbxGroupByType').prop('checked', '');
    }

    //    $('.sortOptions label.checkbox #cbxGroupByType').click(function () {
    //        if ($('#cbxGroupByType').is(':checked')) {
    //            ctx.setGroupFlag(true);
    //            ctx.setSortDirection('desc');
    //        }
    //        else {
    //            ctx.setGroupFlag(false);
    //            ctx.setSortDirection('desc');
    //        }

    //        showResults();
    //    });


    // code seems redundant, but solves double event cause by label triggering the checkbox.
    $('.sortOptions label.checkbox').on('click', function (event) {
        event.preventDefault();
        var $check = $(':checkbox', this);
        $check.prop('checked', !$check.prop('checked'));
        ctx.setGroupFlag($check.is(':checked'));
        ctx.setSortDirection('desc');
        showResults();
    });

    $('.sortOptions :checkbox').on('click', function (event) {
        event.stopPropagation();
        ctx.setGroupFlag($('#cbxGroupByType').is(':checked'));
        ctx.setSortDirection('desc');
        showResults();
    });


    var currentSortText = ctx.SortDirection == 'desc' ? 'Newest First' : 'Oldest First';
    $(".sortOptions .btn-group .btn").html(currentSortText + " <span class='caret'></span>");

    if ($sortOptions === undefined) return;

    $sortOptions.find(".sortPicker a").click(function (e) {
        $(e.target).parents(".btn-group").find(".btn").html($(e.target).text() + " <span class='caret'></span>");
        var sort = $(".sortOptions a").first().text() == 'Newest First ' ? 'desc' : 'asc';
        ctx.setGroupFlag(false);
        ctx.setSortDirection(sort);
        showResults();
    });

};

function formatDateForDisplay(utcDate) {
    if (utcDate === undefined) return "";
    var d = new Date(utcDate);
    if (d === NaN) return "";

    var currDate = d.getDate();
    var currMonth = d.getMonth();
    var currYear = d.getFullYear();

    var dateStr = (currMonth + 1) + "/" + currDate + "/" + currYear;

    return dateStr;
}

function decode(content) {
    return $("<div/>").html(content).text();
}


