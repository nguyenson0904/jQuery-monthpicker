(function ($) {
  $.fn.monthpicker = function (options) {
    // Merge default settings with options passed in
    var settings = $.extend(
      {
        multiSelect: false, // Allow multiple selections (month-year pairs)
        showYearNav: false, // Show year navigation above the grid
        year: new Date().getFullYear(), // Default current year to display
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

    // currentYear holds the currently displayed year in the grid
    var currentYear = settings.year;
    // selections stores the selected month–year pairs as objects: { month: <number>, year: <number> }
    var selections = [];

    // Create the picker container element
    var $picker = $('<div class="monthpicker-dropdown"></div>').css({
      display: "none",
      position: "absolute",
      border: "1px solid #ccc",
      background: "#fff",
      padding: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 9999,
    });

    // If year navigation is enabled, add a header with previous/next buttons
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

      // Bind the year navigation events: update currentYear and refresh grid selections
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

    // Generate month buttons (each button represents a month)
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
    // Append the picker to the body
    $("body").append($picker);

    // Function to update the visual state of month buttons based on the current year and selections
    function updateGridSelections() {
      $grid.find(".monthpicker-month").each(function () {
        var monthIndex = $(this).data("month");
        // Check if the month for the currently displayed year is selected
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

    // Function to update the input's data attribute and its visible value
    function updateInputData($input) {
      var display = selections
        .map(function (sel) {
          return (
            months[sel.month] + (settings.showYearNav ? " " + sel.year : "")
          );
        })
        .join(", ");
      $input.val(display);
      // Save a copy of the selections in the input's data attribute
      $input.data("monthpicker", selections.slice());
    }

    // Main plugin functionality for each element the plugin is initialized on
    return this.each(function () {
      var $input = $(this);

      // Position the picker below the input field
      function positionPicker() {
        var offset = $input.offset();
        $picker.css({
          top: offset.top + $input.outerHeight(),
          left: offset.left,
        });
      }

      // Show picker on input focus
      $input.on("focus", function () {
        positionPicker();
        // If year navigation is enabled, ensure the displayed year is current
        if (settings.showYearNav) {
          $picker.find(".monthpicker-year-display").text(currentYear);
        }
        updateGridSelections();
        $picker.show();
      });

      // Hide the picker when clicking outside the input or picker
      $(document).on("mousedown", function (e) {
        if (!$(e.target).closest($picker).length && !$(e.target).is($input)) {
          $picker.hide();
        }
      });

      // When a month button is clicked, record the month–year pair
      $grid.find(".monthpicker-month").on("click", function () {
        var monthIndex = $(this).data("month");
        // Check if this month–year pair already exists in selections
        var exists = selections.some(function (sel) {
          return sel.month === monthIndex && sel.year === currentYear;
        });

        if (settings.multiSelect) {
          if (exists) {
            // Remove the selection if it exists
            selections = selections.filter(function (sel) {
              return !(sel.month === monthIndex && sel.year === currentYear);
            });
          } else {
            // Add new selection
            selections.push({ month: monthIndex, year: currentYear });
          }
        } else {
          // For single selection, simply replace any previous selection
          selections = [{ month: monthIndex, year: currentYear }];
        }
        updateGridSelections();
        updateInputData($input);
        // In single selection mode, hide the picker after selection
        if (!settings.multiSelect) {
          $picker.hide();
        }
      });

      // If the input's value changes manually, update its data attribute as well
      $input.on("change", function () {
        updateInputData($input);
      });
    });
  };
})(jQuery);
