import { LightningElement, wire, api, track } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import createLead from "@salesforce/apex/ECHTF_ContactLeadController.createLead";
import BASE_PATH from "@salesforce/community/basePath";
import {
  detectBrandId,
  applyBrandTokens,
  getIconSvg,
  BRAND_ORDER
} from "c/ecHtfBrandData";
import {
  getSection,
  getBrandTheme,
  getBrandIdentity,
  isPreviewMode
} from "c/ecHtfContentService";

export default class EcHtfContactSection extends NavigationMixin(
  LightningElement
) {
  @api homePageName = "Home";
  @api applyPageName = "apply";

  // Seed every field with '' so inputs show their placeholders — binding
  // `undefined` to a DOM input.value renders the literal string "undefined".
  @track formData = {
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    topic: "",
    message: ""
  };
  @track formErrors = {};
  @track formSubmitted = false;
  @track submitting = false;
  @track submitError = "";
  @track _identity = {};

  _brandId = "htf";
  _content = {};
  _iconsReady = false;

  // ─── Lifecycle ─────────────────────────────────────────────────────────

  connectedCallback() {
    this._brandId = detectBrandId();
    this._load();
  }
  @wire(CurrentPageReference)
  wiredPageRef(pageRef) {
    if (!pageRef) return;
    const brandParam = (
      (pageRef.state && pageRef.state.brand) ||
      ""
    ).toLowerCase();
    const resolved = BRAND_ORDER.includes(brandParam)
      ? brandParam
      : detectBrandId();
    if (resolved !== this._brandId) {
      this._brandId = resolved;
      this._load();
    }
  }

  async _load() {
    const brandId = this._brandId;
    const [theme, content, identity] = await Promise.all([
      getBrandTheme(brandId),
      getSection("contactSection", brandId),
      getBrandIdentity(brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
    this._identity = identity || {};
    this._iconsReady = false;
  }

  renderedCallback() {
    if (this._iconsReady) return;
    this._iconsReady = true;
    this._injectIcons();
  }

  // ─── Icon injection ────────────────────────────────────────────────────

  _injectIcons() {
    this.template.querySelectorAll("[data-icon]").forEach((el) => {
      if (!el.innerHTML) {
        const size = parseInt(el.dataset.size, 10) || 20;
        el.innerHTML = getIconSvg(el.dataset.icon, size);
      }
    });
  }

  // ─── Computed getters ──────────────────────────────────────────────────

  get content() {
    return this._content;
  }

  get brand() {
    return this._identity || {};
  }

  get programName() {
    return this.brand.programName || this.brand.name || "";
  }

  get attribution() {
    return this.brand.attribution || "";
  }

  get isHTF() {
    return this._brandId === "htf";
  }

  get companyLabel() {
    return this.isHTF ? "Company" : "Restaurant / location";
  }

  get companyPlaceholder() {
    return this.isHTF ? "Acme Corp" : `${this.brand.name} — Main St`;
  }

  get topicOptionsList() {
    return Array.isArray(this._content.topicOptions)
      ? this._content.topicOptions
      : [];
  }

  get phoneHref() {
    const raw = (this._content.phone || "").replace(/\D/g, "");
    return raw ? `tel:+1${raw}` : "#";
  }

  get emailHref() {
    return this._content.email ? `mailto:${this._content.email}` : "#";
  }

  get applyHref() {
    return (
      (BASE_PATH || "/").replace(/\/?$/, "/") +
      this.applyPageName +
      (isPreviewMode() ? "?preview" : "")
    );
  }

  get submitLabel() {
    return this.submitting ? "Sending…" : "Send message";
  }

  // ─── Per-field class getters ───────────────────────────────────────────

  _fc(key) {
    return this.formErrors[key]
      ? "field__input field__input--error"
      : "field__input";
  }

  get firstNameClass() {
    return this._fc("firstName");
  }
  get lastNameClass() {
    return this._fc("lastName");
  }
  get emailClass() {
    return this._fc("email");
  }
  get topicClass() {
    return this._fc("topic");
  }
  get messageClass() {
    return this._fc("message");
  }

  // ─── Event handlers ────────────────────────────────────────────────────

  handleInput(evt) {
    const key = evt.target.dataset.key;
    this.formData = { ...this.formData, [key]: evt.target.value };
    if (this.formErrors[key]) {
      const e = { ...this.formErrors };
      delete e[key];
      this.formErrors = e;
    }
  }

  handleSelect(evt) {
    const key = evt.target.dataset.key;
    this.formData = { ...this.formData, [key]: evt.target.value };
    if (this.formErrors[key]) {
      const e = { ...this.formErrors };
      delete e[key];
      this.formErrors = e;
    }
  }

  handleApplyClick(e) {
    e.preventDefault();
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: { url: this.applyHref }
    });
  }

  handleSubmit() {
    this.submitError = "";
    if (!this._validate()) return;

    const d = this.formData;
    const req = {
      firstName: (d.firstName || "").trim(),
      lastName: (d.lastName || "").trim(),
      company: (d.company || "").trim(),
      email: (d.email || "").trim(),
      phone: (d.phone || "").trim(),
      topic: d.topic || "",
      message: (d.message || "").trim(),
      programName: this.programName
    };

    this.submitting = true;
    createLead({ req })
      .then(() => {
        this.submitting = false;
        this.formSubmitted = true;
        this._iconsReady = false;
        // Re-inject success icon on next render
        Promise.resolve().then(() => {
          const el = this.template.querySelector('[data-icon="checkc"]');
          if (el) el.innerHTML = getIconSvg("checkc", 56);
        });
      })
      .catch((error) => {
        this.submitting = false;
        const msg =
          error && error.body && error.body.message
            ? error.body.message
            : "Something went wrong submitting your message. Please try again or call us directly.";
        this.submitError = msg;
      });
  }

  // ─── Validation ────────────────────────────────────────────────────────

  _validate() {
    const errs = {};
    const d = this.formData;

    if (!d.firstName?.trim()) errs.firstName = "First name is required.";
    if (!d.lastName?.trim()) errs.lastName = "Last name is required.";
    if (!d.email?.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
      errs.email = "Enter a valid email address.";
    if (!d.topic) errs.topic = "Please select a topic.";
    if (!d.message?.trim()) errs.message = "Message is required.";

    this.formErrors = errs;
    return Object.keys(errs).length === 0;
  }
}