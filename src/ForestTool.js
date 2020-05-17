import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class ForestTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'tick-rate': {'min': 8, 'max': 11},
        'trunk-height': {'min': 2.5,'max': 6},
        'trunk-width': {'min': 1,'max': 1},
        'crown-height': {'min': 8, 'max': 12},
        'crown-width': {'min': 14, 'max': 16},
        'crown-shape': 'coniferous',
        'scaling': {'min': 1, 'max': 1},
        'number-trees': {'min': 1, 'max': 3}
      },
      'presets': {
        'coniferous': [
          {'name': 'trunk-height', 'value': {'min': 2.5,'max': 6}},
          {'name': 'trunk-width', 'value': {'min': 1,'max': 1}},
          {'name': 'crown-width', 'value': {'min': 14,'max': 16}},
          {'name': 'crown-shape', 'value': 'coniferous'},
        ],
        'deciduous': [
          {'name': 'trunk-width', 'value': {'min': 1,'max': 1}},
          {'name': 'crown-height', 'value': {'min': 14,'max': 16}},
          {'name': 'crown-width', 'value': {'min': 10,'max': 13}},
          {'name': 'crown-shape', 'value': 'deciduous'}
        ]
      },
      'tick': 0,
      'tickThreshold': 8,
      'brushOn': false,
      'lastX': 0,
      'lastY': 0,
      'active': "inactive",
      'toolname': 'forest-brush',
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

    $('#tool-params-forest-brush .tool-preset button').on('click', this.updateToolParameters);
    $('#forest-brush-tick-rate').ionRangeSlider({
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
    $('#forest-brush-trunk-height').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 1,
      max: 40,
      from: params['trunk-height']['min'],
      to: params['trunk-height']['max'],
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#forest-brush-trunk-width').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 1,
      max: 10,
      from: params['trunk-width']['min'],
      to: params['trunk-width']['max'],
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#forest-brush-crown-height').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 4,
      max: 40,
      from: params['crown-height']['min'],
      to: params['crown-height']['max'],
      postfix: "x",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#forest-brush-number-trees').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 1,
      max: 100,
      from: params['number-trees']['min'],
      to: params['number-trees']['max'],
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#forest-brush-scaling').ionRangeSlider({
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
    $('#forest-brush-crown-width').ionRangeSlider({
      type: 'double',
      grid: true,
      min: 4,
      max: 40,
      from: params['crown-width']['min'],
      to: params['crown-width']['max'],
      postfix: "px",
      decorate_both: false,
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 0.5
    });
    $('#forest-brush-crown-shape').on('change', function(e) {
      this.updateToolParameter({'name': 'crown-shape', 'value': $(this).val()});
    });
    $('#forest-brush-crown-shape').val(params['crown-shape']);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "forest-brush");
    return true;
  }

  handleMouseDown(e) {
    let targetX = e.point.x;//e.nativeEvent.pageX - e.nativeEvent.target.offsetLeft;
    let targetY = e.point.y;//e.nativeEvent.pageY - e.nativeEvent.target.offsetTop;

    // start the tick movement counter
    let perimeter = this.drawForestPerimeter(targetX, targetY);

    this.setState({'tick': 0, 'brushOn': true, 'lastX': targetX, 'lastY': targetY, 'currentItem': perimeter});
    return perimeter;
  }

  handleMouseMove(e) {

    let targetX = e.point.x;//e.nativeEvent.pageX - e.nativeEvent.target.offsetLeft;
    let targetY = e.point.y;//e.nativeEvent.pageY - e.nativeEvent.target.offsetTop;
    if (this.state.brushOn) {
      // increase tick counter
      let dx = Math.abs(targetX - this.state.lastX);
      let dy = Math.abs(targetY - this.state.lastY);
      let tick = this.state.tick + dx + dy;
      this.setState({'tick': tick, 'lastX': targetX, 'lastY': targetY});

      if (tick >= this.state.tickThreshold) {
        let perimeter = this.drawForestPerimeter(targetX, targetY, this.state.currentItem[0]);
        this.resetTick();
        this.setState({'currentItem': perimeter});
        return null;
      }
    }
  }

  handleMouseUp(e) {

    let perimeter = this.state.currentItem[0];
    perimeter.closePath();
    perimeter.smooth({ type: "catmull-rom", factor: 0.5 });

    let trees = this.generateForest(perimeter);
    perimeter.remove();

    this.setState({'currentItem': null, 'brushOn': false});
    return trees;

  }

  useTool(e) {
    if (e.type === "mousedown") {
      return this.handleMouseDown(e);
    }

    if (e.type === "mousemove") {
      return this.handleMouseMove(e);
    }

    if (e.type === "mouseup") {
      return this.handleMouseUp(e);
    }

  }

  generateForest(polygon) {

    let trees = [];

    let params = this.state.params;
    let paper = this.props.paper;
    // Draw the first tree
    let topleft = polygon.bounds.topLeft;
    let topright = polygon.bounds.topRight;
    let startleft = polygon.getNearestPoint(topleft);
    let startright = polygon.getNearestPoint(topright);
    // check top left and top right and start from whichever is highest
    let start;
    if (startleft.y < startright.y) {
      start = startleft;
    } else {
      if (startleft.y === startright.y) {
        if (startleft.x < startright.x) {
          start = startleft;
        } else {
          start = startright;
        }
      } else {
        start = startright;
      }
    }

    let lastTree = this.drawTree(start.x, start.y, 1);
    trees.push(lastTree);
    let rightedge = polygon.bounds.rightCenter;
    let bottomedge = polygon.bounds.bottomCenter;

    let yOffset = start.y;
    let xOffset = 0;
    let mx, my;
    let done = false;
    let crownShape = params['crown-shape'];
    //let ms = Math.random() * (params['scaling']['max'] - params['scaling']['min']) + params['scaling']['min'];
    let ms = 1.2;

    // Draw all the other trees following from that
    while (!done) {
      if (crownShape === "coniferous") {
        mx = xOffset + lastTree.children[1].bounds.width/1.5;
      } else {
        mx = xOffset + lastTree.children[1].bounds.width - 1;
      }
      my = yOffset;

      if (my > bottomedge.y) {
        // we're below the polygon's bottom, stop
        done = true;
      } else {

        let target = new paper.Point(mx, my);
        if (mx > rightedge.x) {
          // go to next row
          if (crownShape === "coniferous") {
            yOffset = my + lastTree.children[1].bounds.height/1.4;
          } else {
            yOffset = my + lastTree.children[1].bounds.height/1.2;
          }
          xOffset = 0;

        } else if (polygon.contains(target)) {
          let hit = false; // disable to see how hit test affects performance
          if (!hit) {
            let nextTree = this.drawTree(mx, my, ms);
            trees.push(nextTree);
            lastTree = nextTree;
          }
          xOffset = mx;
        } else {
          xOffset += lastTree.children[1].bounds.width;
        }

      }
    }

    return trees;
  }

  drawForestPerimeter(x, y, forest) {

    let paper = this.props.paper;
    let result = [];
    if (!forest) {

      forest = new paper.Path();
      forest.data = {'type': 'forest-perimeter', 'trueX': 0, 'trueY': 0.3};
      forest.name = "forest-perimeter";
      //forest.style = { strokeWidth: 1, strokeColor: "#0c0", fillColor: new Color(0, 256, 0, 0.3), strokeJoin: 'round', strokeCap: 'round' };
      forest.style = { strokeWidth: 2, strokeColor: "#f0b8ef", fillColor: new paper.Color(0.7, 0.9, 1, 0.6), strokeJoin: 'round', strokeCap: 'round' };
      forest.add(new paper.Point(x, y));
    }  else {
      forest.add(new paper.Point(x, y));
    }
    result.push(forest);

    return result;

  }

  drawTree(x, y, s=1) {

    let params = this.state.params;
    let paper = this.props.paper;
    let scalingAmount = s === -1 ? Math.random() * (0.50) + 0.25 : s;
    let leftBase = new paper.Point(0, 0);
    let trunkHeight = Math.random() * (params['trunk-height']['max'] - params['trunk-height']['min']) + params['trunk-height']['min'];
    trunkHeight = trunkHeight * scalingAmount;
    let trunkWidth = Math.random() * (params['trunk-width']['max'] - params['trunk-width']['min']) + params['trunk-width']['min'];
    let tmax = parseInt(params['trunk-width']['max']);
    let tmin = parseInt(params['trunk-width']['min']);
    if (tmax === tmin === 1) {
      trunkWidth = parseInt(params['trunk-width']['min']);
    }
    let crownHeight = Math.random() * (params['crown-height']['max'] - params['crown-height']['min']) + params['crown-height']['min'];
    crownHeight = crownHeight * scalingAmount;
    let crownWidth = Math.random() * (params['crown-width']['max'] - params['crown-width']['min']) + params['crown-width']['min'];
    crownWidth = crownWidth * scalingAmount;

    let crownShape = params['crown-shape'];

    let width = crownWidth;
    let height = trunkHeight + crownHeight;

    let tree = new paper.Group();
    tree.translate(new paper.Point(x, y));
    tree.data = {'type': 'tree', 'trueX': x, 'trueY': y, 'ogWidth': width, 'ogHeight': height};

    let trunk = new paper.Path();
    trunk.add(new paper.Point(leftBase.x, leftBase.y - trunkHeight));
    trunk.add(leftBase);
    if (trunkWidth !== 1) {
      trunkWidth = trunkWidth * scalingAmount;
      trunk.add(new paper.Point(leftBase.x + trunkWidth, leftBase.y ));
      trunk.add(new paper.Point(leftBase.x + trunkWidth, leftBase.y - trunkHeight));
    }
    trunk.style = { strokeScaling: true, strokeWidth: 2, strokeColor: "#5d4640", fillColor: "#fff" };
    trunk.data = {'type': 'trunk'};

    let crown;
    if (crownShape === "coniferous") {
      crown = new paper.Path.RegularPolygon(new paper.Point(trunkWidth/2, -crownWidth/2 -trunkHeight + 3), 3, crownWidth/2);  
      crown.smooth({ type: 'catmull-rom', factor: 0.5});
    } else if (crownShape === "deciduous") {
      crown  = new paper.Path.Ellipse(new paper.Rectangle(0,0,crownWidth, crownHeight));
      crown.translate(new paper.Point(-width/2 + trunkWidth/2, -trunkHeight - crownHeight + 1));
    } else {
      crown  = new paper.Path.Ellipse(new paper.Rectangle(0,0,crownWidth, crownHeight));
      crown.translate(new paper.Point(-width/2 + trunkWidth/2, -trunkHeight - crownHeight + 1));
    }
    crown.style = { strokeJoin: 'round', strokeCap: 'round', strokeScaling: true, strokeWidth: 2, strokeColor: "#5d4640", fillColor: "#fff" };
    crown.data = {'type': 'crown'};

    tree.addChild(trunk);
    tree.addChild(crown);

    return tree;
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolIcon"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/forest-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}
