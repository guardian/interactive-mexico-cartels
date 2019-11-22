import * as d3B from "d3"
import * as topojson from "topojson"
import cartels from 'raw-loader!./../assets/cartels.csv'
import map from '../geo/mexico.json';
import { $ } from "./util"
import ScrollyTeller from "./scrollyteller"

const d3 = Object.assign({}, d3B/*, d3Select*/, topojson/*, d3GeoProjection*/);

const cartelsData = d3.csvParse(cartels);

let year = '1976-1980'

d3.select(".date")
.html(year)

let isMobile = window.matchMedia('(max-width: 420px)').matches;

let width = isMobile ? $(".scroll-inner").getBoundingClientRect().width : $(".scroll-inner").getBoundingClientRect().width / 2;
let height = width * 3 / 5;

let svg = d3.select(".scroll-inner")
.append("svg")
.attr("width", width)
.attr("height", height);

let simulation = d3.forceSimulation()
.force("charge", d3.forceManyBody().strength(-1.9))
.force("x", d3.forceX(d => d.x0))
.force("y", d3.forceY(d => d.y0))
.force("collide", d3.forceCollide().radius(d => d.r))
.on("tick", tick)
.on('end', function() {
  console.log("end")
})

let projection = d3.geoMercator();

let path = d3.geoPath()
.projection(projection)

let radius = d3.scaleSqrt()
.domain([0, 140])
.range([0, 50]);

projection.fitExtent([[20, 20], [width, height]], topojson.feature(map, map.objects.mexico));

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


Object.getOwnPropertyNames(cartelsData[0]).map((o,i) => {
  if(i > 2){

    
    let div = d3.select(".scroll-text")
    .append('div')
    .attr('class', 'scroll-text__inner')

    div.html(
            '<div class="scroll-text__div">' +
              '<p>'+ o +'</p>' +
              '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non ligula eu magna luctus venenatis. Vestibulum eu auctor enim, nec porttitor turpis. Praesent varius varius justo sit amet varius. Proin sed mauris eros. Nunc ut hendrerit felis. Quisque a neque et quam pharetra congue. Ut eros tellus, malesuada in dignissim sit amet, congue non augue. Sed cursus libero lectus, ac semper leo accumsan quis. Vestibulum ornare malesuada odio, vitae rhoncus mauris cursus ac. Curabitur quam nisi, scelerisque a lobortis nec, hendrerit at dui. Nullam lacinia lacinia magna vel dictum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras aliquet lacus eu efficitur tempor. </p>' +
            '</div>'
            )

    }
})

const scrolly = new ScrollyTeller({
    parent: document.querySelector("#scrolly-1"),
    triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
    triggerTopMobile: 0.7,
    transparentUntilActive: true
});


Object.getOwnPropertyNames(cartelsData[0]).map((o,i) => {
  if(i > 2){

   scrolly.addTrigger({num: i - 2, do: () => {
        updateDorling(o)
  }});

  }
})

scrolly.watchScroll();






