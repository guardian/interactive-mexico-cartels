import * as d3B from "d3"
//import * as d3Select from 'd3-selection'
import * as topojson from "topojson"
//import * as d3GeoProjection from "d3-geo-projection"
import cartels from 'raw-loader!./../assets/cartels.csv'
import map from '../geo/mexico.json';
import { $ } from "./util"

const d3 = Object.assign({}, d3B/*, d3Select*/, topojson/*, d3GeoProjection*/);

const cartelsData = d3.csvParse(cartels);

console.log(cartelsData)

let year = "2016-2016"
let datum;
let nodes;
let node;
let label;

d3.select(".date")
.html(year)

d3.select(".buttons")
          .append("button")
          .attr("type","button")
          .attr("class","btn-btn")
          .append("div")
          .attr("class","label")
          .text('2011-2012')
          .on('click', d => updateDorling('2011-2012'))

d3.select(".buttons")
          .append("button")
          .attr("type","button")
          .attr("class","btn-btn")
          .append("div")
          .attr("class","label")
          .text('2013-2013')
          .on('click', d => updateDorling('2013-2013'))

d3.select(".buttons")
          .append("button")
          .attr("type","button")
          .attr("class","btn-btn")
          .append("div")
          .attr("class","label")
          .text('2014-2014')
          .on('click', d => updateDorling('2014-2014'))
//.on('click', updateDorling('2016-2016'))

d3.select(".buttons")
          .append("button")
          .attr("type","button")
          .attr("class","btn-btn")
          .append("div")
          .attr("class","label")
          .text('2015-2015')
          .on('click', d => updateDorling('2015-2015'))

d3.select(".buttons")
          .append("button")
          .attr("type","button")
          .attr("class","btn-btn")
          .append("div")
          .attr("class","label")
          .text('2016-2016')
          .on('click', d => updateDorling('2016-2016'))



let width = $(".interactive-wrapper").getBoundingClientRect().width;
let height = width * 3 / 5;

let svg = d3.select(".interactive-wrapper")
.append("svg")
.attr("width", width)
.attr("height", height);


let simulation = d3.forceSimulation()
//.force('center', d3.forceCenter(width / 2, height / 2))
//.force("charge", d3.forceManyBody().strength(-1.9))
.force("x", d3.forceX(function(d) { return d.x0; }))
.force("y", d3.forceY(function(d) { return d.y0; }))
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


svg.append("path")
.datum(topojson.feature(map, map.objects.mexico))
.attr("d", path)
.style('fill', 'none')
.style('stroke', 'black');


let currentValues = []

  cartelsData.map(d => currentValues.push(+d[year]))

  nodes = cartelsData.map(d => {

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

  node = svg.selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("class", d => d.cartel)
  .attr("r", d => d.r )

  label = svg.selectAll("text")
  .data(nodes)
  .enter()
  .filter(d => d.value > 0)
  .append("text")
  .text(d => d.cartel) 


function updateDorling(date)
{

  d3.select(".date")
.html(date)


  svg.selectAll("circle").remove()
  svg.selectAll("text").remove()

  let ns = cartelsData.map(d => {

    let point = projection([d.lon, d.lat]);
    let value = +d[date];

    svg.select('[class="' + d.cartel + '"]')
    .attr("r", radius(value) )

    return {
      cartel: d.cartel,
      x: point[0],
      y: point[1],
      x0: point[0],
      y0: point[1],
      value: value,
      r: radius(value)
    }
  })

  simulation.nodes(ns)

  svg.selectAll("circle")
  .data(ns)
  .enter()
  .append("circle")
  .attr("class", d => d.cartel)
  .attr("r", d => d.r )

  
  svg.selectAll("text")
  .data(ns)
  .enter()
  .filter(d => d.value > 0)
  .append("text")
  .text(d => d.cartel)


  console.log('aksdjbc')
 


  simulation.alpha(1).restart()

}


function tick() {

  svg.selectAll("circle").attr("cx", function(d) { return d.x; })
  .attr("cy", function(d) { return d.y; });

  svg.selectAll("text").attr("x", function(d) { return d.x; })
  .attr("y", function(d) { return d.y; });
}




