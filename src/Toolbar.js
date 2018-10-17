import React, {Component} from "react";
import ReactDOM from "react-dom";
import {MountainTool} from "./MountainTool.js";
import {ForestTool} from "./ForestTool.js";
import {RiverTool} from "./RiverTool.js";
import {RoadTool} from "./RoadTool.js";
import {CoastTool} from "./CoastTool.js";
import {IconTool} from "./IconTool.js";
import {TextTool} from "./TextTool.js";
import {MoveTool} from "./MoveTool.js";
import {EraserTool} from "./EraserTool.js";
import {ZoomTool} from "./ZoomTool.js";
import {ExportTool} from "./ExportTool.js";
import $ from "jquery";

/*
  let emptyTool = new Tool();
  emptyTool.activate();
  */

/*
  let tools = {
    'mountain-brush': 
    {'f': useMountainBrushTool, 
      'params': {
        'tick-rate': {'min': 60, 'max': 80},
        'summit-height': {'min': 25,'max': 60},
        'left-slope-width': {'min': 20,'max': 50},
        'left-slope-curve': {'min': -1,'max': 1},
        'right-slope-width': {'min': 20,'max': 50},
        'right-slope-curve': {'min': -1,'max': 1},
        'number-mountains': {'min': 4,'max': 5},
        'secondary-scaling': {'min': 0.25,'max': 1},
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
      }
    },
    'river-brush':
    {
      'f': useRiverBrushTool,
      'params': {
        'tick-rate': {'min': 15, 'max': 20},
        'width': 2,
        'river-style': 'variable-width',
        'lake': false,
        'smoothing-method': 'continuous',
        'smoothing-factor': {'min': 0.8, 'max': 1.0}
      }
    },
    'road-brush':
    {
      'f': useRoadBrushTool,
      'params': {
        'tick-rate': {'min': 15, 'max': 20},
        'width': 2,
        'dash-length': 8,
        'dash-gap': 3,
        'smoothing-method': 'continuous',
        'smoothing-factor': {'min': 0.8, 'max': 1.0}
      }
    },
    'coast-brush':
    {
      'f': useCoastBrushTool,
      'params': {
        'tick-rate': {'min': 15, 'max': 20},
        'width': 2,
        'contours': 2,
        'contour-spacing': 5,
        'smoothing-method': 'catmull-rom',
        'smoothing-factor': {'min': 0.5, 'max': 0.5}
      }
    },
    'forest-brush':
    {
      'f': useForestBrushTool,
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
          {'name': 'crown-shape', 'value': 'deciduous'}
        ]
      }
    },
    'icon-stamp':
    {
      'f': useIconStampTool,
      'params': {
        'scaling': 1.0,
        'icon': 'star'
      }
    },
    'text':
    {
      'f': useTextTool,
      'params': {
        'font-size': 16,
        'font-family': "serif",
        'leading': 24,
        'background-style': "ribbon-3d"
      }
    },
    'move':
    {
      'f': useMoveTool,
      'params': {
        'filter': ['mountain','tree','river','road','icon-instance','label']
      }
    },
    'eraser':
    {
      'f': useEraserTool,
      'params': {
        'size': 30,
        'filter': ['mountain','tree','river','road','icon-instance','label'],
        'overlap': 'overlap'
      }
    },
    'zoom':
    {
      'f': useZoomTool,
      'params': {
        'zoom': 1,
        'width': 700,
        'height': 600
      }
    },
    'export-tool':
    {
      'f': useExportTool,
      'params': {
        'mountain-color': '#ff0000',
        'tree-crown-color': '#00ff00',
        'tree-trunk-color': '#888800',
        'river-color': '#00ffff',
        'width': 1400,
        'height': 1200,
        'filetype': "png",
        'file-name': 'map.svg'
      }
    },
    'clear-canvas':
    {
      'f': useClearCanvasTool,
      'params': {
      }
    }
  };
  */

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tick: 0,
      brushOn: false,
      lastX: 0,
      lastY: 0,
      activeToolId: 0,
      cursorPreview: null,

    };
    this.getCursorPreview = this.getCursorPreview.bind(this);
    this.updateCursor = this.updateCursor.bind(this);
  }

  componentDidMount() {
    //selectTool(this.state.currentTool);
    // select mountain tool...how? I want to call its onclick function
  }

  toggleToolParams() {
    $('#tool-params').toggle();
  }

  render() {
    return (
      <div className="toolbox-container">
        <MountainTool activeTool={true} toolName="mountain-brush" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <ForestTool toolName="forest-brush" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <RiverTool toolName="river-brush" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <RoadTool toolName="road-brush" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <CoastTool toolName="coast-brush" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <IconTool toolName="icon-stamp" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <TextTool toolName="text-tool" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <MoveTool toolName="move-tool" paper={this.props.paperScope} handleClick={(tool, toolname) => this.selectTool(tool, toolname)}
          hitTestTerrain={this.props.hitTestTerrain} updateToolParameter={(data) => this.updateToolParameter(data)}
        />
        <EraserTool toolName="eraser-tool" paper={this.props.paperScope} 
          handleClick={(tool, toolname, params) => this.selectTool(tool, toolname, params)}
          updateCursor={this.updateCursor}
          getCursorPreview={this.getCursorPreview} 
          getItems={this.props.getItems} 
          hitTestTerrain={this.props.hitTestTerrain} 
          updateToolParameter={(data) => this.updateToolParameter(data)}
          getTerrain={this.props.getTerrain}
        />
        <ZoomTool toolName="zoom-tool" paper={this.props.paperScope} 
          handleClick={(tool, toolname, params) => this.selectTool(tool, toolname, params)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
          changeMapSize={this.props.changeMapSize}
          getTerrain={this.props.getTerrain}
        />
        <ExportTool toolName="export-tool" paper={this.props.paperScope} 
          handleClick={(tool, toolname, params) => this.selectTool(tool, toolname, params)}
          updateToolParameter={(data) => this.updateToolParameter(data)}
          getTerrain={this.props.getTerrain}
        />
      </div>
    );
  }

  getCursorPreview() {
    return this.state.cursorPreview;
  }

  selectTool(tool, toolname, params) {
    //let lastTool = this.state.currentTool;
    let toolPreview = false;
    if (toolPreview) {
      toolPreview.remove();
    }
    this.highlightTool(toolname);
    this.props.toolChange(tool, toolname);
    //unhighlightTool(lastTool); // toolbar should handle this but right now app is
    this.updateCursor(toolname, params);
    //showToolCursor(tool);
  }

  highlightTool(tool) {
    document.getElementById('tool-params-' + tool).style.display = "block";
  }

  unhighlightTool(tool) {
    //toolbox.children[tool].strokeColor = "#000";
    document.getElementById('tool-params-' + tool).style.display = "none";
  }

  updateCursor(tool, params) {
    let cursorPreview = this.state.cursorPreview;

    if (cursorPreview) {
      cursorPreview.remove();
    }
    switch (tool) {
      case "eraser-tool":
        let size = params['size'];
        let paper = this.props.paperScope;
        cursorPreview = new paper.Path.Rectangle(new paper.Rectangle(-1000,-1000, size, size), 0.5);
        cursorPreview.style = { strokeWidth: 2, strokeColor: "#5d4640", dashArray: [3, 8]};
        this.setState({'cursorPreview': cursorPreview});
        break;
    }

  }

  /*
  updateToolParameter(data) {

    if (data.from) {

      var paramType = this.toType(tools[currentTool]['params'][data.input[0].name]);
      if (paramType == "object") {
        if ("min" in tools[currentTool]['params'][data.input[0].name]) {
          var new_min = data.from;
          var new_max = data.to;
          tools[currentTool]['params'][data.input[0].name]['min'] = new_min;
          tools[currentTool]['params'][data.input[0].name]['max'] = new_max;
        } else {
          tools[currentTool]['params'][data.input[0].name] = data.from;
        }
      } else {
        tools[currentTool]['params'][data.input[0].name] = data.from;
      }
    } else {
      tools[currentTool]['params'][data.name] = data.value;
    }

    if (currentTool == 'text') {
      $("#text-font-family").blur();
      //updateText();
    }
    if (currentTool == 'zoom') {
      if (data.name == "width" || data.name == "height") {
        //changeMapSize(terrain, tools['zoom']['params']['width'], tools['zoom']['params']['height']);
        $("#zoom-width").blur();
        $("#zoom-height").blur();
      } else {
        paper.view.zoom = data.from;
      }
    }
    // TODO: update preview images

    this.updateCursor(currentTool);
  }
  */

  /*
  stopTools() {
    brushOn = false;
  }
  */
  
  /*
  showToolCursor(tool) {

    switch (tool) {
      case 'mountain-brush':
        var cursor = draw.nested().height(100).width(100).viewbox(0, 0, 50, 50);
        cursor.circle(100).stroke({width: 1, color: "#eee"}).fill("none");
        cursor.circle(20).stroke({width: 1, color: "#aaa"}).fill("none").center(50,50);
        cursorType = "url('data:image/svg+xml;utf8," + cursor.svg() + "'), auto";
        console.log(cursorType);
        break;
      default:
        cursorType = "auto";
    }
    draw.style('cursor', cursorType);
    console.log(draw.style('cursor'));
    //document.body.style.cursor = cursorType;
  }
  */

}

export default Toolbar;
