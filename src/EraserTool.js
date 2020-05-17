import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class EraserTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'size': 30,
        'filter': ['mountain','tree','river','road','icon-instance','label'],
        'overlap': 'overlap'
      },
      'lastX': 0,
      'lastY': 0,
      'active': "inactive",
      'toolname': 'eraser-tool',
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

  updateToolParameter(data) {
    let params = this.state.params;
    if ("type" in data) {
      if (data.type === "change") {
        if (data.currentTarget.name === "filter[]") {
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
          this.setState({'params': {'size': params['size'], 'overlap': params['overlap'], 'filter': filtered}});
        } else {
          params[$(data.target).attr('name')] = $(data.target).val();
        }
      }
    } else {
      if (data.from) {
        let paramType = this.toType(params[data.input[0].name]);
        if (paramType === "object") {
          if ("min" in params[data.input[0].name]) {
            let new_min = data.from;
            let new_max = data.to;
            params[data.input[0].name]['min'] = new_min;
            params[data.input[0].name]['max'] = new_max;
          } else {
            params[data.input[0].name] = data.from;
          }
        } else {
          params[data.input[0].name] = data.from;
        }
      } else {
        params[data.name] = data.value;
      }
      // TODO: update SliderDemon preview images aka turn this into a Component
      // TODO: update cursor preview
    }
    this.props.updateCursor('eraser-tool', params);
  }

  initToolParameters() {
    let params = this.state.params;
    let presets = this.state.presets;

    $('#eraser-tool-size').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 1,
      max: 100,
      from: params['size'],
      postfix: "px",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#eraser-tool-overlap').on('change', this.updateToolParameter);
    $('#eraser-tool-overlap').val(params['overlap']);
    $('#eraser-tool-filter input').on('change', this.updateToolParameter);
    $('#eraser-tool-filter input').val(params['filter']);
    //$('#text-tool-font-family').on('change', this.updateToolParameter);
    //$('#text-tool-font-family').val(params['font-family']);
    // For if we add Eraser presets
    //$('#tool-params-eraser-tool .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "eraser-tool", this.state.params);
    return true;
  }

  handleMouseMove(e) {

    let params = this.state.params;
    let paper = this.props.paper;

    let targetX = e.point.x;
    let targetY = e.point.y;
    let targetPoint = new paper.Point(targetX, targetY);
    let eraserTarget = this.state.currentItem;
    let cursorPreview = this.props.getCursorPreview();
    cursorPreview.position = targetPoint;
    let size = params['size'];
    let filter = params['filter'];

    if (size > 1) {
      let overlap = params['overlap'];
      let options = {};
      if (overlap === "contain") {
        options = {inside: cursorPreview.bounds};
      } else if (overlap === "overlap") {
        options = {overlapping: cursorPreview.bounds};
      }
      let overlaps = this.props.getItems(options);
      let newTargets = [];
      if (eraserTarget) {
        for (let i in eraserTarget) {
          eraserTarget[i].selected = false;
        }
      }

      for (let i in overlaps) {
        let a = this.findMapItemAncestor(overlaps[i]);
        if (a) {
          if (filter.includes(a.data.type)) {
            a.selected = true;
            newTargets.push(a);
          }
        }
      }
      eraserTarget = newTargets;
      this.setState({'currentItem': eraserTarget});

    } else {
      //let newTarget = hitTestMap(terrain, e.point, { fill: true, stroke: true, segments: true, match: hitTestMatch });
      let result = this.props.hitTestTerrain(targetPoint);
      let newTarget = null;
      if (result.length > 0) {
        newTarget = result[0].item;
      }

      if (newTarget && filter.includes(newTarget.data.type)) {
        if (eraserTarget) {
          if (eraserTarget !== newTarget) {
            //toolPreview.remove();
            eraserTarget = newTarget;
            eraserTarget.selected = true;
          }
        } else {
          eraserTarget = newTarget;
          eraserTarget.selected = true;
        }
      } else {
        /*
        if (toolPreview) {
          toolPreview.remove();
          toolPreview = null;
        }
        */
        eraserTarget = null;
      }
      this.setState({'currentItem': eraserTarget});
    }


  }

  handleMouseUp(e) {

    let params = this.state.params;
    let paper = this.props.paper;

    let targetX = e.point.x;
    let targetY = e.point.y;
    let targetPoint = new paper.Point(targetX, targetY);
    let eraserTarget = this.state.currentItem;
    let size = params['size'];

    if (size > 1) {
      if (eraserTarget && eraserTarget.length > 0) {
        for (let i in eraserTarget) {
          eraserTarget[i].remove();
        }
        eraserTarget = null;
        this.setState({"currentTarget": null});
      }
    } else {
      if (eraserTarget) {
        let newTarget = this.props.hitTestTerrain(targetPoint);
        if (eraserTarget === newTarget) {
          //erased.push(eraserTarget.remove());
          newTarget.parent.removeChildren(newTarget.index, newTarget.index+1);
          eraserTarget = null;
          this.setState({"currentTarget": null});
        }
      }
    }
    return null;
  }

  useTool(e) {

    if (e.type === "mousemove") {
      return this.handleMouseMove(e);
    }

    if (e.type === "mouseup") {
      return this.handleMouseUp(e);
    }

  }

  findMapItemAncestor(item) {

    switch (item.data.type) {
      case 'mountain':
      case 'tree':
      case 'road':
      case 'river':
      case 'coast':
      case 'icon-instance':
      case 'label':
        return item;
      case 'coastline':
      case 'contour':
      case 'label-text':
      case 'trunk':
      case 'crown':
      case 'outline':
      case 'shadowgroup':
      case 'label-bg':
        return item.parent;
        break;
      case 'border':
        return null;
      default:
        let p = item.parent;
        let done = false;
        while (!done) {
          if (p.data.type === "icon-instance" || p.data.type === "terrain") {
            done = true;
            break;
          }
          p = p.parent;
        }
        if (p.data.type === "icon-instance") {
          item.data.type = "icon-child";
          item.data.icon = p;
          return p;
        } else {
          return null;
        }
        break;
    }
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolEraser"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/eraser-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

