<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="fbTest.aspx.cs" Inherits="Storefront.fbTest" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Sample page</title>
    <script language='javascript' type="text/javascript">

        // facebook
        function share(url) {

            var encoded = encodeURIComponent(url);
            var fullUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encoded;

            window.open(fullUrl, 'facebook', 'width=626,height=436');
            return false;
        }

        // twitter
        !function (d, s, id) {
            var js,
            fjs = d.getElementsByTagName(s)[0],
            p = /^http:/.test(d.location) ? 'http' : 'https';
            if (!d.getElementById(id)) {
                js = d.createElement(s);
                js.id = id;
                js.src = p + '://platform.twitter.com/widgets.js'; fjs.parentNode.insertBefore(js, fjs);
            }
        } 
        (document, 'script', 'twitter-wjs');

    </script>
</head>
<body>
    I am a demo page, sample page or tile representation of a block of content... 
    <a href="#" onclick="share('http://www.cdc.gov/socialmedia/ContentServices/Sample/CS_FacebookSample.htm')">Share on Facebook </a>
    <p></p>    
    <a href="https://twitter.com/share" 
            class="twitter-share-button"
            data-url="http://www.cdc.gov/socialmedia/ContentServices/Sample/CS_FacebookSample.htm"
            data-count="none">Tweet</a>
    
</body>
</html>
