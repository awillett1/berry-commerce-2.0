// countdown.js
// Adds a countdown to the market on the top header for ALL pages.

var countDownDate = new Date("Oct 10, 2025 11:00:00").getTime(); // fake date for market because i don't know real one atm
// this will need to be updated before each market

// update the count down every 1 second
var x = setInterval(function() {

  // get today's date and time
  var now = new Date().getTime();

  // find the distance between now and the count down date
  var distance = countDownDate - now;

  // time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // display the result
  document.getElementById("countdown").innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("countdown").innerHTML = "EXPIRED";
  }
}, 1000);