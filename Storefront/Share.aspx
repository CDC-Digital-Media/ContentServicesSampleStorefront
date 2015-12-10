<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Share.aspx.cs" Inherits="Storefront.Share" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat='server'>
    
    <title></title>      

    <script src="https://apis.google.com/js/plusone.js" type="text/javascript"></script>

</head>
<body>
            <div class='placeholder csHtmlContent'>
                <div>
                    <asp:Image runat='server' ID='img' />
                </div>
                
                <div style='clear:both;'>
                    <asp:Literal runat='server' ID='lit'></asp:Literal>                                                                     
                </div>

                <div style='clear:both; padding:20px; margin-top:10px; background-color:#bbb;'>
                    This content is available for syndication on your website. For more information, please visit the CDC Content Services site at <asp:HyperLink runat='server' ID='hlBackLink'></asp:HyperLink>.
                </div>

            </div>
</body>
</html>
