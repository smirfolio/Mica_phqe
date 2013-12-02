(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress-wrapper" aria-live="polite"></div>');
  this.element.html('<div id ="' + id + '" class="progress progress-striped progress-info active"><div class="bar"></div></div>' +
                    '<div class="percentage pull-right"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.bar', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="alert alert-block alert-error"><a class="close" data-dismiss="alert" href="#">&times;</a><h4>Error message</h4></div>').append(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
Drupal.locale = { 'pluralFormula': function ($n) { return Number(($n!=1)); }, 'strings': {"":{"An AJAX HTTP error occurred.":"Une erreur HTTP AJAX s\u0027est produite.","HTTP Result Code: !status":"Code de statut HTTP : !status","An AJAX HTTP request terminated abnormally.":"Une requ\u00eate HTTP AJAX s\u0027est termin\u00e9e anormalement.","Debugging information follows.":"Informations de d\u00e9bogage ci-dessous.","Path: !uri":"Chemin : !uri","StatusText: !statusText":"StatusText: !statusText","ResponseText: !responseText":"ResponseText : !responseText","ReadyState: !readyState":"ReadyState : !readyState","Show shortcuts":"Afficher les raccourcis","Hide shortcuts":"Cacher les raccourcis","+@count":"+@count","-@count":"-@count","Re-order rows by numerical weight instead of dragging.":"R\u00e9-ordonner les lignes avec des poids num\u00e9riques plut\u00f4t qu\u0027en les d\u00e9placant.","Show row weights":"Afficher le poids des lignes","Hide row weights":"Cacher le poids des lignes","Drag to re-order":"Cliquer-d\u00e9poser pour r\u00e9-organiser","Changes made in this table will not be saved until the form is submitted.":"Les changements effectu\u00e9s dans ce tableau ne seront pris en compte que lorsque la configuration aura \u00e9t\u00e9 enregistr\u00e9e.","Hide":"Masquer","Show":"Afficher","%filename is not an image.":"%filename n\u0027est pas une image.","(active tab)":"(onglet actif)","@number comments per page":"@number commentaires par page","Add":"Ajouter","Alias: @alias":"Alias : @alias","Apply (all displays)":"Appliquer (tous les affichages)","Apply (this display)":"Appliquer (cet affichage)","Apr":"avr","April":"Avril","Aug":"ao\u00fb","August":"Ao\u00fbt","Autocomplete popup":"Popup d\u0027auto-compl\u00e9tion","Automatic alias":"Alias automatique","By @name":"Par @name","By @name on @date":"Par @name le @date","Change view":"Changer la vue","Close":"Fermer","Configure":"Configurer","Content can only be inserted into CKEditor in the WYSIWYG mode.":"Le contenu peut seulement \u00eatre ins\u00e9r\u00e9 dans CKEditor en mode WYSIWYG.","Dec":"d\u00e9c","December":"D\u00e9cembre","Delete selected files?":"Voulez-vous vraiment supprimer les fichiers s\u00e9lectionn\u00e9s ?","Deselect all rows in this table":"D\u00e9s\u00e9lectionner toutes les lignes du tableau","Disabled":"D\u00e9sactiv\u00e9","Do you want to refresh the current directory?":"Souhaitez-vous rafra\u00eechir le r\u00e9pertoire courant ?","Don\u0027t display post information":"Ne pas afficher les informations de la contribution","Done":"Termin\u00e9","Edit":"Modifier","Edit summary":"Modifier le r\u00e9sum\u00e9","Enabled":"Activ\u00e9","Feb":"f\u00e9v","February":"F\u00e9vrier","File browsing is disabled in directory %dir.":"L\u0027exploration des fichiers est d\u00e9sactiv\u00e9e dans le r\u00e9pertoire %dir.","First click a text field to insert your tokens into.":"Cliquez d\u0027abord sur un champ de texte pour ins\u00e9rer vos jetons (\u003Cem\u003Etokens\u003C\/em\u003E) dans celui -ci.","Flag translations as outdated":"P\u00e9rimer toutes les traductions","Fr":"Ve","Fri":"ven","Friday":"Vendredi","Hide summary":"Masquer le r\u00e9sum\u00e9","Insert this token into your form":"Ins\u00e9rer ce jeton (\u003Cem\u003Etoken\u003C\/em\u003E) dans votre formulaire","Jan":"Jan","January":"Janvier","Jul":"jui","July":"Juillet","Jun":"juin","June":"Juin","Log messages":"Journaliser les messages","Mar":"mar","March":"mars","May":"mai","Mo":"Lu","Mon":"lun","Monday":"Lundi","New revision":"Nouvelle r\u00e9vision","Next":"Suiv.","No alias":"Aucun alias","No revision":"Aucune r\u00e9vision","None":"Aucun(e)","Not customizable":"Non personnalisable","Not in menu":"Pas dans le menu","Not published":"Non publi\u00e9","Not restricted":"Non restreint","Not translatable":"Intraduisible","Nov":"nov","November":"novembre","Oct":"oct","October":"octobre","Only files with the following extensions are allowed: %files-allowed.":"Seuls les fichiers se terminant par les extensions suivantes sont autoris\u00e9s\u00a0: %files-allowed.","Please select a file.":"Veuillez s\u00e9lectionner un fichier.","Please select a thumbnail.":"Veuillez s\u00e9lectionner une vignette.","Please specify dimensions within the allowed range that is from 1x1 to @dimensions.":"Veuillez sp\u00e9cifier des dimensions dans la plage autoris\u00e9e, soit de 1x1 \u00e0 @dimensions.","Please wait...":"Veuillez patienter...","Prev":"Pr\u00e9c.","Remove group":"Supprimer le groupe","Requires a title":"Titre obligatoire","Restricted to certain languages":"Restreint \u00e0 certaines langues","Restricted to certain pages":"R\u00e9serv\u00e9 \u00e0 certaines pages","Revert to default":"R\u00e9tablir par d\u00e9faut","Sa":"Sa","Sat":"sam","Saturday":"Samedi","Searching for matches...":"Recherche de correspondances...","Select all":"Tout s\u00e9lectionner","Select all rows in this table":"S\u00e9lectionner toutes les lignes du tableau","Sep":"sep","September":"septembre","Show fewer":"En afficher moins","Show more":"En afficher plus","Su":"Di","Sun":"dim","Sunday":"Dimanche","Th":"Je","The block cannot be placed in this region.":"Le bloc ne peut pas \u00eatre plac\u00e9 dans cette r\u00e9gion.","The changes to these blocks will not be saved until the \u003Cem\u003ESave blocks\u003C\/em\u003E button is clicked.":"N\u0027oubliez pas de cliquer sur \u003Cem\u003EEnregistrer les blocs\u003C\/em\u003E pour confirmer les modifications apport\u00e9es ici.","The selected file %filename cannot be uploaded. Only files with the following extensions are allowed: %extensions.":"Le fichier s\u00e9lectionn\u00e9 %filename ne peut pas \u00eatre transf\u00e9r\u00e9. Seulement les fichiers avec les extensions suivantes sont permis : %extensions.","This permission is inherited from the authenticated user role.":"Ce droit est h\u00e9rit\u00e9e du r\u00f4le de l\u0027utilisateur authentifi\u00e9.","Thu":"jeu","Thursday":"Jeudi","Today":"Aujourd\u0027hui","Translatable":"Traduisible","Tu":"Ma","Tue":"mar","Tuesday":"Mardi","Upload":"Transf\u00e9rer","We":"Me","Wed":"mer","Wednesday":"Mercredi","You are not allowed to operate on more than %num files.":"Vous n\u0027\u00eates pas autoris\u00e9(e) \u00e0 effectuer des op\u00e9rations sur plus de %num fichiers.","You can not perform this operation.":"Vous ne pouvez pas r\u00e9aliser cette op\u00e9ration.","You must select at least %num files.":"Vous devez s\u00e9lectionner au moins %num fichier(s).","mm\/dd\/yy":"mm\/jj\/aa","view":"voir","Available tokens":"Jetons (tokens) disponibles","On by default with opt out":"Activ\u00e9 par d\u00e9faut avec le refus du suivi","Off by default with opt in":"D\u00e9sactiv\u00e9 par d\u00e9faut avec l\u0027acceptation du suivi","Not tracked":"Non suivi","One domain with multiple subdomains":"Un domaine avec plusieurs sous-domaines","Multiple top-level domains":"Plusieurs domaines de premier niveau","All pages with exceptions":"Toutes les pages avec exceptions","Excepted: @roles":"Except\u00e9 : @roles","A single domain":"Un seul domaine","Universal web tracking opt-out":"Refus global du suivi sur le web","No privacy":"Pas de confidentialit\u00e9","@items enabled":"@items activ\u00e9(s)"}} };;

(function ($) {
  Drupal.Panels = Drupal.Panels || {};

  Drupal.Panels.autoAttach = function() {
    if ($.browser.msie) {
      // If IE, attach a hover event so we can see our admin links.
      $("div.panel-pane").hover(
        function() {
          $('div.panel-hide', this).addClass("panel-hide-hover"); return true;
        },
        function() {
          $('div.panel-hide', this).removeClass("panel-hide-hover"); return true;
        }
      );
      $("div.admin-links").hover(
        function() {
          $(this).addClass("admin-links-hover"); return true;
        },
        function(){
          $(this).removeClass("admin-links-hover"); return true;
        }
      );
    }
  };

  $(Drupal.Panels.autoAttach);
})(jQuery);
;
// Using the closure to map jQuery to $.
(function ($) {

  Drupal.behaviors.mica_bootstrap_config_login = {
    attach: function (context, settings) {
      if ($('form#user-login').length > 0 && $('form#user-login .input-prepend').length == 0) {
        $('form#user-login input').wrap('<div class="input-prepend" />');
        $('form#user-login .form-item-name input').before('<span class="add-on"><i class="icon-user"></i></span>');
        $('form#user-login .form-item-pass input').before('<span class="add-on"><i class="icon-lock"></i></span>');
      }

      if ($('form#user-register-form').length > 0 && $('form#user-register-form .input-prepend').length == 0) {
        $('form#user-register-form input').wrap('<div class="input-prepend" />');
        $('form#user-register-form .form-item-name input').before('<span class="add-on"><i class="icon-user"></i></span>');
        $('form#user-register-form .form-item-mail input').before('<span class="add-on"><i class="icon-envelope"></i></span>');
      }
    }
  };

}(jQuery));;
(function ($) {

$(document).ready(function() {

  // Expression to check for absolute internal links.
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");

  // Attach onclick event to document only and catch clicks on all elements.
  $(document.body).click(function(event) {
    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      var ga = Drupal.settings.googleanalytics;
      // Expression to check for special links like gotwo.module /go/* links.
      var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
      // Expression to check for download links.
      var isDownload = new RegExp("\\.(" + ga.trackDownloadExtensions + ")$", "i");

      // Is the clicked URL internal?
      if (isInternal.test(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox')) {
          // Do nothing here. The custom event will handle all tracking.
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (ga.trackDownload && isDownload.test(this.href)) {
          // Download link clicked.
          var extension = isDownload.exec(this.href);
          _gaq.push(["_trackEvent", "Downloads", extension[1].toUpperCase(), this.href.replace(isInternal, '')]);
        }
        else if (isInternalSpecial.test(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          _gaq.push(["_trackPageview", this.href.replace(isInternal, '')]);
        }
      }
      else {
        if (ga.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          _gaq.push(["_trackEvent", "Mails", "Click", this.href.substring(7)]);
        }
        else if (ga.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (ga.trackDomainMode == 2 && isCrossDomain(this.hostname, ga.trackCrossDomains)) {
            // Top-level cross domain clicked. document.location is handled by _link internally.
            event.preventDefault();
            _gaq.push(["_link", this.href]);
          }
          else {
            // External link clicked.
            _gaq.push(["_trackEvent", "Outbound links", "Click", this.href]);
          }
        }
      }
    });
  });

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  $(document).bind("cbox_complete", function() {
    var href = $.colorbox.element().attr("href");
    if (href) {
      _gaq.push(["_trackPageview", href.replace(isInternal, '')]);
    }
  });

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
function isCrossDomain(hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
}

})(jQuery);
;
