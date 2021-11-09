let CAMERA_IP = "flotilla.local:8080";

let TELEMETRY_URL = "telemetry.json";
var HEADING = 0;
var X_VAR = 0;
var Y_VAR = 0;
var Z_VAR = 0;

let UI_W = 640;
let UI_H = 480;

let UI_GRID_W = UI_W / 6;
let UI_GRID_H = UI_H / 4;

let UI_PAD = UI_GRID_W / 10;

// Location for the COMPASS = last 1/6th on the right, top 1/4
let COMP_LOC = [UI_GRID_W * 5 + UI_GRID_W / 2, UI_GRID_H / 2];

let COMP_SIZ = UI_GRID_W - UI_PAD;

let XYZ_LOC = [COMP_LOC[0], UI_GRID_H / 2 + UI_GRID_H * 2];

let XYZ_SIZ = COMP_SIZ;

function setup() {
  // setup the canvas
  var canvas = createCanvas(UI_W, UI_H);

  // Move the canvas so it’s inside our <div id="sketch-holder">.
  canvas.parent("p5-telemetry");

  CAMERA_URL = "http://" + CAMERA_IP + "/stream/video.mjpeg";
  print(CAMERA_URL);

  imageStream = createImg(CAMERA_URL, "Giraffe Stream");
  imageStream.hide();

  // set up the environment style
  textAlign(CENTER, CENTER);
  ellipseMode(CENTER);
  angleMode(DEGREES);

  setInterval(function () {
    loadJSON(TELEMETRY_URL, setTelemetry);
  }, 1000);
}

function draw() {
  background(220);
  if (imageStream) {
    image(imageStream, 0, 0);
  }

  // draw the compass for a given 'heading' value
  drawCompass(HEADING);
  // text("test", 20, 20);

  // draw the XYZ value data
  drawXYZdata(X_VAR, Y_VAR, Z_VAR);
  // text("test", 20, 40);
}

function setTelemetry(telemetry) {
  print(telemetry);

  HEADING = telemetry.heading;
  X_VAR = telemetry.x;
  Y_VAR = telemetry.y;
  Z_VAR = telemetry.z;
}

function drawCompass(comp_rotation) {
  // translate to the compass location variable
  translate(COMP_LOC[0], COMP_LOC[1]);

  // transparent fill
  fill(255, 255, 255, 100);

  // draw out the base of the compass (simple for the moment)
  ellipse(0, 0, COMP_SIZ);

  // setup fill
  noFill();

  // set the rotation up for the compass needle
  rotate(comp_rotation);

  // draw the compass needle as a quad
  strokeWeight(10);
  quad(
    -(COMP_SIZ / 4),
    0,
    0,
    -(COMP_SIZ / 2),
    COMP_SIZ / 4,
    0,
    0,
    COMP_SIZ / 2
  );
  strokeWeight(1);

  // setup fill and stroke
  fill(0, 0, 0, 0);

  textSize(30);
  textStyle(BOLD);
  fill(255, 0, 0);
  // display the details of the heading
  text("N", 0, -(COMP_SIZ / 2) + UI_PAD * 2);
  textStyle(NORMAL);

  // reset the rotation and translation
  rotate(-comp_rotation);

  textSize(18);
  fill(0);
  text(comp_rotation + "\xB0", 0, 0);

  translate(-COMP_LOC[0], -COMP_LOC[1]);
  noFill();
  textSize(12);
  textStyle(NORMAL);
}

function drawXYZdata(x_data, y_data, z_data) {
  // translate to the XYZ data location
  translate(XYZ_LOC[0], XYZ_LOC[1]);

  fill(0, 0, 0, 255);

  // display a centre point for the robot
  strokeWeight(10);
  point(0, 0);
  strokeWeight(1);

  rotate(z_data);

  // turn off fill so that we can see all the circles
  // transparent fill
  fill(255, 255, 255, 100);

  // display x_data value
  ellipse(0, 0, x_data, UI_GRID_H - UI_PAD * 2);

  // display the y_data value
  ellipse(0, 0, UI_GRID_H - UI_PAD * 2, y_data);

  // display the z_data value
  ellipse(0, 0, UI_GRID_H - UI_PAD * 2);

  fill(255, 255, 255, 255);
  text("z: " + z_data, 0, -(UI_GRID_H / 2));
  text("x: " + x_data, 0, UI_GRID_H / 2);
  text("y: " + y_data, -(UI_GRID_W / 2) - UI_PAD, 0);

  // reset the rotation and translation
  rotate(-z_data);
  translate(-XYZ_LOC[0], -XYZ_LOC[1]);
  fill(255);
}
