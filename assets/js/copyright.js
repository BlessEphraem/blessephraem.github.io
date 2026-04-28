(function () {
  var year = new Date().getFullYear();
  document.querySelectorAll('.copyright-year').forEach(function (el) {
    el.textContent = year;
  });
})();
