Drupal.locale = { 'pluralFormula': function ($n) { return Number(($n!=1)); }, 'strings': {"":{"An AJAX HTTP error occurred.":"Une erreur HTTP AJAX s\u0027est produite.","HTTP Result Code: !status":"Code de statut HTTP : !status","An AJAX HTTP request terminated abnormally.":"Une requ\u00eate HTTP AJAX s\u0027est termin\u00e9e anormalement.","Debugging information follows.":"Informations de d\u00e9bogage ci-dessous.","Path: !uri":"Chemin : !uri","StatusText: !statusText":"StatusText: !statusText","ResponseText: !responseText":"ResponseText : !responseText","ReadyState: !readyState":"ReadyState : !readyState","Show shortcuts":"Afficher les raccourcis","Hide shortcuts":"Cacher les raccourcis","+@count":"+@count","-@count":"-@count","Re-order rows by numerical weight instead of dragging.":"R\u00e9-ordonner les lignes avec des poids num\u00e9riques plut\u00f4t qu\u0027en les d\u00e9placant.","Show row weights":"Afficher le poids des lignes","Hide row weights":"Cacher le poids des lignes","Drag to re-order":"Cliquer-d\u00e9poser pour r\u00e9-organiser","Changes made in this table will not be saved until the form is submitted.":"Les changements effectu\u00e9s dans ce tableau ne seront pris en compte que lorsque la configuration aura \u00e9t\u00e9 enregistr\u00e9e.","Hide":"Masquer","Show":"Afficher","(active tab)":"(onglet actif)","Edit":"Modifier","Not customizable":"Non personnalisable","Not restricted":"Non restreint","Not translatable":"Intraduisible","Please wait...":"Veuillez patienter...","Restricted to certain languages":"Restreint \u00e0 certaines langues","Restricted to certain pages":"R\u00e9serv\u00e9 \u00e0 certaines pages","The block cannot be placed in this region.":"Le bloc ne peut pas \u00eatre plac\u00e9 dans cette r\u00e9gion.","The changes to these blocks will not be saved until the \u003Cem\u003ESave blocks\u003C\/em\u003E button is clicked.":"N\u0027oubliez pas de cliquer sur \u003Cem\u003EEnregistrer les blocs\u003C\/em\u003E pour confirmer les modifications apport\u00e9es ici.","Translatable":"Traduisible"}} };;
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
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
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
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;

