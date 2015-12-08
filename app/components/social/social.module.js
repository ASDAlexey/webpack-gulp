import styles from './assets/styles/modal-invite.scss';
import socialFactory from './social.factory.js';
import gmailFactory from './gmail.factory.js';
import yahooFactory from './yahoo.factory.js';

var module = angular
    .module('app.social', [
        'ngFacebook',
        'ngLinkedIn'
    ])
    .factory('Social', socialFactory)
    .factory('Gmail', gmailFactory)
    .factory('Yahoo', yahooFactory)
    .config(configure)
    .run(runSocial)
;

function configure($facebookProvider, $linkedInProvider){
    $facebookProvider.setAppId('260486417492530');
    $facebookProvider.setVersion("v2.3");
    $facebookProvider.setPermissions("public_profile, user_birthday, email, user_education_history, user_location, user_relationships, user_work_history");

    $linkedInProvider
        .set('appKey', '75akh7xocr455o')
        .set('scope', 'r_basicprofile r_emailaddress')
        // .set('scope', 'r_fullprofile r_emailaddress')
    ;
}

function runSocial(Gmail){
    // Load the facebook SDK asynchronously
    (function(){
        // If we've already installed the SDK, we're done
        if (document.getElementById('facebook-jssdk')) {return;}

        // Get the first script element, which we'll use to find the parent node
        var firstScriptElement = document.getElementsByTagName('script')[0];

        // Create a new script element and set its id
        var facebookJS = document.createElement('script');
        facebookJS.id = 'facebook-jssdk';

        // Set the new script's source to the source of the Facebook JS SDK
        facebookJS.src = '//connect.facebook.net/en_US/all.js';

        // Insert the Facebook JS SDK into the DOM
        firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }());

    // init Google SDK to work with Gmail
    Gmail.loadAPI();

    // init service to work with Outlook, Hotmail
    hello.init({
        windows: '0000000044166E3F'
    }, {
        redirect_uri: '/redirect.html' // this page is stored in the folder 'static'
    });

    angular.element(document).ready(function () {
        // close popup window after redirection from FB
        if (navigator.userAgent.match('CriOS') && window.opener && angular.isFunction(window.opener.checkFBLoginStatus)) {
            window.opener.FB.getLoginStatus(function(response) {}, true);
            window.close();
        }
    });
}

export default module;