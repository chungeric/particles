import { Cell } from "./Cell";
import { Particle } from "./Particle";

export class ParticleSystem {
  constructor() {
    this.speckCount = 5000;
    this.resolution = 30;
    this.penSize = 100;
    this.maxParticleWidth = 2;
    this.mouse = {
      x: null,
      y: null,
      px: 0,
      py: 0,
      down: false,
    };
    this.cells = [];
    this.particles = [];
  }
  reset() {
    this.cells = [];
    this.particles = [];
    this.mouse.x = null;
    this.mouse.y = null;
  }
  init(canvasElement) {
    this.canvas = canvasElement;
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext("2d");
    this.numCols = Math.ceil(this.width / this.resolution);
    this.numRows = Math.ceil(this.height / this.resolution);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    /**
     * Initialize Particles
     */
    for (let i = 0; i < this.speckCount; i++) {
      this.particles.push(
        new Particle(Math.random() * this.width, Math.random() * this.height)
      );
    }
    /**
     * Initialize Cells
     */
    for (let col = 0; col < this.numCols; col++) {
      this.cells[col] = [];
      for (let row = 0; row < this.numRows; row++) {
        let cellData = new Cell(
          col * this.resolution,
          row * this.resolution,
          this.resolution
        );
        this.cells[col][row] = cellData;
        this.cells[col][row].col = col;
        this.cells[col][row].row = row;
      }
    }
    /*
      These loops move through the rows and columns of the grid array again and set variables 
      in each cell object that will hold the directional references to neighboring cells. 
      For example, let's say the loop is currently on this cell:

      OOOOO
      OOOXO
      OOOOO
      
      These variables will hold the references to neighboring cells so you only need to
      use "up" to refer to the cell above the one you're currently on.
    */
    for (let col = 0; col < this.numCols; col++) {
      for (let row = 0; row < this.numRows; row++) {
        /*
          This variable holds the reference to the current cell in the grid. When you
          refer to an element in an array, it doesn't copy that value into the new
          variable; the variable stores a "link" or reference to that spot in the array.
          If the value in the array is changed, the value of this variable would change
          also, and vice-versa.
          */
        let cell_data = this.cells[col][row];

        /*
          Each of these lines has a ternary expression. A ternary expression is similar 
          to an if/then clause and is represented as an expression (e.g. row - 1 >= 0) 
          which is evaluated to either true or false. If it's true, the first value after
          the question mark is used, and if it's false, the second value is used instead.

          If you're on the first row and you move to the row above, this wraps the row 
          around to the last row. This is done so that momentum that is pushed to the edge 
          of the canvas is "wrapped" to the opposite side.
          */
        let row_up = row - 1 >= 0 ? row - 1 : this.numRows - 1;
        let col_left = col - 1 >= 0 ? col - 1 : this.numCols - 1;
        let col_right = col + 1 < this.numCols ? col + 1 : 0;

        //Get the reference to the cell on the row above.
        let up = this.cells[col][row_up];
        let left = this.cells[col_left][row];
        let up_left = this.cells[col_left][row_up];
        let up_right = this.cells[col_right][row_up];

        /*
          Set the current cell's "up", "left", "up_left" and "up_right" attributes to the 
          respective neighboring cells.
          */
        cell_data.up = up;
        cell_data.left = left;
        cell_data.up_left = up_left;
        cell_data.up_right = up_right;

        /*
          Set the neighboring cell's opposite attributes to point to the current cell.
          */
        up.down = this.cells[col][row];
        left.right = this.cells[col][row];
        up_left.down_right = this.cells[col][row];
        up_right.down_left = this.cells[col][row];
      }
    }
  }
  update_particle() {
    //Loops through all of the particles in the array
    for (let i = 0; i < this.particles.length; i++) {
      //Sets this variable to the current particle so we can refer to the particle easier.
      let p = this.particles[i];

      //If the particle's X and Y coordinates are within the bounds of the canvas...
      if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
        /*
            These lines divide the X and Y values by the size of each cell. This number is
            then parsed to a whole number to determine which grid cell the particle is above.
            */
        let col = parseInt(p.x / this.resolution);
        let row = parseInt(p.y / this.resolution);

        //Same as above, store reference to cell
        let cell_data = this.cells[col][row];

        /*
            These values are percentages. They represent the percentage of the distance across
            the cell (for each axis) that the particle is positioned. To give an example, if 
            the particle is directly in the center of the cell, these values would both be "0.5"

            The modulus operator (%) is used to get the remainder from dividing the particle's 
            coordinates by the resolution value. This number can only be smaller than the 
            resolution, so we divide it by the resolution to get the percentage.
            */
        let ax = (p.x % this.resolution) / this.resolution;
        let ay = (p.y % this.resolution) / this.resolution;

        /*
            These lines subtract the decimal from 1 to reverse it (e.g. 100% - 75% = 25%), multiply 
            that value by the cell's velocity, and then by 0.05 to greatly reduce the overall change in velocity 
            per frame (this slows down the movement). Then they add that value to the particle's velocity
            in each axis. This is done so that the change in velocity is incrementally made as the
            particle reaches the end of it's path across the cell.
            */
        p.xv += (1 - ax) * cell_data.xv * 0.05;
        p.yv += (1 - ay) * cell_data.yv * 0.05;

        /*
            These next four lines are are pretty much the same, except the neighboring cell's 
            velocities are being used to affect the particle's movement. If you were to comment
            them out, the particles would begin grouping at the boundary between cells because
            the neighboring cells wouldn't be able to pull the particle into their boundaries.
            */
        p.xv += ax * cell_data.right.xv * 0.05;
        p.yv += ax * cell_data.right.yv * 0.05;

        p.xv += ay * cell_data.down.xv * 0.05;
        p.yv += ay * cell_data.down.yv * 0.05;

        //This adds the calculated velocity to the position coordinates of the particle.
        p.x += p.xv;
        p.y += p.yv;

        //For each axis, this gets the distance between the old position of the particle and it's new position.
        let dx = p.px - p.x;
        let dy = p.py - p.y;

        //Using the Pythagorean theorum (A^2 + B^2 = C^2), this determines the distance the particle travelled.
        let dist = Math.sqrt(dx * dx + dy * dy);

        //This line generates a random value between 0 and 0.5
        let limit = Math.random() * 0.5;

        this.ctx.strokeStyle = p.color;

        //If the distance the particle has travelled this frame is greater than the random value...
        if (dist > limit) {
          //Clamp lineWidth between 1 and maxParticleWidth
          this.ctx.lineWidth = Math.max(this.maxParticleWidth * Math.min(Math.abs(p.xv * p.yv), 1), 1);
          this.ctx.beginPath(); //Begin a new path on the canvas
          this.ctx.moveTo(p.x, p.y); //Move the drawing cursor to the starting point
          this.ctx.lineTo(p.px, p.py); //Describe a line from the particle's old coordinates to the new ones
          this.ctx.stroke(); //Draw the path to the canvas
        } else {
          //If the particle hasn't moved further than the random limit...
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);

          /*
                Describe a line from the particle's current coordinates to those same coordinates 
                plus the random value. This is what creates the shimmering effect while the particles
                aren't moving.
                */
          this.ctx.lineTo(p.x + limit, p.y + limit);

          this.ctx.stroke();
        }

        //This updates the previous X and Y coordinates of the particle to the new ones for the next loop.
        p.px = p.x;
        p.py = p.y;
      } else {
        //If the particle's X and Y coordinates are outside the bounds of the canvas...

        //Place the particle at a random location on the canvas
        p.x = p.px = Math.random() * this.width;
        p.y = p.py = Math.random() * this.height;

        //Set the particles velocity to zero.
        p.xv = 0;
        p.yv = 0;
      }

