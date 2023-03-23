import './App.css';
// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as d3 from "d3";
import React, {useState, useEffect, useRef } from 'react';

const App = () => {
  const [dataset, setDataset] = useState([]);
  
  //useEffect is used for fetching API as it would avoid any error when rendering the page
  useEffect (() => {
    fetchData();
  },[])

  async function fetchData() {
    try {
      await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
            .then(response => response.json())
            .then(data => setDataset(data.data));
    }

    catch(error) {
      console.error(error);
    }
  };
  console.log(dataset);


  return (
    <div className="App">
      <header className="App-header">
        <BarChart title="United States GDP" data={dataset}/>
      </header>
    </div>
  );
}

//Component for creating the barchart
const BarChart = ({title, data}) => {
  //useRef is used to select the svg element 
  const svgRef = useRef();

    //declaring the const variable 
    const h = 500;
    const w = 1200;
    const padding = 50;
    const topPadding = 10;
    const bottomPadding = 50;
    const usableHeight = h - topPadding - bottomPadding;
    const dataValue = data.map(value => value[1]);
    const dataDate = data.map(value => new Date(value[0]));
    const widthBar = (w -padding)/dataDate.length;
    const maxDate = new Date(d3.max(dataDate));
    const minDate = new Date(d3.min(dataDate));
    // console.log(dataValue);
    // console.log(dataDate);

    //declaring the variables needed for scale and axis
    const yScale = d3.scaleLinear().domain([0, d3.max(dataValue)]).range([usableHeight,0]);
    const xScale = d3.scaleTime().domain([minDate, maxDate.setMonth(maxDate.getMonth() + 3)]).range([padding, w - padding]);
    const axisY = d3.axisLeft(yScale);
    const axisX = d3.axisBottom(xScale);

    //declaring the svg by selecting the svgRef.current along with its attributes and styles
    const svg = d3.select(svgRef.current)
                  .attr("height", h)
                  .attr("width", w)
                  .style("background", "#f7f3ee")
                  .style("margin", "auto");

    //declaring the tooltip which will show the information of respective bar
   const tooltip = d3.select(".App-header")
                     .append("div")
                     .attr("id", "tooltip")
                     .style("opacity", 0);

    // selecting rect svg element to draw each bar with its respective data(value) that has been insert using the .data() and .enter() method
    svg.selectAll("rect")
      .data(dataValue)
      .enter()
      .append("rect")
      // .attr("x", (d, i) => i*widthBar + padding)
      .attr("x", (d, i) => xScale(dataDate[i]))
      .attr("y", (d) => topPadding + yScale(d))
      .attr("data-gdp", (d) => d)
      .attr("data-date", (d, i) => data[i][0])
      .attr("height", d => usableHeight - yScale(d))
      .attr("width", widthBar)
      .attr("class", "bar")
      .on("mouseover", function(event) {
         tooltip.html(this.getAttribute("data-date") + "<br> GDP: " + this.getAttribute("data-gdp") + " Billion USD")
                 .attr('data-date', this.getAttribute("data-date"))
                 .style('left', `${event.pageX - 60}px`)
                 .style('top', `${event.pageY}px`);
          tooltip.transition()
                 .duration(100)
                 .style("opacity", 0.9);
      })
      .on('mouseout', function() {
        tooltip.html('');
        tooltip.transition()
               .duration(100)
               .style('opacity', 0);
      })

    //calling the x and y axes by appending element g and the axes needed to be translated to put it into its correct position
    svg.append("g")
       .attr("id", "y-axis")
       .attr("transform", `translate(${padding}, ${topPadding})`)
       .call(axisY)

    svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", `translate(0, ${h - bottomPadding})`)
       .call(axisX)

  return (
    <div>
    <h1 id="title">{title}</h1>
    <svg ref={svgRef}></svg>
    <h6>Source: Federal Reserve Economic Data</h6>
    <h6><a href="https://github.com/mrlzchry/GDP-BarChart">Source code</a></h6>
    </div>
  )
}

export default App;