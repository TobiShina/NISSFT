//http://api.football-data.org/index
//http://api.football-data.org/v1/competitions/426/leagueTable
//11c586940cbd432984afcd169ba8a8a8

/*
- dodać modal który będzie pokazywał detale o drużynie, dodać w ostatniej kolumnie przyciśk team info
- dodać najbliższą kolejkę obok tabeli
- dodać wyszukiwanie
- dodać sortowanie
- zrobić tak żeby wszystkie filtry działały jednocześnie
*/
var compare = {
  string: function(a,b) {
    if (a > b)
      return 1;
    else
      return (a < b) ? -1 : 0;
  },
  number: function(a,b) {
    return a - b;
  }
};

$(document).ready(function() {
  var $tableWrapper = $('.table-wrapper');
  var $table = $tableWrapper.find('.football-table');
  var $tableBody = $table.find('tbody');
  var $teams = [];

  function reorganizeTable($teamObj) {
    $teamObj.forEach(function($team) {
      $tableBody.append($team.$row);
    });
  }
  function getMinAndMax(table,prop) {
    var sortedTable = table.concat().sort(function(a,b) {
      return a.team[prop] - b.team[prop];
    });
    return {
      min: sortedTable[0].team[prop],
      max: sortedTable[sortedTable.length -1].team[prop]
    }
  }
  $.ajax({
    url: "http://api.football-data.org/v1/competitions/426/leagueTable",
    method: "GET",
    headers: {
      'X-Auth-Token': '11c586940cbd432984afcd169ba8a8a8'
    }
  }).done(function(json) {
    //console.log(json.leagueCaption);
    json.standing.forEach(function(team) {
      var $tr = $('<tr />');
      var td = '<td>' + team.position + '</td>';
      td += '<td><img class="crest" src="' + team.crestURI + '" alt="" /></td>';
      td += '<td>' + team.teamName + '</td>';
      td += '<td>' + team.playedGames + '</td>';
      td += '<td>' + team.points + '</td>';
      td += '<td>' + team.goals + '</td>';
      td += '<td>' + team.goalsAgainst + '</td>';
      td += '<td>' + team.goalDifference + '</td>';
      td += '<td>' + team.wins + '</td>';
      td += '<td>' + team.draws + '</td>';
      td += '<td>' + team.losses + '</td>';
      $tableBody.append($tr.html(td));
      $teams.push({
        team: team,
        $row: $tr
      });
    });

    $('.table-wrapper').on('click','th',function() {
      var $this = $(this);
      if ($this.is('.ascending') || $this.is('.descending')) {
        //alert("1");
        $this.toggleClass('ascending descending');
        $teams.reverse();
        reorganizeTable($teams);
      } else {
        //alert($(this).data('compare'));
        $this.siblings().removeClass('ascending descending');
        $this.addClass('ascending');
        var dataType = $this.data('type');
        var dataCompare = $this.data('compare');
        if (dataType === 'number') {
          $teams.sort(function(a,b) {
            a = a.team[dataCompare];
            b = b.team[dataCompare];
            return compare.number(a,b);
          });
          reorganizeTable($teams);
        } else if (dataType === 'string') {
          $teams.sort(function(a,b) {
            a = a.team.teamName;
            b = b.team.teamName;
            return compare.string(a,b);
          });
          reorganizeTable($teams);
        }
      }
    });

    function updateTable(table,prop,min,max) {
      table.forEach(function(team) {
        if (team.team[prop] < min || team.team[prop] > max) {
          team.$row.hide();
        } else {
          team.$row.show();
        }
      });
      /*if (table.team[prop] < min || table.team[prop] > max) {
        table.$row.hide();
      } else {
        table.$row.show();
      }*/
      //console.log(min,max);
      //console.log($teams.team[prop]);
    }
    //sliders
    function updateHandlers($slider,handlerEq) {
      $slider.find('.ui-slider-handle').eq(handlerEq).text($slider.slider('values',handlerEq));
    }

    var $sliderPoints = $('#slider-points');

    var pointsMinMax = getMinAndMax($teams,'points');
    $sliderPoints.slider({
      range: true,
      min: pointsMinMax.min,
      max: pointsMinMax.max,
      values: [ pointsMinMax.min, pointsMinMax.max ],
      slide: function( event, ui ) {
        //updateTable($teams,'points',goalsDiffCurrentMin,goalsDiffCurrentMax);
        updateTable($teams,'points',ui.values[0],ui.values[1]);
        //$('#slider-points').find('.ui-slider-handle').eq(0).text($('#slider-points').slider('values',0));
        updateHandlers($sliderPoints,0);
        updateHandlers($sliderPoints,1);
      },
      change: function( event, ui ) {
        //$('#slider-points').find('.ui-slider-handle').eq(0).text($('#slider-points').slider('values',0));
        updateHandlers($sliderPoints,0);
        updateHandlers($sliderPoints,1);
      }
    });

    var goalsDiffMinMax = getMinAndMax($teams,'goalDifference');
    var goalsDiffCurrentMin = goalsDiffMinMax[0],
        goalsDiffCurrentMax = goalsDiffMinMax[1];

    //var val = $('#slider').slider("option", "value");
    $('#slider-gd').slider({
      range: true,
      min: goalsDiffMinMax.min,
      max: goalsDiffMinMax.max,
      values: [ goalsDiffMinMax.min, goalsDiffMinMax.max ],
      slide: function( event, ui ) {
        updateTable($teams,'goalDifference',ui.values[0],ui.values[1]);
      }
    });

    //console.log(getMinAndMax($teams,'points'));
    //search
    var $searchForm = $('#search-form');
    var $seachField = $searchForm.find('#searchField');
    var $searchBtn = $searchForm.find('#searchBtn');

    $seachField.on('input',function() {
      var userInput = $(this).val().toLowerCase();

      $teams.forEach(function($team) {
        if ($team.team.teamName.toLowerCase().indexOf(userInput) === -1) {
          $team.$row.hide();
        } else {
          $team.$row.show();
        }
      });
    });
  });


});

/*=== questions ===
- should i put $.ajax method in $(document).ready?
- $this = $(this); is this correct? should I use $that instead?
*/
