import React, {Component} from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

class MapTool extends Component {
  constructor(props) {
    super(props);
    this.updateToolParameter = this.updateToolParameter.bind(this);
    this.updateToolParameters = this.updateToolParameters.bind(this);
  }

  componentDidMount() {

  }

  initToolParameters() {
  }

  useTool(e) {
    // should be a noop by default, since every tool handles mouse up/down/move differently
  }

  getTerrain() {
    return this.props.getTerrain();
  }

  updateToolParameter(data) {
    let params = this.state.params;
    if ("type" in data) {
      if (data.type === "change") {
        params[$(data.target).attr('name')] = $(data.target).val();
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

      //this.updateCursor(currentTool);
    }
  }

  updateToolParameters(e) {
    let presets = this.state.presets;
    let params = presets[$(e.target).val()];
    for (let i = 0; i < params.length; i++) {
      this.updateToolParameter(params[i]);
      // update ionSliders/selects that changed with the preset change
      let paramInput = $('#' + this.state.toolname + '-' + params[i]['name']);
      let paramType = this.toType(params[i].value);
      if (paramType === "object") {
        paramInput.data('ionRangeSlider').update({
          'from': params[i]['value']['min'],
          'to': params[i]['value']['max']
        });
      } else {
        paramInput.val(params[i]['value']);
      }
    }

  }

  resetTick() {
    let params = this.state.params;
    let tickThreshold = Math.random() * (params['tick-rate']['max'] - params['tick-rate']['min']) + params['tick-rate']['min'];
    this.setState({'tick': 0, 'tickThreshold': tickThreshold});
  }

  toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolIcon"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      {this.props.toolName}
      </button>
    );
  }

}

export default MapTool;
