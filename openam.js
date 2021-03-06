/* 
* The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2014-2016 ForgeRock AS.
 */

/* Some useful wrappers around the OpenAM APIs 
 * To be extended further
 * openam.js (v0.1)
 * Author: Identity Wrestler
 * Notice: This wrapper is not supported/maintained/endorsed by ForgeRock
 */

// TO DO: The Legacy Functions are not implemented yet.
    
// Some global variables
var debugEnabled = false;
var storageExist = ("sessionStorage" in window && window.sessionStorage);

/*
 * Opens a window of height h and displays the URL url
 * @param {type} url The URL that the window will display
 * @param {type} h The height of the window
 */
var openWindow = function (url, h) {
    var left = (screen.width / 2) - (900 / 2);
    var top = (screen.height / 2) - (600 / 2);
    var height = (h.height !== null) ? h.height : 520;
    var win = window.open(url, "win", "width=900, height=" + height + ", top=" + top + ", left=" + left);
    win.focus();
    var id = setInterval(function () {
        try {
            var loc = win.location.href;
            if (win.location.href.indexOf(url) < 0) {
                clearInterval(id);
                win.opener.location.replace(loc);
                win.close();
            } 
        } catch (ex1) {
            // Do nothing
        };
    }, 500);
};

/**
 * Gets the path/dir of the page running the script
 * @function getMyURLDir
 * @returns {String}
 */
function getMyURLDir() {
    var loc = window.location.pathname;
    return window.location.protocol + "//" + window.location.hostname + ":" +
            window.location.port +
            loc.substring(0, loc.lastIndexOf('/') + 1);
}
                              
/**
 * Gets the URL of the page running the script
 * @function getMyURL
 * @returns {String}
 */
function getMyURL() {
    var host = window.location.hostname;
    var protocol = window.location.protocol;
    var port = window.location.port;
    var path = window.location.pathname;
    return protocol + "//" + host + ":" + port + path;
}

/**
 * Create a Cookie for the domain specified in domainName
 * @function createCookie
 * @param {type} name Name of the cookie to be created
 * @param {type} value Value for the cookie
 * @param {type} hours Time that the cookie will exist
 * @param {type} domainName Domain in which the cookie will be created
 */
function createCookie(name, value, hours, domainName) {
    var expires;
    var domain;
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
        domain = ";domain=" + domainName;       
    } else {
        expires = "";
        domain = ";domain=" + domainName;
    }
    document.cookie = escape(name) + "=" + escape(value) + expires + domain + "; path=/";
}

/**
 * Deletes the coookie
 * @deleteCookie
 * @param {type} name Name of the cookie to be deleted
 * @param {type} domainName Domain where the cookie resides
 */
function deleteCookie(name, domainName) {
    createCookie(name, "", -1, domainName);
}


/**
 * Get's the value of the cookie specified
 * @function getCookie
 * @param {type} name The name of the coookie whose value we want to retrieve
 * @returns {String} The value of the cookie
 */
function getCookie(name) {
var value = " " + document.cookie;
var cStart = value.indexOf(" " + name + "=");
if (cStart === -1) {
    value = null;
}
else {
    cStart = value.indexOf("=", cStart) + 1;
    var cEnd = value.indexOf(";", cStart);
    if (cEnd === -1) {
        cEnd = value.length;
    }
    value = unescape(value.substring(cStart,cEnd));
}
return value;
}

/**
 * Gets the value stored in the Local session store. Using the key specified by 
 * @function getLocal
 * @param {type} storageKey The key of the value to retrive
 * @returns {type} data The value of the value retrieved
 */
function getLocal(storageKey) {

    var now, expiration;
    var storedItem = false;
    var storedItemS = null;
    var data = false;
    try {
        if (storageExist) {
            storedItem = sessionStorage.getItem(storageKey);
            debug("getLocal: There is sessionStorage");
            if (storedItem) {
                storedItemS = JSON.parse(storedItem);
                debug("getLocal: There is Data stored: " + storedItemS);
                now = new Date();
                expiration = new Date(storedItemS.timestamp);
                expiration.setMinutes(expiration.getMinutes() + this.cacheTime);
                if (now.getTime() >= expiration.getTime()) {
                    debug("getLocal: DATA EXPIRED ");
                    data = false;
                    sessionStorage.removeItem(storageKey);
                } else {
                    debug("getLocal: DATA NOT EXPIRED ");
                    data = storedItemS.data;
                    data = data.toLocaleString();
                    debug("getLocal: Data parsed: " + data);
                }
            }
        }
    } catch (error) {
        debug("getLocal: STORAGE ERROR" + error);
        data =false;
    }
    return data;
};

/**
 * Stores a value "data" in the key "storageKey" in the local session storage
 * @function storeLocal
 * @param {type} storageKey - The key to be used to store the value
 * @param {type} data - The value of the data to be stored
 */
