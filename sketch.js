/*
    Game Project 1-7
*/

var floorPos_y;
var gameChar_x;
var gameChar_y;
var cameraPos_x;

var isLeft;
var isRight;
var isPlummeting;
var isFalling;
var isShooting;
var laserHit;

var canyons;
var collectables;
var clouds;
var buildings;
var trees;
var platforms;
var enemies;
var lasers;

var score;
var lives;
var portal;

var jumpSound;
var collectableSound;
var fallingSound;
var portalSound;

function preload() {
  soundFormats("mp3", "wav");

  //load the sounds
  jumpSound = loadSound("assets/jump.wav");
  jumpSound.setVolume(0.1);

  //sound is played when a collectable is collected
  collectableSound = loadSound("assets/collectable.wav");
  collectableSound.setVolume(0.1);

  //sound is played when laser is shot
  laserSound = loadSound("assets/laser.wav");
  laserSound.setVolume(0.5);

  //sound is played when jumping
  fallingSound = loadSound("assets/falling.wav");
  fallingSound.setVolume(0.1);

  //sound is played when the portal at the end of the level is reached
  portalSound = loadSound("assets/portal.wav");
  portalSound.setVolume(0.1);
}

function setup() {
  //canvas' width and height are dynamic depending on the current screen's width and height
  createCanvas(windowWidth, windowHeight);

  floorPos_y = (height * 3) / 4;

  lives = 3;

  startGame();
}

function draw() {
  ///////////DRAWING CODE//////////

  //make the camera follow the game character in left side of the screen
  cameraPos_x = gameChar_x - width / 4;

  //fill the sky blue
  background(144, 202, 249);

  //draw the ground
  noStroke();
  fill(102, 187, 106);
  rect(0, floorPos_y, width, height - floorPos_y);

  //make the clouds move at a different speed than the other background objects
  push();
  translate(-cameraPos_x * 0.5, 0);

  //draw the clouds
  for (var i = 0; i < clouds.length; i++) {
    clouds[i].draw();
  }

  pop();

  //make all the other background elements move at the same speed
  push();
  translate(-cameraPos_x, 0);

  //draw the buildings
  drawBuildings();

  //draw the trees
  drawTrees();

  //draw the platforms
  for (var i = 0; i < platforms.length; i++) {
    platforms[i].draw();
  }

  //draw the canyons
  for (var i = 0; i < canyons.length; i++) {
    drawCanyon(canyons[i]);
    checkCanyon(canyons[i]);
  }

  //draw the collectables
  for (var i = 0; i < collectables.length; i++) {
    if (!collectables[i].isFound) {
      collectables[i].draw();
      collectables[i].check();
    }
  }

  //draw the portal
  drawPortal();

  //draw the laser on shooting - X is pressed
  if (laserHit) {
    for (var i = 0; i < lasers.length; i++) {
      lasers[i].draw();

      //if the laser hits any enemy, deactivate it and hide the laser
      for (var j = 0; j < enemies.length; j++) {
        if (lasers[i].checkEnemy(enemies[j])) {
          laserHit = false;
          enemies[j].deactivated = true;
        }
      }

      //the laser disappears after the range is reached
      if (lasers[i].checkRange()) {
        laserHit = false;
      }
    }
  }
  //if char stops shooting
  else if (!isShooting) {
    for (var i = 0; i < lasers.length; i++) {
      //update the laser coordinates
      //the laser always starts at the character's X and Y position
      lasers[i].updateCoordinates(gameChar_x, gameChar_y);
    }
  }

  //draw the enemy
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].draw(gameChar_x);

    //if the char gets too close to an enemy decrease the lives
    if (enemies[i].check(gameChar_x, gameChar_y)) {
      if (lives > 0) {
        lives -= 1;
        fallingSound.play();
        startGame();
        break;
      }
    }
  }

  //draw the game character
  drawGameCharacter();

  pop();

  //check if game character reaches portal
  if (!portal.isReached) {
    checkPortal();
  }

  //display the score
  fill(255);
  textSize(18);
  text("score: " + score, 15, 50);

  //display lives
  fill(255);
  textSize(18);
  text("lives: " + lives, 15, 70);

  //display controls
  fill(255);
  textSize(18);
  text("Move - W A D", width - 200, 50);
  text("Shoot - X", width - 200, 70);

  //check if level is won or lost
  if (lives == 0) {
    fill(255);
    textSize(40);
    text(
      "Game Over. Press Space to continue.",
      width / 2 - 250,
      height / 2 - 150
    );
    return;
  }
  //check if the portal at the end of the level is reached
  else if (portal.isReached) {
    fill(255);
    textSize(40);
    text(
      "Level Complete. Press Space to continue.",
      width / 2 - 250,
      height / 2 - 150
    );
    return;
  }

  checkLives();

  ///////////INTERACTION CODE//////////

  //conditional statements to move the game character

  //move character to the left
  if (isLeft == true) {
    gameChar_x -= 3;
  }
  //move character to the right
  if (isRight == true) {
    gameChar_x += 3;
  }
  //move character down after jumping jumping
  if (isPlummeting == true) {
    gameChar_y += 3;
  }
  //character is falling
  if (gameChar_y < floorPos_y) {
    //check if the character is on a platform
    var checkPlatform = false;
    for (var i = 0; i < platforms.length; i++) {
      if (platforms[i].check(gameChar_x, gameChar_y)) {
        checkPlatform = true;
        //remove the falling state of the character
        isFalling = false;
        break;
      }
    }
    //check if the character is not on the platform anymore
    if (checkPlatform == false) {
      isFalling = true;
      gameChar_y += 3;
    }
  }
  //return character to normal after falling on the ground
  else {
    isFalling = false;
  }
}

