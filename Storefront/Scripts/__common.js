"use strict"; //ignore jslint

var APIRoot = '', webFolder = '';
if (document.location.toString().toLowerCase().indexOf('test_storefront') > -1) {
    APIRoot = 'https://nchm-tvss1-srv.cdc.gov';
    webFolder = 'test_StoreFront';
}
else if (document.location.toString().toLowerCase().indexOf('dev_storefront') > -1) {
    APIRoot = 'https://nchm-dvss1-srv.cdc.gov';
    webFolder = 'dev_StoreFront';
}
else {
    //APIRoot = 'https://localhost:44301';
    APIRoot = 'https://nchm-dvss1-srv.cdc.gov';
    webFolder = '';
}

(function ($) {
    var PLUGIN_NAME = 'showSpinner';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            allowMultiple: false
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        return main();

        function main() {
            if(options.allowMultiple || $('.progressIndicator').length === 0) {
                return options.target.append("<div class='progressIndicator'></div>");
            }
            return options.target;
        }
    };

})(jQuery);

(function ($) {
    var PLUGIN_NAME = 'hideSpinner';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {}
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        main();

        function main() {
            options.target.find('.progressIndicator').remove();
        }
    };

})(jQuery);


(function ($) {
    var PLUGIN_NAME = 'setupRatings';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {}
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        main();

        function main() {
            options.target.find(".ratingBlock").each(function () {
                $(this).empty();
                $(this).csRatings({
                    appID: 'a527f0a4-8909-41c4-bed7-e50765520062',
                    restfulServiceUrl: 'http://nchm-dvss1-tools.cdc.gov/RatingFeedbackService.svc/rest/',
                    ratingMechanismId: 1
                });
            });
        }
    };

})(jQuery);


(function ($) {
    var PLUGIN_NAME = 'BSPopoverExtender';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            $contentSource : '',
            cssClass: ''
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        // Used in embed code form to wire up help content that's stored in HtmlEmbedForm.htm
        //
        // ... in the following sample, displayOptionHelpContent is used as the selector for the content of the BootStrap popover.
        //
        //  <div style='display: none;'>
        //      <div class='displayOptionHelpContent' title='Display Options'>
        //          <small>
        //              <table class='table'>[help content]
        //
        //  cssClass provides a means to add/override the default bootstrap popover styles.
        //
        //  There are some additional bits that shut down any other popover windows and handle event bubbling so tha the page location
        //  will not shift when the target is clicked.

        main();

        function main() {

            $(options.target).bind('click', function(e) {
                $('[data-original-title]').popover('hide');
                e.stopPropagation();
                return false;
            });

            $(options.target).popover({
                html: true,
                content: options.$contentSource.html(),
                template: '<div class="popover '+ options.cssClass +'"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>',
                title:  '<span class="text-info"><strong>' + options.$contentSource.attr('title') + '</strong></span>' +
                        '<button type="button" id="close" class="close" onclick="$(&quot;'+ $(options.target).selector +'&quot;).popover(&quot;hide&quot;);">&times;</button>',
                placement: 'top'
            });
            
            $(document).bind('click', function (e) {
                $(options.target).popover('hide');
            });
            
        }
    };

})(jQuery);


function applyWatermark() {
    $("[placeholder]").each(function () {
        $(this).watermark($(this).attr("placeholder"));
    });
}

function bindOptionHandler($root, outputOptions, selector, optName, postProcess) {
     var $field = $root.find(selector);
     var type = $field[0].type || $field[0].tagName.toLowerCase();


         switch (type) {
         case 'text':
         case 'textarea':
             $field.keyup(function () {
                 outputOptions[optName] = $(this).val();
                 if (typeof postProcess === 'function') postProcess();
             });

             $field.change(function () {
                 outputOptions[optName] = $(this).val();
                 if (typeof postProcess === 'function') postProcess();
             });

             break;
         case 'radio':
             $field.click(function () {
                 outputOptions[optName] = $(this).val();
                 if (typeof postProcess === 'function') postProcess();
             });
             break;

         case 'checkbox':
             $field.click(function () {
                 outputOptions[optName] = $(this).is(':checked') ? 1 : 0;
                 if (typeof postProcess === 'function') postProcess();
             });
             break;

         case 'select-one':
         case 'select':
             $field.change(function () {
                 outputOptions[optName] = $(this).val();
                 if (typeof postProcess === 'function') postProcess();
             });
             break;
     }

 }

 function showPopUp(url, width, height){
    var w, h;
    w = width !== undefined ? width : 800;
    h = height !== undefined ? height : 600;

    var newwindow = window.open(url, '', 'height=' + h + ',width=' + w + ',scrollbars=yes, resizable=yes');
	if (newwindow && window.focus) { newwindow.focus(); }
	return false;
}

function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}


function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}


function validateDomain(data, $field) {

    var isValid = true;

    try {
        if (data.indexOf('http://') == -1 && data.indexOf('https://')) {
            data = "http://" + data;
        }
        var a = document.createElement('a');
        a.href = data;
        var dmn = a.hostname;
        var pth = a.pathname;

        var re1 = /^[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,6}$/;
        isValid ? isValid = re1.test(dmn) : isValid;

        var re2 = /^[a-zA-Z0-9\%\-\_\/]*$/;
        isValid ? isValid = re2.test(pth) : isValid;

        if (isValid) {
            data = 'http://' + a.hostname + (a.pathname === '' ? '' : '/' + a.pathname);
            $field.val(data);
        }
    }
    catch (ex) {
        isValid = false;
    }

    return isValid;

}




