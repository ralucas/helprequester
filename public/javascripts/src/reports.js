// Generated by CoffeeScript 1.8.0

/*
Reports for Teacher Side
 */
var filteredData, issueData, lessonData, sortedData, totalsObj;

issueData = [];

lessonData = [];

sortedData = [];

filteredData = [];

totalsObj = {};

$(function() {
  var buildSummaryTable, buildTable, filter, filterTime, secToMin, totalsBuild, totalsTable;
  secToMin = function(seconds) {
    var minutes;
    minutes = Math.ceil(seconds / 60);
    if (minutes === 1) {
      return 'Less than a minute';
    } else {
      return minutes + ' minutes';
    }
  };
  buildTable = function(arr) {
    var each, ttw, tw, _i, _len, _results;
    $('#reportsBody').empty();
    _results = [];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      each = arr[_i];
      tw = each['totalWait'];
      ttw = secToMin(tw);
      _results.push($('#reportsBody').append('<tr class="issueRow" data-id=' + each['_id'] + '>' + '<td class="displayName">' + each['displayName'] + '</td>' + '<td class="issueTime" data-time=' + each['timeStamp'] + '>' + each['time'] + '</td>' + '<td class="reportwaitTime">' + ttw + '</td>' + '<td>' + each['issue'] + '</td>' + '<td>' + each['comment'] + '</td>' + '</tr>'));
    }
    return _results;
  };
  totalsBuild = function(arr) {
    var avg, avgWait, countComms, countDate, countDay, countNames, countTerms, dates, dayObj, days, each, mostComm, mostDate, mostStudent, mostTerm, names, reqComms, reqTerms, strComms, strNames, strTerms, sumWait, totalIssues, _i, _len;
    totalIssues = arr.length;
    sumWait = _.reduce(arr, (function(memo, index) {
      return memo + index['totalWait'];
    }), 0);
    avg = sumWait / totalIssues;
    avgWait = Math.round(avg / 60);
    countDate = _.countBy(arr, 'date');
    mostDate = _.pick(_.invert(countDate), _.max(countDate));
    dates = _.pluck(arr, 'date');
    days = [];
    for (_i = 0, _len = dates.length; _i < _len; _i++) {
      each = dates[_i];
      days.push(moment(each).format('dddd'));
    }
    countDay = _.countBy(days);
    dayObj = _.pick(_.invert(countDay), _.max(countDay));
    reqTerms = _.pluck(arr, 'issue');
    strTerms = reqTerms.join(' ').split(' ');
    countTerms = _.countBy(strTerms);
    mostTerm = _.pick(_.invert(countTerms), _.max(countTerms));
    reqComms = _.pluck(arr, 'comment');
    strComms = reqTerms.join(' ').split(' ');
    countComms = _.countBy(strComms);
    mostComm = _.pick(_.invert(countComms), _.max(countComms));
    names = _.pluck(arr, 'displayName');
    strNames = names.join(' ').split(' ');
    countNames = _.countBy(strNames);
    mostStudent = _.pick(_.invert(countNames), _.max(countNames));
    totalsObj = {
      totalIssues: totalIssues,
      avgWait: avgWait,
      mostDate: mostDate,
      mostDay: dayObj,
      mostTerm: _.values(mostTerm).join(),
      mostComm: _.values(mostComm).join(),
      mostStudent: _.values(mostStudent).join()
    };
    return totalsTable(totalsObj);
  };
  totalsTable = function(obj) {
    $('#summaryBody').empty();
    $('#summaryBody').append('<tr class="summaryRow">' + '<td>' + obj['totalIssues'] + '</td>' + '<td>' + obj['avgWait'] + '</td>' + '<td>' + _.keys(obj['mostDate']).join() + '</td>' + '<td>' + _.keys(obj['mostDay']).join() + '</td>' + '<td>' + obj['mostTerm'] + '</td>' + '<td>' + obj['mostComm'] + '</td>' + '<td>' + obj['mostStudent'] + '</td>' + '</tr>');
    $('#summaryHeaders').find('.date-thead').text('Date with Most Requests: ' + _.values(obj['mostDate']).join());
    return $('#summaryHeaders').find('.day-thead').text('Day with Most Requests: ' + _.values(obj['mostDay']).join());
  };
  $.get('/reportsInfo', function(data) {
    issueData = data;
    buildTable(issueData);
    return totalsBuild(issueData);
  });
  $.get('lessonInfo', function(data) {
    return lessonData = data;
  });
  $('th').each(function() {
    return $(this).on('click', function() {
      var rsd, value;
      if ($(this).hasClass('sorted')) {
        $(this).addClass('reverse').removeClass('sorted');
        rsd = sortedData.reverse();
        return buildTable(rsd);
      } else {
        $(this).addClass('sorted').removeClass('reverse');
        value = $(this).attr('data-type');
        sortedData = _.sortBy(issueData, function(arr) {
          return arr[value];
        });
        return buildTable(sortedData);
      }
    });
  });
  filter = function(arr, key, value1, value2) {
    var each, output, _i, _len;
    output = [];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      each = arr[_i];
      if (each[key] >= value1 && each[key] <= value2) {
        output.push(each);
      }
    }
    return output;
  };
  filterTime = function(arr, key, value1, value2) {
    var each, output, _i, _len;
    output = [];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      each = arr[_i];
      if (moment(each[key]).format('HH:mm:ss') >= value1 && moment(each[key]).format('HH:mm:ss') <= value2) {
        output.push(each);
      }
    }
    return output;
  };

  /*
  	Filter/Search by name, date, time range, time waited, lesson, issue, comment
   */
  $('.search-menu').on('click', function() {
    var $searchInput, index, srchText;
    index = $(this).attr('data-type');
    srchText = $(this).text();
    $searchInput = $(this).closest('#reports').find('.search-input');
    $searchInput.find('.search-btn').text('Search by ' + srchText).attr('data-type', index);
    return $searchInput.removeClass('hidden').addClass('open');
  });
  $('#reports').on('click', '.search-btn', function(e) {
    var $searchval, index, searchResults, searchValue;
    e.preventDefault();
    $searchval = $(this).closest('.search-input').find('#search-value');
    searchValue = $searchval.val();
    index = $(this).attr('data-type');
    searchResults = search(issueData, searchValue, index);
    buildTable(searchResults);
    return $searchval.val('');
  });
  $('#reports').on('click', '.cancel-search', function(e) {
    var $searchInput;
    e.preventDefault();
    $searchInput = $(this).closest('#reports').find('.search-input');
    return $searchInput.addClass('hidden').removeClass('show');
  });
  $('#reports').on('click', '#date-btn', function() {
    return $('.date-row').removeClass('hidden').addClass('open');
  });
  $("#fromDate").datepicker({
    defaultDate: 0,
    changeMonth: true,
    numberOfMonths: 1,
    onClose: function(selectedDate) {
      return $("#toDate").datepicker("option", "minDate", selectedDate);
    }
  });
  $("#toDate").datepicker({
    defaultDate: "+1w",
    changeMonth: true,
    numberOfMonths: 1,
    onClose: function(selectedDate) {
      return $("#fromDate").datepicker("option", "maxDate", selectedDate);
    }
  });
  $('#reports').on('click', '#cancel-date', function() {
    return $('.date-row').addClass('hidden');
  });
  $('#reports').on('click', '#submit-date', function() {
    var fromDate, toDate;
    fromDate = $("#fromDate").val();
    toDate = $("#toDate").val();
    filteredData = filter(issueData, "date", fromDate, toDate);
    return buildTable(filteredData);
  });
  $('#fromTime').timepicker({
    'timeFormat': 'H:i:s'
  });
  $('#toTime').timepicker({
    'timeFormat': 'H:i:s'
  });
  $('#reports').on('click', '#time-btn', function() {
    return $('.time-row').removeClass('hidden').addClass('open');
  });
  $('#reports').on('click', '#cancel-time', function() {
    return $('.time-row').addClass('hidden');
  });
  $('#reports').on('click', '#submit-time', function() {
    var fromTime, toTime;
    fromTime = $("#fromTime").val();
    toTime = $("#toTime").val();
    filteredData = filterTime(issueData, "time", fromTime, toTime);
    return buildTable(filteredData);
  });
  $('#reports').on('click', '.reset-btn', function() {
    if ($(this).closest('.container').find('.filter-input').hasClass('open')) {
      $(this).closest('.container').find('.filter-input').removeClass('open').addClass('hidden');
    } else {
      console.log('no reset');
    }
    return buildTable(issueData);
  });
  buildSummaryTable = function(arr, key, headings) {
    var $sumTable, each, qty, requestsCount, _results;
    $sumTable = $('#summaryReports').find('#summaryReportsTable');
    $sumTable.find('thead').empty();
    $sumTable.find('tbody').empty();
    $sumTable.find('thead').append('<tr><th>' + headings[0] + '</th>' + '<th>' + headings[1] + '</th></tr>');
    requestsCount = _.countBy(issueData, key);
    _results = [];
    for (each in requestsCount) {
      qty = requestsCount[each];
      _results.push($sumTable.find('tbody').append('<tr>' + '<td>' + each + '</td>' + '<td>' + qty + '</td></tr>'));
    }
    return _results;
  };
  $('#userSumBtn').on('click', function() {
    return buildSummaryTable(issueData, 'displayName', ['Name', 'Number of Requests']);
  });
  $('#dateSumBtn').on('click', function() {
    return buildSummaryTable(issueData, 'date', ['Date', 'Number of Requests']);
  });
  $('#summResetBtn').on('click', function() {
    var $sumTable;
    $sumTable = $(this).closest('#summaryReports').find('#summaryReportsTable');
    $sumTable.find('thead').empty();
    return $sumTable.find('tbody').empty();
  });
});
