import { laserStyle } from "./MapDemonLogo.js"

export class MapDemonEye {
  constructor(x, y, paper) {
    this.intervalID = null;
    this.group = new paper.Group();
    this.ball = new paper.Path.Arc(new paper.Point(0, 8), new paper.Point(12, 16), new paper.Point(24, 8));
    this.ball.arcTo(new paper.Point(12, 0), new paper.Point(0, 8));
    this.ball.strokeWidth = 0;
    this.ball.fillColor = "#fff";
    this.uppereye = new paper.Path.Arc(new paper.Point(0, 8), new paper.Point(12, 0), new paper.Point(24, 8));
    this.uppereye.arcTo(new paper.Point(12, 0), new paper.Point(0, 8));
    this.lowereye = new paper.Path.Arc(new paper.Point(0, 0), new paper.Point(12, 8), new paper.Point(24, 0));
    this.lowereye.arcTo(new paper.Point(12, 8), new paper.Point(0, 0));
    this.iris = new paper.Path.Line(new paper.Point(0, 0), new paper.Point(0, 6));
    this.pupil = new paper.Path.Line(new paper.Point(0, 0), new paper.Point(0, 6));
    this.x = x; // these aren't updated by paper and thus useless if we transform
    this.y = y;
    this.center = new paper.Point(x, y);
    this.blinkTimer = 0;
    this.blinkSpeed = 2;
    this.pupilState = "pupil-expanding";
    this.eyelidState = "still";
    this.style = laserStyle;
    this.follow = null;
    this.ball.position = new paper.Point(25, 25);
    this.paper = paper;
    this.uppereye.style = this.style;
    this.uppereye.fillColor = "#fff";
    this.uppereye.pivot = new paper.Point(12, 8);
    this.uppereye.position = new paper.Point(25, 25);
    this.lowereye.style = this.style;
    this.lowereye.fillColor = "#fff";
    this.lowereye.pivot = new paper.Point(12, 0);
    this.lowereye.translate(new paper.Point(13, 25));
    this.iris.style = this.style;
    this.iris.strokeColor = "#5d4640";
    this.iris.strokeWidth = 5;
    this.iris.translate(new paper.Point(25, 22));
    this.pupil.style = this.style;
    this.pupil.strokeColor = "#ff572c";
    this.pupil.strokeColor = "#f2aad4";
    this.pupil.translate(new paper.Point(25, 22));

    this.group.addChild(this.ball);
    this.group.addChild(this.iris);
    this.group.addChild(this.pupil);
    this.group.addChild(this.lowereye);
    this.group.addChild(this.uppereye);
    this.group.position = new paper.Point(this.x, this.y);

    const self = this;
    this.ball.onClick = function(e) {
      if (self.eyelidState != "blinking" && self.eyelidState != "blinkopen" && self.eyelidState != "blinkshut") {
        self.eyelidState = "blinking";
      }
    }
  }

  update(e) {

    this.blinkTimer++;
    switch (this.pupilState) {
      case 'pupil-narrowing':
        if (this.pupil.bounds.height > 2) {
          this.narrowPupil();
        } else {
          this.pupilState = "still";
        }
        break;
      case 'pupil-expanding':
        if (this.pupil.bounds.height < 6) {
          this.expandPupil();
        } else {
          this.pupilState = "still";
        }
        break;
      case 'following':
        if (!this.follow) {
          this.pupilState = "still";
        } else {
          let nx = this.center.x - this.follow.x;
          let ny = this.center.y - this.follow.y;

          let n = new this.paper.Point(nx, ny);
          let factor = Math.min(2,1/(70/n.length));

          let c = new this.paper.Point(nx, ny).normalize(factor);
          this.pupil.position.x = -3*c.x + this.ball.position.x;
          this.pupil.position.y = -1.5*c.y + this.ball.position.y;
          this.iris.position.x = -3*c.x + this.ball.position.x;
          this.iris.position.y = -1.5*c.y + this.ball.position.y;
        }
        break;
      case 'center':
        let nx = this.center.x - this.pupil.position.x;
        let ny = this.center.y - this.pupil.position.y;
        let n = new this.paper.Point(nx, 0.5*ny).normalize(0.2);
        this.pupil.position.x += n.x;
        this.pupil.position.y += n.y;
        this.iris.position.x += n.x;
        this.iris.position.y += n.y;
        let d = this.pupil.position.getDistance(this.center);
        if (d < 0.75) {
          this.pupil.position = this.center;
          this.iris.position = this.center;
          this.pupilState = "pupil-expanding";
        }
        break;
      case 'still':
        if (this.follow) {
          this.pupilState = "following";
        }
        break;
    }
    switch (this.eyelidState) {
      case 'blinking':
        this.blink();
        break;
      case 'blinkopen':
        this.blinkOpen();
        break;
      case 'blinkshut':
        this.blinkShut();
        break;
      case 'still':
        if (this.blinkTimer > 800) {
          this.blink();
          this.blinkTimer = 0;
        }
        break;
      default:
        console.log("default?");
        break;
    }
    this.intervalID = requestAnimationFrame((e) => this.update(e));
  }

  narrowPupil() {
    this.pupil.scale(0, 0.9);
  }

  expandPupil() {
    this.pupil.scale(0, 1.1);
  }

  centerEye() {
    this.pupilState = "center";
  }

  blink() {
    this.uppereye.segments[3].point.y += this.blinkSpeed;
    this.eyelidState = "blinkshut";
  }

  blinkOpen() {
    if (this.uppereye.segments[3].point.y <= this.uppereye.segments[1].point.y+1) {
      // blink over
      this.uppereye.segments[2].handleOut.y = this.uppereye.segments[0].handleOut.y;
      this.uppereye.segments[4].handleIn.y = this.uppereye.segments[2].handleIn.y;
      this.uppereye.segments[3].point.y = this.uppereye.segments[1].point.y;
      this.eyelidState = "still";
      this.blinkTimer = 0;
    } else {
      this.uppereye.segments[3].point.y -= this.blinkSpeed;
      if (this.uppereye.segments[3].point.y >= 7) {
        this.uppereye.segments[2].handleOut.y -= 0.5*this.blinkSpeed;
        this.uppereye.segments[4].handleIn.y -= 0.5*this.blinkSpeed;
      }
    }
  }

  blinkShut() {
    this.uppereye.segments[3].point.y += this.blinkSpeed;
    if (this.uppereye.segments[3].point.y >= 7) {
      this.uppereye.segments[2].handleOut.y += 0.5*this.blinkSpeed;
      this.uppereye.segments[4].handleIn.y += 0.5*this.blinkSpeed;
    }

    if (this.uppereye.bounds.height > 16) {
      this.eyelidState = "blinkopen";
    }
  }

  followPoint(p) {
    this.follow = p;
  }
}

