class Keyboard {
  constructor() {
    this.pressed = {};
  }

  watch(el) {
    el.addEventListener("keydown", (e) => {
      this.pressed[e.key] = true;
      console.log(e.key);
    });

    el.addEventListener("keyup", (e) => {
      this.pressed[e.key] = false;
    });
  }
}

export default Keyboard;
