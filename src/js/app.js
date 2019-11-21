import * as d3B from "d3"
import * as topojson from "topojson"
import cartels from 'raw-loader!./../assets/cartels.csv'
import map from '../geo/mexico.json';
import { $ } from "./util"

const d3 = Object.assign({}, d3B/*, d3Select*/, topojson/*, d3GeoProjection*/);

const cartelsData = d3.csvParse(cartels);

let year = "2016-2016"

d3.select(".date")
.html(year)

Object.getOwnPropertyNames(cartelsData[0]).map((o,i) => {
  if(i > 3){
    d3.select(".buttons")
          .append("button")
          .attr("type","button")
          .attr("class","btn-btn")
          .append("div")
          .attr("class","label")
          .text(o)
          .on('click', d => updateDorling(o))
  }
})

let cont = 0;

let width = $(".interactive-wrapper").getBoundingClientRect().width;
let height = width * 3 / 5;

let svg = d3.select(".interactive-wrapper")
.append("svg")
.attr("width", width)
.attr("height", height);

let simulation = d3.forceSimulation()
.force("charge", d3.forceManyBody().strength(-1.9))
.force("x", d3.forceX(d => d.x0))
.force("y", d3.forceY(d => d.y0))
.force("collide", d3.forceCollide().radius(d => d.r + 1))
.on("tick", tick)
.on('end', function() {
  console.log("end")
})

let projection = d3.geoMercator();

let path = d3.geoPath()
.projection(projection)

let radius = d3.scaleSqrt()
.domain([0, 140])
.range([0, 100]);

projection.fitExtent([[20, 100], [width, height]], topojson.feature(map, map.objects.mexico));

let geoMap = svg.append("path")
.datum(topojson.feature(map, map.objects.mexico))
.attr("d", path)
.style('fill', 'none')
.style('stroke', 'black');


let nodes = cartelsData.map(d => {

    let point = projection([d.lon, d.lat]);
    let value = +d[year];

    return {
      cartel: d.cartel,
      x: point[0], y: point[1],
      x0: point[0], y0: point[1],
      value: value,
      r: radius(value)
    }
  })

simulation.nodes(nodes)

let node = svg.selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("class", d => d.cartel)
  .attr("r", d => d.r )

let label = svg.selectAll("text")
  .data(nodes)
  .enter()
  .append("text")
  .text(d => d.cartel)
  .attr("opacity", d => d.value > 0 ? 1 : 0)


function updateDorling(date)
{

  d3.select(".date")
.html(date)

  nodes = cartelsData.map(d => {

    let point = projection([d.lon, d.lat]);
    let value = +d[date];

    return {
      cartel: d.cartel,
      x: point[0], y: point[1],
      x0: point[0], y0: point[1],
      value: value,
      r: radius(value)
    }
  })

  simulation.nodes(nodes);

  

  svg.selectAll("circle")
  .data(nodes)
  .transition(100)
  .attr("r", d => d.r )

  svg.selectAll("text")
  .attr("opacity", 0) 

  svg.selectAll("text")
  .data(nodes)
  .attr("opacity", d => d.value > 0 ? 1 : 0)


  simulation.alpha(1).restart();
}


function tick() {
  node
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)

  label
  .attr("x", d => d.x)
  .attr("y", d => d.y)
}




