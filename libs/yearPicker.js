$.fn.yearpicker = function (options) {
  // Merge default settings with any options passed in.
  var settings = $.extend(
    {
      multiSelect: false, // Allow multiple selections.
      value: null, // Optional initial value.
      displayFormat: "YYYY", // Format for display.
      disabledRule: null, // Callback: (year) => boolean
      onYearSelect: null, // Callback function after selection.
      startYear: new Date().getFullYear(), // Default start year
    },
    options
  );

  return this.each(function () {
    var $elem = $(this);
    var currentStartYear = settings.startYear - 4; // Center the current/selected year in the 9-year grid
    var selections = [];

    // Create the picker container.
    var $picker = $('<div class="yearpicker-dropdown"></div>');

    // Add year navigation header.
    var $yearNav = $('<div class="yearpicker-year-nav"></div>');
    var $prev = $('<span class="yearpicker-prev">&lt;</span>');
    var $yearDisplay = $(
      '<span class="yearpicker-year-display">' + currentStartYear + '-' + (currentStartYear + 8) + '</span>'
    );
    var $next = $('<span class="yearpicker-next">&gt;</span>');
    $yearNav.append($prev, $yearDisplay, $next);
    $picker.append($yearNav);

    $prev.on('click', function () {
      currentStartYear -= 9;
      updateYearDisplay();
      updateGridSelections();
    });

    $next.on('click', function () {
      currentStartYear += 9;
      updateYearDisplay();
      updateGridSelections();
    });

    // Create the grid container for year buttons.
    var $grid = $('<div class="yearpicker-grid"></div>');
    $picker.append($grid);
    $('body').append($picker);

    function updateYearDisplay() {
      $yearDisplay.text(currentStartYear + '-' + (currentStartYear + 8));
      generateYearButtons();
    }

    function generateYearButtons() {
      $grid.empty();
      for (var i = 0; i < 9; i++) {
        var year = currentStartYear + i;
        var $yearBtn = $(
          '<span class="yearpicker-year" data-year="' + year + '">' + year + '</span>'
        );

        if (settings.disabledRule && settings.disabledRule(year)) {
          $yearBtn.addClass('disabled');
        }

        if (selections.includes(year)) {
          $yearBtn.addClass('selected');
        }

        $grid.append($yearBtn);
      }
    }

    function formatYear(year) {
      return settings.displayFormat.replace(/(YYYY|yyyy|YY)/g, function (token) {
        switch (token) {
          case 'YYYY':
          case 'yyyy':
            return year;
          case 'YY':
            return ('' + year).slice(-2);
          default:
            return '';
        }
      });
    }

    function parseYear(str) {
      var year = parseInt(str, 10);
      return !isNaN(year) ? year : null;
    }

    function updateValue() {
      var formattedSelections = selections
        .map(function (year) {
          return formatYear(year);
        })
        .join(', ');
      $elem.val(formattedSelections);

      if (settings.onYearSelect) {
        settings.onYearSelect.call($elem, selections);
      }
    }

    function updateGridSelections() {
      generateYearButtons();
    }

    // Initialize selections from value if provided
    if (settings.value) {
      var initialValues = settings.value.split(',').map(function (val) {
        return parseYear(val.trim());
      });
      selections = initialValues.filter(function (val) {
        return val !== null;
      });
      updateValue();
    }

    // Handle year selection
    $picker.on('click', '.yearpicker-year:not(.disabled)', function () {
      var year = parseInt($(this).data('year'), 10);

      if (settings.multiSelect) {
        var index = selections.indexOf(year);
        if (index === -1) {
          selections.push(year);
          $(this).addClass('selected');
        } else {
          selections.splice(index, 1);
          $(this).removeClass('selected');
        }
      } else {
        selections = [year];
        $('.yearpicker-year', $picker).removeClass('selected');
        $(this).addClass('selected');
        $picker.hide();
        $elem.trigger('hideYearPicker');
      }

      updateValue();
    });

    // Show/hide picker on input focus/click
    $elem.on('focus click', function (e) {
      e.stopPropagation();
      $('.yearpicker-dropdown').hide();
      var pos = $elem.offset();
      var height = $elem.outerHeight();
      $picker
        .css({
          top: pos.top + height,
          left: pos.left,
        })
        .show();
      $elem.trigger('showYearPicker');
    });

    // Handle input value changes
    $elem.on('input', function() {
      var inputValue = $(this).val().trim();
      var year = parseYear(inputValue);
      
      if (year !== null) {
        if (settings.multiSelect) {
          if (!selections.includes(year)) {
            selections.push(year);
            updateValue();
            updateGridSelections();
          }
        } else {
          selections = [year];
          updateValue();
          updateGridSelections();
        }
      }
    });

    // Hide picker when clicking outside
    $(document).on('click', function (e) {
      if (!$(e.target).closest('.yearpicker-dropdown, ' + '#' + $elem.attr('id')).length) {
        $picker.hide();
        $elem.trigger('hideYearPicker');
      }
    });

    // Initial grid generation
    generateYearButtons();

    // Store control functions
    var control = {
      dispose: function() {
        // Remove event listeners
        $elem.off('focus click');
        $elem.off('input');
        $prev.off('click');
        $next.off('click');
        $picker.off('click');
        $(document).off('click');

        // Remove DOM elements
        $picker.remove();

        // Clear data
        $elem.removeData('yearpicker');
        $elem.removeData('yearPickerControl');
      },
      toggle: function(show) {
        if (show === undefined) {
          $picker.toggle();
          $elem.trigger($picker.is(':visible') ? 'showYearPicker' : 'hideYearPicker');
        } else if (show) {
          var pos = $elem.offset();
          var height = $elem.outerHeight();
          $picker
            .css({
              top: pos.top + height,
              left: pos.left,
            })
            .show();
          $elem.trigger('showYearPicker');
          requestAnimationFrame(function() {
            updateGridSelections();
          });
        } else {
          $picker.hide();
          $elem.trigger('hideYearPicker');
        }
      }
    };

    // Store the control object
    $elem.data('yearPickerControl', control);
  });
};