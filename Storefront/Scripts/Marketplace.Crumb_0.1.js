"use strict"; //ignore jslint

// this relies on the context plugin -
(function ($) {
    var PLUGIN_NAME = 'crumb';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        function main() {
            options.target.empty();
            var showCrumb = false;

            var $mt = null;
            var $top = null;
            var $srch = null;
            var $home = null;

            if(ctx.MediaType !== ""){
                $mt = buildLink(ctx.MediaTypeDisplayName);
                $mt.click(function() {
                    ctx.setSearchText('');
                    ctx.setTopic('','','');
                });
                showCrumb = true;
            }

            if(ctx.SearchMediaType !== "") {
                $mt = buildLink(ctx.MediaTypeDisplayName);
                $mt.click(function() {
                    ctx.setSearchText('');
                    $(".txtSearch").val('');
                    $(".txtSearch").focus();
                    main();
                    return false;
                });
                showCrumb = true;
            }

            if(ctx.TopicName !== ""){
                $top = buildLink(ctx.TopicName);
                $top.click(function() {
                    ctx.setSearchText('');
                });
                showCrumb = true;
            }

            if(ctx.SearchText !== "") {
                $srch = buildLink("'" + ctx.SearchText + "'");
                showCrumb = true;
            }
            
            if(showCrumb){

                $home = $("<span><a class='brand' href='Default.htm'><i class='icon-home'></i></a></span>");
                $home.click(function() {ctx.clearSearchParms(); });

                options.target.append($home);
                options.target.append($mt);
                options.target.append($top);
                options.target.append($srch);
                options.target.show();
                
                options.target.find('a').last().text(" " + options.target.find('a').last().text());
                options.target.find('a').last().contents().unwrap();
            }
            else{
                options.target.hide();
            }
            
        }

        var buildLink = function(value){
            var $o = $("<span>");
            var $o_sep = $("<span>/</span>");
            var $o_a = $("<a href='Default.htm'>" + value + "</a>");

            $o.append($o_sep);
            $o.append($o_a);
            

            return $o;
        };

        main();

    };

})(jQuery);