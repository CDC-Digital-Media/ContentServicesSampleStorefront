"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'genTiles';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaData: '',
            apiRoot: '',
            headerText : '',
            navigationHandler: '',
            mediaNavigationHandler: '',
            showGroupHeaders: false,
            context: {}
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);
                
        var self = this;
        var mediaType = '';

        function main(){
            $(options.target).empty();
            buildTiles(options.mediaData);
        }

        function handleNavigationClick($obj, mediaId, mediaType){
            var func = options.navigationHandler;
            if (typeof func === 'function') {
                $obj.click(function(e) {
                    func(mediaId, mediaType);
                    return false;
                    e.preventDefault();
                });
            }
        }

        function handleMediaNavigationClick(mediaType){
            var func = options.mediaNavigationHandler;
            if (typeof func === 'function') {
                func(mediaType);
            }
        }

        function handleRemoveFromList(element, mediaId) {
            //TODO:  Spinner
            //$(this).removeAttr('class').addClass('icn-checkbox')
            element.removeFromSyndicationList({apiRoot: options.apiRoot, mediaId: mediaId, listGuid: options.context.SelectedList.id, context: options.context, addHandler: handleAddToList});
            element.attr("selected", false);
            element.removeClass('cs-tile-selected');
            element.find("i.fa").removeClass("fa-minus");
            element.find("i.fa").addClass("fa-plus");
            element.find('.tiletxt').html('Add to List');
            element.on("click", function () { handleAddToList(element, mediaId); });
        }

        function handleAddToList(element, mediaId) {
            //TODO:  Spinner
            //$(this).removeAttr('class').addClass('icn-checkbox')
            $(element).addToSyndicationList({apiRoot: options.apiRoot, mediaId: mediaId, listGuid: options.context.SelectedList.id, context: options.context});
             
            $(element).attr("selected", true);
            //$(this).removeAttr('class').addClass('icn-checkbox')
            element.addClass('cs-tile-selected');
            element.find("i.fa").removeClass("fa-plus");
            element.find("i.fa").addClass("fa-minus");
            element.find('.tiletxt').html('Remove');
            element.on("click", function () { handleRemoveFromList(element, mediaId); });
        }

        function buildTiles(data) {

            //build out tiles
            var $headerDiv = $("<div class='header'/>");
            $headerDiv.html(options.headerText);
            $(options.target).append($headerDiv);

            var $tileDiv = $("<div class='items'/>");
            $(options.target).append($tileDiv);

            if (data) {
                $(data).each(function () {

                    var $itm = $(this)[0];

                    $itm.title = $('<div />').html($itm.title).text();

                    var $tile = $("<div class='mediaTile' mediaId='"+ $itm.mediaId +"'/>");

                    
//                    var $cartIcon = $("<a href='#' alt='Add this item to your cart'><i class='icon-shopping-cart pull-right'/></a>");
//                    $tile.append($cartIcon);

//
//                    var $check = $("<img class='checked' src='../Images/tick.png'>");
//                    $tile.append($check);

                    if (options.context.UserInfo !== '' && $itm.mediaType !== 'Podcast Series') {
                        var $syndListCbx = $("<div class='cs-tile-addtolist' id='syndListCbx_" + $itm.mediaId + "' mediaId='" + $itm.mediaId + "' ><div class='btnAddtoList'><i class='fa fa-plus'></i><span class='tiletxt'>Add to List</span></div></div>");
                        $syndListCbx.attr("selected", false); // setup default value.
                        if (options.context.SelectedList.selectedMediaIds !== '' && $.inArray($itm.mediaId, options.context.SelectedList.selectedMediaIds) > -1) {
                            $syndListCbx.attr("selected", true);
                            $syndListCbx.on("click", function() { handleRemoveFromList($(this), $itm.mediaId); });
                            $tile.addClass('cs-tile-selected');
                            $tile.find("i.fa").removeClass("fa-plus");
                            $tile.find("i.fa").addClass("fa-minus");

                            $tile.find('.tiletxt').html('Remove');
                        }
                        else {
                            $syndListCbx.on("click", function() { handleAddToList($(this), $itm.mediaId); });
                        }
                        //$tile.append($syndListCbx);
                    }

                    var $previewImg;
                    $previewImg = $("<div class='previewImg'><img src='"+ options.apiRoot +"/api/v1/resources/media/"+ $itm.mediaId +"/thumbnail' alt='" + $itm.title +"' title='" + $itm.title +"'/></div>");
                    
                    var $title = $("<div class='title'><a href='#' alt='" + $itm.title +"'>" + $itm.title +"</a></div>");

                    handleNavigationClick($previewImg, $itm.mediaId, $itm.mediaType);
                    handleNavigationClick($title, $itm.mediaId, $itm.mediaType);

                    $tile.append($previewImg);
                    $tile.append($title);

                    var $floatBottom = $("<div class='floatBottom'/>");
                    
                    if($itm.sourceUrl !== '') {
                        $floatBottom.append($("<div class='ratingBlock' ItemUrl='"+  $itm.sourceUrl +"' RatingCount='2' AverageRating='2'></div>"));
                    }

                    // putting in fix for podcast: types are wonky.
                    var type = $itm.mediaType;

                    $floatBottom.append($("<div>Type: <a href='#' class='mediaTypeLink'>"+ type +"</a></div>"));

                    if (options.context.UserInfo !== '' && $itm.mediaType !== 'Podcast Series') {
                        $floatBottom.append($syndListCbx);
                    }

                    $floatBottom.find(".mediaTypeLink").click(function(){
                        handleMediaNavigationClick($itm.mediaType);
                    });

                    $tile.append($floatBottom)
                    

                    // add header if grouping is turned on;
                    if(options.showGroupHeaders && mediaType !== $itm.mediaType){
                        var $groupHeader = $("<div class='groupHeader'>"+ $itm.mediaType +"</div>");
                        $tileDiv.append($groupHeader);
                    }
                    mediaType = $itm.mediaType;

                    $tileDiv.append($tile);
                                        
                }); // each

                $('.mediaTile').hover(function () {
                    $(this).find('.cs-tile-addtolist').show();
                }, function () {
                    $(this).find('.cs-tile-addtolist').fadeOut(200);
                });
             
            }
                        
        }

        main();
        return  $(options.target);

    };

})(jQuery);