using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.Web.Script.Serialization;

namespace Storefront
{
    public partial class Share : System.Web.UI.Page
    {

        private string APIRoot = "", webFolder = "", mediaId = "";

        protected void Page_Load(object sender, EventArgs e)
        {
            mediaId = Request.QueryString["mediaId"].ToString();
            if (Request.Url.ToString().ToLower().IndexOf("test_storefront") > -1)
            {
                APIRoot = "http://nchm-tvss1-srv.cdc.gov";
                webFolder = "/test_StoreFront";
            }
            else if (Request.Url.ToString().ToLower().IndexOf("dev_storefront") > -1)
            {
                APIRoot = "http://nchm-dvss1-srv.cdc.gov";
                webFolder = "/dev_StoreFront";
            }
            else
            {
                APIRoot = "http://nchm-dvss1-srv.cdc.gov";
                webFolder = "";
            }

            //string WebsiteRoot = HttpContext.Current.Server.HtmlEncode("http://prototyped.cdc.gov/dev_storefront");
            //string APIRoot = HttpContext.Current.Server.HtmlEncode("");

            AddCss("~/Styles/csHtmlContent.css", this.Page);

            JavaScriptSerializer JSS = new JavaScriptSerializer();
            var o = JSS.Deserialize<dynamic>(getMediaData());

            string MediaType = o["results"]["mediaType"];
            string thumbUrl = "";
            string content = "";
            string description = "";

            string title = HttpUtility.HtmlDecode(o["results"]["title"]);

            // setup thumbnail root
            thumbUrl = APIRoot + "/api/v1/resources/media/" + mediaId + "/thumbnail?"
                        + "apiroot=" + Server.HtmlEncode(APIRoot)                        
                        + "&webroot=" + Server.HtmlEncode(FullyQualifiedApplicationPath);

            // complete thumbnail string and get content block;
            switch (MediaType){
                case "HTML":
                    thumbUrl += "&w=200&h=200&bw=700&bh=700";

                    content = HttpUtility.HtmlDecode(o["results"]["content"]);
                    description = StripTagsCharArray(content);
                    
                    break;

                case "eCard":                    
                    thumbUrl += "&w=200&h=200"
                        + "&bw=580&bh=580"
                        + "&cx=50"
                        + "&cy=76"
                        + "&cw=472"
                        + "&ch=260"
                        + "&pause=2000";

                    content += "<style type='text/css'> body {padding: 0px; margin: 0px;}</style>";
                    content += "<link href='" + webFolder + "/Styles/csEcard.css' rel='stylesheet' type='text/css' />";
                    content += "<script src='" + webFolder + "/Scripts/jquery-1.9.1.min.js' type='text/javascript'></script>";
                    content += "<script src='" + webFolder + "/Scripts/CDC.Video.js' type='text/javascript'></script>";
                    content += "<script src='" + webFolder + "/Scripts/Marketplace.Ecard_01.js' type='text/javascript'></script>";
                    content += "<script src='" + webFolder + "/Scripts/jquery.watermark.min.js' type='text/javascript'></script>";
                    content += "<div class='CDCeCard_00'></div><script language='javascript'>  $('.CDCeCard_00').ecard({        ";
                    content += "mediaId: " + mediaId.ToString() + ",        ";
                    content += "apiRoot: '" + APIRoot + "',        filePath: '" + webFolder + "/mediaAssets/ecards/cards/',        returnNavigation: {            text: 'Choose another eCard',            navigateUrl: ''        },        completeNavigation: {            text: 'Choose another eCard',            navigateUrl: ''        }  });</script></body></html>";

                    description = HttpUtility.HtmlDecode(o["results"]["description"]);

                    break;

                case "Video":
                    thumbUrl += "&w=200&h=200"
                        + "&bw=320&bh=185"
                        + "&pause=2000";

                    string targetUrl = HttpUtility.HtmlDecode(o["results"]["targetUrl"]);

                    targetUrl = targetUrl.Replace("http://www.youtube.com/embed/", "http://youtube.googleapis.com/v/");
                    targetUrl = targetUrl.Replace("http://www.youtube.com/watch?v=", "http://youtube.googleapis.com/v/");

                    content += "<iframe width='420' height='315' src='" + targetUrl + "' frameborder='0' allowfullscreen></iframe>";
                    description = HttpUtility.HtmlDecode(o["results"]["description"]);

                    break;

                case "Image":
                    thumbUrl += "&w=200&h=200"
                        + "&bw=800&bh=800"
                        + "&pause=3000";

                    string imgSrc = HttpUtility.HtmlDecode(o["results"]["sourceUrl"]);

                    content += "<img src='" + imgSrc + "'>";
                    description = HttpUtility.HtmlDecode(o["results"]["description"]);

                    break;

                case "Button":
                    thumbUrl += "&w=200&h=200"
                        + "&bw=250&bh=250"
                        + "&pause=1000";
                    
                    content = HttpUtility.HtmlDecode(o["results"]["content"]);
                    description = HttpUtility.HtmlDecode(o["results"]["description"]);

                    break;

                case "Badge":
                    thumbUrl += "&w=200&h=200"
                        + "&bw=180&bh=150"
                        + "&pause=1000";

                    content = HttpUtility.HtmlDecode(o["results"]["content"]);
                    description = HttpUtility.HtmlDecode(o["results"]["description"]);

                    break;

                case "Infographic":
                    thumbUrl += "&w=200&h=200"
                        + "&bw=298&bh=801"
                        + "&pause=1000";

                    string infoSrc = HttpUtility.HtmlDecode(o["results"]["sourceUrl"]);

                    content += "<img src='" + infoSrc + "'>";
                    description = HttpUtility.HtmlDecode(o["results"]["description"]);
                    break;

                case "Widget":
                    thumbUrl += "&w=200&h=200"
                        + "&bw=622&bh=472"
                        + "&pause=1000";

                    content = HttpUtility.HtmlDecode(o["results"]["content"]);
                    description = HttpUtility.HtmlDecode(o["results"]["description"]);
                    break;


            }
           

            HtmlMeta urlTag = new HtmlMeta();
            urlTag.Attributes.Add("property", "og:url");
            urlTag.Content = HttpContext.Current.Request.Url.AbsoluteUri;
            Page.Header.Controls.Add(urlTag);

            HtmlMeta titleTag = new HtmlMeta();
            titleTag.Attributes.Add("property", "og:title");
            titleTag.Content = title;
            Page.Header.Controls.Add(titleTag);

            HtmlMeta descTag = new HtmlMeta();
            descTag.Attributes.Add("property", "og:description");
            descTag.Content = description.Length>1000 ? description.Substring(0,1000) : description;
            Page.Header.Controls.Add(descTag);

            HtmlMeta thumbTag = new HtmlMeta();
            thumbTag.Attributes.Add("property", "og:image");
            thumbTag.Content = thumbUrl;
            Page.Header.Controls.Add(thumbTag);

            Page.Title = title;
            lit.Text = content;
            img.ImageUrl = thumbUrl;

            hlBackLink.NavigateUrl = FullyQualifiedApplicationPath + "/default.htm?mediaId=" + mediaId;
            hlBackLink.Text = FullyQualifiedApplicationPath;

        }

