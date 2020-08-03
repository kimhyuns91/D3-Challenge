var svgWidth = 1000;
var svgHeight = 800;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom - 40;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);


var xAxis = "poverty";
var yAxis = "healthcare"; 

// Import Data
d3.csv("D3_data_journalism/assets/data/data.csv").then(function(stateData) {

    // Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    //Create scale functions
    // ==============================
    var xLinearScale = scaleX(stateData, xAxis);
    var yLinearScale = scaleY(stateData, yAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    // ==============================
    var xLabelGroup = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)
      .classed("x-axis", true);


    var yLabelGroup = chartGroup.append("g")
      .call(leftAxis)
      .classed("y-axis", true);

    // Add Circles in the plot
    var circlesGroup = chartGroup.selectAll("stateCircle")
    .data(stateData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[xAxis]))
    .attr("cy", d => yLinearScale(d[yAxis]))
    .attr("r", "15")
    .attr("opacity", ".8");

    // Add texts inside the circle
    var textGroup = chartGroup.selectAll("stateText")
    .data(stateData)    
    .enter()
    .append("text")
    .classed("stateText",true)
    .attr("x", d => xLinearScale(d[xAxis]))
    .attr("y", d => yLinearScale(d[yAxis])*1.01)
    .text(d => (d.abbr))
    .style("font-size", "15")
    .attr("text-anchor", "middle")
    .attr("fill", "white");

    // Create axes labels

    // y axis label
    var health = addYAxis("Lacks Healthcare (%)", "active", 40);
    var smoke = addYAxis("Smokes (%)", "inactive", 20)
    var obesity= addYAxis("Obesity (%)", "inactive", 0)

    // x axis label
    var poverty = addxAxis("Poverty (%)", "active", 30)
    var age = addxAxis("Age (Median)", "inactive", 50)
    var income = addxAxis("Household Income (Median)", "inactive", 70)


    toolTip(xAxis, yAxis, circlesGroup);


}).catch(function(error) {
    console.log(error);
});

// Function for writing y axis name
function addYAxis(axisName, className, location){
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + location)
    .attr("x", 0 - (height)/2)
    .attr("dy", "1em")
    .classed("axisText", true)
    .classed(className, true)
    .classed("yAxis", true)
    .text(axisName);
};

// function for writing x axis name
function addxAxis(axisName, className, location){
    chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + location})`)
    .classed("axisText", true)
    .classed(className, true)
    .classed("xAxis", true)
    .text(axisName);
};

function scaleX(stateData, xAxis){
    var xdomain = d3.extent(stateData, d => d[xAxis]);

    var xLinearScale = d3.scaleLinear()
        .domain([xdomain[0]*0.9, xdomain[1]*1.1])
        .range([0, width]);

    return xLinearScale;
};

function scaleY(stateData, yAxis) {
    var ydomain = d3.extent(stateData, d => d[yAxis]);

    var yLinearScale = d3.scaleLinear()
    .domain([ydomain[0]*.8,ydomain[1]*1.1])
    .range([height, 0]);

    return yLinearScale;
};



function toolTip(xAxis,yAxis,circlesGroup){
    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
        return(
            `${d.state}<br> ${xAxis}: ${d[xAxis]} USD<br> ${yAxis}: ${d[yAxis]}`
        )
    });

    circlesGroup.call(toolTip);

    //add events
    circlesGroup.on("mouseover", toolTip.show)
    .on("mouseout", toolTip.hide);
};