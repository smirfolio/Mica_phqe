(function($) {
  Drupal.behaviors.search_api_ranges = {
    attach: function(context, settings) {

      var submitTimeout = -1;

      $('div.search-api-ranges-widget').each(function() {

        var widget = $(this);
        var rangeFrom = widget.find('input[name=range-from]');
        var rangeTo = widget.find('input[name=range-to]');

        rangeFrom.numeric();
        rangeFrom.bind('change', function() {
          clearTimeout(submitTimeout);
          if (!isNaN(rangeFrom.val()) && rangeFrom.val() !== '') {
            var value = parseInt(rangeFrom.val());
            var maxValue = parseInt(rangeTo.val());
            if (value > maxValue) {
              rangeFrom.val(maxValue);
            }
            delaySubmit(widget);
          }
        });

        rangeTo.numeric();
        rangeTo.bind('change', function() {
          clearTimeout(submitTimeout);
          if (!isNaN(rangeTo.val()) && rangeTo.val() !== '') {
            var value = parseInt(rangeTo.val());
            var minValue = parseInt(rangeFrom.val());
            if (value < minValue) {
              rangeTo.val(minValue);
            }
            delaySubmit(widget);
          }
        });
      });

      function delaySubmit(widget) {
        var autoSubmitDelay = widget.find('input[name=delay]').val();
        if (autoSubmitDelay != undefined && autoSubmitDelay != 0) {
          submitTimeout = setTimeout(function() {
            widget.find('form').submit();
          }, autoSubmitDelay);
        }
      }
    }
  };
})(jQuery);
