"use strict"; //ignore jslint
// This widget depends on <reference path="jquery.ui.rcarousel.min.js" />

(function ($) {
    var PLUGIN_NAME = 'setupTileCarousel';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            moreText: '',
            moreTarget: '',
            pageLoaded: '',
            maxVisible: 4
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);
        
        main(options.target);
        return  $(options.target);

        function main($target){

            if($(options.target).find(".sliderControls").length>0){
                // carousel already applied.
                return;
            }

            // add carousel controls
            var $sliderControls = $("<div class='sliderControls'>");
            $sliderControls.append($("<i class='icon-chevron-left ui-carousel-prev' title='Previous Page'></i>"));
            $sliderControls.append($("<i class='icon-chevron-right ui-carousel-next' title='Next Page'></i>"));

            if(options.moreText !== ''){
                var $moreLink = $("<a href='#'>" + options.moreText + "</a>");
                $moreLink.css({'display': 'inline-block', 'padding-left' : '10px'});
                $sliderControls.append($moreLink);
            }

            $target.find(".header").prepend($sliderControls);

            var itemsContainerSelector = $target.find(".items").selector;
            var nextNavSelector = $target.find(".ui-carousel-next").selector;
            var prevNavSelector = $target.find(".ui-carousel-prev").selector;

            $(itemsContainerSelector).rcarousel({
                margin: 3,
                visible: options.maxVisible,
                step: options.maxVisible,
                width: 165,
                height: 185,
                navigation: { next: nextNavSelector, prev: prevNavSelector },
                pageLoaded: options.pageLoaded
            });

            //fixes width and height issues caused by tile borders.
             $target.find(".ui-carousel")
                .width($target.find(".ui-carousel").width() + 8)
                .height($target.find(".ui-carousel").height() + 3);

        }

    };

})(jQuery);