function storeLocal(storageKey, data) {
    if (storageExist) {
        try {
            debug("storeLocal: DATA TO STORE IS: " + storageKey + ":" + data);
            sessionStorage.setItem(storageKey,
                    JSON.stringify({
                        timestamp: new Date(),
                        data: data}));
        } catch (err) {
            // Nothing
        }
    }
};

/*
 * Removes the value for the storageKey
 * @function removeLocal
 * @param {type} storageKey
 * @returns {undefined}
 */
function removeLocal(storageKey) {
    if (storageExist) {
        try {
            debug("removeLocal: REMOVING " + storageKey);
            sessionStorage.removeItem(storageKey);
        } catch (err) {
            // Do nothing
        }
    }
};

/**
 * Removes the whole local session storage
 * @function removeAlllocal
 * @returns {undefined}
 */
function removeAllLocal() {
    if (storageExist) {
        try {
            debug("removeAllLocal: REMOVING ALL");
            removeLocal("validSession");
            removeLocal("attributes");
        } catch (err) {
            // Do nothing
        }
    }
};

/**
 * Displays a message in the browser's console (if possible)
 * @function debug
 * @param {type} message - Message to display in the console
 * @returns {undefined}
 */
function debug(message) {
    if (debugEnabled) {
        try {
            console.log(message);
        } catch (err) {
            alert("Debugging will be disabled, your browser does not support it");
            debugEnabled = false;
        }
    }
};

// Functions to connect to the server using XMLHttpRequest
// or MSoft stuff, in case is necessary
var ajax = {};
ajax.x = function () {
    if ('withCredentials' in new XMLHttpRequest()) {
        debug("ajax: XHR support");
        return new XMLHttpRequest();
    } else if (typeof XDomainRequest !== "undefined") {
        debug("ajax: XDR support");
        return new XDomainRequest();
    } else {
        var versions = [
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        var xhr;
        for (var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
                debug("ajax: ERROR when creating ActiveXObject");
            }
        }
        debug("ajax: ActiveXObject support");
        return xhr;
    }
};

ajax.send = function(url, callback, method, data, contentType, sessionCookieName, tokenId, sync) {
    var x = ajax.x();
    x.open(method, url, sync, null, null);
    x.onreadystatechange = function() {
        if (x.readyState === 4) {
            callback(x.responseText);
        }
    };
    x.setRequestHeader('Content-type', contentType);
    if (tokenId && sessionCookieName) {
       x.setRequestHeader(sessionCookieName, tokenId); 
    }
    x.send(data);
};

ajax.authenticate = function (url, callback, data, headers, sync) {
    var x = ajax.x();

    x.onreadystatechange = function () {
        if (x.readyState === 4) {
                callback(x.responseText, x.getAllResponseHeaders());
        }
    };
    
    try {
        x.open('POST', url, false);
    } catch (err) {
        debug("ERROR" + err);
    }
    if (headers) {
      for (var option in headers) {
            try {
                x.setRequestHeader(option, headers[option]);
            } catch (err) {
                debug("ERROR" + err);
            }
      }
    }
    x.setRequestHeader('Content-type', 'application/json');
    x.send(data);
};

ajax.get = function(url, callback, contentType, sessionCookieName, tokenId, sync) {
    ajax.send(url, callback, 'GET', null, contentType, sessionCookieName, tokenId, sync);
};

ajax.post = function(url, data, callback, contentType, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), contentType, sync);
};

