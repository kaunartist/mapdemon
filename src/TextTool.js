import React, {Component} from "react";
import MapTool from "./MapTool.js";
import $ from "jquery";
import ionRangeSlider from "ion-rangeslider";

export class TextTool extends MapTool {

  constructor(props) {
    super(props);
    this.state = {
      'params': {
        'font-size': 16,
        'font-family': "serif",
        'leading': 24,
        'background-style': "ribbon-3d"
      },
      'active': "inactive",
      'toolname': 'text-tool',
      'currentItem': null,
      'textBorder': null,
    };
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount() {
    let paper = this.props.paper;
    if (this.props.activeTool) { // we also have MapTool.state.active
      this.handleClick();
    }
    this.initToolParameters();
    let textTool = new paper.Tool();
    textTool.onKeyDown = this.handleKeyDown;
    textTool.onKeyUp = this.handleKeyUp;
    this.setState({'tool': textTool});
  }

  updateToolParameter(data) {
    super.updateToolParameter(data);
    $("#text-font-family").blur();
    this.updateText();
  }

  initToolParameters() {
    let params = this.state.params;
    let presets = this.state.presets;

    $('#text-tool-font-size').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 8,
      max: 30,
      from: params['font-size'],
      postfix: "px",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    $('#text-tool-font-family').on('change', this.updateToolParameter);
    $('#text-tool-font-family').val(params['font-family']);
    $('#text-tool-background-style').on('change', this.updateToolParameter);
    $('#text-tool-background-style').val(params['background-style']);
    $('#text-tool-leading').ionRangeSlider({
      type: 'single',
      grid: true,
      min: 8,
      max: 50,
      from: params['leading'],
      postfix: "px",
      hide_min_max: true,
      onFinish: this.updateToolParameter,
      keyboard: false,
      step: 1
    });
    // For if we add Text presets
    //$('#tool-params-text-tool .tool-preset button').on('click', this.updateToolParameters);
  }

  handleKeyUp(e) {
    let text = this.state.currentItem;
    if (e.key === "escape") {
      this.stopTyping();
    } else if (e.key === "delete" || e.key === "backspace") {
      text.firstChild.content = text.firstChild.content.slice(0, -1);
      this.updateTextCursor(text);
    } else {
      text.firstChild.content += e.character;
      this.updateTextCursor(text);
    }
    e.stop();
  }

  handleKeyDown(e) {
    e.stop();
  }

  handleClick() {
    this.setState({active: "active"}); 
    this.props.handleClick(this, "text-tool");
    return true;
  }

  handleMouseDown(e) {

  }

  handleMouseMove(e) {

  }

  handleMouseUp(e) {

    let params = this.state.params;
    let targetX = e.point.x;
    let targetY = e.point.y;

    if (this.state.brushOn) {
      this.stopTyping();
    } else {
      let fontSize = params['font-size'];

      let text = this.drawText(targetX, targetY, fontSize, "");
      this.updateTextCursor(text, targetX, targetY);
      this.state.tool.activate();
      this.setState({'brushOn': true, 'currentItem': text});
      let result = [text];
      return result;
    }

  }

  useTool(e) {

    if (e.type === "mouseup") {
      return this.handleMouseUp(e);
    }

    if (e.type === "keyup") {
      return this.handleKeyUp(e);
    }

  }

  drawText(x, y, fontsize, contents) {

    let params = this.state.params;
    let paper = this.props.paper;

    let size = fontsize === null ? params['font-size'] : fontsize;
    let text = new paper.PointText(new paper.Point(x, y));
    text.data.type = "label-text";
    text.content = contents;
    text.fontFamily = params['font-family'];
    text.fontSize = size;
    text.justification = "center";
    text.leading = params['leading'];
    let textgroup = new paper.Group();
    textgroup.addChild(text);
    textgroup.data.type = "label";
    textgroup.data.sortY = "80000";

    return textgroup;

  }

  stopTyping() {
    let params = this.state.params;
    let paper = this.props.paper;

    this.updateTextCursor();
    paper.tools[0].activate();
    let text = this.state.currentItem;
    text.data.trueY = 79900;
    text.bringToFront();
    let textBorder = this.state.textBorder;
    if (textBorder) {
      textBorder.remove();
      textBorder = null;
    }
    const textBackground = params['background-style'];
    let b;
    if (text.firstChild.content !== "") {
      switch (textBackground) {
        case "ribbon":
          b = text.bounds;
          b.scale(1.2);
          var p = new paper.Path();
          p.add(new paper.Point(-14,0));
          p.add(new paper.Point(b.width + 14, 0));
          p.add(new paper.Point(b.width + 6, b.height/2));
          p.add(new paper.Point(b.width + 14, b.height));
          p.add(new paper.Point(-14, b.height));
          p.add(new paper.Point(-6, b.height/2));
          p.closePath();
          p.translate(new paper.Point(b.x, b.y));
          p.style = { fillColor: "#fff", strokeWidth: 1, strokeColor: "#5d4640" };
          p.data.trueY = 79900;
          p.data.type = "label-bg";
          text.addChild(p);
          p.sendToBack();
          break;
        case "ribbon-3d":
          b = text.bounds;
          var fontsize = params['font-size'];
          var leading = params['leading'];
          var yoffset = leading / 4;
          var xoffset = fontsize * 0.6;
          var p1 = new paper.Path.Rectangle(b.expand(xoffset, yoffset));
          //p1.scale(1.4, 1.2);
          b = p1.bounds;
          p1.style = { fillColor: "#fff", strokeWidth: 2, strokeColor: "#5d4640", strokeScaling: false };
          p1.data.trueY = 79900;
          p1.data.type = "label-bg";
          var left = new paper.Path();
          left.add(new paper.Point(b.x, b.y + yoffset));
          left.add(new paper.Point(b.x - xoffset, b.y + yoffset));
          left.add(new paper.Point(b.x - xoffset/2, b.y + b.height/2 + yoffset));
          left.add(new paper.Point(b.x - xoffset, b.y + b.height + yoffset));
          left.add(new paper.Point(b.x + xoffset/2, b.y + b.height + yoffset));
          left.closePath();
          left.data = p1.data;
          left.style = p1.style;
          var leftbg = new paper.Path();
          leftbg.add(new paper.Point(b.x, b.y + b.height));
          leftbg.add(new paper.Point(b.x + xoffset/2, b.y + b.height));
          leftbg.add(new paper.Point(b.x + xoffset/2, b.y + b.height + yoffset));
          leftbg.closePath();
          leftbg.data = p1.data;
          leftbg.style = { fillColor: "#bbb", strokeWidth: 1, strokeColor: "#5d4640", strokeCap: "round", strokeJoin: "round", strokeScaling: false };
          var right = new paper.Path();
          right.add(new paper.Point(b.x + b.width, b.y + yoffset));
          right.add(new paper.Point(b.x + xoffset + b.width, b.y + yoffset));
          right.add(new paper.Point(b.x + xoffset/2 + b.width, b.y + b.height/2 + yoffset));
          right.add(new paper.Point(b.x + xoffset + b.width, b.y + b.height + yoffset));
          right.add(new paper.Point(b.x - xoffset/2 + b.width, b.y + b.height + yoffset));
          right.closePath();
          right.data = p1.data;
          right.style = p1.style;
          var rightbg = new paper.Path();
          rightbg.add(new paper.Point(b.x + b.width, b.y + b.height));
          rightbg.add(new paper.Point(b.x - xoffset/2 + b.width, b.y + b.height));
          rightbg.add(new paper.Point(b.x - xoffset/2 + b.width, b.y + b.height + yoffset));
          rightbg.closePath();
          rightbg.data = p1.data;
          rightbg.style = leftbg.style;


          text.addChild(p1);
          p1.sendToBack();
          text.addChild(leftbg);
          leftbg.sendToBack();
          text.addChild(left);
          left.sendToBack();
          text.addChild(rightbg);
          rightbg.sendToBack();
          text.addChild(right);
          right.sendToBack();
          break;
        case "rectangle":
          b = new paper.Path.Rectangle(text.bounds);
          b.scale(1.2);
          b.style = { fillColor: "#fff" };
          b.data.trueY = 79900;
          b.data.type = "label-bg";
          text.addChild(b);
          b.sendToBack();
          break;
        case "rectangle-border":
          b = new paper.Path.Rectangle(text.bounds);
          b.scale(1.2);
          b.style = { strokeWidth: 2, strokeColor: "#5d4640", fillColor: "#fff" };
          b.data.trueY = 79900;
          b.data.type = "label-bg";
          text.addChild(b);
          b.sendToBack();
          break;
        case "none":
          break;
      }
    }

    this.setState({'brushOn': false, 'currentItem': null});
  }

  updateText() {
    if (this.state.currentItem) {
      let params = this.state.params;
      let text = this.state.currentItem;
      text.fontSize = params['font-size'];
      text.fontFamily = params['font-family'];
      text.leading = params['leading'];
      this.updateTextCursor(text);
    }
  }

  updateTextCursor(t = null, x = 0, y = 0) {
    let params = this.state.params;
    let paper = this.props.paper;
    let textBorder = this.state.textBorder;

    if (textBorder) {
      x = textBorder.bounds.x + textBorder.bounds.width;
      y = textBorder.bounds.y + textBorder.bounds.height;
      textBorder.remove();
      this.setState({'textBorder': null});
    }
    if (t) {
      if (t.bounds.width < 1) {
        let fontSize = params['font-size'];
        textBorder = new paper.Path.Rectangle(new paper.Rectangle(x - fontSize/2, y - fontSize, 10, fontSize));
      } else {
        textBorder = new paper.Path.Rectangle(t.bounds);
      }
      textBorder.strokeColor = "#f8a";
      textBorder.dashArray = [1, 6];
      textBorder.strokeWidth = 2;
      textBorder.strokeCap = 'round';
      this.setState({'textBorder': textBorder});
    }
  }

  render() {
    return (
      <button 
        className={this.state.active + " ToolText"}
        onClick={(e) => {this.handleClick(e); return true;}}
      >
      <img src="../images/text-icon.png" alt={this.props.toolName} />
      </button>
    );
  }
}

