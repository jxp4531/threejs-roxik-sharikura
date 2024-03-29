import React from 'react';
import * as THREE from 'three';
import ResizeObserver from 'resize-observer-polyfill';
import CameraController from './CameraController';
import MotionController from './MotionController';
import './Roxik.scss';

export default class Roxik extends React.Component {

  state = {
    width: 512,
    height: 410
  };

  models = [];


  /**
   * Rendering
   */
  render() {
    return (
      <div className='three' ref={(el) => { this.three = el }}></div>
    );
  }

  /**
   * Initialization
   */
  componentDidMount() {
    this.initialize();
    this.animate();

    this.observer = new ResizeObserver(entries => {
      const {width, height} = entries[0].contentRect;
      this.setState({
        width: Math.floor(width),
        height: Math.floor(height)
      });
    });

    this.observer.observe(this.three);
  }

  initialize() {
    this.initializeEngine();
    this.initializeCamera();
    this.initializeLights();
    this.initializeMaterials();
    this.initializeObjects();
    this.initializeFilters();
    this.initializeListeners();
  }

  initializeEngine() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfefefe);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.three.appendChild(this.renderer.domElement);
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 1000);

    this.camera.position.x = 2;
    this.camera.position.y = 2;
    this.camera.position.z = -2;

    this.cameraController = new CameraController();
    this.cameraController.camera = this.camera;
  }

  initializeLights() {
    this.ambientLight = new THREE.DirectionalLight(0x9090aa);
    this.ambientLight.position.set(-10, 10, -10).normalize();
    this.scene.add(this.ambientLight);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }

  initializeMaterials() {
    const colors = [0x97350b, 0x266ea5, 0x00847f, 0x2f818e, 0x08917c, 0x08917c, 0x6b458c, 0x7a4526];
    this.sphereMaterial = [];

    for (let i = 0; i < 8; i++) {
      const mat = new THREE.MeshLambertMaterial({color: colors[i]});
      this.sphereMaterial.push(mat);
    }

    this.cubeMaterial = new THREE.MeshBasicMaterial({color: 0xdddddd});
    this.cubeMaterial.wireframe = true;
  }

  initializeObjects() {
    const bet = 0.7;
    const offset = (((8 - 1) * bet) * 0.5);
    const geometry = new THREE.IcosahedronBufferGeometry(0.3, 2);

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        for (let k = 0; k < 8; k++) {
          const m = this.sphereMaterial[Math.floor(Math.random() * 8)];
          const s = new THREE.Mesh(geometry, m);
          s.position.set(((i * bet) - offset), ((j * bet) - offset), ((k * bet) - offset));

          this.models.push(s);
          this.scene.add(s);
        }
      }
    }

    this.cube = new THREE.CubeGeometry(18, 18, 18, 4, 4, 4);
    this.cubeMesh = new THREE.Mesh(this.cube, this.cubeMaterial);
    this.scene.add(this.cubeMesh);

    this.cameraController.models = this.models;

    this.motionController = new MotionController();
    this.motionController.models = this.models;
    this.motionController.changeScene(MotionController.CYLINDER);
  }

  initializeFilters() {
  }

  initializeListeners() {
    document.addEventListener("keydown", this.keydownHandler.bind(this));
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.cameraController.step();
    this.motionController.step();

    this.renderer.render(this.scene, this.camera);
  }

  keydownHandler(event) {
    const keyCode = event.which;

    switch (keyCode) {
      case 49:
      case 97:
        this.motionController.changeScene(MotionController.CYLINDER);
        break;
      case 50:
      case 98:
        this.motionController.changeScene(MotionController.SPHERE);
        break;
      case 51:
      case 99:
        this.motionController.changeScene(MotionController.CUBE);
        break;
      case 52:
      case 100:
        this.motionController.changeScene(MotionController.TUBE);
        break;
      case 53:
      case 101:
        this.motionController.changeScene(MotionController.WAVE);
        break;
      case 54:
      case 102:
        this.motionController.changeScene(MotionController.GRAVITY);
        break;
      case 55:
      case 103:
        this.motionController.changeScene(MotionController.ANTIGRAVITY);
        break;
    }
  }

  /**
   * Invalidation handler
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    this.renderer.setSize(this.state.width, this.state.height);
    this.camera.aspect = this.state.width / this.state.height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Dipose
   */
  componentWillUnmount() {
    this.observer.disconnect();
  }

}
