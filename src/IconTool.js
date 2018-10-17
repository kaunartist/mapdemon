import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class IconTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'scaling': 1.0,
        'icon': 'star'
      },
      'icons': {},
      'active': "inactive",
      'toolname': 'icon-stamp',
      'currentItem': null,
    };
    this.onLoadIconSVG = this.onLoadIconSVG.bind(this);
  }

  componentDidMount() {
    if (this.props.activeTool) { // we also have MapTool.state.active
      this.handleClick();
    }
    this.initToolParameters();
    let paper = this.props.paper;
    let icontray = $('#icon-stamp-icon');
    let starIcon = new paper.Path.Star(new paper.Point(0,0), 5, 2, 5);
    starIcon.style = { strokeColor: "#5d4640", fillColor: "#5d4640" };
    starIcon.rotate(180);
    starIcon.name="star";
    this.addIconToTray(icontray, starIcon, 'star');
    this.highlightIcon('star');
    let dotIcon = new paper.Path.Circle(new paper.Point(0,0), 2);
    dotIcon.style = { strokeColor: "#5d4640", fillColor: "#5d4640" };
    dotIcon.name="dot";
    this.addIconToTray(icontray, dotIcon, 'dot');
    let xIcon = new paper.Group();
    let x1 = new paper.Path.Line(new paper.Point(0,0), new paper.Point(10,10));
    let x2 = new paper.Path.Line(new paper.Point(0,10), new paper.Point(10,0));
    xIcon.addChild(x1);
    xIcon.addChild(x2);
    xIcon.style = { strokeWidth: 2, strokeColor: "#5d4640" };
    this.addIconToTray(icontray, xIcon, 'x');
    let bridgeIconSVG = paper.project.importSVG('images/bridge.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
    let towerIconSVG = paper.project.importSVG('images/tower.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
    let castleIconSVG = paper.project.importSVG('images/castle.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
    let battleIconSVG = paper.project.importSVG('images/new-battle.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
    let templeIconSVG = paper.project.importSVG('images/temple.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
    let dangerIconSVG = paper.project.importSVG('images/danger.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
    let lightningIconSVG = paper.project.importSVG('images/lightning.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
    /*
    let handIconSVG = paper.project.importSVG('images/hand.svg', 
      {
        'insert': false,
        'onLoad': function(item) {
          let tray = $('#icon-stamp-icon');
          this.addIconToTray(tray, item, 'hand');
          let move_tool = paper.project.getItem({name: 'move'});
          drawIcon(move_tool, toolborder_size/2 + 2, toolborder_size/2, 2, 'hand');
        }
      });
      */
    let gearIconSVG = paper.project.importSVG('images/gear.svg', 
      {
        'insert': false,
        'onLoad': this.onLoadIconSVG
      });
  }

  onLoadIconSVG(item, rawstring) {
    let tray = $('#icon-stamp-icon');
    this.addIconToTray(tray, item, item.name);
  }

  updateToolParameter(data) {
    let params = this.state.params;
    if ("type" in data) {
      if (data.type == "click") {
        $('#icon-stamp-icon .icon.selected').removeClass("selected");
        $(data.currentTarget).addClass("selected");
        this.setState({'params': {'scaling': params.scaling, 'icon': $(data.currentTarget).attr('id')}});
      } else {
        console.log("Unexpected param update type: " + data.type);
      }

    } else {
      if (data.from) {
        let paramType = this.toType(params[data.input[0].name]);
        if (paramType == "object") {
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
      // TODO: updtae cursor preview

      //this.updateCursor(currentTool);
    }
  }

  initToolParameters() {
    let params = this.state.params;
    let presets = this.state.presets;

    $('#icon-stamp-scaling').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 0.25,
      max: 5,
      from: params['scaling'],
      postfix: "x",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#icon-stamp-icon .icon').on('click', this.updateToolParameter);
    // For if we add Icon presets
    //$('#tool-params-icon-stamp .tool-preset button').on('click', this.updateToolParameters);
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "icon-stamp");
    return true;
  }

  handleMouseUp(e) {

    let targetX = e.point.x;
    let targetY = e.point.y;
    let icon = this.drawIcon(targetX, targetY);
    return [icon];

  }

  useTool(e) {

    if (e.type == "mouseup") {
      return this.handleMouseUp(e);
    }

  }

  drawIcon(x, y, s, iconname) {
    let params = this.state.params;
    let paper = this.props.paper;

    let icon;
    if (iconname) {
      icon = this.state.icons[iconname];
    } else {
      icon = this.state.icons[params['icon']];
    }
    let iconCopy = icon.clone();
    iconCopy.position = new paper.Point(x, y);
    iconCopy.strokeScaling = true;
    let scaling = s == null ? params['scaling'] : s;
    iconCopy.scale(scaling);
    iconCopy.data.type = "icon-instance";
    iconCopy.data.trueY = 70000;

    return iconCopy;

  }

  addIconToTray(tray, icon, name) {

    let paper = this.props.paper;
    icon.data.type= "icon";
    icon.data.name = name;
    this.state.icons[name] = icon;
    let g = new paper.Group();
    let tmp = icon.clone();
    let b = new paper.Path.Rectangle(new paper.Rectangle(0,0,20,20));
    b.strokeWidth = 0;
    b.strokeColor = "#5d4640";
    g.addChild(b);
    g.addChild(tmp);
    if (tmp.bounds.width > 10) {
      tmp.fitBounds(new paper.Rectangle(0,0,10,10));
    }
    tmp.position = new paper.Point(10,10);

    let png = g.rasterize(150, false);
    tmp.remove();
    let iconHTML = $("<div id='"+name+"' class='icon'><img src='"+png.toDataURL()+"'/></div>");
    tray.append(iconHTML);
    $(iconHTML).on('click', this.updateToolParameter);

    icon.remove();

  }

  highlightIcon(name) {
    // I suspect this is better managed through a react property or some such

    $('#icon-stamp-icon .selected').removeClass("selected");
    $('#icon-stamp-icon #'+name).addClass("selected");

  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolIcon"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/icon-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

