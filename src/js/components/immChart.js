/**
 * Immigration chart.
 * 
 */
var CHARTMAP = CHARTMAP || {};
CHARTMAP.immChart = {
  $container: null,
  w: null,
  h: null,
  verticalOffset: null,
  chartW: null,
  xScale: null,
  yScale: null,
  padding: null,
  format: null,
  init: function (svg, dataset, colorMap, w, h, verticalOffset, xScale, format) {
    var _this = this;
    this.format = format;
    this.colorMap = colorMap;
    this.w = w;
    this.h = h;
    this.verticalOffset = verticalOffset;
    this.chartW = 4;
    this.padding = {top: 20, right: 40, bottom: 20, left: 70};
    this.internalH = this.h - _this.padding.top - _this.padding.bottom;
    this.xScale = xScale;
    this.yScale = d3.scale.linear()
        .domain([
          d3.max(dataset, function (d) {
            return d.tot;
          }), 0
        ])
        .range([0, _this.h - _this.padding.bottom - _this.padding.top]);

    this.draw(dataset, svg);
  },
  draw: function (dataset, svg) {
    var _this = this;
    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom")
        .ticks(d3.time.year, 5);

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left")
        .ticks(10);

    // Add a group for each row of data
    var groups = svg.selectAll("g.rgroups2")
        .data(dataset)
        .enter()
        .append("g")
        .attr("class", "rgroups2")
        .attr('id', function(d){return 'immChart-'+d.period;})
        .attr("transform", "translate(" + this.padding.left
            + "," + (this.h + this.verticalOffset - this.padding.bottom)
            + ")");
    
    // Add a rect for each data value
    groups.each(function (d, index) {
      var _this2 = d3.select(this);
      _this.createRect(_this2, d.period, 0, d.tot);
    });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (this.padding.left - 1) + ","
            + (this.h + this.verticalOffset - this.padding.bottom) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + this.padding.left + ","
            + (this.padding.top + this.verticalOffset)+ ")")
        .call(yAxis);
  },
  createRect: function (el, period, start, value) {
    var _this = this;
    var year = null;
    
    if (period.indexOf('-') === -1) {
      year = +period;
      
      var r = el.append("rect")
          .attr("width", _this.xScale(new Date(year + 1, 0, 1)) - _this.xScale(new Date(year, 0, 1)) - 1)
          .attr("x", _this.xScale(new Date(year, 0, 1)))
          .attr("y", -this.internalH  + _this.yScale(value + start))
          .attr("height", this.internalH - _this.yScale(value));
      r.append("svg:title").text('immigration in year ' + period + ': ' + this.format(value.toFixed(0)));
      r.on("click", function (ev) {
        $( document ).trigger( "selectYear", [ period ] );
      });
      r.on("mouseover", function (ev) {
        _this.hoverBarChart (period, true);
      });
      r.on("mouseout", function (ev) {
        _this.hoverBarChart (period, false);
      });
    } else {
      var periods = period.split('-');
      if (periods[0] && periods[1]) {
        var startPeriod = new Date(periods[0].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
        if (periods[1].length === 4) {//go to end of the year
          periods[1] = +periods[1] + 1 + '';
        }
        var endPeriod = new Date(periods[1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
        var delta = endPeriod - startPeriod;
        //console.log('=======================>>>>>', endPeriod, startPeriod);
        delta = delta / 31540000000;
        var r2 = el.append("rect")
            .attr("width", _this.xScale(endPeriod) - _this.xScale(startPeriod) - 1)
            .attr("x", _this.xScale(startPeriod))
            .attr("y", -this.internalH  + _this.yScale((value / delta) + start))
            .attr("height", this.internalH - _this.yScale(value / delta));
        r2.append("svg:title").text('immigration in ' + period + ': ' + this.format(value.toFixed(0)));
        r2.on("click", function (ev) {
          $( document ).trigger( "selectYear", [ period ] );
        });
      }
    }
  },

  hoverBarChart: function (year, isHover){
    d3.select('rect#hover-'+year).classed('highlighted', isHover);
  }
};


