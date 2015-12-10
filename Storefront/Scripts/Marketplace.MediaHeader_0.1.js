"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'mediaHeader';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaItem: null,
            topicNavHandler: '',
            postProcessHandler: '',
            dateFormater: function() {},
            htmlDecoder: function() {}
        }
    };

    // funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);


        function main() {
            $(options.target).empty();
            var $description = $("<div>");
            $description.load("templates/MediaHeader1.htm", function(){
                setupHeader(options.mediaItem);
            });
            $(options.target).prepend($description);
        }

        function handleNavigationClick(catId, title){
            var func = options.topicNavHandler;
            if (typeof func === 'function') {
                    func(catId, title);
            }
        }

        function handlePostProcess() {
            var func = options.postProcessHandler;
            if (typeof func === 'function') {
                    func();
            }
        }

        function setupHeader(mediaItem){

            $(options.target).find('.header').html(options.htmlDecoder(mediaItem.title));
            $(options.target).setupRatings();

            if(mediaItem.description && mediaItem.description !== ''){
                $(options.target).find('.description').html(options.htmlDecoder(mediaItem.description));
            }
            else{
                $(options.target).find('.description').html("<i>No description provided</i>");
            }

            var $topicList = $(options.target).find('.topicList');
            $topicList.children().remove();

            if(mediaItem.tags.topic.length>0){
                $(mediaItem.tags.topic).each(function(){
                    var $tpc = this;

                    var $a = $("<a href='#'>" + $tpc.name + "</a>");
                    $topicList.append($a);

                    $a.click(function(){
                        handleNavigationClick($tpc.id, $tpc.name);
                    });
                    
                    if($topicList.find('a').length < mediaItem.tags.topic.length) {
                        $topicList.append(", ");
                    }
                });
            }

            if(mediaItem.url !== '' && mediaItem.sourceUrl.indexOf('http://') === 0) {
                var $a = $("<a href='"+ mediaItem.sourceUrl +"' target='_blank'>" + mediaItem.sourceUrl + "</a>");
                $a.click(function() {
                    showPopUp(mediaItem.sourceUrl);
                    return false;
                });
                $(options.target).find('.url').append($a);
            }
            else{
                $(options.target).find('.url').parent().hide();
            }
            
            $(options.target).find('.pubDate').html(options.dateFormatter(mediaItem.dateActive));
            $(options.target).find('.lastUpdated').html(options.dateFormatter(mediaItem.dateModified));
            $(options.target).find('.attribution').html(options.htmlDecoder(mediaItem.attribution));
            
            $(options.target).find('.facebook').click(function() {
                share('http://www.cdc.gov/socialmedia/ContentServices/Sample/CS_FacebookSample.htm');
            });
            $(options.target).find('.twitter').click(function() {
                tweet('http://www.cdc.gov/socialmedia/ContentServices/Sample/CS_FacebookSample.htm');
            });
            $(options.target).find('.google').click(function() {
                googleplus('http://www.cdc.gov/socialmedia/ContentServices/Sample/CS_FacebookSample.htm');
            });

            handlePostProcess();
        }

        //facebook code: ///////////////////////////////////////
        function share(url) {

            var encoded = encodeURIComponent(url);
            var fullUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encoded;

            window.open(fullUrl, 'FaceBook', 'width=626,height=436');
            return false;
        }
        //end facebook code: ///////////////////////////////////////
        //twitter code: ///////////////////////////////////////
        function tweet(url){

            var encoded = encodeURIComponent(url);
            var fullUrl = 'https://twitter.com/share?text=' + encoded;

            window.open(fullUrl, 'Twitter', 'width=575,height=400');
            return false;
        }
        //end twitter code: ///////////////////////////////////////
        //google+ code: ///////////////////////////////////////
        function googleplus(url){

            var encoded = encodeURIComponent(url);
            var fullUrl = 'https://plus.google.com/share?url=' + encoded;
            window.open(fullUrl,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
            return false;
        }
        //end twitter code: ///////////////////////////////////////


        main();

    };

})(jQuery);
