let MyCamera;
let renderer;
let physics;

let c;
let balls = Array(10);

function setup() {
  createCanvas(400, 400);
  
  MyCamera = new Camera();
  MyCamera.setWorldPosition(0, 10, 2);
  MyCamera.rotationRadius = 10;
  
  renderer = new ObjectRenderer(MyCamera);
  physics = new PhysicsEngine();

  for (i = 0; i<balls.length; i++) {
      balls[i] = new Ball();
      renderer.addObject(balls[i]);
  }
  
  renderer.addOrigin();
  
  c = new Character();
  c.addChildren(renderer);
  physics.addObject(c);
   
}

// control settings
let moveSpeed = 0.2;
let rotSpeed = 0.05;

// handle controller
let keyState = {};

function keyPressed(e) {
  keyState[e.key] = true;
}

function keyReleased(e) {
  keyState[e.key] = false; 
}

function draw() {
  background(220);
  
  // jump
  if (keyState[' ']) {
    if (c.onGround()) {
        c.zv = 2.0;
    }
  }
  
  // update physics
  physics.update();
  
  // set camera to follow character
  MyCamera.FollowWp(c.x, c.y, c.z);
  
  // advance walk cycle if moving
  if (Object.values(keyState).indexOf(true) != -1 || !c.onGround()) {
    c.walkCycleTick++;
  }
    
  // control position
    if (keyState['w']) {
      c.addCharacterCoordinates(0, -moveSpeed,0);
    }
    if (keyState['s']) {
      c.addCharacterCoordinates(0, moveSpeed,0);
    }
    if (keyState['a']) {
      c.addCharacterCoordinates(moveSpeed,0,0);
    }    
    if (keyState['d']) {
     c.addCharacterCoordinates(-moveSpeed,0,0);
    }
  
    // control rotation
    if (keyState['ArrowLeft']) {
        c.addRotation(rotSpeed);
      MyCamera.addCameraRotation(rotSpeed,0,0);
    }
    if (keyState['ArrowRight']) {
       c.addRotation(-rotSpeed);
      MyCamera.addCameraRotation(-rotSpeed,0,0);
    }
    
    if (keyState['ArrowDown']) {
      MyCamera.addCameraRotation(0,0,rotSpeed);
    }
    if (keyState['ArrowUp']) {            
      MyCamera.addCameraRotation(0,0,-rotSpeed);
    }
  
  // display world scene
  renderer.render();

}