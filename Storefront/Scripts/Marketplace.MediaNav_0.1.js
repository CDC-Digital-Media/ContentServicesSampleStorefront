"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'mediaNav';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            selectedValue : '',
            navigationHandler : ''
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);


        function handleNavigationClick(mediaType, displayName){
            var func = options.navigationHandler;
            if (typeof func === 'function') {
                func(mediaType, displayName);
            }
        }
        
        function main() {

            var $home = $(options.target).parent().find(".brand");
            $home.click(function() {
                ctx.clearSearchParms();
                document.location='Default.htm';
            });

            $.ajax({
                url: APIRoot + '/api/v1/resources/mediatypes.json?ttl=900&callback=?',
                dataType: 'jsonp'
            })
            .done(function (response) {

                var items = jQuery.grep(response.results, function(itm, idx) { return itm.displayOrdinal > 0; });

                $(items).each(function () {
                           
                    var $li  = $("<li><a mediaType='" + this.name + "' href='#'>"+ this.description +"</a></li>");
                    $(options.target).append($li);

                });

                setupNav(options.selectedValue);

                $(options.target).find("a[mediaType]").each(function () {
                    $(this).click(function(){
                        $(options.target).find("a").removeClass("active");
                        $(this).addClass("active");
                        handleNavigationClick($(this).attr("mediaType"), $(this).text());
                    });
                });

            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });

        }

        function setupNav(mediaType) {
            $(options.target).find("a").removeClass("active");
            $(options.target).find("a[mediaType]").each(function () {
                if (mediaType == $(this).attr("mediaType")) {
                    $(this).addClass("active");
                }
            });
        }

        
        this.initialize = function(){
            main();
            return this;
        };

        this.setSelected = function(mediaType) {
            setupNav(mediaType);
            var out = $(options.target).find("a.active").text();
            return out === "" ? mediaType : out;
        };


        return this.initialize();

    };

})(jQuery);