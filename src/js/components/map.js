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

