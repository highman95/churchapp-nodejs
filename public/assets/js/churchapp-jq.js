/**
 * Generic Utility JS functions and JQuery implementations
 */

$(function () {
  //if input[type=date/month/number] is not supported
  if (
    !Modernizr.inputtypes["date"] ||
    !Modernizr.inputtypes["month"] ||
    !Modernizr.inputtypes["number"]
  ) {
    $("input[type=date]")
      .datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "yy-mm-dd",
        yearRange: "-80:+0",
        showOn: "button",
        buttonImage: "assets/icons/calendar.gif",
        buttonText: "Choose Date",
        buttonImageOnly: true,
      })
      .attr("readonly", true);

    $("input[type=month]")
      .datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "yy-mm",
        yearRange: "-80:+0",
        showOn: "button",
        buttonImage: "assets/icons/calendar.gif",
        buttonText: "Choose Date",
        buttonImageOnly: true,
      })
      .attr("readonly", true);

    $("input[type=number]")
      .spinner({ numberFormat: "n", min: 0 })
      .css("border", "none");
  } else {
    if (Modernizr.touch && Modernizr.inputtypes.date) {
      //for touch-screens
      //document.getElementById('input[type=date]').type = 'date';
    }
  }

  //if a keyboard button is pressed on focussing pointer in input box of type=number, do this
  $("input[type=number]").keypress(function (evt) {
    var charCode = evt.charCode
      ? evt.charCode
      : evt.which
      ? evt.which
      : evt.keyCode;
    //alert(evt.keyCode);

    return evt.ctrlKey || charCode < 31 || (charCode >= 48 && charCode <= 57); //allow these ones only
  });

  //if a keyboard button is pressed on focussing pointer in input box with class=cash, do this
  $("input.cash").keypress(function (evt) {
    var charCode = evt.charCode
      ? evt.charCode
      : evt.which
      ? evt.which
      : evt.keyCode;

    var currentValue = $(this).val();
    //alert(charCode+' - '+currentValue);

    if (
      (currentValue == "" || currentValue.indexOf(".") != -1) &&
      charCode == 46
    )
      return false; //prevent decimal pt from being entered as first digit

    if (currentValue == "" && charCode == 48) return false; //prevent zero(0) from being entered as first digit

    //allow control key, one decimal pt and any other numeric values [0-9]
    return (
      evt.ctrlKey ||
      charCode == 46 ||
      charCode < 31 ||
      (charCode >= 48 && charCode <= 57)
    );
  });

  //attach decimal points if none exist before in the number
  $("input.cash").blur(function () {
    var currentValue = $(this).val().replace(/,/, "");
    var isnumberwtdecimal =
      currentValue == "" || currentValue.indexOf(".") != -1;

    if (!isnumberwtdecimal) currentValue = parseFloat(currentValue).toFixed(2);

    $(this).val(commafy(currentValue));
  });

  //$('input.cash').val(commafy($("input.cash").val()));//automatically fill up with comma-separator is a cash value
  var cashboxes = $("input.cash");

  for (var i = 0; i < cashboxes.length; i++) {
    cashboxes[i].value = commafy(cashboxes[i].value); //automatically fill up with comma-separator is a cash value
  }

  //for normal editting operations and reporting with dialogs
  $("#loading-dialog").dialog({
    bgiframe: true,
    autoOpen: false,
    height: 80,
    modal: true,
  });

  $("#message-dialog").dialog({
    bgiframe: true,
    autoOpen: false,
    width: 400,
    maxHeight: 200,
    modal: true,
    buttons: {
      Proceed: function () {
        $(this).dialog("close");
        location.reload(true);
      },
    },
  });
});

//my alternatives to alert();
function createmessagebox(data, iserror) {
  //check if we have any div with ID messagebox, clear the timeOut set previously and remove the box
  if (document.getElementById("messagebox") !== null) {
    clearTimeout(timeout);
    removemessagebox();
  }

  var messageboxelem = document.createElement("div");
  messageboxelem.setAttribute("id", "messagebox");
  messageboxelem.style.padding = "2px 10px";
  messageboxelem.style.margin = "20px 0 -20px";
  messageboxelem.style.color = iserror ? "#444" : "blue";
  messageboxelem.style.backgroundColor = "ivory";
  messageboxelem.style.border = "1px solid " + (iserror ? "red" : "#eee");
  messageboxelem.style.fontWeight = "bold";

  messageboxelem.innerHTML = data; //insert HTML into the messagebox
  //messageboxelem.appendChild(document.createTextNode(data));//insert text into the messagebox

  document
    .getElementById("data-output-wrapper")
    .insertBefore(messageboxelem, document.getElementById("data-output")); //place before the data output div
}