function startGame() {
  //position character in the left side of the screen
  gameChar_x = 100;
  gameChar_y = floorPos_y;

  isLeft = false;
  isRight = false;
  isPlummeting = false;
  isFalling = false;

  //to control the background scrolling
  cameraPos_x = 0;

  score = 0;

  portal = {
    isReached: false,
    x_pos: 5000,
  };

  //array of collectable objects
  collectables = [];
  collectables.push(createCollectable(250, floorPos_y - 120, 50));
  collectables.push(createCollectable(690, floorPos_y - 130, 45));
  collectables.push(createCollectable(2100, floorPos_y - 100, 45));
  collectables.push(createCollectable(2700, floorPos_y - 70, 50));
  collectables.push(createCollectable(3270, floorPos_y - 100, 50));
  collectables.push(createCollectable(3390, floorPos_y - 130, 40));
  collectables.push(createCollectable(3800, floorPos_y - 110, 40));
  collectables.push(createCollectable(4300, floorPos_y - 120, 50));
  collectables.push(createCollectable(4600, floorPos_y - 60, 50));

  //array of cloud objects
  clouds = [];
  for (var i = 0; i < 10; i++) {
    clouds.push(
      createCloud(
        random(0, portal.x_pos),
        random(floorPos_y - 650, floorPos_y - 350),
        random(130, 170),
        random(30, 60)
      )
    );
  }

  //array of platforms
  platforms = [];
  platforms.push(createPlatform(530, floorPos_y - 60, 100));
  platforms.push(createPlatform(640, floorPos_y - 98, 80));
  platforms.push(createPlatform(1050, floorPos_y - 60, 85));
  platforms.push(createPlatform(3200, floorPos_y - 60, 100));
  platforms.push(createPlatform(3350, floorPos_y - 90, 85));

  //array of tree positions
  trees_x = [
    100, 500, 800, 1300, 1550, 2300, 2600, 2790, 3500, 4055, 4500, 4700,
  ];

  //array of canyons
  canyons = [
    {
      x_pos: 200,
      width: 95,
    },
    {
      x_pos: 1060,
      width: 70,
    },
    {
      x_pos: 2060,
      width: 90,
    },
    {
      x_pos: 3200,
      width: 100,
    },
    {
      x_pos: 3900,
      width: 90,
    },
    {
      x_pos: 4100,
      width: 100,
    },
  ];

  //array of building objects
  //the y_pos is taken from ground position minus the height of the building
  buildings = [
    {
      x_pos: 370,
      y_pos: floorPos_y - 300,
      width: 100,
      height: 300,
    },
    {
      x_pos: 800,
      y_pos: floorPos_y - 250,
      width: 90,
      height: 250,
    },
    {
      x_pos: 1200,
      y_pos: floorPos_y - 400,
      width: 110,
      height: 400,
    },
    {
      x_pos: 1800,
      y_pos: floorPos_y - 250,
      width: 90,
      height: 250,
    },
    {
      x_pos: 2300,
      y_pos: floorPos_y - 400,
      width: 130,
      height: 400,
    },
    {
      x_pos: 2900,
      y_pos: floorPos_y - 300,
      width: 110,
      height: 300,
    },
    {
      x_pos: 3500,
      y_pos: floorPos_y - 400,
      width: 110,
      height: 400,
    },
    {
      x_pos: 4300,
      y_pos: floorPos_y - 350,
      width: 130,
      height: 350,
    },
  ];

  //array of lasers
  lasers = [];
  lasers.push(createLaser(gameChar_x, gameChar_y));

  //array of enemies
  enemies = [];
  enemies.push(new Enemy(400, floorPos_y - 300, 5));
  enemies.push(new Enemy(920, floorPos_y - 60, 5));
  enemies.push(new Enemy(2700, floorPos_y - 260, 5));
  enemies.push(new Enemy(3000, floorPos_y - 60, 5));
}

