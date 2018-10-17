import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class RoadTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'tick-rate': {'min': 15, 'max': 20},
        'width': 2,
        'dash-length': 4,
        'dash-gap': 8,
        'smoothing-method': 'continuous',
        'smoothing-factor': {'min': 0.8, 'max': 1.0}
      },
      'tick': 0,
      'tickThreshold': 8,
      'brushOn': false,
      'lastX': 0,
      'lastY': 0,
      'active': "inactive",
      'toolname': 'road-brush',
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

    $('#road-brush-tick-rate').ionRangeSlider({
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
    $('#road-brush-width').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 1,
      max: 10,
      from: params['width'],
      postfix: "px",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#road-brush-dash-length').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 1,
      max: 20,
      from: params['dash-length'],
      postfix: "px",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#road-brush-dash-gap').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 0,
      max: 20,
      from: params['dash-gap'],
      postfix: "px",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#tool-params-road-brush select').on('change', this.updateToolParameter);
    $('#road-brush-smoothing-method').on('change', this.updateToolParameter);
    $('#road-brush-smoothing-method').val(params['smoothing-method']);
    $('#road-brush-smoothing-factor').ionRangeSlider({
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
    // For if we add Road presets
    //$('#tool-params-road-brush .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "road-brush");
    return true;
  }

  handleMouseDown(e) {

    let targetX = e.point.x;
    let targetY = e.point.y;
    let road = this.drawRoadSegment(targetX, targetY);
    this.setState({'tick': 0, 'brushOn': true, 'lastX': targetX, 'lastY': targetY, 'currentItem': road});
    return road;

  }

  handleMouseMove(e) {

    let targetX = e.point.x;
    let targetY = e.point.y;
    if (this.state.brushOn) {
      let dx = Math.abs(targetX - this.state.lastX);
      let dy = Math.abs(targetY - this.state.lastY);
      let tick = this.state.tick + dx + dy;
      this.setState({'tick': tick, 'lastX': targetX, 'lastY': targetY});

      if (tick >= this.state.tickThreshold) {
        let road = this.drawRoadSegment(targetX, targetY, this.state.currentItem[0]);
        this.resetTick();
        this.setState({'currentItem': road});
        return null;
      }
    }

  }

  handleMouseUp(e) {

    let targetX = e.point.x;
    let targetY = e.point.y;
    let road = this.drawRoadSegment(targetX, targetY, this.state.currentItem[0])[0];
    road.data.trueY = 0.1;
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

  drawRoadSegment(x, y, road, e) {
    let result = [];
    let params = this.state.params;
    let paper = this.props.paper;

    if (!road) {
      road = new paper.Path();
      road.data = {'type': 'road', 'trueX': x, 'trueY': 0.2};
      road.style = { strokeWidth: params['width'], strokeColor: "#5d4640", strokeJoin: 'round', strokeCap: 'round', dashArray: [params['dash-length'], params['dash-gap']]};
      road.add(new paper.Point(x, y));
    } else {
      road.add(new paper.Point(x, y));
      let smoothing_method = params['smoothing-method'];
      let smoothing_factor = Math.random() * (params['smoothing-factor']['max'] - params['smoothing-factor']['min']) + params['smoothing-factor']['min'];
      road.smooth({ type: smoothing_method, factor: smoothing_factor });
    }

    result.push(road);
    return result;

  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolIcon"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/road-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