      //These lines divide the particle's velocity in half everytime it loops, slowing them over time.
      p.xv *= 0.5;
      p.yv *= 0.5;
    }
  }
  change_cell_velocity(cell_data, mvelX, mvelY, pen_size) {
    //This gets the distance between the cell and the mouse cursor.
    let dx = cell_data.x - this.mouse.x;
    let dy = cell_data.y - this.mouse.y;
    let dist = Math.sqrt(dy * dy + dx * dx);

    //If the distance is less than the radius...
    if (dist < pen_size) {
      //If the distance is very small, set it to the pen_size.
      if (dist < 4) {
        dist = pen_size;
      }

      //Calculate the magnitude of the mouse's effect (closer is stronger)
      let power = pen_size / dist;

      /*
        Apply the velocity to the cell by multiplying the power by the mouse velocity and adding it to the cell velocity
        */
      cell_data.xv += mvelX * power;
      cell_data.yv += mvelY * power;
    }
  }
  update_pressure(cell_data) {
    //This calculates the collective pressure on the X axis by summing the surrounding velocities
    let pressure_x =
      cell_data.up_left.xv * 0.5 + //Divided in half because it's diagonal
      cell_data.left.xv +
      cell_data.down_left.xv * 0.5 - //Same
      cell_data.up_right.xv * 0.5 - //Same
      cell_data.right.xv -
      cell_data.down_right.xv * 0.5; //Same

    //This does the same for the Y axis.
    let pressure_y =
      cell_data.up_left.yv * 0.5 +
      cell_data.up.yv +
      cell_data.up_right.yv * 0.5 -
      cell_data.down_left.yv * 0.5 -
      cell_data.down.yv -
      cell_data.down_right.yv * 0.5;

    //This sets the cell pressure to one-fourth the sum of both axis pressure.
    cell_data.pressure = (pressure_x + pressure_y) * 0.25;
  }
  update_velocity(cell_data) {
    /*
    This adds one-fourth of the collective pressure from surrounding cells to the 
    cell's X axis velocity.
    */
    cell_data.xv +=
      (cell_data.up_left.pressure * 0.5 +
        cell_data.left.pressure +
        cell_data.down_left.pressure * 0.5 -
        cell_data.up_right.pressure * 0.5 -
        cell_data.right.pressure -
        cell_data.down_right.pressure * 0.5) *
      0.25;

    //This does the same for the Y axis.
    cell_data.yv +=
      (cell_data.up_left.pressure * 0.5 +
        cell_data.up.pressure +
        cell_data.up_right.pressure * 0.5 -
        cell_data.down_left.pressure * 0.5 -
        cell_data.down.pressure -
        cell_data.down_right.pressure * 0.5) *
      0.25;

    /*
    This slowly decreases the cell's velocity over time so that the fluid stops
    if it's left alone.
    */
    cell_data.xv *= 0.99;
    cell_data.yv *= 0.99;
  }
  draw() {
    /*
    This calculates the velocity of the mouse by getting the distance between the last coordinates and 
    the new ones. The coordinates will be further apart depending on how fast the mouse is moving.
    */
    let mouse_xv = this.mouse.px ? (this.mouse.x - this.mouse.px) : 0; // Fix for auto mouse
    let mouse_yv = this.mouse.py ? (this.mouse.y - this.mouse.py) : 0; // Fix for auto mouse

    //Loops through all of the columns
    for (let i = 0; i < this.cells.length; i++) {
      let cell_datas = this.cells[i];

      //Loops through all of the rows
      for (let j = 0; j < cell_datas.length; j++) {
        //References the current cell
        let cell_data = cell_datas[j];

        //If the mouse button is down, updates the cell velocity using the mouse velocity
        // if (this.mouse.down) {
          this.change_cell_velocity(
            cell_data,
            mouse_xv,
            mouse_yv,
            this.penSize
          );
        // }

        //This updates the pressure values for the cell.
        this.update_pressure(cell_data);
      }
    }

    /*
    This line clears the canvas. It needs to be cleared every time a new frame is drawn
    so the particles move. Otherwise, the particles would just look like long curvy lines.
    */
    this.ctx.clearRect(0, 0, this.width, this.height);

    //This sets the color to draw with.
    // this.ctx.strokeStyle = this.particleColor;

    //This calls the function to update the particle positions.
    this.update_particle();

    /*
    This calls the function to update the cell velocity for every cell by looping through
    all of the rows and columns.
    */
    for (let i = 0; i < this.cells.length; i++) {
      let cell_datas = this.cells[i];

      for (let j = 0; j < cell_datas.length; j++) {
        let cell_data = cell_datas[j];

        this.update_velocity(cell_data);
      }
    }

    //This replaces the previous mouse coordinates values with the current ones for the next frame.
    this.mouse.px = this.mouse.x;
    this.mouse.py = this.mouse.y;

    //This requests the next animation frame which runs the draw() function again.
    // requestAnimationFrame(this.draw);
  }
}
