"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'podcast';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaId: '',
            apiRoot: '',
            navigationHandler: '',
            postProcess: ''

        }
    };

    // function //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        function handleNavigationClick(mediaId) {
            var func = options.navigationHandler;
            if (typeof func === 'function') {
                    func(mediaId);
                    return false;
            }
        }


        function main() {

            if (options.mediaId === '') { alert('No Media Id was specified.'); return; }

            var url = options.apiRoot + '/api/v1/resources/media/' + options.mediaId+ '.json?showchildlevel=1&showparentlevel=1&ttl=900';

            $.ajax({
                url: url,
                dataType: 'jsonp'
            })
            .done(function (response) {

                $(options.target).empty();
                $(options.target).append(buildPodcastItem(response.results[0]));
                
                var func = options.postProcess;
                if (typeof func === 'function') {func(); }

            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
            
        }

        function buildPodcastItem(itm){

            if(options.genThumbnail){
                if(itm.mediaType == 'Image'){
                    var $pImage = $("<img src='"+ itm.sourceUrl +"'>");
                    return $pImage;
                }
                else {
                    return;
                }
            }
            else{
                if(itm.mediaType == 'Image') {return; }
            }
            

            var $pItem = $("<div class='csPodcastItem'>");
            var $thumb = $("<div class='thumbnail' style='background-image:url("+ itm.thumbnail +")'></div>");

            $pItem.append($thumb);

            var $itmContent = $("<div class='itemContent'>");
                
            var $date = $("<div class='date'>"+ itm.dateActive +"</div>");

            var decodedTitle = $("<div/>").html(itm.title).text();
            var $title = $("<div class='title'>"+ decodedTitle +"</div>");

            var decodedDescription = $("<div/>").html(itm.description).text();
            var $description = $("<div class='description'>"+ decodedDescription +"</div>");

            $itmContent.append($date);
            $itmContent.append($title);
            $itmContent.append($description);

            $pItem.append($itmContent);

            if(itm.sourceUrl !== ''){
                var $lbl = $("<span class='websiteLabel'>Website:</span>");
                $itmContent.append($lbl);
                var $website = $("<a href='#' class='website'>"+ itm.sourceUrl +"</a>");
                $website.click(function(){showPopUp(itm.sourceUrl); return false;});
                $itmContent.append($website);
            }

            if(itm.itemCount>0){
                var $related = $("<div>");
                getRelatedItems(itm.items, $related);
                $itmContent.append($related);
            }


            //TODO: make work for multiple parentage.
            if(itm.parents.length>0){
                var $series = $("<div class='seriesLink'>This Podcast is a part of a Series: <a href='#'>"+ itm.parents[0].title +"</a></div>");
                var $parentLink = $("");
                $itmContent.append($series);

                $series.find("a").click(function(){
                    handleNavigationClick(itm.parents[0].mediaId);
                });
            }



            


            //$itmContent

//            var $syndicateLabel = $("<div class='syndicateLabel'>Do you want to <a href='#'>Syndicate this Podcast?</a></div>");
//            $pItem.append($syndicateLabel);

//            var $syndLink = $syndicateLabel.find('a');
//            $syndLink.click(function(){
//                handleSyndicationClick(itm.mediaId);
//            })
//            $syndLink.hover(function(){$pItem.addClass('selected')}, function(){$pItem.removeClass('selected')});

            return $pItem;
            
        }

        var getRelatedItems = function (items, $target){
       
            var $lbl = $("<span class='lblMediaFiles'>Media Files</span>");
            $target.append($lbl);

            var $ul = $("<ul class='relatedItems'>");
            $(items).each(function(){
                var url = this.targetUrl;
                var $li = $("<li>");
                var $a = $("<a target='_blank' href='" + url + "'>" + this.mediaType + "</a>");
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
            $target.append($ul);


        };


        main();

    };

})(jQuery);
