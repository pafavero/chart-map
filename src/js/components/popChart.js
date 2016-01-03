/**
 * Diagram for the population.
 */
var CHARTMAP = CHARTMAP || {};
CHARTMAP.popChart = {
  $container: null,
  w: null,
  h: null,
  internalH: null,
  chartW: 6,
  xScale: null,
  yScale: null,
  format: null,
  padding: {top: 20, right: 40, bottom: 20, left: 70},
  colorMap: null,
  init: function (svg, dataset, colorMap, w, h, xScale, format) {
    var _this = this;
    this.format = format;
    this.colorMap = colorMap;
    this.w = w;
    this.h = h;
    this.internalH = this.h - _this.padding.top - _this.padding.bottom;
    this.xScale = xScale;
    this.yScale = d3.scale.linear()
        .domain([
          d3.max(dataset, function (d) {
            return d.tot;
          }), 0
        ])
        .range([0, _this.h - _this.padding.bottom - _this.padding.top]);

    this.lineFunction = d3.svg.line()
        .x(function (d) {
          return _this.xScale(new Date(d.year, 0, 1));
        })
        .y(function (d) {
          return -_this.internalH + _this.yScale(d.value);
        })
        .interpolate('linear');

    this.draw(dataset, svg);
  },
  draw: function (dataset, svg) {
    var _this = this;
    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient('bottom')
        //.outerTickSize([20])
        .ticks(d3.time.year, 5);

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient('left')
        .ticks(10);

    // Add a group for each row of data
    var groups = svg.selectAll('g.rgroups')
        .data(dataset)
        .enter()
        .append('g')
        .attr('class', 'rgroups')
        .attr('id', function (d) {
          return 'popChart-' + d.year;
        })
        .attr('transform', 'translate(' + this.padding.left
            + ',' + (this.h - this.padding.bottom)
            + ')');

    // Add a rect/trapaze for each data value
    var prevValueJews = 0;
    var prevValueArabs = 0;
    var prevValueOthers = 0;
    groups.each(function (d, index) {
      var _this2 = d3.select(this);
      _this.createTrapeze(_this2, '$color-other', d.year,
          prevValueOthers + prevValueJews + prevValueArabs, d.others + d.jews + d.arabs, 'Others', d.others);
      _this.createTrapeze(_this2, '$color-arab', d.year,
          prevValueArabs + prevValueJews, d.arabs + d.jews, 'Arabs', d.arabs);
      _this.createTrapeze(_this2, '$color-israel', d.year, prevValueJews, d.jews, 'Jews', d.jews);

      prevValueJews = d.jews;
      prevValueArabs = d.arabs;
      prevValueOthers = d.others;
    });

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + (this.padding.left - 1) + ','
            + (this.h - this.padding.bottom) + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + this.padding.left + ','
            + this.padding.top + ')')
        .call(yAxis);
  },
  createTrapeze: function (el, colourIndex, year, prevValue, value, label, labelvalue) {
    var _this = this;
    var points = [];
    points.push({year: year, value: 0});
    points.push({year: year, value: prevValue});
    points.push({year: year + 1, value: value});
    points.push({year: year + 1, value: 0});
    
    var t = el.append('path')
        .attr('d', _this.lineFunction(points))
        .attr('fill', _this.colorMap[colourIndex]);
    t.append('svg:title').text(label + ', ' + year + ': ' + this.format(labelvalue.toFixed(0)));

    t.on("click", function (ev) {
      $(document).trigger("selectYear", [year]);
    });
    t.on("mouseover", function (ev) {
      _this.hoverBarChart(year, true);
    });
    t.on("mouseout", function (ev) {
      _this.hoverBarChart(year, false);
    });
  },
  hoverBarChart: function (year, isHover) {
    d3.select('rect#hover-' + year).classed('highlighted', isHover);
  }
};