function keyPressed() {
  //if statements to control the animation of the character when keys are pressed

  //check if character is moving to the left
  if (keyCode == 65 && isPlummeting == false) {
    isLeft = true;
  }
  //check if the character is moving to the right
  else if (keyCode == 68 && isPlummeting == false) {
    isRight = true;
  }
  //check if the character is jumping
  else if (keyCode == 87 && isFalling == false && isPlummeting == false) {
    gameChar_y -= 80;
    jumpSound.play();
  }
  //check if the character shoots a laser
  else if (keyCode == 88) {
    isShooting = true;
    laserHit = true;
    laserSound.play();
  }
  //check if space is pressed at the end of the level at 0 lives
  else if (keyCode == 32 && (lives == 0 || portal.isReached)) {
    //lives are back at maximum - 3
    lives = 3;
    //start the game again
    startGame();
  }
}

function keyReleased() {
  //if statements to control the animation of the character when keys are released

  //stop moving to the left
  if (keyCode == 65) {
    isLeft = false;
  }
  //stop moving to the right
  else if (keyCode == 68) {
    isRight = false;
  }
  //stop shooting
  else if (keyCode == 88) {
    isShooting = false;
  }
}

//cloud factory
function createCloud(x, y, w, h) {
  var cloud = {
    x_pos: x,
    y_pos: y,
    width: w,
    height: h,
    draw: function () {
      //the clouds are a not fully opaque
      fill(255, 255, 255, 120);
      //the bigger part of the cloud
      rect(this.x_pos + 100, this.y_pos, this.width, this.height, 10);
      //the smaller part of the cloud
      rect(this.x_pos + 120, this.y_pos - 20, this.width - 70, this.height, 10);
    },
  };

  return cloud;
}

