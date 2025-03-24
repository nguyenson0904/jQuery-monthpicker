/**
 * jQuery Month Picker
 * Version: 1.0.0
 * Latest Update: 2024-01-09
 * Author: NguyenSon
 *
 * A flexible and customizable month picker jQuery plugin.
 */

(function ($) {
  $.fn.monthpicker = function (options) {
    // Merge default settings with any options passed in.
    var settings = $.extend(
      {
        multiSelect: false, // Allow multiple selections.
        showYearNav: true, // Enable year navigation.
        year: new Date().getFullYear(), // Default year.
        displayFormat: "MM/YYYY", // Format for display.
        gridMonthFormat: "MMMM", // Format for month names in grid.
        value: null, // Optional initial value.
        monthBase: 1, // Month numbering base (January = 1).
        disabledRule: null, // Callback: (month, year) => boolean
        onMonthSelect: null, // Callback function after selection.
      },
      options
    );

    // Full month names array.
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return this.each(function () {
      var $elem = $(this);
      var currentYear = settings.year;
      // Selections stored as objects: { month: <0-index>, year: <number|null> }
      var selections = [];

      // Create the picker container.
      var $picker = $('<div class="monthpicker-dropdown"></div>');

      // Add year navigation header if enabled.
      if (settings.showYearNav) {
        var $yearNav = $('<div class="monthpicker-year-nav"></div>');
        var $prev = $('<span class="monthpicker-prev">&lt;</span>');
        var $yearDisplay = $(
          '<span class="monthpicker-year-display">' + currentYear + "</span>"
        );
        var $next = $('<span class="monthpicker-next">&gt;</span>');
        $yearNav.append($prev, $yearDisplay, $next);
        $picker.append($yearNav);

        $prev.on("click", function () {
          currentYear--;
          $yearDisplay.text(currentYear);
          updateGridSelections();
        });
        $next.on("click", function () {
          currentYear++;
          $yearDisplay.text(currentYear);
          updateGridSelections();
        });
      }

      // Create the grid container for month buttons.
      var $grid = $('<div class="monthpicker-grid"></div>');

      // Helper: Returns formatted month name based on provided format.
      function getMonthName(index, format) {
        var monthNumber = index + settings.monthBase;
        var formats = {
          MMMM: months[index],
          MMM: months[index].substr(0, 3),
          MM: monthNumber < 10 ? "0" + monthNumber : "" + monthNumber,
          M: monthNumber,
        };
        return formats[format] || months[index];
      }

      // Format month for the grid.
      function formatMonthForGrid(monthIndex) {
        return getMonthName(monthIndex, settings.gridMonthFormat);
      }

      // Generate month buttons.
      for (var i = 0; i < 12; i++) {
        var $monthBtn = $(
          '<span class="monthpicker-month" data-month="' +
            i +
            '">' +
            formatMonthForGrid(i) +
            "</span>"
        );
        $grid.append($monthBtn);
      }
      $picker.append($grid);
      $("body").append($picker);

      // -------------------------------
      // Formatting and Parsing Helpers
      // -------------------------------

      // Format a selection object using settings.displayFormat.
      function formatSelection(sel) {
        var month = sel.month + settings.monthBase;
        if (!settings.showYearNav) {
          var fmt = settings.displayFormat.replace(/(YYYY|YY)/g, "");
          return fmt
            .replace(/(MMMM|MMM|MM|M)/g, function (token) {
              return token === "MMMM"
                ? months[sel.month]
                : token === "MMM"
                ? months[sel.month].substr(0, 3)
                : token === "MM"
                ? month < 10
                  ? "0" + month
                  : month
                : token === "M"
                ? month
                : "";
            })
            .trim()
            .replace(/^[\s\/]+|[\s\/]+$/g, "");
        } else {
          return settings.displayFormat.replace(
            /(YYYY|yyyy|YY|MMMM|MMM|MM|M)/g,
            function (token) {
              switch (token) {
                case "YYYY":
                case "yyyy":
                  return sel.year;
                case "YY":
                  return ("" + sel.year).slice(-2);
                case "MMMM":
                  return months[sel.month];
                case "MMM":
                  return months[sel.month].substr(0, 3);
                case "MM":
                  return (month < 10 ? "0" : "") + month;
                case "M":
                  return month;
                default:
                  return "";
              }
            }
          );
        }
      }

      // Convert a string into a selection object.
      function parseSelection(str) {
        if (!settings.showYearNav) {
          var m = parseInt(str, 10);
          if (!isNaN(m)) {
            return { month: m - settings.monthBase, year: null };
          }
          var lowered = str.toLowerCase();
          for (var i = 0; i < months.length; i++) {
            if (
              months[i].toLowerCase() === lowered ||
              months[i].substr(0, 3).toLowerCase() === lowered
            ) {
              return { month: i, year: null };
            }
          }
          return null;
        } else {
          var tokenRegexMap = {
            YYYY: "(\\d{4})",
            yyyy: "(\\d{4})",
            YY: "(\\d{2})",
            MMMM: "(" + months.join("|") + ")",
            MMM:
              "(" +
              months
                .map(function (m) {
                  return m.substr(0, 3);
                })
                .join("|") +
              ")",
            MM: "(\\d{2})",
            M: "(\\d{1,2})",
          };
          var tokenPattern = /(YYYY|yyyy|YY|MMMM|MMM|MM|M)/g;
          var tokens = [];
          var regexStr = settings.displayFormat.replace(
            tokenPattern,
            function (match) {
              tokens.push(match);
              return tokenRegexMap[match];
            }
          );
          var regex = new RegExp("^" + regexStr + "$", "i");
          var match = regex.exec(str);
          if (match) {
            var result = {};
            for (var i = 0; i < tokens.length; i++) {
              var token = tokens[i];
              var value = match[i + 1];
              if (token === "YYYY" || token === "yyyy") {
                result.year = parseInt(value, 10);
              } else if (token === "YY") {
                var yr = parseInt(value, 10);
                result.year = yr < 50 ? 2000 + yr : 1900 + yr;
              } else if (token === "MMMM") {
                result.month = months.findIndex(function (m) {
                  return m.toLowerCase() === value.toLowerCase();
                });
              } else if (token === "MMM") {
                result.month = months.findIndex(function (m) {
                  return m.substr(0, 3).toLowerCase() === value.toLowerCase();
                });
              } else if (token === "MM" || token === "M") {
                result.month = parseInt(value, 10) - settings.monthBase;
              }
            }
            if (
              result.month !== undefined &&
              (settings.showYearNav ? result.year !== undefined : true)
            ) {
              return result;
            }
          }
          return null;
        }
      }

      // Parse an initial value string that may contain multiple selections.
      function parseInitialValue(valueStr) {
        var parts = valueStr.split(",");
        var sels = [];
        for (var i = 0; i < parts.length; i++) {
          var sel = parseSelection(parts[i].trim());
          if (sel) {
            sels.push(sel);
          }
        }
        return sels;
      }

      // -------------------------------
      // UI Update Helpers
      // -------------------------------

      // Update visual state of month buttons.
      function updateGridSelections() {
        $grid.find(".monthpicker-month").each(function () {
          var monthIndex = $(this).data("month");
          var year = settings.showYearNav ? currentYear : null;
          var isSelected = settings.showYearNav
            ? selections.some(function (sel) {
                return sel.month === monthIndex && sel.year === currentYear;
              })
            : selections.some(function (sel) {
                return sel.month === monthIndex && sel.year === null;
              });
          if (isSelected) {
            $(this).addClass("selected");
          } else {
            $(this).removeClass("selected");
          }
          // Update disabled state using disabledRule (if provided).
          if (typeof settings.disabledRule === "function") {
            if (settings.disabledRule(monthIndex, year)) {
              $(this).addClass("disabled");
            } else {
              $(this).removeClass("disabled");
            }
          }
        });
      }

      // Update the element's display value and store the selections.
      function updateElementData() {
        var display = selections
          .map(function (sel) {
            return formatSelection(sel);
          })
          .join(", ");
        if ($elem.is("input, textarea")) {
          $elem.val(display);
        } else {
          // $elem.text(display);
        }
        // Store a copy with the month number adjusted based on monthBase.
        var outputSelections = selections.map(function (sel) {
          return { month: sel.month + settings.monthBase, year: sel.year };
        });
        $elem.data("monthpicker", outputSelections);
      }

      // Combined update.
      function applySelectionChanges() {
        updateGridSelections();
        updateElementData();
      }

      // -------------------------------
      // Selection Helpers
      // -------------------------------

      function isMonthSelected(monthIndex, year) {
        return selections.some(function (sel) {
          return sel.month === monthIndex && sel.year === year;
        });
      }

      function toggleSelection(monthIndex, year) {
        if (settings.multiSelect) {
          if (isMonthSelected(monthIndex, year)) {
            selections = selections.filter(function (sel) {
              return !(sel.month === monthIndex && sel.year === year);
            });
          } else {
            selections.push({ month: monthIndex, year: year });
          }
        } else {
          if (isMonthSelected(monthIndex, year)) {
            selections = [];
          } else {
            selections = [{ month: monthIndex, year: year }];
          }
        }
        if (settings.onMonthSelect) {
          settings.onMonthSelect(monthIndex + settings.monthBase, year);
        }
        applySelectionChanges();
      }

      // -------------------------------
      // Initialization: Apply Existing Value
      // -------------------------------
      if (settings.value) {
        if (typeof settings.value === "string") {
          selections = parseInitialValue(settings.value);
        } else if (Array.isArray(settings.value)) {
          selections = settings.value;
        }
        updateElementData();
      } else {
        var initVal = $elem.is("input, textarea")
          ? $elem.val()
          : $elem.attr("data-value");
        if (initVal) {
          selections = parseInitialValue(initVal);
          updateElementData();
        }
      }

      // -------------------------------
      // Main Interaction Code
      // -------------------------------

      function positionPicker() {
        var offset = $elem.offset();
        var elemHeight = $elem.outerHeight();
        var pickerHeight = $picker.outerHeight();
        var pickerWidth = $picker.outerWidth();
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        var scrollTop = $(window).scrollTop();
        var scrollLeft = $(window).scrollLeft();

        // Calculate available space in different directions
        var spaceAbove = offset.top - scrollTop;
        var spaceBelow = windowHeight - (offset.top - scrollTop + elemHeight);
        var spaceRight = windowWidth - (offset.left - scrollLeft);

        // Default position (below and aligned left)
        var top = offset.top + elemHeight;
        var left = offset.left;

        // Check vertical position
        if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
          // Position above if there's more space
          top = offset.top - pickerHeight;
        }

        // Check horizontal position
        if (spaceRight < pickerWidth) {
          // Align right edge with input right edge
          left = offset.left + $elem.outerWidth() - pickerWidth;
        }

        // Ensure the picker stays within viewport bounds
        left = Math.max(scrollLeft, Math.min(left, windowWidth + scrollLeft - pickerWidth));
        top = Math.max(scrollTop, Math.min(top, windowHeight + scrollTop - pickerHeight));

        $picker.css({
          top: top,
          left: left
        });
      }

      // Add control object with dispose and toggle functions
      var control = {
        dispose: function() {
          // Remove event listeners
          $elem.off('click');
          if ($elem.is('input, textarea')) {
            $elem.off('change');
          }
          $prev && $prev.off('click');
          $next && $next.off('click');
          $grid.find('.monthpicker-month').off('click');
          $(document).off('mousedown');

          // Remove DOM elements
          $picker.remove();

          // Clear data
          $elem.removeData('monthpicker');
          $elem.removeData('monthPickerControl');
        },
        toggle: function(show) {
          if (show === undefined) {
            $picker.toggle();
          } else if (show) {
            $picker.show();
            requestAnimationFrame(function() {
              positionPicker();
              if (settings.showYearNav) {
                $picker.find(".monthpicker-year-display").text(currentYear);
              }
              updateGridSelections();
            });
          } else {
            $picker.hide();
          }
        }
      };

      // Store control object in element's data
      $elem.data('monthPickerControl', control);

      // Modify click handler to use toggle
      $elem.on("click", function () {
        control.toggle(true);
      });

      // Modify document click handler to use toggle
      $(document).on("mousedown", function (e) {
        if (!$(e.target).closest($picker).length && !$(e.target).is($elem)) {
          control.toggle(false);
        }
      });

      // Modify grid click handler to use toggle
      $grid.find(".monthpicker-month").on("click", function () {
        if ($(this).hasClass("disabled")) return;
        var monthIndex = $(this).data("month");
        var year = settings.showYearNav ? currentYear : null;
        toggleSelection(monthIndex, year);
        if (!settings.multiSelect) {
          control.toggle(false);
        }
      });

      if ($elem.is("input, textarea")) {
        $elem.on("change", function () {
          var value = $(this).val().trim();
          if (!value) {
            selections = [];
            applySelectionChanges();
          } else {
            var parsed = parseInitialValue(value);
            if (parsed.length > 0) {
              selections = parsed;
              applySelectionChanges();
            }
          }
        });
      }
    });
  };
})(jQuery);
