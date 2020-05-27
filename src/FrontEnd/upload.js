const socket = io.connect("http://localhost:8080", {transports: ['websocket']});
socket.on('show_quest', show_question);
socket.on('edit_q', edit_q);
socket.on("rec_time",set_timer)
socket.on("default_username",show_username)
let timerInterval = null;
//function encodeImageFileAsURL(element) {
//  var file = element.files[0];
//  var reader = new FileReader();
//  reader.onloadend = function() {
//    socket.emit("receive_question",String(reader.result))
//  }
//  reader.readAsDataURL(file);
//}
var ques = ""

function send_srvr(){
    var s = document.getElementById("q").value;
    if(s == ""){
    }
    else{
    socket.emit("receive_question",s);
    }
    document.getElementById("q").value = "";
}

function show(){
    socket.emit("show_question");
    hide()
}

function show_question(question){
    document.getElementById('display_area').innerHTML = question
    ques = question
          var x = document.getElementById("myAudio");
          x.pause();
}

function edit_q(q){
    let arr = q.split("(_question-break_)")
    let formatted_queue = ""
    for(e of arr) {
        formatted_queue += ("<tr onclick='readyToHelp(this);'><td>"+e+"</td><td><input type='checkbox'></td></tr>")
    }
    document.getElementById("queue").innerHTML = "<tr><th>Question</th><th>Delete</th></tr>"+formatted_queue
    onTimesUp()
}

function re_display(){
    socket.emit("edit")
}

function hide(){
    document.getElementById("queue").innerHTML = ""
}

function readyToHelp(x) {
    socket.emit("pop_row", (x.rowIndex - 1));
    document.getElementById("queue").deleteRow(x.rowIndex);
}

function textbox(){
    document.getElementById("sh").innerHTML = '<br><input type="text" id = "q"><button onclick="send_srvr()">Submit</button><br>'
}

function image_to_text(){
    document.getElementById("sh").innerHTML = '<iframe src="ImageRecog.html" style="width:100%; border:0px;"></iframe>'
}

function fetch_img_data(){
    let data = document.getElementById("log").value
    console.log(data)
}

function clr(){
socket.emit("clr")
onTimesUp()
}

function download(){
socket.emit("download")
}




//------------Export to CSV-------------
$(document).ready(function () {

	function exportTableToCSV($table, filename) {

        var $rows = $table.find('tr:has(td),tr:has(th)'),

            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
            tmpColDelim = String.fromCharCode(11), // vertical tab character
            tmpRowDelim = String.fromCharCode(0), // null character

            // actual delimiter characters for CSV format
            colDelim = '","',
            rowDelim = '"\r\n"',

            // Grab text from table into CSV formatted string
            csv = '"' + $rows.map(function (i, row) {
                var $row = $(row), $cols = $row.find('td,th');

                return $cols.map(function (j, col) {
                    var $col = $(col), text = $col.text();

                    return text.replace(/"/g, '""'); // escape double quotes

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',



            // Data URI
            csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

            console.log(csv);

        	if (window.navigator.msSaveBlob) { // IE 10+
        		//alert('IE' + csv);
        		window.navigator.msSaveOrOpenBlob(new Blob([csv], {type: "text/plain;charset=utf-8;"}), "csvname.csv")
        	}
        	else {
        		$(this).attr({ 'download': filename, 'href': csvData, 'target': '_blank' });
        	}
    }

    // This must be a hyperlink
    $("#xx").on('click', function (event) {

        exportTableToCSV.apply(this, [$('#queue'), 'export.csv']);

        // IF CSV, don't do event.preventDefault() or return false
        // We actually need this to be a typical hyperlink
    });

});
//------------End Export----------

function down(){
    re_display();
    setTimeout(function(){
        document.getElementById('xx').click();
    }, 500);
}


function subm(){
var set_time = String(document.getElementById("set_time").value)
socket.emit("timer",set_time)
}

function onTimesUp() {
  clearInterval(timerInterval);
}

function set_timer(time_set){
socket.on('show_quest', onTimesUp);
// Credit: Mateusz Rybczonec
console.log(time_set)

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

var TIME_LIMIT = parseInt(time_set);
let timePassed = 0;
let timeLeft = TIME_LIMIT;

let remainingPathColor = COLOR_CODES.info.color;

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;

startTimer();


function startTimer() {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
      var x = document.getElementById("myAudio");
      x.play();
      socket.emit("receive_question",ques);
      document.getElementById('display_area').innerHTML = "Time's up!"
      document.getElementById("srch").style.display = "block";
    }
    else{
        document.getElementById("srch").style.display = "none";
    }
  }, 1000);
}

function formatTime(time) {
  var minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  var { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  var rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  var circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
}

function executeQuery(){
    console.log(ques)
    var element = google.search.cse.element.getElement('searchresults-only0');
      element.execute(ques);
}

function username(){
    socket.emit("new_user",String(document.getElementById("user").value))
    document.getElementById("hider").style.display = "block";
    document.getElementById("user_box").style.display = "none";
}

function show_username(us){
    document.getElementById("default_username").innerHTML = us
}

//function encodeImageFileAsURL(element) {
//  console.log(element)
//  var file = element.files[0];
//  var reader = new FileReader();
//  reader.onloadend = function() {
//    console.log('RESULT', reader.result)
//  }
//  reader.readAsDataURL(file);
//
//  $.getJSON("user.json", function(data) {
//      var incomplete = data.Incomplete
//      var complete = data.Completed
//      var time = data.time_set
//      incomplete += String(reader.result)
//      var finalized = {"Incomplete":incomplete,"Completed":complete,"time_set":time}
//      console.log(JSON.stringify(finalized))
//      socket.emit("saved_json",JSON.stringify(finalized))
//  });
//}
//
//function image(){
//    document.getElementById("sh").innerHTML = '<input type="file" onchange="encodeImageFileAsURL(this)" />'
//}