        private string getMediaData()
        {
            string url = APIRoot + "/api/v1/resources/media/" + mediaId + "/syndicate?";

            string response = string.Empty;

            System.Net.WebClient webClient = new System.Net.WebClient();
            response = webClient.DownloadString(url);
            return response;
        }

        private void AddCss(string path, Page page)
        {
            Literal cssFile = new Literal() { Text = @"<link href=""" + page.ResolveUrl(path) + @""" type=""text/css"" rel=""stylesheet"" />" };
            page.Header.Controls.Add(cssFile);
        }

        private string StripTagsCharArray(string source)
        {
            char[] array = new char[source.Length];
            int arrayIndex = 0;
            bool inside = false;

            for (int i = 0; i < source.Length; i++)
            {
                char let = source[i];
                if (let == '<')
                {
                    inside = true;
                    continue;
                }
                if (let == '>')
                {
                    inside = false;
                    continue;
                }
                if (!inside)
                {
                    array[arrayIndex] = let;
                    arrayIndex++;
                }
            }
            return new string(array, 0, arrayIndex);
        }

        private string FullyQualifiedApplicationPath
        {
            get
            {
                //Return variable declaration
                var appPath = string.Empty;

                //Getting the current context of HTTP request
                var context = HttpContext.Current;

                //Checking the current context content
                if (context != null)
                {
                    //Formatting the fully qualified website url/name
                    appPath = string.Format("{0}://{1}{2}{3}",
                                            context.Request.Url.Scheme,
                                            context.Request.Url.Host,
                                            context.Request.Url.Port == 80
                                                ? string.Empty
                                                : ":" + context.Request.Url.Port,
                                            context.Request.ApplicationPath);
                }

                if (!appPath.EndsWith("/"))
                    appPath += "/";

                return appPath;
            }
        }

    }
}