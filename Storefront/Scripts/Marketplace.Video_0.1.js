"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'video';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaId: '',
            apiRoot: '',
            postProcess: '',
            showPreviewOnly: false
        }
    };

    // function //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        main();

        function main() {

            if (options.mediaId === '') { alert('No Media Id was specified.'); return; }
            
            var url = options.apiRoot + '/api/v1/resources/media/'+ options.mediaId + '/syndicate?callback=?';

            $.ajax({
                url: url,
                dataType: 'jsonp'
            })
            .done(function (response) {

                $(options.target).addClass(options.cssClass);
                var decoded = $("<div/>").html(response.results.content).text();

                if(options.showPreviewOnly){
                    // image part
                    var $img = $("<img src='"+ response.results.sourceUrl +"'>");
                    if(response.results.targetUrl !== '') {
                        $img.click(function() {
                            showPopUp(response.results.targetUrl);
                        });
                    }
                    $(options.target).append($img);
                }
                else{
                    if(response.results.targetUrl !== null) {
                        response.results.targetUrl = response.results.targetUrl.replace('http://www.youtube.com/embed/','http://youtube.googleapis.com/v/');
                        response.results.targetUrl = response.results.targetUrl.replace('http://www.youtube.com/watch?v=','http://youtube.googleapis.com/v/');

                        var $iframe = $("<iframe width='420' height='315' src='"+ response.results.targetUrl +"' frameborder='0' allowfullscreen></iframe>");
                        $(options.target).append($iframe);
                    }

                }

                var func = options.postProcess;
                if (typeof func === 'function') {func(); }

            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
            
        }
        
    };

})(jQuery);
