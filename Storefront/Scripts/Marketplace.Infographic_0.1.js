"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'infographic';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaId: '',
            apiRoot: '',
            postProcess: ''

        }
    };

    // function //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        main();

        function main() {

            if (options.mediaId === '') { alert('No Media Id was specified.'); return; }
            
            $(options.target).empty();

            var url = options.apiRoot + '/api/v1/resources/media/'+ options.mediaId + '/syndicate?callback=?';

            $.ajax({
                url: url,
                dataType: 'jsonp'
            })
            .done(function (response) {

                $(options.target).addClass(options.cssClass);
                var decoded = $("<div/>").html(response.results.content).text();

                var $img = $("<img src='" + response.results.sourceUrl + "'>");
                if(response.results.targetUrl !== '') {
                    $img.click(function() {
                        showPopUp(response.results.targetUrl);
                    });
                }

                $(options.target).append($img);

                var func = options.postProcess;
                if (typeof func === 'function') {func(); }

            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
            
        }
        
    };

})(jQuery);
