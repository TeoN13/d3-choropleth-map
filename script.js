// include d3
// include topojson
document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
  fetch(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"),

  fetch(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")]).


  then(([res1, res2]) => Promise.all([res1.json(), res2.json()])).
  then(([education, counties]) => {
    // Div the map will be generated in
    const container = d3.select("#container");
    const width = 1000; //container.node().getBoundingClientRect().width;
    const height = 650; //container.node().getBoundingClientRect().height;

    // The choropleth
    const svg = container.
    append("svg").
    attr("height", height).
    attr("width", width);


    const path = d3.geoPath();

    // Color scheme
    const eduMin = d3.min(education.map(d => d.bachelorsOrHigher));
    const eduMax = d3.max(education.map(d => d.bachelorsOrHigher));

    const colorNumber = 9;
    const colors = d3.schemePurples[colorNumber];
    const color = d3.
    scaleThreshold().
    domain(d3.range(eduMin, eduMax, (eduMax - eduMin) / colorNumber)).
    range(colors);

    // Set the counties
    svg.
    append("g").
    attr("class", "counties").
    selectAll("path").
    data(topojson.feature(counties, counties.objects.counties).features).
    enter().
    append("path").
    attr("class", "county").
    attr("data-fips", d => d.id).
    attr("data-education", function (d) {
      // Set the data-education attribute based on the education data for the county
      let educationLvl = education.find(edu => edu.fips == d.id);
      return educationLvl.bachelorsOrHigher;
    }).
    attr("fill", function (d) {
      // Set the fill color based on the education data for the county
      let educationLvl = education.find(edu => edu.fips == d.id);
      return color(educationLvl.bachelorsOrHigher);
    }).
    attr("d", path).
    on("mouseover", (event, d) => showTooltip(d)).
    on('mousemove', () => {
      d3.select("#tooltip").
      style("left", event.pageX + 10 + "px").
      style("top", event.pageY - 15 + "px");
    }).
    on("mouseout", function () {
      d3.select("#tooltip").style("display", "none");
    });

    // Extract the state data from the counties object using topojson.mesh()
    const states = topojson.mesh(
    counties,
    counties.objects.states,
    (a, b) => a !== b);


    // Draw states borders
    svg.
    append("path").
    datum(states).
    attr("class", "state").
    attr("fill", "none").
    attr("stroke", "#EEEEEE").
    attr('stroke-width', '2px').
    attr("d", path);

    createLegend();

    function createLegend() {
      // IMPORT D3 LEGEEEENDDD

      const legendWidth = 750;
      const legendHeight = 40;
      const legendBarLength = (legendWidth - 50) / colorNumber; // leave room for padding

      // Set up the legend scale
      let legendScale = d3.
      scaleLinear().
      domain([eduMin, eduMax]).
      rangeRound([0, legendWidth]);

      let colorRange = color.range().map(d => {
        let inverted = color.invertExtent(d);
        if (inverted[0] === undefined) {
          inverted[0] = legendScale.domain()[0];
        }
        if (inverted[1] === undefined) {
          inverted[1] = legendScale.domain()[1];
        }
        return inverted;
      });

      // Create the legend element
      let legend = d3.
      legendColor().
      labelFormat(d3.format(".0f")).
      labels(d3.legendHelpers.thresholdLabels).
      scale(legendScale).
      shapePadding(5).
      shapeWidth(legendBarLength).
      labelAlign("middle").
      orient("horizontal")
      //.title("Percentages")
      //.titleWidth(legendWidth)
      .cells(colorNumber).
      scale(color).
      labelDelimiter(" to ").
      labelOffset(10).
      cellFilter(function (d) {
        return d.label !== "";
      });

      // Append the legend element to the SVG
      let legendGroup = d3.
      select("#legend").
      append("svg").
      attr("class", "legend-container").
      attr("height", legendHeight).
      attr("width", legendWidth).
      call(legend);

    }

    function showTooltip(d) {
      // Show the tooltip
      d3.select("#tooltip").
      style("display", "block").
      style("left", event.pageX + 10 + "px").
      style("top", event.pageY - 15 + "px").
      attr("data-education", function () {
        // Set the data-education attribute of the tooltip based on the education data for the county
        let educationLvl = education.find(function (edu) {
          return edu.fips == d.id;
        });
        return educationLvl.bachelorsOrHigher;
      }).
      html(function () {
        // Set the content of the tooltip based on the county and education data
        let educationLvl = education.find(function (edu) {
          return edu.fips == d.id;
        });
        return (
          educationLvl.area_name +
          ", " +
          educationLvl.state +
          ": " +
          educationLvl.bachelorsOrHigher +
          "%");

      });
    }

  }).
  catch(error => console.error(error));
});