/**
 * OpenAM Configuration instance
 * @function openamConfig
 * @param {Object} options - The OpenAM Configuration JSON object.
 * <pre>
 *  Here an example.  
 *  {
 *       baseurl: "http://openam1.example.com:8080/openam",
 *       realm: "/",                                        // optional    
 *       cachetime: 3,                                      // optional 
 *       debugenabled: true                                 // optional
 *  }   
 * </pre>
 * @param {String} options.baseurl - The URL where OpenAM is running, example: 
 *  "https://openam.example.com:443/openam"
 * @param {String} [options.realm=The default realm for the baseurl used] - Name
 *  of the realm to be used, example: "/"
 * @param {String} [options.cachetime=3] - Time in minutes the session valid response
 *  and attributes are cached in the session store (if possible). To disable caching
 *  set the time to 0. Example of caching for 3 minutes: 3
 * @param {String} [options.debugenabled=false] - Enable debug, works for some browser,
 *  not for all. Example: true
 * @returns {openamConfig} An instance of the OpenAM Configuration.
*/
function openamConfig(options) {

    if (options === undefined) {
        throw "Object configuration must be specified";
    }
    
    if (Boolean(options.debugenabled)) {
        debugEnabled = true;
    }

    // Some important service URIs
    this.XUILoginURI = function() {
        return "/XUI/#login";
    };
    this.XUILogoutURI = function() {
        return "/XUI/#logout";
    };
    this.LoginURI = function() {
        return "/UI/Login";
    };
    this.LogoutURI = function() {
        return "/UI/Logout";
    };
    this.ProfileURI = function() {
        return "/XUI/#profile/";
    };

    // OpenAM REST API URIs
    this.sessionsURI = function() {
        return "/json/sessions";
    };
    
    this.authenticationURI = function() {
        return "/json/authenticate";
    };
    this.attributesURI = function() {
        return "/json/users/";
    };
    this.serverinfoURI = function() {
        return "/json/serverinfo/*";
    };

    // OpenAM Legacy REST API URIs
    this.legacyAuthenticationURI = function() {
        return "/identity/json/authenticate";
    };
    this.legacyAttributesURI = function() {
        return "/identity/json/attributes";
    };
    this.legacyValidateSession = function() {
        return "/identity/json/isTokenValid";
    };
    this.legacyLogoutURI = function() {
        return "/identity/logout";
    };

    // OpenAM Param names
    this.logoutURI = function() {
        return "logout";
    };
    this.realmParam = function() {
        return "realm";
    };
    this.serviceParam = function() {
        return "service";
    };
    this.moduleParam = function() {
        return "module";
    };
    this.authTypeParam = function() {
        return "authIndexType";
    };
    this.authValueParam = function() {
        return "authIndexValue";
    };
    
    // The Unique Identifier defined in OpenAM for the Identity, ususallly uid
    this.uniqueId = 'uid';
    // The value for the attribute defined by uniqueID. Initially empty.
    this.Id = '';

    debug("openamConfig: Unique ID for this configuration is: " + this.uniqueId);

    this.openAMBaseURL = function () {
        return options.baseurl;
    };

    this.realm = function () {
        if (options.realm) {
            return options.realm;
        } else {
            return "/";
        }
    };

    serverinfo_url = options.baseurl + this.serverinfoURI();
    if (options.realm && options.realm !== '' && options.realm !== '/') {
        serverinfo_url = serverinfo_url.replace("/json", "/json" + options.realm);
    }

    function serverinfoURL() {
        return serverinfo_url;
    };

    var response_sir = null;
    var serverinfo_url = serverinfoURL();
    debug("openamConfig: Serverinfo URL: " + serverinfo_url);
    ajax.get(serverinfo_url,
            function (responseText) {
                response_sir = responseText;
            },
            'application/json');

    function serverinfo() {
        return response_sir;
    };

    var cookieName = JSON.parse(serverinfo()).cookieName;
    debug("openamConfig: Session Cookie Name=" + cookieName);
    this.sessionCookieName = function () {
        return cookieName;
    };

    // Taking the first domain
    // ToDo: Use all the domains and restrict as an option
    var domain = JSON.parse(response_sir).domains[0];

    this.domainName = function () {
        return domain;
    };

    // Legacy not implemented yet
    this.legacyEnabled = false;

    var ssotoken_ = getCookie(cookieName);

    this.ssotoken = function () {
        return ssotoken_;
    };

    this.XUILoginURL = function () {
        return options.baseurl + this.XUILoginURI();
    };

    this.loginURL = function () {
        return options.baseurl + this.LoginURI();
    };

    this.cacheTime = 0;
    this.cacheEnabled = false;
    if (storageExist && options.cachetime > 0) {
        this.cacheTime = options.cachetime || 3;
        this.cacheEnabled = true;
    }

    this.socialImplementations = function () {
        return JSON.parse(response_sir).socialImplementations;
    };

    /*
     * Provides the URL to be used for the authentication based on the module or service provided
     * @param {String | undefined} module - AuthN module to be used. Default is the default AuthN module configured in the OpenAM for the realm
     * @param {String | undefined} service - Name of the service chain to be used for the authentication
     * @returns {string} - Returns the URL of the authentication endpoint for the realm and module or service provided
     */
    this.authenticationURL = function (module, service, orealm) {
        debug("openamConfig.authenticationURL:OpenAM Base URL: " + options.baseurl);
        var realm_ = orealm || options.realm;
        var authentication_url = options.baseurl + this.authenticationURI() + 
                "?" + this.realmParam() + "=" + realm_;
        if (module && module !== '') {
            if (authentication_url.indexOf("?") !== -1) {
                authentication_url = authentication_url + "&" + this.authTypeParam() + "=" + this.moduleParam() + "&" +
                        this.authValueParam() + "=" + module;
            } else {
                authentication_url = authentication_url + "?" + this.authTypeParam() + "=" + this.moduleParam() + "&" +
                        this.authValueParam() + "=" + module;
            }
        } else {
            if (service && service !== '') {
                if (authentication_url.indexOf("?") !== -1) {
                    authentication_url = authentication_url + "&" + this.authTypeParam() + "=" + this.serviceParam() + "&" +
                            this.authValueParam() + "=" + service;
                } else {
                    authentication_url = authentication_url + "?" + this.authTypeParam() + "=" + this.serviceParam() + "&" +
                            this.authValueParam() + "=" + service;
                }
            }
        }
        return authentication_url;
    };

    /*
     * Provides the proper OpenAM Attributes URL using the configured realm
     * @param {String} orealm The realm to be used to build the URL
     * @returns {String} - Returns the URL of the attributes end point of the OpenAM
     */
    this.attributesURL = function (orealm) {
        var attributes_url = options.baseurl + this.attributesURI();
        if (options.realm !== '' & options.realm !== '/') {
            var realm_op = options.realm;
        }
        realm_ = orealm || realm_op;
        if (realm_ !== '' & realm_ !== '/') {
            realm_ = orealm || options.realm;
            attributes_url = attributes_url.replace("/users", realm_ + "/users");
        }
        return attributes_url;
    };

    /*
     * Provides the OpenAM authentication URL using the parameters configured 
     * @param {String} tokenId - The token id that represents the OpenAM session
     * @returns {String} - Returns The URL of the logout endpoint for a modern OpenAM
     */
    this.logoutURL = function (tokenId) {
        if (!this.legacyEnabled) {
            var logout_url = options.baseurl + this.sessionsURI() + "/" + tokenId + "?_action=logout";
        }
        return logout_url;
    };

    /*
     * Provides the OpenAM sessions URL using the parameters configured 
     * @returns {String} - Returns The URL of the sessions endpoint for a modern OpenAM
     */
    this.sessionsURL = function () {
        if (!this.legacyEnabled) {
            return options.baseurl + this.sessionsURI();
        } else {
            return options.baseurl + this.legacyValidateSession();
        }
    };
}

