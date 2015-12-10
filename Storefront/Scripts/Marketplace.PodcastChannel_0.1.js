"use strict"; //ignore jslint

//PODCAST EMBED IS THE EMBED CODE (TAB) AND TABS SETUP

(function ($) {
    var PLUGIN_NAME = 'podcastChannel';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaId: '',
            apiRoot: '',
            syndicateHandler: '',
            genThumbnail: false,
            returnHandler: ''
        }
    };

    // funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        var $xhrRequests = [];
        var itmIds = [];

        function handleReturnClick(){
            var func = options.returnHandler;
            if (typeof func === 'function') {
                func();
            }
        }

        function handleSyndicationClick(mediaId){
            var func = options.syndicateHandler;
            if (typeof func === 'function') {
                func(mediaId);
            }
        }
 
        function main() {
       
            if(!options.genThumbnail){
                setupTabs();
                $(options.target).append("<div class='podcastProgressIndicator'></div>");
            }
                                             
            var url = options.apiRoot + '/api/v1/resources/media/' + options.mediaId+ '.json?showchildlevel=2&ttl=900';

            $.ajax({
                url: url,
                dataType: 'jsonp'
            })
            .done(function (response) {

                itmIds = $.map(response.results[0].children,function (item) {
                    return item.mediaId;
                });

                var $o = $('.preview').length>0 ? $('.preview') : $(options.target);

                $(response.results[0].children).each(function() {
                    $o.append(buildPodcastItem(this));
                });

                $(options.target).find('.podcastProgressIndicator').remove();
                //getRelatedItems(itmIds);
                setupSubscription(response.results[0]);
                setupReturnLink();

            })
            .fail(function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status); alert(thrownError);
                });

        }


        function buildPodcastItem(itm){

            if(options.genThumbnail){
                if(itm.mediaType === 'Image') {
                    var $pImage = $("<img src='"+ itm.sourceUrl +"'>");
                    return $pImage;
                }
                else{
                    return;
                }
            }
            else{
                if(itm.mediaType === 'Image') {return; }
            }
            
            var thumbUrl = APIRoot + "/api/v1/resources/media/" + itm.mediaId + "/thumbnail?";
            var $pItem = $("<div class='csPodcastItem'>");
            var $thumb = $("<div class='thumbnail' style='background-image:url("+ thumbUrl +")'></div>");

            $pItem.append($thumb);

            var $itmContent = $("<div class='itemContent'>");
                
            var $date = $("<div class='date'>"+ itm.dateActive +"</div>");

            var $title = $("<div class='title'>"+ itm.title +"</div>");
            var $description = $("<div class='description'>"+ itm.description +"</div>");

            $itmContent.append($date);
            $itmContent.append($title);
            $itmContent.append($description);

            $pItem.append($itmContent);

            if(itm.sourceUrl !== '') {
                var $lbl = $("<span class='websiteLabel'>Website:</span>");
                $itmContent.append($lbl);
                var $website = $("<a href='#' class='website'>"+ itm.sourceUrl +"</a>");
                $website.click(function(){showPopUp(itm.sourceUrl); return false; });
                $itmContent.append($website);
            }

            $itmContent.append($("<span class='lblMediaFiles'>Media Files</span>"));

            var $ul = $("<ul class='relatedItems'>");
            $(itm.children).each(function(){
                var url = this.targetUrl;
                var $li = $("<li>");
                var $a = $("<a target='_blank' href='" + url + "'>"+ this.mediaType + "</a>");
                $a.click(function() {
                    showPopUp(url, 320, 260);
                    return false;
                });
                $li.append($a);


                var $iconStyle;
                switch (this.mediaType) {
                    case 'Video':       $iconStyle = $('<span class="sprite-16-qt" alt="MP4 file"></span>'); break;
                    case 'Audio':       $iconStyle = $('<span class="sprite-16-wmv" alt="MP3 file"></span>'); break;
                    case 'Transcript':  $iconStyle = $('<span class="sprite-16-pdf" alt="Adobe PDF file"></span>'); break;
                }

                $li.append($iconStyle);

                $ul.append($li);
            });
            $itmContent.append($ul);

            var $syndicateLabel = $("<div class='syndicateLabel'>Do you want to <a href='#'>Syndicate this Podcast?</a></div>");
            $pItem.append($syndicateLabel);

            var $syndLink = $syndicateLabel.find('a');
            $syndLink.click(function() {
                $('.csMediaHeader, .csMediaContainer').remove();
                handleSyndicationClick(itm.mediaId);
                return false;
            });
            $syndLink.hover(function() {$pItem.addClass('selected'); }, function() {$pItem.removeClass('selected'); });

            return $pItem;
            
        }
         
        function setupReturnLink(){
            if(options.returnHandler !== ''){
                var $div = $("<div class='csMediaFooter'>");
                var $returnLink = $("<a class='btn btn-small pull-right btnReturn' style='color:black;' href='#'>Return to Results</a>");
                $returnLink.click(function () {handleReturnClick(); });
                $div.append($returnLink);
                $(options.target).append($div);
            }
        }
                
        function setupTabs() {
            // top return link
            var $returnDiv = $("<div class='pull-right'>");
            var $returnLink = $("<a class='btn btn-small pull-right' style='color:black;' href='#'>Return to Results</a>");
            $returnLink.click(function () {handleReturnClick(); });
            $returnDiv.append($returnLink);
            $(options.target).append($returnDiv);

            var $ul = $("<ul class='nav nav-tabs'>");
            $ul.append("<li class='active'><a href='#' class='previewTab'>Series Preview</a></li>");
            $ul.append("<li><a href='#' class='subscribeTab'>Subscribe to this Series</a></li>");

            $(options.target).append($ul);

            var $tabContent = $("<div class='tabContent'>");
            $(options.target).append($tabContent);
            
            var $preview = $("<div class='preview'>");
            $tabContent.append($preview);

            var $subscribe = $("<div class='subscribe'>");
            $tabContent.append($subscribe);
            $subscribe.hide();

            $ul.find(".previewTab").click(function () {
                $ul.find("li").removeClass("active");
                $ul.find(".previewTab").parent().addClass("active");
                showPreview();
            });

            $ul.find(".subscribeTab").click(function () {
                $ul.find("li").removeClass("active");
                $ul.find(".subscribeTab").parent().addClass("active");
                showSubscribe();
            });

        }

        var showPreview = function(){
            $(".preview").show();
            $(".subscribe").hide();
        };
        var showSubscribe = function(){
            $(".preview").hide();
            $(".subscribe").show();
        };


        var setupSubscription = function(itm) {
            var $sub = $(".subscribe");
            $sub.load("templates/PodcastSubscribe.htm", function() {

                var $rootUl = $sub.find(".formats");

                if($(".sprite-16-qt").length>0){//MP4 file

                    $rootUl.append($("<li><b>Video</b></li>"));
                    var $li = $("<li>");
                    var $ul = $("<ul>");
                    $li.append($ul);

                    buildList($ul, 'Images/itunes.png', 'iTunes Video', 'itunes', 'video');
                    buildList($ul, 'Images/rss.png', 'RSS Video', 'rss', 'video');

                    $rootUl.append($ul);
                }
                if($(".sprite-16-wmv").length>0){//MP3 (audio) file
                    
                    $rootUl.append($("<li><b>Audio</b></li>"));
                    var $li = $("<li>");
                    var $ul = $("<ul>");
                    $li.append($ul);

                    buildList($ul, 'Images/itunes.png', 'iTunes Audio', 'itunes', 'audio');
                    buildList($ul, 'Images/rss.png', 'RSS Audio', 'rss', 'audio');
                    
                    $rootUl.append($ul);
                }
                if($(".sprite-16-pdf").length>0){//transcript file

                    $rootUl.append($("<li><b>Transcripts</b></li>"));
                    var $li = $("<li>");
                    var $ul = $("<ul>");
                    $li.append($ul);

                    buildList($ul, 'Images/rss.png', 'RSS Transcript', 'rss', 'transcript');
                    
                    $rootUl.append($ul);
                }


                $(".podcastHelp").BSPopoverExtender({
                    $contentSource : $(".podcastHelpContent"),
                    cssClass: 'help-podcast'
                });

                $(".rssHelp").BSPopoverExtender({
                    $contentSource : $(".rssHelpContent"),
                    cssClass: 'help-rss'
                });

            });


            function buildList($ul, imgUrl, txt, extension, type ){
                var $li = $("<li><img src='"+ imgUrl +"'><a href='#'>"+ txt +"</a></li>");
                $ul.append($li);
                var url = options.apiRoot + '/api/v1/resources/media/' + options.mediaId + '.' + extension + '?showchildlevel=2&feedtype=' + type;
                $li.click(function(){
                    showPopUp(url,800,600);
                });
            }

        };

        var anyClick = function(){
            for(var i=0; i<$xhrRequests.length; i++){
                $xhrRequests[i].abort();
            }
            $xhrRequests = [];
        };

        var lockPage = function(){
            var $xhrMonitorBound = false;
                
            var clickEvents =  $._data(document, "events").click;
            for(var i = 0; i < clickEvents.length; i++){
                if(clickEvents[i].data === 'xhrMonitor') {
                    $xhrMonitorBound = true;
                }
            }

            if(!$xhrMonitorBound){
                $(document).bind('click.xhrMonitor', 'xhrMonitor', anyClick);
            }

            
        };

        var releasePage = function(xhr){

            var temp = $xhrRequests;
            for(var i=0; i<$xhrRequests.length; i++){
                if($xhrRequests[i].uniqueId == xhr.uniqueId){
                    temp.splice(i,1);
                    $xhrRequests = temp;
                    break;
                }
            }
            
            if($xhrRequests.length === 0) {
                $(document).unbind('click.xhrMonitor');
            }
        };

        main();
       

    };
           

})(jQuery);

