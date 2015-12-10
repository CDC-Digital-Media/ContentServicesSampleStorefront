"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'login';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            postProcess: '',
            submitHandler: '',
            cancelHandler: '',
            context: ''
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);


        function handlePostProcess(){
            var func = options.postProcess;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function handleSubmitClick(userInfo) {
            var func = options.submitHandler;
            if (typeof func === 'function') {
                func(false, userInfo);
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
            $login.load("templates/Login.htm", function() {
               
               $('.login .hlLoginReset').click(function() {
                    $('.login').hide();
                    $('.loginReset').show();
                    $('.loginValidation').hide();
                    $('#txtEmail').val('');
                    $('#txtPassword').val('');
               });

               $('.loginReset .btnCancel').click(function(){
                    $('.login').show();
                    $('.loginReset').hide();
               });

               $('.login .btnSubmitCredentials').click(function(){
                    if(validateCredentials()){
                        attemptLogin();
                    }
               });

               $('.login .btnCancel').click(function(){
                    handleCancelClick();
               });

                $(".btnResetPassword").requestPasswordReset({emailInputSelector: "#txtEmailReset", emailConfirmSelector: "#spEmail", apiRoot: APIRoot});





                $("#modalTos").load("templates/ModalUsage.htm", function() {

                    $("#modalTos .modal-body").load("templates/UsageGuidelines.htm", function() {
                        $('#modalTos').modal({ show: false});
                        $(".btnTosAgree").click(function() {
                            $('#modalTos').modal('hide');
                            var info = $('.loginValidation').data();
                            var data = { "agreedToUsageGuidelines": true };

                            $.ajax({
                                type: "POST",
                                url: "Secure.aspx/AgreeToUsageGuidelines",
                                data: "{data: '" + JSON.stringify(data) + "', apiUrl: '" + APIRoot + "/api/v1/resources/users/" + info.User.id + "/usageagreements'}",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function(response) {
                                    var obj = (typeof response.d) == 'string' ? eval('(' + response.d + ')') : response.d;

                                    if (obj.meta.status !== 200) {
                                        var messages = "";
                                        if (obj.meta.message.length === 1) {
                                            messages = obj.meta.message[0].userMessage;
                                            console.debug(obj.meta.message[0].developerMessage);
                                        }
                                        else {
                                            messages = "<ul>";
                                            $(obj.meta.message).each(function() {
                                                messages = messages + "<li>" + $(this)[0].userMessage + "</li>";
                                                console.debug($(this)[0].developerMessage);
                                            });
                                            messages = messages + "</ul>";
                                        }

                                        $('.loginValidation').show().find('.msg').html(messages);
                                        $('.loginValidation').focus();
                                        $('html, body').animate({
                                            scrollTop : $('.loginValidation').offset().top
                                        }, 0);

                                    }
                                    else {
                                        $('.loginValidation').hide();
                                        options.context.setUserInfo(info, function() { handleSubmitClick(false, info); });
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

                            $(".loginValidation").data("");
                        });
                });

            });






               handlePostProcess();
            });
            $(options.target).append($login);
        }

       
       function attemptLogin(){
            var data  = {
                    email : $('#txtEmail').val(),
                    password: $('#txtPassword').val()
                };

            $.ajax({
                type: "POST",
                url: "Secure.aspx/LoginUser",
                data: "{data: '"+ JSON.stringify(data) + "', apiUrl: '" + APIRoot +"/api/v1/resources/logins'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    var obj = (typeof response.d) === 'string' ? eval('(' + response.d + ')') : response.d;
                    if(obj.meta.message.length === 0){
                        // user successfully validated
                        $('.loginValidation').hide();

                        if (obj.results.User.agreedToUsageGuidelines) {
                            //options.context.setUserInfo(obj.results, function() { handleSubmitClick(false, obj.results); });
                            //options.context.setUserInfo(obj.results, function() { handleSubmitClick(obj.results); });
                            handleSubmitClick(obj.results);
                        }
                        else {
                            $("#modalTos").modal("show");
                            $('.loginValidation').show().find('.msg').html("You must agree to our updated Usage Guidelines.");
                            $('.loginValidation').data(obj.results).focus();
                            $('html, body').animate({
                                scrollTop : $('.loginValidation').offset().top
                            }, 0);
                        }
                        
                    }
                    else if(obj.meta.message[0].type === 'Error') {
                        // display error - currently assuming just 'Invalid Credentials' error.
                        $('.loginValidation').show().find('.msg').html(obj.meta.message[0].userMessage);
                        $('.loginValidation').focus();
                        $('html, body').animate({
                            scrollTop: $('.loginValidation').offset().top
                        }, 0);
                    }
                                      
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status); 
                    alert(thrownError);
                }
            });

       }

       function validateCredentials(){
            var isValid = true;
           
            // run validation output in reverse order so that the scrollto will target whatever form block is highest on the page.
            // orgForm.validateOrg() contains its own scrollto.

            //email & password validation
            var loginMsg = '';
            if($('#txtEmail').val() === ''){
                loginMsg += 'Email Address is a required field. <br>'; isValid = false;
            }
            if($('#txtPassword').val() === '') {
                loginMsg += 'Password is a required field. <br>'; isValid = false;
            }

            // ... show and scroll to message if necessary
            if(loginMsg !== '') {
                $('.loginValidation').show().find('.msg').html(loginMsg);
                $('.loginValidation').focus();
                $('html, body').animate({
                    scrollTop: $('.loginValidation').offset().top
                }, 0);
            }else {
                $('.loginValidation').hide();
            }
            return isValid;
       }


        main();

    };

})(jQuery);