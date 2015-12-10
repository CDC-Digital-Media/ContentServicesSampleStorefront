"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'ecardEmbed';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaItem: null,
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

        var outputOptions = {
            returnNavigationText: 'Choose another eCard',
            returnNavigationNavigateUrl: '',
            completeNavigationText: 'Choose another eCard',
            completeNavigationNavigateUrl: '',
            blnjQueryRef: 1
        };

        main();

        function main() {

            setupTabs();

            var $tabContent = $("<div class='tabContent'>");
            $(options.target).append($tabContent);

            var $divEmbed = $("<div class='embedForm'>");
            $tabContent.append($divEmbed);

            var $divPreview = $("<div class='ecardPreviewPane'>");
            $tabContent.append($divPreview);

            setupReturnLink();

            showPreview();

        }

        function setupTabs(){

            // top return link
            var $returnDiv = $("<div class='pull-right'>");
            var $returnLink = $("<a class='btn btn-small pull-right' style='color:black;' href='#'>Return to Results</a>");
            $returnLink.click(function () {handleReturnClick(); });
            $returnDiv.append($returnLink);
            $(options.target).append($returnDiv);

            var $ul = $("<ul class='nav nav-tabs'>");
            $ul.append("<li class='active'><a href='#' class='previewTab'>Send this eCard</a></li>");
            $ul.append("<li><a href='#' class='embedTab'>Get Embed Code</a></li>");

            $ul.find(".previewTab").click(function(e){
                $ul.find("li").removeClass("active");
                $ul.find(".previewTab").parent().addClass("active");
                showPreview();
                e.preventDefault();
                return false;
            });

            $ul.find(".embedTab").click(function(){
                $ul.find("li").removeClass("active");
                $ul.find(".embedTab").parent().addClass("active");
                showEmbedForm();
                return false;
            });

            $(options.target).append($ul);
        }

        function setupReturnLink(){
            if(options.returnHandler !== ''){
                var $div = $("<div class='csMediaFooter'>");
                var $returnLink = $("<a class='btn btn-small pull-right' style='color:black;' href='#'>Return to Results</a>");
                $returnLink.click(function () {handleReturnClick(); });
                $div.append($returnLink);
                $(options.target).append($div);
            }
        }

        function showPreview(){

            $(".embedForm").hide();

            var filePath = '/mediaAssets/ecards/cards/';
            if(webFolder && webFolder !== '') {
                filePath = "/" + webFolder + filePath;
            }

            $(".ecardPreviewPane").ecard({
                mediaId: options.mediaItem.mediaId,
                apiRoot: APIRoot,
                filePath: filePath,
                returnNavigation: {
                    text: '',
                    navigateUrl: 'Default.htm'
                },
                completeNavigation: {
                    text: '',
                    navigateUrl: 'Default.htm'
                }
            });
            
            $(".ecardPreviewPane").show();
        }


        function showEmbedForm(){

            $(".ecardPreviewPane").hide();
            $(".embedForm").show();

            if($(".embedForm").html() === ''){// just load form once.

                $(options.target).find(".embedForm").load("templates/EcardEmbedForm.htm", function() {setupEmbedForm(); });

            }
        }

        function setupEmbedForm(){
            var $root = $(options.target);
            bindOptionHandler($root, outputOptions, "#entryUrl", "returnNavigationNavigateUrl", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#entryText", "returnNavigationText", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#exitUrl", "completeNavigationNavigateUrl", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#exitText", "completeNavigation.text", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#jQueryRef", "blnjQueryRef", generateCodeBlock);

            generateCodeBlock();
        }

        var generateCodeBlock = function(){
            var codeBlock = '';
            var urlRoot = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
            if(webFolder && webFolder !== '') {
                urlRoot += "/" + webFolder;
            }

            codeBlock += '<!-- Markup for CDC eCard ('+ options.mediaItem.title +') -->\r';
            codeBlock += '<link href="'+ urlRoot +'/Styles/csEcard.css" rel="stylesheet" type="text/css" />\r';
            if(outputOptions.blnjQueryRef){
                codeBlock += '<script src="'+ urlRoot +'/Scripts/jquery-1.9.1.min.js" type="text/javascript"></script>\r';
            }
            codeBlock += '<script src="'+ urlRoot +'/Scripts/CDC.Video.js" type="text/javascript"></script>\r';
            codeBlock += '<script src="'+ urlRoot +'/Scripts/Marketplace.Ecard_01.js" type="text/javascript"></script>\r';
            codeBlock += '<script src="'+ urlRoot +'/Scripts/jquery.watermark.min.js" type="text/javascript"></script>\r';
            codeBlock += '\r';
            codeBlock += '<div class="CDCeCard_'+ options.mediaItem.mediaId.toString() +'"></div>\r';
            codeBlock += '<script language="javascript">\r';
            codeBlock += '  $(".CDCeCard_'+ options.mediaItem.mediaId.toString() +'").ecard({\r';
            codeBlock += '        mediaId: ' + options.mediaItem.mediaId + ',\r';
            codeBlock += '        apiRoot: "' + APIRoot + '",\r';
            codeBlock += '        filePath: "'+ urlRoot +'/mediaAssets/ecards/cards/",\r';
            codeBlock += '        returnNavigation: {\r';
            codeBlock += '            text: "'+ outputOptions.returnNavigationText + '",\r';
            codeBlock += '            navigateUrl: "'+ outputOptions.returnNavigationNavigateUrl + '"\r';
            codeBlock += '        },\r';
            codeBlock += '        completeNavigation: {\r';
            codeBlock += '            text: "'+ outputOptions.completeNavigationText + '",\r';
            codeBlock += '            navigateUrl: "'+ outputOptions.completeNavigationNavigateUrl + '"\r';
            codeBlock += '        }\r';
            codeBlock += '  });\r';
            codeBlock += '</script>\r';
            codeBlock += '<noscript>You need javascript enabled to view this content or go to <a href="http://t.cdc.gov/OOO">http://t.cdc.gov/OOO</a>.</noscript>\r';

            var $root = $('.embedForm');

            var $preEmbed = $root.find('.jsEmbedBlock textarea');
            $preEmbed.text(codeBlock);
            $preEmbed.click(function(){this.focus(); this.select();});

            applyWatermark();

        };


    };

})(jQuery);
