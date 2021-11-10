import "./styles.css";

import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Slider from "@material-ui/core/Slider";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import CompassIcon from "@material-ui/icons/AllOut";
import ExploreIcon from "@material-ui/icons/Explore";
import SpeedIcon from "@material-ui/icons/Speed";
import RobotIcon from "@material-ui/icons/Camera";
import MotionIcon from "@material-ui/icons/ControlCamera";
import ThreeIcon from "@material-ui/icons/Looks3";
import FourIcon from "@material-ui/icons/Looks4";
import OneIcon from "@material-ui/icons/LooksOne";
import TwoIcon from "@material-ui/icons/LooksTwo";
import ManualIcon from "@material-ui/icons/PanTool";
import HorizIcon from "@material-ui/icons/SwapHoriz";
import VertIcon from "@material-ui/icons/SwapVert";
import ThreeDRotationIcon from "@material-ui/icons/ThreeDRotation";
import HighlightIcon from "@material-ui/icons/Highlight";

import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import FastForwardIcon from "@material-ui/icons/FastForward";
import StopIcon from "@material-ui/icons/Stop";
import PauseIcon from "@material-ui/icons/Pause";
import FastRewindIcon from "@material-ui/icons/FastRewind";
import EjectIcon from "@material-ui/icons/Eject";

import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import HeightIcon from "@material-ui/icons/Height";

import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ReportIcon from "@material-ui/icons/Report";

import React from "react";

import Sketch from "react-p5";

const thrustmarks = [
  {
    value: 50,
    label: <ExpandLessIcon />
  },
  {
    value: 100,
    label: <ArrowUpwardIcon />
  },
  {
    value: 0,
    label: <ReportIcon />
  },
  {
    value: -50,
    label: <ExpandMoreIcon />
  },
  {
    value: -100,
    label: <ArrowDownwardIcon />
  }
];

const diffmarks = [
  {
    value: -50,
    label: <ArrowBackIcon />
  },
  {
    value: 100,
    label: <RotateRightIcon />
  },
  {
    value: 0,
    label: <HeightIcon />
  },
  {
    value: 50,
    label: <ArrowForwardIcon />
  },
  {
    value: -100,
    label: <RotateLeftIcon />
  }
];

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: 80
  },
  papertall: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: 250
  },
  thrustslider: {
    height: 200,
    padding: 20
  },
  diffslider: {
    height: 20,
    padding: 20
  },
  chip: {
    margin: theme.spacing(0.5)
  }
}));

let FLOTILLA_HOST = "flotilla.local";

let STREAM_PORT = ":8080";
let TELEMETRY_PORT = ":8000";

let TELEMETRY = "/telemetry";
let STREAM = "/stream/video.mjpeg";

let TELEMETRY_URL = "http://" + FLOTILLA_HOST + TELEMETRY_PORT + TELEMETRY;
let STREAM_URL = "http://" + FLOTILLA_HOST + STREAM_PORT + STREAM;

let UI_W = 320;
let UI_H = 240;

let UI_GRID_W = UI_W / 6;
let UI_GRID_H = UI_H / 4;

let UI_PAD = UI_GRID_W / 10;

// Location for the COMPASS = last 1/6th on the right, top 1/4
let COMP_LOC = [UI_GRID_W * 5 + UI_GRID_W / 2, UI_GRID_H / 2];

let COMP_SIZ = UI_GRID_W - UI_PAD;

let XYZ_LOC = [COMP_LOC[0], UI_GRID_H / 2 + UI_GRID_H * 2];

let imageStream = null;

