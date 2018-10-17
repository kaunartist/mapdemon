import React, {Component} from "react";
import ReactDOM from "react-dom";
import Toolbar from "./Toolbar.js";
import $ from "jquery";

class MapDemon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      terrain: null,
      lastInsert: 0,
    };
  }

  componentDidMount() {

    this.props.paperScope.setup("map");
    let terrain = new this.props.paperScope.Group();
    terrain.data.type = "terrain";
    let map_border = new this.props.paperScope.Path.Rectangle(new this.props.paperScope.Rectangle(1,1, 700, 700));
    map_border.data = {'type': 'border', 'trueY': 0};
    map_border.style = { strokeColor: '#5d4640', strokeWidth: 2, fillColor: "#aaa" };
    map_border.fillColor = "#fff";
    //terrain.style = { strokeScaling: false };
    terrain.addChild(map_border);
    map_border.sendToBack();
    this.setState({'terrain': terrain});

    this.hitTestTerrain = this.hitTestTerrain.bind(this);
    this.getItems = this.getItems.bind(this);
    this.changeMapSize = this.changeMapSize.bind(this);
    this.getTerrain = this.getTerrain.bind(this);

    terrain.onMouseDown = this.handleMouseDown.bind(this);

    terrain.onMouseUp = this.handleMouseUp.bind(this);

    terrain.onMouseMove = this.handleMouseMove.bind(this);
  }

  render() {
    return (
      <div className="mapdemon-container">
        <Toolbar paperScope={this.props.paperScope} changeMapSize={this.changeMapSize} getItems={this.getItems} hitTestTerrain={this.hitTestTerrain} getTerrain={this.getTerrain} toolChange={this.props.toolChange} />
        <div className="map-container">
          <canvas id="map" ref={el => this.el = el}></canvas>
        </div>
      </div>
    );
  }

  handleMouseDown(e) {

    let tool = this.props.getTool();
    let result = tool.useTool(e);
    if (result) {
      for (let i = 0; i < result.length; i++) {
        this.insertTerrain(this.state.terrain, result[i]);
      }
    }

  }

  handleMouseUp(e) {

    let tool = this.props.getTool();
    let result = tool.useTool(e);
    if (result) {
      for (let i = 0; i < result.length; i++) {
        this.insertTerrain(this.state.terrain, result[i]);
      }
    }
  }

  handleMouseMove(e) {
    
    let tool = this.props.getTool();
    let result = tool.useTool(e);
    if (result) {
      for (let i = 0; i < result.length; i++) {
        this.insertTerrain(this.state.terrain, result[i]);
      }
    }
  }
  
  hitTestMatch(h) {

    switch (h.item.data.type) {
      case 'trunk':
      case 'crown':
      case 'tree':
      case 'mountain':
      case 'road':
      case 'river':
      case 'coast':
      case 'coastline':
      case 'icon-instance':
      case 'label':
      case 'label-text':
      case 'label-bg':
        return true;
        break;
      case 'border':
        return false;
        break;
      default:
        let parent = h.item.parent;
        let done = false;
        if (parent) {
          while (!done) {
            if (!parent || parent.data.type == "border") {
              return false;
            }
            if (parent.data.type == "icon-instance" || parent.data.type == "terrain") {
              done = true;
              break;
            }
            parent = parent.parent;
          }
          if (parent.data.type == "icon-instance") {
            h.item.data.type = "icon-child";
            h.item.data.icon = parent;
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
        break;
    }
  }

  hitTestTerrain(point) {
    let paper = this.props.paperScope;
    let hits = this.state.terrain.hitTestAll(point, {fill: true, stroke: true, match: this.hitTestMatch});
    return hits;
  }

  getItems(options) {
    return this.state.terrain.getItems(options);
  }

  changeMapSize(width, height) {

    let paper = this.props.paperScope;
    let map_border = this.state.terrain.getItem({ data: {type: "border"} });
    let rect = new paper.Rectangle(1, 1, Number(width), Number(height));
    let new_border = new paper.Path.Rectangle(rect);
    new_border.data = map_border.data;
    new_border.style = map_border.style;
    this.state.terrain.addChild(new_border);
    new_border.sendToBack();
    map_border.remove();
    paper.view.center = this.state.terrain.bounds.center;

  }

  getTerrain() {
    return this.state.terrain;
  }

  insertTerrain(canvas, item, kohaiTarget=null) {

    //console.log("---");
    let y;
    if (item.data && "sortY" in item.data) {
      y = item.data.sortY;
    } else {
      y = item.data.trueY;
    }
    let c = canvas.children;
    let kohai = 0;
    let lastInsert = this.state.lastInsert;
    //console.log("Inserting, lastInsert was at " + lastInsert);
    if (lastInsert >= c.length) {
      //console.log("Adjusting insert back to children length");
      lastInsert = c.length - 1;
    }

    if (kohaiTarget != null) {
      //console.log("Inserting by target level");
      // find last of that class
      for (let i = 1; i <= c.length; i++) {
        if (c[i-1].data.type == "border") {
          //console.log("skipping border searching by target number");
          kohai = i;
          continue;
        }
        if (c[i-1].data.trueY >= kohaiTarget) {
          //console.log("Found kohai by target number (road/river/coast) at i = " + i);
          kohai = i - 1;
          break;
        }
      }
    } else {
      // start from beginning of children
      if (c.length > 0) {
        if (c[c.length - 1].data.trueY < y) {
          //console.log("Our y of " + y + " is largest in all the land (next largest is " + c[c.length - 1].data.trueY + ")");
          kohai = c.length;
        } else if (c[c.length - 1].data.trueY == y) {
          //console.log("Same y as last item, go beneath it");
          //console.log("last insert is " + lastInsert + " with a trueY of " + c[lastInsert].data.trueY);
          kohai = c.length - 1;
          if (c.length > 1) {
            if (c[c.length - 2].data.trueY < y) {
              //console.log("next from last is smaller than y, insert at end");
              //console.log("Setting kohai to length");
              kohai = c.length;
            } else {
              //console.log("Doing a weird for loop");
              for (let k = c.length - 3; k > 0; k--) {
                let s = c[k];
                if (s.data.trueY < y) {
                  //console.log("searching from end, found at k = " + k);
                  kohai = k+1;
                  break;
                }
              }
            }
          }
        } else {
          //console.log("Not largest or near largest, start from lastinsert maybe");
          let found_kohai = false;
          //console.log(lastInsert);
          let start = lastInsert;
          if (c[lastInsert].data.trueY > y) {
            //console.log("lastInsert's trueY is greater than our y, start from 0");
            start = 0;
          }
          if (c[lastInsert].data.trueY == y) {
            //console.log("lastInsert's trueY is equal to our y, start from lastInsert+1");
            start += 1;
          }
          //console.log("Searching starting from " + start + " up to " + (c.length-1) );
          for (let i = start; i < c.length; i++) {
            if (c[i].data.type == "border") {
              //console.log("Going past border at i = " + i);
              kohai = i + 1;
              continue;
            }
            if (c[i].data.trueY >= y) {
              //console.log("Stopped by c["+i+"]'s trueY of " + c[i].data.trueY + " against our y of " + y);
              //console.log("lastInsert = " + lastInsert + ", i = " + i);
              found_kohai = true;
              kohai = i;
              break;
            }
          }
          /*
        if (!found_kohai) {
          console.log("Last insert = " + lastInsert);
          if (lastInsert < c.length) {
          console.log("Last insert has trueY of " + c[lastInsert].data.trueY);
          } else {
            console.log("but children length is only " + c.length);
          }
          console.log("Against our y of " + y);
          console.log("Should we have looked in the first half of the array instead?");
        }
        */
        }
      }
    }

    //console.log("  Inserting at kohai = " + kohai);
    lastInsert = kohai;
    //console.log("Setting lastInsert to " + lastInsert);
    this.setState({'lastInsert': lastInsert});
    //this.setState({'lastInsert': lastInsert});
    let result = canvas.insertChild(kohai, item);
    //console.log("    now length is " + c.length);
    if (!result) {
      //console.log("Could not insert item.");
    } else {
      //console.log(result);
    }
  }

}

export default MapDemon;
