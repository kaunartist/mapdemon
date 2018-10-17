import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class ExportTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'mountain-color': '#ff0000',
        'tree-crown-color': '#00ff00',
        'tree-trunk-color': '#888800',
        'river-color': '#00ffff',
        'width': 1400,
        'height': 1200,
        'filetype': "png",
        'file-name': 'map.svg'
      },
      'lastX': 0,
      'lastY': 0,
      'brushOn': false,
      'active': "inactive",
      'toolname': 'export-tool',
      'currentItem': null,
    };

  }

  componentDidMount() {
    let paper = this.props.paper;
    if (this.props.activeTool) {
      this.handleClick();
    }
    this.initToolParameters();
  }

  initToolParameters() {
    let params = this.state.params;
    let presets = this.state.presets;

    $('#export-tool-filetype').on('change', this.updateToolParameter);
    $('#export-tool-filetype').val(params['filetype']);

    // For if we add Export presets
    //$('#tool-params-export-tool .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "export-tool", this.state.params);
    return true;
  }

  useTool(e) {

    let params = this.state.params;
    let paper = this.props.paper;

    if (e.type == "mousedown") {
      let export_type = params['filetype'];
      if (export_type == "png") {
        this.exportPNG();
      } else if (export_type = "svg") {
        if (this.state.currentItem == null) {
          //this.props.exportLaserableSVG();
        } else {
          this.clearLaser();
        }
      } else {
        console.log("Incorrect file type");
      }
    }

  }

  exportPNG() {

    let params = this.state.params;
    let paper = this.props.paper;
    let terrain = this.props.getTerrain();
    let width = params['width'];
    let height = params['height'];

    let size = new paper.Size(width, height);
    let raster = terrain.rasterize(300, false);

    let now = new Date();
    let filename = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-dev.png";

    let data = raster.toDataURL();
    let element = document.createElement('a');
    element.setAttribute('href', data);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

  }

  exportSVG() {
    console.log("Exporting SVG (noop)");
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolExport"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/export-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

