// Generated by CoffeeScript 1.6.3
(function() {
  $(function() {
    var clock, issueCompletion, issueCreation, issueEdit, socket, timer, today, waitTimer;
    socket = io.connect();
    socket.on('connect', function() {
      return console.log('hello sockets connected');
    });
    /*
    	Functions
    */

    today = moment().format('L');
    clock = setInterval(function() {
      return timer();
    }, 1000);
    timer = function() {
      var curr_time;
      curr_time = moment().format('h:mm:ss a');
      $('#teacherclock').text(curr_time);
      return $('#studentclock').text(curr_time);
    };
    setInterval(function() {
      return waitTimer();
    }, 1000);
    waitTimer = function() {
      return $('.issueTime').each(function() {
        var currTime, issueTime, wait, waitConv;
        currTime = moment().format('X');
        issueTime = $(this).attr('data-time');
        wait = currTime - issueTime;
        waitConv = moment(issueTime * 1000).fromNow();
        return $(this).next('.waitTime').text(waitConv);
      });
    };
    issueCreation = function(newIssue, username, displayName, isComplete) {
      var issueObj;
      issueObj = {
        newIssue: newIssue,
        username: username,
        displayName: displayName,
        isComplete: isComplete
      };
      return socket.emit('issueObj', issueObj);
    };
    issueEdit = function(id, text) {
      var issueEditObj;
      issueEditObj = {
        issueId: id,
        issue: text
      };
      return socket.emit('issueEditObj', issueEditObj);
    };
    issueCompletion = function(issueId, issueTime, comment) {
      var completeObj, currTime, totalWait;
      currTime = moment().format('X');
      totalWait = currTime - issueTime;
      completeObj = {
        issueId: issueId,
        totalWait: totalWait,
        isComplete: true,
        comment: comment
      };
      return socket.emit('completeObj', completeObj);
    };
    /*
    	Student side events
    */

    $('#now-btn').on('click', '#requestbtn', function() {
      var displayName, username;
      username = $(this).closest('body').find('#user-dropdown a').attr('data-id');
      displayName = $(this).closest('body').find('#user-dropdown a').attr('data-user');
      issueCreation('Needs Help', username, displayName, false);
      $(this).removeClass('tada').addClass('slideOutRight');
      return socket.on('issue', function(issue) {
        $('#requestbtn').removeClass('show').addClass('hidden');
        return $('#figurebtn').removeClass('slideOutLeft hidden').addClass('show animated slideInLeft').attr('data-id', issue._id).attr('data-time', issue.timeStamp);
      });
    });
    $('#now-btn').on('click', '#figurebtn', function() {
      var issueId, issueTime;
      issueId = $(this).attr('data-id');
      issueTime = $(this).attr('data-time');
      issueCompletion(issueId, issueTime, 'Figured out on own');
      $(this).removeClass('slideInLeft show').addClass('slideOutLeft hidden');
      return $('#requestbtn').removeClass('slideOutRight hidden').addClass('slideInRight show');
    });
    $('#help-form').on('submit', function(e) {
      var displayName, issueId, newIssue, username;
      e.preventDefault();
      newIssue = $('#issue').val();
      username = $(this).closest('body').find('#user-dropdown a').attr('data-id');
      displayName = $(this).closest('body').find('#user-dropdown a').attr('data-user');
      issueId = $(this).closest('body').find('#figurebtn').attr('data-id');
      if ($(this).closest('body').find('#requestbtn').hasClass('show')) {
        $(this).closest('body').find('#requestbtn').removeClass('tada').addClass('slideOutRight');
        $(this).closest('body').find('#requestbtn').removeClass('show').addClass('hidden');
        $(this).closest('body').find('#figurebtn').removeClass('slideOutLeft hidden').addClass('show animated slideInLeft');
        issueCreation(newIssue, username, displayName, false);
      } else {
        issueEdit(issueId, newIssue);
      }
      return $('#issue').val('');
    });
    $.get('/currReq', function(data) {
      var eachIssue, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        eachIssue = data[_i];
        _results.push($('#currReqTable tbody').append('<tr class="issueRow" data-id=' + eachIssue['_id'] + '>' + '<td class="edit" data-toggle="modal" data-target="#editRequestModal">Edit</td>' + '<td class="issueTime" data-time=' + eachIssue['timeStamp'] + '>' + eachIssue['time'] + '</td>' + '<td class="waitTime">' + each['totalWait'] + '</td>' + '<td class="issueDesc">' + eachIssue['issue'] + '</td>' + '</tr>'));
      }
      return _results;
    });
    $('#currReqTable').on('click', '.edit', function() {
      var issueDesc, issueId;
      $('#modalIssue').empty();
      issueDesc = $(this).next().next().next().text();
      issueId = $(this).parent().attr('data-id');
      $(this).closest('body').find('#modalSave').attr('data-id', issueId);
      return $(this).closest('body').find('#modalIssue').text(issueDesc);
    });
    $('#editRequestModal').on('click', '#modalSave', function() {
      var editText, issueId;
      editText = $(this).closest('.modal-content').find('#modalIssue').val();
      issueId = $(this).attr('data-id');
      issueEdit(issueId, editText);
      return $('#editRequestModal').modal('hide');
    });
    socket.on('issueEditObj', function(issueEditObj) {
      $('#helptable').find('.issueRow[data-id=' + issueEditObj.issueId + ']').find('.issueDesc').text(issueEditObj.issue);
      return $('#currReqTable').find('.issueRow[data-id=' + issueEditObj.issueId + ']').find('.issueDesc').text(issueEditObj.issue);
    });
    $.get('/pastReq', function(data) {
      var eachIssue, ttw, tw, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        eachIssue = data[_i];
        tw = each['totalWait'];
        ttw = secToMin(tw);
        _results.push($('#pastReqTable tbody').append('<tr class="issueRow" data-id=' + eachIssue['_id'] + '>' + '<td class="issueTime" data-time=' + eachIssue['timeStamp'] + '>' + eachIssue['time'] + '</td>' + '</td><td class="waitTime">' + ttw + '</td>' + '<td>' + eachIssue['issue'] + '</td>' + '<td>' + eachIssue['comment'] + '</td>' + '</tr>'));
      }
      return _results;
    });
    /*
    	Teacher side events
    */

    $('#date').text(today).attr('data-date', today);
    $('#teacherInput').on('submit', $('#lessonForm'), function(e) {
      var displayName, lessonInput, lessonObj, todaysDate, username;
      e.preventDefault();
      username = $(this).closest('body').find('#user-dropdown a').attr('data-id');
      displayName = $(this).closest('body').find('#user-dropdown a').attr('data-user');
      todaysDate = $(this).closest('#teacherInput').find('#date').attr('data-date');
      lessonInput = $(this).find('#lessonInput').val();
      if (lessonInput) {
        $(this).find('#lessonForm').slideUp() && $(this).closest('#teacherInput').find('#change-lesson').removeClass('hidden');
      } else {
        alert('Please enter a lesson plan');
      }
      lessonObj = {
        lesson: lessonInput,
        username: username,
        displayName: displayName
      };
      $(this).find('#lessonInput').val('');
      return socket.emit('lessonObj', lessonObj);
    });
    $('#teacherInput').on('click', '#change-lesson', function() {
      $(this).addClass('hidden');
      return $(this).closest('#teacherInput').find('#lessonForm').slideDown();
    });
    $.get('/found', function(data) {
      var eachIssue, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        eachIssue = data[_i];
        _results.push($('#helptable tbody').append('<tr class="issueRow animated flash" data-id=' + eachIssue['_id'] + '>' + '<td><input class="issueComplete" type="checkbox" data-id=' + eachIssue['_id'] + '></td>' + '<td>' + eachIssue['displayName'] + '</td>' + '<td class="issueTime" data-time=' + eachIssue['timeStamp'] + '>' + eachIssue['time'] + '</td>' + '<td class="waitTime"></td>' + '<td class="issueDesc">' + eachIssue['issue'] + '</td>' + '<td class="comment show">Add</td>' + '<td class="hidden commentbox"><form class="form-inline" role="form"><div class="input-group input-group-sm">' + '<input class="form-control input-sm" type="text" placeholder="Add comment...">' + '<span class="input-group-btn">' + '<button class="btn btn-default btn-sm" type="button">Add!</button>' + '</span></div></form></td>' + '</tr>'));
      }
      return _results;
    });
    socket.on('issue', function(issue) {
      return $('#helptable tbody').append('<tr class="issueRow animated flash" data-id=' + issue._id + '>' + '<td><input class="issueComplete" type="checkbox" data-id=' + issue._id + '></td>' + '<td>' + issue.displayName + '</td>' + '<td class="issueTime" data-time=' + issue.timeStamp + '>' + issue.time + '</td>' + '<td class="waitTime"></td>' + '<td class="issueDesc">' + issue.issue + '</td>' + '<td class="comment show">Add</td>' + '<td class="hidden commentbox"><form class="form-inline" role="form"><div class="input-group input-group-sm">' + '<input class="form-control input-sm" type="text" placeholder="Add comment...">' + '<span class="input-group-btn">' + '<button class="btn btn-default btn-sm" type="button">Add!</button>' + '</span></div></form></td>' + '</tr>');
    });
    /*
    	Idea: add sortability on current requests?
    */

    $('#helptable').on('click', '.comment', function() {
      $(this).removeClass('show').addClass('hidden');
      return $(this).next('.commentbox').removeClass('hidden').addClass('show');
    });
    $('#helptable').on('submit', '.commentbox', function(e) {
      var commentText;
      e.preventDefault();
      commentText = $(this).find('input').val();
      $(this).removeClass('show').addClass('hidden');
      return $(this).prev('.comment').removeClass('hidden').text(commentText);
    });
    $('#helptable').on('click', '.issueComplete', function() {
      var comment, issueId, issueTime;
      issueId = $(this).attr('data-id');
      issueTime = $(this).closest('.issueRow').find('.issueTime').attr('data-time');
      comment = $(this).closest('.issueRow').find('.comment').text();
      if (comment === 'Add') {
        comment = 'Completed';
      } else {
        comment;
      }
      return issueCompletion(issueId, issueTime, comment);
    });
    return socket.on('completeObj', function(completeObj) {
      $('#helptable').find('.issueRow[data-id=' + completeObj.issueId + ']').fadeOut('slow');
      $('#figurebtn').removeClass('slideInLeft show').addClass('slideOutLeft hidden');
      return $('#requestbtn').removeClass('slideOutRight hidden').addClass('slideInRight show');
    });
  });

}).call(this);
