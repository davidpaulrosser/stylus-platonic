var Camera,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Camera = (function() {

  /*
  @private
   */
  Camera.prototype._$objects = Array;

  Camera.prototype._mouse = {
    x: 0,
    y: 0,
    lx: 0,
    ly: 0
  };

  Camera.prototype._dragging = false;


  /*
  @public
   */

  Camera.prototype.config = {
    perspective: 0,
    rotation_x: -30,
    rotation_y: -45,
    max_rotation_x: 360,
    max_rotation_y: 360,
    min_scale: 1,
    max_scale: 10
  };

  Camera.prototype.el = null;

  Camera.prototype.width = 0;

  Camera.prototype.height = 0;

  Camera.prototype.perspective = 0;

  Camera.prototype.rotation_x = 0;

  Camera.prototype.rotation_y = 0;

  Camera.prototype.rotation_lock_x = 0;

  Camera.prototype.rotation_lock_y = 0;

  Camera.prototype.gimball_radius = 100;

  Camera.prototype.scale = 1;

  Camera.prototype.pivot_x = 0;

  Camera.prototype.pivot_y = 0;

  Camera.prototype.pivot_z = 0;


  /*
  constructor
  @param {$element} el
   */

  function Camera(el, gui) {
    var cam_settings, range;
    this.el = el;
    this._on_mouse_wheel = bind(this._on_mouse_wheel, this);
    this._update_viewport = bind(this._update_viewport, this);
    this.reset = bind(this.reset, this);
    this.config.perspective = parseFloat(this.el.css('perspective'));
    this.perspective = this.config.perspective;
    this._$objects = $('[data-camera-transform="1"]');
    this.el.mousemove((function(_this) {
      return function(event) {
        return _this._on_mouse_move(event);
      };
    })(this));
    this.el.mouseup((function(_this) {
      return function(event) {
        return _this._on_mouse_up(event);
      };
    })(this));
    this.el.mousedown((function(_this) {
      return function(event) {
        return _this._on_mouse_down(event);
      };
    })(this));
    this.el.on('mousewheel', this._on_mouse_wheel);
    this.el.on('MozMousePixelScroll', this._on_mouse_wheel);
    cam_settings = gui.addFolder('Camera');
    cam_settings.add(this, 'perspective', 0, 2000);
    cam_settings.open();
    cam_settings.add(this, 'scale', 1, 10).name('zoom').listen().onChange((function(_this) {
      return function() {
        return _this._update_viewport(_this.config.rotation_x, _this.config.rotation_y);
      };
    })(this));
    range = 1000;
    cam_settings.add(this, 'pivot_x', -range, range).onChange((function(_this) {
      return function() {
        return _this._update_viewport(_this.config.rotation_x, _this.config.rotation_y);
      };
    })(this));
    cam_settings.add(this, 'pivot_y', -range, range).onChange((function(_this) {
      return function() {
        return _this._update_viewport(_this.config.rotation_x, _this.config.rotation_y);
      };
    })(this));
    cam_settings.add(this, 'pivot_z', -range, range).onChange((function(_this) {
      return function() {
        return _this._update_viewport(_this.config.rotation_x, _this.config.rotation_y);
      };
    })(this));
    cam_settings.add(this, 'rotation_x').listen();
    cam_settings.add(this, 'rotation_y').listen();
    cam_settings.add(this, 'reset');
    this._update_viewport(this.config.rotation_x, this.config.rotation_y);
  }


  /*
  Update the camera
   */

  Camera.prototype.update = function() {
    var dist_x, dist_y, pct_x, pct_y, rx, ry;
    this.el.css({
      'perspective': this.perspective + 'px'
    });
    if (this._dragging) {
      dist_x = this._mouse.x - this._mouse.lx;
      dist_y = this._mouse.ly - this._mouse.y;
      pct_x = dist_x / this.gimball_radius;
      pct_y = dist_y / this.gimball_radius;
      pct_x *= 0.1;
      pct_y *= 0.1;
      rx = this._rotation_lock_x + (this.config.max_rotation_x * pct_y);
      ry = this._rotation_lock_y + (this.config.max_rotation_y * pct_x);
      if (ry > 360) {
        ry -= 360;
      } else if (ry < -360) {
        ry += 360;
      }
      if (rx > 360) {
        rx -= 360;
      } else if (rx < -360) {
        rx += 360;
      }
      return this._update_viewport(rx, ry);
    }
  };


  /*
  Resize the viewport
   */

  Camera.prototype.resize = function() {
    this.width = this.el.width();
    return this.height = this.el.height();
  };


  /*
  Reset the viewport rotation
   */

  Camera.prototype.reset = function() {
    return this._update_viewport(this.config.rotation_x, this.config.rotation_y);
  };


  /*
  Update the viewport
  @param {Number} rotation_x
  @param {Number} rotation_y
   */

  Camera.prototype._update_viewport = function(rotation_x, rotation_y) {
    var i, len, object, ref, transform;
    this.rotation_x = rotation_x;
    this.rotation_y = rotation_y;
    ref = this._$objects;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      transform = ["rotateX(" + this.rotation_x + "deg) rotateY(" + this.rotation_y + "deg)", "scale3d(" + this.scale + "," + this.scale + "," + this.scale + ")", "translateX(" + this.pivot_x + "px) translateY(" + this.pivot_y + "px) translateZ(" + this.pivot_z + "px)"].join(' ');
      $(object).css({
        '-webkit-transform': transform,
        '-moz-transform': transform,
        '-ms-transform': transform,
        'transform': transform
      });
    }
    return false;
  };


  /*
  Viewport mouse move handler
  @param {Object} event
   */

  Camera.prototype._on_mouse_move = function(event) {
    this._mouse.x = event.pageX;
    return this._mouse.y = event.pageY;
  };


  /*
  Viewport mouse down handler
  @param {Object} event
   */

  Camera.prototype._on_mouse_down = function(event) {
    this._dragging = true;
    this._mouse.lx = event.pageX;
    this._mouse.ly = event.pageY;
    this._rotation_lock_x = this.rotation_x;
    this._rotation_lock_y = this.rotation_y;
    this.el.css('cursor', '-webkit-grabbing');
    return event.preventDefault();
  };

  Camera.prototype._on_mouse_wheel = function(event) {
    this.scale += event.originalEvent.wheelDelta * 0.001;
    this.scale = Math.max(this.scale, this.config.min_scale);
    this.scale = Math.min(this.scale, this.config.max_scale);
    return this._update_viewport(this.rotation_x, this.rotation_y);
  };


  /*
  Viewport mouse up handler
  @param {Object} event
   */

  Camera.prototype._on_mouse_up = function(event) {
    this._dragging = false;
    return this.el.css('cursor', 'inherit');
  };

  return Camera;

})();