/**
 * Redirects for authentication to an OpenAM using the Authentication module specified
 * @function authNRedirect
 * @param {Object} options - The configuration object to use
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     openam: myOpenAMConfigObject,
 *     module: "DataStore",                                         // optional
 *     service: "ldapService",                                      // optional
 *     gotoURL: "http://ap.example.com:8880/exampleNRO02.html",     // optional
 *     gotoOnFail: "http://ap.example.com:8880/exampleNRO02.html",  // optional
 *     classic: false,                                              // optional
 *     windowed: true                                               // optional
 *  }   
 * </pre>
 * @param {Object|String} options.openam The OpenAM Configuration Object. This is
 *  a mandatory attribute. See openam.js documentation for more information
 * @param {String} [options.module=OpenAM realm default] The Authentication module 
 *  to use in the left side of the login box.
 * @param {String} [options.service=OpenAM realm default] The Authentication service
 *  chain to use in the left side of the login box. Notice that service takes 
 *  precedence over module.
 * @param {String} [options.gotoURL=Current page] The URL to go to after a
 *  successful authentication.
 * @param {String} [options.gotoOnFail=Current page] The URL to go to after an
  * authentication event has failed.
 * @param {String} [options.classic=false] Boolean attribute to specify if we are
 *  using the classic UI (true) or the XUI (false). Default is to use the XUI.
 * @param {String} [options.windowed=true] Boolean attribute to specify if the
 *  redirect will happen in a pop-up window or not.
 */
openamConfig.prototype.authNRedirect = function (options) 
{                                                 
    var redirectURL = "";
    var myURL = encodeURIComponent(getMyURL());
    if (options) {
        var module = options.module || null;
        var service = options.service || null;
        var windowed = true;
        if (options.windowed !== undefined) {
            windowed = options.windowed;
        }
        var gotoURL = options.gotoURL || myURL;
        var gotoOnFail = options.gotoOnFail || myURL;
        var classic = options.classic || false;
        var realm_ = options.realm || this.realm();
    }
    if (!module || module === '') {
        module = '';
        debug("authNRedirect: module present:" + module);
    }
    if (!service || service === '') {
        service = '';
        debug("authNRedirect: service present:" + service);
    }
    
    if (module) {
        if (!classic) {
            redirectURL = this.XUILoginURL() + realm_ + "&" + this.moduleParam() + "=" +
                    module + "&goto=" + gotoURL + "&gotoOnFail=" + gotoOnFail;
        } else {
            redirectURL = this.loginURL() + "?" + this.realmParam() + "=" + realm_ + "&" +
                    this.moduleParam() + "=" + module + "&goto=" + gotoURL +
                    "&gotoOnFail=" + gotoOnFail;
        }
    }
    
    if (service) {
        if (!classic) {
            redirectURL = this.XUILoginURL() + realm_ + "&" + this.serviceParam() + "=" +
                    service + "&goto=" + gotoURL + "&gotoOnFail=" + gotoOnFail;
        } else {
            redirectURL = this.loginURL() + "?" + this.realmParam() + "=" + realm_ + "&" +
                    this.serviceParam() + "=" + service + "&goto=" + gotoURL +
                    "&gotoOnFail=" + gotoOnFail;
        }
    }
    
    if (!module && !service) {
        if (!classic) {
            redirectURL = this.XUILoginURL() + realm_ + 
                    "&goto=" + gotoURL + "&gotoOnFail=" + gotoOnFail;
        } else {
            redirectURL = this.loginURL() + "?" + this.realmParam() + "=" + realm_ + 
                    "&goto=" + gotoURL + "&gotoOnFail=" + gotoOnFail;
        }
    }
    
    if (windowed) {
        openWindow(redirectURL, {height: 500});
    } else {
        window.location = redirectURL;
    }
    return false;
};