class ViewPort extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0, z: 1, heading: 0 };
  }

  updateTelemetry() {
    var requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    var requestURL = {
      telemetry: TELEMETRY_URL
    };

    console.log(requestURL.telemetry);

    fetch(requestURL.telemetry, requestOptions)
      .then((response) => response.json())
      .then((result) =>
        this.setState((state) => ({
          x: result.x,
          y: result.y,
          z: result.z,
          heading: result.heading
        }))
      )
      // .then((result) => console.log(this.state))
      .catch((error) => console.log("telemetry error: ", error));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.updateTelemetry(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  setup = (p5, canvasParentRef) => {
    p5.createCanvas(UI_W, UI_H).parent(canvasParentRef);
    p5.frameRate(this.fr);
    // use parent to render canvas in this ref (without that p5 render this canvas outside your component)

    imageStream = p5.createImg(STREAM_URL, "Giraffe Stream");
    imageStream.hide();

    // set up the environment style
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.ellipseMode(p5.CENTER);
    p5.angleMode(p5.DEGREES);
  };

  draw = (p5) => {
    if (imageStream) {
      p5.image(imageStream, 0, 0);
    }

    p5.translate(COMP_LOC[0], COMP_LOC[1]);

    // transparent fill
    p5.fill(255, 255, 255, 100);

    // draw out the base of the compass (simple for the moment)
    p5.ellipse(0, 0, COMP_SIZ);

    // setup fill
    p5.noFill();

    // set the rotation up for the compass needle
    p5.rotate(this.state.heading);

    // draw the compass needle as a quad
    p5.strokeWeight(5);
    p5.quad(
      -(COMP_SIZ / 4),
      0,
      0,
      -(COMP_SIZ / 2),
      COMP_SIZ / 4,
      0,
      0,
      COMP_SIZ / 2
    );
    p5.strokeWeight(1);

    // setup fill and stroke
    p5.fill(0, 0, 0, 0);

    p5.textSize(14);
    p5.textStyle(p5.BOLD);
    p5.fill(255, 0, 0);
    // display the details of the heading
    p5.text("N", 0, -(COMP_SIZ / 2) + UI_PAD * 2);
    p5.textStyle(p5.NORMAL);

    // reset the rotation and translation
    p5.rotate(-this.state.heading);

    p5.textSize(12);
    p5.fill(255, 255, 255);
    p5.text(this.state.heading + "\xB0", 0, 0);

    p5.translate(-COMP_LOC[0], -COMP_LOC[1]);
    p5.noFill();
    p5.textSize(10);
    p5.textStyle(p5.NORMAL);

    // translate to the XYZ data location
    p5.translate(XYZ_LOC[0], XYZ_LOC[1]);

    p5.fill(0, 0, 0, 255);

    // display a centre point for the robot
    p5.strokeWeight(10);
    p5.point(0, 0);
    p5.strokeWeight(1);

    p5.rotate(this.state.z);

    // turn off fill so that we can see all the circles
    // transparent fill
    p5.fill(255, 255, 255, 100);

    // display x_data value
    p5.ellipse(0, 0, this.state.x, UI_GRID_H - UI_PAD * 2);

    // display the y_data value
    p5.ellipse(0, 0, UI_GRID_H - UI_PAD * 2, this.state.y);

    // display the z_data value
    p5.ellipse(0, 0, UI_GRID_H - UI_PAD * 2);

    p5.fill(255, 255, 255, 255);
    p5.text("z: " + this.state.z, 0, -(UI_GRID_H / 2));
    p5.text("x: " + this.state.x, 0, UI_GRID_H / 2);
    p5.text("y: " + this.state.y, -(UI_GRID_W / 2) - UI_PAD, 0);

    // reset the rotation and translation
    p5.rotate(-this.state.z);
    p5.translate(-XYZ_LOC[0], -XYZ_LOC[1]);
    p5.fill(255);
  };

  render() {
    return <Sketch setup={this.setup} draw={this.draw} />;
  }
}

class Telemetry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0, z: 1, heading: 0 };
  }

  updateTelemetry() {
    var requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    var requestURL = {
      telemetry: "/telemetry"
    };

    // console.log(requestURL.remote);

    fetch(requestURL.telemetry, requestOptions)
      .then((response) => response.json())
      .then((result) =>
        this.setState((state) => ({
          x: result.x,
          y: result.y,
          z: result.z,
          heading: result.heading
        }))
      )
      // .then((result) => console.log(this.state))
      .catch((error) => console.log("error", error));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.updateTelemetry(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div>
        <Chip icon={<ThreeDRotationIcon />} label={this.state.z.toFixed(2)} />
        <hr />
        <Chip icon={<HorizIcon />} label={this.state.y.toFixed(2)} />
        <hr />
        <Chip icon={<VertIcon />} label={this.state.x.toFixed(2)} />
        <hr />
        <Chip icon={<ExploreIcon />} label={this.state.heading.toFixed(1)} />
        <hr />
      </div>
    );
  }
}

