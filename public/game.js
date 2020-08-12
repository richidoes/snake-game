"use strict";
(function () {

  // Rng function (random number generator)
  class Random {
    static get(inicio, final) {
      return Math.floor(Math.random() * final + inicio);
    }
  }
  // Use of the function Random to generate the food randomly
  class Food {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 10;
    }
    draw() {
      pintar.fillRect(this.x, this.y, this.width, this.height);//determines where the square appears and how many pixels they will measure.
    }
    static generate() {
      return new Food(Random.get(0, 500), Random.get(0, 300));
    }
  }
  //Generate the squares that are requested
  class Square {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 10;
      this.back = null; //This is the back square
    }
    draw() {
      pintar.fillRect(this.x, this.y, this.width, this.height); 
      if (this.hasBack()) {
        this.back.draw();
      }
    }
    add() {
      if (this.hasBack()) return this.back.add(); //Makes the square the snake eats go to the back and follow the others
      this.back = new Square(this.x, this.y);
    }
    hasBack() {
      return this.back !== null;
    }
    copy() {
      //Method that makes the squares follow one after the other.
      if (this.hasBack()) {
        this.back.copy();
        this.back.x = this.x;
        this.back.y = this.y;
      }
    }
    //Modify the path with the arrow keys and everyone follows that path
    right() {
      this.copy();
      this.x += 10;
    }
    left() {
      this.copy();
      this.x -= 10;
    }
    down() {
      this.copy();
      this.y += 10;
    }
    up() {
      this.copy();
      this.y -= 10;
    }
    //check if head or second square collide
    hit(head, segundo = false) {
      if (this === head && !this.hasBack()) {
        return false;
      }
      if (this === head) {
        return this.back.hit(head, true);
      }
      if (segundo && !this.hasBack()) {
        return false;
      }
      if (segundo) {
        return this.back.hit(head);
      }
      //It is not the head, nor the second
      if (this.hasBack()) {
        return squareHit(this, head) || this.back.hit(head);
      }
      //It is not the head, nor the second, I am the last
      return squareHit(this, head);
    }
    // Determines the limits for die
    hitBorder() {
      return this.x > 490 || this.x < 0 || this.y > 290 || this.y < 0;
    }
  }
  // It provides data to square, also here the general trajectory to behave as a snake is defined.
  class Snake {
    constructor() {
      this.head = new Square(100, 20);
      this.draw();
      this.direction = "right";
      this.head.add(); //the times this is repeated, it is the initial size of the snake, each representing a square of the body.
      this.head.add();
      this.head.add();
      this.head.add();
    }
    draw() {
      this.head.draw();
    }

    // These conditions are used so that it is not possible to die when pressing the opposite key when playing.
    right() {
      if (this.direction === "left") return;
      this.direction = "right";
    }
    left() {
      if (this.direction === "right") return;
      this.direction = "left";
    }
    up() {
      if (this.direction === "down") return;
      this.direction = "up";
    }
    down() {
      if (this.direction === "up") return;
      this.direction = "down";
    }
    //sets the direction and call the method with the conditions and instructions.
    move() {
      if (this.direction === "up") return this.head.up();
      if (this.direction === "down") return this.head.down();
      if (this.direction === "right") return this.head.right();
      if (this.direction === "left") return this.head.left();
    }
    //function to add what the snake eats.
    eat() {
      puntos++;//Counter of points obtained, increases each that the snake eats a square.
      this.head.add();
    }
    //call the respective function when collides
    dead() {
      return this.head.hit(this.head) || this.head.hitBorder();
    }
  }
  // Properties to be able to use canvas and paint the game on it
  const lienzo = document.getElementById("canvas");
  const pintar = lienzo.getContext("2d");
  var puntos = 0;
  let foods = [];
  const snake = new Snake();

  // Event creation to use directional keys as direction modifiers for snake
  window.addEventListener("keydown", function (event) {
    if (event.keyCode > 36 && event.keyCode < 41) event.preventDefault();

    if (event.keyCode === 40) return snake.down();
    if (event.keyCode === 39) return snake.right();
    if (event.keyCode === 38) return snake.up();
    if (event.keyCode === 37) return snake.left();

    return false;
  });

  //We simulate the movement of the snake, drawing and cleaning it at the same time.
  const animacion = setInterval(function () {
    snake.move();
    pintar.clearRect(0, 0, lienzo.width, lienzo.height);
    snake.draw();
    drawFood();

    if (snake.dead()) { //We stop the animation/game when we die.
      alert("Se acabo el juego jajaja  :P"+ "  -->  "  + "Obtuviste: " + puntos + " puntos" + "\n \nPara volver a jugar presiona presiona F5 o refresca la pagina.");
      window.clearInterval(animacion);
    }
  }, 1000 / 5);// Here we set the speed at which snake moves.

  // Here run and set the time the food appears.
  setInterval(function () {
    const food = Food.generate();
    foods.push(food);

    //Eliminate food in a determined time.
    setTimeout(function () {

      removeFromFoods(food);
    }, 15000);// Here set the time in which remove the food. 

  }, 2000);//Here set the time in which appears the food.

  //draw the food
  function drawFood() {
    for (const index in foods) {
      const food = foods[index];
      if (typeof food !== "undefined") {
        food.draw();

        // simulates that the snake eat.
        if (hit(food, snake.head)) {
          snake.eat();
          removeFromFoods(food);
        }
      }
    }
  }
  //remove the food.
  function removeFromFoods(food) {
    foods = foods.filter(function (f) {
      return food !== f;
    });
  }
  // When the snake collides with its own body.
  function squareHit(cuadrado_uno, cuadrado_dos) {
    return cuadrado_uno.x == cuadrado_dos.x && cuadrado_uno.y == cuadrado_dos.y;
  }
  // collision algorithm
  function hit(a, b) {
    var hit = false;
    if (b.x + b.width >= a.x && b.x < a.x + a.width) {
      if (b.y + b.height >= a.y && b.y < a.y + a.height) {
        hit = true;
      }
    }
    if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
      if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
        hit = true;
      }
    }
    if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
      if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
        hit = true;
      }
    }
    return hit;
  }
})();
