import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class CoastTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'tick-rate': {'min': 15, 'max': 20},
        'width': 2,
        'contours': 2,
        'contour-spacing': 5,
        'smoothing-method': 'catmull-rom',
        'smoothing-factor': {'min': 0.5, 'max': 0.5}
      },
      'tick': 0,
      'tickThreshold': 8,
      'brushOn': false,
      'lastX': 0,
      'lastY': 0,
      'active': "inactive",
      'toolname': 'coast-brush',
      'currentItem': null,
    };
  }

  componentDidMount() {
    if (this.props.activeTool) { // we also have MapTool.state.active
      this.handleClick();
    }
    this.initToolParameters();
  }

  initToolParameters() {
    let params = this.state.params;
    let presets = this.state.presets;

    $('#coast-brush-tick-rate').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0,
      max: 200,
      from: params['tick-rate']['min'],
      to: params['tick-rate']['max'],
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#coast-brush-width').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 1,
      max: 30,
      from: params['width'],
      postfix: "px",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#coast-brush-contours').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 1,
      max: 10,
      from: params['contours'],
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#coast-brush-contour-spacing').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 3,
      max: 20,
      from: params['contour-spacing'],
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#tool-params-coast-brush select').on('change', this.updateToolParameter);
    $('#coast-brush-smoothing-method').val(params['smoothing-method']);
    $('#coast-brush-smoothing-factor').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0.0,
      max: 1,
      from: params['smoothing-factor']['min'],
      to: params['smoothing-factor']['max'],
      postfix: "x",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.1
    });
    // For if we add Coast presets
    //$('#tool-params-coast-brush .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "coast-brush");
    return true;
  }

  handleMouseDown(e) {

    let targetX = e.point.x;
    let targetY = e.point.y;
    let coast = this.drawCoastSegment(targetX, targetY);

    this.setState({'tick': 0, 'brushOn': true, 'lastX': targetX, 'lastY': targetY, 'currentItem': coast});
    return coast;

  }

  handleMouseMove(e) {

    if (this.state.brushOn) {
      let targetX = e.point.x;
      let targetY = e.point.y;
      // increase tick counter
      let dx = Math.abs(targetX - this.state.lastX);
      let dy = Math.abs(targetY - this.state.lastY);
      let tick = this.state.tick + dx + dy;
      this.setState({'tick': tick, 'lastX': targetX, 'lastY': targetY});

      if (tick >= this.state.tickThreshold) {
        let coast = this.drawCoastSegment(targetX, targetY, this.state.currentItem[0]);
        this.resetTick();
        this.setState({'currentItem': coast});
        return null;
      }
    }

  }

  handleMouseUp(e) {

    let params = this.state.params;
    let targetX = e.point.x;
    let targetY = e.point.y;
    let coast = this.drawCoastSegment(targetX, targetY, this.state.currentItem[0]);

    coast[0].data.trueY = 0;
    coast[0].children['coastline'].closePath();
    coast[0].children['coastline'].fillColor = "#fff";
    let smoothing_method = params['smoothing-method'];
    let smoothing_factor = Math.random() * (params['smoothing-factor']['max'] - params['smoothing-factor']['min']) + params['smoothing-factor']['min'];
    coast[0].children['coastline'].smooth({ type: smoothing_method, factor: smoothing_factor });
    let contours = this.generateContours(coast[0]); // don't think we need to do anything with these contours, they add themselves to the coast item, though we may want to change that.
    this.setState({'currentItem': null, 'brushOn': false});
    return null;

  }

  useTool(e) {
    if (e.type == "mousedown") {
      return this.handleMouseDown(e);
    }

    if (e.type == "mousemove") {
      return this.handleMouseMove(e);
    }

    if (e.type == "mouseup") {
      return this.handleMouseUp(e);
    }

  }

  drawCoastSegment(x, y, coast, e) {
    let result = [];
    let params = this.state.params;
    let paper = this.props.paper;

    if (!coast) {
      coast = new paper.Group();
      coast.data = {'type': 'coast', 'trueX': x, 'trueY': y, 'sortY': 0.05};
      coast.translate(new paper.Point(x, y));

      let coastline = new paper.Path();
      coastline.data.type = "coastline";
      coastline.name = "coastline";
      coastline.style = { strokeWidth: params['width'], strokeColor: "#5d4640", strokeJoin: 'round', strokeCap: 'round' };
      coastline.add(new paper.Point(0, 0));
      coast.addChild(coastline);
    }  else {
      coast.children['coastline'].add(new paper.Point(x - coast.data.trueX, y - coast.data.trueY));
      let smoothing_method = params['smoothing-method'];
      let smoothing_factor = Math.random() * (params['smoothing-factor']['max'] - params['smoothing-factor']['min']) + params['smoothing-factor']['min'];
      coast.children['coastline'].smooth({ type: smoothing_method, factor: smoothing_factor });
    }

    result.push(coast);
    return result;

  }

  generateContours(coast) {

    let params = this.state.params;
    let paper = this.props.paper;
    let number_of_contours = params['contours'];
    let gap = params['contour-spacing'];
    let contours = [];
    let smoothing_method = params['smoothing-method'];
    let smoothing_factor = params['smoothing-factor']['max'];
    let lastContour = coast.children['coastline'];
    let lastNormal = null;
    let tryFix = false;
    for (let i = 0; i < number_of_contours; i++) {

      let contour = new paper.Path();
      contour.data.type = "contour";
      for (let s in lastContour.segments) {
        let p = lastContour.segments[s].point;
        let offset = lastContour.getOffsetOf(p);
        let segmentNormal = lastContour.getNormalAt(offset);
        for (let j = 0; j < (gap/3); j++) {
          let normal = segmentNormal.clone();
          normal.x = normal.x * (gap + j);
          normal.y = normal.y * (gap + j);
          if (lastContour.contains(new paper.Point(p.x + normal.x, p.y + normal.y))) {
            normal.x = normal.x * -1;
            normal.y = normal.y * -1;
          }
          let np = new paper.Point(p.x + normal.x, p.y + normal.y);

          let nearest = lastContour.getNearestPoint(np);
          let distance = Math.round(nearest.getDistance(np));
          if (distance < gap || lastContour.contains(np)) {
            if ((j+1) == (gap/3)) {
              console.log("Wasn't able to fit it, skip");
            }
            // instead of continuing, can I try to move the point just a bit further out to have a better match of the overall shape?
          } else {
            contour.add(np);
            break;
          }
          //lastNormal = normalLine;
        }
      }

      contour.closePath();
      contour.smooth({ type: smoothing_method, factor: smoothing_factor });
      contour.style = { strokeWidth: 1/(i+1), strokeColor: "#5d4640" };
      contour.data = {'type': 'contour'};
      coast.addChild(contour);
      contours.push(contour);
      lastContour = contour;
    }

    return contours;
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolIcon"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/coast-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

