"use strict"; //ignore jslint
(function ($) {
    var PLUGIN_NAME = "requestPasswordReset";

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults:
        {
            emailInputSelector: "",
            emailConfirmSelector: "",
            apiRoot: ""
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        function main() {
            options.target.click(function() {
                $('.contactInfoValidation').hide();

                if (!window.location.origin) {
                    window.location.origin = window.location.protocol + "//" + window.location.host;
                }
  
                var url = document.location.href;
                url = url === undefined ? url : url.replace("http:", "https:");
                var index = url.indexOf("#");
                if (index > -1) { //ends with #
                    url = url.substring(0, index);
                }

                var email = $(options.emailInputSelector).val();
                var data = { email: email, passwordResetUrl: url };
                console.log(data);

                $.ajax({
                    type: "POST",
                    url: "Secure.aspx/RequestPasswordReset",
                    data: "{data: '" + JSON.stringify(data) + "', apiUrl: '" + options.apiRoot + "/api/v1/resources/reset_user_passwords'}",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        var obj = (typeof response.d) === 'string' ? eval('(' + response.d + ')') : response.d;

                        if (obj.meta.status !== 200) {
                            var messages = "";
                            if (obj.meta.message.length === 1) {
                                messages = obj.meta.message[0].userMessage;
                                console.log(obj.meta.message[0].developerMessage);
                            }
                            else {
                                messages = "<ul>";
                                $(obj.meta.message).each(function() {
                                    messages = messages + "<li>" + $(this)[0].userMessage + "</li>";
                                    console.log($(this)[0].developerMessage);
                                });
                                messages = messages + "</ul>";
                            }
                        
                            $('.contactInfoValidation').show().find('.msg').html(messages);
                            $('.contactInfoValidation').focus();
                            $('html, body').animate({
                                scrollTop : $('.contactInfoValidation').offset().top
                            }, 0);
                        
                        }
                        else {
                            console.log("password request sent to " + email);
                            $('.loginReset').hide();
                            $(".resetRequested").show();
                            $(options.emailConfirmSelector).text(email);
                        }
                                      
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr.status);
                        console.log(thrownError);
                        console.log(xhr.responseText);
                        alert(xhr.status);
                        alert(thrownError);
                    }
                });

            });
        }
        main();

    };

})(jQuery);