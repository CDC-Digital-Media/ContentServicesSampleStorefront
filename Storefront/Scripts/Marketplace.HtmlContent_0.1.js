"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'htmlContent';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaId: '',
            apiRoot: '',

            requestClassIds: 'syndicate',
            requestElementIds: '',
            requestXPath: '',
            cssClass: 'csHtmlContent',
            stripScripts : 1,
            stripAnchorTags : 0,
            stripImages : 0,
            stripComments : 1,
            stripInlineStyles : 1,
            imagePlacement : 'none',
            postProcess : '',
            outputFormat : 'XHTML',
            outputEncoding : 'UTF-8',
            nameSpace : '',
            newWindow : 0
        }
    };

    // funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        main();

        function main() {

            if(options.mediaId === ''){ alert('No Media Id was specified.'); return; }

            var url = options.apiRoot + '/api/v1/resources/media/'+ options.mediaId + '/syndicate?';
            //set values for anything not set as default -
            if(options.stripScripts !== 1)
                {url += '&noscript=' + options.stripScripts;}
            if(options.stripAnchorTags !== 0)
                {url += '&noanchor=' + options.stripAnchorTags;}
            if(options.stripImages !== 0)
                {url += '&noimage=' + options.stripImages;}
            if(options.stripComments !== 1)
                {url += '&nocomment=' + options.stripComments;}
            if(options.stripInlineStyles !== 1)
                {url += '&nostyle=' + options.stripInlineStyles;}
            
            // image float
            // open links in new window
            // format

            url += '&callback=?';

            $.ajax({
                url: url,
                dataType: 'jsonp'
            })
            .done(function (response) {

                $(options.target).addClass(options.cssClass);
                var decoded = $("<div/>").html(response.results.content).text();
                $(options.target).html(decoded);

                var func = options.postProcess;
                if (typeof func === 'function') {func(); }

            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
        
        
        
        }




    };

})(jQuery);
