import React, {Component} from "react";
import ReactDOM from "react-dom";
import {hot} from "react-hot-loader";
import MapDemon from "./MapDemon.js";
import MapDemonLogo from "./MapDemonLogo.js";
import MapDemonHeader from "./MapDemonHeader.js";
import "./css/mapdemon.css";
import "./css/ion.rangeSlider.css";
import "./css/ion.rangeSlider.skinFlat.css";
import paperCore from "paper";

class App extends Component {
  constructor(props) {
    super(props);

    paperCore.install(window);
    paperCore.settings.applyMatrix = false;
    let emptyTool = new paperCore.Tool();
    emptyTool.activate();

    this.state = {
      currentTool: null,
      currentToolName: null,
      emptyTool: emptyTool,
    };
  }

  render() {
    return (
      <div className="App">
        <nav className="menu">
          <MapDemonLogo x="30" y="30" paperScope={paperCore} />
          <MapDemonHeader />
        </nav>
        <MapDemon paperScope={paperCore} toolChange={(tool, toolname) => this.setCurrentTool(tool, toolname)} getTool={() => this.getCurrentTool()}/>
      </div>
    );
  }

  setCurrentTool(tool, toolname) {
    // Toolbar will report up to App when the tool changes
    if (this.state.currentTool) {
      this.state.currentTool.setState({active: "inactive"});
      document.getElementById('tool-params-' + this.state.currentToolName).style.display = "none";
    }
    this.setState({currentTool: tool, currentToolName: toolname});
  }

  getCurrentTool() {
    return this.state.currentTool;
  }
}

export default hot(module)(App);
