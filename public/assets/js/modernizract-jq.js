/**
 * Generic Modernizr JS implementations
 */

$(function() {
	if(!Modernizr.inputtypes['date'] || !Modernizr.inputtypes['month']){
		$('input[type=date]').datepicker({changeMonth: true, changeYear: true, dateFormat: 'yy-mm-dd',yearRange: '-80:+0', showOn: 'button', buttonImage: "assets/icons/calendar.gif",buttonText:'Choose Date',buttonImageOnly: true})
		                     .attr("readonly",true);

        $('input[type=month]').datepicker({changeMonth: true, changeYear: true, dateFormat: 'yy-mm',yearRange: '-80:+0', showOn: 'button', buttonImage: "assets/icons/calendar.gif",buttonText:'Choose Date',buttonImageOnly: true})
                              .attr("readonly",true);
	}
	else{
	    if(Modernizr.touch && Modernizr.inputtypes.date){//for touch-screens
	        //document.getElementById('input[type=date]').type = 'date';
	    }
	}
});