/**
 *  Checks if a user is authenticated
 * @function isUserAuthenticated
 * @returns {Boolean} - True if a user is authenticated
*/
openamConfig.prototype.isUserAuthenticated = function () {
    
    if (this.ssotoken() && this.ssotoken() !== '' && this.isSessionValid(this.ssotoken())) {
        debug("isUserAuthenticated: USER AUTHENTICATED");
        return true;      
    } else {
        debug("isUserAuthenticated: USER NOT AUTHENTICATED");
        return false;
    }
};

/**
 * Checks if the session that the tokenID represents is valid
 * @function isSessionValid
 * @param {String} tokenId - The SSO Token ID (a.k.a the identifier of the session)
 * @returns {Boolean} - True if the session is valid
*/
openamConfig.prototype.isSessionValid = function (tokenId) {
    var valid = false;
    var sessions_url = "";
    var response = null;
    
    response = getLocal("validSession");
    debug("isSessionValid cached response: " + response);
    if (response) {
        var parsedR = JSON.parse(response);
        valid = parsedR.valid; 
        this.Id = parsedR[this.uniqueId];
        if (valid && this.id) {
            return valid;
        }
    }
    
    if (!this.legacyEnabled) {
        debug("isSessionValid: Legacy Mode Disabled");
        sessions_url = this.sessionsURL();
        ajax.post(sessions_url + "/" + tokenId + "?_action=validate",
                  null,function(responseText) { 
                      response = responseText;
                      },
                  'application/json');
        var parsedR = JSON.parse(response);
        valid = parsedR.valid;
        this.Id = parsedR[this.uniqueId];
        debug("VALID IS: " + valid);
    } else {
        debug("isSessionValid: Legacy Mode Enabled");
        sessions_url = this.sessionsURL();
        ajax.post(sessions_url + "?tokenid=" + tokenId, null,
                   function(responseText) {
                       valid = JSON.parse(responseText).valid;
                      },
                   'application/json');
    }
    storeLocal("validSession", response);
    debug("isSessionValid: isValid Response: " + valid + "; " + this.uniqueId + "="
        + this.Id);

    return valid;
};


/**
 *  Authenticates an identity using any authentication module
 *  The version of the AM should support the /json/authenticate endpoint.
 * @function authenticate
 * @param {Object} options - The configuration object to use
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     module: "DataStore",                                         // optional
 *     service: "ldapService",                                      // optional
 *     realm: "/",                                                  // optional
 *     headers: "http://ap.example.com:8880/exampleNRO02.html",     // optional
 *     data: objectData                                             // optional
 *  }   
 * </pre>
 * @param {String} [options.module=OpenAM realm default] The Authentication module 
 *  to use in the left side of the login box.
 * @param {String} [options.service=OpenAM realm default] The Authentication service
 *  chain to use in the left side of the login box. Notice that service takes 
 *  precedence over module.
 * @param {String} [options.realm=The one configured in openam.js] Realm where the
 *   authentication will take place
 * @param {Object} options.headers - Object containing the credentials passed as headers
 * @param {Object} [options.data={}] - The payload to be submitted to the authentication 
 *  module 
 * 
 */
openamConfig.prototype.authenticate =  function (options) {
    if (!this.legacyEnabled) {
        return this.authenticateWithModernOpenAM(options);      
    } else {
        return this.authenticateWithLegacyOpenAM(options);
    }
};

