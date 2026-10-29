import { LightningElement, api } from "lwc";

export default class EcHtfFaqPage extends LightningElement {
  /** Experience Cloud page API names — configure in Experience Builder */
  @api homePageName = "Home";
  @api aboutPageName = "about";
  @api faqPageName = "faq";
  @api contactPageName = "contact";
  @api catalogPageName = "catalog";
  @api applyPageName = "apply";
}