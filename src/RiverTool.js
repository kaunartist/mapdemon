import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class RiverTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'tick-rate': {'min': 15, 'max': 20},
        'width': 2,
        'river-style': 'variable-width',
        'lake': false,
        'smoothing-method': 'continuous',
        'smoothing-factor': {'min': 0.8, 'max': 1.0}
      },
      'tick': 0,
      'tickThreshold': 8,
      'brushOn': false,
      'lastX': 0,
      'lastY': 0,
      'active': "inactive",
      'toolname': 'river-brush',
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

    $('#river-brush-tick-rate').ionRangeSlider({
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
    $('#river-brush-width').ionRangeSlider({
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
    $('#river-brush-smoothing-method').on('change', this.updateToolParameter);
    $('#river-brush-smoothing-method').val(params['smoothing-method']);
    $('#river-brush-river-style').on('change', this.updateToolParameter);
    $('#river-brush-river-style').val(params['river-style']);
    $('#river-brush-smoothing-factor').ionRangeSlider({
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
    // For if we add River presets
    //$('#tool-params-river-brush .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "river-brush");
    return true;
  }

  handleMouseDown(e) {

    let targetX = e.point.x;
    let targetY = e.point.y;
    // start the tick movement counter
    let river = this.drawRiverSegment(targetX, targetY);

    this.setState({'tick': 0, 'brushOn': true, 'lastX': targetX, 'lastY': targetY, 'currentItem': river});
    return river;

  }

  handleMouseMove(e) {

    let targetX = e.point.x;
    let targetY = e.point.y;
    if (this.state.brushOn) {
      // increase tick counter
      let dx = Math.abs(targetX - this.state.lastX);
      let dy = Math.abs(targetY - this.state.lastY);
      let tick = this.state.tick + dx + dy;
      this.setState({'tick': tick, 'lastX': targetX, 'lastY': targetY});

      if (tick >= this.state.tickThreshold) {
        let river = this.drawRiverSegment(targetX, targetY, this.state.currentItem[0]);
        this.resetTick();
        this.setState({'currentItem': river});
        return null;
      }
    }

  }

  handleMouseUp(e) {

    let params = this.state.params;
    let targetX = e.point.x;
    let targetY = e.point.y;
    let river = this.drawRiverSegment(targetX, targetY, this.state.currentItem[0])[0];

    river.data.trueY = 0.2;
    if (river.data.style == "variable-width") {
      river.closePath();
    }
    if (river.data.style == "lake") {
      river.closePath();
      let smoothing_method = params['smoothing-method'];
      let smoothing_factor = Math.random() * (params['smoothing-factor']['max'] - params['smoothing-factor']['min']) + params['smoothing-factor']['min'];
      river.smooth({ type: 'catmull-rom', factor: smoothing_factor });
      //generateContours(terrain, lastRiver);
    }
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

  drawRiverSegment(x, y, river, e) {
    let result = [];
    let params = this.state.params;
    let paper = this.props.paper;

    if (!river) {
      river = new paper.Path();
      river.data.type = "river";
      river.data.trueY = 0.2;
      river.data.style = params['river-style'];
      river.style = { strokeWidth: params['width'], strokeColor: "#5d4640", strokeJoin: 'round', strokeCap: 'round'};
      if (river.data.style == "variable-width") {
        river.style.strokeJoin = "bevel";
        river.style.strokeCap = "bevel";
        river.style.fillColor = "#5d4640";
        river.style.strokeWidth = 2;
        //river.selected = true;
        river.add(new paper.Point(x, y));
      } else if (river.data.style == "lake") {
        river.style.fillColor = "#aaa";
      } else {
        river.add(new paper.Point(x, y));
      }
    }  else {
      if (river.data.style == "variable-width") {
        let step, top, bottom;
        if (!e) {
          step = new paper.Point(1, 1);
          step.angle += 90;
          top = new paper.Point(x + step.x, y + step.y);
          bottom = new paper.Point(x - step.x, y - step.y);
        } else {
          let sl = river.segments.length;
          let maxwidth = params['width']*2;
          step = e.delta.normalize(Math.min(maxwidth, sl/4));
          let riverwidth = step; //new Point(step.x, step.y);
          riverwidth.angle += 90;
          top = new paper.Point(x + riverwidth.x/4, y + riverwidth.y/4);
          bottom = new paper.Point(x - riverwidth.x/4, y - riverwidth.y/4);
        }
        river.add(top);
        river.insert(0, bottom);
      } else {
        river.add(new paper.Point(x, y));
      }
      let smoothing_method = params['smoothing-method'];
      let smoothing_factor = Math.random() * (params['smoothing-factor']['max'] - params['smoothing-factor']['min']) + params['smoothing-factor']['min'];
      river.smooth({ type: smoothing_method, factor: smoothing_factor });
    }

    result.push(river);
    return result;

  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolIcon"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/river-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