//collectable factory
function createCollectable(x, y, s) {
  var collectable = {
    x_pos: x,
    y_pos: y,
    size: s,
    isFound: false,
    draw: function () {
      stroke(225, 245, 254, 150);
      strokeWeight(4);
      fill(3, 169, 244);
      //outer circle
      ellipse(this.x_pos, this.y_pos, this.size);
      //inner circle
      ellipse(this.x_pos, this.y_pos, this.size - 10);
      //point in the center
      point(this.x_pos, this.y_pos);
      noStroke();
    },
    check: function () {
      //check if the char reached a collectable object
      if (dist(gameChar_x, gameChar_y, this.x_pos, this.y_pos) < 90) {
        this.isFound = true;
        //increase the score
        score += 1;
        collectableSound.play();
      }
    },
  };

  return collectable;
}

//platform factory
function createPlatform(x, y, w) {
  var platform = {
    x_pos: x,
    y_pos: y,
    width: w,
    height: 15,
    draw: function () {
      stroke(255);
      strokeWeight(0.5);
      fill(100, 181, 246);
      rect(this.x_pos, this.y_pos, this.width, this.height, 5);
      noStroke();
    },
    check: function (gc_x, gc_y) {
      //check if the char is close to the platform on the X axis
      if (gc_x >= this.x_pos - 10 && gc_x <= this.x_pos + this.width) {
        //check if the char jumps on the platform
        var d = this.y_pos - gc_y;
        if (d >= 0 && d < 10) {
          return true;
        }
      }
      return false;
    },
  };

  return platform;
}

//laser factory
function createLaser(gc_x, gc_y) {
  var laser = {
    x_pos: gc_x,
    y_pos: gc_y,
    currentX: gc_x,
    updateCoordinates: function (gc_x, gc_y) {
      this.x_pos = gc_x;
      this.y_pos = gc_y;
      this.currentX = gc_x;
    },
    update: function () {
      //make the laser move to the right
      if (this.currentX < this.x_pos + 400) {
        this.currentX += 5;
      }
    },
    draw: function () {
      this.update();

      fill(255, 51, 0);
      rect(this.currentX, gc_y - 60, 25, 8, 5);
    },
    checkRange: function () {
      //if the laser is still in the specified range
      if (this.currentX == this.x_pos + 400) {
        return true;
      }
      return false;
    },
    checkEnemy: function (enemy) {
      //check the laser's position compared with the enemy's position
      var d = dist(this.currentX, this.y_pos, enemy.x, enemy.y);

      //check if the laser hit an enemy
      if (d < 70) {
        return true;
      }
      return false;
    },
  };

  return laser;
}

function drawBuildings() {
  //draw the buildings
  for (var i = 0; i < buildings.length; i++) {
    //starting with the grey building in the back of the buildings group
    fill(175);
    //the difference in height for the rectangles is always added to the y_pos so that it stays on the ground at different screen resolutions
    rect(
      buildings[i].x_pos + 80,
      buildings[i].y_pos + 25,
      buildings[i].width,
      buildings[i].height - 25,
      10,
      10,
      0,
      0
    );
    fill(230);
    //first building in the buildings group
    rect(
      buildings[i].x_pos - 50,
      buildings[i].y_pos,
      buildings[i].width,
      buildings[i].height,
      10,
      10,
      0,
      0
    );
    //second building in the buildings group
    rect(
      buildings[i].x_pos + 25,
      buildings[i].y_pos - 100,
      buildings[i].width,
      buildings[i].height + 100,
      10,
      10,
      0,
      0
    );
    //third bulding in the building group
    rect(
      buildings[i].x_pos + 150,
      buildings[i].y_pos - 32,
      buildings[i].width,
      buildings[i].height + 32,
      10,
      10,
      0,
      0
    );
    //the light that reflects from the buildings
    fill(250);
    rect(
      buildings[i].x_pos - 50,
      buildings[i].y_pos,
      buildings[i].width - 75,
      buildings[i].height,
      10,
      0
    );
    rect(
      buildings[i].x_pos + 25,
      buildings[i].y_pos - 100,
      buildings[i].width - 75,
      buildings[i].height + 100,
      10,
      0
    );
    rect(
      buildings[i].x_pos + 150,
      buildings[i].y_pos - 32,
      buildings[i].width - 75,
      buildings[i].height + 32,
      10,
      0
    );
  }
}

