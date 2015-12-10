"use strict"; //ignore jslint

//infographic EMBED IS THE EMBED CODE (TAB) AND TABS SETUP

(function ($) {
    var PLUGIN_NAME = 'infographicEmbed';

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

        main();

        function main() {
       
            setupTabs();

            var $tabContent = $("<div class='tabContent'>");
            $(options.target).append($tabContent);

            var $divEmbed = $("<div class='embedForm'>");
            $tabContent.append($divEmbed);

            var $divPreview = $("<div class='infographicPreviewPane'>");
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
            $ul.append("<li class='active'><a href='#' class='previewTab'>Infographic Preview</a></li>");
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
            if(options.returnHandler !== ''){
                var $div = $("<div class='csMediaFooter'>");
                var $returnLink = $("<a class='btn btn-small pull-right' style='color:black;' href='#'>Return to Results</a>");
                $returnLink.click(function () {handleReturnClick(); });
                $div.append($returnLink);
                $(options.target).append($div);
            }
        }

        function showPreview() {
            var $root = $('.embedForm');
            var $preEmbed = $root.find('.htmlEmbedBlock textarea');
            
            $(".infographicPreviewPane").show();
            $(".embedForm").hide();
            $(".infographicPreviewPane").showSpinner();

            $(".infographicPreviewPane").infographic({
                mediaId: options.mediaItem.mediaId,
                apiRoot: APIRoot
            });

        }

        function showEmbedForm() {

            $(".infographicPreviewPane").hide();
            $(".embedForm").show();

            if ($(".embedForm").html() === '') {// just load form once.

               $(options.target).find(".embedForm").load("templates/infographicEmbedForm.htm", function () { setupEmbedForm(); });

            }
        }
        
        function setupEmbedForm() {
                    
            generateCodeBlock();
            generateRawCodeBlock();

        }

        //Plugin
        var generateCodeBlock = function () {
            var codeBlock = '';
            var urlRoot = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

            if(webFolder && webFolder !== ''){urlRoot += "/" + webFolder;}
            

            var $root = $('.embedForm');
            
            codeBlock += '<!-- Markup for CDC infographic (' + options.mediaItem.title + ') -->\r';
            codeBlock += '<script src="' + urlRoot + '/Scripts/jquery-1.9.1.min.js" type="text/javascript"></script>\r';
            codeBlock += '<script src="' + urlRoot + '/Scripts/Marketplace.Infographic_0.1.js" type="text/javascript"></script>\r';
            codeBlock += '\r';
            codeBlock += '<div class="CDCInfographic_' + options.mediaItem.mediaId.toString() + '"></div>\r';
            codeBlock += '<script language="javascript" type="text/javascript">\r';
            codeBlock += '$(".CDCInfographic_' + options.mediaItem.mediaId.toString() + '").infographic({\r';
            codeBlock += '   mediaId: ' + options.mediaItem.mediaId + ',\r';
            codeBlock += '   apiRoot: "' + APIRoot + '"\r';
            codeBlock += '})   \r';
            codeBlock += '</script>\r';
            codeBlock += '<noscript>You need javascript enabled to view this content or go to <a href="http://t.cdc.gov/OOO">http://t.cdc.gov/OOO</a>.</noscript>\r';

            var $preEmbed = $root.find('.jsEmbedBlock textarea');
            $preEmbed.text(codeBlock);
            $preEmbed.click(function(){this.focus(); this.select();});

        };

        //

        //Raw markup
        var generateRawCodeBlock = function () {
             
            if (options.mediaId === '') { alert('No Media Id was specified.'); return; }

            var $root = $('.embedForm');
            var $preEmbed = $root.find('.htmlEmbedBlock textarea');

            var codeBlock = '<!-- Markup for CDC HTMLContent (' + options.mediaItem.title + ') -->\r';
            codeBlock += $(".infographicPreviewPane").html();
            $preEmbed.text(codeBlock);

            $preEmbed.click(function() {this.focus(); this.select(); });
            prettyPrint();
        };

    };

        

})(jQuery);

