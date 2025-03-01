// jQuery document ready
$(document).ready(function () {
  console.log("jQuery is ready!");

  // Setup the counter button
  setupCounter(document.querySelector("#counter"));

  // Example jQuery functionality
  $(".btn-outline-light").on("click", function () {
    window.open(
      "https://getbootstrap.com/docs/5.3/getting-started/introduction/",
      "_blank"
    );
  });

  $(".btn-outline-secondary").on("click", function () {
    window.open("https://jquery.com/", "_blank");
  });
});
