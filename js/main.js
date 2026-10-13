// Freedom Gathering: mobile nav, partner marquee, and the monthly outreach calendar.
document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.hamburger');
  var links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
  }

  // Duplicate each marquee track once so the scroll loops with no gap.
  document.querySelectorAll('.track').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (chip) {
      var copy = chip.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });

  var cal = document.getElementById('calendar');
  if (cal) buildCalendar(cal);
});

// The recurring schedule. Edit here and every calendar on the site updates.
// kind: 'weekly' (weekday), 'nth' (nth weekday of the month, -1 = last),
// or 'yearly' (nth weekday of a given month). day: 0 = Sunday ... 6 = Saturday.
var FG_EVENTS = [
  { kind: 'weekly', day: 3, title: 'Wednesday Gathering', place: 'Bradenton', note: 'Preaching, prayer and a home-cooked meal, then the mobile route' },
  { kind: 'nth', day: 0, n: 3, title: 'Bradenton Outreach', place: 'Bradenton', note: 'Monthly Sunday outreach' },
  { kind: 'nth', day: 0, n: -1, title: 'Arcadia Outreach', place: 'Arcadia', note: 'Monthly outreach, last Sunday' },
  { kind: 'yearly', month: 11, day: 6, n: 1, title: 'Manatee County Christmas', place: 'Manatee County', note: 'Christmas for families who might not otherwise have one', gold: true }
];

function nthWeekday(year, month, day, n) {
  if (n > 0) {
    var first = new Date(year, month, 1).getDay();
    var date = 1 + ((day - first + 7) % 7) + (n - 1) * 7;
    return date <= new Date(year, month + 1, 0).getDate() ? date : null;
  }
  var lastDate = new Date(year, month + 1, 0).getDate();
  var lastDay = new Date(year, month, lastDate).getDay();
  return lastDate - ((lastDay - day + 7) % 7);
}

function eventsFor(year, month) {
  var out = {};
  var add = function (date, ev) { (out[date] = out[date] || []).push(ev); };
  var days = new Date(year, month + 1, 0).getDate();
  FG_EVENTS.forEach(function (ev) {
    if (ev.kind === 'weekly') {
      for (var d = 1; d <= days; d++) if (new Date(year, month, d).getDay() === ev.day) add(d, ev);
    } else if (ev.kind === 'nth' || (ev.kind === 'yearly' && ev.month === month)) {
      var date = nthWeekday(year, month, ev.day, ev.n);
      if (date) add(date, ev);
    }
  });
  return out;
}

function buildCalendar(root) {
  var now = new Date();
  var view = new Date(now.getFullYear(), now.getMonth(), 1);
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function render() {
    var y = view.getFullYear(), m = view.getMonth();
    var evs = eventsFor(y, m);
    var html = '<div class="cal-bar"><button type="button" data-step="-1" aria-label="Previous month">&larr; Prev</button>' +
      '<h3 aria-live="polite">' + MONTHS[m] + ' ' + y + '</h3>' +
      '<button type="button" data-step="1" aria-label="Next month">Next &rarr;</button></div><div class="cal">';
    DOW.forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });
    var lead = new Date(y, m, 1).getDay();
    var days = new Date(y, m + 1, 0).getDate();
    for (var i = 0; i < lead; i++) html += '<div class="day out"></div>';
    var list = '<ul class="cal-list">';
    for (var d = 1; d <= days; d++) {
      var isToday = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
      html += '<div class="day' + (isToday ? ' today' : '') + '"><div class="num">' + d + '</div>';
      (evs[d] || []).forEach(function (ev) {
        html += '<span class="ev' + (ev.gold ? ' gold' : '') + '">' + ev.title + '</span>';
        list += '<li class="' + (ev.gold ? 'gold' : '') + '"><b>' + DOW[new Date(y, m, d).getDay()] + ', ' + MONTHS[m] + ' ' + d + ': ' + ev.title + '</b>' + ev.place + '. ' + ev.note + '</li>';
      });
      html += '</div>';
    }
    var trail = (7 - ((lead + days) % 7)) % 7;
    for (var t = 0; t < trail; t++) html += '<div class="day out"></div>';
    root.innerHTML = html + '</div>' + list + '</ul>';
    root.querySelectorAll('[data-step]').forEach(function (b) {
      b.addEventListener('click', function () { view.setMonth(view.getMonth() + Number(b.dataset.step)); render(); });
    });
  }
  render();
}