function drawTrees() {
  //draw the trees
  for (var i = 0; i < trees_x.length; i++) {
    stroke(93, 64, 55);
    strokeWeight(10);
    //tree trunk
    line(trees_x[i], floorPos_y, trees_x[i], floorPos_y - 90);
    //tree branches
    line(trees_x[i], floorPos_y - 90, trees_x[i] - 50, floorPos_y - 90);
    line(trees_x[i] - 50, floorPos_y - 90, trees_x[i] - 50, floorPos_y - 110);
    line(trees_x[i], floorPos_y - 90, trees_x[i] + 30, floorPos_y - 90);
    line(trees_x[i] + 30, floorPos_y - 90, trees_x[i] + 30, floorPos_y - 110);
    noStroke();
    fill(102, 187, 106);
    //tree leaves
    rect(trees_x[i] - 80, floorPos_y - 200, 160, 100, 10);
    fill(129, 199, 132);
    rect(trees_x[i], floorPos_y - 180, 50, 30, 10);
  }
}

function drawCanyon(t_canyon) {
  fill(144, 202, 249);
  //canyon
  //the rectangle's height is always calculated based on the ground's height (height - floorPos_y)
  rect(
    t_canyon.x_pos,
    floorPos_y,
    t_canyon.width,
    floorPos_y + height - floorPos_y
  );
  stroke(225);
  strokeWeight(5);
  //canyon margins
  //the line's length is calculated always based on the ground's height (height - floorPos_y)
  line(
    t_canyon.x_pos,
    floorPos_y,
    t_canyon.x_pos,
    floorPos_y + height - floorPos_y
  );
  line(
    t_canyon.x_pos + t_canyon.width,
    floorPos_y,
    t_canyon.x_pos + t_canyon.width,
    floorPos_y + height - floorPos_y
  );
  noStroke();
}

function checkCanyon(t_canyon) {
  //if the character is above the canyon, it falls
  if (
    gameChar_x > t_canyon.x_pos + 25 &&
    gameChar_x < t_canyon.x_pos + 70 &&
    gameChar_y >= floorPos_y
  ) {
    isPlummeting = true;
    //if character is falling into the canyon place the character in the center of the canyon
    gameChar_x = t_canyon.x_pos + t_canyon.width / 2;
  }
}

