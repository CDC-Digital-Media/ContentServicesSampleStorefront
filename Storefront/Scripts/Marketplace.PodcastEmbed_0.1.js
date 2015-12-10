"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'podcastEmbed';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaItem: null,
            navigationHandler: '',
            returnHandler: ''
        }
    };

    // funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        function handleReturnClick(){
            var func = options.returnHandler;
            if (typeof func === 'function') {
                func();
            }
        }

        main();

        function main() {
       
            setupTabs();

            var $tabContent = $("<div class='tabContent'>");
            $(options.target).append($tabContent);

            var $divEmbed = $("<div class='embedForm'>");
            $tabContent.append($divEmbed);
                        
            var $divPreview = $("<div class='podcastPreviewPane' style='border:1px solid #dddddd;'>");
            $tabContent.append($divPreview);

            setupReturnLink();
            showPreview();

        }
                
        function setupTabs() {
            // top return link
            var $returnDiv = $("<div class='pull-right'>");
            var $returnLink = $("<a class='btn btn-small pull-right' style='color:black;' href='#'>Return to Results</a>");
            $returnLink.click(function () { handleReturnClick(); });
            $returnDiv.append($returnLink);
            $(options.target).append($returnDiv);

            var $ul = $("<ul class='nav nav-tabs'>");
            $ul.append("<li class='active'><a href='#' class='previewTab'>Content Preview</a></li>");
            $ul.append("<li><a href='#' class='embedTab'>Get Embed Code</a></li>");
                       
            $ul.find(".previewTab").click(function () {
                $ul.find("li").removeClass("active");
                $ul.find(".previewTab").parent().addClass("active");
                showPreview();
            });

            $ul.find(".embedTab").click(function () {
                $ul.find("li").removeClass("active");
                $ul.find(".embedTab").parent().addClass("active");
                showEmbedForm();
            });
            
            $(options.target).append($ul);

        }

        function setupReturnLink(){
            if(options.returnHandler !== '') {
                var $div = $("<div class='csMediaFooter'>");
                var $returnLink = $("<a class='btn btn-small pull-right btnReturn' style='color:black;' href='#'>Return to Results</a>");
                $returnLink.click(function () {handleReturnClick(); });
                $div.append($returnLink);
                $(options.target).append($div);
            }
        }

        function showPreview() {
            var $root = $('.embedForm');
            var $preEmbed = $root.find('.htmlEmbedBlock textarea');
            
            $(".podcastPreviewPane").show();
            $(".embedForm").hide();
            $(".podcastPreviewPane").showSpinner();
            $(".podcastPreviewPane").podcast({
                mediaId: options.mediaItem.mediaId,
                apiRoot: APIRoot,
                navigationHandler: options.navigationHandler
            });

        }

        function showEmbedForm() {

            $(".podcastPreviewPane").hide();
            $(".embedForm").show();

            if ($(".embedForm").html() === '') {// just load form once.

               $(options.target).find(".embedForm").load("templates/PodcastEmbedForm.htm", function () { setupEmbedForm(); });

            }
        }
        
        function setupEmbedForm() {
            var codeBlock = '';

            var urlRoot = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
            if(webFolder && webFolder !== '' ){urlRoot += "/" + webFolder; }

            var $root = $('.embedForm');
            
            codeBlock += '<!-- Markup for CDC HTMLContent (' + options.mediaItem.Title + ') -->\r';

            codeBlock += '<link href="' + urlRoot + '/Styles/csPodcast.css" rel="stylesheet" type="text/css"></link>\r';
            codeBlock += '<script src="' + urlRoot + '/Scripts/jquery-1.9.1.min.js" type="text/javascript"></script>\r';
            codeBlock += '<script src="' + urlRoot + '/Scripts/Marketplace.Podcast_0.1.js" type="text/javascript"></script>\r';

            codeBlock += '\r';
            codeBlock += '<div class="CDCPodcastContent_' + options.mediaItem.mediaId.toString() + '"></div>\r';
            codeBlock += '<script language="javascript" type="text/javascript">\r';
            codeBlock += '$(".CDCPodcastContent_' + options.mediaItem.mediaId.toString() + '").podcast({\r';
            codeBlock += '   mediaId: ' + options.mediaItem.mediaId + ',\r';
            codeBlock += '   apiRoot: "' + APIRoot + '"\r';
            codeBlock += '})   \r';
            codeBlock += '</script>\r';
            codeBlock += '<noscript>You need javascript enabled to view this content or go to <a href="http://t.cdc.gov/OOO">http://t.cdc.gov/OOO</a>.</noscript>\r';

            var $preEmbed = $root.find('.jsEmbedBlock textarea');
            $preEmbed.text(codeBlock);
            $preEmbed.click(function() {this.focus(); this.select();});

        }

        //

       

    };
           

})(jQuery);

