using System;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using Gov.Hhs.Cdc.OAuth;

namespace Storefront
{

    public class Secure : Page
    {

        enum RequestMethods { POST, DELETE, PUT };

        private static string consumerKey = "rxhwaVs0rYiWau8bYsJH1xaOxUpCCVsJBGQTHlBg";
        private static string consumerSecret = "storeFront123";

        private static System.Net.WebHeaderCollection SecureHeader
        {
            get { return (System.Net.WebHeaderCollection)HttpContext.Current.Session["SecureHeader"]; }
            set { HttpContext.Current.Session["SecureHeader"] = value; }
        }

        [WebMethod(EnableSession = true)]
        public static string RegisterUser(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.POST);
        }

        [WebMethod(EnableSession = true)]
        public static string LoginUser(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.POST);
        }

        [WebMethod(EnableSession = true)]
        public static string GetSyndicationList(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.POST);
        }

        [WebMethod(EnableSession = true)]
        public static string AddMediaToSyndicationList(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.POST);
        }

        [WebMethod(EnableSession = true)]
        public static string RemoveMediaFromSyndicationList(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.DELETE);
        }

        [WebMethod(EnableSession = true)]
        public static string SendEcard(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.POST);
        }

        [WebMethod(EnableSession = true)]
        public static string AgreeToUsageGuidelines(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.PUT);
        }

        [WebMethod(EnableSession = true)]
        public static string RequestPasswordReset(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.POST);
        }

        [WebMethod(EnableSession = true)]
        public static string ResetPassword(string data, string apiUrl)
        {
            return makeCall(ref data, apiUrl, RequestMethods.POST);
        }

        private static string makeCall(ref string data, string apiUrl, RequestMethods method)
        {
            data = data.Replace("\\u0027", "'");

            var uri = new Uri(apiUrl);
            var oAuth = new OAuthBase(uri, consumerKey, consumerSecret, "", "", method.ToString(),
                OAuthBase.GenerateTimeStamp(), OAuthBase.GenerateNonce(),
                data);

            string response = string.Empty;
            System.Net.WebClient webClient = new System.Net.WebClient();
            webClient.Headers.Add("Authorization", oAuth.OAuthHeader);

            //Used for SSL                        
            ServicePointManager.ServerCertificateValidationCallback
                += new System.Net.Security.RemoteCertificateValidationCallback(ValidateServerCertificate);

            response = webClient.UploadString(oAuth.Url, method.ToString(), data);
            SecureHeader = webClient.ResponseHeaders;

            return response;
        }

        //for testing purpose only, accept any dodgy certificate... 
        public static bool ValidateServerCertificate(object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
        {
            return true;
        }

    }
}