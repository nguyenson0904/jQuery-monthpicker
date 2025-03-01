(function ($) {
  $.fn.monthpicker = function (options) {
    // Merge default settings with any options passed in
    var settings = $.extend(
      {
        multiSelect: false, // Allow multiple selections (month–year pairs)
        showYearNav: false, // Show year navigation above the grid
        year: new Date().getFullYear(), // Default current year to display
        displayFormat: "MM/YYYY", // Format for display, e.g. 'MM/YYYY' or 'MM/YY'
        value: null, // Optional initial value (highest priority)
      },
      options
    );

    // Array of month names
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

    // Process each element individually
    return this.each(function () {
      var $elem = $(this);
      var currentYear = settings.year;
      // selections stores the selected month–year pairs as objects: { month: <number>, year: <number> }
      var selections = [];

      // Create the picker container (each element gets its own picker)
      var $picker = $('<div class="monthpicker-dropdown"></div>').css({
        display: "none",
        position: "absolute",
        border: "1px solid #ccc",
        background: "#fff",
        padding: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        zIndex: 9999,
      });

      // If year navigation is enabled, add a header with prev/next buttons
      if (settings.showYearNav) {
        var $yearNav = $('<div class="monthpicker-year-nav"></div>').css({
          textAlign: "center",
          marginBottom: "10px",
        });
        var $prev = $(
          '<span class="monthpicker-prev" style="cursor:pointer; margin-right:15px;">&lt;</span>'
        );
        var $yearDisplay = $(
          '<span class="monthpicker-year-display">' + currentYear + "</span>"
        );
        var $next = $(
          '<span class="monthpicker-next" style="cursor:pointer; margin-left:15px;">&gt;</span>'
        );
        $yearNav.append($prev, $yearDisplay, $next);
        $picker.append($yearNav);

        // Update currentYear and refresh grid on nav click
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

      // Create the grid container for month buttons
      var $grid = $('<div class="monthpicker-grid"></div>').css({
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "5px",
      });

      // Generate month buttons (each representing a month)
      $.each(months, function (index, month) {
        var $monthBtn = $(
          '<span class="monthpicker-month" data-month="' +
            index +
            '">' +
            month +
            "</span>"
        ).css({
          padding: "5px",
          textAlign: "center",
          cursor: "pointer",
          border: "1px solid #ddd",
          borderRadius: "3px",
        });
        $grid.append($monthBtn);
      });
      $picker.append($grid);
      $("body").append($picker);

      // -------------------------------
      // Formatting and Parsing Helpers
      // -------------------------------

      // Format a selection object using settings.displayFormat.
      // For example, if selection is {month: 0, year: 2022} and displayFormat is "MM/YYYY",
      // it returns "01/2022".
      function formatSelection(sel) {
        var month = sel.month + 1; // Convert 0-indexed month to human-readable format.
        var year = sel.year;
        return settings.displayFormat.replace(
          /(YYYY|YY|MM|M)/g,
          function (token) {
            switch (token) {
              case "YYYY":
                return year;
              case "YY":
                return ("" + year).slice(-2);
              case "MM":
                return (month < 10 ? "0" : "") + month;
              case "M":
                return month;
            }
          }
        );
      }

      // Parse a string (like "01/2022" or "02/25") into a selection object {month: <number>, year: <number>}.
      function parseSelection(str) {
        var tokenRegexMap = {
          YYYY: "(\\d{4})",
          YY: "(\\d{2})",
          MM: "(\\d{2})",
          M: "(\\d{1,2})",
        };
        var tokens = [];
        var regexStr = settings.displayFormat.replace(
          /(YYYY|YY|MM|M)/g,
          function (match) {
            tokens.push(match);
            return tokenRegexMap[match];
          }
        );
        var regex = new RegExp("^" + regexStr + "$");
        var match = regex.exec(str);
        if (match) {
          var result = {};
          for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            var value = match[i + 1];
            if (token === "YYYY") {
              result.year = parseInt(value, 10);
            } else if (token === "YY") {
              // Convert two-digit year: assume values < 50 are in 2000's, otherwise in 1900's.
              var yr = parseInt(value, 10);
              result.year = yr < 50 ? 2000 + yr : 1900 + yr;
            }
            if (token === "MM" || token === "M") {
              result.month = parseInt(value, 10) - 1; // adjust to 0-indexed month
            }
          }
          if (result.month !== undefined && result.year !== undefined) {
            return result;
          }
        }
        return null;
      }

      // Parse an initial value string that may contain multiple selections separated by commas.
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

      // Update the visual state of month buttons based on currentYear and selections.
      function updateGridSelections() {
        $grid.find(".monthpicker-month").each(function () {
          var monthIndex = $(this).data("month");
          var isSelected = selections.some(function (sel) {
            return sel.month === monthIndex && sel.year === currentYear;
          });
          if (isSelected) {
            $(this).addClass("selected").css({
              background: "#007bff",
              color: "#fff",
            });
          } else {
            $(this).removeClass("selected").css({
              background: "",
              color: "",
            });
          }
        });
      }

      // Update the element's display (using .val() or .text()) and its data attribute.
      function updateElementData() {
        var display = selections
          .map(function (sel) {
            return formatSelection(sel);
          })
          .join(", ");
        if ($elem.is("input, textarea")) {
          $elem.val(display);
        } else {
          $elem.text(display);
        }
        // Store a copy of the selections in the element's data attribute.
        $elem.data("monthpicker", selections.slice());
      }

      // -------------------------------
      // Initialization: Apply Existing Value
      // -------------------------------
      // Priority: settings.value (if provided) > element's value / data-value attribute.
      if (settings.value) {
        // settings.value can be a string or an array of selection objects.
        if (typeof settings.value === "string") {
          selections = parseInitialValue(settings.value);
        } else if (Array.isArray(settings.value)) {
          selections = settings.value;
        }
        updateElementData();
      } else {
        var initVal;
        if ($elem.is("input, textarea")) {
          initVal = $elem.val();
        } else {
          initVal = $elem.attr("data-value");
        }
        if (initVal) {
          selections = parseInitialValue(initVal);
          updateElementData();
        }
      }

      // -------------------------------
      // Main Interaction Code
      // -------------------------------

      // Position the picker below the element.
      function positionPicker() {
        var offset = $elem.offset();
        $picker.css({
          top: offset.top + $elem.outerHeight(),
          left: offset.left,
        });
      }

      // Show the picker when the element is clicked.
      $elem.on("click", function () {
        positionPicker();
        if (settings.showYearNav) {
          $picker.find(".monthpicker-year-display").text(currentYear);
        }
        updateGridSelections();
        $picker.show();
      });

      // Hide the picker when clicking outside the element or picker.
      $(document).on("mousedown", function (e) {
        if (!$(e.target).closest($picker).length && !$(e.target).is($elem)) {
          $picker.hide();
        }
      });

      // When a month button is clicked, toggle or set the month–year selection.
      $grid.find(".monthpicker-month").on("click", function () {
        var monthIndex = $(this).data("month");
        var exists = selections.some(function (sel) {
          return sel.month === monthIndex && sel.year === currentYear;
        });

        if (settings.multiSelect) {
          if (exists) {
            selections = selections.filter(function (sel) {
              return !(sel.month === monthIndex && sel.year === currentYear);
            });
          } else {
            selections.push({ month: monthIndex, year: currentYear });
          }
        } else {
          selections = [{ month: monthIndex, year: currentYear }];
        }
        updateGridSelections();
        updateElementData();
        if (!settings.multiSelect) {
          $picker.hide();
        }
      });

      // For input/textarea elements, update the data when the value changes manually.
      if ($elem.is("input, textarea")) {
        $elem.on("change", function () {
          updateElementData();
        });
      }
    });
  };
})(jQuery);
