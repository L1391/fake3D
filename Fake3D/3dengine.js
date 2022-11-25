/** CAMERA CLASS **/
class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    
    this.rotationRadius = 0;
    
    this.yaw = 0;
    this.roll = 0;
    this.pitch = -PI/2;
    
    this.fov = 1.0/tan(PI/3/2.0);
    this.near = 1;
    this.far = 50;
    
    this.scaleFactor = 10;
    
    this.clipMat = this.getClipMat(this.fov, this.near, this.far);
    this.rotMat = this.getRotMat(this.yaw, this.roll, this.pitch);
  }
  
  // set camera settings
  setNearFar(near, far) {
    this.near = near;
    this.far = far;
    
    this.clipMat = this.getClipMat(this.fov, this.near, this.far);
  }
  
  // set camera position
  setWorldPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  // set camera rotation
  setRotation(yaw, roll, pitch) {
    let [ax,ay, az] = this.CpToWp(0,0,-this.rotationRadius);
    
    this.yaw = yaw;
    this.roll = roll;
    this.pitch = pitch;
    
    this.rotMat = this.getRotMat(this.yaw, this.roll, this.pitch);

      
    this.x = ax + this.rotationRadius*sin(this.yaw)*sin(this.pitch);
        this.y = ay - this.rotationRadius*cos(this.yaw)*sin(this.pitch);
        this.z = az + this.rotationRadius*cos(this.pitch);
  }
  
  // change camera rotation
  addCameraRotation(yaw, roll, pitch) {
    let [ax,ay, az] = this.CpToWp(0,0,-this.rotationRadius);
    
    this.yaw += yaw;
    this.roll += roll;
    this.pitch += pitch;
    
    this.rotMat = this.getRotMat(this.yaw, this.roll, this.pitch);

      
    this.x = ax + this.rotationRadius*sin(this.yaw)*sin(this.pitch);
        this.y = ay - this.rotationRadius*cos(this.yaw)*sin(this.pitch);
        this.z = az + this.rotationRadius*cos(this.pitch);
  }
  
  // change camera position based on camera coordinates
  
  addCameraCoordinates(x,y,z, ignoreYaw, ignoreroll, ignorepitch) {
    let yaw = ignoreYaw ? 0 : this.yaw;
    let roll = ignoreroll ? 0 : this.roll;
    let pitch = ignorepitch ? 0 : this.pitch;
    
    let mat = this.getRotMat(yaw, roll, pitch);
    
    // inverse rotation matrix
     let wx = x*mat[0][0] + y*mat[0][1]+z*mat[0][2];
     let wy = x*mat[1][0] + y*mat[1][1]+z*mat[1][2];
     let wz = x*mat[2][0] + y*mat[2][1] + z*mat[2][2];
    
    // translation
    this.addWorldCoordinates(wx,wy,wz);
    
  }
  
  addWorldCoordinates(x,y,z) {
    this.x +=x;
    this.y +=y;
    this.z += z;
  }
  
  // generate clipping matrix
  getClipMat(fov, near, far) {
    return [[fov*1/1,0,0,0],
                    [0, fov,0,0],
                    [0,0,( far+ near)/( far- near),1],
                   [0,0,(2* far* near)/( far- near),0]];
  }
  
  // generate rotation matrix
  getRotMat(yaw, roll, pitch) {
    return [[cos(yaw)*cos(roll),
                  cos( yaw)*sin( roll)*sin( pitch)-sin( yaw)*cos( pitch),
                    cos( yaw)*sin( roll)*cos( pitch)+sin( yaw)*sin( pitch)],        
                   [sin( yaw)*cos( roll),
                    sin( yaw)*sin( roll)*sin( pitch)+cos( yaw)*cos( pitch),
                    sin( yaw)*sin( roll)*cos( pitch)-cos( yaw)*sin( pitch)],
                   [-sin( roll),
                   cos( roll)*sin( pitch),
                   cos( roll)*cos( pitch)]];
    
  }
  
  // convert world point to camera point to screen point through perspective projection
  WpToSp(wx, wy, wz) {
    
    // translation
    wx = wx - this.x;
    wy = wy - this.y;
    wz = wz - this.z;
    
    // rotation
     let cx = wx*this.rotMat[0][0] + wy*this.rotMat[1][0]+wz*this.rotMat[2][0];
     let cy = wx*this.rotMat[0][1] + wy*this.rotMat[1][1]+wz*this.rotMat[2][1];
     let cz = wx*this.rotMat[0][2] + wy*this.rotMat[1][2] + wz*this.rotMat[2][2];
    
    // perspective 
    cx = cx*this.clipMat[0][0];
    cy = cy*this.clipMat[1][1];
    cz = cz*this.clipMat[2][2]+1;
    let w = cz*this.clipMat[3][2];
        
    // screen translation (0, 0) defined as center, +x right, +y up
    let sx = width*cx/(2*w) + width/2;
    let sy = height/2 - cy*height/(2*w);
    let sz = cz;
    
    // scaling
    let ss = -this.scaleFactor/sz;
              
    return [sx,sy,sz, ss];
  }
  
  // convert point in camera space to world space. wp = R cp + t
  CpToWp(cx, cy, cz) {
    
      // inverse rotation matrix
     let wx = cx*this.rotMat[0][0] + cy*this.rotMat[0][1]+cz*this.rotMat[0][2];
     let wy = cx*this.rotMat[1][0] + cy*this.rotMat[1][1]+cz*this.rotMat[1][2];
     let wz = cx*this.rotMat[2][0] + cy*this.rotMat[2][1] + cz*this.rotMat[2][2];
    
    // translation
    wx = wx + this.x;
    wy = wy + this.y;
    wz = wz + this.z;
    
    return [wx, wy, wz];
  }
  
  // translate camera to be looking at world point with fixed rotation
  FollowWp(wx, wy, wz) {
    
    this.x = wx + this.rotationRadius*sin(this.yaw)*sin(this.pitch);
        this.y = wy - this.rotationRadius*cos(this.yaw)*sin(this.pitch);
        this.z = wz + this.rotationRadius*cos(this.pitch);

  }
  
}

