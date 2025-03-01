(function ($) {
  $.fn.monthpicker = function (options) {
    // Merge default settings with options passed in
    var settings = $.extend(
      {
        multiSelect: false, // Allow multiple selections
        showYearNav: true, // When false, year data is null (month-only mode)
        year: new Date().getFullYear(), // Default current year (used if showYearNav is true)
        displayFormat: "MM/YYYY", // Format for the element's value (supports tokens: YYYY, YY, MMMM, MMM, MM, M)
        gridMonthFormat: "MMMM", // Format for month names in the dropdown grid (supports MMMM, MMM, MM, M)
        value: null, // Optional initial value (has highest priority)
      },
      options
    );

    // Full month names array (used for formatting/parsing)
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
      // selections: each selection is an object { month: <number>, year: <number|null> }
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

      // Helper: Format a month (0-indexed) for the grid using gridMonthFormat.
      function formatMonthForGrid(monthIndex) {
        var monthNumber = monthIndex + 1;
        switch (settings.gridMonthFormat) {
          case "MMMM":
            return months[monthIndex];
          case "MMM":
            return months[monthIndex].substr(0, 3);
          case "MM":
            return (monthNumber < 10 ? "0" : "") + monthNumber;
          case "M":
            return monthNumber;
          default:
            return months[monthIndex];
        }
      }

      // Generate month buttons for the grid
      for (var i = 0; i < 12; i++) {
        var $monthBtn = $(
          '<span class="monthpicker-month" data-month="' +
            i +
            '">' +
            formatMonthForGrid(i) +
            "</span>"
        ).css({
          padding: "5px",
          textAlign: "center",
          cursor: "pointer",
          border: "1px solid #ddd",
          borderRadius: "3px",
        });
        $grid.append($monthBtn);
      }
      $picker.append($grid);
      $("body").append($picker);

      // -------------------------------
      // Formatting and Parsing Helpers
      // -------------------------------

      // Extended formatSelection: supports tokens YYYY, YY, MMMM, MMM, MM, M.
      function formatSelection(sel) {
        var month = sel.month + 1; // Convert 0-indexed to human-readable.
        // If not using year, ignore year tokens.
        if (!settings.showYearNav) {
          var fmt = settings.displayFormat.replace(/(YYYY|YY)/g, "");
          return fmt
            .replace(/(MMMM|MMM|MM|M)/g, function (token) {
              switch (token) {
                case "MMMM":
                  return months[sel.month];
                case "MMM":
                  return months[sel.month].substr(0, 3);
                case "MM":
                  return (month < 10 ? "0" : "") + month;
                case "M":
                  return month;
              }
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
              }
            }
          );
        }
      }

      // Extended parseSelection: if showYearNav is true, build a regex from displayFormat.
      // Supports tokens: YYYY, yyyy, YY, MMMM, MMM, MM, M.
      function parseSelection(str) {
        if (!settings.showYearNav) {
          // Try to parse as number first.
          var m = parseInt(str, 10);
          if (!isNaN(m)) {
            return { month: m - 1, year: null };
          }
          // If not numeric, try matching full month names or abbreviations.
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
          // Build regex using tokens in descending order of length.
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
                // Find full month index (case-insensitive)
                var idx = months.findIndex(function (m) {
                  return m.toLowerCase() === value.toLowerCase();
                });
                result.month = idx;
              } else if (token === "MMM") {
                var idxAbbr = months.findIndex(function (m) {
                  return m.substr(0, 3).toLowerCase() === value.toLowerCase();
                });
                result.month = idxAbbr;
              } else if (token === "MM" || token === "M") {
                result.month = parseInt(value, 10) - 1;
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

      // Parse an initial value string (may have multiple selections separated by commas)
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

      // Update the visual state of month buttons based on current year (if used) and selections.
      function updateGridSelections() {
        $grid.find(".monthpicker-month").each(function () {
          var monthIndex = $(this).data("month");
          var isSelected;
          if (settings.showYearNav) {
            isSelected = selections.some(function (sel) {
              return sel.month === monthIndex && sel.year === currentYear;
            });
          } else {
            isSelected = selections.some(function (sel) {
              return sel.month === monthIndex && sel.year === null;
            });
          }
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

      // Update the element's display (using .val() or .text()) and store selections in data attribute.
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
        $elem.data("monthpicker", selections.slice());
      }

      // -------------------------------
      // Initialization: Apply Existing Value
      // -------------------------------
      // Priority: settings.value > element's value (or data-value attribute)
      if (settings.value) {
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
      function positionPicker() {
        var offset = $elem.offset();
        $picker.css({
          top: offset.top + $elem.outerHeight(),
          left: offset.left,
        });
      }

      $elem.on("click", function () {
        positionPicker();
        if (settings.showYearNav) {
          $picker.find(".monthpicker-year-display").text(currentYear);
        }
        updateGridSelections();
        $picker.show();
      });

      $(document).on("mousedown", function (e) {
        if (!$(e.target).closest($picker).length && !$(e.target).is($elem)) {
          $picker.hide();
        }
      });

      $grid.find(".monthpicker-month").on("click", function () {
        var monthIndex = $(this).data("month");
        var exists;
        if (settings.showYearNav) {
          exists = selections.some(function (sel) {
            return sel.month === monthIndex && sel.year === currentYear;
          });
        } else {
          exists = selections.some(function (sel) {
            return sel.month === monthIndex && sel.year === null;
          });
        }

        if (settings.multiSelect) {
          if (exists) {
            if (settings.showYearNav) {
              selections = selections.filter(function (sel) {
                return !(sel.month === monthIndex && sel.year === currentYear);
              });
            } else {
              selections = selections.filter(function (sel) {
                return !(sel.month === monthIndex && sel.year === null);
              });
            }
          } else {
            if (settings.showYearNav) {
              selections.push({ month: monthIndex, year: currentYear });
            } else {
              selections.push({ month: monthIndex, year: null });
            }
          }
        } else {
          if (settings.showYearNav) {
            selections = [{ month: monthIndex, year: currentYear }];
          } else {
            selections = [{ month: monthIndex, year: null }];
          }
        }
        updateGridSelections();
        updateElementData();
        if (!settings.multiSelect) {
          $picker.hide();
        }
      });

      if ($elem.is("input, textarea")) {
        $elem.on("change", function () {
          updateElementData();
        });
      }
    });
  };
})(jQuery);
