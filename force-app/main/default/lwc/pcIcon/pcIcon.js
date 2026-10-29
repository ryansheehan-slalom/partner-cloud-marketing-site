import { LightningElement, api } from "lwc";
import { getIcon } from "c/pcIconLibrary";

export default class PcIcon extends LightningElement {
  @api name;
  @api size = 24;
  @api strokeWidth = 1.8;

  get icon() {
    return getIcon(this.name);
  }

  get paths() {
    return this.icon ? this.icon.paths : [];
  }

  get fillValue() {
    return this.icon && this.icon.fill ? "currentColor" : "none";
  }

  get strokeValue() {
    return this.icon && this.icon.fill ? "none" : "currentColor";
  }
}
