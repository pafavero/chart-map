/**
 * Extracted from:
 * http://bl.ocks.org/milkbread/11000965#geometricFunctions.js
 */
var CHARTMAP = CHARTMAP || {};
CHARTMAP.geometricFunctions = {
  getIntersections: function (a, b, c) {
    // Calculate the euclidean distance between a & b
    eDistAtoB = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));

    // compute the direction vector d from a to b
    d = [(b[0] - a[0]) / eDistAtoB, (b[1] - a[1]) / eDistAtoB];

    // Now the line equation is x = dx*t + ax, y = dy*t + ay with 0 <= t <= 1.

    // compute the value t of the closest point to the circle center (cx, cy)
    t = (d[0] * (c[0] - a[0])) + (d[1] * (c[1] - a[1]));

    // compute the coordinates of the point e on line and closest to c
    var e = {coords: [], onLine: false};
    e.coords[0] = (t * d[0]) + a[0];
    e.coords[1] = (t * d[1]) + a[1];

    // Calculate the euclidean distance between c & e
    eDistCtoE = Math.sqrt(Math.pow(e.coords[0] - c[0], 2) + Math.pow(e.coords[1] - c[1], 2));

    // test if the line intersects the circle
    if (eDistCtoE < c[2]) {
      // compute distance from t to circle intersection point
      dt = Math.sqrt(Math.pow(c[2], 2) - Math.pow(eDistCtoE, 2));

      // compute first intersection point
      var f = {coords: [], onLine: false};
      f.coords[0] = ((t - dt) * d[0]) + a[0];
      f.coords[1] = ((t - dt) * d[1]) + a[1];
      // check if f lies on the line
      f.onLine = this.is_on(a, b, f.coords);

      // compute second intersection point
      var g = {coords: [], onLine: false};
      g.coords[0] = ((t + dt) * d[0]) + a[0];
      g.coords[1] = ((t + dt) * d[1]) + a[1];
      // check if g lies on the line
      g.onLine = this.is_on(a, b, g.coords);

      return {points: {intersection1: f, intersection2: g}, pointOnLine: e};

    } else if (parseInt(eDistCtoE) === parseInt(c[2])) {
      // console.log("Only one intersection");
      return {points: false, pointOnLine: e};
    } else {
      // console.log("No intersection");
      return {points: false, pointOnLine: e};
    }
  },
// BASIC GEOMETRIC functions
  distance: function (a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
  },
  is_on: function (a, b, c) {
    return this.distance(a, c) + this.distance(c, b) == this.distance(a, b);
  },
  getAngles: function (a, b, c) {
    // calculate the angle between ab and ac
    angleAB = Math.atan2(b[1] - a[1], b[0] - a[0]);
    angleAC = Math.atan2(c[1] - a[1], c[0] - a[0]);
    angleBC = Math.atan2(b[1] - c[1], b[0] - c[0]);
    angleA = Math.abs((angleAB - angleAC) * (180 / Math.PI));
    angleB = Math.abs((angleAB - angleBC) * (180 / Math.PI));
    return [angleA, angleB];
  }
};


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



/**
 * Handles the map. 
 */