/*
 *  Authenticates an identity using any authentication module
 *  The version of the AM should support the /json/authenticate endpoint.
 *  authenticateWithModernOpenAM
 * @param {Object} options - The configuration object to use
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     module: "DataStore",                                         // optional
 *     service: "ldapService",                                      // optional
 *     realm: "/",                                                  // optional
 *     headers: "http://ap.example.com:8880/exampleNRO02.html",     // optional
 *     data: objectData                                             // optional
 *  }   
 * </pre>
 * @param {String} [options.module=OpenAM realm default] The Authentication module 
 *  to use in the left side of the login box.
 * @param {String} [options.service=OpenAM realm default] The Authentication service
 *  chain to use in the left side of the login box. Notice that service takes 
 *  precedence over module.
 * @param {String} [options.realm=The one configured in openam.js] Realm where the
 *   authentication will take place
 * @param {Object} options.headers - Object containing the credentials passed as headers
 * @param {Object} [options.data={}] - The payload to be submitted to the authentication 
 *  module 
 */
openamConfig.prototype.authenticateWithModernOpenAM = function(options) {
    if (options) {
        var module = options.module || null;
        var service = options.service || null;
        var headers = options.headers || null;
        var data = options.data || "{}";
        var realm = options.realm || this.realm();
    }
    if (!module || module === '') {
        module = '';
    }
    if (!service || service === '') {
        service = '';
    }
    var tokenId = null;
    var response = null;
    var allHeaders = null;
    var authentication_url = this.authenticationURL(module, service, realm);
    debug("authenticateWithModernOpenAM: AUTHN URL: " + authentication_url);
    try {
        ajax.authenticate(authentication_url,
                function (responseText, allHeaders_) {
                    if (responseText) {
                       tokenId = JSON.parse(responseText).tokenId;
                       response = responseText;
                       allHeaders = allHeaders_;
                    }
                }, data, headers);
    } catch (err) {
        debug("authenticateWithModernOpenAM: " + err);
    }    
    if (tokenId && tokenId.length !== 0) {
        createCookie(this.sessionCookieName(), tokenId, 3, this.domainName());
        debug("authenticateWithModernOpenAM: RESPONSE: " + response);
        // authentication.tokenid = tokenId;
    } else {
        debug("authenticateWithModernOpenAM: RESPONSE: " + response);
        if (JSON.parse(response).authId) {
            // there was an authId in the respone, there is more stuff coming
            return response;
        } else {
            deleteCookie(this.sessionCookieName());
            removeLocal("validSession");
        }
    }
    debug("authenticateWithModernOpenAM.TOKENID: " + tokenId);
    return tokenId;
};

/*
 *  Authenticates an identity using a one state authentication module.
 *  The version of the AM should support the /json/authenticate endpoint.
 *  The realm, module or service can be specified but only modules and services 
 *  with one state and  credentials passed in headers are supported at the moment
 * @param {Object} options - The configuration object to use
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     module: "DataStore",                                         // optional
 *     service: "ldapService",                                      // optional
 *     headers: myHeaders,
 *     realm: "/",                                                  // optional
 *     gotoURL: "https://app.example.com:8080/mypath",              // optional
 *     gotoOnFail: "https://app.example.com:8080/failed",           // optional
 *  }   
 * </pre>
 * @param {String} [options.module=OpenAM realm default] The Authentication module 
 *  to use in the left side of the login box.
 * @param {String} [options.service=OpenAM realm default] The Authentication service
 *  chain to use in the left side of the login box. Notice that service takes 
 *  precedence over module.
 * @param {String} [options.realm=The one configured in openam.js] Realm where the
 *   authentication will take place
 * @param {Object} options.headers - Object containing the credentials passed as headers
 * @param {String} [options.gotoURL=Current page] The URL to go to after a
 *  successful authentication.
 * @param {String} [options.gotoOnFail=Current page] The URL to go to after an
  * authentication event has failed.
 */
//openamConfig.prototype.authenticateSimple = function (options) {
//    var gotoURL = options.gotoURL || getMyURL();
//    var gotoOnFail = options.gotoOnFail || getMyURL();
//    var tokenId = this.authenticateWithModernOpenAM(options);
//    if (tokenId) {
//        window.location = gotoURL;
//    } else {
//        if (gotoOnFail) {
//           window.location = gotoOnFail; 
//        } else {
//            throw("Authentication failed");
//        }
//    }
//};