function drawGameCharacter() {
  //draw the game character
  if (isLeft && isFalling) {
    //jumping left
    fill(100, 181, 246);
    //head
    rect(gameChar_x - 11, gameChar_y - 100, 27, 25, 8);
    //body
    rect(gameChar_x - 11, gameChar_y - 70, 27, 32, 5);
    //hands
    stroke(100, 181, 246);
    strokeWeight(0.5);
    fill(224, 247, 250);
    ellipse(gameChar_x, gameChar_y - 60, 15, 15);
    //legs
    rect(gameChar_x - 5, gameChar_y - 38, 20, 7, 5);
    rect(gameChar_x - 1, gameChar_y - 30, 16, 7, 5);
    rect(gameChar_x + 4, gameChar_y - 23, 10, 7, 5);
    //eyes
    rect(gameChar_x - 12, gameChar_y - 90, 10, 7, 10);
  } else if (isRight && isFalling) {
    //jumping right
    fill(100, 181, 246);
    //head
    rect(gameChar_x - 11, gameChar_y - 100, 27, 25, 8);
    //body
    rect(gameChar_x - 11, gameChar_y - 70, 27, 32, 5);
    //hands
    stroke(100, 181, 246);
    strokeWeight(0.5);
    fill(224, 247, 250);
    ellipse(gameChar_x, gameChar_y - 60, 15, 15);
    //legs
    rect(gameChar_x - 10, gameChar_y - 38, 20, 7, 5);
    rect(gameChar_x - 10, gameChar_y - 30, 16, 7, 5);
    rect(gameChar_x - 10, gameChar_y - 23, 10, 7, 5);
    //eyes
    rect(gameChar_x + 8, gameChar_y - 90, 10, 7, 10);
  } else if (isLeft) {
    //walking left
    fill(100, 181, 246);
    //head
    rect(gameChar_x - 11, gameChar_y - 93, 27, 25, 8);
    //body
    rect(gameChar_x - 11, gameChar_y - 65, 27, 32, 5);
    //hands
    stroke(100, 181, 246);
    strokeWeight(0.5);
    fill(224, 247, 250);
    ellipse(gameChar_x, gameChar_y - 38, 15, 15);
    //legs
    rect(gameChar_x - 8, gameChar_y - 29, 24, 7, 5);
    rect(gameChar_x - 4, gameChar_y - 18, 20, 7, 5);
    rect(gameChar_x + 2, gameChar_y - 7, 14, 7, 5);
    //eyes
    rect(gameChar_x - 12, gameChar_y - 83, 10, 7, 10);
  } else if (isRight) {
    //walking right
    fill(100, 181, 246);
    //head
    rect(gameChar_x - 11, gameChar_y - 93, 27, 25, 8);
    //body
    rect(gameChar_x - 11, gameChar_y - 65, 27, 32, 5);
    //hands
    stroke(100, 181, 246);
    strokeWeight(0.5);
    fill(224, 247, 250);
    ellipse(gameChar_x, gameChar_y - 38, 15, 15);
    //legs
    rect(gameChar_x - 10, gameChar_y - 29, 24, 7, 5);
    rect(gameChar_x - 10, gameChar_y - 18, 20, 7, 5);
    rect(gameChar_x - 10, gameChar_y - 7, 14, 7, 5);
    //eyes
    rect(gameChar_x + 8, gameChar_y - 83, 10, 7, 10);
  } else if (isFalling || isPlummeting) {
    //jumping front facing
    fill(100, 181, 246);
    //head
    rect(gameChar_x - 15, gameChar_y - 93, 35, 25, 8);
    //body
    rect(gameChar_x - 14, gameChar_y - 70, 32, 32, 5);
    //hands
    stroke(100, 181, 246);
    strokeWeight(0.5);
    fill(224, 247, 250);
    ellipse(gameChar_x - 20, gameChar_y - 47, 15, 15);
    ellipse(gameChar_x + 24, gameChar_y - 47, 15, 15);
    //legs
    rect(gameChar_x - 13, gameChar_y - 38, 31, 7, 5);
    rect(gameChar_x - 10, gameChar_y - 30, 25, 7, 5);
    rect(gameChar_x - 5, gameChar_y - 23, 15, 7, 5);
    //face
    fill(224, 247, 250);
    rect(gameChar_x - 13, gameChar_y - 93, 31, 25, 8);
    //eyes
    fill(255);
    rect(gameChar_x - 12, gameChar_y - 83, 29, 8, 10);
  } else {
    //standing front facing
    fill(100, 181, 246);
    //head
    rect(gameChar_x - 15, gameChar_y - 93, 35, 25, 8);
    //body
    rect(gameChar_x - 14, gameChar_y - 65, 32, 32, 5);
    //hands
    stroke(100, 181, 246);
    strokeWeight(0.5);
    fill(224, 247, 250);
    ellipse(gameChar_x - 16, gameChar_y - 47, 15, 15);
    ellipse(gameChar_x + 20, gameChar_y - 47, 15, 15);
    //legs
    rect(gameChar_x - 13, gameChar_y - 29, 31, 7, 5);
    rect(gameChar_x - 10, gameChar_y - 18, 25, 7, 5);
    rect(gameChar_x - 5, gameChar_y - 7, 15, 7, 5);
    //face
    fill(224, 247, 250);
    rect(gameChar_x - 13, gameChar_y - 93, 31, 25, 8);
    //eyes
    fill(255);
    rect(gameChar_x - 12, gameChar_y - 83, 29, 8, 10);
  }
}

