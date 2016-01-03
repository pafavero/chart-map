/**
 * Contais 2 diagrams (one for the population and one for the immigrantion) and one map.
 */
var CHARTMAP = CHARTMAP || {};
CHARTMAP.main = {
  w: null,
  h: null,
  colorMap: [],
  xScale: null,
  format: null,
  // constants ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  START_YEAR: 1919,
  END_YEAR: 2015,
  padding: {top: 20, right: 40, bottom: 20, left: 70},
  init: function () {
    var dsv = d3.dsv(";", "text/plain");
    var _this = this;
    this.format = d3.format(',0n');
    $.when($.ajax("dist/data/cbs/population.csv"), $.ajax("dist/data/cbs/immigration.csv"),
        $.ajax("dist/js/constantsForJs.css"))
        .done(function (data1, data2, data3) {

          var colors = CSSJSON.toJSON(data3);
          _this.colorMap = colors.attributes;
          var _containerId = 'div#pop-chart';
          _this.$container = $(_containerId);
          _this.w = _this.$container.width();
          _this.h = _this.$container.height();

          var _svg = d3.select(_containerId)
              .append('svg')
              .attr('width', _this.w)
              .attr('height', _this.h);

          _this.xScale = d3.time.scale()
              .domain([new Date(_this.START_YEAR, 0, 1), new Date(_this.END_YEAR, 0, 1)])
              .rangeRound([0, _this.w - _this.padding.left - _this.padding.right]);

          _this.createHovers(_svg);

          //console.log(data1[0]);
          var dataset1 = dsv.parse(data1[0]).map(function (d) {
            return {
              others: +d.Others * 1000,
              arabs: +d.Arabs * 1000,
              jews: +d.Jews * 1000,
              tot: +d.tot * 1000,
              year: +d.year
            };
          });
          CHARTMAP.popChart.init(_svg, dataset1, _this.colorMap, _this.w, _this.h / 2,
              _this.xScale, _this.format);

          var dataset2 = dsv.parse(data2[0]).map(function (d) {
            return {
              notknown: +d.Notknown,
              americaAndOceania: +d.AmericaAndOceania,
              africa: +d.Africa,
              tot: +d.Total,
              period: d.Period
            };
          });
          CHARTMAP.immChart.init(_svg, dataset2, _this.colorMap,
              _this.w, _this.h / 2, _this.h / 2, _this.xScale, _this.format);
          CHARTMAP.map.init(_this.colorMap);
        });
    _this.addCustomEvent();
  },
  /*
   * Handles global events
   */
  addCustomEvent: function () {
    var _this = this;
    $(document).on("selectYear", null,
        function (event, year) {
          console.log('============================>>>>  select year:', year);
          _this.setSelected(year);
          CHARTMAP.map.updateArrows(year);
        });
  },
  createHovers: function (svg) {
    var _g = svg.append('g')
        .attr('class', 'hover-group')
        .attr('transform', 'translate(' + this.padding.left
            + ',' + 0 + ')');
    for (var year = this.START_YEAR + 1; year <= this.END_YEAR; year++) {
      this.createHoverRect(_g, year, this.h);
    }
  },
  createHoverRect: function (g, year, heigth) {
    var _this = this;
    var r = g.append("rect")
        .attr('id', 'hover-' + year)
        .attr("width", _this.xScale(new Date(year + 1, 0, 1)) - _this.xScale(new Date(year, 0, 1)) - 1)
        .attr("x", _this.xScale(new Date(year, 0, 1)))
        .attr("y", 0)
        .attr("height", heigth);
  },
  setSelected: function (year) {
    d3.select('rect.selected').classed('selected', false);
    if ($.isNumeric(year))
      d3.select('rect#hover-' + year).classed('selected', true);
  }
};
$(document).ready(function () {
  CHARTMAP.main.init();
});
