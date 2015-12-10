"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'htmlContentEmbed';

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

        var oHtmlContent;
        var embedCodeBlock;

        var outputOptions = {
             blnStripScripts : 1,
             blnStripAnchorTags : 0,
             blnStripImages : 0,
             blnStripComments : 1,
             blnStripInlineStyles : 1,
             imagePlacement : 'none',
             postProcess : '',
             outputFormat : 'XHTML',
             outputEncoding : 'UTF-8',
             nameSpace : '',
             blnNewWindow : 0,
             blnjQueryRef: 1
        };

        main();


        function main(){

            var url = APIRoot + '/api/v1/resources/media/'+ options.mediaItem.mediaId.toString()  + '/embed?';

            $.ajax({
                url: url,
                dataType: 'jsonp'
            })
            .done(function (response) {
                embedCodeBlock = $("<div/>").html(response.results).text();
                setupPlugin();
            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
        }

        function setupPlugin() {

            setupTabs();

            var $tabContent = $("<div class='tabContent'>");
            $(options.target).append($tabContent);

            var $divEmbed = $("<div class='embedForm'>");
            $tabContent.append($divEmbed);

            var $divPreview = $("<div class='htmlPreviewPane' style='border:1px solid #dddddd;'>");
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
            $ul.append("<li class='active'><a href='#' class='previewTab'>Content Preview</a></li>");
            $ul.append("<li><a href='#' class='embedTab'>Get Embed Code</a></li>");


            var $previewNote = $("<div class='info previewNote'><small>Note: This tab displays content according to the options on the <a href='#'>Get Embed Code</a> tab.</small></div>");
            var $formNote = $("<div class='info formNote'><small>Note: To see the results of the options you select, you can view them on the <a href='#'>Content Preview</a> tab.</small></div>");

            $ul.find(".previewTab").click(function() {
                $ul.find("li").removeClass("active");
                $ul.find(".previewTab").parent().addClass("active");
                $formNote.hide();
                showPreview();
            });

            $ul.find(".embedTab").click(function() {
                $ul.find("li").removeClass("active");
                $ul.find(".embedTab").parent().addClass("active");
                $previewNote.hide();
                showEmbedForm();
            });

            $previewNote.find("a").click(function(){
                $ul.find(".embedTab").click();
                return false;
            });

            $formNote.find("a").click(function(){
                $ul.find(".previewTab").click();
                return false;
            });

            $(options.target).append($ul);
            $(options.target).append($previewNote);
            $(options.target).append($formNote);
        }

        function setupReturnLink() {
            if(options.returnHandler !== '') {
                var $div = $("<div class='csMediaFooter'>");
                var $returnLink = $("<a class='btn btn-small pull-right' style='color:black;' href='#'>Return to Results</a>");
                $returnLink.click(function () {handleReturnClick(); });
                $div.append($returnLink);
                $(options.target).append($div);
            }
        }

        function showPreview() {

            $(".htmlPreviewPane").show();
            $(".previewNote").show();
            $(".embedForm").hide();
            $(".formNote").hide();

            $(".htmlPreviewPane").showSpinner();

            $(".htmlPreviewPane").htmlContent({
               mediaId: options.mediaItem.mediaId,
               apiRoot: APIRoot,
               stripScripts: outputOptions.blnStripScripts,
               stripAnchorTags: outputOptions.blnStripAnchorTags,
               stripImages: outputOptions.blnStripImages,
               stripComments: outputOptions.blnStripComments,
               stripInlineStyles: outputOptions.blnStripInlineStyles,
               imagePlacement: outputOptions.imagePlacement,
               postProcess: outputOptions.postProcess,
               outputFormat: outputOptions.outputFormat,
               outputEncoding: outputOptions.outputEncoding,
               nameSpace: outputOptions.nameSpace,
               newWindow: outputOptions.blnNewWindow
            });

        }

        function showEmbedForm() {

            $(".htmlPreviewPane").hide();
            $(".previewNote").hide();
            $(".embedForm").show();
            $(".formNote").show();

            if($(".embedForm").html() === ''){// just load form once.

                $(options.target).find(".embedForm").load("templates/HtmlEmbedForm.htm", function () { setupEmbedForm(); });

            }
        }


        function setupEmbedForm() {

            $(".txtHostPage").hide();
            $(".jsMappingFile").hide();

            $('input:radio[name="mappingOptions"]').change(function(){
                if ($(this).is(':checked') && $(this).val()=='mapDefine') {
                    $(".txtHostPage").show();
                }
                else{
                    $(".txtHostPage").hide();
                }

                if ($(this).is(':checked') && $(this).val()=='mapManual') {
                    $(".jsMappingFile").show();
                }
                else{
                    $(".jsMappingFile").hide();
                }
            });

            // wire up options to displayed code block
            var $root = $(options.target);
            bindOptionHandler($root, outputOptions, "#stripScripts", "blnStripScripts", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#stripAnchors", "blnStripAnchorTags", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#stripImages", "blnStripImages", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#stripComments", "blnStripComments", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#stripStyles", "blnStripInlineStyles", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "input[name=imgFloat]", "imagePlacement", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#postprocessFunction", "postProcess", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#outputFormat", "outputFormat", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#outputEncoding", "outputEncoding", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#contentNameSpace", "nameSpace", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#newWindow", "blnNewWindow", generateCodeBlock);
            bindOptionHandler($root, outputOptions, "#jQueryRef", "blnjQueryRef", generateCodeBlock);

            $(".displayOptionHelp").BSPopoverExtender({
                $contentSource : $(".displayOptionHelpContent"),
                cssClass: 'help-htmlDisplayOptions'
            });

            $(".scriptOptionHelp").BSPopoverExtender({
                $contentSource : $(".scriptOptionHelpContent"),
                cssClass: 'help-scriptOptions'
            });

            applyWatermark();
            generateCodeBlock();

        }

        var generateCodeBlock = function(){
            var codeBlock = '';
            var urlRoot = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
            
            if(webFolder && webFolder !== ''){urlRoot += "/" + webFolder; }

            var $root = $('.embedForm');

            // test code ---


            codeBlock += '<!-- Markup for CDC HTMLContent ('+ options.mediaItem.title +') -->\r';
            codeBlock += '<link href="'+ urlRoot +'/Styles/csHtmlContent.css" rel="stylesheet" type="text/css" />\r';

            if(outputOptions.blnjQueryRef){
                codeBlock += '<script src="'+ urlRoot +'/Scripts/jquery-1.9.1.min.js" type="text/javascript"></script>\r';
            }
            codeBlock += '<script src="'+ urlRoot +'/Scripts/Marketplace.HtmlContent_0.1.js" type="text/javascript"></script>\r';
            codeBlock += '\r';
            codeBlock += '<div class="CDCHtmlContent_'+ options.mediaItem.mediaId.toString() +'"></div>\r';
            codeBlock += '<script language="javascript">\r';
            codeBlock += '$(".CDCHtmlContent_'+ options.mediaItem.mediaId.toString() +'").htmlContent({\r';
            codeBlock += '   mediaId: ' + options.mediaItem.mediaId + ',\r';
            codeBlock += '   apiRoot: "' + APIRoot + '",\r';

            codeBlock += '   stripScripts: ' + outputOptions.blnStripScripts + ',\r';
            codeBlock += '   stripAnchorTags: ' + outputOptions.blnStripAnchorTags + ',\r';
            codeBlock += '   stripImages: ' + outputOptions.blnStripImages + ',\r';
            codeBlock += '   stripComments: ' + outputOptions.blnStripComments + ',\r';
            codeBlock += '   stripInlineStyles: ' + outputOptions.blnStripInlineStyles + ',\r';
            codeBlock += '   imagePlacement: "' + outputOptions.imagePlacement + '",\r';
            codeBlock += '   postProcess: "' + outputOptions.postProcess + '",\r';
            codeBlock += '   outputFormat: "' + outputOptions.outputFormat + '",\r';
            codeBlock += '   outputEncoding: "' + outputOptions.outputEncoding + '",\r';
            codeBlock += '   nameSpace: "' + outputOptions.nameSpace + '",\r';
            codeBlock += '   newWindow: ' + outputOptions.blnNewWindow + '\r';

            codeBlock += '})   \r';
            codeBlock += '</script>\r';
            codeBlock += '<noscript>You need javascript enabled to view this content or go to <a href="http://t.cdc.gov/OOO">http://t.cdc.gov/OOO</a>.</noscript>\r';

            var $preEmbed = $root.find('.jsEmbedBlock textarea');
            
            //$preEmbed.text(codeBlock + '\r\r\r' + embedCodeBlock);
            $preEmbed.text(codeBlock);

            

            $preEmbed.click(function(){this.focus(); this.select();});

        };


    };

})(jQuery);