/** OBJECT PHYSICS **/
class PhysicsEngine {
  constructor() {
    this.objects = [];
    this.gravity = -0.1;
  }
  
  addObject(object) {
    this.objects.push(object);
  }
  
  update() {
    this.objects.forEach((o) => {
      // only apply gravity if object needs to fall
      if (!o.onGround()) {
        o.applyGravity(this.gravity);
      }
      
      o.update();
    });
  }
  
}


/** OBJECT RENDERER **/
class ObjectRenderer {
  
  constructor(camera) {
    this.camera = camera;
    this.objects = [];
  }
  
  addObject(object) {
    this.objects.push(object);
  }
  
  addOrigin() {
      let lx = new Line();
      let ly = new Line();
      let lz = new Line();
    
      lx.setEndPosition(1,0,0);
      ly.setEndPosition(0,1,0);
      lz.setEndPosition(0,0,1);
    
      renderer.addObject(lx);
      renderer.addObject(ly);
      renderer.addObject(lz);
  }
  
  render() {
    
    this.objects.forEach((o) => {
      // draw shadows first
      o.showShadow(this.camera);
      // calculate position and depth of objects
      o.calculateObject(this.camera);
    });
    
    // sort rendering from farthest to nearest
    this.objects.sort((a, b) => {
      return a.depth - b.depth;
    });
    
    // draw objects farthest first
    this.objects.forEach((o) => {
      o.showObject();
    });
    
    
  }
}

/** DEFAULT CHARACTER OBJECT **/ 
class Character {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    
    this.xv = 0;
    this.yv = 0;
    this.zv = 0;
    
    this.yaw = 0;
    
    this.color = [random(255), random(255), random(255)];
    
    this.walkCycleTick = 0;
            
    this.body = new Ball();
    this.body.setColor(this.color[0], this.color[1], this.color[2]);
    this.body.radius = 40;
    
    this.leg1 = new Line();
    this.leg2 = new Line();
    this.leg1.setColor(this.color[0], this.color[1], this.color[2]);
    this.leg2.setColor(this.color[0], this.color[1], this.color[2]);