(function ($) {

  $(document).ready(function () {
    lastObj = false;
    strs = Drupal.settings.thmrStrings;
    $('body').addClass("thmr_call").attr("id", "thmr_" + Drupal.settings.page_id);

    var themerEnabled = 0;
    var themerToggle = function () {
      themerEnabled = 1 - themerEnabled;
      $('#themer-toggle :checkbox').attr('checked', themerEnabled ? 'checked' : '');
      $('#themer-popup').css('display', themerEnabled ? 'block' : 'none');
      if (themerEnabled) {
        document.onclick = themerEvent;
        if (lastObj != false) {
          $(lastObj).css('outline', '3px solid #999');
        }
        $('[data-thmr]').hover(
          function () {
            if (this.parentNode.nodeName != 'BODY' && $(this).attr('thmr_curr') != 1) {
              $(this).css('outline', 'red solid 1px');
            }
          },
          function () {
            if ($(this).attr('thmr_curr') != 1) {
              $(this).css('outline', 'none');
            }
          }
        );
      }
      else {
        document.onclick = null;
        if (lastObj != false) {
          $(lastObj).css('outline', 'none');
        }
        $('[data-thmr]').unbind('mouseenter mouseleave');
      }
    };
    $(Drupal.settings.thmr_popup)
      .appendTo($('body'));

    $('<div id="themer-toggle"><input type="checkbox" />'+ strs.themer_info +'</div>')
      .appendTo($('body'))
      .click(themerToggle);
    $('#themer-popup').resizable();
    $('#themer-popup')
       .draggable({
               opacity: .6,
               handle: $('#themer-popup .topper')
             })
      .prepend(strs.toggle_throbber)
    ;

    // close box
    $('#themer-popup .topper .close').click(function() {
      themerToggle();
    });
  });

  /**
   * Known issue: IE does NOT support outline css property.
   * Solution: use another browser
   */
  function themerHilight(obj) {
    // hilight the current object (and un-highlight the last)
    if (lastObj != false) {
      $(lastObj).css('outline', 'none').attr('thmr_curr', 0);
    }
    $(obj).css('outline', '#999 solid 3px').attr('thmr_curr', 1);
    lastObj = obj;
  }

  function themerDoIt(obj) {
    if (thmrInPop(obj)) {
      return true;
    }
    // start throbber
    //$('#themer-popup img.throbber').show();
    var objs = thmrFindParents(obj);
    if (objs.length) {
      themerHilight(objs[0]);
      thmrRebuildPopup(objs);
    }
    return false;
  }

  function thmrInPop(obj) {
    //is the element in either the popup box or the toggle div?
    if (obj.id == "themer-popup" || obj.id == "themer-toggle") return true;
    if (obj.parentNode) {
      while (obj = obj.parentNode) {
        if (obj.id=="themer-popup" || obj.id == "themer-toggle") return true;
      }
    }
    return false;
  }

  function themerEvent(e) {
    if (!e) {
      var e = window.event;
    };
    if (e.target) var tg = e.target;
    else if (e.srcElement) var tg = e.srcElement;
    return themerDoIt(tg);
  }

  /**
   * Find all parents with @data-thmr"
   */
  function thmrFindParents(obj) {
    var parents = new Array();
    if ($(obj).attr('data-thmr') != undefined) {
      parents[parents.length] = obj;
    }
    if (obj && obj.parentNode) {
      while ((obj = obj.parentNode) && (obj.nodeType != 9)) {
        if ($(obj).attr('data-thmr') != undefined) {
          parents[parents.length] = obj;
        }
      }
    }
    return parents;
  }

  /**
   * Check to see if object is a block element
   */
  function thmrIsBlock(obj) {
    if (obj.style.display == 'block') {
      return true;
    }
    else if (obj.style.display == 'inline' || obj.style.display == 'none') {
      return false;
    }
    if (obj.tagName != undefined) {
      var i = blocks.length;
      if (i > 0) {
        do {
          if (blocks[i] === obj.tagName) {
            return true;
          }
        } while (i--);
      }
    }
    return false;
  }

  function thmrRefreshCollapse() {
    $('#themer-popup .devel-obj-output dt').each(function() {
        $(this).toggle(function() {
              $(this).parent().children('dd').show();
            }, function() {
              $(this).parent().children('dd').hide();
            });
      });
  }

  /**
   * Rebuild the popup
   *
   * @param objs
   *   The array of the current object and its parents. Current object is first element of the array
   */
  function thmrRebuildPopup(objs) {
    // rebuild the popup box
    var id = objs[0].getAttribute('data-thmr').split(' ').reverse()[0];
    // vars is the settings array element for this theme item
    var vars = Drupal.settings[id];
    // strs is the translatable strings
    var strs = Drupal.settings.thmrStrings;
    var type = vars.type;
    var key = vars.used;

    // clear out the initial "click on any element" starter text
    $('#themer-popup div.starter').empty();

    $('#themer-popup dd.key').empty().prepend('<a href="'+ strs.api_site +'api/search/'+ strs.drupal_version +'/'+ vars.search +'" title="'+ strs.drupal_api_docs +'">'+ key + '</a>');
    $('#themer-popup dt.key-type').empty().prepend((type == 'function') ? strs.function_called : strs.template_called);

    // parents
    var parents = '';
    var parents = strs.parents +' <span class="parents">';
    var isFirst = true;
    for (i = 0; i < objs.length; i++) {
      thmr_ids = objs[i].getAttribute('data-thmr').split(' ').reverse();
      for (j = (i==0?1:0); j < thmr_ids.length; j++) {
        var thmrid = thmr_ids[j];
        var pvars = Drupal.settings[thmrid];
        parents += (isFirst) ? '' : '&lt; ';
        // populate the parents
        // each parent is wrapped with a span containing a 'trig' attribute with the id of the element it represents
        parents += '<span class="parent" trig="'+ objs[i].getAttribute('data-thmr') +'">'+ pvars.name +'</span> ';
        isFirst = false;
      }
    }
    parents += '</span>';
    // stick the parents spans in the #parents div
    $('#themer-popup #parents').empty().prepend(parents);
    $('#themer-popup span.parent')
      .click(function() {
        var thmr_id = $(this).attr('trig');
        var thmr_obj = $('[data-thmr = "' + thmr_id + '"]')[0];
        themerDoIt(thmr_obj);
      })
      .hover(
        function() {
          // make them highlight their element on mouseover
          $('#'+ $(this).attr('trig')).trigger('mouseover');
        },
        function() {
          // and unhilight on mouseout
          $('#'+ $(this).attr('trig')).trigger('mouseout');
        }
      );

    if (vars == undefined) {
      // if there's no item in the settings array for this element
      $('#themer-popup dd.candidates').empty();
      $('#themer-popup dd.preprocessors').empty();
      $('#themer-popup div.attributes').empty();
      $('#themer-popup div.used').empty();
      $('#themer-popup div.duration').empty();
    }
    else {
      $('#themer-popup div.duration').empty().prepend('<span class="dt">' + strs.duration + '</span>' + vars.duration + ' ms');
 
      if (vars.candidates.length > 0) {
        $('#themer-popup dd.candidates').show().empty().prepend(vars.candidates.join('<span class="delimiter"> < </span>'));
  
        if (type == 'function') {
          // populate the candidates
          $('#themer-popup dt.candidates-type').show().empty().prepend(strs.candidate_functions);
        }
        else {
          $('#themer-popup dt.candidates-type').show().empty().prepend(strs.candidate_files);
        }
      }
      else {
        $('#themer-popup dt.candidates-type, #themer-popup dd.candidates').hide();
      }

      if (vars.preprocessors.length > 0) {
        $('#themer-popup dd.preprocessors').show().empty().prepend(vars.preprocessors.join('<span class="delimiter"> + </span>'));
        $('#themer-popup dt.preprocessors-type').show().empty().prepend(strs.preprocessors);
      }
      else {
        $('#themer-popup dd.preprocessors, #themer-popup dt.preprocessors-type').hide();
      }

      if (vars.processors.length > 0) {
        $('#themer-popup dd.processors').show().empty().prepend(vars.processors.join('<span class="delimiter"> + </span>'));
        $('#themer-popup dt.processors-type').show().empty().prepend(strs.processors);
      }
      else {
        $('#themer-popup dd.processors, #themer-popup dt.processors-type').hide();
      }

      // Use drupal ajax to do what we need 
      vars_div_array = $('div.themer-variables');
      vars_div = vars_div_array[0];
      var uri = Drupal.settings.devel_themer_uri + '/' + vars['variables'];
      // Programatically using the drupal ajax things is tricky, so cheat.
      dummy_link = $('<a href="'+uri+'" class="use-ajax">Loading Vars</a>');
      $(vars_div).append(dummy_link);
      Drupal.attachBehaviors(vars_div);
      dummy_link.click();
      
      thmrRefreshCollapse();
    }
    // stop throbber
    //$('#themer-popup img.throbber').hide();
  }

})(jQuery);
;
