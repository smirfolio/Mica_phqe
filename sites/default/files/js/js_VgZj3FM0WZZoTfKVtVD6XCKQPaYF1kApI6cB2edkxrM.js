/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget 1.14pre
 * Copyright (c) 2012 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery 1.4.2+
 *   - jQuery UI 1.8 widget factory
 *
 * Optional:
 *   - jQuery UI effects
 *   - jQuery UI position utility
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
(function($, undefined) {

  var multiselectID = 0;
  var $doc = $(document);

  $.widget("ech.multiselect", {

    // default options
    options: {
      header: true,
      height: 175,
      minWidth: 225,
      classes: '',
      checkAllText: 'Check all',
      uncheckAllText: 'Uncheck all',
      noneSelectedText: 'Select options',
      selectedText: '# selected',
      selectedList: 0,
      show: null,
      hide: null,
      autoOpen: false,
      multiple: true,
      position: {},
      appendTo: "body"
    },

    _create: function() {
      var el = this.element.hide();
      var o = this.options;

      this.speed = $.fx.speeds._default; // default speed for effects
      this._isOpen = false; // assume no

      // create a unique namespace for events that the widget
      // factory cannot unbind automatically. Use eventNamespace if on
      // jQuery UI 1.9+, and otherwise fallback to a custom string.
      this._namespaceID = this.eventNamespace || ('multiselect' + multiselectID);

      var button = (this.button = $('<button type="button"><span class="ui-icon ui-icon-triangle-1-s"></span></button>'))
        .addClass('ui-multiselect ui-widget ui-state-default ui-corner-all')
        .addClass(o.classes)
        .attr({ 'title':el.attr('title'), 'aria-haspopup':true, 'tabIndex':el.attr('tabIndex') })
        .insertAfter(el),

        buttonlabel = (this.buttonlabel = $('<span />'))
          .html(o.noneSelectedText)
          .appendTo(button),

        menu = (this.menu = $('<div />'))
          .addClass('ui-multiselect-menu ui-widget ui-widget-content ui-corner-all')
          .addClass(o.classes)
          .appendTo($(o.appendTo)),

        header = (this.header = $('<div />'))
          .addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
          .appendTo(menu),

        headerLinkContainer = (this.headerLinkContainer = $('<ul />'))
          .addClass('ui-helper-reset')
          .html(function() {
            if(o.header === true) {
              return '<li><a class="ui-multiselect-all" href="#"><span class="ui-icon ui-icon-check"></span><span>' + o.checkAllText + '</span></a></li><li><a class="ui-multiselect-none" href="#"><span class="ui-icon ui-icon-closethick"></span><span>' + o.uncheckAllText + '</span></a></li>';
            } else if(typeof o.header === "string") {
              return '<li>' + o.header + '</li>';
            } else {
              return '';
            }
          })
          .append('<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>')
          .appendTo(header),

        checkboxContainer = (this.checkboxContainer = $('<ul />'))
          .addClass('ui-multiselect-checkboxes ui-helper-reset')
          .appendTo(menu);

        // perform event bindings
        this._bindEvents();

        // build menu
        this.refresh(true);

        // some addl. logic for single selects
        if(!o.multiple) {
          menu.addClass('ui-multiselect-single');
        }

        // bump unique ID
        multiselectID++;
    },

    _init: function() {
      if(this.options.header === false) {
        this.header.hide();
      }
      if(!this.options.multiple) {
        this.headerLinkContainer.find('.ui-multiselect-all, .ui-multiselect-none').hide();
      }
      if(this.options.autoOpen) {
        this.open();
      }
      if(this.element.is(':disabled')) {
        this.disable();
      }
    },

    refresh: function(init) {
      var el = this.element;
      var o = this.options;
      var menu = this.menu;
      var checkboxContainer = this.checkboxContainer;
      var optgroups = [];
      var html = "";
      var id = el.attr('id') || multiselectID++; // unique ID for the label & option tags

      // build items
      el.find('option').each(function(i) {
        var $this = $(this);
        var parent = this.parentNode;
        var description = this.innerHTML;
        var title = this.title;
        var value = this.value;
        var inputID = 'ui-multiselect-' + (this.id || id + '-option-' + i);
        var isDisabled = this.disabled;
        var isSelected = this.selected;
        var labelClasses = [ 'ui-corner-all' ];
        var liClasses = (isDisabled ? 'ui-multiselect-disabled ' : ' ') + this.className;
        var optLabel;

        // is this an optgroup?
        if(parent.tagName === 'OPTGROUP') {
          optLabel = parent.getAttribute('label');

          // has this optgroup been added already?
          if($.inArray(optLabel, optgroups) === -1) {
            html += '<li class="ui-multiselect-optgroup-label ' + parent.className + '"><a href="#">' + optLabel + '</a></li>';
            optgroups.push(optLabel);
          }
        }

        if(isDisabled) {
          labelClasses.push('ui-state-disabled');
        }

        // browsers automatically select the first option
        // by default with single selects
        if(isSelected && !o.multiple) {
          labelClasses.push('ui-state-active');
        }

        html += '<li class="' + liClasses + '">';

        // create the label
        html += '<label for="' + inputID + '" title="' + title + '" class="' + labelClasses.join(' ') + '">';
        html += '<input id="' + inputID + '" name="multiselect_' + id + '" type="' + (o.multiple ? "checkbox" : "radio") + '" value="' + value + '" title="' + title + '"';

        // pre-selected?
        if(isSelected) {
          html += ' checked="checked"';
          html += ' aria-selected="true"';
        }

        // disabled?
        if(isDisabled) {
          html += ' disabled="disabled"';
          html += ' aria-disabled="true"';
        }

        // add the title and close everything off
        html += ' /><span>' + description + '</span></label></li>';
      });

      // insert into the DOM
      checkboxContainer.html(html);

      // cache some moar useful elements
      this.labels = menu.find('label');
      this.inputs = this.labels.children('input');

      // set widths
      this._setButtonWidth();
      this._setMenuWidth();

      // remember default value
      this.button[0].defaultValue = this.update();

      // broadcast refresh event; useful for widgets
      if(!init) {
        this._trigger('refresh');
      }
    },

    // updates the button text. call refresh() to rebuild
    update: function() {
      var o = this.options;
      var $inputs = this.inputs;
      var $checked = $inputs.filter(':checked');
      var numChecked = $checked.length;
      var value;

      if(numChecked === 0) {
        value = o.noneSelectedText;
      } else {
        if($.isFunction(o.selectedText)) {
          value = o.selectedText.call(this, numChecked, $inputs.length, $checked.get());
        } else if(/\d/.test(o.selectedList) && o.selectedList > 0 && numChecked <= o.selectedList) {
          value = $checked.map(function() { return $(this).next().html(); }).get().join(', ');
        } else {
          value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
        }
      }

      this._setButtonValue(value);

      return value;
    },

    // this exists as a separate method so that the developer 
    // can easily override it.
    _setButtonValue: function(value) {
      this.buttonlabel.text(value);
    },

    // binds events
    _bindEvents: function() {
      var self = this;
      var button = this.button;

      function clickHandler() {
        self[ self._isOpen ? 'close' : 'open' ]();
        return false;
      }

      // webkit doesn't like it when you click on the span :(
      button
        .find('span')
        .bind('click.multiselect', clickHandler);

      // button events
      button.bind({
        click: clickHandler,
        keypress: function(e) {
          switch(e.which) {
            case 27: // esc
              case 38: // up
              case 37: // left
              self.close();
            break;
            case 39: // right
              case 40: // down
              self.open();
            break;
          }
        },
        mouseenter: function() {
          if(!button.hasClass('ui-state-disabled')) {
            $(this).addClass('ui-state-hover');
          }
        },
        mouseleave: function() {
          $(this).removeClass('ui-state-hover');
        },
        focus: function() {
          if(!button.hasClass('ui-state-disabled')) {
            $(this).addClass('ui-state-focus');
          }
        },
        blur: function() {
          $(this).removeClass('ui-state-focus');
        }
      });

      // header links
      this.header.delegate('a', 'click.multiselect', function(e) {
        // close link
        if($(this).hasClass('ui-multiselect-close')) {
          self.close();

          // check all / uncheck all
        } else {
          self[$(this).hasClass('ui-multiselect-all') ? 'checkAll' : 'uncheckAll']();
        }

        e.preventDefault();
      });

      // optgroup label toggle support
      this.menu.delegate('li.ui-multiselect-optgroup-label a', 'click.multiselect', function(e) {
        e.preventDefault();

        var $this = $(this);
        var $inputs = $this.parent().nextUntil('li.ui-multiselect-optgroup-label').find('input:visible:not(:disabled)');
        var nodes = $inputs.get();
        var label = $this.parent().text();

        // trigger event and bail if the return is false
        if(self._trigger('beforeoptgrouptoggle', e, { inputs:nodes, label:label }) === false) {
          return;
        }

        // toggle inputs
        self._toggleChecked(
          $inputs.filter(':checked').length !== $inputs.length,
          $inputs
        );

        self._trigger('optgrouptoggle', e, {
          inputs: nodes,
          label: label,
          checked: nodes[0].checked
        });
      })
      .delegate('label', 'mouseenter.multiselect', function() {
        if(!$(this).hasClass('ui-state-disabled')) {
          self.labels.removeClass('ui-state-hover');
          $(this).addClass('ui-state-hover').find('input').focus();
        }
      })
      .delegate('label', 'keydown.multiselect', function(e) {
        e.preventDefault();

        switch(e.which) {
          case 9: // tab
            case 27: // esc
            self.close();
          break;
          case 38: // up
            case 40: // down
            case 37: // left
            case 39: // right
            self._traverse(e.which, this);
          break;
          case 13: // enter
            $(this).find('input')[0].click();
          break;
        }
      })
      .delegate('input[type="checkbox"], input[type="radio"]', 'click.multiselect', function(e) {
        var $this = $(this);
        var val = this.value;
        var checked = this.checked;
        var tags = self.element.find('option');

        // bail if this input is disabled or the event is cancelled
        if(this.disabled || self._trigger('click', e, { value: val, text: this.title, checked: checked }) === false) {
          e.preventDefault();
          return;
        }

        // make sure the input has focus. otherwise, the esc key
        // won't close the menu after clicking an item.
        $this.focus();

        // toggle aria state
        $this.attr('aria-selected', checked);

        // change state on the original option tags
        tags.each(function() {
          if(this.value === val) {
            this.selected = checked;
          } else if(!self.options.multiple) {
            this.selected = false;
          }
        });

        // some additional single select-specific logic
        if(!self.options.multiple) {
          self.labels.removeClass('ui-state-active');
          $this.closest('label').toggleClass('ui-state-active', checked);

          // close menu
          self.close();
        }

        // fire change on the select box
        self.element.trigger("change");

        // setTimeout is to fix multiselect issue #14 and #47. caused by jQuery issue #3827
        // http://bugs.jquery.com/ticket/3827
        setTimeout($.proxy(self.update, self), 10);
      });

      // close each widget when clicking on any other element/anywhere else on the page
      $doc.bind('mousedown.' + this._namespaceID, function(event) {
        var target = event.target;

        if(self._isOpen
            && target !== self.button[0]
            && target !== self.menu[0]
            && !$.contains(self.menu[0], target)
            && !$.contains(self.button[0], target)
          ) {
          self.close();
        }
      });

      // deal with form resets.  the problem here is that buttons aren't
      // restored to their defaultValue prop on form reset, and the reset
      // handler fires before the form is actually reset.  delaying it a bit
      // gives the form inputs time to clear.
      $(this.element[0].form).bind('reset.multiselect', function() {
        setTimeout($.proxy(self.refresh, self), 10);
      });
    },

    // set button width
    _setButtonWidth: function() {
      var width = this.element.outerWidth();
      var o = this.options;

      if(/\d/.test(o.minWidth) && width < o.minWidth) {
        width = o.minWidth;
      }

      // set widths
      this.button.outerWidth(width);
    },

    // set menu width
    _setMenuWidth: function() {
      var m = this.menu;
      m.outerWidth(this.button.outerWidth());
    },

    // move up or down within the menu
    _traverse: function(which, start) {
      var $start = $(start);
      var moveToLast = which === 38 || which === 37;

      // select the first li that isn't an optgroup label / disabled
      var $next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)').first();

      // if at the first/last element
      if(!$next.length) {
        var $container = this.menu.find('ul').last();

        // move to the first/last
        this.menu.find('label')[ moveToLast ? 'last' : 'first' ]().trigger('mouseover');

        // set scroll position
        $container.scrollTop(moveToLast ? $container.height() : 0);

      } else {
        $next.find('label').trigger('mouseover');
      }
    },

    // This is an internal function to toggle the checked property and
    // other related attributes of a checkbox.
    //
    // The context of this function should be a checkbox; do not proxy it.
    _toggleState: function(prop, flag) {
      return function() {
        if(!this.disabled) {
          this[ prop ] = flag;
        }

        if(flag) {
          this.setAttribute('aria-selected', true);
        } else {
          this.removeAttribute('aria-selected');
        }
      };
    },

    _toggleChecked: function(flag, group) {
      var $inputs = (group && group.length) ?  group : this.inputs;
      var self = this;

      // toggle state on inputs
      $inputs.each(this._toggleState('checked', flag));

      // give the first input focus
      $inputs.eq(0).focus();

      // update button text
      this.update();

      // gather an array of the values that actually changed
      var values = $inputs.map(function() {
        return this.value;
      }).get();

      // toggle state on original option tags
      this.element
        .find('option')
        .each(function() {
          if(!this.disabled && $.inArray(this.value, values) > -1) {
            self._toggleState('selected', flag).call(this);
          }
        });

      // trigger the change event on the select
      if($inputs.length) {
        this.element.trigger("change");
      }
    },

    _toggleDisabled: function(flag) {
      this.button.attr({ 'disabled':flag, 'aria-disabled':flag })[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');

      var inputs = this.menu.find('input');
      var key = "ech-multiselect-disabled";

      if(flag) {
        // remember which elements this widget disabled (not pre-disabled)
        // elements, so that they can be restored if the widget is re-enabled.
        inputs = inputs.filter(':enabled').data(key, true)
      } else {
        inputs = inputs.filter(function() {
          return $.data(this, key) === true;
        }).removeData(key);
      }

      inputs
        .attr({ 'disabled':flag, 'arial-disabled':flag })
        .parent()[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');

      this.element.attr({
        'disabled':flag,
        'aria-disabled':flag
      });
    },

    // open the menu
    open: function(e) {
      var self = this;
      var button = this.button;
      var menu = this.menu;
      var speed = this.speed;
      var o = this.options;
      var args = [];

      // bail if the multiselectopen event returns false, this widget is disabled, or is already open
      if(this._trigger('beforeopen') === false || button.hasClass('ui-state-disabled') || this._isOpen) {
        return;
      }

      var $container = menu.find('ul').last();
      var effect = o.show;

      // figure out opening effects/speeds
      if($.isArray(o.show)) {
        effect = o.show[0];
        speed = o.show[1] || self.speed;
      }

      // if there's an effect, assume jQuery UI is in use
      // build the arguments to pass to show()
      if(effect) {
        args = [ effect, speed ];
      }

      // set the scroll of the checkbox container
      $container.scrollTop(0).height(o.height);

      // positon
      this.position();

      // show the menu, maybe with a speed/effect combo
      $.fn.show.apply(menu, args);

      // select the first not disabled option
      // triggering both mouseover and mouseover because 1.4.2+ has a bug where triggering mouseover
      // will actually trigger mouseenter.  the mouseenter trigger is there for when it's eventually fixed
      this.labels.filter(':not(.ui-state-disabled)').eq(0).trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');

      button.addClass('ui-state-active');
      this._isOpen = true;
      this._trigger('open');
    },

    // close the menu
    close: function() {
      if(this._trigger('beforeclose') === false) {
        return;
      }

      var o = this.options;
      var effect = o.hide;
      var speed = this.speed;
      var args = [];

      // figure out opening effects/speeds
      if($.isArray(o.hide)) {
        effect = o.hide[0];
        speed = o.hide[1] || this.speed;
      }

      if(effect) {
        args = [ effect, speed ];
      }

      $.fn.hide.apply(this.menu, args);
      this.button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
      this._isOpen = false;
      this._trigger('close');
    },

    enable: function() {
      this._toggleDisabled(false);
    },

    disable: function() {
      this._toggleDisabled(true);
    },

    checkAll: function(e) {
      this._toggleChecked(true);
      this._trigger('checkAll');
    },

    uncheckAll: function() {
      this._toggleChecked(false);
      this._trigger('uncheckAll');
    },

    getChecked: function() {
      return this.menu.find('input').filter(':checked');
    },

    destroy: function() {
      // remove classes + data
      $.Widget.prototype.destroy.call(this);

      // unbind events
      $doc.unbind(this._namespaceID);

      this.button.remove();
      this.menu.remove();
      this.element.show();

      return this;
    },

    isOpen: function() {
      return this._isOpen;
    },

    widget: function() {
      return this.menu;
    },

    getButton: function() {
      return this.button;
    },

    position: function() {
      var o = this.options;

      // use the position utility if it exists and options are specifified
      if($.ui.position && !$.isEmptyObject(o.position)) {
        o.position.of = o.position.of || this.button;

        this.menu
          .show()
          .position(o.position)
          .hide();

        // otherwise fallback to custom positioning
      } else {
        var pos = this.button.offset();

        this.menu.css({
          top: pos.top + this.button.outerHeight(),
          left: pos.left
        });
      }
    },

    // react to option changes after initialization
    _setOption: function(key, value) {
      var menu = this.menu;

      switch(key) {
        case 'header':
          menu.find('div.ui-multiselect-header')[value ? 'show' : 'hide']();
          break;
        case 'checkAllText':
          menu.find('a.ui-multiselect-all span').eq(-1).text(value);
          break;
        case 'uncheckAllText':
          menu.find('a.ui-multiselect-none span').eq(-1).text(value);
          break;
        case 'height':
          menu.find('ul').last().height(parseInt(value, 10));
          break;
        case 'minWidth':
          this.options[key] = parseInt(value, 10);
          this._setButtonWidth();
          this._setMenuWidth();
          break;
        case 'selectedText':
        case 'selectedList':
        case 'noneSelectedText':
          this.options[key] = value; // these all needs to update immediately for the update() call
          this.update();
          break;
        case 'classes':
          menu.add(this.button).removeClass(this.options.classes).addClass(value);
          break;
        case 'multiple':
          menu.toggleClass('ui-multiselect-single', !value);
          this.options.multiple = value;
          this.element[0].multiple = value;
          this.refresh();
          break;
        case 'position':
          this.position();
      }

      $.Widget.prototype._setOption.apply(this, arguments);
    }
  });

})(jQuery);
;
/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget Filtering Plugin 1.5pre
 * Copyright (c) 2012 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery UI MultiSelect widget
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
(function($) {
  var rEscape = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;

  $.widget('ech.multiselectfilter', {

    options: {
      label: 'Filter:',
      width: null, /* override default width set in css file (px). null will inherit */
      placeholder: 'Enter keywords',
      autoReset: false
    },

    _create: function() {
      var opts = this.options;
      var elem = $(this.element);

      // get the multiselect instance
      var instance = (this.instance = (elem.data('echMultiselect') || elem.data("multiselect") || elem.data("ech-multiselect")));

      // store header; add filter class so the close/check all/uncheck all links can be positioned correctly
      var header = (this.header = instance.menu.find('.ui-multiselect-header').addClass('ui-multiselect-hasfilter'));

      // wrapper elem
      var wrapper = (this.wrapper = $('<div class="ui-multiselect-filter">' + (opts.label.length ? opts.label : '') + '<input placeholder="'+opts.placeholder+'" type="search"' + (/\d/.test(opts.width) ? 'style="width:'+opts.width+'px"' : '') + ' /></div>').prependTo(this.header));

      // reference to the actual inputs
      this.inputs = instance.menu.find('input[type="checkbox"], input[type="radio"]');

      // build the input box
      this.input = wrapper.find('input').bind({
        keydown: function(e) {
          // prevent the enter key from submitting the form / closing the widget
          if(e.which === 13) {
            e.preventDefault();
          }
        },
        keyup: $.proxy(this._handler, this),
        click: $.proxy(this._handler, this)
      });

      // cache input values for searching
      this.updateCache();

      // rewrite internal _toggleChecked fn so that when checkAll/uncheckAll is fired,
      // only the currently filtered elements are checked
      instance._toggleChecked = function(flag, group) {
        var $inputs = (group && group.length) ?  group : this.labels.find('input');
        var _self = this;

        // do not include hidden elems if the menu isn't open.
        var selector = instance._isOpen ?  ':disabled, :hidden' : ':disabled';

        $inputs = $inputs
          .not(selector)
          .each(this._toggleState('checked', flag));

        // update text
        this.update();

        // gather an array of the values that actually changed
        var values = $inputs.map(function() {
          return this.value;
        }).get();

        // select option tags
        this.element.find('option').filter(function() {
          if(!this.disabled && $.inArray(this.value, values) > -1) {
            _self._toggleState('selected', flag).call(this);
          }
        });

        // trigger the change event on the select
        if($inputs.length) {
          this.element.trigger('change');
        }
      };

      // rebuild cache when multiselect is updated
      var doc = $(document).bind('multiselectrefresh', $.proxy(function() {
        this.updateCache();
        this._handler();
      }, this));

      // automatically reset the widget on close?
      if(this.options.autoReset) {
        doc.bind('multiselectclose', $.proxy(this._reset, this));
      }
    },

    // thx for the logic here ben alman
    _handler: function(e) {
      var term = $.trim(this.input[0].value.toLowerCase()),

      // speed up lookups
      rows = this.rows, inputs = this.inputs, cache = this.cache;

      if(!term) {
        rows.show();
      } else {
        rows.hide();

        var regex = new RegExp(term.replace(rEscape, "\\$&"), 'gi');

        this._trigger("filter", e, $.map(cache, function(v, i) {
          if(v.search(regex) !== -1) {
            rows.eq(i).show();
            return inputs.get(i);
          }

          return null;
        }));
      }

      // show/hide optgroups
      this.instance.menu.find(".ui-multiselect-optgroup-label").each(function() {
        var $this = $(this);
        var isVisible = $this.nextUntil('.ui-multiselect-optgroup-label').filter(function() {
          return $.css(this, "display") !== 'none';
        }).length;

        $this[isVisible ? 'show' : 'hide']();
      });
    },

    _reset: function() {
      this.input.val('').trigger('keyup');
    },

    updateCache: function() {
      // each list item
      this.rows = this.instance.menu.find(".ui-multiselect-checkboxes li:not(.ui-multiselect-optgroup-label)");

      // cache
      this.cache = this.element.children().map(function() {
        var elem = $(this);

        // account for optgroups
        if(this.tagName.toLowerCase() === "optgroup") {
          elem = elem.children();
        }

        return elem.map(function() {
          return this.innerHTML.toLowerCase();
        }).get();
      }).get();
    },

    widget: function() {
      return this.wrapper;
    },

    destroy: function() {
      $.Widget.prototype.destroy.call(this);
      this.input.val('').trigger("keyup");
      this.wrapper.remove();
    }
  });

})(jQuery);
;
(function($) {
  /**
   * Initialization
   */
  Drupal.behaviors.jquery_ui_multiselect_widget = {
    /**
     * Run Drupal module JS initialization.
     * 
     * @param context
     * @param settings
     */
    attach: function(context, settings) {
      var multiselects = new Array();
      // Global context!
      var filter = "select";
      if (settings.jquery_ui_multiselect_widget.multiple) {
        // Multiple only
        filter = filter + '[multiple=multiple]';
      }
      var elements = $(context).find(filter);
      if (jQuery.trim(settings.jquery_ui_multiselect_widget.subselector) != '') {
        // Subselector
        elements = elements.find(settings.jquery_ui_multiselect_widget.subselector);
      }
      // Convert int 1 to boolean so that the header works correctly.
      if (settings.jquery_ui_multiselect_widget.header === 1) {
        settings.jquery_ui_multiselect_widget.header = true;
      }
      elements.each(function() {
        var isMultiselect = $(this).is('[multiple]');
        var multiselect = $(this).multiselect({
          // Get default options from drupal to make them easier accessible.
          selectedList: settings.jquery_ui_multiselect_widget.selectedlist,
          selectedText: function(numChecked, numTotal, checkedItems) {
            // Override text to make it translateable.
            return Drupal.t('@numChecked of @numTotal checked', {'@numChecked': numChecked, '@numTotal': numTotal});
          },
          multiple: isMultiselect,
          autoOpen: settings.jquery_ui_multiselect_widget.autoOpen,
          header: settings.jquery_ui_multiselect_widget.header,
          height: settings.jquery_ui_multiselect_widget.height,
          classes: settings.jquery_ui_multiselect_widget.classes,
          checkAllText: Drupal.t('Check all'),
          uncheckAllText: Drupal.t('Uncheck all'),
          noneSelectedText: Drupal.t('Select option(s)'),
          selectedText: Drupal.t('# selected'),
        });
        if (settings.jquery_ui_multiselect_widget.filter) {
          // Allow filters
          multiselect.multiselectfilter({
            label: Drupal.t('Filter'),
            placeholder: Drupal.t('Enter keywords'),
            width: settings.jquery_ui_multiselect_widget.filter_width,
            autoReset: settings.jquery_ui_multiselect_widget.filter_auto_reset,
          });
        }
        multiselects.push(multiselect);
      });

      // Attach object globally to make access easy for custom usage.
      Drupal.behaviors.jquery_ui_multiselect_widget.multiselect = {multiselects: multiselects};
    }
  };
})(jQuery);;

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
(function(){function t(t){return t.target}function n(t){return t.source}function e(t,n){try{for(var e in n)Object.defineProperty(t.prototype,e,{value:n[e],enumerable:!1})}catch(r){t.prototype=n}}function r(t){for(var n=-1,e=t.length,r=[];e>++n;)r.push(t[n]);return r}function u(t){return Array.prototype.slice.call(t)}function i(){}function a(t){return t}function o(){return!0}function c(t){return"function"==typeof t?t:function(){return t}}function l(t,n,e){return function(){var r=e.apply(n,arguments);return arguments.length?t:r}}function s(t){return null!=t&&!isNaN(t)}function f(t){return t.length}function h(t){return t.trim().replace(/\s+/g," ")}function d(t){for(var n=1;t*n%1;)n*=10;return n}function g(t){return 1===t.length?function(n,e){t(null==n?e:null)}:t}function p(t){return t.responseText}function m(t){return JSON.parse(t.responseText)}function v(t){var n=document.createRange();return n.selectNode(document.body),n.createContextualFragment(t.responseText)}function y(t){return t.responseXML}function M(){}function b(t){function n(){for(var n,r=e,u=-1,i=r.length;i>++u;)(n=r[u].on)&&n.apply(this,arguments);return t}var e=[],r=new i;return n.on=function(n,u){var i,a=r.get(n);return 2>arguments.length?a&&a.on:(a&&(a.on=null,e=e.slice(0,i=e.indexOf(a)).concat(e.slice(i+1)),r.remove(n)),u&&e.push(r.set(n,{on:u})),t)},n}function x(t,n){return n-(t?1+Math.floor(Math.log(t+Math.pow(10,1+Math.floor(Math.log(t)/Math.LN10)-n))/Math.LN10):1)}function _(t){return t+""}function w(t,n){var e=Math.pow(10,3*Math.abs(8-n));return{scale:n>8?function(t){return t/e}:function(t){return t*e},symbol:t}}function S(t){return function(n){return 0>=n?0:n>=1?1:t(n)}}function k(t){return function(n){return 1-t(1-n)}}function E(t){return function(n){return.5*(.5>n?t(2*n):2-t(2-2*n))}}function A(t){return t*t}function N(t){return t*t*t}function T(t){if(0>=t)return 0;if(t>=1)return 1;var n=t*t,e=n*t;return 4*(.5>t?e:3*(t-n)+e-.75)}function q(t){return function(n){return Math.pow(n,t)}}function C(t){return 1-Math.cos(t*Ri/2)}function z(t){return Math.pow(2,10*(t-1))}function D(t){return 1-Math.sqrt(1-t*t)}function L(t,n){var e;return 2>arguments.length&&(n=.45),arguments.length?e=n/(2*Ri)*Math.asin(1/t):(t=1,e=n/4),function(r){return 1+t*Math.pow(2,10*-r)*Math.sin(2*(r-e)*Ri/n)}}function F(t){return t||(t=1.70158),function(n){return n*n*((t+1)*n-t)}}function H(t){return 1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}function R(){d3.event.stopPropagation(),d3.event.preventDefault()}function P(){for(var t,n=d3.event;t=n.sourceEvent;)n=t;return n}function j(t){for(var n=new M,e=0,r=arguments.length;r>++e;)n[arguments[e]]=b(n);return n.of=function(e,r){return function(u){try{var i=u.sourceEvent=d3.event;u.target=t,d3.event=u,n[u.type].apply(e,r)}finally{d3.event=i}}},n}function O(t){var n=[t.a,t.b],e=[t.c,t.d],r=U(n),u=Y(n,e),i=U(I(e,n,-u))||0;n[0]*e[1]<e[0]*n[1]&&(n[0]*=-1,n[1]*=-1,r*=-1,u*=-1),this.rotate=(r?Math.atan2(n[1],n[0]):Math.atan2(-e[0],e[1]))*Oi,this.translate=[t.e,t.f],this.scale=[r,i],this.skew=i?Math.atan2(u,i)*Oi:0}function Y(t,n){return t[0]*n[0]+t[1]*n[1]}function U(t){var n=Math.sqrt(Y(t,t));return n&&(t[0]/=n,t[1]/=n),n}function I(t,n,e){return t[0]+=e*n[0],t[1]+=e*n[1],t}function V(t){return"transform"==t?d3.interpolateTransform:d3.interpolate}function X(t,n){return n=n-(t=+t)?1/(n-t):0,function(e){return(e-t)*n}}function Z(t,n){return n=n-(t=+t)?1/(n-t):0,function(e){return Math.max(0,Math.min(1,(e-t)*n))}}function B(){}function $(t,n,e){return new J(t,n,e)}function J(t,n,e){this.r=t,this.g=n,this.b=e}function G(t){return 16>t?"0"+Math.max(0,t).toString(16):Math.min(255,t).toString(16)}function K(t,n,e){var r,u,i,a=0,o=0,c=0;if(r=/([a-z]+)\((.*)\)/i.exec(t))switch(u=r[2].split(","),r[1]){case"hsl":return e(parseFloat(u[0]),parseFloat(u[1])/100,parseFloat(u[2])/100);case"rgb":return n(nn(u[0]),nn(u[1]),nn(u[2]))}return(i=aa.get(t))?n(i.r,i.g,i.b):(null!=t&&"#"===t.charAt(0)&&(4===t.length?(a=t.charAt(1),a+=a,o=t.charAt(2),o+=o,c=t.charAt(3),c+=c):7===t.length&&(a=t.substring(1,3),o=t.substring(3,5),c=t.substring(5,7)),a=parseInt(a,16),o=parseInt(o,16),c=parseInt(c,16)),n(a,o,c))}function W(t,n,e){var r,u,i=Math.min(t/=255,n/=255,e/=255),a=Math.max(t,n,e),o=a-i,c=(a+i)/2;return o?(u=.5>c?o/(a+i):o/(2-a-i),r=t==a?(n-e)/o+(e>n?6:0):n==a?(e-t)/o+2:(t-n)/o+4,r*=60):u=r=0,en(r,u,c)}function Q(t,n,e){t=tn(t),n=tn(n),e=tn(e);var r=gn((.4124564*t+.3575761*n+.1804375*e)/sa),u=gn((.2126729*t+.7151522*n+.072175*e)/fa),i=gn((.0193339*t+.119192*n+.9503041*e)/ha);return ln(116*u-16,500*(r-u),200*(u-i))}function tn(t){return.04045>=(t/=255)?t/12.92:Math.pow((t+.055)/1.055,2.4)}function nn(t){var n=parseFloat(t);return"%"===t.charAt(t.length-1)?Math.round(2.55*n):n}function en(t,n,e){return new rn(t,n,e)}function rn(t,n,e){this.h=t,this.s=n,this.l=e}function un(t,n,e){function r(t){return t>360?t-=360:0>t&&(t+=360),60>t?i+(a-i)*t/60:180>t?a:240>t?i+(a-i)*(240-t)/60:i}function u(t){return Math.round(255*r(t))}var i,a;return t%=360,0>t&&(t+=360),n=0>n?0:n>1?1:n,e=0>e?0:e>1?1:e,a=.5>=e?e*(1+n):e+n-e*n,i=2*e-a,$(u(t+120),u(t),u(t-120))}function an(t,n,e){return new on(t,n,e)}function on(t,n,e){this.h=t,this.c=n,this.l=e}function cn(t,n,e){return ln(e,Math.cos(t*=ji)*n,Math.sin(t)*n)}function ln(t,n,e){return new sn(t,n,e)}function sn(t,n,e){this.l=t,this.a=n,this.b=e}function fn(t,n,e){var r=(t+16)/116,u=r+n/500,i=r-e/200;return u=dn(u)*sa,r=dn(r)*fa,i=dn(i)*ha,$(pn(3.2404542*u-1.5371385*r-.4985314*i),pn(-.969266*u+1.8760108*r+.041556*i),pn(.0556434*u-.2040259*r+1.0572252*i))}function hn(t,n,e){return an(180*(Math.atan2(e,n)/Ri),Math.sqrt(n*n+e*e),t)}function dn(t){return t>.206893034?t*t*t:(t-4/29)/7.787037}function gn(t){return t>.008856?Math.pow(t,1/3):7.787037*t+4/29}function pn(t){return Math.round(255*(.00304>=t?12.92*t:1.055*Math.pow(t,1/2.4)-.055))}function mn(t){return Ii(t,Ma),t}function vn(t){return function(){return ga(t,this)}}function yn(t){return function(){return pa(t,this)}}function Mn(t,n){function e(){this.removeAttribute(t)}function r(){this.removeAttributeNS(t.space,t.local)}function u(){this.setAttribute(t,n)}function i(){this.setAttributeNS(t.space,t.local,n)}function a(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}function o(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}return t=d3.ns.qualify(t),null==n?t.local?r:e:"function"==typeof n?t.local?o:a:t.local?i:u}function bn(t){return RegExp("(?:^|\\s+)"+d3.requote(t)+"(?:\\s+|$)","g")}function xn(t,n){function e(){for(var e=-1;u>++e;)t[e](this,n)}function r(){for(var e=-1,r=n.apply(this,arguments);u>++e;)t[e](this,r)}t=t.trim().split(/\s+/).map(_n);var u=t.length;return"function"==typeof n?r:e}function _n(t){var n=bn(t);return function(e,r){if(u=e.classList)return r?u.add(t):u.remove(t);var u=e.className,i=null!=u.baseVal,a=i?u.baseVal:u;r?(n.lastIndex=0,n.test(a)||(a=h(a+" "+t),i?u.baseVal=a:e.className=a)):a&&(a=h(a.replace(n," ")),i?u.baseVal=a:e.className=a)}}function wn(t,n,e){function r(){this.style.removeProperty(t)}function u(){this.style.setProperty(t,n,e)}function i(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}return null==n?r:"function"==typeof n?i:u}function Sn(t,n){function e(){delete this[t]}function r(){this[t]=n}function u(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}return null==n?e:"function"==typeof n?u:r}function kn(t){return{__data__:t}}function En(t){return function(){return ya(this,t)}}function An(t){return arguments.length||(t=d3.ascending),function(n,e){return t(n&&n.__data__,e&&e.__data__)}}function Nn(t,n,e){function r(){var n=this[i];n&&(this.removeEventListener(t,n,n.$),delete this[i])}function u(){function u(t){var e=d3.event;d3.event=t,o[0]=a.__data__;try{n.apply(a,o)}finally{d3.event=e}}var a=this,o=Yi(arguments);r.call(this),this.addEventListener(t,this[i]=u,u.$=e),u._=n}var i="__on"+t,a=t.indexOf(".");return a>0&&(t=t.substring(0,a)),n?u:r}function Tn(t,n){for(var e=0,r=t.length;r>e;e++)for(var u,i=t[e],a=0,o=i.length;o>a;a++)(u=i[a])&&n(u,a,e);return t}function qn(t){return Ii(t,xa),t}function Cn(t,n){return Ii(t,wa),t.id=n,t}function zn(t,n,e,r){var u=t.__transition__||(t.__transition__={active:0,count:0}),a=u[e];if(!a){var o=r.time;return a=u[e]={tween:new i,event:d3.dispatch("start","end"),time:o,ease:r.ease,delay:r.delay,duration:r.duration},++u.count,d3.timer(function(r){function i(r){return u.active>e?l():(u.active=e,h.start.call(t,s,n),a.tween.forEach(function(e,r){(r=r.call(t,s,n))&&p.push(r)}),c(r)||d3.timer(c,0,o),1)}function c(r){if(u.active!==e)return l();for(var i=(r-d)/g,a=f(i),o=p.length;o>0;)p[--o].call(t,a);return i>=1?(l(),h.end.call(t,s,n),1):void 0}function l(){return--u.count?delete u[e]:delete t.__transition__,1}var s=t.__data__,f=a.ease,h=a.event,d=a.delay,g=a.duration,p=[];return r>=d?i(r):d3.timer(i,d,o),1},0,o),a}}function Dn(t){return null==t&&(t=""),function(){this.textContent=t}}function Ln(t,n,e,r){var u=t.id;return Tn(t,"function"==typeof e?function(t,i,a){t.__transition__[u].tween.set(n,r(e.call(t,t.__data__,i,a)))}:(e=r(e),function(t){t.__transition__[u].tween.set(n,e)}))}function Fn(){for(var t,n=Date.now(),e=qa;e;)t=n-e.then,t>=e.delay&&(e.flush=e.callback(t)),e=e.next;var r=Hn()-n;r>24?(isFinite(r)&&(clearTimeout(Aa),Aa=setTimeout(Fn,r)),Ea=0):(Ea=1,Ca(Fn))}function Hn(){for(var t=null,n=qa,e=1/0;n;)n.flush?(delete Ta[n.callback.id],n=t?t.next=n.next:qa=n.next):(e=Math.min(e,n.then+n.delay),n=(t=n).next);return e}function Rn(t,n){var e=t.ownerSVGElement||t;if(e.createSVGPoint){var r=e.createSVGPoint();if(0>za&&(window.scrollX||window.scrollY)){e=d3.select(document.body).append("svg").style("position","absolute").style("top",0).style("left",0);var u=e[0][0].getScreenCTM();za=!(u.f||u.e),e.remove()}return za?(r.x=n.pageX,r.y=n.pageY):(r.x=n.clientX,r.y=n.clientY),r=r.matrixTransform(t.getScreenCTM().inverse()),[r.x,r.y]}var i=t.getBoundingClientRect();return[n.clientX-i.left-t.clientLeft,n.clientY-i.top-t.clientTop]}function Pn(){}function jn(t){var n=t[0],e=t[t.length-1];return e>n?[n,e]:[e,n]}function On(t){return t.rangeExtent?t.rangeExtent():jn(t.range())}function Yn(t,n){var e,r=0,u=t.length-1,i=t[r],a=t[u];return i>a&&(e=r,r=u,u=e,e=i,i=a,a=e),(n=n(a-i))&&(t[r]=n.floor(i),t[u]=n.ceil(a)),t}function Un(){return Math}function In(t,n,e,r){function u(){var u=Math.min(t.length,n.length)>2?Gn:Jn,c=r?Z:X;return a=u(t,n,c,e),o=u(n,t,c,d3.interpolate),i}function i(t){return a(t)}var a,o;return i.invert=function(t){return o(t)},i.domain=function(n){return arguments.length?(t=n.map(Number),u()):t},i.range=function(t){return arguments.length?(n=t,u()):n},i.rangeRound=function(t){return i.range(t).interpolate(d3.interpolateRound)},i.clamp=function(t){return arguments.length?(r=t,u()):r},i.interpolate=function(t){return arguments.length?(e=t,u()):e},i.ticks=function(n){return Bn(t,n)},i.tickFormat=function(n){return $n(t,n)},i.nice=function(){return Yn(t,Xn),u()},i.copy=function(){return In(t,n,e,r)},u()}function Vn(t,n){return d3.rebind(t,n,"range","rangeRound","interpolate","clamp")}function Xn(t){return t=Math.pow(10,Math.round(Math.log(t)/Math.LN10)-1),t&&{floor:function(n){return Math.floor(n/t)*t},ceil:function(n){return Math.ceil(n/t)*t}}}function Zn(t,n){var e=jn(t),r=e[1]-e[0],u=Math.pow(10,Math.floor(Math.log(r/n)/Math.LN10)),i=n/r*u;return.15>=i?u*=10:.35>=i?u*=5:.75>=i&&(u*=2),e[0]=Math.ceil(e[0]/u)*u,e[1]=Math.floor(e[1]/u)*u+.5*u,e[2]=u,e}function Bn(t,n){return d3.range.apply(d3,Zn(t,n))}function $n(t,n){return d3.format(",."+Math.max(0,-Math.floor(Math.log(Zn(t,n)[2])/Math.LN10+.01))+"f")}function Jn(t,n,e,r){var u=e(t[0],t[1]),i=r(n[0],n[1]);return function(t){return i(u(t))}}function Gn(t,n,e,r){var u=[],i=[],a=0,o=Math.min(t.length,n.length)-1;for(t[o]<t[0]&&(t=t.slice().reverse(),n=n.slice().reverse());o>=++a;)u.push(e(t[a-1],t[a])),i.push(r(n[a-1],n[a]));return function(n){var e=d3.bisect(t,n,1,o)-1;return i[e](u[e](n))}}function Kn(t,n){function e(e){return t(n(e))}var r=n.pow;return e.invert=function(n){return r(t.invert(n))},e.domain=function(u){return arguments.length?(n=0>u[0]?Qn:Wn,r=n.pow,t.domain(u.map(n)),e):t.domain().map(r)},e.nice=function(){return t.domain(Yn(t.domain(),Un)),e},e.ticks=function(){var e=jn(t.domain()),u=[];if(e.every(isFinite)){var i=Math.floor(e[0]),a=Math.ceil(e[1]),o=r(e[0]),c=r(e[1]);if(n===Qn)for(u.push(r(i));a>i++;)for(var l=9;l>0;l--)u.push(r(i)*l);else{for(;a>i;i++)for(var l=1;10>l;l++)u.push(r(i)*l);u.push(r(i))}for(i=0;o>u[i];i++);for(a=u.length;u[a-1]>c;a--);u=u.slice(i,a)}return u},e.tickFormat=function(t,u){if(2>arguments.length&&(u=Da),!arguments.length)return u;var i,a=Math.max(.1,t/e.ticks().length),o=n===Qn?(i=-1e-12,Math.floor):(i=1e-12,Math.ceil);return function(t){return a>=t/r(o(n(t)+i))?u(t):""}},e.copy=function(){return Kn(t.copy(),n)},Vn(e,t)}function Wn(t){return Math.log(0>t?0:t)/Math.LN10}function Qn(t){return-Math.log(t>0?0:-t)/Math.LN10}function te(t,n){function e(n){return t(r(n))}var r=ne(n),u=ne(1/n);return e.invert=function(n){return u(t.invert(n))},e.domain=function(n){return arguments.length?(t.domain(n.map(r)),e):t.domain().map(u)},e.ticks=function(t){return Bn(e.domain(),t)},e.tickFormat=function(t){return $n(e.domain(),t)},e.nice=function(){return e.domain(Yn(e.domain(),Xn))},e.exponent=function(t){if(!arguments.length)return n;var i=e.domain();return r=ne(n=t),u=ne(1/n),e.domain(i)},e.copy=function(){return te(t.copy(),n)},Vn(e,t)}function ne(t){return function(n){return 0>n?-Math.pow(-n,t):Math.pow(n,t)}}function ee(t,n){function e(n){return a[((u.get(n)||u.set(n,t.push(n)))-1)%a.length]}function r(n,e){return d3.range(t.length).map(function(t){return n+e*t})}var u,a,o;return e.domain=function(r){if(!arguments.length)return t;t=[],u=new i;for(var a,o=-1,c=r.length;c>++o;)u.has(a=r[o])||u.set(a,t.push(a));return e[n.t].apply(e,n.a)},e.range=function(t){return arguments.length?(a=t,o=0,n={t:"range",a:arguments},e):a},e.rangePoints=function(u,i){2>arguments.length&&(i=0);var c=u[0],l=u[1],s=(l-c)/(Math.max(1,t.length-1)+i);return a=r(2>t.length?(c+l)/2:c+s*i/2,s),o=0,n={t:"rangePoints",a:arguments},e},e.rangeBands=function(u,i,c){2>arguments.length&&(i=0),3>arguments.length&&(c=i);var l=u[1]<u[0],s=u[l-0],f=u[1-l],h=(f-s)/(t.length-i+2*c);return a=r(s+h*c,h),l&&a.reverse(),o=h*(1-i),n={t:"rangeBands",a:arguments},e},e.rangeRoundBands=function(u,i,c){2>arguments.length&&(i=0),3>arguments.length&&(c=i);var l=u[1]<u[0],s=u[l-0],f=u[1-l],h=Math.floor((f-s)/(t.length-i+2*c)),d=f-s-(t.length-i)*h;return a=r(s+Math.round(d/2),h),l&&a.reverse(),o=Math.round(h*(1-i)),n={t:"rangeRoundBands",a:arguments},e},e.rangeBand=function(){return o},e.rangeExtent=function(){return jn(n.a[0])},e.copy=function(){return ee(t,n)},e.domain(t)}function re(t,n){function e(){var e=0,i=n.length;for(u=[];i>++e;)u[e-1]=d3.quantile(t,e/i);return r}function r(t){return isNaN(t=+t)?0/0:n[d3.bisect(u,t)]}var u;return r.domain=function(n){return arguments.length?(t=n.filter(function(t){return!isNaN(t)}).sort(d3.ascending),e()):t},r.range=function(t){return arguments.length?(n=t,e()):n},r.quantiles=function(){return u},r.copy=function(){return re(t,n)},e()}function ue(t,n,e){function r(n){return e[Math.max(0,Math.min(a,Math.floor(i*(n-t))))]}function u(){return i=e.length/(n-t),a=e.length-1,r}var i,a;return r.domain=function(e){return arguments.length?(t=+e[0],n=+e[e.length-1],u()):[t,n]},r.range=function(t){return arguments.length?(e=t,u()):e},r.copy=function(){return ue(t,n,e)},u()}function ie(t,n){function e(e){return n[d3.bisect(t,e)]}return e.domain=function(n){return arguments.length?(t=n,e):t},e.range=function(t){return arguments.length?(n=t,e):n},e.copy=function(){return ie(t,n)},e}function ae(t){function n(t){return+t}return n.invert=n,n.domain=n.range=function(e){return arguments.length?(t=e.map(n),n):t},n.ticks=function(n){return Bn(t,n)},n.tickFormat=function(n){return $n(t,n)},n.copy=function(){return ae(t)},n}function oe(t){return t.innerRadius}function ce(t){return t.outerRadius}function le(t){return t.startAngle}function se(t){return t.endAngle}function fe(t){function n(n){function a(){s.push("M",i(t(f),l))}for(var o,s=[],f=[],h=-1,d=n.length,g=c(e),p=c(r);d>++h;)u.call(this,o=n[h],h)?f.push([+g.call(this,o,h),+p.call(this,o,h)]):f.length&&(a(),f=[]);return f.length&&a(),s.length?s.join(""):null}var e=he,r=de,u=o,i=ge,a=i.key,l=.7;return n.x=function(t){return arguments.length?(e=t,n):e},n.y=function(t){return arguments.length?(r=t,n):r},n.defined=function(t){return arguments.length?(u=t,n):u},n.interpolate=function(t){return arguments.length?(a="function"==typeof t?i=t:(i=Oa.get(t)||ge).key,n):a},n.tension=function(t){return arguments.length?(l=t,n):l},n}function he(t){return t[0]}function de(t){return t[1]}function ge(t){return t.join("L")}function pe(t){return ge(t)+"Z"}function me(t){for(var n=0,e=t.length,r=t[0],u=[r[0],",",r[1]];e>++n;)u.push("V",(r=t[n])[1],"H",r[0]);return u.join("")}function ve(t){for(var n=0,e=t.length,r=t[0],u=[r[0],",",r[1]];e>++n;)u.push("H",(r=t[n])[0],"V",r[1]);return u.join("")}function ye(t,n){return 4>t.length?ge(t):t[1]+xe(t.slice(1,t.length-1),_e(t,n))}function Me(t,n){return 3>t.length?ge(t):t[0]+xe((t.push(t[0]),t),_e([t[t.length-2]].concat(t,[t[1]]),n))}function be(t,n){return 3>t.length?ge(t):t[0]+xe(t,_e(t,n))}function xe(t,n){if(1>n.length||t.length!=n.length&&t.length!=n.length+2)return ge(t);var e=t.length!=n.length,r="",u=t[0],i=t[1],a=n[0],o=a,c=1;if(e&&(r+="Q"+(i[0]-2*a[0]/3)+","+(i[1]-2*a[1]/3)+","+i[0]+","+i[1],u=t[1],c=2),n.length>1){o=n[1],i=t[c],c++,r+="C"+(u[0]+a[0])+","+(u[1]+a[1])+","+(i[0]-o[0])+","+(i[1]-o[1])+","+i[0]+","+i[1];for(var l=2;n.length>l;l++,c++)i=t[c],o=n[l],r+="S"+(i[0]-o[0])+","+(i[1]-o[1])+","+i[0]+","+i[1]}if(e){var s=t[c];r+="Q"+(i[0]+2*o[0]/3)+","+(i[1]+2*o[1]/3)+","+s[0]+","+s[1]}return r}function _e(t,n){for(var e,r=[],u=(1-n)/2,i=t[0],a=t[1],o=1,c=t.length;c>++o;)e=i,i=a,a=t[o],r.push([u*(a[0]-e[0]),u*(a[1]-e[1])]);return r}function we(t){if(3>t.length)return ge(t);var n=1,e=t.length,r=t[0],u=r[0],i=r[1],a=[u,u,u,(r=t[1])[0]],o=[i,i,i,r[1]],c=[u,",",i];for(Ne(c,a,o);e>++n;)r=t[n],a.shift(),a.push(r[0]),o.shift(),o.push(r[1]),Ne(c,a,o);for(n=-1;2>++n;)a.shift(),a.push(r[0]),o.shift(),o.push(r[1]),Ne(c,a,o);return c.join("")}function Se(t){if(4>t.length)return ge(t);for(var n,e=[],r=-1,u=t.length,i=[0],a=[0];3>++r;)n=t[r],i.push(n[0]),a.push(n[1]);for(e.push(Ae(Ia,i)+","+Ae(Ia,a)),--r;u>++r;)n=t[r],i.shift(),i.push(n[0]),a.shift(),a.push(n[1]),Ne(e,i,a);return e.join("")}function ke(t){for(var n,e,r=-1,u=t.length,i=u+4,a=[],o=[];4>++r;)e=t[r%u],a.push(e[0]),o.push(e[1]);for(n=[Ae(Ia,a),",",Ae(Ia,o)],--r;i>++r;)e=t[r%u],a.shift(),a.push(e[0]),o.shift(),o.push(e[1]),Ne(n,a,o);return n.join("")}function Ee(t,n){var e=t.length-1;if(e)for(var r,u,i=t[0][0],a=t[0][1],o=t[e][0]-i,c=t[e][1]-a,l=-1;e>=++l;)r=t[l],u=l/e,r[0]=n*r[0]+(1-n)*(i+u*o),r[1]=n*r[1]+(1-n)*(a+u*c);return we(t)}function Ae(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]+t[3]*n[3]}function Ne(t,n,e){t.push("C",Ae(Ya,n),",",Ae(Ya,e),",",Ae(Ua,n),",",Ae(Ua,e),",",Ae(Ia,n),",",Ae(Ia,e))}function Te(t,n){return(n[1]-t[1])/(n[0]-t[0])}function qe(t){for(var n=0,e=t.length-1,r=[],u=t[0],i=t[1],a=r[0]=Te(u,i);e>++n;)r[n]=(a+(a=Te(u=i,i=t[n+1])))/2;return r[n]=a,r}function Ce(t){for(var n,e,r,u,i=[],a=qe(t),o=-1,c=t.length-1;c>++o;)n=Te(t[o],t[o+1]),1e-6>Math.abs(n)?a[o]=a[o+1]=0:(e=a[o]/n,r=a[o+1]/n,u=e*e+r*r,u>9&&(u=3*n/Math.sqrt(u),a[o]=u*e,a[o+1]=u*r));for(o=-1;c>=++o;)u=(t[Math.min(c,o+1)][0]-t[Math.max(0,o-1)][0])/(6*(1+a[o]*a[o])),i.push([u||0,a[o]*u||0]);return i}function ze(t){return 3>t.length?ge(t):t[0]+xe(t,Ce(t))}function De(t){for(var n,e,r,u=-1,i=t.length;i>++u;)n=t[u],e=n[0],r=n[1]+Pa,n[0]=e*Math.cos(r),n[1]=e*Math.sin(r);return t}function Le(t){function n(n){function o(){m.push("M",l(t(y),d),h,f(t(v.reverse()),d),"Z")}for(var s,g,p,m=[],v=[],y=[],M=-1,b=n.length,x=c(e),_=c(u),w=e===r?function(){return g}:c(r),S=u===i?function(){return p}:c(i);b>++M;)a.call(this,s=n[M],M)?(v.push([g=+x.call(this,s,M),p=+_.call(this,s,M)]),y.push([+w.call(this,s,M),+S.call(this,s,M)])):v.length&&(o(),v=[],y=[]);return v.length&&o(),m.length?m.join(""):null}var e=he,r=he,u=0,i=de,a=o,l=ge,s=l.key,f=l,h="L",d=.7;return n.x=function(t){return arguments.length?(e=r=t,n):r},n.x0=function(t){return arguments.length?(e=t,n):e},n.x1=function(t){return arguments.length?(r=t,n):r},n.y=function(t){return arguments.length?(u=i=t,n):i},n.y0=function(t){return arguments.length?(u=t,n):u},n.y1=function(t){return arguments.length?(i=t,n):i},n.defined=function(t){return arguments.length?(a=t,n):a},n.interpolate=function(t){return arguments.length?(s="function"==typeof t?l=t:(l=Oa.get(t)||ge).key,f=l.reverse||l,h=l.closed?"M":"L",n):s},n.tension=function(t){return arguments.length?(d=t,n):d},n}function Fe(t){return t.radius}function He(t){return[t.x,t.y]}function Re(t){return function(){var n=t.apply(this,arguments),e=n[0],r=n[1]+Pa;return[e*Math.cos(r),e*Math.sin(r)]}}function Pe(){return 64}function je(){return"circle"}function Oe(t){var n=Math.sqrt(t/Ri);return"M0,"+n+"A"+n+","+n+" 0 1,1 0,"+-n+"A"+n+","+n+" 0 1,1 0,"+n+"Z"}function Ye(t,n){t.attr("transform",function(t){return"translate("+n(t)+",0)"})}function Ue(t,n){t.attr("transform",function(t){return"translate(0,"+n(t)+")"})}function Ie(t,n,e){if(r=[],e&&n.length>1){for(var r,u,i,a=jn(t.domain()),o=-1,c=n.length,l=(n[1]-n[0])/++e;c>++o;)for(u=e;--u>0;)(i=+n[o]-u*l)>=a[0]&&r.push(i);for(--o,u=0;e>++u&&(i=+n[o]+u*l)<a[1];)r.push(i)}return r}function Ve(){Ja||(Ja=d3.select("body").append("div").style("visibility","hidden").style("top",0).style("height",0).style("width",0).style("overflow-y","scroll").append("div").style("height","2000px").node().parentNode);var t,n=d3.event;try{Ja.scrollTop=1e3,Ja.dispatchEvent(n),t=1e3-Ja.scrollTop}catch(e){t=n.wheelDelta||5*-n.detail}return t}function Xe(t){for(var n=t.source,e=t.target,r=Be(n,e),u=[n];n!==r;)n=n.parent,u.push(n);for(var i=u.length;e!==r;)u.splice(i,0,e),e=e.parent;return u}function Ze(t){for(var n=[],e=t.parent;null!=e;)n.push(t),t=e,e=e.parent;return n.push(t),n}function Be(t,n){if(t===n)return t;for(var e=Ze(t),r=Ze(n),u=e.pop(),i=r.pop(),a=null;u===i;)a=u,u=e.pop(),i=r.pop();return a}function $e(t){t.fixed|=2}function Je(t){t.fixed&=1}function Ge(t){t.fixed|=4,t.px=t.x,t.py=t.y}function Ke(t){t.fixed&=3}function We(t,n,e){var r=0,u=0;if(t.charge=0,!t.leaf)for(var i,a=t.nodes,o=a.length,c=-1;o>++c;)i=a[c],null!=i&&(We(i,n,e),t.charge+=i.charge,r+=i.charge*i.cx,u+=i.charge*i.cy);if(t.point){t.leaf||(t.point.x+=Math.random()-.5,t.point.y+=Math.random()-.5);var l=n*e[t.point.index];t.charge+=t.pointCharge=l,r+=l*t.point.x,u+=l*t.point.y}t.cx=r/t.charge,t.cy=u/t.charge}function Qe(){return 20}function tr(){return 1}function nr(t){return t.x}function er(t){return t.y}function rr(t,n,e){t.y0=n,t.y=e}function ur(t){return d3.range(t.length)}function ir(t){for(var n=-1,e=t[0].length,r=[];e>++n;)r[n]=0;return r}function ar(t){for(var n,e=1,r=0,u=t[0][1],i=t.length;i>e;++e)(n=t[e][1])>u&&(r=e,u=n);return r}function or(t){return t.reduce(cr,0)}function cr(t,n){return t+n[1]}function lr(t,n){return sr(t,Math.ceil(Math.log(n.length)/Math.LN2+1))}function sr(t,n){for(var e=-1,r=+t[0],u=(t[1]-r)/n,i=[];n>=++e;)i[e]=u*e+r;return i}function fr(t){return[d3.min(t),d3.max(t)]}function hr(t,n){return d3.rebind(t,n,"sort","children","value"),t.nodes=t,t.links=mr,t}function dr(t){return t.children}function gr(t){return t.value}function pr(t,n){return n.value-t.value}function mr(t){return d3.merge(t.map(function(t){return(t.children||[]).map(function(n){return{source:t,target:n}})}))}function vr(t,n){return t.value-n.value}function yr(t,n){var e=t._pack_next;t._pack_next=n,n._pack_prev=t,n._pack_next=e,e._pack_prev=n}function Mr(t,n){t._pack_next=n,n._pack_prev=t}function br(t,n){var e=n.x-t.x,r=n.y-t.y,u=t.r+n.r;return u*u-e*e-r*r>.001}function xr(t){function n(t){s=Math.min(t.x-t.r,s),f=Math.max(t.x+t.r,f),h=Math.min(t.y-t.r,h),d=Math.max(t.y+t.r,d)}if((e=t.children)&&(l=e.length)){var e,r,u,i,a,o,c,l,s=1/0,f=-1/0,h=1/0,d=-1/0;if(e.forEach(_r),r=e[0],r.x=-r.r,r.y=0,n(r),l>1&&(u=e[1],u.x=u.r,u.y=0,n(u),l>2))for(i=e[2],kr(r,u,i),n(i),yr(r,i),r._pack_prev=i,yr(i,u),u=r._pack_next,a=3;l>a;a++){kr(r,u,i=e[a]);var g=0,p=1,m=1;for(o=u._pack_next;o!==u;o=o._pack_next,p++)if(br(o,i)){g=1;break}if(1==g)for(c=r._pack_prev;c!==o._pack_prev&&!br(c,i);c=c._pack_prev,m++);g?(m>p||p==m&&u.r<r.r?Mr(r,u=o):Mr(r=c,u),a--):(yr(r,i),u=i,n(i))}var v=(s+f)/2,y=(h+d)/2,M=0;for(a=0;l>a;a++)i=e[a],i.x-=v,i.y-=y,M=Math.max(M,i.r+Math.sqrt(i.x*i.x+i.y*i.y));t.r=M,e.forEach(wr)}}function _r(t){t._pack_next=t._pack_prev=t}function wr(t){delete t._pack_next,delete t._pack_prev}function Sr(t,n,e,r){var u=t.children;if(t.x=n+=r*t.x,t.y=e+=r*t.y,t.r*=r,u)for(var i=-1,a=u.length;a>++i;)Sr(u[i],n,e,r)}function kr(t,n,e){var r=t.r+e.r,u=n.x-t.x,i=n.y-t.y;if(r&&(u||i)){var a=n.r+e.r,o=u*u+i*i;a*=a,r*=r;var c=.5+(r-a)/(2*o),l=Math.sqrt(Math.max(0,2*a*(r+o)-(r-=o)*r-a*a))/(2*o);e.x=t.x+c*u+l*i,e.y=t.y+c*i-l*u}else e.x=t.x+r,e.y=t.y}function Er(t){return 1+d3.max(t,function(t){return t.y})}function Ar(t){return t.reduce(function(t,n){return t+n.x},0)/t.length}function Nr(t){var n=t.children;return n&&n.length?Nr(n[0]):t}function Tr(t){var n,e=t.children;return e&&(n=e.length)?Tr(e[n-1]):t}function qr(t,n){return t.parent==n.parent?1:2}function Cr(t){var n=t.children;return n&&n.length?n[0]:t._tree.thread}function zr(t){var n,e=t.children;return e&&(n=e.length)?e[n-1]:t._tree.thread}function Dr(t,n){var e=t.children;if(e&&(u=e.length))for(var r,u,i=-1;u>++i;)n(r=Dr(e[i],n),t)>0&&(t=r);return t}function Lr(t,n){return t.x-n.x}function Fr(t,n){return n.x-t.x}function Hr(t,n){return t.depth-n.depth}function Rr(t,n){function e(t,r){var u=t.children;if(u&&(a=u.length))for(var i,a,o=null,c=-1;a>++c;)i=u[c],e(i,o),o=i;n(t,r)}e(t,null)}function Pr(t){for(var n,e=0,r=0,u=t.children,i=u.length;--i>=0;)n=u[i]._tree,n.prelim+=e,n.mod+=e,e+=n.shift+(r+=n.change)}function jr(t,n,e){t=t._tree,n=n._tree;var r=e/(n.number-t.number);t.change+=r,n.change-=r,n.shift+=e,n.prelim+=e,n.mod+=e}function Or(t,n,e){return t._tree.ancestor.parent==n.parent?t._tree.ancestor:e}function Yr(t){return{x:t.x,y:t.y,dx:t.dx,dy:t.dy}}function Ur(t,n){var e=t.x+n[3],r=t.y+n[0],u=t.dx-n[1]-n[3],i=t.dy-n[0]-n[2];return 0>u&&(e+=u/2,u=0),0>i&&(r+=i/2,i=0),{x:e,y:r,dx:u,dy:i}}function Ir(t,n){function e(t,e){return d3.xhr(t,n,e).response(r)}function r(t){return e.parse(t.responseText)}function u(n){return n.map(i).join(t)}function i(t){return a.test(t)?'"'+t.replace(/\"/g,'""')+'"':t}var a=RegExp('["'+t+"\n]"),o=t.charCodeAt(0);return e.parse=function(t){var n;return e.parseRows(t,function(t){return n?n(t):(n=Function("d","return {"+t.map(function(t,n){return JSON.stringify(t)+": d["+n+"]"}).join(",")+"}"),void 0)})},e.parseRows=function(t,n){function e(){if(s>=l)return a;if(u)return u=!1,i;var n=s;if(34===t.charCodeAt(n)){for(var e=n;l>e++;)if(34===t.charCodeAt(e)){if(34!==t.charCodeAt(e+1))break;++e}s=e+2;var r=t.charCodeAt(e+1);return 13===r?(u=!0,10===t.charCodeAt(e+2)&&++s):10===r&&(u=!0),t.substring(n+1,e).replace(/""/g,'"')}for(;l>s;){var r=t.charCodeAt(s++),c=1;if(10===r)u=!0;else if(13===r)u=!0,10===t.charCodeAt(s)&&(++s,++c);else if(r!==o)continue;return t.substring(n,s-c)}return t.substring(n)}for(var r,u,i={},a={},c=[],l=t.length,s=0,f=0;(r=e())!==a;){for(var h=[];r!==i&&r!==a;)h.push(r),r=e();(!n||(h=n(h,f++)))&&c.push(h)}return c},e.format=function(t){return t.map(u).join("\n")},e}function Vr(t,n){no.hasOwnProperty(t.type)&&no[t.type](t,n)}function Xr(t,n,e){var r,u=-1,i=t.length-e;for(n.lineStart();i>++u;)r=t[u],n.point(r[0],r[1]);n.lineEnd()}function Zr(t,n){var e=-1,r=t.length;for(n.polygonStart();r>++e;)Xr(t[e],n,1);n.polygonEnd()}function Br(t){return[Math.atan2(t[1],t[0]),Math.asin(Math.max(-1,Math.min(1,t[2])))]}function $r(t,n){return Pi>Math.abs(t[0]-n[0])&&Pi>Math.abs(t[1]-n[1])}function Jr(t){var n=t[0],e=t[1],r=Math.cos(e);return[r*Math.cos(n),r*Math.sin(n),Math.sin(e)]}function Gr(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function Kr(t,n){return[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]]}function Wr(t,n){t[0]+=n[0],t[1]+=n[1],t[2]+=n[2]}function Qr(t,n){return[t[0]*n,t[1]*n,t[2]*n]}function tu(t){var n=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]/=n,t[1]/=n,t[2]/=n}function nu(t){function n(n){function r(e,r){e=t(e,r),n.point(e[0],e[1])}function i(){s=0/0,p.point=a,n.lineStart()}function a(r,i){var a=Jr([r,i]),o=t(r,i);e(s,f,l,h,d,g,s=o[0],f=o[1],l=r,h=a[0],d=a[1],g=a[2],u,n),n.point(s,f)}function o(){p.point=r,n.lineEnd()}function c(){var t,r,c,m,v,y,M;i(),p.point=function(n,e){a(t=n,r=e),c=s,m=f,v=h,y=d,M=g,p.point=a},p.lineEnd=function(){e(s,f,l,h,d,g,c,m,t,v,y,M,u,n),p.lineEnd=o,o()}}var l,s,f,h,d,g,p={point:r,lineStart:i,lineEnd:o,polygonStart:function(){n.polygonStart(),p.lineStart=c},polygonEnd:function(){n.polygonEnd(),p.lineStart=i}};return p}function e(n,u,i,a,o,c,l,s,f,h,d,g,p,m){var v=l-n,y=s-u,M=v*v+y*y;if(M>4*r&&p--){var b=a+h,x=o+d,_=c+g,w=Math.sqrt(b*b+x*x+_*_),S=Math.asin(_/=w),k=Pi>Math.abs(Math.abs(_)-1)?(i+f)/2:Math.atan2(x,b),E=t(k,S),A=E[0],N=E[1],T=A-n,q=N-u,C=y*T-v*q;(C*C/M>r||Math.abs((v*T+y*q)/M-.5)>.3)&&(e(n,u,i,a,o,c,A,N,k,b/=w,x/=w,_,p,m),m.point(A,N),e(A,N,k,b,x,_,l,s,f,h,d,g,p,m))}}var r=.5,u=16;return n.precision=function(t){return arguments.length?(u=(r=t*t)>0&&16,n):Math.sqrt(r)},n}function eu(t,n){function e(t,n){var e=Math.sqrt(i-2*u*Math.sin(n))/u;return[e*Math.sin(t*=u),a-e*Math.cos(t)]}var r=Math.sin(t),u=(r+Math.sin(n))/2,i=1+r*(2*u-r),a=Math.sqrt(i)/u;return e.invert=function(t,n){var e=a-n;return[Math.atan2(t,e)/u,Math.asin((i-(t*t+e*e)*u*u)/(2*u))]},e}function ru(t){function n(t,n){r>t&&(r=t),t>i&&(i=t),u>n&&(u=n),n>a&&(a=n)}function e(){o.point=o.lineEnd=Pn}var r,u,i,a,o={point:n,lineStart:Pn,lineEnd:Pn,polygonStart:function(){o.lineEnd=e},polygonEnd:function(){o.point=n}},c=t?t.stream(o):o;return function(t){return a=i=-(r=u=1/0),d3.geo.stream(t,c),[[r,u],[i,a]]}}function uu(t,n){if(!uo){++io,t*=ji;var e=Math.cos(n*=ji);ao+=(e*Math.cos(t)-ao)/io,oo+=(e*Math.sin(t)-oo)/io,co+=(Math.sin(n)-co)/io}}function iu(){var t,n;2>uo&&(uo=2,io=ao=oo=co=0),uo=1,au(),uo=2;var e=lo.point;lo.point=function(r,u){e(t=r,n=u)},lo.lineEnd=function(){lo.point(t,n),ou(),lo.lineEnd=ou}}function au(){function t(t,u){t*=ji;var i=Math.cos(u*=ji),a=i*Math.cos(t),o=i*Math.sin(t),c=Math.sin(u),l=Math.atan2(Math.sqrt((l=e*c-r*o)*l+(l=r*a-n*c)*l+(l=n*o-e*a)*l),n*a+e*o+r*c);io+=l,ao+=l*(n+(n=a)),oo+=l*(e+(e=o)),co+=l*(r+(r=c))}var n,e,r;if(1!==uo){if(!(1>uo))return;uo=1,io=ao=oo=co=0}lo.point=function(u,i){u*=ji;var a=Math.cos(i*=ji);n=a*Math.cos(u),e=a*Math.sin(u),r=Math.sin(i),lo.point=t}}function ou(){lo.point=uu}function cu(t,n){var e=Math.cos(t),r=Math.sin(t);return function(u,i,a,o){null!=u?(u=lu(e,u),i=lu(e,i),(a>0?i>u:u>i)&&(u+=2*a*Ri)):(u=t+2*a*Ri,i=t);for(var c,l=a*n,s=u;a>0?s>i:i>s;s-=l)o.point((c=Br([e,-r*Math.cos(s),-r*Math.sin(s)]))[0],c[1])}}function lu(t,n){var e=Jr(n);e[0]-=t,tu(e);var r=Math.acos(Math.max(-1,Math.min(1,-e[1])));return((0>-e[2]?-r:r)+2*Math.PI-Pi)%(2*Math.PI)}function su(t,n,e){return function(r){function u(n,e){t(n,e)&&r.point(n,e)}function i(t,n){m.point(t,n)}function a(){v.point=i,m.lineStart()}function o(){v.point=u,m.lineEnd()}function c(t,n){M.point(t,n),p.push([t,n])}function l(){M.lineStart(),p=[]}function s(){c(p[0][0],p[0][1]),M.lineEnd();var t,n=M.clean(),e=y.buffer(),u=e.length;if(!u)return g=!0,d+=mu(p,-1),p=null,void 0;if(p=null,1&n){t=e[0],h+=mu(t,1);var i,u=t.length-1,a=-1;for(r.lineStart();u>++a;)r.point((i=t[a])[0],i[1]);return r.lineEnd(),void 0}u>1&&2&n&&e.push(e.pop().concat(e.shift())),f.push(e.filter(gu))}var f,h,d,g,p,m=n(r),v={point:u,lineStart:a,lineEnd:o,polygonStart:function(){v.point=c,v.lineStart=l,v.lineEnd=s,g=!1,d=h=0,f=[],r.polygonStart()
},polygonEnd:function(){v.point=u,v.lineStart=a,v.lineEnd=o,f=d3.merge(f),f.length?fu(f,e,r):(-Pi>h||g&&-Pi>d)&&(r.lineStart(),e(null,null,1,r),r.lineEnd()),r.polygonEnd(),f=null},sphere:function(){r.polygonStart(),r.lineStart(),e(null,null,1,r),r.lineEnd(),r.polygonEnd()}},y=pu(),M=n(y);return v}}function fu(t,n,e){var r=[],u=[];if(t.forEach(function(t){var n=t.length;if(!(1>=n)){var e=t[0],i=t[n-1],a={point:e,points:t,other:null,visited:!1,entry:!0,subject:!0},o={point:e,points:[e],other:a,visited:!1,entry:!1,subject:!1};a.other=o,r.push(a),u.push(o),a={point:i,points:[i],other:null,visited:!1,entry:!1,subject:!0},o={point:i,points:[i],other:a,visited:!1,entry:!0,subject:!1},a.other=o,r.push(a),u.push(o)}}),u.sort(du),hu(r),hu(u),r.length)for(var i,a,o,c=r[0];;){for(i=c;i.visited;)if((i=i.next)===c)return;a=i.points,e.lineStart();do{if(i.visited=i.other.visited=!0,i.entry){if(i.subject)for(var l=0;a.length>l;l++)e.point((o=a[l])[0],o[1]);else n(i.point,i.next.point,1,e);i=i.next}else{if(i.subject){a=i.prev.points;for(var l=a.length;--l>=0;)e.point((o=a[l])[0],o[1])}else n(i.point,i.prev.point,-1,e);i=i.prev}i=i.other,a=i.points}while(!i.visited);e.lineEnd()}}function hu(t){if(n=t.length){for(var n,e,r=0,u=t[0];n>++r;)u.next=e=t[r],e.prev=u,u=e;u.next=e=t[0],e.prev=u}}function du(t,n){return(0>(t=t.point)[0]?t[1]-Ri/2-Pi:Ri/2-t[1])-(0>(n=n.point)[0]?n[1]-Ri/2-Pi:Ri/2-n[1])}function gu(t){return t.length>1}function pu(){var t,n=[];return{lineStart:function(){n.push(t=[])},point:function(n,e){t.push([n,e])},lineEnd:Pn,buffer:function(){var e=n;return n=[],t=null,e}}}function mu(t,n){if(!(e=t.length))return 0;for(var e,r,u,i=0,a=0,o=t[0],c=o[0],l=o[1],s=Math.cos(l),f=Math.atan2(n*Math.sin(c)*s,Math.sin(l)),h=1-n*Math.cos(c)*s,d=f;e>++i;)o=t[i],s=Math.cos(l=o[1]),r=Math.atan2(n*Math.sin(c=o[0])*s,Math.sin(l)),u=1-n*Math.cos(c)*s,Pi>Math.abs(h-2)&&Pi>Math.abs(u-2)||(Pi>Math.abs(u)||Pi>Math.abs(h)||(Pi>Math.abs(Math.abs(r-f)-Ri)?u+h>2&&(a+=4*(r-f)):a+=Pi>Math.abs(h-2)?4*(r-d):((3*Ri+r-f)%(2*Ri)-Ri)*(h+u)),d=f,f=r,h=u);return a}function vu(t){var n,e=0/0,r=0/0,u=0/0;return{lineStart:function(){t.lineStart(),n=1},point:function(i,a){var o=i>0?Ri:-Ri,c=Math.abs(i-e);Pi>Math.abs(c-Ri)?(t.point(e,r=(r+a)/2>0?Ri/2:-Ri/2),t.point(u,r),t.lineEnd(),t.lineStart(),t.point(o,r),t.point(i,r),n=0):u!==o&&c>=Ri&&(Pi>Math.abs(e-u)&&(e-=u*Pi),Pi>Math.abs(i-o)&&(i-=o*Pi),r=yu(e,r,i,a),t.point(u,r),t.lineEnd(),t.lineStart(),t.point(o,r),n=0),t.point(e=i,r=a),u=o},lineEnd:function(){t.lineEnd(),e=r=0/0},clean:function(){return 2-n}}}function yu(t,n,e,r){var u,i,a=Math.sin(t-e);return Math.abs(a)>Pi?Math.atan((Math.sin(n)*(i=Math.cos(r))*Math.sin(e)-Math.sin(r)*(u=Math.cos(n))*Math.sin(t))/(u*i*a)):(n+r)/2}function Mu(t,n,e,r){var u;if(null==t)u=e*Ri/2,r.point(-Ri,u),r.point(0,u),r.point(Ri,u),r.point(Ri,0),r.point(Ri,-u),r.point(0,-u),r.point(-Ri,-u),r.point(-Ri,0),r.point(-Ri,u);else if(Math.abs(t[0]-n[0])>Pi){var i=(t[0]<n[0]?1:-1)*Ri;u=e*i/2,r.point(-i,u),r.point(0,u),r.point(i,u)}else r.point(n[0],n[1])}function bu(t){function n(t,n){return Math.cos(t)*Math.cos(n)>i}function e(t){var e,u,i,a;return{lineStart:function(){i=u=!1,a=1},point:function(o,c){var l,s=[o,c],f=n(o,c);!e&&(i=u=f)&&t.lineStart(),f!==u&&(l=r(e,s),($r(e,l)||$r(s,l))&&(s[0]+=Pi,s[1]+=Pi,f=n(s[0],s[1]))),f!==u&&(a=0,(u=f)?(t.lineStart(),l=r(s,e),t.point(l[0],l[1])):(l=r(e,s),t.point(l[0],l[1]),t.lineEnd()),e=l),!f||e&&$r(e,s)||t.point(s[0],s[1]),e=s},lineEnd:function(){u&&t.lineEnd(),e=null},clean:function(){return a|(i&&u)<<1}}}function r(t,n){var e=Jr(t,0),r=Jr(n,0),u=[1,0,0],a=Kr(e,r),o=Gr(a,a),c=a[0],l=o-c*c;if(!l)return t;var s=i*o/l,f=-i*c/l,h=Kr(u,a),d=Qr(u,s),g=Qr(a,f);Wr(d,g);var p=h,m=Gr(d,p),v=Gr(p,p),y=Math.sqrt(m*m-v*(Gr(d,d)-1)),M=Qr(p,(-m-y)/v);return Wr(M,d),Br(M)}var u=t*ji,i=Math.cos(u),a=cu(u,6*ji);return su(n,e,a)}function xu(t,n){function e(e,r){return e=t(e,r),n(e[0],e[1])}return t.invert&&n.invert&&(e.invert=function(e,r){return e=n.invert(e,r),t.invert(e[0],e[1])}),e}function _u(t,n){return[t,n]}function wu(t,n,e){var r=d3.range(t,n-Pi,e).concat(n);return function(t){return r.map(function(n){return[t,n]})}}function Su(t,n,e){var r=d3.range(t,n-Pi,e).concat(n);return function(t){return r.map(function(n){return[n,t]})}}function ku(t,n,e,r){function u(t){var n=Math.sin(t*=d)*g,e=Math.sin(d-t)*g,r=e*l+n*f,u=e*s+n*h,i=e*a+n*c;return[Math.atan2(u,r)/ji,Math.atan2(i,Math.sqrt(r*r+u*u))/ji]}var i=Math.cos(n),a=Math.sin(n),o=Math.cos(r),c=Math.sin(r),l=i*Math.cos(t),s=i*Math.sin(t),f=o*Math.cos(e),h=o*Math.sin(e),d=Math.acos(Math.max(-1,Math.min(1,a*c+i*o*Math.cos(e-t)))),g=1/Math.sin(d);return u.distance=d,u}function Eu(t,n){return[t/(2*Ri),Math.max(-.5,Math.min(.5,Math.log(Math.tan(Ri/4+n/2))/(2*Ri)))]}function Au(t){return"m0,"+t+"a"+t+","+t+" 0 1,1 0,"+-2*t+"a"+t+","+t+" 0 1,1 0,"+2*t+"z"}function Nu(t){var n=nu(function(n,e){return t([n*Oi,e*Oi])});return function(t){return t=n(t),{point:function(n,e){t.point(n*ji,e*ji)},sphere:function(){t.sphere()},lineStart:function(){t.lineStart()},lineEnd:function(){t.lineEnd()},polygonStart:function(){t.polygonStart()},polygonEnd:function(){t.polygonEnd()}}}}function Tu(){function t(t,n){a.push("M",t,",",n,i)}function n(t,n){a.push("M",t,",",n),o.point=e}function e(t,n){a.push("L",t,",",n)}function r(){o.point=t}function u(){a.push("Z")}var i=Au(4.5),a=[],o={point:t,lineStart:function(){o.point=n},lineEnd:r,polygonStart:function(){o.lineEnd=u},polygonEnd:function(){o.lineEnd=r,o.point=t},pointRadius:function(t){return i=Au(t),o},result:function(){if(a.length){var t=a.join("");return a=[],t}}};return o}function qu(t){function n(n,e){t.moveTo(n,e),t.arc(n,e,a,0,2*Ri)}function e(n,e){t.moveTo(n,e),o.point=r}function r(n,e){t.lineTo(n,e)}function u(){o.point=n}function i(){t.closePath()}var a=4.5,o={point:n,lineStart:function(){o.point=e},lineEnd:u,polygonStart:function(){o.lineEnd=i},polygonEnd:function(){o.lineEnd=u,o.point=n},pointRadius:function(t){return a=t,o},result:Pn};return o}function Cu(){function t(t,n){po+=u*t-r*n,r=t,u=n}var n,e,r,u;mo.point=function(i,a){mo.point=t,n=r=i,e=u=a},mo.lineEnd=function(){t(n,e)}}function zu(t,n){uo||(ao+=t,oo+=n,++co)}function Du(){function t(t,r){var u=t-n,i=r-e,a=Math.sqrt(u*u+i*i);ao+=a*(n+t)/2,oo+=a*(e+r)/2,co+=a,n=t,e=r}var n,e;if(1!==uo){if(!(1>uo))return;uo=1,ao=oo=co=0}vo.point=function(r,u){vo.point=t,n=r,e=u}}function Lu(){vo.point=zu}function Fu(){function t(t,n){var e=u*t-r*n;ao+=e*(r+t),oo+=e*(u+n),co+=3*e,r=t,u=n}var n,e,r,u;2>uo&&(uo=2,ao=oo=co=0),vo.point=function(i,a){vo.point=t,n=r=i,e=u=a},vo.lineEnd=function(){t(n,e)}}function Hu(){function t(t,n){if(t*=ji,n*=ji,!(Pi>Math.abs(Math.abs(i)-Ri/2)&&Pi>Math.abs(Math.abs(n)-Ri/2))){var e=Math.cos(n),c=Math.sin(n);if(Pi>Math.abs(i-Ri/2))Mo+=2*(t-r);else{var l=t-u,s=Math.cos(l),f=Math.atan2(Math.sqrt((f=e*Math.sin(l))*f+(f=a*c-o*e*s)*f),o*c+a*e*s),h=(f+Ri+i+n)/4;Mo+=(0>l&&l>-Ri||l>Ri?-4:4)*Math.atan(Math.sqrt(Math.abs(Math.tan(h)*Math.tan(h-f/2)*Math.tan(h-Ri/4-i/2)*Math.tan(h-Ri/4-n/2))))}r=u,u=t,i=n,a=e,o=c}}var n,e,r,u,i,a,o;bo.point=function(c,l){bo.point=t,r=u=(n=c)*ji,i=(e=l)*ji,a=Math.cos(i),o=Math.sin(i)},bo.lineEnd=function(){t(n,e)}}function Ru(t){return Pu(function(){return t})()}function Pu(t){function n(t){return t=a(t[0]*ji,t[1]*ji),[t[0]*s+o,c-t[1]*s]}function e(t){return t=a.invert((t[0]-o)/s,(c-t[1])/s),[t[0]*Oi,t[1]*Oi]}function r(){a=xu(i=Ou(p,m,v),u);var t=u(d,g);return o=f-t[0]*s,c=h+t[1]*s,n}var u,i,a,o,c,l=nu(function(t,n){return t=u(t,n),[t[0]*s+o,c-t[1]*s]}),s=150,f=480,h=250,d=0,g=0,p=0,m=0,v=0,y=so,M=null;return n.stream=function(t){return ju(i,y(l(t)))},n.clipAngle=function(t){return arguments.length?(y=null==t?(M=t,so):bu(M=+t),n):M},n.scale=function(t){return arguments.length?(s=+t,r()):s},n.translate=function(t){return arguments.length?(f=+t[0],h=+t[1],r()):[f,h]},n.center=function(t){return arguments.length?(d=t[0]%360*ji,g=t[1]%360*ji,r()):[d*Oi,g*Oi]},n.rotate=function(t){return arguments.length?(p=t[0]%360*ji,m=t[1]%360*ji,v=t.length>2?t[2]%360*ji:0,r()):[p*Oi,m*Oi,v*Oi]},d3.rebind(n,l,"precision"),function(){return u=t.apply(this,arguments),n.invert=u.invert&&e,r()}}function ju(t,n){return{point:function(e,r){r=t(e*ji,r*ji),e=r[0],n.point(e>Ri?e-2*Ri:-Ri>e?e+2*Ri:e,r[1])},sphere:function(){n.sphere()},lineStart:function(){n.lineStart()},lineEnd:function(){n.lineEnd()},polygonStart:function(){n.polygonStart()},polygonEnd:function(){n.polygonEnd()}}}function Ou(t,n,e){return t?n||e?xu(Uu(t),Iu(n,e)):Uu(t):n||e?Iu(n,e):_u}function Yu(t){return function(n,e){return n+=t,[n>Ri?n-2*Ri:-Ri>n?n+2*Ri:n,e]}}function Uu(t){var n=Yu(t);return n.invert=Yu(-t),n}function Iu(t,n){function e(t,n){var e=Math.cos(n),o=Math.cos(t)*e,c=Math.sin(t)*e,l=Math.sin(n),s=l*r+o*u;return[Math.atan2(c*i-s*a,o*r-l*u),Math.asin(Math.max(-1,Math.min(1,s*i+c*a)))]}var r=Math.cos(t),u=Math.sin(t),i=Math.cos(n),a=Math.sin(n);return e.invert=function(t,n){var e=Math.cos(n),o=Math.cos(t)*e,c=Math.sin(t)*e,l=Math.sin(n),s=l*i-c*a;return[Math.atan2(c*i+l*a,o*r+s*u),Math.asin(Math.max(-1,Math.min(1,s*r-o*u)))]},e}function Vu(t,n){function e(n,e){var r=Math.cos(n),u=Math.cos(e),i=t(r*u);return[i*u*Math.sin(n),i*Math.sin(e)]}return e.invert=function(t,e){var r=Math.sqrt(t*t+e*e),u=n(r),i=Math.sin(u),a=Math.cos(u);return[Math.atan2(t*i,r*a),Math.asin(r&&e*i/r)]},e}function Xu(t,n,e,r){var u,i,a,o,c,l,s;return u=r[t],i=u[0],a=u[1],u=r[n],o=u[0],c=u[1],u=r[e],l=u[0],s=u[1],(s-a)*(o-i)-(c-a)*(l-i)>0}function Zu(t,n,e){return(e[0]-n[0])*(t[1]-n[1])<(e[1]-n[1])*(t[0]-n[0])}function Bu(t,n,e,r){var u=t[0],i=e[0],a=n[0]-u,o=r[0]-i,c=t[1],l=e[1],s=n[1]-c,f=r[1]-l,h=(o*(c-l)-f*(u-i))/(f*a-o*s);return[u+h*a,c+h*s]}function $u(t,n){var e={list:t.map(function(t,n){return{index:n,x:t[0],y:t[1]}}).sort(function(t,n){return t.y<n.y?-1:t.y>n.y?1:t.x<n.x?-1:t.x>n.x?1:0}),bottomSite:null},r={list:[],leftEnd:null,rightEnd:null,init:function(){r.leftEnd=r.createHalfEdge(null,"l"),r.rightEnd=r.createHalfEdge(null,"l"),r.leftEnd.r=r.rightEnd,r.rightEnd.l=r.leftEnd,r.list.unshift(r.leftEnd,r.rightEnd)},createHalfEdge:function(t,n){return{edge:t,side:n,vertex:null,l:null,r:null}},insert:function(t,n){n.l=t,n.r=t.r,t.r.l=n,t.r=n},leftBound:function(t){var n=r.leftEnd;do n=n.r;while(n!=r.rightEnd&&u.rightOf(n,t));return n=n.l},del:function(t){t.l.r=t.r,t.r.l=t.l,t.edge=null},right:function(t){return t.r},left:function(t){return t.l},leftRegion:function(t){return null==t.edge?e.bottomSite:t.edge.region[t.side]},rightRegion:function(t){return null==t.edge?e.bottomSite:t.edge.region[_o[t.side]]}},u={bisect:function(t,n){var e={region:{l:t,r:n},ep:{l:null,r:null}},r=n.x-t.x,u=n.y-t.y,i=r>0?r:-r,a=u>0?u:-u;return e.c=t.x*r+t.y*u+.5*(r*r+u*u),i>a?(e.a=1,e.b=u/r,e.c/=r):(e.b=1,e.a=r/u,e.c/=u),e},intersect:function(t,n){var e=t.edge,r=n.edge;if(!e||!r||e.region.r==r.region.r)return null;var u=e.a*r.b-e.b*r.a;if(1e-10>Math.abs(u))return null;var i,a,o=(e.c*r.b-r.c*e.b)/u,c=(r.c*e.a-e.c*r.a)/u,l=e.region.r,s=r.region.r;l.y<s.y||l.y==s.y&&l.x<s.x?(i=t,a=e):(i=n,a=r);var f=o>=a.region.r.x;return f&&"l"===i.side||!f&&"r"===i.side?null:{x:o,y:c}},rightOf:function(t,n){var e=t.edge,r=e.region.r,u=n.x>r.x;if(u&&"l"===t.side)return 1;if(!u&&"r"===t.side)return 0;if(1===e.a){var i=n.y-r.y,a=n.x-r.x,o=0,c=0;if(!u&&0>e.b||u&&e.b>=0?c=o=i>=e.b*a:(c=n.x+n.y*e.b>e.c,0>e.b&&(c=!c),c||(o=1)),!o){var l=r.x-e.region.l.x;c=e.b*(a*a-i*i)<l*i*(1+2*a/l+e.b*e.b),0>e.b&&(c=!c)}}else{var s=e.c-e.a*n.x,f=n.y-s,h=n.x-r.x,d=s-r.y;c=f*f>h*h+d*d}return"l"===t.side?c:!c},endPoint:function(t,e,r){t.ep[e]=r,t.ep[_o[e]]&&n(t)},distance:function(t,n){var e=t.x-n.x,r=t.y-n.y;return Math.sqrt(e*e+r*r)}},i={list:[],insert:function(t,n,e){t.vertex=n,t.ystar=n.y+e;for(var r=0,u=i.list,a=u.length;a>r;r++){var o=u[r];if(!(t.ystar>o.ystar||t.ystar==o.ystar&&n.x>o.vertex.x))break}u.splice(r,0,t)},del:function(t){for(var n=0,e=i.list,r=e.length;r>n&&e[n]!=t;++n);e.splice(n,1)},empty:function(){return 0===i.list.length},nextEvent:function(t){for(var n=0,e=i.list,r=e.length;r>n;++n)if(e[n]==t)return e[n+1];return null},min:function(){var t=i.list[0];return{x:t.vertex.x,y:t.ystar}},extractMin:function(){return i.list.shift()}};r.init(),e.bottomSite=e.list.shift();for(var a,o,c,l,s,f,h,d,g,p,m,v,y,M=e.list.shift();;)if(i.empty()||(a=i.min()),M&&(i.empty()||M.y<a.y||M.y==a.y&&M.x<a.x))o=r.leftBound(M),c=r.right(o),h=r.rightRegion(o),v=u.bisect(h,M),f=r.createHalfEdge(v,"l"),r.insert(o,f),p=u.intersect(o,f),p&&(i.del(o),i.insert(o,p,u.distance(p,M))),o=f,f=r.createHalfEdge(v,"r"),r.insert(o,f),p=u.intersect(f,c),p&&i.insert(f,p,u.distance(p,M)),M=e.list.shift();else{if(i.empty())break;o=i.extractMin(),l=r.left(o),c=r.right(o),s=r.right(c),h=r.leftRegion(o),d=r.rightRegion(c),m=o.vertex,u.endPoint(o.edge,o.side,m),u.endPoint(c.edge,c.side,m),r.del(o),i.del(c),r.del(c),y="l",h.y>d.y&&(g=h,h=d,d=g,y="r"),v=u.bisect(h,d),f=r.createHalfEdge(v,y),r.insert(l,f),u.endPoint(v,_o[y],m),p=u.intersect(l,f),p&&(i.del(l),i.insert(l,p,u.distance(p,h))),p=u.intersect(f,s),p&&i.insert(f,p,u.distance(p,h))}for(o=r.right(r.leftEnd);o!=r.rightEnd;o=r.right(o))n(o.edge)}function Ju(){return{leaf:!0,nodes:[],point:null}}function Gu(t,n,e,r,u,i){if(!t(n,e,r,u,i)){var a=.5*(e+u),o=.5*(r+i),c=n.nodes;c[0]&&Gu(t,c[0],e,r,a,o),c[1]&&Gu(t,c[1],a,r,u,o),c[2]&&Gu(t,c[2],e,o,a,i),c[3]&&Gu(t,c[3],a,o,u,i)}}function Ku(){this._=new Date(arguments.length>1?Date.UTC.apply(this,arguments):arguments[0])}function Wu(t,n,e,r){for(var u,i,a=0,o=n.length,c=e.length;o>a;){if(r>=c)return-1;if(u=n.charCodeAt(a++),37===u){if(i=Yo[n.charAt(a++)],!i||0>(r=i(t,e,r)))return-1}else if(u!=e.charCodeAt(r++))return-1}return r}function Qu(t){return RegExp("^(?:"+t.map(d3.requote).join("|")+")","i")}function ti(t){for(var n=new i,e=-1,r=t.length;r>++e;)n.set(t[e].toLowerCase(),e);return n}function ni(t,n,e){t+="";var r=t.length;return e>r?Array(e-r+1).join(n)+t:t}function ei(t,n,e){Lo.lastIndex=0;var r=Lo.exec(n.substring(e));return r?e+=r[0].length:-1}function ri(t,n,e){Do.lastIndex=0;var r=Do.exec(n.substring(e));return r?e+=r[0].length:-1}function ui(t,n,e){Ro.lastIndex=0;var r=Ro.exec(n.substring(e));return r?(t.m=Po.get(r[0].toLowerCase()),e+=r[0].length):-1}function ii(t,n,e){Fo.lastIndex=0;var r=Fo.exec(n.substring(e));return r?(t.m=Ho.get(r[0].toLowerCase()),e+=r[0].length):-1}function ai(t,n,e){return Wu(t,""+Oo.c,n,e)}function oi(t,n,e){return Wu(t,""+Oo.x,n,e)}function ci(t,n,e){return Wu(t,""+Oo.X,n,e)}function li(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+4));return r?(t.y=+r[0],e+=r[0].length):-1}function si(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+2));return r?(t.y=fi(+r[0]),e+=r[0].length):-1}function fi(t){return t+(t>68?1900:2e3)}function hi(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+2));return r?(t.m=r[0]-1,e+=r[0].length):-1}function di(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+2));return r?(t.d=+r[0],e+=r[0].length):-1}function gi(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+2));return r?(t.H=+r[0],e+=r[0].length):-1}function pi(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+2));return r?(t.M=+r[0],e+=r[0].length):-1}function mi(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+2));return r?(t.S=+r[0],e+=r[0].length):-1}function vi(t,n,e){Uo.lastIndex=0;var r=Uo.exec(n.substring(e,e+3));return r?(t.L=+r[0],e+=r[0].length):-1}function yi(t,n,e){var r=Io.get(n.substring(e,e+=2).toLowerCase());return null==r?-1:(t.p=r,e)}function Mi(t){var n=t.getTimezoneOffset(),e=n>0?"-":"+",r=~~(Math.abs(n)/60),u=Math.abs(n)%60;return e+ni(r,"0",2)+ni(u,"0",2)}function bi(t){return t.toISOString()}function xi(t,n,e){function r(n){var e=t(n),r=i(e,1);return r-n>n-e?e:r}function u(e){return n(e=t(new wo(e-1)),1),e}function i(t,e){return n(t=new wo(+t),e),t}function a(t,r,i){var a=u(t),o=[];if(i>1)for(;r>a;)e(a)%i||o.push(new Date(+a)),n(a,1);else for(;r>a;)o.push(new Date(+a)),n(a,1);return o}function o(t,n,e){try{wo=Ku;var r=new Ku;return r._=t,a(r,n,e)}finally{wo=Date}}t.floor=t,t.round=r,t.ceil=u,t.offset=i,t.range=a;var c=t.utc=_i(t);return c.floor=c,c.round=_i(r),c.ceil=_i(u),c.offset=_i(i),c.range=o,t}function _i(t){return function(n,e){try{wo=Ku;var r=new Ku;return r._=n,t(r,e)._}finally{wo=Date}}}function wi(t,n,e){function r(n){return t(n)}return r.invert=function(n){return ki(t.invert(n))},r.domain=function(n){return arguments.length?(t.domain(n),r):t.domain().map(ki)},r.nice=function(t){return r.domain(Yn(r.domain(),function(){return t}))},r.ticks=function(e,u){var i=Si(r.domain());if("function"!=typeof e){var a=i[1]-i[0],o=a/e,c=d3.bisect(Xo,o);if(c==Xo.length)return n.year(i,e);if(!c)return t.ticks(e).map(ki);Math.log(o/Xo[c-1])<Math.log(Xo[c]/o)&&--c,e=n[c],u=e[1],e=e[0].range}return e(i[0],new Date(+i[1]+1),u)},r.tickFormat=function(){return e},r.copy=function(){return wi(t.copy(),n,e)},d3.rebind(r,t,"range","rangeRound","interpolate","clamp")}function Si(t){var n=t[0],e=t[t.length-1];return e>n?[n,e]:[e,n]}function ki(t){return new Date(t)}function Ei(t){return function(n){for(var e=t.length-1,r=t[e];!r[1](n);)r=t[--e];return r[0](n)}}function Ai(t){var n=new Date(t,0,1);return n.setFullYear(t),n}function Ni(t){var n=t.getFullYear(),e=Ai(n),r=Ai(n+1);return n+(t-e)/(r-e)}function Ti(t){var n=new Date(Date.UTC(t,0,1));return n.setUTCFullYear(t),n}function qi(t){var n=t.getUTCFullYear(),e=Ti(n),r=Ti(n+1);return n+(t-e)/(r-e)}var Ci=".",zi=",",Di=[3,3];Date.now||(Date.now=function(){return+new Date});try{document.createElement("div").style.setProperty("opacity",0,"")}catch(Li){var Fi=CSSStyleDeclaration.prototype,Hi=Fi.setProperty;Fi.setProperty=function(t,n,e){Hi.call(this,t,n+"",e)}}d3={version:"3.0.0"};var Ri=Math.PI,Pi=1e-6,ji=Ri/180,Oi=180/Ri,Yi=u;try{Yi(document.documentElement.childNodes)[0].nodeType}catch(Ui){Yi=r}var Ii=[].__proto__?function(t,n){t.__proto__=n}:function(t,n){for(var e in n)t[e]=n[e]};d3.map=function(t){var n=new i;for(var e in t)n.set(e,t[e]);return n},e(i,{has:function(t){return Vi+t in this},get:function(t){return this[Vi+t]},set:function(t,n){return this[Vi+t]=n},remove:function(t){return t=Vi+t,t in this&&delete this[t]},keys:function(){var t=[];return this.forEach(function(n){t.push(n)}),t},values:function(){var t=[];return this.forEach(function(n,e){t.push(e)}),t},entries:function(){var t=[];return this.forEach(function(n,e){t.push({key:n,value:e})}),t},forEach:function(t){for(var n in this)n.charCodeAt(0)===Xi&&t.call(this,n.substring(1),this[n])}});var Vi="\0",Xi=Vi.charCodeAt(0);d3.functor=c,d3.rebind=function(t,n){for(var e,r=1,u=arguments.length;u>++r;)t[e=arguments[r]]=l(t,n,n[e]);return t},d3.ascending=function(t,n){return n>t?-1:t>n?1:t>=n?0:0/0},d3.descending=function(t,n){return t>n?-1:n>t?1:n>=t?0:0/0},d3.mean=function(t,n){var e,r=t.length,u=0,i=-1,a=0;if(1===arguments.length)for(;r>++i;)s(e=t[i])&&(u+=(e-u)/++a);else for(;r>++i;)s(e=n.call(t,t[i],i))&&(u+=(e-u)/++a);return a?u:void 0},d3.median=function(t,n){return arguments.length>1&&(t=t.map(n)),t=t.filter(s),t.length?d3.quantile(t.sort(d3.ascending),.5):void 0},d3.min=function(t,n){var e,r,u=-1,i=t.length;if(1===arguments.length){for(;i>++u&&(null==(e=t[u])||e!=e);)e=void 0;for(;i>++u;)null!=(r=t[u])&&e>r&&(e=r)}else{for(;i>++u&&(null==(e=n.call(t,t[u],u))||e!=e);)e=void 0;for(;i>++u;)null!=(r=n.call(t,t[u],u))&&e>r&&(e=r)}return e},d3.max=function(t,n){var e,r,u=-1,i=t.length;if(1===arguments.length){for(;i>++u&&(null==(e=t[u])||e!=e);)e=void 0;for(;i>++u;)null!=(r=t[u])&&r>e&&(e=r)}else{for(;i>++u&&(null==(e=n.call(t,t[u],u))||e!=e);)e=void 0;for(;i>++u;)null!=(r=n.call(t,t[u],u))&&r>e&&(e=r)}return e},d3.extent=function(t,n){var e,r,u,i=-1,a=t.length;if(1===arguments.length){for(;a>++i&&(null==(e=u=t[i])||e!=e);)e=u=void 0;for(;a>++i;)null!=(r=t[i])&&(e>r&&(e=r),r>u&&(u=r))}else{for(;a>++i&&(null==(e=u=n.call(t,t[i],i))||e!=e);)e=void 0;for(;a>++i;)null!=(r=n.call(t,t[i],i))&&(e>r&&(e=r),r>u&&(u=r))}return[e,u]},d3.random={normal:function(t,n){var e=arguments.length;return 2>e&&(n=1),1>e&&(t=0),function(){var e,r,u;do e=2*Math.random()-1,r=2*Math.random()-1,u=e*e+r*r;while(!u||u>1);return t+n*e*Math.sqrt(-2*Math.log(u)/u)}},logNormal:function(t,n){var e=arguments.length;2>e&&(n=1),1>e&&(t=0);var r=d3.random.normal();return function(){return Math.exp(t+n*r())}},irwinHall:function(t){return function(){for(var n=0,e=0;t>e;e++)n+=Math.random();return n/t}}},d3.sum=function(t,n){var e,r=0,u=t.length,i=-1;if(1===arguments.length)for(;u>++i;)isNaN(e=+t[i])||(r+=e);else for(;u>++i;)isNaN(e=+n.call(t,t[i],i))||(r+=e);return r},d3.quantile=function(t,n){var e=(t.length-1)*n+1,r=Math.floor(e),u=+t[r-1],i=e-r;return i?u+i*(t[r]-u):u},d3.shuffle=function(t){for(var n,e,r=t.length;r;)e=0|Math.random()*r--,n=t[r],t[r]=t[e],t[e]=n;return t},d3.transpose=function(t){return d3.zip.apply(d3,t)},d3.zip=function(){if(!(r=arguments.length))return[];for(var t=-1,n=d3.min(arguments,f),e=Array(n);n>++t;)for(var r,u=-1,i=e[t]=Array(r);r>++u;)i[u]=arguments[u][t];return e},d3.bisector=function(t){return{left:function(n,e,r,u){for(3>arguments.length&&(r=0),4>arguments.length&&(u=n.length);u>r;){var i=r+u>>>1;e>t.call(n,n[i],i)?r=i+1:u=i}return r},right:function(n,e,r,u){for(3>arguments.length&&(r=0),4>arguments.length&&(u=n.length);u>r;){var i=r+u>>>1;t.call(n,n[i],i)>e?u=i:r=i+1}return r}}};var Zi=d3.bisector(function(t){return t});d3.bisectLeft=Zi.left,d3.bisect=d3.bisectRight=Zi.right,d3.nest=function(){function t(n,o){if(o>=a.length)return r?r.call(u,n):e?n.sort(e):n;for(var c,l,s,f=-1,h=n.length,d=a[o++],g=new i,p={};h>++f;)(s=g.get(c=d(l=n[f])))?s.push(l):g.set(c,[l]);return g.forEach(function(n,e){p[n]=t(e,o)}),p}function n(t,e){if(e>=a.length)return t;var r,u=[],i=o[e++];for(r in t)u.push({key:r,values:n(t[r],e)});return i&&u.sort(function(t,n){return i(t.key,n.key)}),u}var e,r,u={},a=[],o=[];return u.map=function(n){return t(n,0)},u.entries=function(e){return n(t(e,0),0)},u.key=function(t){return a.push(t),u},u.sortKeys=function(t){return o[a.length-1]=t,u},u.sortValues=function(t){return e=t,u},u.rollup=function(t){return r=t,u},u},d3.keys=function(t){var n=[];for(var e in t)n.push(e);return n},d3.values=function(t){var n=[];for(var e in t)n.push(t[e]);return n},d3.entries=function(t){var n=[];for(var e in t)n.push({key:e,value:t[e]});return n},d3.permute=function(t,n){for(var e=[],r=-1,u=n.length;u>++r;)e[r]=t[n[r]];return e},d3.merge=function(t){return Array.prototype.concat.apply([],t)},d3.range=function(t,n,e){if(3>arguments.length&&(e=1,2>arguments.length&&(n=t,t=0)),1/0===(n-t)/e)throw Error("infinite range");var r,u=[],i=d(Math.abs(e)),a=-1;if(t*=i,n*=i,e*=i,0>e)for(;(r=t+e*++a)>n;)u.push(r/i);else for(;n>(r=t+e*++a);)u.push(r/i);return u},d3.requote=function(t){return t.replace(Bi,"\\$&")};var Bi=/[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;d3.round=function(t,n){return n?Math.round(t*(n=Math.pow(10,n)))/n:Math.round(t)},d3.xhr=function(t,n,e){function r(){var t=l.status;!t&&l.responseText||t>=200&&300>t||304===t?i.load.call(u,c.call(u,l)):i.error.call(u,l)}var u={},i=d3.dispatch("progress","load","error"),o={},c=a,l=new(window.XDomainRequest&&/^(http(s)?:)?\/\//.test(t)?XDomainRequest:XMLHttpRequest);return"onload"in l?l.onload=l.onerror=r:l.onreadystatechange=function(){l.readyState>3&&r()},l.onprogress=function(t){var n=d3.event;d3.event=t;try{i.progress.call(u,l)}finally{d3.event=n}},u.header=function(t,n){return t=(t+"").toLowerCase(),2>arguments.length?o[t]:(null==n?delete o[t]:o[t]=n+"",u)},u.mimeType=function(t){return arguments.length?(n=null==t?null:t+"",u):n},u.response=function(t){return c=t,u},["get","post"].forEach(function(t){u[t]=function(){return u.send.apply(u,[t].concat(Yi(arguments)))}}),u.send=function(e,r,i){if(2===arguments.length&&"function"==typeof r&&(i=r,r=null),l.open(e,t,!0),null==n||"accept"in o||(o.accept=n+",*/*"),l.setRequestHeader)for(var a in o)l.setRequestHeader(a,o[a]);return null!=n&&l.overrideMimeType&&l.overrideMimeType(n),null!=i&&u.on("error",i).on("load",function(t){i(null,t)}),l.send(null==r?null:r),u},u.abort=function(){return l.abort(),u},d3.rebind(u,i,"on"),2===arguments.length&&"function"==typeof n&&(e=n,n=null),null==e?u:u.get(g(e))},d3.text=function(){return d3.xhr.apply(d3,arguments).response(p)},d3.json=function(t,n){return d3.xhr(t,"application/json",n).response(m)},d3.html=function(t,n){return d3.xhr(t,"text/html",n).response(v)},d3.xml=function(){return d3.xhr.apply(d3,arguments).response(y)};var $i={svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};d3.ns={prefix:$i,qualify:function(t){var n=t.indexOf(":"),e=t;return n>=0&&(e=t.substring(0,n),t=t.substring(n+1)),$i.hasOwnProperty(e)?{space:$i[e],local:t}:t}},d3.dispatch=function(){for(var t=new M,n=-1,e=arguments.length;e>++n;)t[arguments[n]]=b(t);return t},M.prototype.on=function(t,n){var e=t.indexOf("."),r="";return e>0&&(r=t.substring(e+1),t=t.substring(0,e)),2>arguments.length?this[t].on(r):this[t].on(r,n)},d3.format=function(t){var n=Ji.exec(t),e=n[1]||" ",r=n[2]||">",u=n[3]||"",i=n[4]||"",a=n[5],o=+n[6],c=n[7],l=n[8],s=n[9],f=1,h="",d=!1;switch(l&&(l=+l.substring(1)),(a||"0"===e&&"="===r)&&(a=e="0",r="=",c&&(o-=Math.floor((o-1)/4))),s){case"n":c=!0,s="g";break;case"%":f=100,h="%",s="f";break;case"p":f=100,h="%",s="r";break;case"b":case"o":case"x":case"X":i&&(i="0"+s.toLowerCase());case"c":case"d":d=!0,l=0;break;case"s":f=-1,s="r"}"#"===i&&(i=""),"r"!=s||l||(s="g"),s=Gi.get(s)||_;var g=a&&c;return function(t){if(d&&t%1)return"";var n=0>t||0===t&&0>1/t?(t=-t,"-"):u;if(0>f){var p=d3.formatPrefix(t,l);t=p.scale(t),h=p.symbol}else t*=f;t=s(t,l),!a&&c&&(t=Ki(t));var m=i.length+t.length+(g?0:n.length),v=o>m?Array(m=o-m+1).join(e):"";return g&&(t=Ki(v+t)),Ci&&t.replace(".",Ci),n+=i,("<"===r?n+t+v:">"===r?v+n+t:"^"===r?v.substring(0,m>>=1)+n+t+v.substring(m):n+(g?t:v+t))+h}};var Ji=/(?:([^{])?([<>=^]))?([+\- ])?(#)?(0)?([0-9]+)?(,)?(\.[0-9]+)?([a-zA-Z%])?/,Gi=d3.map({b:function(t){return t.toString(2)},c:function(t){return String.fromCharCode(t)},o:function(t){return t.toString(8)},x:function(t){return t.toString(16)},X:function(t){return t.toString(16).toUpperCase()},g:function(t,n){return t.toPrecision(n)},e:function(t,n){return t.toExponential(n)},f:function(t,n){return t.toFixed(n)},r:function(t,n){return d3.round(t,n=x(t,n)).toFixed(Math.max(0,Math.min(20,n)))}}),Ki=a;if(Di){var Wi=Di.length;Ki=function(t){for(var n=t.lastIndexOf("."),e=n>=0?"."+t.substring(n+1):(n=t.length,""),r=[],u=0,i=Di[0];n>0&&i>0;)r.push(t.substring(n-=i,n+i)),i=Di[u=(u+1)%Wi];return r.reverse().join(zi||"")+e}}var Qi=["y","z","a","f","p","n","μ","m","","k","M","G","T","P","E","Z","Y"].map(w);d3.formatPrefix=function(t,n){var e=0;return t&&(0>t&&(t*=-1),n&&(t=d3.round(t,x(t,n))),e=1+Math.floor(1e-12+Math.log(t)/Math.LN10),e=Math.max(-24,Math.min(24,3*Math.floor((0>=e?e+1:e-1)/3)))),Qi[8+e/3]};var ta=function(){return a},na=d3.map({linear:ta,poly:q,quad:function(){return A},cubic:function(){return N},sin:function(){return C},exp:function(){return z},circle:function(){return D},elastic:L,back:F,bounce:function(){return H}}),ea=d3.map({"in":a,out:k,"in-out":E,"out-in":function(t){return E(k(t))}});d3.ease=function(t){var n=t.indexOf("-"),e=n>=0?t.substring(0,n):t,r=n>=0?t.substring(n+1):"in";return e=na.get(e)||ta,r=ea.get(r)||a,S(r(e.apply(null,Array.prototype.slice.call(arguments,1))))},d3.event=null,d3.transform=function(t){var n=document.createElementNS(d3.ns.prefix.svg,"g");return(d3.transform=function(t){n.setAttribute("transform",t);var e=n.transform.baseVal.consolidate();return new O(e?e.matrix:ra)})(t)},O.prototype.toString=function(){return"translate("+this.translate+")rotate("+this.rotate+")skewX("+this.skew+")scale("+this.scale+")"};var ra={a:1,b:0,c:0,d:1,e:0,f:0};d3.interpolate=function(t,n){for(var e,r=d3.interpolators.length;--r>=0&&!(e=d3.interpolators[r](t,n)););return e},d3.interpolateNumber=function(t,n){return n-=t,function(e){return t+n*e}},d3.interpolateRound=function(t,n){return n-=t,function(e){return Math.round(t+n*e)}},d3.interpolateString=function(t,n){var e,r,u,i,a,o=0,c=0,l=[],s=[];for(ua.lastIndex=0,r=0;e=ua.exec(n);++r)e.index&&l.push(n.substring(o,c=e.index)),s.push({i:l.length,x:e[0]}),l.push(null),o=ua.lastIndex;for(n.length>o&&l.push(n.substring(o)),r=0,i=s.length;(e=ua.exec(t))&&i>r;++r)if(a=s[r],a.x==e[0]){if(a.i)if(null==l[a.i+1])for(l[a.i-1]+=a.x,l.splice(a.i,1),u=r+1;i>u;++u)s[u].i--;else for(l[a.i-1]+=a.x+l[a.i+1],l.splice(a.i,2),u=r+1;i>u;++u)s[u].i-=2;else if(null==l[a.i+1])l[a.i]=a.x;else for(l[a.i]=a.x+l[a.i+1],l.splice(a.i+1,1),u=r+1;i>u;++u)s[u].i--;s.splice(r,1),i--,r--}else a.x=d3.interpolateNumber(parseFloat(e[0]),parseFloat(a.x));for(;i>r;)a=s.pop(),null==l[a.i+1]?l[a.i]=a.x:(l[a.i]=a.x+l[a.i+1],l.splice(a.i+1,1)),i--;return 1===l.length?null==l[0]?s[0].x:function(){return n}:function(t){for(r=0;i>r;++r)l[(a=s[r]).i]=a.x(t);return l.join("")}},d3.interpolateTransform=function(t,n){var e,r=[],u=[],i=d3.transform(t),a=d3.transform(n),o=i.translate,c=a.translate,l=i.rotate,s=a.rotate,f=i.skew,h=a.skew,d=i.scale,g=a.scale;return o[0]!=c[0]||o[1]!=c[1]?(r.push("translate(",null,",",null,")"),u.push({i:1,x:d3.interpolateNumber(o[0],c[0])},{i:3,x:d3.interpolateNumber(o[1],c[1])})):c[0]||c[1]?r.push("translate("+c+")"):r.push(""),l!=s?(l-s>180?s+=360:s-l>180&&(l+=360),u.push({i:r.push(r.pop()+"rotate(",null,")")-2,x:d3.interpolateNumber(l,s)})):s&&r.push(r.pop()+"rotate("+s+")"),f!=h?u.push({i:r.push(r.pop()+"skewX(",null,")")-2,x:d3.interpolateNumber(f,h)}):h&&r.push(r.pop()+"skewX("+h+")"),d[0]!=g[0]||d[1]!=g[1]?(e=r.push(r.pop()+"scale(",null,",",null,")"),u.push({i:e-4,x:d3.interpolateNumber(d[0],g[0])},{i:e-2,x:d3.interpolateNumber(d[1],g[1])})):(1!=g[0]||1!=g[1])&&r.push(r.pop()+"scale("+g+")"),e=u.length,function(t){for(var n,i=-1;e>++i;)r[(n=u[i]).i]=n.x(t);return r.join("")}},d3.interpolateRgb=function(t,n){t=d3.rgb(t),n=d3.rgb(n);var e=t.r,r=t.g,u=t.b,i=n.r-e,a=n.g-r,o=n.b-u;return function(t){return"#"+G(Math.round(e+i*t))+G(Math.round(r+a*t))+G(Math.round(u+o*t))}},d3.interpolateHsl=function(t,n){t=d3.hsl(t),n=d3.hsl(n);var e=t.h,r=t.s,u=t.l,i=n.h-e,a=n.s-r,o=n.l-u;return i>180?i-=360:-180>i&&(i+=360),function(t){return un(e+i*t,r+a*t,u+o*t)+""}},d3.interpolateLab=function(t,n){t=d3.lab(t),n=d3.lab(n);var e=t.l,r=t.a,u=t.b,i=n.l-e,a=n.a-r,o=n.b-u;return function(t){return fn(e+i*t,r+a*t,u+o*t)+""}},d3.interpolateHcl=function(t,n){t=d3.hcl(t),n=d3.hcl(n);var e=t.h,r=t.c,u=t.l,i=n.h-e,a=n.c-r,o=n.l-u;return i>180?i-=360:-180>i&&(i+=360),function(t){return cn(e+i*t,r+a*t,u+o*t)+""}},d3.interpolateArray=function(t,n){var e,r=[],u=[],i=t.length,a=n.length,o=Math.min(t.length,n.length);for(e=0;o>e;++e)r.push(d3.interpolate(t[e],n[e]));for(;i>e;++e)u[e]=t[e];for(;a>e;++e)u[e]=n[e];return function(t){for(e=0;o>e;++e)u[e]=r[e](t);return u}},d3.interpolateObject=function(t,n){var e,r={},u={};for(e in t)e in n?r[e]=V(e)(t[e],n[e]):u[e]=t[e];for(e in n)e in t||(u[e]=n[e]);return function(t){for(e in r)u[e]=r[e](t);return u}};var ua=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;d3.interpolators=[d3.interpolateObject,function(t,n){return n instanceof Array&&d3.interpolateArray(t,n)},function(t,n){return("string"==typeof t||"string"==typeof n)&&d3.interpolateString(t+"",n+"")},function(t,n){return("string"==typeof n?aa.has(n)||/^(#|rgb\(|hsl\()/.test(n):n instanceof B)&&d3.interpolateRgb(t,n)},function(t,n){return!isNaN(t=+t)&&!isNaN(n=+n)&&d3.interpolateNumber(t,n)}],B.prototype.toString=function(){return this.rgb()+""},d3.rgb=function(t,n,e){return 1===arguments.length?t instanceof J?$(t.r,t.g,t.b):K(""+t,$,un):$(~~t,~~n,~~e)};var ia=J.prototype=new B;ia.brighter=function(t){t=Math.pow(.7,arguments.length?t:1);var n=this.r,e=this.g,r=this.b,u=30;return n||e||r?(n&&u>n&&(n=u),e&&u>e&&(e=u),r&&u>r&&(r=u),$(Math.min(255,Math.floor(n/t)),Math.min(255,Math.floor(e/t)),Math.min(255,Math.floor(r/t)))):$(u,u,u)},ia.darker=function(t){return t=Math.pow(.7,arguments.length?t:1),$(Math.floor(t*this.r),Math.floor(t*this.g),Math.floor(t*this.b))
},ia.hsl=function(){return W(this.r,this.g,this.b)},ia.toString=function(){return"#"+G(this.r)+G(this.g)+G(this.b)};var aa=d3.map({aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"});aa.forEach(function(t,n){aa.set(t,K(n,$,un))}),d3.hsl=function(t,n,e){return 1===arguments.length?t instanceof rn?en(t.h,t.s,t.l):K(""+t,W,en):en(+t,+n,+e)};var oa=rn.prototype=new B;oa.brighter=function(t){return t=Math.pow(.7,arguments.length?t:1),en(this.h,this.s,this.l/t)},oa.darker=function(t){return t=Math.pow(.7,arguments.length?t:1),en(this.h,this.s,t*this.l)},oa.rgb=function(){return un(this.h,this.s,this.l)},d3.hcl=function(t,n,e){return 1===arguments.length?t instanceof on?an(t.h,t.c,t.l):t instanceof sn?hn(t.l,t.a,t.b):hn((t=Q((t=d3.rgb(t)).r,t.g,t.b)).l,t.a,t.b):an(+t,+n,+e)};var ca=on.prototype=new B;ca.brighter=function(t){return an(this.h,this.c,Math.min(100,this.l+la*(arguments.length?t:1)))},ca.darker=function(t){return an(this.h,this.c,Math.max(0,this.l-la*(arguments.length?t:1)))},ca.rgb=function(){return cn(this.h,this.c,this.l).rgb()},d3.lab=function(t,n,e){return 1===arguments.length?t instanceof sn?ln(t.l,t.a,t.b):t instanceof on?cn(t.l,t.c,t.h):Q((t=d3.rgb(t)).r,t.g,t.b):ln(+t,+n,+e)};var la=18,sa=.95047,fa=1,ha=1.08883,da=sn.prototype=new B;da.brighter=function(t){return ln(Math.min(100,this.l+la*(arguments.length?t:1)),this.a,this.b)},da.darker=function(t){return ln(Math.max(0,this.l-la*(arguments.length?t:1)),this.a,this.b)},da.rgb=function(){return fn(this.l,this.a,this.b)};var ga=function(t,n){return n.querySelector(t)},pa=function(t,n){return n.querySelectorAll(t)},ma=document.documentElement,va=ma.matchesSelector||ma.webkitMatchesSelector||ma.mozMatchesSelector||ma.msMatchesSelector||ma.oMatchesSelector,ya=function(t,n){return va.call(t,n)};"function"==typeof Sizzle&&(ga=function(t,n){return Sizzle(t,n)[0]||null},pa=function(t,n){return Sizzle.uniqueSort(Sizzle(t,n))},ya=Sizzle.matchesSelector);var Ma=[];d3.selection=function(){return ba},d3.selection.prototype=Ma,Ma.select=function(t){var n,e,r,u,i=[];"function"!=typeof t&&(t=vn(t));for(var a=-1,o=this.length;o>++a;){i.push(n=[]),n.parentNode=(r=this[a]).parentNode;for(var c=-1,l=r.length;l>++c;)(u=r[c])?(n.push(e=t.call(u,u.__data__,c)),e&&"__data__"in u&&(e.__data__=u.__data__)):n.push(null)}return mn(i)},Ma.selectAll=function(t){var n,e,r=[];"function"!=typeof t&&(t=yn(t));for(var u=-1,i=this.length;i>++u;)for(var a=this[u],o=-1,c=a.length;c>++o;)(e=a[o])&&(r.push(n=Yi(t.call(e,e.__data__,o))),n.parentNode=e);return mn(r)},Ma.attr=function(t,n){if(2>arguments.length){if("string"==typeof t){var e=this.node();return t=d3.ns.qualify(t),t.local?e.getAttributeNS(t.space,t.local):e.getAttribute(t)}for(n in t)this.each(Mn(n,t[n]));return this}return this.each(Mn(t,n))},Ma.classed=function(t,n){if(2>arguments.length){if("string"==typeof t){var e=this.node(),r=(t=t.trim().split(/^|\s+/g)).length,u=-1;if(n=e.classList){for(;r>++u;)if(!n.contains(t[u]))return!1}else for(n=e.className,null!=n.baseVal&&(n=n.baseVal);r>++u;)if(!bn(t[u]).test(n))return!1;return!0}for(n in t)this.each(xn(n,t[n]));return this}return this.each(xn(t,n))},Ma.style=function(t,n,e){var r=arguments.length;if(3>r){if("string"!=typeof t){2>r&&(n="");for(e in t)this.each(wn(e,t[e],n));return this}if(2>r)return getComputedStyle(this.node(),null).getPropertyValue(t);e=""}return this.each(wn(t,n,e))},Ma.property=function(t,n){if(2>arguments.length){if("string"==typeof t)return this.node()[t];for(n in t)this.each(Sn(n,t[n]));return this}return this.each(Sn(t,n))},Ma.text=function(t){return arguments.length?this.each("function"==typeof t?function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}:null==t?function(){this.textContent=""}:function(){this.textContent=t}):this.node().textContent},Ma.html=function(t){return arguments.length?this.each("function"==typeof t?function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}:null==t?function(){this.innerHTML=""}:function(){this.innerHTML=t}):this.node().innerHTML},Ma.append=function(t){function n(){return this.appendChild(document.createElementNS(this.namespaceURI,t))}function e(){return this.appendChild(document.createElementNS(t.space,t.local))}return t=d3.ns.qualify(t),this.select(t.local?e:n)},Ma.insert=function(t,n){function e(){return this.insertBefore(document.createElementNS(this.namespaceURI,t),ga(n,this))}function r(){return this.insertBefore(document.createElementNS(t.space,t.local),ga(n,this))}return t=d3.ns.qualify(t),this.select(t.local?r:e)},Ma.remove=function(){return this.each(function(){var t=this.parentNode;t&&t.removeChild(this)})},Ma.data=function(t,n){function e(t,e){var r,u,a,o=t.length,f=e.length,h=Math.min(o,f),d=Math.max(o,f),g=[],p=[],m=[];if(n){var v,y=new i,M=[],b=e.length;for(r=-1;o>++r;)v=n.call(u=t[r],u.__data__,r),y.has(v)?m[b++]=u:y.set(v,u),M.push(v);for(r=-1;f>++r;)v=n.call(e,a=e[r],r),y.has(v)?(g[r]=u=y.get(v),u.__data__=a,p[r]=m[r]=null):(p[r]=kn(a),g[r]=m[r]=null),y.remove(v);for(r=-1;o>++r;)y.has(M[r])&&(m[r]=t[r])}else{for(r=-1;h>++r;)u=t[r],a=e[r],u?(u.__data__=a,g[r]=u,p[r]=m[r]=null):(p[r]=kn(a),g[r]=m[r]=null);for(;f>r;++r)p[r]=kn(e[r]),g[r]=m[r]=null;for(;d>r;++r)m[r]=t[r],p[r]=g[r]=null}p.update=g,p.parentNode=g.parentNode=m.parentNode=t.parentNode,c.push(p),l.push(g),s.push(m)}var r,u,a=-1,o=this.length;if(!arguments.length){for(t=Array(o=(r=this[0]).length);o>++a;)(u=r[a])&&(t[a]=u.__data__);return t}var c=qn([]),l=mn([]),s=mn([]);if("function"==typeof t)for(;o>++a;)e(r=this[a],t.call(r,r.parentNode.__data__,a));else for(;o>++a;)e(r=this[a],t);return l.enter=function(){return c},l.exit=function(){return s},l},Ma.datum=function(t){return arguments.length?this.property("__data__",t):this.property("__data__")},Ma.filter=function(t){var n,e,r,u=[];"function"!=typeof t&&(t=En(t));for(var i=0,a=this.length;a>i;i++){u.push(n=[]),n.parentNode=(e=this[i]).parentNode;for(var o=0,c=e.length;c>o;o++)(r=e[o])&&t.call(r,r.__data__,o)&&n.push(r)}return mn(u)},Ma.order=function(){for(var t=-1,n=this.length;n>++t;)for(var e,r=this[t],u=r.length-1,i=r[u];--u>=0;)(e=r[u])&&(i&&i!==e.nextSibling&&i.parentNode.insertBefore(e,i),i=e);return this},Ma.sort=function(t){t=An.apply(this,arguments);for(var n=-1,e=this.length;e>++n;)this[n].sort(t);return this.order()},Ma.on=function(t,n,e){var r=arguments.length;if(3>r){if("string"!=typeof t){2>r&&(n=!1);for(e in t)this.each(Nn(e,t[e],n));return this}if(2>r)return(r=this.node()["__on"+t])&&r._;e=!1}return this.each(Nn(t,n,e))},Ma.each=function(t){return Tn(this,function(n,e,r){t.call(n,n.__data__,e,r)})},Ma.call=function(t){var n=Yi(arguments);return t.apply(n[0]=this,n),this},Ma.empty=function(){return!this.node()},Ma.node=function(){for(var t=0,n=this.length;n>t;t++)for(var e=this[t],r=0,u=e.length;u>r;r++){var i=e[r];if(i)return i}return null},Ma.transition=function(){var t,n,e=_a||++Sa,r=[],u=Object.create(ka);u.time=Date.now();for(var i=-1,a=this.length;a>++i;){r.push(t=[]);for(var o=this[i],c=-1,l=o.length;l>++c;)(n=o[c])&&zn(n,c,e,u),t.push(n)}return Cn(r,e)};var ba=mn([[document]]);ba[0].parentNode=ma,d3.select=function(t){return"string"==typeof t?ba.select(t):mn([[t]])},d3.selectAll=function(t){return"string"==typeof t?ba.selectAll(t):mn([Yi(t)])};var xa=[];d3.selection.enter=qn,d3.selection.enter.prototype=xa,xa.append=Ma.append,xa.insert=Ma.insert,xa.empty=Ma.empty,xa.node=Ma.node,xa.select=function(t){for(var n,e,r,u,i,a=[],o=-1,c=this.length;c>++o;){r=(u=this[o]).update,a.push(n=[]),n.parentNode=u.parentNode;for(var l=-1,s=u.length;s>++l;)(i=u[l])?(n.push(r[l]=e=t.call(u.parentNode,i.__data__,l)),e.__data__=i.__data__):n.push(null)}return mn(a)};var _a,wa=[],Sa=0,ka={ease:T,delay:0,duration:250};wa.call=Ma.call,wa.empty=Ma.empty,wa.node=Ma.node,d3.transition=function(t){return arguments.length?_a?t.transition():t:ba.transition()},d3.transition.prototype=wa,wa.select=function(t){var n,e,r,u=this.id,i=[];"function"!=typeof t&&(t=vn(t));for(var a=-1,o=this.length;o>++a;){i.push(n=[]);for(var c=this[a],l=-1,s=c.length;s>++l;)(r=c[l])&&(e=t.call(r,r.__data__,l))?("__data__"in r&&(e.__data__=r.__data__),zn(e,l,u,r.__transition__[u]),n.push(e)):n.push(null)}return Cn(i,u)},wa.selectAll=function(t){var n,e,r,u,i,a=this.id,o=[];"function"!=typeof t&&(t=yn(t));for(var c=-1,l=this.length;l>++c;)for(var s=this[c],f=-1,h=s.length;h>++f;)if(r=s[f]){i=r.__transition__[a],e=t.call(r,r.__data__,f),o.push(n=[]);for(var d=-1,g=e.length;g>++d;)zn(u=e[d],d,a,i),n.push(u)}return Cn(o,a)},wa.filter=function(t){var n,e,r,u=[];"function"!=typeof t&&(t=En(t));for(var i=0,a=this.length;a>i;i++){u.push(n=[]);for(var e=this[i],o=0,c=e.length;c>o;o++)(r=e[o])&&t.call(r,r.__data__,o)&&n.push(r)}return Cn(u,this.id,this.time).ease(this.ease())},wa.attr=function(t,n){function e(){this.removeAttribute(i)}function r(){this.removeAttributeNS(i.space,i.local)}if(2>arguments.length){for(n in t)this.attr(n,t[n]);return this}var u=V(t),i=d3.ns.qualify(t);return Ln(this,"attr."+t,n,function(t){function n(){var n,e=this.getAttribute(i);return e!==t&&(n=u(e,t),function(t){this.setAttribute(i,n(t))})}function a(){var n,e=this.getAttributeNS(i.space,i.local);return e!==t&&(n=u(e,t),function(t){this.setAttributeNS(i.space,i.local,n(t))})}return null==t?i.local?r:e:(t+="",i.local?a:n)})},wa.attrTween=function(t,n){function e(t,e){var r=n.call(this,t,e,this.getAttribute(u));return r&&function(t){this.setAttribute(u,r(t))}}function r(t,e){var r=n.call(this,t,e,this.getAttributeNS(u.space,u.local));return r&&function(t){this.setAttributeNS(u.space,u.local,r(t))}}var u=d3.ns.qualify(t);return this.tween("attr."+t,u.local?r:e)},wa.style=function(t,n,e){function r(){this.style.removeProperty(t)}var u=arguments.length;if(3>u){if("string"!=typeof t){2>u&&(n="");for(e in t)this.style(e,t[e],n);return this}e=""}var i=V(t);return Ln(this,"style."+t,n,function(n){function u(){var r,u=getComputedStyle(this,null).getPropertyValue(t);return u!==n&&(r=i(u,n),function(n){this.style.setProperty(t,r(n),e)})}return null==n?r:(n+="",u)})},wa.styleTween=function(t,n,e){return 3>arguments.length&&(e=""),this.tween("style."+t,function(r,u){var i=n.call(this,r,u,getComputedStyle(this,null).getPropertyValue(t));return i&&function(n){this.style.setProperty(t,i(n),e)}})},wa.text=function(t){return Ln(this,"text",t,Dn)},wa.remove=function(){return this.each("end.transition",function(){var t;!this.__transition__&&(t=this.parentNode)&&t.removeChild(this)})},wa.ease=function(t){var n=this.id;return 1>arguments.length?this.node().__transition__[n].ease:("function"!=typeof t&&(t=d3.ease.apply(d3,arguments)),Tn(this,function(e){e.__transition__[n].ease=t}))},wa.delay=function(t){var n=this.id;return Tn(this,"function"==typeof t?function(e,r,u){e.__transition__[n].delay=0|t.call(e,e.__data__,r,u)}:(t|=0,function(e){e.__transition__[n].delay=t}))},wa.duration=function(t){var n=this.id;return Tn(this,"function"==typeof t?function(e,r,u){e.__transition__[n].duration=Math.max(1,0|t.call(e,e.__data__,r,u))}:(t=Math.max(1,0|t),function(e){e.__transition__[n].duration=t}))},wa.each=function(t,n){var e=this.id;if(2>arguments.length){var r=ka,u=_a;_a=e,Tn(this,function(n,r,u){ka=n.__transition__[e],t.call(n,n.__data__,r,u)}),ka=r,_a=u}else Tn(this,function(r){r.__transition__[e].event.on(t,n)});return this},wa.transition=function(){for(var t,n,e,r,u=this.id,i=++Sa,a=[],o=0,c=this.length;c>o;o++){a.push(t=[]);for(var n=this[o],l=0,s=n.length;s>l;l++)(e=n[l])&&(r=Object.create(e.__transition__[u]),r.delay+=r.duration,zn(e,l,i,r)),t.push(e)}return Cn(a,i)},wa.tween=function(t,n){var e=this.id;return 2>arguments.length?this.node().__transition__[e].tween.get(t):Tn(this,null==n?function(n){n.__transition__[e].tween.remove(t)}:function(r){r.__transition__[e].tween.set(t,n)})};var Ea,Aa,Na=0,Ta={},qa=null;d3.timer=function(t,n,e){if(3>arguments.length){if(2>arguments.length)n=0;else if(!isFinite(n))return;e=Date.now()}var r=Ta[t.id];r&&r.callback===t?(r.then=e,r.delay=n):Ta[t.id=++Na]=qa={callback:t,then:e,delay:n,next:qa},Ea||(Aa=clearTimeout(Aa),Ea=1,Ca(Fn))},d3.timer.flush=function(){for(var t,n=Date.now(),e=qa;e;)t=n-e.then,e.delay||(e.flush=e.callback(t)),e=e.next;Hn()};var Ca=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){setTimeout(t,17)};d3.mouse=function(t){return Rn(t,P())};var za=/WebKit/.test(navigator.userAgent)?-1:0;d3.touches=function(t,n){return 2>arguments.length&&(n=P().touches),n?Yi(n).map(function(n){var e=Rn(t,n);return e.identifier=n.identifier,e}):[]},d3.scale={},d3.scale.linear=function(){return In([0,1],[0,1],d3.interpolate,!1)},d3.scale.log=function(){return Kn(d3.scale.linear(),Wn)};var Da=d3.format(".0e");Wn.pow=function(t){return Math.pow(10,t)},Qn.pow=function(t){return-Math.pow(10,-t)},d3.scale.pow=function(){return te(d3.scale.linear(),1)},d3.scale.sqrt=function(){return d3.scale.pow().exponent(.5)},d3.scale.ordinal=function(){return ee([],{t:"range",a:[[]]})},d3.scale.category10=function(){return d3.scale.ordinal().range(La)},d3.scale.category20=function(){return d3.scale.ordinal().range(Fa)},d3.scale.category20b=function(){return d3.scale.ordinal().range(Ha)},d3.scale.category20c=function(){return d3.scale.ordinal().range(Ra)};var La=["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"],Fa=["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5"],Ha=["#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6"],Ra=["#3182bd","#6baed6","#9ecae1","#c6dbef","#e6550d","#fd8d3c","#fdae6b","#fdd0a2","#31a354","#74c476","#a1d99b","#c7e9c0","#756bb1","#9e9ac8","#bcbddc","#dadaeb","#636363","#969696","#bdbdbd","#d9d9d9"];d3.scale.quantile=function(){return re([],[])},d3.scale.quantize=function(){return ue(0,1,[0,1])},d3.scale.threshold=function(){return ie([.5],[0,1])},d3.scale.identity=function(){return ae([0,1])},d3.svg={},d3.svg.arc=function(){function t(){var t=n.apply(this,arguments),i=e.apply(this,arguments),a=r.apply(this,arguments)+Pa,o=u.apply(this,arguments)+Pa,c=(a>o&&(c=a,a=o,o=c),o-a),l=Ri>c?"0":"1",s=Math.cos(a),f=Math.sin(a),h=Math.cos(o),d=Math.sin(o);return c>=ja?t?"M0,"+i+"A"+i+","+i+" 0 1,1 0,"+-i+"A"+i+","+i+" 0 1,1 0,"+i+"M0,"+t+"A"+t+","+t+" 0 1,0 0,"+-t+"A"+t+","+t+" 0 1,0 0,"+t+"Z":"M0,"+i+"A"+i+","+i+" 0 1,1 0,"+-i+"A"+i+","+i+" 0 1,1 0,"+i+"Z":t?"M"+i*s+","+i*f+"A"+i+","+i+" 0 "+l+",1 "+i*h+","+i*d+"L"+t*h+","+t*d+"A"+t+","+t+" 0 "+l+",0 "+t*s+","+t*f+"Z":"M"+i*s+","+i*f+"A"+i+","+i+" 0 "+l+",1 "+i*h+","+i*d+"L0,0"+"Z"}var n=oe,e=ce,r=le,u=se;return t.innerRadius=function(e){return arguments.length?(n=c(e),t):n},t.outerRadius=function(n){return arguments.length?(e=c(n),t):e},t.startAngle=function(n){return arguments.length?(r=c(n),t):r},t.endAngle=function(n){return arguments.length?(u=c(n),t):u},t.centroid=function(){var t=(n.apply(this,arguments)+e.apply(this,arguments))/2,i=(r.apply(this,arguments)+u.apply(this,arguments))/2+Pa;return[Math.cos(i)*t,Math.sin(i)*t]},t};var Pa=-Ri/2,ja=2*Ri-1e-6;d3.svg.line=function(){return fe(a)};var Oa=d3.map({linear:ge,"linear-closed":pe,"step-before":me,"step-after":ve,basis:we,"basis-open":Se,"basis-closed":ke,bundle:Ee,cardinal:be,"cardinal-open":ye,"cardinal-closed":Me,monotone:ze});Oa.forEach(function(t,n){n.key=t,n.closed=/-closed$/.test(t)});var Ya=[0,2/3,1/3,0],Ua=[0,1/3,2/3,0],Ia=[0,1/6,2/3,1/6];d3.svg.line.radial=function(){var t=fe(De);return t.radius=t.x,delete t.x,t.angle=t.y,delete t.y,t},me.reverse=ve,ve.reverse=me,d3.svg.area=function(){return Le(a)},d3.svg.area.radial=function(){var t=Le(De);return t.radius=t.x,delete t.x,t.innerRadius=t.x0,delete t.x0,t.outerRadius=t.x1,delete t.x1,t.angle=t.y,delete t.y,t.startAngle=t.y0,delete t.y0,t.endAngle=t.y1,delete t.y1,t},d3.svg.chord=function(){function e(t,n){var e=r(this,o,t,n),c=r(this,l,t,n);return"M"+e.p0+i(e.r,e.p1,e.a1-e.a0)+(u(e,c)?a(e.r,e.p1,e.r,e.p0):a(e.r,e.p1,c.r,c.p0)+i(c.r,c.p1,c.a1-c.a0)+a(c.r,c.p1,e.r,e.p0))+"Z"}function r(t,n,e,r){var u=n.call(t,e,r),i=s.call(t,u,r),a=f.call(t,u,r)+Pa,o=h.call(t,u,r)+Pa;return{r:i,a0:a,a1:o,p0:[i*Math.cos(a),i*Math.sin(a)],p1:[i*Math.cos(o),i*Math.sin(o)]}}function u(t,n){return t.a0==n.a0&&t.a1==n.a1}function i(t,n,e){return"A"+t+","+t+" 0 "+ +(e>Ri)+",1 "+n}function a(t,n,e,r){return"Q 0,0 "+r}var o=n,l=t,s=Fe,f=le,h=se;return e.radius=function(t){return arguments.length?(s=c(t),e):s},e.source=function(t){return arguments.length?(o=c(t),e):o},e.target=function(t){return arguments.length?(l=c(t),e):l},e.startAngle=function(t){return arguments.length?(f=c(t),e):f},e.endAngle=function(t){return arguments.length?(h=c(t),e):h},e},d3.svg.diagonal=function(){function e(t,n){var e=r.call(this,t,n),a=u.call(this,t,n),o=(e.y+a.y)/2,c=[e,{x:e.x,y:o},{x:a.x,y:o},a];return c=c.map(i),"M"+c[0]+"C"+c[1]+" "+c[2]+" "+c[3]}var r=n,u=t,i=He;return e.source=function(t){return arguments.length?(r=c(t),e):r},e.target=function(t){return arguments.length?(u=c(t),e):u},e.projection=function(t){return arguments.length?(i=t,e):i},e},d3.svg.diagonal.radial=function(){var t=d3.svg.diagonal(),n=He,e=t.projection;return t.projection=function(t){return arguments.length?e(Re(n=t)):n},t},d3.svg.symbol=function(){function t(t,r){return(Va.get(n.call(this,t,r))||Oe)(e.call(this,t,r))}var n=je,e=Pe;return t.type=function(e){return arguments.length?(n=c(e),t):n},t.size=function(n){return arguments.length?(e=c(n),t):e},t};var Va=d3.map({circle:Oe,cross:function(t){var n=Math.sqrt(t/5)/2;return"M"+-3*n+","+-n+"H"+-n+"V"+-3*n+"H"+n+"V"+-n+"H"+3*n+"V"+n+"H"+n+"V"+3*n+"H"+-n+"V"+n+"H"+-3*n+"Z"},diamond:function(t){var n=Math.sqrt(t/(2*Za)),e=n*Za;return"M0,"+-n+"L"+e+",0"+" 0,"+n+" "+-e+",0"+"Z"},square:function(t){var n=Math.sqrt(t)/2;return"M"+-n+","+-n+"L"+n+","+-n+" "+n+","+n+" "+-n+","+n+"Z"},"triangle-down":function(t){var n=Math.sqrt(t/Xa),e=n*Xa/2;return"M0,"+e+"L"+n+","+-e+" "+-n+","+-e+"Z"},"triangle-up":function(t){var n=Math.sqrt(t/Xa),e=n*Xa/2;return"M0,"+-e+"L"+n+","+e+" "+-n+","+e+"Z"}});d3.svg.symbolTypes=Va.keys();var Xa=Math.sqrt(3),Za=Math.tan(30*ji);d3.svg.axis=function(){function t(t){t.each(function(){var t,f=d3.select(this),h=null==l?e.ticks?e.ticks.apply(e,c):e.domain():l,d=null==n?e.tickFormat?e.tickFormat.apply(e,c):String:n,g=Ie(e,h,s),p=f.selectAll(".minor").data(g,String),m=p.enter().insert("line","g").attr("class","tick minor").style("opacity",1e-6),v=d3.transition(p.exit()).style("opacity",1e-6).remove(),y=d3.transition(p).style("opacity",1),M=f.selectAll("g").data(h,String),b=M.enter().insert("g","path").style("opacity",1e-6),x=d3.transition(M.exit()).style("opacity",1e-6).remove(),_=d3.transition(M).style("opacity",1),w=On(e),S=f.selectAll(".domain").data([0]),k=d3.transition(S),E=e.copy(),A=this.__chart__||E;this.__chart__=E,S.enter().append("path").attr("class","domain"),b.append("line").attr("class","tick"),b.append("text");var N=b.select("line"),T=_.select("line"),q=M.select("text").text(d),C=b.select("text"),z=_.select("text");switch(r){case"bottom":t=Ye,m.attr("y2",i),y.attr("x2",0).attr("y2",i),N.attr("y2",u),C.attr("y",Math.max(u,0)+o),T.attr("x2",0).attr("y2",u),z.attr("x",0).attr("y",Math.max(u,0)+o),q.attr("dy",".71em").style("text-anchor","middle"),k.attr("d","M"+w[0]+","+a+"V0H"+w[1]+"V"+a);break;case"top":t=Ye,m.attr("y2",-i),y.attr("x2",0).attr("y2",-i),N.attr("y2",-u),C.attr("y",-(Math.max(u,0)+o)),T.attr("x2",0).attr("y2",-u),z.attr("x",0).attr("y",-(Math.max(u,0)+o)),q.attr("dy","0em").style("text-anchor","middle"),k.attr("d","M"+w[0]+","+-a+"V0H"+w[1]+"V"+-a);break;case"left":t=Ue,m.attr("x2",-i),y.attr("x2",-i).attr("y2",0),N.attr("x2",-u),C.attr("x",-(Math.max(u,0)+o)),T.attr("x2",-u).attr("y2",0),z.attr("x",-(Math.max(u,0)+o)).attr("y",0),q.attr("dy",".32em").style("text-anchor","end"),k.attr("d","M"+-a+","+w[0]+"H0V"+w[1]+"H"+-a);break;case"right":t=Ue,m.attr("x2",i),y.attr("x2",i).attr("y2",0),N.attr("x2",u),C.attr("x",Math.max(u,0)+o),T.attr("x2",u).attr("y2",0),z.attr("x",Math.max(u,0)+o).attr("y",0),q.attr("dy",".32em").style("text-anchor","start"),k.attr("d","M"+a+","+w[0]+"H0V"+w[1]+"H"+a)}if(e.ticks)b.call(t,A),_.call(t,E),x.call(t,E),m.call(t,A),y.call(t,E),v.call(t,E);else{var D=E.rangeBand()/2,L=function(t){return E(t)+D};b.call(t,L),_.call(t,L)}})}var n,e=d3.scale.linear(),r="bottom",u=6,i=6,a=6,o=3,c=[10],l=null,s=0;return t.scale=function(n){return arguments.length?(e=n,t):e},t.orient=function(n){return arguments.length?(r=n,t):r},t.ticks=function(){return arguments.length?(c=arguments,t):c},t.tickValues=function(n){return arguments.length?(l=n,t):l},t.tickFormat=function(e){return arguments.length?(n=e,t):n},t.tickSize=function(n,e){if(!arguments.length)return u;var r=arguments.length-1;return u=+n,i=r>1?+e:u,a=r>0?+arguments[r]:u,t},t.tickPadding=function(n){return arguments.length?(o=+n,t):o},t.tickSubdivide=function(n){return arguments.length?(s=+n,t):s},t},d3.svg.brush=function(){function t(i){i.each(function(){var i,a=d3.select(this),s=a.selectAll(".background").data([0]),f=a.selectAll(".extent").data([0]),h=a.selectAll(".resize").data(l,String);a.style("pointer-events","all").on("mousedown.brush",u).on("touchstart.brush",u),s.enter().append("rect").attr("class","background").style("visibility","hidden").style("cursor","crosshair"),f.enter().append("rect").attr("class","extent").style("cursor","move"),h.enter().append("g").attr("class",function(t){return"resize "+t}).style("cursor",function(t){return Ba[t]}).append("rect").attr("x",function(t){return/[ew]$/.test(t)?-3:null}).attr("y",function(t){return/^[ns]/.test(t)?-3:null}).attr("width",6).attr("height",6).style("visibility","hidden"),h.style("display",t.empty()?"none":null),h.exit().remove(),o&&(i=On(o),s.attr("x",i[0]).attr("width",i[1]-i[0]),e(a)),c&&(i=On(c),s.attr("y",i[0]).attr("height",i[1]-i[0]),r(a)),n(a)})}function n(t){t.selectAll(".resize").attr("transform",function(t){return"translate("+s[+/e$/.test(t)][0]+","+s[+/^s/.test(t)][1]+")"})}function e(t){t.select(".extent").attr("x",s[0][0]),t.selectAll(".extent,.n>rect,.s>rect").attr("width",s[1][0]-s[0][0])}function r(t){t.select(".extent").attr("y",s[0][1]),t.selectAll(".extent,.e>rect,.w>rect").attr("height",s[1][1]-s[0][1])}function u(){function u(){var t=d3.event.changedTouches;return t?d3.touches(v,t)[0]:d3.mouse(v)}function l(){32==d3.event.keyCode&&(S||(p=null,k[0]-=s[1][0],k[1]-=s[1][1],S=2),R())}function f(){32==d3.event.keyCode&&2==S&&(k[0]+=s[1][0],k[1]+=s[1][1],S=0,R())}function h(){var t=u(),i=!1;m&&(t[0]+=m[0],t[1]+=m[1]),S||(d3.event.altKey?(p||(p=[(s[0][0]+s[1][0])/2,(s[0][1]+s[1][1])/2]),k[0]=s[+(t[0]<p[0])][0],k[1]=s[+(t[1]<p[1])][1]):p=null),_&&d(t,o,0)&&(e(b),i=!0),w&&d(t,c,1)&&(r(b),i=!0),i&&(n(b),M({type:"brush",mode:S?"move":"resize"}))}function d(t,n,e){var r,u,a=On(n),o=a[0],c=a[1],l=k[e],f=s[1][e]-s[0][e];return S&&(o-=l,c-=f+l),r=Math.max(o,Math.min(c,t[e])),S?u=(r+=l)+f:(p&&(l=Math.max(o,Math.min(c,2*p[e]-r))),r>l?(u=r,r=l):u=l),s[0][e]!==r||s[1][e]!==u?(i=null,s[0][e]=r,s[1][e]=u,!0):void 0}function g(){h(),b.style("pointer-events","all").selectAll(".resize").style("display",t.empty()?"none":null),d3.select("body").style("cursor",null),E.on("mousemove.brush",null).on("mouseup.brush",null).on("touchmove.brush",null).on("touchend.brush",null).on("keydown.brush",null).on("keyup.brush",null),M({type:"brushend"}),R()}var p,m,v=this,y=d3.select(d3.event.target),M=a.of(v,arguments),b=d3.select(v),x=y.datum(),_=!/^(n|s)$/.test(x)&&o,w=!/^(e|w)$/.test(x)&&c,S=y.classed("extent"),k=u(),E=d3.select(window).on("mousemove.brush",h).on("mouseup.brush",g).on("touchmove.brush",h).on("touchend.brush",g).on("keydown.brush",l).on("keyup.brush",f);if(S)k[0]=s[0][0]-k[0],k[1]=s[0][1]-k[1];else if(x){var A=+/w$/.test(x),N=+/^n/.test(x);m=[s[1-A][0]-k[0],s[1-N][1]-k[1]],k[0]=s[A][0],k[1]=s[N][1]}else d3.event.altKey&&(p=k.slice());b.style("pointer-events","none").selectAll(".resize").style("display",null),d3.select("body").style("cursor",y.style("cursor")),M({type:"brushstart"}),h(),R()}var i,a=j(t,"brushstart","brush","brushend"),o=null,c=null,l=$a[0],s=[[0,0],[0,0]];return t.x=function(n){return arguments.length?(o=n,l=$a[!o<<1|!c],t):o},t.y=function(n){return arguments.length?(c=n,l=$a[!o<<1|!c],t):c},t.extent=function(n){var e,r,u,a,l;return arguments.length?(i=[[0,0],[0,0]],o&&(e=n[0],r=n[1],c&&(e=e[0],r=r[0]),i[0][0]=e,i[1][0]=r,o.invert&&(e=o(e),r=o(r)),e>r&&(l=e,e=r,r=l),s[0][0]=0|e,s[1][0]=0|r),c&&(u=n[0],a=n[1],o&&(u=u[1],a=a[1]),i[0][1]=u,i[1][1]=a,c.invert&&(u=c(u),a=c(a)),u>a&&(l=u,u=a,a=l),s[0][1]=0|u,s[1][1]=0|a),t):(n=i||s,o&&(e=n[0][0],r=n[1][0],i||(e=s[0][0],r=s[1][0],o.invert&&(e=o.invert(e),r=o.invert(r)),e>r&&(l=e,e=r,r=l))),c&&(u=n[0][1],a=n[1][1],i||(u=s[0][1],a=s[1][1],c.invert&&(u=c.invert(u),a=c.invert(a)),u>a&&(l=u,u=a,a=l))),o&&c?[[e,u],[r,a]]:o?[e,r]:c&&[u,a])},t.clear=function(){return i=null,s[0][0]=s[0][1]=s[1][0]=s[1][1]=0,t},t.empty=function(){return o&&s[0][0]===s[1][0]||c&&s[0][1]===s[1][1]},d3.rebind(t,a,"on")};var Ba={n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},$a=[["n","e","s","w","nw","ne","se","sw"],["e","w"],["n","s"],[]];d3.behavior={},d3.behavior.drag=function(){function t(){this.on("mousedown.drag",n).on("touchstart.drag",n)}function n(){function t(){var t=o.parentNode;return null!=s?d3.touches(t).filter(function(t){return t.identifier===s})[0]:d3.mouse(t)}function n(){if(!o.parentNode)return u();var n=t(),e=n[0]-f[0],r=n[1]-f[1];h|=e|r,f=n,R(),c({type:"drag",x:n[0]+a[0],y:n[1]+a[1],dx:e,dy:r})}function u(){c({type:"dragend"}),h&&(R(),d3.event.target===l&&d.on("click.drag",i,!0)),d.on(null!=s?"touchmove.drag-"+s:"mousemove.drag",null).on(null!=s?"touchend.drag-"+s:"mouseup.drag",null)}function i(){R(),d.on("click.drag",null)}var a,o=this,c=e.of(o,arguments),l=d3.event.target,s=d3.event.touches?d3.event.changedTouches[0].identifier:null,f=t(),h=0,d=d3.select(window).on(null!=s?"touchmove.drag-"+s:"mousemove.drag",n).on(null!=s?"touchend.drag-"+s:"mouseup.drag",u,!0);r?(a=r.apply(o,arguments),a=[a.x-f[0],a.y-f[1]]):a=[0,0],null==s&&R(),c({type:"dragstart"})}var e=j(t,"drag","dragstart","dragend"),r=null;return t.origin=function(n){return arguments.length?(r=n,t):r},d3.rebind(t,e,"on")},d3.behavior.zoom=function(){function t(){this.on("mousedown.zoom",o).on("mousewheel.zoom",c).on("mousemove.zoom",l).on("DOMMouseScroll.zoom",c).on("dblclick.zoom",s).on("touchstart.zoom",f).on("touchmove.zoom",h).on("touchend.zoom",f)}function n(t){return[(t[0]-b[0])/x,(t[1]-b[1])/x]}function e(t){return[t[0]*x+b[0],t[1]*x+b[1]]}function r(t){x=Math.max(_[0],Math.min(_[1],t))}function u(t,n){n=e(n),b[0]+=t[0]-n[0],b[1]+=t[1]-n[1]}function i(){m&&m.domain(p.range().map(function(t){return(t-b[0])/x}).map(p.invert)),y&&y.domain(v.range().map(function(t){return(t-b[1])/x}).map(v.invert))}function a(t){i(),d3.event.preventDefault(),t({type:"zoom",scale:x,translate:b})}function o(){function t(){l=1,u(d3.mouse(i),f),a(o)}function e(){l&&R(),s.on("mousemove.zoom",null).on("mouseup.zoom",null),l&&d3.event.target===c&&s.on("click.zoom",r,!0)}function r(){R(),s.on("click.zoom",null)}var i=this,o=w.of(i,arguments),c=d3.event.target,l=0,s=d3.select(window).on("mousemove.zoom",t).on("mouseup.zoom",e),f=n(d3.mouse(i));window.focus(),R()}function c(){d||(d=n(d3.mouse(this))),r(Math.pow(2,.002*Ve())*x),u(d3.mouse(this),d),a(w.of(this,arguments))}function l(){d=null}function s(){var t=d3.mouse(this),e=n(t),i=Math.log(x)/Math.LN2;r(Math.pow(2,d3.event.shiftKey?Math.ceil(i)-1:Math.floor(i)+1)),u(t,e),a(w.of(this,arguments))}function f(){var t=d3.touches(this),e=Date.now();if(g=x,d={},t.forEach(function(t){d[t.identifier]=n(t)}),R(),1===t.length){if(500>e-M){var i=t[0],o=n(t[0]);r(2*x),u(i,o),a(w.of(this,arguments))}M=e}}function h(){var t=d3.touches(this),n=t[0],e=d[n.identifier];if(i=t[1]){var i,o=d[i.identifier];n=[(n[0]+i[0])/2,(n[1]+i[1])/2],e=[(e[0]+o[0])/2,(e[1]+o[1])/2],r(d3.event.scale*g)}u(n,e),M=null,a(w.of(this,arguments))}var d,g,p,m,v,y,M,b=[0,0],x=1,_=Ga,w=j(t,"zoom");return t.translate=function(n){return arguments.length?(b=n.map(Number),i(),t):b},t.scale=function(n){return arguments.length?(x=+n,i(),t):x},t.scaleExtent=function(n){return arguments.length?(_=null==n?Ga:n.map(Number),t):_},t.x=function(n){return arguments.length?(m=n,p=n.copy(),b=[0,0],x=1,t):m},t.y=function(n){return arguments.length?(y=n,v=n.copy(),b=[0,0],x=1,t):y},d3.rebind(t,w,"on")};var Ja,Ga=[0,1/0];d3.layout={},d3.layout.bundle=function(){return function(t){for(var n=[],e=-1,r=t.length;r>++e;)n.push(Xe(t[e]));return n}},d3.layout.chord=function(){function t(){var t,l,f,h,d,g={},p=[],m=d3.range(i),v=[];for(e=[],r=[],t=0,h=-1;i>++h;){for(l=0,d=-1;i>++d;)l+=u[h][d];p.push(l),v.push(d3.range(i)),t+=l}for(a&&m.sort(function(t,n){return a(p[t],p[n])
}),o&&v.forEach(function(t,n){t.sort(function(t,e){return o(u[n][t],u[n][e])})}),t=(2*Ri-s*i)/t,l=0,h=-1;i>++h;){for(f=l,d=-1;i>++d;){var y=m[h],M=v[y][d],b=u[y][M],x=l,_=l+=b*t;g[y+"-"+M]={index:y,subindex:M,startAngle:x,endAngle:_,value:b}}r[y]={index:y,startAngle:f,endAngle:l,value:(l-f)/t},l+=s}for(h=-1;i>++h;)for(d=h-1;i>++d;){var w=g[h+"-"+d],S=g[d+"-"+h];(w.value||S.value)&&e.push(w.value<S.value?{source:S,target:w}:{source:w,target:S})}c&&n()}function n(){e.sort(function(t,n){return c((t.source.value+t.target.value)/2,(n.source.value+n.target.value)/2)})}var e,r,u,i,a,o,c,l={},s=0;return l.matrix=function(t){return arguments.length?(i=(u=t)&&u.length,e=r=null,l):u},l.padding=function(t){return arguments.length?(s=t,e=r=null,l):s},l.sortGroups=function(t){return arguments.length?(a=t,e=r=null,l):a},l.sortSubgroups=function(t){return arguments.length?(o=t,e=null,l):o},l.sortChords=function(t){return arguments.length?(c=t,e&&n(),l):c},l.chords=function(){return e||t(),e},l.groups=function(){return r||t(),r},l},d3.layout.force=function(){function t(t){return function(n,e,r,u){if(n.point!==t){var i=n.cx-t.x,a=n.cy-t.y,o=1/Math.sqrt(i*i+a*a);if(v>(u-e)*o){var c=n.charge*o*o;return t.px-=i*c,t.py-=a*c,!0}if(n.point&&isFinite(o)){var c=n.pointCharge*o*o;t.px-=i*c,t.py-=a*c}}return!n.charge}}function n(t){t.px=d3.event.x,t.py=d3.event.y,l.resume()}var e,r,u,i,o,l={},s=d3.dispatch("start","tick","end"),f=[1,1],h=.9,d=Qe,g=tr,p=-30,m=.1,v=.8,y=[],M=[];return l.tick=function(){if(.005>(r*=.99))return s.end({type:"end",alpha:r=0}),!0;var n,e,a,c,l,d,g,v,b,x=y.length,_=M.length;for(e=0;_>e;++e)a=M[e],c=a.source,l=a.target,v=l.x-c.x,b=l.y-c.y,(d=v*v+b*b)&&(d=r*i[e]*((d=Math.sqrt(d))-u[e])/d,v*=d,b*=d,l.x-=v*(g=c.weight/(l.weight+c.weight)),l.y-=b*g,c.x+=v*(g=1-g),c.y+=b*g);if((g=r*m)&&(v=f[0]/2,b=f[1]/2,e=-1,g))for(;x>++e;)a=y[e],a.x+=(v-a.x)*g,a.y+=(b-a.y)*g;if(p)for(We(n=d3.geom.quadtree(y),r,o),e=-1;x>++e;)(a=y[e]).fixed||n.visit(t(a));for(e=-1;x>++e;)a=y[e],a.fixed?(a.x=a.px,a.y=a.py):(a.x-=(a.px-(a.px=a.x))*h,a.y-=(a.py-(a.py=a.y))*h);s.tick({type:"tick",alpha:r})},l.nodes=function(t){return arguments.length?(y=t,l):y},l.links=function(t){return arguments.length?(M=t,l):M},l.size=function(t){return arguments.length?(f=t,l):f},l.linkDistance=function(t){return arguments.length?(d=c(t),l):d},l.distance=l.linkDistance,l.linkStrength=function(t){return arguments.length?(g=c(t),l):g},l.friction=function(t){return arguments.length?(h=t,l):h},l.charge=function(t){return arguments.length?(p="function"==typeof t?t:+t,l):p},l.gravity=function(t){return arguments.length?(m=t,l):m},l.theta=function(t){return arguments.length?(v=t,l):v},l.alpha=function(t){return arguments.length?(r?r=t>0?t:0:t>0&&(s.start({type:"start",alpha:r=t}),d3.timer(l.tick)),l):r},l.start=function(){function t(t,r){for(var u,i=n(e),a=-1,o=i.length;o>++a;)if(!isNaN(u=i[a][t]))return u;return Math.random()*r}function n(){if(!a){for(a=[],r=0;s>r;++r)a[r]=[];for(r=0;h>r;++r){var t=M[r];a[t.source.index].push(t.target),a[t.target.index].push(t.source)}}return a[e]}var e,r,a,c,s=y.length,h=M.length,m=f[0],v=f[1];for(e=0;s>e;++e)(c=y[e]).index=e,c.weight=0;for(u=[],i=[],e=0;h>e;++e)c=M[e],"number"==typeof c.source&&(c.source=y[c.source]),"number"==typeof c.target&&(c.target=y[c.target]),u[e]=d.call(this,c,e),i[e]=g.call(this,c,e),++c.source.weight,++c.target.weight;for(e=0;s>e;++e)c=y[e],isNaN(c.x)&&(c.x=t("x",m)),isNaN(c.y)&&(c.y=t("y",v)),isNaN(c.px)&&(c.px=c.x),isNaN(c.py)&&(c.py=c.y);if(o=[],"function"==typeof p)for(e=0;s>e;++e)o[e]=+p.call(this,y[e],e);else for(e=0;s>e;++e)o[e]=p;return l.resume()},l.resume=function(){return l.alpha(.1)},l.stop=function(){return l.alpha(0)},l.drag=function(){e||(e=d3.behavior.drag().origin(a).on("dragstart",$e).on("drag",n).on("dragend",Je)),this.on("mouseover.force",Ge).on("mouseout.force",Ke).call(e)},d3.rebind(l,s,"on")},d3.layout.partition=function(){function t(n,e,r,u){var i=n.children;if(n.x=e,n.y=n.depth*u,n.dx=r,n.dy=u,i&&(a=i.length)){var a,o,c,l=-1;for(r=n.value?r/n.value:0;a>++l;)t(o=i[l],e,c=o.value*r,u),e+=c}}function n(t){var e=t.children,r=0;if(e&&(u=e.length))for(var u,i=-1;u>++i;)r=Math.max(r,n(e[i]));return 1+r}function e(e,i){var a=r.call(this,e,i);return t(a[0],0,u[0],u[1]/n(a[0])),a}var r=d3.layout.hierarchy(),u=[1,1];return e.size=function(t){return arguments.length?(u=t,e):u},hr(e,r)},d3.layout.pie=function(){function t(i){var a=i.map(function(e,r){return+n.call(t,e,r)}),o=+("function"==typeof r?r.apply(this,arguments):r),c=(("function"==typeof u?u.apply(this,arguments):u)-r)/d3.sum(a),l=d3.range(i.length);null!=e&&l.sort(e===Ka?function(t,n){return a[n]-a[t]}:function(t,n){return e(i[t],i[n])});var s=[];return l.forEach(function(t){var n;s[t]={data:i[t],value:n=a[t],startAngle:o,endAngle:o+=n*c}}),s}var n=Number,e=Ka,r=0,u=2*Ri;return t.value=function(e){return arguments.length?(n=e,t):n},t.sort=function(n){return arguments.length?(e=n,t):e},t.startAngle=function(n){return arguments.length?(r=n,t):r},t.endAngle=function(n){return arguments.length?(u=n,t):u},t};var Ka={};d3.layout.stack=function(){function t(a,c){var l=a.map(function(e,r){return n.call(t,e,r)}),s=l.map(function(n){return n.map(function(n,e){return[i.call(t,n,e),o.call(t,n,e)]})}),f=e.call(t,s,c);l=d3.permute(l,f),s=d3.permute(s,f);var h,d,g,p=r.call(t,s,c),m=l.length,v=l[0].length;for(d=0;v>d;++d)for(u.call(t,l[0][d],g=p[d],s[0][d][1]),h=1;m>h;++h)u.call(t,l[h][d],g+=s[h-1][d][1],s[h][d][1]);return a}var n=a,e=ur,r=ir,u=rr,i=nr,o=er;return t.values=function(e){return arguments.length?(n=e,t):n},t.order=function(n){return arguments.length?(e="function"==typeof n?n:Wa.get(n)||ur,t):e},t.offset=function(n){return arguments.length?(r="function"==typeof n?n:Qa.get(n)||ir,t):r},t.x=function(n){return arguments.length?(i=n,t):i},t.y=function(n){return arguments.length?(o=n,t):o},t.out=function(n){return arguments.length?(u=n,t):u},t};var Wa=d3.map({"inside-out":function(t){var n,e,r=t.length,u=t.map(ar),i=t.map(or),a=d3.range(r).sort(function(t,n){return u[t]-u[n]}),o=0,c=0,l=[],s=[];for(n=0;r>n;++n)e=a[n],c>o?(o+=i[e],l.push(e)):(c+=i[e],s.push(e));return s.reverse().concat(l)},reverse:function(t){return d3.range(t.length).reverse()},"default":ur}),Qa=d3.map({silhouette:function(t){var n,e,r,u=t.length,i=t[0].length,a=[],o=0,c=[];for(e=0;i>e;++e){for(n=0,r=0;u>n;n++)r+=t[n][e][1];r>o&&(o=r),a.push(r)}for(e=0;i>e;++e)c[e]=(o-a[e])/2;return c},wiggle:function(t){var n,e,r,u,i,a,o,c,l,s=t.length,f=t[0],h=f.length,d=[];for(d[0]=c=l=0,e=1;h>e;++e){for(n=0,u=0;s>n;++n)u+=t[n][e][1];for(n=0,i=0,o=f[e][0]-f[e-1][0];s>n;++n){for(r=0,a=(t[n][e][1]-t[n][e-1][1])/(2*o);n>r;++r)a+=(t[r][e][1]-t[r][e-1][1])/o;i+=a*t[n][e][1]}d[e]=c-=u?i/u*o:0,l>c&&(l=c)}for(e=0;h>e;++e)d[e]-=l;return d},expand:function(t){var n,e,r,u=t.length,i=t[0].length,a=1/u,o=[];for(e=0;i>e;++e){for(n=0,r=0;u>n;n++)r+=t[n][e][1];if(r)for(n=0;u>n;n++)t[n][e][1]/=r;else for(n=0;u>n;n++)t[n][e][1]=a}for(e=0;i>e;++e)o[e]=0;return o},zero:ir});d3.layout.histogram=function(){function t(t,i){for(var a,o,c=[],l=t.map(e,this),s=r.call(this,l,i),f=u.call(this,s,l,i),i=-1,h=l.length,d=f.length-1,g=n?1:1/h;d>++i;)a=c[i]=[],a.dx=f[i+1]-(a.x=f[i]),a.y=0;if(d>0)for(i=-1;h>++i;)o=l[i],o>=s[0]&&s[1]>=o&&(a=c[d3.bisect(f,o,1,d)-1],a.y+=g,a.push(t[i]));return c}var n=!0,e=Number,r=fr,u=lr;return t.value=function(n){return arguments.length?(e=n,t):e},t.range=function(n){return arguments.length?(r=c(n),t):r},t.bins=function(n){return arguments.length?(u="number"==typeof n?function(t){return sr(t,n)}:c(n),t):u},t.frequency=function(e){return arguments.length?(n=!!e,t):n},t},d3.layout.hierarchy=function(){function t(n,a,o){var c=u.call(e,n,a);if(n.depth=a,o.push(n),c&&(l=c.length)){for(var l,s,f=-1,h=n.children=[],d=0,g=a+1;l>++f;)s=t(c[f],g,o),s.parent=n,h.push(s),d+=s.value;r&&h.sort(r),i&&(n.value=d)}else i&&(n.value=+i.call(e,n,a)||0);return n}function n(t,r){var u=t.children,a=0;if(u&&(o=u.length))for(var o,c=-1,l=r+1;o>++c;)a+=n(u[c],l);else i&&(a=+i.call(e,t,r)||0);return i&&(t.value=a),a}function e(n){var e=[];return t(n,0,e),e}var r=pr,u=dr,i=gr;return e.sort=function(t){return arguments.length?(r=t,e):r},e.children=function(t){return arguments.length?(u=t,e):u},e.value=function(t){return arguments.length?(i=t,e):i},e.revalue=function(t){return n(t,0),t},e},d3.layout.pack=function(){function t(t,u){var i=n.call(this,t,u),a=i[0];a.x=0,a.y=0,Rr(a,function(t){t.r=Math.sqrt(t.value)}),Rr(a,xr);var o=r[0],c=r[1],l=Math.max(2*a.r/o,2*a.r/c);if(e>0){var s=e*l/2;Rr(a,function(t){t.r+=s}),Rr(a,xr),Rr(a,function(t){t.r-=s}),l=Math.max(2*a.r/o,2*a.r/c)}return Sr(a,o/2,c/2,1/l),i}var n=d3.layout.hierarchy().sort(vr),e=0,r=[1,1];return t.size=function(n){return arguments.length?(r=n,t):r},t.padding=function(n){return arguments.length?(e=+n,t):e},hr(t,n)},d3.layout.cluster=function(){function t(t,u){var i,a=n.call(this,t,u),o=a[0],c=0;Rr(o,function(t){var n=t.children;n&&n.length?(t.x=Ar(n),t.y=Er(n)):(t.x=i?c+=e(t,i):0,t.y=0,i=t)});var l=Nr(o),s=Tr(o),f=l.x-e(l,s)/2,h=s.x+e(s,l)/2;return Rr(o,function(t){t.x=(t.x-f)/(h-f)*r[0],t.y=(1-(o.y?t.y/o.y:1))*r[1]}),a}var n=d3.layout.hierarchy().sort(null).value(null),e=qr,r=[1,1];return t.separation=function(n){return arguments.length?(e=n,t):e},t.size=function(n){return arguments.length?(r=n,t):r},hr(t,n)},d3.layout.tree=function(){function t(t,u){function i(t,n){var r=t.children,u=t._tree;if(r&&(a=r.length)){for(var a,c,l,s=r[0],f=s,h=-1;a>++h;)l=r[h],i(l,c),f=o(l,c,f),c=l;Pr(t);var d=.5*(s._tree.prelim+l._tree.prelim);n?(u.prelim=n._tree.prelim+e(t,n),u.mod=u.prelim-d):u.prelim=d}else n&&(u.prelim=n._tree.prelim+e(t,n))}function a(t,n){t.x=t._tree.prelim+n;var e=t.children;if(e&&(r=e.length)){var r,u=-1;for(n+=t._tree.mod;r>++u;)a(e[u],n)}}function o(t,n,r){if(n){for(var u,i=t,a=t,o=n,c=t.parent.children[0],l=i._tree.mod,s=a._tree.mod,f=o._tree.mod,h=c._tree.mod;o=zr(o),i=Cr(i),o&&i;)c=Cr(c),a=zr(a),a._tree.ancestor=t,u=o._tree.prelim+f-i._tree.prelim-l+e(o,i),u>0&&(jr(Or(o,t,r),t,u),l+=u,s+=u),f+=o._tree.mod,l+=i._tree.mod,h+=c._tree.mod,s+=a._tree.mod;o&&!zr(a)&&(a._tree.thread=o,a._tree.mod+=f-s),i&&!Cr(c)&&(c._tree.thread=i,c._tree.mod+=l-h,r=t)}return r}var c=n.call(this,t,u),l=c[0];Rr(l,function(t,n){t._tree={ancestor:t,prelim:0,mod:0,change:0,shift:0,number:n?n._tree.number+1:0}}),i(l),a(l,-l._tree.prelim);var s=Dr(l,Fr),f=Dr(l,Lr),h=Dr(l,Hr),d=s.x-e(s,f)/2,g=f.x+e(f,s)/2,p=h.depth||1;return Rr(l,function(t){t.x=(t.x-d)/(g-d)*r[0],t.y=t.depth/p*r[1],delete t._tree}),c}var n=d3.layout.hierarchy().sort(null).value(null),e=qr,r=[1,1];return t.separation=function(n){return arguments.length?(e=n,t):e},t.size=function(n){return arguments.length?(r=n,t):r},hr(t,n)},d3.layout.treemap=function(){function t(t,n){for(var e,r,u=-1,i=t.length;i>++u;)r=(e=t[u]).value*(0>n?0:n),e.area=isNaN(r)||0>=r?0:r}function n(e){var i=e.children;if(i&&i.length){var a,o,c,l=f(e),s=[],h=i.slice(),g=1/0,p="slice"===d?l.dx:"dice"===d||"slice-dice"===d&&1&e.depth?l.dy:Math.min(l.dx,l.dy);for(t(h,l.dx*l.dy/e.value),s.area=0;(c=h.length)>0;)s.push(a=h[c-1]),s.area+=a.area,"squarify"!==d||g>=(o=r(s,p))?(h.pop(),g=o):(s.area-=s.pop().area,u(s,p,l,!1),p=Math.min(l.dx,l.dy),s.length=s.area=0,g=1/0);s.length&&(u(s,p,l,!0),s.length=s.area=0),i.forEach(n)}}function e(n){var r=n.children;if(r&&r.length){var i,a=f(n),o=r.slice(),c=[];for(t(o,a.dx*a.dy/n.value),c.area=0;i=o.pop();)c.push(i),c.area+=i.area,null!=i.z&&(u(c,i.z?a.dx:a.dy,a,!o.length),c.length=c.area=0);r.forEach(e)}}function r(t,n){for(var e,r=t.area,u=0,i=1/0,a=-1,o=t.length;o>++a;)(e=t[a].area)&&(i>e&&(i=e),e>u&&(u=e));return r*=r,n*=n,r?Math.max(n*u*g/r,r/(n*i*g)):1/0}function u(t,n,e,r){var u,i=-1,a=t.length,o=e.x,l=e.y,s=n?c(t.area/n):0;if(n==e.dx){for((r||s>e.dy)&&(s=e.dy);a>++i;)u=t[i],u.x=o,u.y=l,u.dy=s,o+=u.dx=Math.min(e.x+e.dx-o,s?c(u.area/s):0);u.z=!0,u.dx+=e.x+e.dx-o,e.y+=s,e.dy-=s}else{for((r||s>e.dx)&&(s=e.dx);a>++i;)u=t[i],u.x=o,u.y=l,u.dx=s,l+=u.dy=Math.min(e.y+e.dy-l,s?c(u.area/s):0);u.z=!1,u.dy+=e.y+e.dy-l,e.x+=s,e.dx-=s}}function i(r){var u=a||o(r),i=u[0];return i.x=0,i.y=0,i.dx=l[0],i.dy=l[1],a&&o.revalue(i),t([i],i.dx*i.dy/i.value),(a?e:n)(i),h&&(a=u),u}var a,o=d3.layout.hierarchy(),c=Math.round,l=[1,1],s=null,f=Yr,h=!1,d="squarify",g=.5*(1+Math.sqrt(5));return i.size=function(t){return arguments.length?(l=t,i):l},i.padding=function(t){function n(n){var e=t.call(i,n,n.depth);return null==e?Yr(n):Ur(n,"number"==typeof e?[e,e,e,e]:e)}function e(n){return Ur(n,t)}if(!arguments.length)return s;var r;return f=null==(s=t)?Yr:"function"==(r=typeof t)?n:"number"===r?(t=[t,t,t,t],e):e,i},i.round=function(t){return arguments.length?(c=t?Math.round:Number,i):c!=Number},i.sticky=function(t){return arguments.length?(h=t,a=null,i):h},i.ratio=function(t){return arguments.length?(g=t,i):g},i.mode=function(t){return arguments.length?(d=t+"",i):d},hr(i,o)},d3.csv=Ir(",","text/csv"),d3.tsv=Ir("	","text/tab-separated-values"),d3.geo={},d3.geo.stream=function(t,n){to.hasOwnProperty(t.type)?to[t.type](t,n):Vr(t,n)};var to={Feature:function(t,n){Vr(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,u=e.length;u>++r;)Vr(e[r].geometry,n)},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,u=e.length;u>++r;)Vr(e[r],n)}},no={Sphere:function(t,n){n.sphere()},Point:function(t,n){var e=t.coordinates;n.point(e[0],e[1])},MultiPoint:function(t,n){for(var e,r=t.coordinates,u=-1,i=r.length;i>++u;)e=r[u],n.point(e[0],e[1])},LineString:function(t,n){Xr(t.coordinates,n,0)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,u=e.length;u>++r;)Xr(e[r],n,0)},Polygon:function(t,n){Zr(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,u=e.length;u>++r;)Zr(e[r],n)}};d3.geo.albersUsa=function(){function t(t){return n(t)(t)}function n(t){var n=t[0],a=t[1];return a>50?r:-140>n?u:21>a?i:e}var e=d3.geo.albers(),r=d3.geo.albers().rotate([160,0]).center([0,60]).parallels([55,65]),u=d3.geo.albers().rotate([160,0]).center([0,20]).parallels([8,18]),i=d3.geo.albers().rotate([60,0]).center([0,10]).parallels([8,18]);return t.scale=function(n){return arguments.length?(e.scale(n),r.scale(.6*n),u.scale(n),i.scale(1.5*n),t.translate(e.translate())):e.scale()},t.translate=function(n){if(!arguments.length)return e.translate();var a=e.scale(),o=n[0],c=n[1];return e.translate(n),r.translate([o-.4*a,c+.17*a]),u.translate([o-.19*a,c+.2*a]),i.translate([o+.58*a,c+.43*a]),t},t.scale(e.scale())},(d3.geo.albers=function(){var t=29.5*ji,n=45.5*ji,e=Pu(eu),r=e(t,n);return r.parallels=function(r){return arguments.length?e(t=r[0]*ji,n=r[1]*ji):[t*Oi,n*Oi]},r.rotate([98,0]).center([0,38]).scale(1e3)}).raw=eu;var eo=Vu(function(t){return Math.sqrt(2/(1+t))},function(t){return 2*Math.asin(t/2)});(d3.geo.azimuthalEqualArea=function(){return Ru(eo)}).raw=eo;var ro=Vu(function(t){var n=Math.acos(t);return n&&n/Math.sin(n)},a);(d3.geo.azimuthalEquidistant=function(){return Ru(ro)}).raw=ro,d3.geo.bounds=ru(),d3.geo.centroid=function(t){uo=io=ao=oo=co=0,d3.geo.stream(t,lo);var n;return io&&Math.abs(n=Math.sqrt(ao*ao+oo*oo+co*co))>Pi?[Math.atan2(oo,ao)*Oi,Math.asin(Math.max(-1,Math.min(1,co/n)))*Oi]:void 0};var uo,io,ao,oo,co,lo={sphere:Pn,point:uu,lineStart:au,lineEnd:ou,polygonStart:function(){uo=2,lo.lineStart=iu},polygonEnd:function(){lo.lineStart=au}};d3.geo.circle=function(){function t(){var t="function"==typeof r?r.apply(this,arguments):r,n=Ou(t[0]*ji,t[1]*ji,0),u=[];return e(null,null,1,{point:function(t,e){u.push(t=n(t,e)),t[0]*=Oi,t[1]*=Oi}}),{type:"Polygon",coordinates:[u]}}var n,e,r=[0,0],u=6;return t.origin=function(n){return arguments.length?(r=n,t):r},t.angle=function(r){return arguments.length?(e=cu((n=+r)*ji,u*ji),t):n},t.precision=function(r){return arguments.length?(e=cu(n*ji,(u=+r)*ji),t):u},t.angle(90)};var so=su(o,vu,Mu);(d3.geo.equirectangular=function(){return Ru(_u).scale(250/Ri)}).raw=_u.invert=_u;var fo=Vu(function(t){return 1/t},Math.atan);(d3.geo.gnomonic=function(){return Ru(fo)}).raw=fo,d3.geo.graticule=function(){function t(){return{type:"MultiLineString",coordinates:n()}}function n(){return d3.range(Math.ceil(r/c)*c,e,c).map(a).concat(d3.range(Math.ceil(i/l)*l,u,l).map(o))}var e,r,u,i,a,o,c=22.5,l=c,s=2.5;return t.lines=function(){return n().map(function(t){return{type:"LineString",coordinates:t}})},t.outline=function(){return{type:"Polygon",coordinates:[a(r).concat(o(u).slice(1),a(e).reverse().slice(1),o(i).reverse().slice(1))]}},t.extent=function(n){return arguments.length?(r=+n[0][0],e=+n[1][0],i=+n[0][1],u=+n[1][1],r>e&&(n=r,r=e,e=n),i>u&&(n=i,i=u,u=n),t.precision(s)):[[r,i],[e,u]]},t.step=function(n){return arguments.length?(c=+n[0],l=+n[1],t):[c,l]},t.precision=function(n){return arguments.length?(s=+n,a=wu(i,u,s),o=Su(r,e,s),t):s},t.extent([[-180+Pi,-90+Pi],[180-Pi,90-Pi]])},d3.geo.interpolate=function(t,n){return ku(t[0]*ji,t[1]*ji,n[0]*ji,n[1]*ji)},d3.geo.greatArc=function(){function e(){for(var t=r||a.apply(this,arguments),n=u||o.apply(this,arguments),e=i||d3.geo.interpolate(t,n),u=0,l=c/e.distance,s=[t];1>(u+=l);)s.push(e(u));return s.push(n),{type:"LineString",coordinates:s}}var r,u,i,a=n,o=t,c=6*ji;return e.distance=function(){return(i||d3.geo.interpolate(r||a.apply(this,arguments),u||o.apply(this,arguments))).distance},e.source=function(t){return arguments.length?(a=t,r="function"==typeof t?null:t,i=r&&u?d3.geo.interpolate(r,u):null,e):a},e.target=function(t){return arguments.length?(o=t,u="function"==typeof t?null:t,i=r&&u?d3.geo.interpolate(r,u):null,e):o},e.precision=function(t){return arguments.length?(c=t*ji,e):c/ji},e},Eu.invert=function(t,n){return[2*Ri*t,2*Math.atan(Math.exp(2*Ri*n))-Ri/2]},(d3.geo.mercator=function(){return Ru(Eu).scale(500)}).raw=Eu;var ho=Vu(function(){return 1},Math.asin);(d3.geo.orthographic=function(){return Ru(ho)}).raw=ho,d3.geo.path=function(){function t(t){return t&&d3.geo.stream(t,r(u.pointRadius("function"==typeof i?+i.apply(this,arguments):i))),u.result()}var n,e,r,u,i=4.5;return t.area=function(t){return go=0,d3.geo.stream(t,r(mo)),go},t.centroid=function(t){return uo=ao=oo=co=0,d3.geo.stream(t,r(vo)),co?[ao/co,oo/co]:void 0},t.bounds=function(t){return ru(n)(t)},t.projection=function(e){return arguments.length?(r=(n=e)?e.stream||Nu(e):a,t):n},t.context=function(n){return arguments.length?(u=null==(e=n)?new Tu:new qu(n),t):e},t.pointRadius=function(n){return arguments.length?(i="function"==typeof n?n:+n,t):i},t.projection(d3.geo.albersUsa()).context(null)};var go,po,mo={point:Pn,lineStart:Pn,lineEnd:Pn,polygonStart:function(){po=0,mo.lineStart=Cu},polygonEnd:function(){mo.lineStart=mo.lineEnd=mo.point=Pn,go+=Math.abs(po/2)}},vo={point:zu,lineStart:Du,lineEnd:Lu,polygonStart:function(){vo.lineStart=Fu},polygonEnd:function(){vo.point=zu,vo.lineStart=Du,vo.lineEnd=Lu}};d3.geo.area=function(t){return yo=0,d3.geo.stream(t,bo),yo};var yo,Mo,bo={sphere:function(){yo+=4*Ri},point:Pn,lineStart:Pn,lineEnd:Pn,polygonStart:function(){Mo=0,bo.lineStart=Hu},polygonEnd:function(){yo+=0>Mo?4*Ri+Mo:Mo,bo.lineStart=bo.lineEnd=bo.point=Pn}};d3.geo.projection=Ru,d3.geo.projectionMutator=Pu;var xo=Vu(function(t){return 1/(1+t)},function(t){return 2*Math.atan(t)});(d3.geo.stereographic=function(){return Ru(xo)}).raw=xo,d3.geom={},d3.geom.hull=function(t){if(3>t.length)return[];var n,e,r,u,i,a,o,c,l,s,f=t.length,h=f-1,d=[],g=[],p=0;for(n=1;f>n;++n)t[n][1]<t[p][1]?p=n:t[n][1]==t[p][1]&&(p=t[n][0]<t[p][0]?n:p);for(n=0;f>n;++n)n!==p&&(u=t[n][1]-t[p][1],r=t[n][0]-t[p][0],d.push({angle:Math.atan2(u,r),index:n}));for(d.sort(function(t,n){return t.angle-n.angle}),l=d[0].angle,c=d[0].index,o=0,n=1;h>n;++n)e=d[n].index,l==d[n].angle?(r=t[c][0]-t[p][0],u=t[c][1]-t[p][1],i=t[e][0]-t[p][0],a=t[e][1]-t[p][1],r*r+u*u>=i*i+a*a?d[n].index=-1:(d[o].index=-1,l=d[n].angle,o=n,c=e)):(l=d[n].angle,o=n,c=e);for(g.push(p),n=0,e=0;2>n;++e)-1!==d[e].index&&(g.push(d[e].index),n++);for(s=g.length;h>e;++e)if(-1!==d[e].index){for(;!Xu(g[s-2],g[s-1],d[e].index,t);)--s;g[s++]=d[e].index}var m=[];for(n=0;s>n;++n)m.push(t[g[n]]);return m},d3.geom.polygon=function(t){return t.area=function(){for(var n=0,e=t.length,r=t[e-1][1]*t[0][0]-t[e-1][0]*t[0][1];e>++n;)r+=t[n-1][1]*t[n][0]-t[n-1][0]*t[n][1];return.5*r},t.centroid=function(n){var e,r,u=-1,i=t.length,a=0,o=0,c=t[i-1];for(arguments.length||(n=-1/(6*t.area()));i>++u;)e=c,c=t[u],r=e[0]*c[1]-c[0]*e[1],a+=(e[0]+c[0])*r,o+=(e[1]+c[1])*r;return[a*n,o*n]},t.clip=function(n){for(var e,r,u,i,a,o,c=-1,l=t.length,s=t[l-1];l>++c;){for(e=n.slice(),n.length=0,i=t[c],a=e[(u=e.length)-1],r=-1;u>++r;)o=e[r],Zu(o,s,i)?(Zu(a,s,i)||n.push(Bu(a,o,s,i)),n.push(o)):Zu(a,s,i)&&n.push(Bu(a,o,s,i)),a=o;s=i}return n},t},d3.geom.voronoi=function(t){var n=t.map(function(){return[]}),e=1e6;return $u(t,function(t){var r,u,i,a,o,c;1===t.a&&t.b>=0?(r=t.ep.r,u=t.ep.l):(r=t.ep.l,u=t.ep.r),1===t.a?(o=r?r.y:-e,i=t.c-t.b*o,c=u?u.y:e,a=t.c-t.b*c):(i=r?r.x:-e,o=t.c-t.a*i,a=u?u.x:e,c=t.c-t.a*a);var l=[i,o],s=[a,c];n[t.region.l.index].push(l,s),n[t.region.r.index].push(l,s)}),n=n.map(function(n,e){var r=t[e][0],u=t[e][1],i=n.map(function(t){return Math.atan2(t[0]-r,t[1]-u)});return d3.range(n.length).sort(function(t,n){return i[t]-i[n]}).filter(function(t,n,e){return!n||i[t]-i[e[n-1]]>Pi}).map(function(t){return n[t]})}),n.forEach(function(n,r){var u=n.length;if(!u)return n.push([-e,-e],[-e,e],[e,e],[e,-e]);if(!(u>2)){var i=t[r],a=n[0],o=n[1],c=i[0],l=i[1],s=a[0],f=a[1],h=o[0],d=o[1],g=Math.abs(h-s),p=d-f;if(Pi>Math.abs(p)){var m=f>l?-e:e;n.push([-e,m],[e,m])}else if(Pi>g){var v=s>c?-e:e;n.push([v,-e],[v,e])}else{var m=(s-c)*(d-f)>(h-s)*(f-l)?e:-e,y=Math.abs(p)-g;Pi>Math.abs(y)?n.push([0>p?m:-m,m]):(y>0&&(m*=-1),n.push([-e,m],[e,m]))}}}),n};var _o={l:"r",r:"l"};d3.geom.delaunay=function(t){var n=t.map(function(){return[]}),e=[];return $u(t,function(e){n[e.region.l.index].push(t[e.region.r.index])}),n.forEach(function(n,r){var u=t[r],i=u[0],a=u[1];n.forEach(function(t){t.angle=Math.atan2(t[0]-i,t[1]-a)}),n.sort(function(t,n){return t.angle-n.angle});for(var o=0,c=n.length-1;c>o;o++)e.push([u,n[o],n[o+1]])}),e},d3.geom.quadtree=function(t,n,e,r,u){function i(t,n,e,r,u,i){if(!isNaN(n.x)&&!isNaN(n.y))if(t.leaf){var o=t.point;o?.01>Math.abs(o.x-n.x)+Math.abs(o.y-n.y)?a(t,n,e,r,u,i):(t.point=null,a(t,o,e,r,u,i),a(t,n,e,r,u,i)):t.point=n}else a(t,n,e,r,u,i)}function a(t,n,e,r,u,a){var o=.5*(e+u),c=.5*(r+a),l=n.x>=o,s=n.y>=c,f=(s<<1)+l;t.leaf=!1,t=t.nodes[f]||(t.nodes[f]=Ju()),l?e=o:u=o,s?r=c:a=c,i(t,n,e,r,u,a)}var o,c=-1,l=t.length;if(5>arguments.length)if(3===arguments.length)u=e,r=n,e=n=0;else for(n=e=1/0,r=u=-1/0;l>++c;)o=t[c],n>o.x&&(n=o.x),e>o.y&&(e=o.y),o.x>r&&(r=o.x),o.y>u&&(u=o.y);var s=r-n,f=u-e;s>f?u=e+s:r=n+f;var h=Ju();return h.add=function(t){i(h,t,n,e,r,u)},h.visit=function(t){Gu(t,h,n,e,r,u)},t.forEach(h.add),h},d3.time={};var wo=Date,So=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];Ku.prototype={getDate:function(){return this._.getUTCDate()},getDay:function(){return this._.getUTCDay()},getFullYear:function(){return this._.getUTCFullYear()},getHours:function(){return this._.getUTCHours()},getMilliseconds:function(){return this._.getUTCMilliseconds()},getMinutes:function(){return this._.getUTCMinutes()},getMonth:function(){return this._.getUTCMonth()},getSeconds:function(){return this._.getUTCSeconds()},getTime:function(){return this._.getTime()},getTimezoneOffset:function(){return 0},valueOf:function(){return this._.valueOf()},setDate:function(){ko.setUTCDate.apply(this._,arguments)},setDay:function(){ko.setUTCDay.apply(this._,arguments)},setFullYear:function(){ko.setUTCFullYear.apply(this._,arguments)},setHours:function(){ko.setUTCHours.apply(this._,arguments)},setMilliseconds:function(){ko.setUTCMilliseconds.apply(this._,arguments)},setMinutes:function(){ko.setUTCMinutes.apply(this._,arguments)},setMonth:function(){ko.setUTCMonth.apply(this._,arguments)},setSeconds:function(){ko.setUTCSeconds.apply(this._,arguments)},setTime:function(){ko.setTime.apply(this._,arguments)}};var ko=Date.prototype,Eo="%a %b %e %X %Y",Ao="%m/%d/%Y",No="%H:%M:%S",To=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],qo=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Co=["January","February","March","April","May","June","July","August","September","October","November","December"],zo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];d3.time.format=function(t){function n(n){for(var r,u,i,a=[],o=-1,c=0;e>++o;)37===t.charCodeAt(o)&&(a.push(t.substring(c,o)),null!=(u=jo[r=t.charAt(++o)])&&(r=t.charAt(++o)),(i=Oo[r])&&(r=i(n,null==u?"e"===r?" ":"0":u)),a.push(r),c=o+1);return a.push(t.substring(c,o)),a.join("")}var e=t.length;return n.parse=function(n){var e={y:1900,m:0,d:1,H:0,M:0,S:0,L:0},r=Wu(e,t,n,0);if(r!=n.length)return null;"p"in e&&(e.H=e.H%12+12*e.p);var u=new wo;return u.setFullYear(e.y,e.m,e.d),u.setHours(e.H,e.M,e.S,e.L),u},n.toString=function(){return t},n};var Do=Qu(To),Lo=Qu(qo),Fo=Qu(Co),Ho=ti(Co),Ro=Qu(zo),Po=ti(zo),jo={"-":"",_:" ",0:"0"},Oo={a:function(t){return qo[t.getDay()]},A:function(t){return To[t.getDay()]},b:function(t){return zo[t.getMonth()]},B:function(t){return Co[t.getMonth()]},c:d3.time.format(Eo),d:function(t,n){return ni(t.getDate(),n,2)},e:function(t,n){return ni(t.getDate(),n,2)},H:function(t,n){return ni(t.getHours(),n,2)},I:function(t,n){return ni(t.getHours()%12||12,n,2)},j:function(t,n){return ni(1+d3.time.dayOfYear(t),n,3)},L:function(t,n){return ni(t.getMilliseconds(),n,3)},m:function(t,n){return ni(t.getMonth()+1,n,2)},M:function(t,n){return ni(t.getMinutes(),n,2)},p:function(t){return t.getHours()>=12?"PM":"AM"},S:function(t,n){return ni(t.getSeconds(),n,2)},U:function(t,n){return ni(d3.time.sundayOfYear(t),n,2)},w:function(t){return t.getDay()},W:function(t,n){return ni(d3.time.mondayOfYear(t),n,2)},x:d3.time.format(Ao),X:d3.time.format(No),y:function(t,n){return ni(t.getFullYear()%100,n,2)},Y:function(t,n){return ni(t.getFullYear()%1e4,n,4)},Z:Mi,"%":function(){return"%"}},Yo={a:ei,A:ri,b:ui,B:ii,c:ai,d:di,e:di,H:gi,I:gi,L:vi,m:hi,M:pi,p:yi,S:mi,x:oi,X:ci,y:si,Y:li},Uo=/^\s*\d+/,Io=d3.map({am:0,pm:1});d3.time.format.utc=function(t){function n(t){try{wo=Ku;var n=new wo;return n._=t,e(n)}finally{wo=Date}}var e=d3.time.format(t);return n.parse=function(t){try{wo=Ku;var n=e.parse(t);return n&&n._}finally{wo=Date}},n.toString=e.toString,n};var Vo=d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ");d3.time.format.iso=Date.prototype.toISOString?bi:Vo,bi.parse=function(t){var n=new Date(t);return isNaN(n)?null:n},bi.toString=Vo.toString,d3.time.second=xi(function(t){return new wo(1e3*Math.floor(t/1e3))},function(t,n){t.setTime(t.getTime()+1e3*Math.floor(n))},function(t){return t.getSeconds()}),d3.time.seconds=d3.time.second.range,d3.time.seconds.utc=d3.time.second.utc.range,d3.time.minute=xi(function(t){return new wo(6e4*Math.floor(t/6e4))},function(t,n){t.setTime(t.getTime()+6e4*Math.floor(n))},function(t){return t.getMinutes()}),d3.time.minutes=d3.time.minute.range,d3.time.minutes.utc=d3.time.minute.utc.range,d3.time.hour=xi(function(t){var n=t.getTimezoneOffset()/60;return new wo(36e5*(Math.floor(t/36e5-n)+n))},function(t,n){t.setTime(t.getTime()+36e5*Math.floor(n))},function(t){return t.getHours()}),d3.time.hours=d3.time.hour.range,d3.time.hours.utc=d3.time.hour.utc.range,d3.time.day=xi(function(t){var n=new wo(1970,0);return n.setFullYear(t.getFullYear(),t.getMonth(),t.getDate()),n},function(t,n){t.setDate(t.getDate()+n)},function(t){return t.getDate()-1}),d3.time.days=d3.time.day.range,d3.time.days.utc=d3.time.day.utc.range,d3.time.dayOfYear=function(t){var n=d3.time.year(t);return Math.floor((t-n-6e4*(t.getTimezoneOffset()-n.getTimezoneOffset()))/864e5)},So.forEach(function(t,n){t=t.toLowerCase(),n=7-n;var e=d3.time[t]=xi(function(t){return(t=d3.time.day(t)).setDate(t.getDate()-(t.getDay()+n)%7),t},function(t,n){t.setDate(t.getDate()+7*Math.floor(n))},function(t){var e=d3.time.year(t).getDay();return Math.floor((d3.time.dayOfYear(t)+(e+n)%7)/7)-(e!==n)});d3.time[t+"s"]=e.range,d3.time[t+"s"].utc=e.utc.range,d3.time[t+"OfYear"]=function(t){var e=d3.time.year(t).getDay();return Math.floor((d3.time.dayOfYear(t)+(e+n)%7)/7)}}),d3.time.week=d3.time.sunday,d3.time.weeks=d3.time.sunday.range,d3.time.weeks.utc=d3.time.sunday.utc.range,d3.time.weekOfYear=d3.time.sundayOfYear,d3.time.month=xi(function(t){return t=d3.time.day(t),t.setDate(1),t},function(t,n){t.setMonth(t.getMonth()+n)},function(t){return t.getMonth()}),d3.time.months=d3.time.month.range,d3.time.months.utc=d3.time.month.utc.range,d3.time.year=xi(function(t){return t=d3.time.day(t),t.setMonth(0,1),t},function(t,n){t.setFullYear(t.getFullYear()+n)},function(t){return t.getFullYear()}),d3.time.years=d3.time.year.range,d3.time.years.utc=d3.time.year.utc.range;var Xo=[1e3,5e3,15e3,3e4,6e4,3e5,9e5,18e5,36e5,108e5,216e5,432e5,864e5,1728e5,6048e5,2592e6,7776e6,31536e6],Zo=[[d3.time.second,1],[d3.time.second,5],[d3.time.second,15],[d3.time.second,30],[d3.time.minute,1],[d3.time.minute,5],[d3.time.minute,15],[d3.time.minute,30],[d3.time.hour,1],[d3.time.hour,3],[d3.time.hour,6],[d3.time.hour,12],[d3.time.day,1],[d3.time.day,2],[d3.time.week,1],[d3.time.month,1],[d3.time.month,3],[d3.time.year,1]],Bo=[[d3.time.format("%Y"),o],[d3.time.format("%B"),function(t){return t.getMonth()}],[d3.time.format("%b %d"),function(t){return 1!=t.getDate()}],[d3.time.format("%a %d"),function(t){return t.getDay()&&1!=t.getDate()}],[d3.time.format("%I %p"),function(t){return t.getHours()}],[d3.time.format("%I:%M"),function(t){return t.getMinutes()}],[d3.time.format(":%S"),function(t){return t.getSeconds()}],[d3.time.format(".%L"),function(t){return t.getMilliseconds()}]],$o=d3.scale.linear(),Jo=Ei(Bo);Zo.year=function(t,n){return $o.domain(t.map(Ni)).ticks(n).map(Ai)},d3.time.scale=function(){return wi(d3.scale.linear(),Zo,Jo)};var Go=Zo.map(function(t){return[t[0].utc,t[1]]}),Ko=[[d3.time.format.utc("%Y"),o],[d3.time.format.utc("%B"),function(t){return t.getUTCMonth()}],[d3.time.format.utc("%b %d"),function(t){return 1!=t.getUTCDate()}],[d3.time.format.utc("%a %d"),function(t){return t.getUTCDay()&&1!=t.getUTCDate()}],[d3.time.format.utc("%I %p"),function(t){return t.getUTCHours()}],[d3.time.format.utc("%I:%M"),function(t){return t.getUTCMinutes()}],[d3.time.format.utc(":%S"),function(t){return t.getUTCSeconds()}],[d3.time.format.utc(".%L"),function(t){return t.getUTCMilliseconds()}]],Wo=Ei(Ko);Go.year=function(t,n){return $o.domain(t.map(qi)).ticks(n).map(Ti)},d3.time.scale.utc=function(){return wi(d3.scale.linear(),Go,Wo)}})();;
(function () {

  d3.timeline = function () {
    var DISPLAY_TYPES = ["circle", "rect"];

    var hover = function () {},
      click = function () {},
      scroll = function () {},
      orient = "bottom",
      width = null,
      height = null,
      tickFormat = { format: d3.format("d"),
        tickTime: 1,
        tickNumber: 1,
        tickSize: 10 },
      colorCycle = d3.scale.category20(),
      display = "rect",
      startYear = 0,
      beginning = 0,
      ending = 0,
      margin = {left: 30, right: 30, top: 30, bottom: 30},
      stacked = false,
      rotateTicks = false,
      itemHeight = 10,
      itemMargin = 5;

    function timeline(gParent) {
      var g = gParent.append("g");
      var gParentSize = gParent[0][0].getBoundingClientRect();
      var gParentItem = d3.select(gParent[0][0]);

      var yAxisMapping = {},
        maxStack = 1,
        minTime = 0,
        maxTime = 0;

      setWidth();

      // check how many stacks we're gonna need
      // do this here so that we can draw the axis before the graph
      if (stacked || (ending == 0 && beginning == 0)) {
        g.each(function (d, i) {
          d.forEach(function (datum, index) {

            // create y mapping for stacked graph
            if (stacked && Object.keys(yAxisMapping).indexOf(index) == -1) {
              yAxisMapping[index] = maxStack;
              maxStack++;
            }

            // figure out beginning and ending times if they are unspecified
            if (ending == 0 && beginning == 0) {
              datum.times.forEach(function (time, i) {
                if (time.starting_time < minTime || minTime == 0)
                  minTime = time.starting_time;
                if (time.ending_time > maxTime)
                  maxTime = time.ending_time;
              });
            }
          });
        });

        if (ending == 0 && beginning == 0) {
          beginning = minTime;
          ending = maxTime;
        }
      }

      var scaleFactor = (1 / (ending - beginning)) * (width - margin.left - margin.right);

      var formatTime = tickFormat.format;
      var formatByYear = function(d) {
        return startYear + (parseInt(formatTime(d)) / 12); // print in years
      };

      // draw the axis
      var xScale = d3.time.scale()
        .domain([beginning, ending])
        .range([margin.left, width - margin.right]);

      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient(orient)
        .tickFormat(formatByYear)
        .tickSubdivide(1)
        .tickValues(d3.range(beginning, ending+1, 12))
        .tickSize(tickFormat.tickSize, tickFormat.tickSize/2, 0 );

      // draw axis
      g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 0 + "," + (margin.top + (itemHeight + itemMargin) * maxStack) + ")")
        .call(xAxis);


      // draw the chart
      g.each(function (d, i) {
        d.forEach(function (datum, index) {
          var data = datum.times;
          var hasLabel = (typeof(datum.label) != "undefined");
          g.selectAll("svg").data(data).enter()
            .append("path")
            .attr("d", function drawRect(d, i) {
              var rectX = getXPos(d, i);
              var rectY = getStackPosition(d, i);
              var rectWidth = getWidth(d, i);
              return rightRoundedRect(rectX, rectY, rectWidth, itemHeight, 5);
            })
            .style("fill", datum.color)
            .on("mouseover", function (d, i) {
              hover(d, index, datum);
            })
            .on("click", function (d, i) {
              click(d, index, datum);
            })
            .append("title").text(function (d) {
              return d.title;
            });

          // add the label
          if (hasLabel) {
            gParent.append('text')
              .attr("class", "timeline-label")
              .attr("transform", "translate(" + 0 + "," + (itemHeight / 2 + margin.top + (itemHeight + itemMargin) * yAxisMapping[index]) + ")")
              .text(hasLabel ? datum.label : datum.id);
          }

          if (typeof(datum.icon) != "undefined") {
            gParent.append('image')
              .attr("class", "timeline-label")
              .attr("transform", "translate(" + 0 + "," + (margin.top + (itemHeight + itemMargin) * yAxisMapping[index]) + ")")
              .attr("xlink:href", datum.icon)
              .attr("width", margin.left)
              .attr("height", itemHeight);
          }

          function getStackPosition(d, i) {
            return stacked
              ? margin.top + (itemHeight + itemMargin) * yAxisMapping[index]
              : margin.top;
          }
        });
      });

      if (rotateTicks) {
        g.selectAll("text")
          .attr("transform", function (d) {
            return "rotate(" + rotateTicks + ")translate("
              + (this.getBBox().width / 2 + 10) + "," // TODO: change this 10
              + this.getBBox().height / 2 + ")";
          });
      }

      var gSize = g[0][0].getBoundingClientRect();
      setHeight();

      function getXPos(d, i) {
        return margin.left + (d.starting_time - beginning) * scaleFactor;
      }

      function getWidth(d, i) {
        return (d.ending_time - d.starting_time) * scaleFactor;
      }

      function setHeight() {
        if (!height && !gParentItem.attr("height")) {
          if (itemHeight) {
            // set height based off of item height
            height = gSize.height + gSize.top - gParentSize.top;
            // set bounding rectangle height
            d3.select(gParent[0][0]).attr("height", height);
          } else {
            throw "height of the timeline is not set";
          }
        } else {
          if (!height) {
            height = gParentItem.attr("height");
          } else {
            gParentItem.attr("height", height);
          }
        }
      }

      function setWidth() {
        if (!width && !gParentSize.width) {
          throw "width of the timeline is not set";
        } else if (!(width && gParentSize.width)) {
          if (!width) {
            width = gParentItem.attr("width");
          } else {
            gParentItem.attr("width", width);
          }
        }
        // if both are set, do nothing
      }

      function rightRoundedRect(x, y, width, height, radius) {
        return "M" + x + "," + y
          + "h" + (width - radius)
          + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
          + "v" + (height - 2 * radius)
          + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
          + "h" + (radius - width)
          + "z";
      }

    }

    timeline.margin = function (p) {
      if (!arguments.length) return margin;
      margin = p;
      return timeline;
    };

    timeline.orient = function (orientation) {
      if (!arguments.length) return orient;
      orient = orientation;
      return timeline;
    };

    timeline.itemHeight = function (h) {
      if (!arguments.length) return itemHeight;
      itemHeight = h;
      return timeline;
    };

    timeline.itemMargin = function (h) {
      if (!arguments.length) return itemMargin;
      itemMargin = h;
      return timeline;
    };

    timeline.height = function (h) {
      if (!arguments.length) return height;
      height = h;
      return timeline;
    };

    timeline.width = function (w) {
      if (!arguments.length) return width;
      width = w;
      return timeline;
    };

    timeline.display = function (displayType) {
      if (!arguments.length || (DISPLAY_TYPES.indexOf(displayType) == -1)) return display;
      display = displayType;
      return timeline;
    };

    timeline.tickFormat = function (format) {
      if (!arguments.length) return tickFormat;
      tickFormat = format;
      return timeline;
    };

    timeline.hover = function (hoverFunc) {
      if (!arguments.length) return hover;
      hover = hoverFunc;
      return timeline;
    };

    timeline.click = function (clickFunc) {
      if (!arguments.length) return click;
      click = clickFunc;
      return timeline;
    };

    timeline.colors = function (colorFormat) {
      if (!arguments.length) return colorCycle;
      colorCycle = colorFormat;
      return timeline;
    };

    timeline.startYear = function (b) {
      if (!arguments.length) return startYear;
      startYear = b;
      return timeline;
    };

    timeline.beginning = function (b) {
      if (!arguments.length) return beginning;
      beginning = b;
      return timeline;
    };

    timeline.ending = function (e) {
      if (!arguments.length) return ending;
      ending = e;
      return timeline;
    };

    timeline.rotateTicks = function (degrees) {
      rotateTicks = degrees;
      return timeline;
    };

    timeline.stack = function () {
      stacked = !stacked;
      return timeline;
    };

    return timeline;
  };
})();
;
// Using the closure to map jQuery to $.
(function ($) {

  var MAX_MONTHS = 300;

  Drupal.behaviors.mica_studies_timeline = {
    attach: function (context, settings) {
      var timelineData = createTimelineData(settings.timeline_data);
      if (timelineData != null && timelineData != undefined) createTimeline(timelineData);
    }
  };

  function createTimelineData(populations) {
    var bounds = _findDataBounds(populations);
    var timelineData = {};
    var timelines = [];

    for (var p = 0; p < populations.length; p++) {
      var events = populations[p].events;
      var eventData = [];

      for (var e = 0; e < events.length; e++) {
        eventData.push({
          id: events[e].dce_nid,
          title: events[e].dce_title,
          starting_time: _convertToMonths(events[e].start_year - bounds.start, events[e].start_month),
          ending_time: _convertToMonths(events[e].end_year - bounds.start, events[e].end_month)
        });
      }

      timelines.push({
        population: populations[p].pop_title,
        color: populations[p].color,
        times: eventData
      });
    }

    timelineData.data = timelines;
    timelineData.start = bounds.start;
    timelineData.min = bounds.min;
    timelineData.max = bounds.max;

    return timelineData;
  }

  function _findDataBounds(populations) {
    var startYear = Number.MAX_VALUE;
    var minYear = 0;
    var maxYear = Number.MIN_VALUE;

    for (var p = 0; p < populations.length; p++) {
      var events = populations[p].events;
      for (var e = 0; e < events.length; e++) {
        startYear = Math.min(startYear, events[e].start_year);
        maxYear = Math.max(maxYear, _convertToMonths(events[e].end_year-startYear, events[e].end_month));
      }
    }

    return {min: minYear, max: Math.ceil(maxYear/12) * 12, start: startYear};
  }

  function createTimeline(timelineData) {
    var width = $("#timeline").width();
    var chart = d3.timeline()
      .startYear(timelineData.start)
      .beginning(timelineData.min)
      .ending(timelineData.max)
      .width(width)
      .stack()
      .tickFormat({
        format: d3.format("d"),
        tickTime: 1,
        tickNumber: 1,
        tickSize: 10
      })
      .margin({left: 15, right: 15, top: 0, bottom: 20})
      .rotateTicks(timelineData.max > MAX_MONTHS ? 45 : 0)
      .click(function (d, i, datum) {
        $('#event-' + d.id).modal();
      });

    d3.select("#timeline").append("svg").attr("width", width).datum(timelineData.data).call(chart);
  }

  function _convertToMonths(year, month) {
    return 12 * parseInt(year) + parseInt(month);
  }

}(jQuery));;
// Using the closure to map jQuery to $.
(function ($) {
  Drupal.behaviors.mica_studies_timeline_legend = {
    attach: function (context, settings) {
      for (var i = 0; i < settings.timeline_legend_data.length; i++) {
        var pop_nid = settings.timeline_legend_data[i].pop_nid;
        var svg = settings.timeline_legend_data[i].svg;
        var h2 = $('article#node-' + pop_nid + ' header h2');
        h2.html(svg + h2.html());
      }
    }
  };


}(jQuery));;
(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + Drupal.settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;
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
