# MonthPicker.js


[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/nguyenson0904/monthpicker) [![Last Updated](https://img.shields.io/badge/updated-2024--03--25-green.svg)](https://github.com/nguyenson0904/monthpicker/releases) [![Author](https://img.shields.io/badge/author-NguyenSon-orange.svg)](https://github.com/nguyenson0904)


A lightweight, customizable jQuery plugin for selecting single or multiple months with optional year navigation.

## Features

- Single or multiple month selection
- Optional year navigation
- Customizable month and date formats
- Disabled date rules support
- Responsive grid layout
- Easy styling customization

## Installation

1. Include jQuery (3.6.0 or later recommended)
2. Include the MonthPicker files:

```html
<link rel="stylesheet" href="libs/monthPicker.css">
<script src="libs/monthPicker.js"></script>
```

## Basic Usage

```html
<input type="text" id="myMonthPicker" />

<script>
$(document).ready(function() {
    $("#myMonthPicker").monthpicker();
});
</script>
```
### Getting Selected Values

You can retrieve the selected month(s) using jQuery's `.data()` method:

```javascript
// Get the current selection(s)
var selections = $("#myMonthPicker").data("selections");

// For single selection mode, returns an object:
// { month: <0-11>, year: <YYYY> }

// For multiple selection mode, returns an array of objects:
// [{ month: <0-11>, year: <YYYY> }, ...]
```

Example usage:

```javascript
// Single selection
$("#singlePicker").monthpicker();
var selected = $("#singlePicker").data("selections");
console.log(selected); // e.g., { month: 0, year: 2024 } for January 2024

// Multiple selection
$("#multiPicker").monthpicker({ multiSelect: true });
var selections = $("#multiPicker").data("selections");
console.log(selections); // e.g., [{ month: 0, year: 2024 }, { month: 6, year: 2024 }]
```

Note: Month values are 0-based (January = 0, December = 11).

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multiSelect` | boolean | `false` | Enable multiple month selection |
| `showYearNav` | boolean | `true` | Show year navigation controls |
| `year` | number | current year | Initial year to display |
| `displayFormat` | string | `"MM/YYYY"` | Format for displaying selected dates |
| `gridMonthFormat` | string | `"MMMM"` | Format for month names in the grid |
| `value` | string | `null` | Initial selection(s) |
| `monthBase` | number | `1` | Month numbering base (January = 1) |
| `disabledRule` | function | `null` | Function to determine disabled months |
| `onMonthSelect` | function | `null` | Callback function after selection |

### Format Tokens

- `YYYY` or `yyyy`: Full year (e.g., 2023)
- `YY`: Two-digit year (e.g., 23)
- `MMMM`: Full month name (e.g., January)
- `MMM`: Short month name (e.g., Jan)
- `MM`: Two-digit month (e.g., 01)
- `M`: Single-digit month (e.g., 1)

## Examples

### Multiple Selection with Year Navigation

```javascript
$("#myMonthPicker").monthpicker({
    multiSelect: true,
    showYearNav: true,
    displayFormat: "MM yyyy",
    value: "01 2025, 06 2025, 03 2025"
});
```

### Custom Month Format with Disabled Rules

```javascript
$("#myMonthPicker").monthpicker({
    multiSelect: true,
    showYearNav: true,
    gridMonthFormat: "MM",
    disabledRule: function(month, year) {
        // Disable February and April in 2025
        return [1, 3].includes(month) && year === 2025;
    }
});
```

### Month-Only Selection

```javascript
$("#myMonthPicker").monthpicker({
    showYearNav: false,
    displayFormat: "MM",
    gridMonthFormat: "MMMM"
});
```

## Styling Customization

The MonthPicker comes with default styling that can be customized through CSS. Key classes include:

```css
.monthpicker-dropdown     /* Main container */
.monthpicker-year-nav     /* Year navigation bar */
.monthpicker-grid         /* Month grid container */
.monthpicker-month        /* Individual month cell */
.monthpicker-month.selected /* Selected month */
.monthpicker-month.disabled /* Disabled month */
```

## Browser Support

Supports all modern browsers that are compatible with jQuery 3.6.0 and later.

## License

MIT License
