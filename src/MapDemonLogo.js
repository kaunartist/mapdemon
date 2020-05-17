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
    let group = new paper.Group();
    let eye = new MapDemonEye(this.props.x, this.props.y, paper);
    let outline = new paper.Path();
    outline.style = laserStyle;
    outline.fillColor = "#fcfcfc";
    outline.add(new paper.Point(10, 0));
    outline.add(new paper.Point(0, 10));
    outline.add(new paper.Point(0, 50));
    outline.add(new paper.Point(50, 50));
    outline.add(new paper.Point(50, 0));
    outline.add(new paper.Point(10, 0));
    outline.add(new paper.Point(10, 10));
    outline.add(new paper.Point(0, 10));
    let corner = new paper.Path();
    corner.style = laserStyle;
    corner.fillColor = "#5d4640";
    corner.add(new paper.Point(10, 0));
    corner.add(new paper.Point(10, 10));
    corner.add(new paper.Point(0, 10));
    corner.closePath();
    let compass = new paper.Path();
    compass.style = laserStyle;
    compass.strokeColor = "#ff572c";
    compass.add(new paper.Point(38, 12));
    compass.add(new paper.Point(43, 7));
    compass.add(new paper.Point(40, 7));
    compass.add(new paper.Point(43, 10));
    compass.add(new paper.Point(43, 7));
    compass.translate(new paper.Point(3,-3));
    compass.pivot = new paper.Point(40.5, 9.5);
    //currentTool = "mountain-brush";
    //drawMountainRange(this.state.group, 20, 20);
    group.addChild(outline);
    group.addChild(corner);
    group.addChild(compass);
    group.position = new paper.Point(this.props.x, this.props.y);
    outline.onClick = (e) => this.handleClick(e);
    this.setState({
      eye: eye,
      compass: compass,
      outline: outline,
      corner: corner,
      group: group,
      intervalID: requestAnimationFrame((e) => this.update(e))
    });
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
