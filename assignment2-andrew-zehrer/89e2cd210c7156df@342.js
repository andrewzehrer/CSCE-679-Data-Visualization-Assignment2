function _1(md){return(
md`# CSCE 679 Assignment 2
Andrew Zehrer

03/17/2025`
)}

function _data(FileAttachment){return(
FileAttachment("temperature_daily.csv").csv()
)}

function _parseDate(d3){return(
d3.utcParse("%Y-%m-%d")
)}

function _dataParsed(data,parseDate){return(
data.map(d => ({
  date: parseDate(d.date),
  max_temperature: +d.max_temperature,
  min_temperature: +d.min_temperature
}))
)}

function _dataProcessed(d3,dataParsed){return(
Array.from(
  d3.group(
    dataParsed.map(d => ({
      year: d.date.getUTCFullYear(),
      month: d.date.getUTCMonth() + 1,
      max: d.max_temperature, 
      min: d.min_temperature
    })), 
    d => d.year, 
    d => d.month
  ), 
  ([year, months]) => ({ 
    year, 
    values: Array.from(months, ([month, records]) => ({
      month, 
      max: d3.max(records, d => d.max), 
      min: d3.min(records, d => d.min)
    }))
  })
)
)}

function _tempExtremes(dataProcessed,d3)
{
  const allMaxTemperatures = dataProcessed.flatMap(d =>
    d.values.map(month => month.max)
  );
  
  const allMinTemperatures = dataProcessed.flatMap(d =>
    d.values.map(month => month.min)
  );

  // const MinOfMins = d3.min([...allMinTemperatures]);
  // const MaxOfMins = d3.max([...allMinTemperatures]);
  // const MinOfMaxes = d3.min([...allMaxTemperatures]);
  // const MaxOfMaxes = d3.max([...allMaxTemperatures]);

  return [d3.min([...allMinTemperatures]), d3.max([...allMaxTemperatures])];
}


function _width(){return(
900
)}

function _height(){return(
500
)}

function _margin(){return(
{ top: 50, right: 50, bottom: 0, left: 60 }
)}

function _xScale(d3,dataProcessed,margin,width){return(
d3.scaleBand()
  .domain(dataProcessed.map(d => d.year))
  .range([margin.left, width - margin.right])
  .padding(0.05)
)}

function _yScale(d3,margin,height){return(
d3.scaleBand()
  .domain(d3.range(1, 13))
  .range([margin.top, height - margin.bottom])
  .padding(0.05)
)}

function _colorScale(d3,tempExtremes){return(
d3.scaleSequential(d3.interpolateHslLong("purple", "red"))
  .domain([tempExtremes[0], tempExtremes[1]])
)}

function _legend(d3,colorScale,tempExtremes)
{
   const svg = d3.create("svg")
    .attr("width", 500)
    .attr("height", 50)
  
  // Define the gradient
  const gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient");

  // Create stops for the gradient based on color scale
  gradient.selectAll("stop")
    .data(colorScale.ticks().map(function(d, i) {
      return {offset: `${i / (colorScale.ticks().length - 1) * 100}%`, color: colorScale(d)};
    }))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  // Create a rectangle to represent the color scale
  svg.append("rect")
    .attr("width", 300)
    .attr("height", 20)
    .style("fill", "url(#gradient)");

  // Add labels to the legend
  svg.append("g")
    .attr("transform", "translate(0, 25)")
    .call(d3.axisBottom(d3.scaleLinear()
      .domain([tempExtremes[0], tempExtremes[1]])
      .range([0, 300]))
      .ticks(5)
      .tickFormat(d3.format(".0f")));

  return svg.node();
}


