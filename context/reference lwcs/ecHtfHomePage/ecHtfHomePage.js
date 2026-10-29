import { LightningElement, api } from "lwc";

export default class EcHtfHomePage extends LightningElement {
  @api homePageName = "Home";
  @api aboutPageName = "about";
  @api faqPageName = "faq";
  @api contactPageName = "contact";
  @api catalogPageName = "catalog";
  @api applyPageName = "apply";
}