import React, {Component} from "react";
import ReactDOM from "react-dom";
import { MapDemonEye } from "./MapDemonEye.js";
export const laserStyle = { strokeWidth: 2, strokeJoin: 'round', strokeCap: 'round', strokeColor: "#5d4640" };

class MapDemonLogo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      group: null,
      outline: null,
      corner: null,
      compass: null,
      eye: null,
      spinCompass: false,
      intervalID: null,
    };
  }

  componentDidMount() {
    let paper = this.props.paperScope;
    paper.setup("logo");
    this.state.group = new paper.Group();
    this.state.eye = new MapDemonEye(this.props.x, this.props.y, paper);
    this.state.outline = new paper.Path();
    this.state.corner = new paper.Path();
    this.state.compass = new paper.Path();
    this.state.outline.style = laserStyle;
    this.state.outline.fillColor = "#fcfcfc";
    this.state.outline.add(new paper.Point(10, 0));
    this.state.outline.add(new paper.Point(0, 10));
    this.state.outline.add(new paper.Point(0, 50));
    this.state.outline.add(new paper.Point(50, 50));
    this.state.outline.add(new paper.Point(50, 0));
    this.state.outline.add(new paper.Point(10, 0));
    this.state.outline.add(new paper.Point(10, 10));
    this.state.outline.add(new paper.Point(0, 10));
    this.state.corner.style = laserStyle;
    this.state.corner.fillColor = "#5d4640";
    this.state.corner.add(new paper.Point(10, 0));
    this.state.corner.add(new paper.Point(10, 10));
    this.state.corner.add(new paper.Point(0, 10));
    this.state.corner.closePath();
    this.state.compass.style = laserStyle;
    this.state.compass.strokeColor = "#ff572c";
    this.state.compass.add(new paper.Point(38, 12));
    this.state.compass.add(new paper.Point(43, 7));
    this.state.compass.add(new paper.Point(40, 7));
    this.state.compass.add(new paper.Point(43, 10));
    this.state.compass.add(new paper.Point(43, 7));
    this.state.compass.translate(new paper.Point(3,-3));
    this.state.compass.pivot = new paper.Point(40.5, 9.5);
    //currentTool = "mountain-brush";
    //drawMountainRange(this.state.group, 20, 20);
    this.state.group.addChild(this.state.outline);
    this.state.group.addChild(this.state.corner);
    this.state.group.addChild(this.state.compass);
    this.state.group.position = new paper.Point(this.props.x, this.props.y);
    this.state.outline.onClick = (e) => this.handleClick(e);
    this.setState({intervalID: requestAnimationFrame((e) => this.update(e))});
    requestAnimationFrame((e) => this.state.eye.update(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  update(e) {
    let compass = this.state.compass;
    const spinning = this.state.spinCompass;
    if (spinning) {
      compass.rotate(8);
    }
    this.setState({
      intervalID: requestAnimationFrame((e) => this.update(e))
    });
  }

  handleClick(e) {
    const spinning = !this.state.spinCompass;
    this.setState({spinCompass: spinning});
    if (spinning) {
      this.setState({intervalID: requestAnimationFrame((e) => this.update(e))});
    } else {
      cancelAnimationFrame(this.state.intervalID);
    }
  }

  handleMouseMove(e) {
    let mouseX = e.pageX;
    let mouseY = e.pageY;
    let following = true; // just so I can easily turn this off for debugging, remove this line later
    if (following) {
      var p = new this.props.paperScope.Point(mouseX - 25, mouseY - 25);
      this.state.eye.followPoint(p); 
    }
  }

  render() {
    return (
      <div className="logo-container">
        <canvas id="logo"></canvas>
      </div>
    );
  }
}
export default MapDemonLogo;