function removemessagebox() {
  var messageboxelem = document.getElementById("messagebox");
  messageboxelem.parentNode.removeChild(messageboxelem);
}

function removeElement(elemID) {
  var elem = document.getElementById(elemID); //alert(elemID);
  if (elem != null && elem != undefined) elem.parentNode.removeChild(elem);
}

function setbackgroundcolor(counter, divisor) {
  return is_mod_zero(counter, divisor) ? "#ffffff" : "#D8F1FA";
}

function is_mod_zero(counter, divisor) {
  return divisor > 0 ? counter % divisor == 0 : false;
}

function set_page_title(title) {
  document.title = title;
}

function iscash(boxObj, eventObj) {
  var charCode = eventObj.charCode
    ? eventObj.charCode
    : eventObj.which
    ? eventObj.which
    : eventObj.keyCode;
  var currentValue = boxObj.value; //alert(charCode+' - '+currentValue);

  if ((currentValue == "" || currentValue.indexOf(".") != -1) && charCode == 46)
    return false; //prevent decimal pt from being entered as first digit

  if (currentValue == "" && charCode == 48) return false; //prevent zero(0) from being entered as first digit

  //allow control key, one decimal pt and any other numeric values [0-9]
  return (
    eventObj.ctrlKey ||
    charCode == 46 ||
    charCode < 31 ||
    (charCode >= 48 && charCode <= 57)
  );
}

function setcashboxvalue(boxObj) {
  if (boxObj.value != "")
    boxObj.value = commafy(parseFloat(boxObj.value).toFixed(2));
}

function modernizrize() {
  //if input[type=date/month/number] is not supported
  if (
    !Modernizr.inputtypes["date"] ||
    !Modernizr.inputtypes["month"] ||
    !Modernizr.inputtypes["number"]
  ) {
    $("input[type=date]")
      .datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "yy-mm-dd",
        yearRange: "-80:+0",
        showOn: "button",
        buttonImage: "assets/icons/calendar.gif",
        buttonText: "Choose Date",
        buttonImageOnly: true,
      })
      .attr("readonly", true);

    $("input[type=month]")
      .datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "yy-mm",
        yearRange: "-80:+0",
        showOn: "button",
        buttonImage: "assets/icons/calendar.gif",
        buttonText: "Choose Date",
        buttonImageOnly: true,
      })
      .attr("readonly", true);

    $("input[type=number]")
      .spinner({ numberFormat: "n", min: 0 })
      .css("border", "none");
  } else {
    if (Modernizr.touch && Modernizr.inputtypes.date) {
      //for touch-screens
      //document.getElementById('input[type=date]').type = 'date';
    }
  }
}

function commafy(number) {
  if (number == "" || number == null || number == undefined) return;

  var parts = number.replace(/,/, "").split("."); //remove any commas in number first, then split on decimal pt.
  return (
    parts[0].replace(/\B(?=(\d{3})+(?=$))/g, ",") +
    (parts[1] ? "." + parts[1] : "")
  );
}

function getmonthname(monthno) {
  var monthname = "";
  if (monthno.toString().length == 1) monthno = "0" + monthno.toString();

  switch (monthno) {
    case "12":
      monthname = "December";
      break;
    case "11":
      monthname = "November";
      break;
    case "10":
      monthname = "October";
      break;
    case "09":
      monthname = "September";
      break;
    case "08":
      monthname = "August";
      break;
    case "07":
      monthname = "July";
      break;
    case "06":
      monthname = "June";
      break;
    case "05":
      monthname = "May";
      break;
    case "04":
      monthname = "April";
      break;
    case "03":
      monthname = "March";
      break;
    case "02":
      monthname = "February";
      break;
    case "01":
      monthname = "January";
      break;
  }

  return monthname;
}
