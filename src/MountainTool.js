import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class MountainTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {'params': {
        'tick-rate': {'min': 60, 'max': 80},
        'summit-height': {'min': 25,'max': 60},
        'left-slope-width': {'min': 20,'max': 50},
        'left-slope-curve': {'min': -1,'max': 1},
        'right-slope-width': {'min': 20,'max': 50},
        'right-slope-curve': {'min': -1,'max': 1},
        'number-mountains': {'min': 4,'max': 5},
        'scaling': {'min': 0.25,'max': 1},
        'peak-width': {'min': 0,'max': 5},
      },
      'presets': {
        'hills': [
          {'name': 'summit-height', 'value': {'min': 10,'max': 20}},
          {'name': 'peak-width', 'value': {'min': 0,'max': 1}},
          {'name': 'left-slope-width', 'value': {'min': 30,'max': 50}},
          {'name': 'left-slope-curve', 'value': {'min': -3.5,'max': -2.5}},
          {'name': 'right-slope-width', 'value': {'min': 30,'max': 50}},
          {'name': 'right-slope-curve', 'value': {'min': -3.5,'max': -2.5}}
        ],
        'steppe': [
          {'name': 'summit-height', 'value': {'min': 10,'max': 30}},
          {'name': 'peak-width', 'value': {'min': 12,'max': 30}},
          {'name': 'left-slope-curve', 'value': {'min': 0.25,'max': 1.5}},
          {'name': 'right-slope-curve', 'value': {'min': 0.25,'max': 1.5}}
        ],
        'alps': [
          {'name': 'summit-height', 'value': {'min': 30,'max': 80}},
          {'name': 'peak-width', 'value': {'min': 1,'max': 2}},
          {'name': 'left-slope-curve', 'value': {'min': -1,'max': 0}},
          {'name': 'right-slope-curve', 'value': {'min': -1,'max': 0}}
        ]
      },
      'tick': 0,
      'tickThreshold': 80,
      'brushOn': false,
      'lastX': 0,
      'lastY': 0,
      'active': "inactive",
      'toolname': 'mountain-brush',
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
    $('#mountain-brush-tick-rate').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0,
      max: 200,
      from: params['tick-rate']['min'],
      to: params['tick-rate']['max'],
      //prefix: "Tick rate: ",
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#mountain-brush-summit-height').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0,
      max: 100,
      from: params['summit-height']['min'],
      to: params['summit-height']['max'],
      //prefix: "Summit height: ",
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#mountain-brush-left-slope-width').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0,
      max: 100,
      from: params['left-slope-width']['min'],
      to: params['left-slope-width']['max'],
      //prefix: "Left slope width: ",
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#mountain-brush-left-slope-curve').ionRangeSlider({
      type: 'double',
      grid: true,
      min: -5,
      max: 5,
      from: params['left-slope-curve']['min'],
      to: params['left-slope-curve']['max'],
      //prefix: "Left slope curve: ",
      postfix: "x",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.25
    });
    $('#mountain-brush-right-slope-width').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0,
      max: 100,
      from: params['right-slope-width']['min'],
      to: params['right-slope-width']['max'],
      //prefix: "Right slope width: ",
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#mountain-brush-right-slope-curve').ionRangeSlider({
      type: 'double',
      grid: true,
      min: -5,
      max: 5,
      from: params['right-slope-curve']['min'],
      to: params['right-slope-curve']['max'],
      //prefix: "Right slope curve: ",
      postfix: "x",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.25
    });
    $('#mountain-brush-number-mountains').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0,
      max: 100,
      from: params['number-mountains']['min'],
      to: params['number-mountains']['max'],
      //prefix: "Number of mountains: ",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#mountain-brush-scaling').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0.0,
      max: 1.0,
      from: params['scaling']['min'],
      to: params['scaling']['max'],
      postfix: "",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.05
    });
    $('#mountain-brush-peak-width').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 0,
      max: 100,
      from: params['peak-width']['min'],
      to: params['peak-width']['max'],
      //prefix: "Summit width: ",
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#tool-params-mountain-brush .tool-preset button').on('click', this.updateToolParameters);

  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "mountain-brush");
    return true;
  }

  handleMouseDown(e) {
    let targetX = e.point.x; //e.nativeEvent.pageX - e.nativeEvent.target.offsetLeft;
    let targetY = e.point.y; //nativeEvent.pageY - e.nativeEvent.target.offsetTop;
    // start the tick movement counter
    this.setState({'tick': 0, 'brushOn': true, 'lastX': targetX, 'lastY': targetY});
    return this.drawMountainRange(targetX, targetY);
  }

  handleMouseMove(e) {

    let targetX = e.point.x; //e.nativeEvent.pageX - e.nativeEvent.target.offsetLeft;
    let targetY = e.point.y; //nativeEvent.pageY - e.nativeEvent.target.offsetTop;

    if (this.state.brushOn) {
      // increase tick counter
      let dx = Math.abs(targetX - this.state.lastX);
      let dy = Math.abs(targetY - this.state.lastY);
      let tick = this.state.tick + dx + dy;
      this.setState({'tick': tick, 'lastX': targetX, 'lastY': targetY});

      if (tick >= this.state.tickThreshold) {
        return this.drawMountainRange(targetX, targetY);
      }
    }

  }

  handleMouseUp(e) {

    this.setState({'brushOn': false});
    return null;

  }

  useTool(e) {

    if (e.type == "mousedown") {
      return this.handleMouseDown(e);
    }

    if (e.type == "mouseup") {
      return this.handleMouseUp(e);
    }

    if (e.type == "mousemove") {
      return this.handleMouseMove(e);
    }

  }

  drawMountainRange(x, y) {
    let mountains = [];

    // parameters to be opened up to user control?
    let outerBoundary = 80;
    let innerBoundary = 30;
    let params = this.state.params;
    let secondaryCount = Math.random() * (params['number-mountains']['max'] - params['number-mountains']['min']) + params['number-mountains']['min'] - 1;
    let ms = Math.random() * (params['scaling']['max'] - params['scaling']['min']) + params['scaling']['min'];

    // draw primary mountain
    mountains.push(this.drawMountain(x, y, ms));

    // draw supporting mountains
    for (let i = 0; i < secondaryCount; i++) {
      let mx = x + (Math.random() * (2 * innerBoundary) - innerBoundary);
      let my = y + (Math.random() * (2 * innerBoundary) - innerBoundary);
      ms = Math.random() * (params['scaling']['max'] - params['scaling']['min']) + params['scaling']['min'];
      mountains.push(this.drawMountain(mx, my, ms));
    }

    this.resetTick();
    return mountains;
  }

  drawMountain(x, y, s=-1) {

    let params = this.state.params;
    let paper = this.props.paper;
    let scalingAmount = s == -1 ? Math.random() * (0.50) + 0.25 : s;
    let leftBase = new paper.Point(0, 0);
    let leftFlankWidth = Math.random() * (params['left-slope-width']['max'] - params['left-slope-width']['min']) + params['left-slope-width']['min'];
    leftFlankWidth = leftFlankWidth * scalingAmount;
    let summitHeight = Math.random() * (params['summit-height']['max'] - params['summit-height']['min']) + params['summit-height']['min'];
    summitHeight = summitHeight * scalingAmount;
    let leftPeak = new paper.Point(leftFlankWidth, -summitHeight);
    let leftCurve = Math.random() * (params['left-slope-curve']['max'] - params['left-slope-curve']['min']) + params['left-slope-curve']['min'];
    let peakWidthMin = params['peak-width']['min'];
    let peakWidthMax = params['peak-width']['max'];
    let peakWidth = Math.random() * (peakWidthMax - peakWidthMin) + peakWidthMin;
    let rightPeak = new paper.Point(leftPeak.x + (peakWidth * scalingAmount), leftPeak.y);
    let rightCurve = Math.random() * (params['right-slope-curve']['max'] - params['right-slope-curve']['min']) + params['right-slope-curve']['min'];
    let rightFlankWidth = Math.random() * (params['right-slope-width']['max'] - params['right-slope-width']['min']) + params['right-slope-width']['min'];
    rightFlankWidth = rightFlankWidth * scalingAmount;
    let rightBase = new paper.Point(rightPeak.x + rightFlankWidth, 0);

    let width = rightBase.x - leftBase.x;
    let height = rightBase.y - rightPeak.y;

    let mountain = new paper.Group();
    mountain.translate(new paper.Point(x, y));
    mountain.data = {'type': 'mountain', 'trueX': x, 'trueY': y, 'ogWidth': width, 'ogHeight': height};

    let midPoint = new paper.Point((leftPeak.x + leftBase.x)/2, (leftPeak.y + leftBase.y)/2);
    midPoint.x += leftCurve*scalingAmount;
    midPoint.y += leftCurve*scalingAmount;

    let outline = new paper.Path.Arc(leftBase, midPoint, leftPeak);
    outline.style = { strokeWidth: 2, strokeColor: "#5d4640", fillColor: "#fff" };
    outline.data = {'type': 'outline'};
    outline.add(rightPeak);
    midPoint = new paper.Point((rightPeak.x + rightBase.x)/2, (rightPeak.y + rightBase.y)/2);
    midPoint.x += rightCurve*scalingAmount;
    midPoint.y += rightCurve*scalingAmount;
    outline.arcTo(midPoint, rightBase);
    mountain.addChild(outline);

    // sierra shading
    if (height > 10) {
      let shadegroup = new paper.Group();
      shadegroup.data = {'type': 'shadowgroup'};
      let segments = parseInt(height / 4);
      mountain.addChild(shadegroup);

      for (let i = 0; i < segments; i++) {
        let shade = new paper.Path();
        shadegroup.addChild(shade);
        shade.data = {'type': 'shadow'};
        shade.add(new paper.Point(leftBase.x, leftBase.y - (4*i) - 1));
        shade.add(new paper.Point(leftPeak.x - (segments - i), leftBase.y - (4*i) - 1));
        shade.style = { strokeWidth: 2, strokeColor: "#5d4640", fillColor: "#fff" };
        // crop
        if (shade.intersects(outline)) {
          let intersections = outline.getIntersections(shade);
          shade.insert(1, intersections[0].point);
          shade.removeSegment(0);
        } else {
          shadegroup.removeChildren(shadegroup.children.length - 1);
          //shade.strokeColor = "#f00";
        }
      }
    }

    return mountain;
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolIcon"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/mountain-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}