    this.update();
  }
  
  // add objects to renderer separately for proper depth calculation
  addChildren(renderer) {
    renderer.addObject(this.body);
    renderer.addObject(this.leg1);
    renderer.addObject(this.leg2);
  }
  
  setWorldPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
    
  addWorldCoordinates(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
  
  setRotation(yaw) {
    this.yaw = yaw;
  }
  
  addRotation(yaw) {
    this.yaw += yaw;
  }
  
  // add coordinates relative to character's rotation
  addCharacterCoordinates(x, y, z) {
    this.x += x*cos(this.yaw) - y*sin(this.yaw);
    this.y += x*sin(this.yaw) + y*cos(this.yaw);
    this.z +=z;
  }

  applyGravity(g) {
    this.zv += g;
  }
  
  onGround() {
    return this.z == 0;
  }
  
  update() {
    this.x += this.xv;
    this.y += this.yv;
    this.z += this.zv;
    
    // check if just contacted ground
    if (this.z < 0) {
      this.zv = 0;
      this.z = 0;
      
      // reset legs on contact
      this.leg1.setEndPosition(this.x + cos(this.yaw),this.y + sin(this.yaw),this.z);
      this.leg2.setEndPosition(this.x -cos(this.yaw),this.y - sin(this.yaw),this.z);
    }
       
    // set body and leg start positions
    this.body.setPosition(this.x,this.y,this.z + 3 + 0.2*sin(this.walkCycleTick*0.5));
    this.leg1.setStartPosition(this.x ,this.y,this.z + 3);
 this.leg2.setStartPosition(this.x,this.y,this.z+ 3);
    
    // set leg positions with delay to produce walking effect
    if (this.walkCycleTick % 10 == 0 ) {    
      this.leg1.setEndPosition(this.x + cos(this.yaw),this.y + sin(this.yaw),this.z);
    } 
    if ((this.walkCycleTick + 6) % 10 == 0 || this.walkCycleTick == 0) {
      this.leg2.setEndPosition(this.x -cos(this.yaw),this.y - sin(this.yaw),this.z);
    }
  }
}

/** BALL OBJECT **/
class Ball{
  
  constructor() {
    this.radius = random(10,50);
    this.color = [random(255),random(255),random(255)];
    
    this.x = random(-20,20);
    this.y = random(-20,20);
    this.z = random(0, 20);
    
    this.depth = this.y;
  }
  
  setPosition(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  setColor(r, g, b) {
    this.color = [r,g,b];
  }
  
  showShadow(camera) {
    strokeWeight(0);
    fill(150);
    
    let [x, y, z, s] = camera.WpToSp(this.x,this.y,0);
    
        
    if (z < 0)     {
      ellipse(x,y, this.radius*s, this.radius*s*cos(camera.pitch));
    }
    
  }
  
  calculateObject(camera) {
    let [x, y, z, s] = camera.WpToSp(this.x,this.y,this.z);
    
    this.sx = x;
    this.sy = y;
    this.ss = s;
    this.depth = z;
  }
  
  showObject() {
    strokeWeight(0);
    fill(this.color[0], this.color[1], this.color[2]);
    
    if (this.depth < 0)     {
    circle(this.sx, this.sy, this.radius*this.ss);
    }
  }
  
}

/** LINE OBJECT **/
class Line{
  
  constructor() {
    this.width = 5;
    this.color = [random(255), 255, 255];
    
    this.x1 = 0;
    this.y1 = 0;
    this.z1 = 0;
    
    this.x2 = random(10,100);
    this.y2 = random(10,100);
    this.z2 = random(30);
    
    this.depth = this.y;
  }
  
  setStartPosition(x1, y1, z1) {
    this.x1 = x1;
    this.y1 = y1;
    this.z1 = z1;
  }
  
  setEndPosition(x2, y2, z2) {
    this.x2 = x2;
    this.y2 = y2;
    this.z2 = z2;
  }
  
  
  setColor(r, g, b) {
    this.color = [r,g,b];
  }
  showShadow(camera) {
    
    let [x1, y1, z1,s1] = camera.WpToSp(this.x1,this.y1,0);
    let [x2, y2, z2,s2] = camera.WpToSp(this.x2,this.y2,0);

    strokeWeight(this.width*s1);
    stroke(150);
    
    if (z1 < 0 || z2 < 0)     {
      line(x1, y1, x2, y2);
    }
  }
  
  calculateObject(camera) {
    let [x1, y1, z1,s1] = camera.WpToSp(this.x1,this.y1,this.z1);
    let [x2, y2, z2,s2] = camera.WpToSp(this.x2,this.y2,this.z2);
    
    this.sx1 = x1;
    this.sx2 = x2;
    this.sy1 = y1;
    this.sy2 = y2;
    
    this.ss = (s1 + s2)/2;
    this.depth = (z1 + z2)/2;
    this.minDepth = min(z1,z2);
  }
  
  showObject(camera) {
    strokeWeight(this.width*this.ss);
    stroke(this.color[0], this.color[1], this.color[2]);
    
    if (this.minDepth < 0)     {
      line(this.sx1, this.sy1, this.sx2, this.sy2);
    }
        
  }
  
}