function drawPortal() {
  push();

  stroke(225, 245, 254, 150);
  strokeWeight(6);
  fill(3, 169, 244);

  //if the char reached the portal, open the portal
  if (portal.isReached) {
    ellipse(portal.x_pos, floorPos_y - 80, 90, 160);
  }
  //the portal is smaller when not reached
  else {
    ellipse(portal.x_pos, floorPos_y - 80, 80, 90);
  }

  noStroke();
  pop();
}

function checkPortal() {
  //make sure distance is a positive integer
  var distance = abs(dist(gameChar_x, gameChar_y, portal.x_pos, floorPos_y));

  if (distance < 50) {
    portal.isReached = true;
    portalSound.play();
  }
}

function checkLives() {
  //if character falls in a canyon decrease lives
  if (gameChar_y > height) {
    fallingSound.play();

    //if there are still lives left, start the game again
    if (lives > 0) {
      lives -= 1;
      startGame();
    }
  }
}

//enemy constructor
function Enemy(x, y, range) {
  this.x = x;
  this.y = y;
  //the range is used to create a floating effect on the enemy
  this.range = range;
  //if the enemy is activated until shot
  this.deactivated = false;

  this.currentY = y;
  this.inc = 0.1;

  this.upperEllipseX = this.x - 20;
  this.lowerEllipseX = this.x + 20;

  //increase the value of the enemy's current Y position by 0.1 within the specified range
  this.update = function () {
    this.currentY += this.inc;

    //makes the enemy float upwards
    if (this.currentY > this.y + this.range) {
      this.inc = -0.1;
    }
    //makes the enemy float downwards
    else if (this.currentY < this.y) {
      this.inc = 0.1;
    }
  };

  this.draw = function (gc_x) {
    this.update();

    //check if the char is under an enemy
    var isUnder = gc_x <= this.x + 20 && gc_x >= this.x - 20;

    //check if the char is under the enemy and moving to the right
    if (isUnder && isRight) {
      //the small circles around the enemy move
      this.upperEllipseX += 10;
      this.upperEllipseX = constrain(
        this.upperEllipseX,
        this.x - 20,
        this.x + 20
      );

      this.lowerEllipseX -= 10;
      this.lowerEllipseX = constrain(
        this.lowerEllipseX,
        this.x - 20,
        this.x + 20
      );
    }
    //check if hte char is under the enemy and moving to the left
    else if (isUnder && isLeft) {
      //the small circles around the enemy move in the opposite direction
      this.upperEllipseX -= 10;
      this.upperEllipseX = constrain(
        this.upperEllipseX,
        this.x - 20,
        this.x + 20
      );

      this.lowerEllipseX += 10;
      this.lowerEllipseX = constrain(
        this.lowerEllipseX,
        this.x - 20,
        this.x + 20
      );
    }

    //change the color on deactivation
    if (this.deactivated) {
      fill(25);
      stroke(255, 51, 0);
    } else {
      fill(21, 76, 121);
      stroke(225, 255, 255);
    }

    strokeWeight(3);
    //the small circle above the big circle
    ellipse(this.upperEllipseX, this.currentY - 40, 15, 15);
    if (this.y < floorPos_y - 60) {
      //the small circle below the big circle
      ellipse(this.lowerEllipseX, this.currentY + 40, 15, 15);
    }
    //the big circle
    ellipse(this.x, this.currentY, 40, 40);
    //a point in the middle of the cirle
    point(this.x, this.currentY);
    noStroke();
  };

  //check if the char bumps into an enemy
  this.check = function (gc_x, gc_y) {
    var d = dist(gc_x, gc_y, this.x, this.y);

    //check if the enemy is not deactivated and the distance is small enough
    if (d < 65 && this.deactivated == false) {
      return true;
    }
    //if the enemy is deactivated return false
    return false;
  };
}
