import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class ZoomTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'zoom': 1,
        'width': 700,
        'height': 700
      },
      'lastX': 0,
      'lastY': 0,
      'brushOn': false,
      'active': "inactive",
      'toolname': 'zoom-tool',
      'currentItem': null,
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseDrag = this.handleMouseDrag.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  componentDidMount() {
    let paper = this.props.paper;
    if (this.props.activeTool) {
      this.handleClick();
    }
    this.initToolParameters();
    let zoomTool = new paper.Tool();
    zoomTool.onKeyDown = this.handleKeyDown;
    zoomTool.onMouseDown = this.handleMouseDown;
    zoomTool.onMouseDrag = this.handleMouseDrag;
    this.setState({'tool': zoomTool});
  }

  updateToolParameter(data) {
    super.updateToolParameter(data);
    if ("type" in data) {
      if (data.currentTarget.name === "width" || data.currentTarget.name === "height") {
        let params = this.state.params;
        this.props.changeMapSize(params['width'], params['height']);
        $("#zoom-tool-width").blur();
        $("#zoom-tool-height").blur();
      }
    } else {
      let paper = this.props.paper;
      paper.view.zoom = data.from;
    }

  }

  handleKeyDown(e) {
    e.stop();
  }

  initToolParameters() {
    let params = this.state.params;
    let presets = this.state.presets;

    $('#zoom-tool-zoom').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 0.1,
      max: 10,
      from: params['zoom'],
      postfix: "x",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      onUpdate: this.updateToolParameter,
      keyboard: false,
      step: 0.1
    });
    $('#zoom-tool-width').on('change', this.updateToolParameter);
    $('#zoom-tool-width').val(params['width']);
    $('#zoom-tool-height').on('change', this.updateToolParameter);
    $('#zoom-tool-height').val(params['height']);

    //$('#text-tool-font-family').on('change', this.updateToolParameter);
    //$('#text-tool-font-family').val(params['font-family']);
    // For if we add Zoom presets
    //$('#tool-params-zoom-tool .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "zoom-tool", this.state.params);
    return true;
  }

  handleMouseDown(e) {

    let params = this.state.params;
    let paper = this.props.paper;
    this.state.tool.activate();
    let zoom = params['zoom'];
    if (e.modifiers.shift) {
      zoom = zoom - 0.1;
      if (zoom <= 0) {
        zoom = 0.1;
      }
    } else if (e.modifiers.control) {
      this.setState({
        'brushOn': true,
        'lastX': e.point.x,
        'lastY': e.point.y
      });
    } else {
      zoom = zoom + 0.1;
    }


    if (!e.modifiers.control) {
      this.setState({'zoom': zoom});
      let slider = $('#zoom-tool-zoom').data('ionRangeSlider');
      slider.update({from: zoom});
      paper.view.zoom = zoom;
    }
  }

  handleMouseDrag(e) {

    if (this.state.brushOn) {
      let paper = this.props.paper;
      // You would think we could use e.delta
      // but for some reason, that is the difference between the current point
      // and the last time *this specific event type* was fired
      // EVEN IF THAT LAST TIME WAS PART OF A DIFFERENT DOWN-DRAG-UP SEQUENCE!!
      // So, we maintain our own state of the last point
      let dX = this.state.lastX - e.point.x;
      let dY = this.state.lastY - e.point.y;
      paper.view.translate(new paper.Point(-dX*0.5, -dY*0.5));
      this.setState({
        'lastX': e.point.x,
        'lastY': e.point.y
      });
    }

  }

  handleMouseUp(e) {

    let params = this.state.params;
    let paper = this.props.paper;
    paper.tools[0].activate(); // reset to the default tool
    this.setState({
      'brushOn': false,
      'lastX': 0,
      'lastY': 0
    });

  }

  useTool(e) {
    switch (e.type) {
      case "mousedown":
        return this.handleMouseDown(e);
        break;
      case "mousedrag":
        return this.handleMouseDrag(e);
        break;
      case "mouseup":
        return this.handleMouseUp(e);
        break;
    }
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolZoom"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/zoom-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