/**
 *  Authenticates an identity using a one state authentication module by using 
 *   the values submitted either in the form containing username and password or
 *   by using credentials submitted in the headers object.
 *  The version of the AM should support the /json/authenticate endpoint.
 *  The realm, module or service can be specified but only modules and services 
 *  with one state are supported.
 * @function authenticateSimple
 * @param {Object} options - The configuration object to use
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     module: "DataStore",                                         // optional
 *     service: "ldapService",                                      // optional
 *     username: 'usernameField',                                   // optional
 *     password: 'passwordField',                                   // optional
 *     headers: myHeaders,                                          // optional
 *     realm: "/",                                                  // optional
 *     gotoURL: "https://app.example.com:8080/mypath",              // optional
 *     gotoOnFail: "https://app.example.com:8080/failed",           // optional
 *  }   
 * </pre>
 * @param {String} [options.module=OpenAM realm default] The Authentication module 
 *  to use in the left side of the login box.
 * @param {String} [options.service=OpenAM realm default] The Authentication service
 *  chain to use in the left side of the login box. Notice that service takes 
 *  precedence over module.
 * @param {String} [options.username='username'] The id of the field that
 *  contains the username in the form. Either username and password or headers
 *   must be specified.
 * @param {String} [options.password='password'] The id of the field that
 *  contains the password in the form. Either username and password or headers
 *   must be specified.
  * @param {Object} options.headers - Object containing the credentials passed
  *  as headers
 * @param {String} [options.realm=The one configured in openam.js] Realm where the
 *   authentication will take place
 * @param {Object} [options.headers] - Object containing the credentials passed
 *  as headers. Either username and password or headers must be specified.
 * @param {String} [options.gotoURL=Current page] The URL to go to after a
 *  successful authentication.
 * @param {String} [options.gotoOnFail=Current page] The URL to go to after an
  * authentication event has failed.
 */
openamConfig.prototype.authenticateSimple = function (options) {
    var gotoURL = options.gotoURL || getMyURL();
    var gotoOnFail = options.gotoOnFail || getMyURL();
    try {
        var usernameField = options.username || "username";
        var passwordField = options.password || "password";
        var username = document.getElementById(usernameField).value;
        var password = document.getElementById(passwordField).value;
    } catch (err) {
        // Do nothing
    }
    if (username && username !== '' && password && password !== '') {
        options.headers = {
            "X-OpenAM-Username": username,
            "X-OpenAM-Password": password
        };
    }
    var tokenId = this.authenticateWithModernOpenAM(options);
    if (tokenId) {
        window.location = gotoURL;
    } else {
        if (gotoOnFail) {
            window.location = gotoOnFail;
        } else {
            throw("Authentication failed");
        }
    }
};

/*
 * Authenticates an identity using username/password.
 * The realm, module or service can be specified but only modules and services 
 * with username/password are supported at the moment. 
 * NOTE: This function is not implemented!
 * @param {Object} options - The configuration object to use
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     module: "DataStore",                                         // optional
 *     service: "ldapService",                                      // optional
 *     realm: "/",                                                  // optional
 *     headers: "http://ap.example.com:8880/exampleNRO02.html",     // optional
 *     data: objectData                                             // optional
 *  }   
 * </pre>
 * @param {String} [options.module=OpenAM realm default] The Authentication module 
 *  to use in the left side of the login box.
 * @param {String} [options.service=OpenAM realm default] The Authentication service
 *  chain to use in the left side of the login box. Notice that service takes 
 *  precedence over module.
 * @param {String} [options.realm=The one configured in openam.js] Realm where the
 *   authentication will take place
 * @param {Object} options.headers - Object containing the credentials passed as headers
 * @param {Object} [options.data={}] - The payload to be submitted to the authentication 
 *  module  
*/
openamConfig.prototype.authenticateWithLegacyOpenAM = function(options) {
    var tokenId = null;
    return tokenId;
    
    // TO DO: Complete this
};

/**
 * Obtains the values of the profile attributes specified as a comma separated list
 * @function getIdentityAttributes
 * @param {Object} options - The configuration object to get the attributes
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     attributes: "cn, givenName,sn,mail",          
 *     realm: "/",                          // optional
 *     prettyprint: true                    // optional
 *  }   
 * </pre>
 *  @param {String} options.attributes Comma separated list of attributes
 *  @param {String} [options.realm=The one configured in openam.js] Realm where
 *   the identity resides.
 * @param {Boolean} [options.prettyprint=false] - Return formatted with pretty print(true or false)
 * @returns {JSON} - Returns the value of the profile attributes requested from the OpenAM
 */
openamConfig.prototype.getIdentityAttributes = function (options) {
    
    if (options) {
        var pprint_ = options.prettyprint || false;
        var realm = options.realm || this.realm();
    } else {
        throw("getIdentityAttributes: ERROR: Missing configuration parameter");
    }
    
    var response = null;
    if (this.cacheEnabled) {
        var data = getLocal("attributes");
        if (data) return data;
    }   
    
    var tokenId = this.ssotoken();   
    if (this.isSessionValid(tokenId)) {
        if (!this.legacyEnabled) {
            debug("getIdentityAttributes: LEGACY NOT ENABLED");
            response = this.getAttributesFromModernOpenAM(tokenId, options.attributes, realm, pprint_);   
        } else {
            debug("getIdentityAttributes: LEGACY ENABLED");
            response = this.getAttributesFromLegacyOpenAM(tokenId, options.attributes, realm, pprint_);
        }
    }    
    if (response && this.cacheEnabled) {
        var jresponse = JSON.parse(response);
        if (jresponse.code) {
            throw("ERROR: " + response);
        } else {
            storeLocal("attributes", response);
        }
    }
    return response;
};