function _chart(d3,width,height,margin,dataProcessed,xScale,yScale,colorScale)
{
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("text")
  .attr("x", width / 2) 
  .attr("y", margin.top / 2) 
  .attr("text-anchor", "middle")
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .text("Max and Min Temperatures in Hong Kong (Click Anywhere to Toggle)");

  // Add a click event listener to toggle between max and min temperatures
  let showMax = true;
  svg.on("click", function () {
    showMax = !showMax;
    updateChart();
  });

  function updateChart() {
    // Create cells
    const cells = svg.selectAll("rect")
      .data(dataProcessed.flatMap(d => d.values.map(v => ({ ...v, year: d.year }))))
      .join("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(showMax ? d.max : d.min))
  
    // Tooltip
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid black")
      .style("visibility", "hidden");

    // Mouse event listeners
    cells.on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible")
          .html(`${d.month}/${d.year}<br>Max: ${d.max.toFixed(0)}, Min: ${d.min.toFixed(0)}`);
      })
      .on("mousemove", function (event) {
        tooltip.style("top", `${event.pageY + 5}px`)
          .style("left", `${event.pageX + 5}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      })
      .on("click", function () {
        tooltip.style("visibility", "hidden");
      })
      .on("mousedown", function () {
        tooltip.style("visibility", "hidden");
      })
      .on("mouseup", function () {
        tooltip.style("visibility", "hidden");
      });
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisTop(xScale).tickFormat(d3.format("d")));
  
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d3.timeFormat("%B")(new Date(2000, d - 1, 1))));
  }

  updateChart();

  return svg.node();
}


function _dataProcessedDaily(d3,dataParsed){return(
Array.from(
  d3.group(
    dataParsed.filter(d => d.date.getUTCFullYear() >= 2010)
      .map(d => ({
        year: d.date.getUTCFullYear(),
        month: d.date.getUTCMonth() + 1,
        day: d.date.getUTCDate(),
        max: d.max_temperature, 
        min: d.min_temperature
    })), 
    d => d.year, 
    d => d.month, 
    d => d.day
  ), 
  ([year, months]) => ({
    year, 
    values: Array.from(months, ([month, days]) => ({
      month, 
      dailyValues: Array.from(days, ([day, records]) => ({
        day, 
        max: d3.max(records, d => d.max),
        min: d3.min(records, d => d.min)
      })),
      monthlyMax: d3.max(Array.from(days, ([day, records]) => d3.max(records, d => d.max))),
      monthlyMin: d3.min(Array.from(days, ([day, records]) => d3.min(records, d => d.min)))
    }))
  })
)
)}

function _xScaleNew(d3,dataProcessedDaily,margin,width){return(
d3.scaleBand()
  .domain(dataProcessedDaily.map(d => d.year))
  .range([margin.left, width - margin.right])
  .padding(0.05)
)}

function _chart2(d3,width,height,margin,tempExtremes,dataProcessedDaily,xScaleNew,yScale,colorScale)
{
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("text")
  .attr("x", width / 2) 
  .attr("y", margin.top / 2) 
  .attr("text-anchor", "middle")
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .text("Max and Min Temperatures in Hong Kong with Daily Data (Click Anywhere to Toggle)");

  // Add a click event listener to toggle between max and min temperatures
  let showMax = true;
  svg.on("click", function () {
    showMax = !showMax;
    updateChart();
  });

  const lineScale = d3.scaleLinear()
  .domain([tempExtremes[0], tempExtremes[1]])  // Use global min and max
  .range([0, 35]);  // Scale the lines to fit within the rectangle's height

  function updateChart() {
    // Create cells
    const cells = svg.selectAll("rect")
      .data(dataProcessedDaily.flatMap(d => d.values.map(v => ({ ...v, year: d.year }))))
      .join("rect")
        .attr("x", d => xScaleNew(d.year))
        .attr("y", d => yScale(d.month))
        .attr("width", xScaleNew.bandwidth())
        .attr("height", 35)
        .attr("fill", d => colorScale(showMax ? d.monthlyMax : d.monthlyMin))

    // Add lines for daily max and min inside each rectangle
    cells.append("g")
      .selectAll("path")
      .data(d => {
        const dailyData = showMax ? d.dailyValues.map(dd => dd.max) : d.dailyValues.map(dd => dd.min);
        return [dailyData];
      })
      .join("path")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("d", function(d) {
        const line = d3.line()
          .x((d, i) => 3 * i)
          .y(d => lineScale(d));
        return line(d);
      });
  
    // Tooltip
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid black")
      .style("visibility", "hidden");

    // Mouse event listeners
    cells.on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible")
          .html(`${d.month}/${d.year}<br>Max: ${d.monthlyMax.toFixed(0)}, Min: ${d.monthlyMin.toFixed(0)}`);
      })
      .on("mousemove", function (event) {
        tooltip.style("top", `${event.pageY + 5}px`)
          .style("left", `${event.pageX + 5}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      })
      .on("click", function () {
        tooltip.style("visibility", "hidden");
      })
      .on("mousedown", function () {
        tooltip.style("visibility", "hidden");
      })
      .on("mouseup", function () {
        tooltip.style("visibility", "hidden");
      });
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisTop(xScaleNew).tickFormat(d3.format("d")));
  
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d3.timeFormat("%B")(new Date(2000, d - 1, 1))));
  }

  updateChart();

  return svg.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["temperature_daily.csv", {url: new URL("./files/b14b4f364b839e451743331d515692dfc66046924d40e4bff6502f032bd591975811b46cb81d1e7e540231b79a2fa0f4299b0e339e0358f08bef900595e74b15.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("parseDate")).define("parseDate", ["d3"], _parseDate);
  main.variable(observer("dataParsed")).define("dataParsed", ["data","parseDate"], _dataParsed);
  main.variable(observer("dataProcessed")).define("dataProcessed", ["d3","dataParsed"], _dataProcessed);
  main.variable(observer("tempExtremes")).define("tempExtremes", ["dataProcessed","d3"], _tempExtremes);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("xScale")).define("xScale", ["d3","dataProcessed","margin","width"], _xScale);
  main.variable(observer("yScale")).define("yScale", ["d3","margin","height"], _yScale);
  main.variable(observer("colorScale")).define("colorScale", ["d3","tempExtremes"], _colorScale);
  main.variable(observer("legend")).define("legend", ["d3","colorScale","tempExtremes"], _legend);
  main.variable(observer("chart")).define("chart", ["d3","width","height","margin","dataProcessed","xScale","yScale","colorScale"], _chart);
  main.variable(observer("dataProcessedDaily")).define("dataProcessedDaily", ["d3","dataParsed"], _dataProcessedDaily);
  main.variable(observer("xScaleNew")).define("xScaleNew", ["d3","dataProcessedDaily","margin","width"], _xScaleNew);
  main.variable(observer("chart2")).define("chart2", ["d3","width","height","margin","tempExtremes","dataProcessedDaily","xScaleNew","yScale","colorScale"], _chart2);
  return main;
}
