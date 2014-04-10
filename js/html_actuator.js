function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.currentBase      = Math.floor(Math.random() * (36 - 2 + 1)) + 2;

  this.getCurrentBase = function() { return this.currentBase };
  this.setCurrentBase = function( value ) { this.currentBase = value };


  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.resizeTextToFitContainer();

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = self.changeNumberToCurrentBase( tile.value );

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + this.changeNumberToCurrentBase( difference );

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = this.changeNumberToCurrentBase( bestScore );
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};





/****** added methods ******/

// resize text to fit
// * this uses a hidden div to iterate throught font-sizes until we get an acceptable width
HTMLActuator.prototype.resizeTextToFitContainer = function () {

  var desired_width = 100;

  $( '.game-container .tile-container .tile .tile-inner' ).each(function(){

    var text = $(this).text();
    if ( text.length > 0 ) {
      var size,
        resizer = $( "#hidden-resizer" );
        resizer
          .css({
            'width': 'auto',
            'height': 'auto',
            'padding': '0px',
            'margin': '0px',
            'display': 'inline',
            'font-family': $(this).css('font-family'),
            'font-weight': $(this).css('font-weight'),
            'line-height': $(this).css('line-height'),
            'font-style': $(this).css('font-style'),
            'font-size': $(this).css('font-size')
          })
          .text( text );

      while ( resizer.width() > desired_width ) {
        size = parseInt( resizer.css( "font-size" ), 10 );
        if ( size < 1 ) {
          resizer.css( "font-size", 1 );
          break;
        }
        resizer.css( "font-size", (size - 1) );
      }

      $(this).css( "font-size", size ).text( resizer.html() );
    }
  });

}

// change a base-10 number to the current base
HTMLActuator.prototype.changeNumberToCurrentBase = function ( num ) {
  return parseInt(num).toString( this.getCurrentBase() );
}
