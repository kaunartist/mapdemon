class SVGExport {

  function exportLaserableSVG(canvas) {

    // crop all the things
    lasercanvas = cropElements(canvas, lasercanvas);
    lasercanvas.onMouseDown = function(e) {
      clearLaser();
    };
    // change line widths
    // set line colors by item type
    // save the file
  }

  function clearLaser() {
    console.log("clearing laser canvas");
    lasercanvas.remove();
    lasercanvas = null;
    terrain.opacity = 1;
  }

  function moveChildrenTo(group, newparent, gpX = 0, gpY = 0, pID) {

    //console.log("Moving children of " + group.data.type);
    var parentX = gpX + group.bounds.x;
    if (group.data.type == "tree") {
      parentX += group.bounds.width/2;
    }
    var parentY = gpY + group.bounds.y + group.bounds.height;
    if (group.data.type == "shadowgroup") {
      parentX -= 1;
      parentY += 1;
    }
    //console.log("  Parent x/y = (" + parentX + "," + parentY + ")");

    for (var j in group.children) {

      var child = group.children[j];
      if (child.className == "Group") {
        //console.log("recursing " + child.data.type);
        moveChildrenTo(child, newparent, parentX, parentY, group.id);
      } else {
        var moved = child.copyTo(newparent);
        moved.data.pID = pID ? pID : group.id;
        moved.data.trueY = group.data.trueY;
        moved.data.trueX = group.data.trueX;
        moved.data.ogWidth = group.data.ogWidth;
        moved.data.ogHeight = group.data.ogHeight;
        moved.data.cropped = false;
        moved.data.splitProcessed = false;
        moved.data.cropProcessed = false;
        moved.data.copied = false;
        moved.data.istmp = false;
        moved.strokeColor = "#888";
        moved.fillColor = transparent;
        moved.position.x += parentX;
        moved.position.y += parentY;
      }
    }

  }

  function breakupGroups(from, to) {

    for (var c in from.children) {

      var item = from.children[c];
      if (item.data.type && item.data.type != 'border') {
        moveChildrenTo(item, to);
      }

    }
    sortTerrain(to);

    return to;
  }

  function splitItemAtIntersections(item, other, exportcanvas) {

    var splittingResults = [];
    var intersections = other.getCrossings(item);
    // FOR EVERY INTERSECTION POINT, SPLIT OTHER
    if (intersections.length == 0) {
      splittingResults.push(other);
    } else {
      othertmp = other.clone();
      othertmp.data.istmp = true;
      other.data.cropped = true;
      for (var j = 0; j < intersections.length; j++) {

        var loc = othertmp.getLocationOf(intersections[j].point);
        var splits = othertmp.splitAt(loc);

        if (splits) {
          // IF SPLITTING CAUSED A NEW PATH TO BE CREATED
          if (splits != othertmp) {
            splits.data = othertmp.data;
            splits.data.split = true;
            splits.data.cropped = false;
            var results = splitItemAtIntersections(item, splits, exportcanvas);
            splittingResults = splittingResults.concat(results);
            results = splitItemAtIntersections(item, othertmp, exportcanvas);
            splittingResults = splittingResults.concat(results);
            break;
          }
        }
      }
    }

    return splittingResults;

  }

  function removeIfInside(item, other, exportcanvas) {

    if (other.length > 0) {
      if (other.data.cropped) {
        // don't bother checking something already marked for deletion
      } else {
        var isInside = true; // some test for if it's inside
        for (var i in other.curves) {
          var c = other.curves[i];
          var p = c.point1;
          var point = new Point(other.bounds.x + Math.abs(p.x), other.bounds.y + Math.abs(p.y));
          if (!other.contains(point)) {
            // something wrong with how this path refers to itself, it is referring to points on the original path it seems
            if (other.data.type == "trunk") {
              //point.y += other.bounds.height;
            } else {
              other.applyMatrix = true;
              other.translate(-other.firstSegment.point);
            }
          }
          if (!item.contains(point)) {
            isInside = false;
            break;
          }
        }

        var bPoint = other.firstSegment.point;
        var ePoint = other.lastSegment.point;
        var beginning = new Point(other.bounds.x + Math.abs(bPoint.x), other.bounds.y + Math.abs(bPoint.y));
        var ending = new Point(other.bounds.x + Math.abs(ePoint.x), other.bounds.y + Math.abs(ePoint.y));

        if (!isInside) {
          if (!other.contains(beginning) || !other.contains(ending)) {
            console.log("------");
            console.log(other.bounds);
            console.log(other);
            console.log(item.data);
            console.log(other.data);
            if (other.data.cropped) {
              other.strokeColor = "#f00";
            } else {
              if (other.closed) {
                other.strokeColor = "#f0f";
              } else {
                other.strokeColor = "#0f0";
                other.strokeWidth = 1;
              }
            }
          }
        } else {
          // inside, allegedly
          console.log("------");
          console.log(item.data);
          console.log(other.data);
          console.log("inside, removing");
          other.data.cropped = true;
        }
      }
      /*
    if (item.contains(beginning) && item.contains(halfway) && item.contains(ending)) {
      // COMPLETELY INSIDE
      console.log("inside, removing");
      other.data.cropped = true;
//other.remove(); // we actually do want to remove this because it's completely contained within another element, which will supercede it in all cropping.
    } else {
        console.log("_____");

// COMPLETELY OUTSIDE...allegedly
        console.log(other.data);
        console.log(other.bounds);
      //var othercenter = drawIcon(exportcanvas, other.position.x, other.position.y, 1, 'dot');
        if (other.data.cropped) {
          other.strokeColor = "#f00";
        } else {
          if (other.closed) {
            other.strokeColor = "#f0f";
          } else {
            other.strokeColor = "#0f0";
            other.strokeWidth = 1;
          }
        }
      //}
      //var line = new Path.Line(other.position, item.position);
      //line.strokeWidth = 0.5;
      //line.strokeColor = "#f0f";
    }
    */
    } else {
      // ZERO LENGTH ITEM, REMOVE
      //other.data.cropped = true;
      console.log("Removing because of zero length");
      other.remove();
    }
  }

  function cropItemAgainstOverlaps(item, overlaps, exportcanvas) {
    for (var i in overlaps) {
      var other = overlaps[i];
      if (item != other) { // MAKE SURE WE'RE NOT EXAMINING THE ITEM IN QUESTION AGAINST ITSELF
        if (item.data.pID != other.data.pID) { // MAKE SURE WE'RE NOT CROPPING OUT OTHER SUBELEMENTS FROM THIS ITEM'S PARENT
          if (!other.isAbove(item)) { // ONLY DO STUFF IF THE OTHER ITEM IS BELOW THIS ITEM
            removeIfInside(item, other, exportcanvas);
          }
        }
      }
    }
  }

  function splitItemAgainstOverlaps(item, overlaps, exportcanvas) {

    for (var i in overlaps) {
      var other = overlaps[i];
      if (item != other) { // MAKE SURE WE'RE NOT EXAMINING THE ITEM IN QUESTION AGAINST ITSELF
        if (item.data.pID != other.data.pID) { // MAKE SURE WE'RE NOT CROPPING OUT OTHER SUBELEMENTS FROM THIS ITEM'S PARENT
          // RIGHT NOW WE ONLY CROP MOUNTAINS AND TREE CROWNS
          if (item.data.type == 'outline' || item.data.type == 'crown') {
            if (!other.isAbove(item)) { // ONLY DO STUFF IF THE OTHER ITEM IS BELOW THIS ITEM

              if (other.intersects(item)) {
                //other.strokeColor = "#f80";
                var splitResults = splitItemAtIntersections(item, other, exportcanvas);
              }
            }
          }
        }
      }
      item.data.splitProcessed = true;
    }
  }

  function splitItem(canvas, item, exportcanvas) {

    // GET ALL ITEMS OVERLAPPING WITH THIS ITEM'S BOUNDING BOX
    var overlaps = canvas.getItems({overlapping: item.bounds});
    splitItemAgainstOverlaps(item, overlaps, exportcanvas);

  }

  function cropItem(canvas, item, exportcanvas) {

    // GET ALL ITEMS OVERLAPPING WITH THIS ITEM'S BOUNDING BOX
    item.data.cropProcessed = true;
    var overlaps = canvas.getItems({overlapping: item.bounds});
    cropItemAgainstOverlaps(item, overlaps, exportcanvas);

  }

  function splitItems(canvas, exportcanvas) {

    console.log("Presplit: T's children now at " + canvas.children.length);
    var allProcessed = false;
    var whiles = 0;
    while (!allProcessed) {

      var toCheck = canvas.getItems({data: {splitProcessed: false}});
      if (toCheck.length == 0) {
        allProcessed = true;
      } else {
        whiles += 1;

        for (var c in toCheck) {
          var item = toCheck[c];
          splitItem(canvas, item, exportcanvas);
        }
      }
    }
    console.log("Took " + whiles + " loops through children to process them all");
    console.log("Postsplit: T's children now at " + canvas.children.length);

    return canvas;
  }

  function copyToExportCanvas(from, to) {

    var tocopy = from.getItems({data: {cropped: false}});
    console.log(tocopy);
    console.log("Copying: " + tocopy.length);
    for (var c in tocopy) {
      var item = tocopy[c];
      if (item.data.type) {
        item.copyTo(to);
        console.log("Copying item: type: " + item.data.type + ", tmp: " + item.data.istmp + ", id: " + item.id + ", pid: " + item.data.pID);
      }
    }

    return to;
  }

  function removeInsideItems(canvas) {

    console.log("Precrop: T's children now at " + canvas.children.length);
    var allProcessed = false;
    var whiles = 0;
    while (!allProcessed) {

      var toCheck = canvas.getItems({data: {cropProcessed: false}});
      if (toCheck.length == 0 || whiles > 1) {
        allProcessed = true;
      } else {
        whiles += 1;

        for (var c in toCheck) {
          var item = toCheck[c];
          cropItem(canvas, item, exportcanvas);
        }
      }
    }
    console.log("Took " + whiles + " loops through children to process them all");
    console.log("Postcrop: T's children now at " + canvas.children.length);

    return canvas;
  }

  function cropElements(canvas, t) {

    t = new Group();

    exportcanvas = new Group();

    breakupGroups(canvas, t); // break items into their component parts to simplify coordinate systems
    splitItems(t, exportcanvas); // crop all items but don't remove, just mark to not be copied
    sortTerrain(t);
    removeInsideItems(t);
    copyToExportCanvas(t, exportcanvas); // copy over items to the export canvas

    var border = new Path.Rectangle(new Rectangle(1,1, 700, 700));
    border.data = {'type': 'border'};
    border.style = { strokeColor: '#0ff', strokeWidth: 1, fillColor: new Color(0,255,255,0.05) };
    exportcanvas.addChild(border);
    exportcanvas.bringToFront();
    console.log("Done exporting to laser");

    t.removeChildren();
    canvas.opacity = 0;

    return exportcanvas;
  }

  function exportSVG() {
    //draw.svg();
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(draw.svg()));
    element.setAttribute('download', 'map.svg');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
