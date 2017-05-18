/**
 * Sigma.js Mouse Captor
 * ======================
 *
 * Sigma's captor dealing with the user's mouse.
 */
/**
 * Sigma.js Captor Class
 * ======================
 *
 * Abstract class representing a captor like the user's mouse or touch controls.
 */
import Captor from '../captor';

import {
  getX,
  getY,
  getCenter,
  getWheelDelta
} from './utils';

/**
 * Constants.
 */
const DRAG_TIMEOUT = 200,
      MOUSE_INERTIA_DURATION = 200,
      MOUSE_INERTIA_RATIO = 3,
      MOUSE_ZOOM_DURATION = 200,
      ZOOMING_RATIO = 1.7;

/**
 * Mouse captor class.
 *
 * @constructor
 */
export default class MouseCaptor extends Captor {
  constructor(container, camera) {
    super(container, camera);

    // Properties
    this.container = container;
    this.camera = camera;

    // State
    this.enabled = true;
    this.hasDragged = false;
    this.downStartTime = null;
    this.startMouseX = null;
    this.startMouseY = null;
    this.isMouseDown = false;
    this.isMoving = true;
    this.movingTimeout = null;
    this.startCameraState = null;
    this.lastCameraState = null;

    // Binding methods
    this.handleClick = this.handleClick.bind(this);
    this.handleDown = this.handleDown.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleWheel = this.handleWheel.bind(this);

    // Binding events
    container.addEventListener('click', this.handleClick, false);
    container.addEventListener('mousedown', this.handleDown, false);
    container.addEventListener('mousemove', this.handleMove, false);
    container.addEventListener('DOMMouseScroll', this.handleWheel, false);
    container.addEventListener('mousewheel', this.handleWheel, false);

    document.addEventListener('mouseup', this.handleUp, false);
  }

  handleClick() {

  }

  handleDown(e) {
    if (!this.enabled)
      return;

    this.startCameraState = this.camera.getState();
    this.lastCameraState = this.startCameraState;

    this.startMouseX = getX(e);
    this.startMouseY = getY(e);

    this.hasDragged = false;

    this.downStartTime = Date.now();

    // TODO: dispatch events
    switch (e.which) {
      default:

        // Left button pressed
        this.isMouseDown = true;
    }
  }

  handleUp(e) {
    if (!this.enabled || !this.isMouseDown)
      return;

    this.isMouseDown = false;

    if (this.movingTimeout)
      clearTimeout(this.movingTimeout);

    const x = getX(e),
          y = getY(e);

    const cameraState = this.camera.getState();

    if (this.isMoving) {
      this.camera.animate({
        x: cameraState.x + MOUSE_INERTIA_RATIO * (cameraState.x - this.lastCameraState.x),
        y: cameraState.y + MOUSE_INERTIA_RATIO * (cameraState.y - this.lastCameraState.y)
      }, {
        duration: MOUSE_INERTIA_DURATION,
        easing: 'quadraticOut'
      });
    }
    else if (this.startMouseX !== x || this.startMouseY !== y) {
      this.camera.setState({
        x: cameraState.x,
        y: cameraState.y
      });
    }

    // TODO: dispatch events
    this.isMoving = false;
  }

  handleMove(e) {
    if (!this.enabled)
      return;

    if (this.isMouseDown) {

      // TODO: dispatch events
      this.isMoving = true;
      this.hasDragged = true;

      if (this.movingTimeout)
        clearTimeout(this.movingTimeout);

      this.movingTimeout = setTimeout(() => {
        this.isMoving = false;
      }, DRAG_TIMEOUT);

      const position = this.camera.getPosition(
        getX(e) - this.startMouseX,
        getY(e) - this.startMouseY
      );

      const x = this.startCameraState.x - position.x,
            y = this.startCameraState.y - position.y;

      const cameraState = this.camera.getState();

      if (cameraState.x !== x || cameraState.y !== y) {

        this.lastCameraState = cameraState;

        this.camera.setState({
          x,
          y
        });
      }
    }

    if (e.preventDefault)
      e.preventDefault();
    else
      e.returnValue = false;

    e.stopPropagation();

    return false;
  }

  handleWheel(e) {
    if (!this.enabled)
      return;

    const delta = getWheelDelta(e);

    if (!delta)
      return;

    const ratio = delta > 0 ?
      1 / ZOOMING_RATIO :
      ZOOMING_RATIO;

    const center = getCenter(e);

    const position = this.camera.getPosition(
      getX(e) - center.x,
      getY(e) - center.y
    );

    // TODO: zoomTo helper
  }
}