/*
 * Obtains the values of the profile attributes specified as a comma separated list for an OpenAM version 12 or later
 * @param {String} tokenId - The token id that represents the OpenAM session
 * @param {String} attributes - Comma separated list of attributes
 * @param {String} realm - The realm where the identity resides
 * @param {Boolean} pprint - Return formatted with pretty print(true or false)
 * @returns {JSON} - Returns the value of the profile attributes requested from the OpenAM
 */
openamConfig.prototype.getAttributesFromModernOpenAM = function (tokenId, attributes, realm, pprint) {
 
    var response = null;
    var attributes_url=this.attributesURL(realm);
    var response = null;
    var pprintStr = '';
    if (pprint) {
        pprintStr = "&_prettyPrint=true";
    }
    debug("getAttributesFromModernOpenAM: ATTRIBUTE URL: " + attributes_url);
    var url = attributes_url + this.Id + "?_fields=" + encodeURIComponent(attributes) + pprintStr;
    debug("getAttributesFromModernOpenAM: full url: " + url);
    ajax.get(url,
             function(responseText) { 
                        response = responseText;
                      }, 
                      'application/json', this.sessionCookieName(), tokenId);
    debug("getAttributesFromModernOpenAM. Attributes: " + response);
    return response;
};


/*
 * Obtains the values of the profile attributes specified as a comma separated list for an OpenAM version 11 or older
 * NOTE: This function is not yet implemented!
 * @param {String} tokenId - The token id that represents the OpenAM session
 * @param {String} attributes - Comma separated list of attributes
 * @param {String} realm - The realm where the identity resides
 * @param {Boolean} pprint - Return formatted with pretty print(true or false)
 * @returns {JSON} - Returns the value of the profile attributes requested from the OpenAM
 */
openamConfig.prototype.getAttributesFromLegacyOpenAM = function (tokenId, attributes, realm, pprint) {
   var response = null;
   // TO DO: Implement this
   return response;
};

/**
 * Log out the user from the OpenAM
 * @function logout
 * @param {Object} [options] - The object describing the options for the logout
 * <pre>
 *  The options object is a JSON object, here an example.  
 *  {
 *     gotoURL: "https://app.example.com:8080/mypath",              // optional
 *     gotoOnFail: "https://app.example.com:8080/failed",           // optional
 *  }   
 * </pre>
 *  @param {String} [options.gotoURL=Current page] The URL to go to after a
 *   successful authentication.
 *  @param {String} [options.gotoOnFail=Current page] The URL to go to after an
*     authentication event has failed.
 * @returns {undefined}
 */
openamConfig.prototype.logout = function (options) {

    if (options) {
        var gotoURL = options.gotoURL || getMyURL();
        var gotoOnFail = options.gotoOnFail || getMyURL();
    } else {
        var gotoURL = getMyURL();
        var gotoOnFail = getMyURL();
    }
    if (!this.legacyEnabled) {
        if (this.logoutWithModernOpenAM()) {
            window.location = gotoURL;
        } else {
            window.location = gotoOnFail;
        }

    } else {
        if (this.logoutWithLegacyOpenAM()) {
            window.location = gotoURL;
        } else {
            window.location = gotoOnFail;
        }
    }
};

/*
 * Logs out a user from a modern OpenAM
 * @returns {Boolean} - Returns True if the logout is successful
 */
openamConfig.prototype.logoutWithModernOpenAM = function () {
    var logoutSuccess = false;
    var tokenId = this.ssotoken();
    var logout_url = this.logoutURL();
    var response = undefined;
    debug("logoutWithModernOpenAM: AUTHN URL: " + logout_url);
    ajax.send(logout_url,
        function(responseText) { 
            response = responseText;
        }, "POST", "{}", "application/json", this.sessionCookieName(), tokenId);
    debug("logoutWithModernOpenAM: Response: " + response);
    if ( response ) {
        deleteCookie(this.sessionCookieName(), this.domainName());
        deleteCookie(this.aMAuthCookie, this.domainName());
        logoutSuccess = true;
    } else {
        deleteCookie(this.sessionCookieName(), this.domainName());
        deleteCookie(this.aMAuthCookie, this.domainName());
        logoutSuccess = false;
    }
    removeAllLocal();
    debug("logoutWithModernOpenAM: logout result: " + logoutSuccess);                      
    return logoutSuccess;
};

/*
 * Logs out a user from a legacy OpenAM
 * NOTE: This function is not implemented yet
 * @returns {Boolean} - Returns True if the logout is successful
 */
openamConfig.prototype.logoutWithLegacyOpenAM = function () {
    var logoutSuccess = false;
    // TO DO: Implement this
    return logoutSuccess;
};