var CHARTMAP = CHARTMAP || {};
CHARTMAP.map = {
  colorMap: null,
  yearMap: {
    delta2000to2012: {min: 2000, max: 2012, desc: '2000 - 2012'},
    delta1990to1999: {min: 1990, max: 1999, desc: '1990 - 1999'},
    delta1980to1989: {min: 1980, max: 1989, desc: '1980 - 1989'},
    delta1972to1979: {min: 1972, max: 1979, desc: '1972 - 1979'},
    delta1961to1971: {min: 1961, max: 1971, desc: '1961 - 1971'},
    delta1952to1960: {min: 1952, max: 1960, desc: '1952 - 1960'},
    delta1948to1951: {min: 1948, max: 1951, desc: '1948 - 1951'}
  },
  isrCoods: [35.05617977528097, 31.387884593941422],
  projection: null,
  dsv: null,
  svg: null,
  zoom: null,
  labelGroup: null,
  $legendTable: null,
  $legendDesc: null,
  //CONSTANTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  WIDTH: 800,
  HEIGHT: 400,
  CENTER: [35.05617977528097, 31.387884593941422],
  SCALE: 500,
  //METHODS PUBLIC~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  init: function (colorMap) {
    var _this = this;
    this.colorMap = colorMap;
    this.$legendTable = $('#legend-map>table');
    this.$legendDesc = $('#legend-map>p');
    this.dsv = d3.dsv(';', 'text/plain');
    this.projection = d3.geo.mercator()
        .center(this.CENTER)
        .scale(this.SCALE);
    this.path = d3.geo.path()
        .projection(this.projection);
    var mapContainer = d3.select('#israel-map');

    this.svg = mapContainer.append('svg:svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT);

    this.g = this.svg.append('g');
    this.addZoomToMap();

    this.addDefinitionForArrow('normal');
    $.when($.ajax('dist/data/ne_110m_admin_0_countries_v3.topo.json'),
        $.ajax('dist/data/cbs/birthLands.csv'),
        $.ajax('dist/data/landCoords.csv'))
        .done(function (data1, data2, data3) {
          _this.addMapData(data1);
          _this.addStatisticalLandData(data2, data3);
        });
  },
  /**
   * Update arrows and zoom level of the map based on the selected period
   * @param {type} chartYear
   */
  updateArrows: function (chartYear) {
    var _this = this;
    var _links = [];
    if (!$.isNumeric(chartYear)) {
      this.addLegend(null, null);
    } else {
      var _result = this.getOrderedLands(chartYear);
      var _orderedLand = _result[0];
      var _period = _result[1];

      this.addLegend(_orderedLand, _period);


      var _minX = _this.isrCoods[0] - 1;
      var _minY = _this.isrCoods[1] - 1;
      var _maxX = _this.isrCoods[0] - 1;
      var _maxY = _this.isrCoods[1] - 1;
      var _israelCircle = [_this.isrCoods[0], _this.isrCoods[1], 2];
      for (i = 0; i < 5; i++) {
        var _landCoord = _this.landCoords[_orderedLand[i].code];
        //console.log(_landCoord, _orderedLand[i].code);
        var _isrCoods = _this.isrCoods;
        var _intersectPoint = CHARTMAP.geometricFunctions.getIntersections(_landCoord, _this.isrCoods, _israelCircle);
        //console.log('_intersectPoint', _intersectPoint);
        if (_intersectPoint && _intersectPoint.points && _intersectPoint.points.intersection1) {
          _isrCoods = _intersectPoint.points.intersection1.coords;
        }
        _links.push({
          id: 'arrow_' + i,
          type: 'LineString',
          land: _orderedLand[i].land,
          coordinates: [
            _landCoord,
            _isrCoods
          ]
        });
        if (_minX > _landCoord[0])
          _minX = _landCoord[0];
        if (_maxX < _landCoord[0])
          _maxX = _landCoord[0];
        if (_minY > _landCoord[1])
          _minY = _landCoord[1];
        if (_maxY < _landCoord[1])
          _maxY = _landCoord[1];
      }
      var _bounds = [this.projection([_minX, _minY]), this.projection([_maxX, _maxY])];
      this.zoomToBound(_bounds);
    }
    // Standard enter / update 
    var pathArcs = this.g.selectAll('.arrow-link')
        .data(_links);

    //enter
    pathArcs.enter().append('path')
        .attr('marker-end', function (d) {
          return 'url(\#arrow-normal' + ')';
        })
        .attr('id', function (d) {
          return d.id;
        })
        .attr({
          'class': 'arrow-link'
        });

    this.addLabelToArrow(_links);
    
    pathArcs.exit().remove();
    
    //update
    pathArcs.attr({
      d: this.path
    });
  },
  // PRIVATE METHODS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  addLabelToArrow: function (links) {
    var _this = this;
    this.g.selectAll('.label-arrow').remove();
    links.forEach(function (el, index) {
      //console.log('test for text!!!  ', el, index);
      var text = _this.g.append('text')
          .attr('class', 'label-arrow');
      text.append('textPath')
          .attr('xlink:href', '#arrow_' + index)
          .attr('stroke', 'black')
          .style('text-anchor', 'middle') //place the text halfway on the arc
          .attr('startOffset', '50%')
          .text(el.land);
    });
  },
  addMapData: function (data1) {
    var featureCollection = topojson.feature(data1[0], data1[0].objects.ne_110m_admin_0_countries_v3);

    this.g.selectAll('path')
        .data(featureCollection.features)
        .enter().append('path')
        .attr('d', this.path)
        .attr('id', function (obj) {
          return 'path_' + obj.properties.ISO_A3;
        });
  },
  addStatisticalLandData: function (data2, data3) {
    this.landDataset = this.dsv.parse(data2[0]).map(function (d) {
      return {
        code: d.code,
        land: d.land,
        2014: +d['2014'],
        2013: +d['2013'],
        delta2000to2012: +d['2000-2012'],
        delta1990to1999: +d['2014'],
        delta1980to1989: +d['1980-1989'],
        delta1972to1979: +d['1972-1979'],
        delta1961to1971: +d['1961-1971'],
        delta1952to1960: +d['1952-1960'],
        delta1948to1951: +d['1948-1951']
      };
    });

    var _landCoords = this.dsv.parse(data3[0]).map(function (d) {
      return {
        code: d.code,
        lng: +d.lng,
        lat: +d.lat
      };
    });

    this.landCoords = [];
    var _this = this;
    _landCoords.forEach(function (el) {
      _this.landCoords[el.code] = [el.lng, el.lat];
    });
  },
  getOrderedLands: function (chartYear) {
    var _findfield = chartYear;
    for (var field in this.yearMap) {
      if (this.yearMap[field].min <= chartYear && this.yearMap[field].max >= chartYear) {
        _findfield = field;
        break;
      }
    }
    var orderedLand = this.landDataset.sort(function (a, b) {
      //console.log('a', a, findfield, a[findfield] - b[findfield])
      return b[_findfield] - a[_findfield];
    }, function (d) {
      return d.land;
    });
    return [orderedLand, _findfield];
  },
  addZoomToMap: function (g) {
    var _this = this;
    this.zoom = d3.behavior.zoom()
        .scaleExtent([0.43527528164806206, 2.6390158215457915])
        .on('zoom', function () {
          //          if (d3.event.translate[0] < -800 * d3.event.scale) {
          //            return null;
          //          }
          //          if (d3.event.translate[0] > 1000 * d3.event.scale) {
          //            return null;
          //          }
          //console.log('scale', d3.event.scale, 'translate', d3.event.translate);
          _this.g.attr('transform',
              'translate(' + d3.event.translate.join(',') + ')scale(' + d3.event.scale + ')');
        });
    this.svg.call(this.zoom);
  },
  zoomToBound: function (bounds) {
    var _this = this;
    var dx = Math.abs(bounds[1][0] - bounds[0][0]);
    var dy = Math.abs(bounds[1][1] - bounds[0][1]);
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    var _scale = 0.9 * Math.min(this.WIDTH / dx, this.HEIGHT / dy);
    //    console.log('_scale',_scale);
    if (_scale < 0.4352752)
      _scale = 0.44;
    if (_scale > 2.6390)
      _scale = 2.6;
    var _translate = [this.WIDTH / 2 - (_scale * x), this.HEIGHT / 2 - (_scale * y)];
    //    console.log('_translate', _translate);
    _this.zoom.translate(_translate).scale(_scale);
    _this.zoom.event(_this.g.transition().duration(1500));
  },
  /**
   *  Adds the definition to svgContainer of an arrow
   * @param {string} type - defines the type of arrow
   */
  addDefinitionForArrow: function (type) {
    this.svg.append('svg:defs')
        .append('svg:marker')
        .attr('id', 'arrow-' + type)
        .attr('viewBox', '0 0 30 8')
        .attr('refX', 25)
        .attr('refY', 4)
        .attr('markerUnits', 'strokeWidth')
        .attr('markerWidth', 25)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M 0 0 L 25 4 L 0 8 z');
  },
  /**
   * Add legend with the first 5 lands
   * @param {array} orderedLand
   * @param {string} period - year or interval of years
   */
  addLegend: function (orderedLand, period) {
    this.$legendTable.empty();
    if (period === null) {
      this.$legendDesc.text('NO VALUES FOR THIS PERIOD');
    } else {
      var _delta = this.yearMap[period];
      this.$legendDesc.text('Values related to the period ' +(_delta?_delta.desc:period));
      for (var _index = 0; _index < 5; _index++) {
        var _el = orderedLand[_index];
        this.$legendTable.append('<tr><td>' + _el.land + '</td><td>' + _el[period] + '</td></tr>');
      }
    }
  }
};


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
