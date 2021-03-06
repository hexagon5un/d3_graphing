var graphData = function(url){
	var canvasWidth =  600;
	var canvasHeight = 300;

	var margin = {top: 20, right: 20, bottom: 30, left: 50}, // set margins
		width = canvasWidth - margin.left - margin.right,            // set width of canvas
		height = canvasHeight - margin.top - margin.bottom;           // set height of canvas

	var parseDate = d3.time.format("%Y-%m-%d").parse;        // define a function to parse date from string to Date object ("%d-%b-%y")

	var x = d3.time.scale()       // creates a time scale in the range of 0 to width defined above 
		.range([0, width]);       // "time scale" means that the scale is created based on DateTime values
								// x is assigned the time scale

	var y = d3.scale.linear()     // creates a linear scale
		.nice() // make it work with round numbers 
		.range([height, 0]);      // "linear scale" means that the scale is creatd based on just numbers
								// y is assigned the linear scale

	var xAxis = d3.svg.axis()     // creates the x-axis at the bottom and assign to xAxis variable
		.scale(x)
		.ticks(d3.time.week, 1)  // weekly ticks
		.orient("bottom");

	var yAxis = d3.svg.axis()     // creates the y-axis at the left and assign the yAxis variable
		.scale(y)
		.orient("left");

	var area = function(baseline){
		return d3.svg.area() // add in shading
		.x(function(d) { return x(d[0]); })
		.y0(y(baseline))
		.y1(function(d) { return y(d[1]); });
	}

	var line = d3.svg.line()      // creates the line generator and define how to extract x and y values from passed data
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[1]); });

	var svg = d3.select("body").append("svg")    // append svg tag (basic information about svg http://www.w3schools.com/html/html5_svg.asp)
		.attr("width", width + margin.left + margin.right)     // set the width attribute of the svg tag
		.attr("height", height + margin.top + margin.bottom)   // set the height attribute of the svg tag
	.append("g")                                             // append g tag (group shape together http://tutorials.jenkov.com/svg/g-element.html)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // call translate so that graph is shifted by left and top margins

	// Convenience accessor functions -- split up data entry into date, closing price
	var getDates = function(d) { return d[0]; }
	var getPrices = function(d) { return d[1]; }

	d3.json(url, function(error, data) {
		data.prices.forEach(function(element) {  // d contains each array element in ["2014-06-05", 48.630000000000003], ["2014-06-04", 47.880000000000003] ....
			element[0] = parseDate(element[0]); // converts string to Date Time object
			element[1] = +element[1]; // the "+" sign simply casts from string to number so that the prices is a array of numbers
		});

		x.domain(d3.extent(data.prices, getDates)); // extent returns the mininum and maximum values of the given array
													// https://github.com/mbostock/d3/wiki/Arrays#d3_extent
										// more on time scale domain https://github.com/mbostock/d3/wiki/Time-Scales#domain
		
		// Center graph around last entry
		var ymax = d3.max(data.prices, getPrices);
		var ymin = 	d3.min(data.prices, getPrices);
		var lastPrice = getPrices(data.prices[0]); // reverse-chron order (@_@)
		var halfRange = Math.max(ymax-lastPrice, lastPrice-ymin);
		y.domain([ lastPrice - halfRange, lastPrice + halfRange] );
	
		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," +  height + ")")
		.call(xAxis); // create another g element and paint xAxis

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis) // create another g element and paint yAxis
		.append("text")  // and append text 
				.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Closing Price ($)");

	svg.append("path")
		.datum(data.prices)
		.attr("class", "area")
		.attr("d", area(data.prices[0][1]));
	
	svg.append("path")
		.datum(data.prices)
		.attr("class", "line")
		.attr("d", line); // append path element in svg to draw the line 
		
		// add horizontal line at current price
	svg.append("path")
		.datum([data.prices[0], [data.prices[data.prices.length-1][0], data.prices[0][1]]])
		.attr("class", "line")
		.attr("class", "horizontal")
		.attr("d", line); // append path element in svg to draw the line 


	svg.selectAll("dot") // Add points to each closing price
		.data(data.prices)
		.enter().append("circle")
		.attr("r", 3.5)
		.attr("cx", function(d) { return x(d[0]); })
		.attr("cy", function(d) { return y(d[1]); })
		.on("mouseenter", function() {
			d3.select(this)
			.attr("fill", "yellow")
		})
		.on("mouseleave", function() {
			d3.select(this)
			.attr("fill", "black")
		})
	});
};


