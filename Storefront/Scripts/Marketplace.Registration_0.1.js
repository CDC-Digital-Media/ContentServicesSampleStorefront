"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'registration';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            submitHandler : '',
            cancelHandler : '',
            postProcess: ''
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        var valueSetData, typeAheadArray = [], mapped = {};
        var $regForm;
        var orgForm;

        function handleSubmitClick(userInfo){
            var func = options.submitHandler;
            if (typeof func === 'function') {
                func(true, userInfo);
                return false;
            }
        }

        function handleCancelClick(){
            var func = options.cancelHandler;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function handlePostProcess(){
            var func = options.postProcess;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function main() {
            $regForm = $("<div>");
            $(options.target).append($regForm);
            $regForm.hide();
            $regForm.load("templates/Registration.htm", function() {
                setupRegistration();
            });
        }

        function setupRegistration(){
            
            orgForm = $(options.target).find(".organization").organization({
                showRequired : false,
                completeHandler: function(){
                    handlePostProcess();
                    $regForm.show();
                }
            });

            $('.btnCancel').click(function(){handleCancelClick(); });

            $('.btnSubmitRegistration').click(function(){
                return validateRegistration();
            });


            $('#txtPassword1, #txtPassword2').bind('cut copy paste', function(event) {
                event.preventDefault();
            });

            $("#modalTos").load("templates/ModalUsage.htm", function() {

                $("#modalTos .modal-body").load("templates/UsageGuidelines.htm", function() {
                    
                    $(".btnTosAgree").click(function() {
                        $('#modalTos').modal('hide');
                        // submit new registration
                        saveNewRegisteredUser();

                        // get user data
                        // swap to user view

                    });
                    $(".btnTosCancel").click(function() {
                        $('.loginValidation').show().find('.msg').html("You must agree to our updated Usage Guidelines.");
                    });
                });

            });
        }

        function jsonSafe(obj){
            for(var property in obj) {
                
                if(typeof obj[property] == 'object'){
                    obj[property] = jsonSafe(obj[property]);
                }
                else if(typeof obj[property] == 'string'){
                    obj[property] = obj[property].replace(/\'/g,"\\u0027");
                }
            }
            return obj;
        }

        function saveNewRegisteredUser(){

            var data  = {
                firstName : $('#txtFirstName').val(),
                middleName : $('#txtMiddleName').val(),
                lastName : $('#txtLastName').val(),
                email : $('#txtEmail').val(),
                password: $('#txtPassword1').val(),
                passwordRepeat: $('#txtPassword2').val(),
                organizations: [orgForm.getOrg()]
            };

            data = jsonSafe(data);

            $.ajax({
                type: "POST",
                url: "Secure.aspx/RegisterUser",
                data: "{data: '"+ JSON.stringify(data) +"', apiUrl: '"+ APIRoot +"/api/v1/resources/users'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    var obj = (typeof response.d) == 'string' ? eval('(' + response.d + ')') : response.d;
                    if(obj.meta.message.length === 0){
                        // user successfully added
                        handleSubmitClick(obj.results);
                    }
                    else if(obj.meta.message[0].type == 'Error'){
                        // display error - currently assuming just 'email already in use' error.
                        $('.loginValidation').show().find('.msg').html(obj.meta.message[0].userMessage);
                        $('.loginValidation').focus();
                        $('html, body').animate({
                            scrollTop: $('.loginValidation').offset().top
                        }, 0);
                    }
                                      
                },
                error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status); alert(thrownError);
                }
            });

        }

        function validateRegistration(){
            var isValid = true;
           
            // run validation output in reverse order so that the scrollto will target whatever form block is highest on the page.
            // orgForm.validateOrg() contains its own scrollto.

            //email & password validation
            var loginMsg = '';
            if($('#txtEmail').val() === ''){
                loginMsg += 'Email is a required field. <br>'; isValid = false;
            }
            else if(!isValidEmailAddress($('#txtEmail').val())){
                loginMsg += 'Email address must be in a valid email address format. <br>'; isValid = false;
            }

            if($('#txtPassword1').val() === '' || $('#txtPassword2').val() === ''){
                loginMsg += 'Both password fields must be completed. <br>'; isValid = false;
            }
            else if($('#txtPassword1').val() !== $('#txtPassword2').val()){
                loginMsg += 'The password fields do not match. <br>'; isValid = false;
            }
            else if($('#txtPassword1').val().match(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,15})$/) == null){
                loginMsg += 'The password does not meet the security requirements. <br>'; isValid = false;
            }

            // ... show and scroll to message if necessary
            if(loginMsg !== ''){
                $('.loginValidation').show().find('.msg').html(loginMsg);
                $('.loginValidation').focus();
                $('html, body').animate({
                    scrollTop: $('.loginValidation').offset().top
                }, 0);
            }else {
                $('.loginValidation').hide();
            }

            // org validation
            var orgValid = orgForm.validateOrg();
            if (!orgValid) {
                isValid = false;
            }

            // contact validation
            var contactMsg = '';
            if($('#txtFirstName').val() === '') {
                contactMsg += 'First Name is a required field. <br>'; isValid = false;
            }
            if($('#txtLastName').val() === '') {
                contactMsg += 'Last Name is a required field. <br>'; isValid = false;
            }

            // ... show and scroll to message if necessary
            if(contactMsg !== '') {
                $('.contactInfoValidation').show().find('.msg').html(contactMsg);
                $('.contactInfoValidation').focus();
                $('html, body').animate({
                    scrollTop: $('.contactInfoValidation').offset().top
                }, 0);
            }else {
                $('.contactInfoValidation').hide();
            }


            return isValid;
        }


        main();

    };

})(jQuery);