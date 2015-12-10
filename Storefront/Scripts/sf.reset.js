"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'reset';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            postProcess: '',
            submitHandler: '',
            cancelHandler: '',
            apiRoot: ''
        }
    };

    // main funtion //////////////////////////|
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);



        function handlePostProcess() {
            var func = options.postProcess;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function handleSubmitClick() {
            var func = options.submitHandler;
            if (typeof func === 'function') {
                func(false, true);
                return false;
            }
        }

        function handleCancelClick() {
            var func = options.cancelHandler;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function main() {
            $(options.target).empty();
            var $login = $("<div>");
            $login.load("templates/Reset.htm", function () {


                $('.loginReset .btnCancel').click(function () {
                    $('.login').show();
                    $('.loginReset').hide();
                });

                $('.login .btnSubmitCredentials').click(function () {
                    if (validateCredentials()) {
                        attemptLogin();
                    }
                    else {
                        console.debug("bad credentials");
                    }
                });

                $('.login .btnCancel').click(function () {
                    handleCancelClick();
                });

                handlePostProcess();
            });
            $(options.target).append($login);
        }


        function attemptLogin() {
            var data = {
                email: $('#txtEmail').val(),
                newPassword: $('#txtPassword').val(),
                newPasswordRepeat: $('#txtPassword2').val(),
                passwordToken: $.url().param("prt")
            };

            $.ajax({
                type: "POST",
                url: "Secure.aspx/ResetPassword",
                data: "{data: '" + JSON.stringify(data) + "', apiUrl: '" + options.apiRoot + "/api/v1/resources/update_user_passwords'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    var obj = (typeof response.d) == 'string' ? eval('(' + response.d + ')') : response.d;

                    if (obj.meta.status !== 200) {
                        var messages = "";
                        if (obj.meta.message.length === 1) {
                            messages = obj.meta.message[0].userMessage;
                            console.debug(obj.meta.message[0].developerMessage);
                        }
                        else {
                            messages = "<ul>";
                            $(obj.meta.message).each(function () {
                                messages = messages + "<li>" + $(this)[0].userMessage + "</li>";
                                console.debug($(this)[0].developerMessage);
                            });
                            messages = messages + "</ul>";
                        }

                        $('.loginValidation').show().find('.msg').html(messages);
                        $('.loginValidation').focus();
                        $('html, body').animate({
                            scrollTop: $('.loginValidation').offset().top
                        }, 0);

                    }
                    else {
                        setLoginView(true);
                    }

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.debug(xhr.status);
                    console.debug(thrownError);
                    console.debug(xhr.responseText);
                    alert(xhr.status);
                    alert(thrownError);
                }
            });

        }

        function validateCredentials() {
            var isValid = true;

            // run validation output in reverse order so that the scrollto will target whatever form block is highest on the page.
            // orgForm.validateOrg() contains its own scrollto.

            //email & password validation
            var loginMsg = '';
            if ($('#txtEmail').val() === '') {
                loginMsg += 'Email Address is a required field. <br>';
                isValid = false;
            }
            if ($('#txtPassword').val() === '') {
                loginMsg += 'Password is a required field. <br>';
                isValid = false;
            }

            // ... show and scroll to message if necessary
            if (loginMsg !== '') {
                $('.loginValidation').show().find('.msg').html(loginMsg);
                $('.loginValidation').focus();
                $('html, body').animate({
                    scrollTop: $('.loginValidation').offset().top
                }, 0);
            } else {
                $('.loginValidation').hide();
            }
            return isValid;
        }


        main();

    };

})(jQuery);