import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class MoveTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'filter': ['mountain','tree','river','road','icon-instance','label']
      },
      'lastX': 0,
      'lastY': 0,
      'active': "inactive",
      'toolname': 'move-tool',
      'currentItem': null,
    };

  }

  componentDidMount() {
    let paper = this.props.paper;
    if (this.props.activeTool) {
      //this.handleClick();
    }
    this.initToolParameters();
  }

  updateToolParameter(data) {
    super.updateToolParameter(data);
    let params = this.state.params;
    let filtered = params['filter'].slice();
    let i = filtered.indexOf($(data.currentTarget).val());
    if (i === -1) {
      if (data.currentTarget.checked) {
        filtered.push($(data.currentTarget).val());
      }
    } else {
      if (!data.currentTarget.checked) {
        filtered.splice(i, 1);
      }
    }
    this.setState({'params': {'filter': filtered}});
  }

  initToolParameters() {
    let params = this.state.params;
    let presets = this.state.presets;

    $('#move-tool-filter input').on('change', this.updateToolParameter);
    $('#move-tool-filter input').val(params['filter']);
    //$('#text-tool-font-family').on('change', this.updateToolParameter);
    //$('#text-tool-font-family').val(params['font-family']);
    // For if we add Move presets
    //$('#tool-params-move-tool .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "move-tool");
    return true;
  }

  handleMouseDown(e) {

    let params = this.state.params;
    let paper = this.props.paper;
    let targetX = e.point.x;
    let targetY = e.point.y;

    let filter = params['filter'];
    let hits = this.props.hitTestTerrain(new paper.Point(targetX, targetY));
    //terrain.hitTestAll(e.point, { fill: true, stroke: true, bounds: true, segments: true, match: this.props.hitTestAllTerrain });
    // mark it for moving
    if (hits && hits.length > 0) {
      //console.log("---- HITS ---");
      //console.log(hits);
      let itemInMotion;
      let itemType = hits[0].item.data.type;
      let parentType = hits[0].item.parent.data.type;
      if (parentType === "coast") {
        itemInMotion = hits[0].item.parent;
      } else if (itemType === "icon-child") {
        itemInMotion = hits[0].item.data.icon; 
      } else if (itemType === "crown" || itemType === "trunk" || itemType === "label-bg" || itemType === "label-text") {
        itemInMotion = hits[0].item.parent;
      } else {
        itemInMotion = hits[0].item;
      }
      if (!filter.includes(itemInMotion.data.type)) {
        //console.log("Ignoring");
        //console.log(itemInMotion.data);
        itemInMotion = null;
      }
      this.setState({"itemInMotion": itemInMotion});
      this.setState({'lastX': targetX, 'lastY': targetY});
    }
  }

  handleMouseMove(e) {

    if (this.state.itemInMotion) {
      let targetX = e.point.x;
      let targetY = e.point.y;
      let itemInMotion = this.state.itemInMotion;
      itemInMotion.position.x = targetX;
      itemInMotion.position.y = targetY;
    }
    return null;

  }

  handleMouseUp(e) {

    if (this.state.itemInMotion) {
      let itemInMotion = this.state.itemInMotion;
      if (itemInMotion.data.type !== "river" && itemInMotion.data.type !== "coast" && itemInMotion.data.type !== "road" && itemInMotion.data.type !== "label" && itemInMotion.data.type !== "icon-instance") {
        itemInMotion.data.trueY = itemInMotion.position.y + itemInMotion.data.ogHeight/2;
      }
      this.setState({"itemInMotion": null});
      itemInMotion.remove();
      return [itemInMotion];
    }

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

  render() {
    return (
      <button 
        className={this.state.active + " ToolMove"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/move-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