export default function CenteredGrid() {
  const classes = useStyles();
  const [thrustvalue, setThrustValue] = React.useState(0);
  const [diffvalue, setDiffValue] = React.useState(0);
  const [motorspeeds, setMotorSpeeds] = React.useState({ left: 0, right: 0 });
  const [switchcheckedstate, setSwitchState] = React.useState({
    switch1: false,
    switch2: false,
    switch3: false,
    switch4: false
  });
  const [manualcheckedstate, setManualState] = React.useState({
    manualswitch: false
  });

  const handleMovementChange = (newthrustvalue, newdiffvalue) => {
    console.log("thrust new/current: " + newthrustvalue + "/" + thrustvalue);
    console.log("diff new/current: " + newdiffvalue + "/" + diffvalue);

    if (newthrustvalue !== thrustvalue || newdiffvalue !== diffvalue) {
      var requestOptions = {
        method: "PUT",
        redirect: "follow"
      };

      var requestURL = {
        thrust: "/thrust/" + newthrustvalue + "/diff/" + newdiffvalue
      };

      console.log(requestURL.thrust);

      fetch(requestURL.thrust, requestOptions)
        .then((response) => response.json())
        .then((result) => handlemovementChangeResult(result))
        .then((result) => console.log(result))
        .catch((error) => console.log("error", error));
    } else {
      console.log("no change");
    }
  };

  const handlemovementChangeResult = (movementresult) => {
    setMotorSpeeds(movementresult.motorspeeds);
    setThrustValue(movementresult.thrust);
    setDiffValue(movementresult.diff);
    return movementresult;
  };

  const handlethrustChange = (event, newValue) => {
    setThrustValue(newValue);
    handleMovementChange(newValue, diffvalue);
  };

  const handleDiffChange = (event, newValue) => {
    setDiffValue(newValue);
    handleMovementChange(thrustvalue, newValue);
  };

  const handleLightSwitch = (toggleLight) => {
    var requestOptions = {
      method: "PUT",
      redirect: "follow"
    };

    var requestURL = {
      rainbow: "/rainbow",
      allon: "/6",
      alloff: "/5",
      pixel1: "/0",
      white: "/255/150/200",
      red: "/255/0/0",
      brightness: "/150"
    };

    var composedURL = requestURL.rainbow;

    if (toggleLight) {
      composedURL = composedURL + requestURL.allon;
      composedURL = composedURL + requestURL.white + requestURL.brightness;
    } else {
      composedURL = composedURL + requestURL.alloff;
    }

    console.log(composedURL);

    fetch(composedURL, requestOptions)
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

  const handleSwitchChange = (event) => {
    setSwitchState({
      ...switchcheckedstate,
      [event.target.name]: event.target.checked
    });

    if (event.target.name === "switch1") {
      handleLightSwitch(event.target.checked);
    }

    console.log(
      "switch: " + event.target.name + "\nchecked: " + event.target.checked
    );
  };

  const handleManualChange = (event) => {
    setManualState({
      ...manualcheckedstate,
      [event.target.name]: event.target.checked
    });
    console.log(
      "switch: " + event.target.name + "\nchecked: " + event.target.checked
    );
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Paper className={classes.papertall}>
            <div className={classes.thrustslider}>
              <Slider
                value={thrustvalue}
                onChange={handlethrustChange}
                aria-labelledby="thrustslider"
                orientation="vertical"
                max={100}
                min={-100}
                marks={thrustmarks}
                valueLabelDisplay="auto"
                step={10}
                track={false}
                name="thrustslider"
              />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Paper className={classes.papertall} id="p5-telemetry">
            <ViewPort />
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <Paper className={classes.papertall}>
            <Telemetry />
            <Chip
              icon={<SpeedIcon />}
              label={motorspeeds.left + "/" + motorspeeds.right}
            />
          </Paper>
        </Grid>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <Paper className={classes.paper}>
            <div className={classes.diffslider}>
              <Slider
                value={diffvalue}
                onChange={handleDiffChange}
                aria-labelledby="diffslider"
                max={100}
                min={-100}
                marks={diffmarks}
                valueLabelDisplay="auto"
                step={10}
                track={false}
                name="diffslider"
              />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <Paper className={classes.paper}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="manualswitchcontrol"
                  control={
                    <Switch
                      color="primary"
                      checked={manualcheckedstate.manualswitch}
                      onChange={handleManualChange}
                      name="manualswitch"
                      disabled={true}
                    />
                  }
                  label={<ManualIcon />}
                  labelPlacement="top"
                />
              </FormGroup>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={2}></Grid>
        <Grid item xs={2}>
          <Paper className={classes.paper}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="switch1control"
                  control={
                    <Switch
                      color="primary"
                      checked={switchcheckedstate.switch1}
                      onChange={handleSwitchChange}
                      name="switch1"
                    />
                  }
                  label={<HighlightIcon />}
                  labelPlacement="top"
                />
              </FormGroup>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <Paper className={classes.paper}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="switch2control"
                  control={
                    <Switch
                      color="primary"
                      checked={switchcheckedstate.switch2}
                      onChange={handleSwitchChange}
                      name="switch2"
                    />
                  }
                  label={<TwoIcon />}
                  labelPlacement="top"
                />
              </FormGroup>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <Paper className={classes.paper}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="switch3control"
                  control={
                    <Switch
                      color="primary"
                      checked={switchcheckedstate.switch3}
                      onChange={handleSwitchChange}
                      name="switch3"
                    />
                  }
                  label={<ThreeIcon />}
                  labelPlacement="top"
                />
              </FormGroup>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <Paper className={classes.paper}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="switch4control"
                  control={
                    <Switch
                      color="primary"
                      checked={switchcheckedstate.switch4}
                      onChange={handleSwitchChange}
                      name="switch4"
                    />
                  }
                  label={<FourIcon />}
                  labelPlacement="top"
                />
              </FormGroup>
            </FormControl>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
