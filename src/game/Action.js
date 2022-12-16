'use strict';

class Action {
  static NONE = new Action(-1);
  static SHIELD = new Action(16);

  #actionId;

  #launchScreenX;
  #launchScreenY;
  #targetScreenX;
  #targetScreenY;

  constructor (actionId, launchScreenX, launchScreenY, targetScreenX, targetScreenY) {
    if (typeof actionId !== 'number') {
      throw new Error(`Invalid action id ${actionId}`);
    }

    this.#actionId = actionId;

    this.#launchScreenX = launchScreenX ?? null;
    this.#launchScreenY = launchScreenY ?? null;
    this.#targetScreenX = targetScreenX ?? null;
    this.#targetScreenY = targetScreenY ?? null;
  }

  getActionString () {
    let actionString = this.#actionId.toString();

    const addParam = param => {
      if (param !== null) actionString += `\t${param}`;
    };

    addParam(this.#launchScreenX);
    addParam(this.#launchScreenY);
    addParam(this.#targetScreenX);
    addParam(this.#targetScreenY);

    return actionString;
  }

  valueOf () {
    return this.#actionId;
  }
}

module.exports = Action;
