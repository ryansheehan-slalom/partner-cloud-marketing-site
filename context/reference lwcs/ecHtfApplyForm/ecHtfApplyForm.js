import { LightningElement, wire, api, track } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
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
  isPreviewMode
} from "c/ecHtfContentService";

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC"
];

const STEP_LABELS = ["Business", "Equipment", "Ownership", "Review"];

// Seed every bound field with an empty string so inputs render their
// placeholders (binding `undefined` to a DOM input.value yields "undefined").
const EMPTY_FORM = {
  bizLegal: "",
  bizDba: "",
  bizStructure: "",
  bizEin: "",
  bizYears: "",
  bizLocations: "",
  bizAddress: "",
  bizCity: "",
  bizState: "",
  bizZip: "",
  bizPhone: "",
  bizEmail: "",
  equipDetails: "",
  equipAmount: "",
  equipTerm: "",
  equipProject: "",
  equipFinType: "",
  equipVendor: "",
  ownFirst: "",
  ownLast: "",
  ownTitle: "",
  ownPct: "",
  ownSsn: "",
  ownDob: "",
  ownAddress: "",
  ownCity: "",
  ownState: "",
  ownZip: "",
  ownEmail: "",
  ownPhone: "",
  signature: ""
};

export default class EcHtfApplyForm extends NavigationMixin(LightningElement) {
  @api homePageName = "Home";
  @api contactPageName = "contact";

  @track currentStep = 1;
  @track submitted = false;
  @track refNumber = "";
  @track formData = { ...EMPTY_FORM };
  @track errors = {};
  @track selectedAssets = [];
  @track consentCredit = false;
  @track consentTerms = false;
  @track _appConfig = {};
  @track _finContent = {};

  _brandId = "htf";
  _iconsReady = false;

  connectedCallback() {
    this._brandId = detectBrandId();
    this._load().then(() => {
      this._loadSaved();
      this._prefillFromCart();
    });
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
    const [theme, appConfig, finContent] = await Promise.all([
      getBrandTheme(brandId),
      getSection("applicationConfig", brandId),
      getSection("financeSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._appConfig = appConfig || {};
    this._finContent = finContent || {};
    this._iconsReady = false;
  }

  renderedCallback() {
    if (!this._iconsReady) {
      this._iconsReady = true;
      this._injectStaticIcons();
    }
    this._injectDynamicIcons();
  }

  handleHomeClick(e) {
    e.preventDefault();
    const url =
      (BASE_PATH || "/").replace(/\/?$/, "/") +
      (isPreviewMode() ? "?preview" : "");
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: { url }
    });
  }

  handleContactClick(e) {
    e.preventDefault();
    const ref = {
      type: "comm__namedPage",
      attributes: { name: this.contactPageName }
    };
    if (isPreviewMode()) {
      this[NavigationMixin.GenerateUrl](ref)
        .then((url) =>
          this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: { url: url + "?preview" }
          })
        )
        .catch(() => this[NavigationMixin.Navigate](ref));
    } else {
      this[NavigationMixin.Navigate](ref);
    }
  }

  _storageKey() {
    return `htf_app_${this._brandId}`;
  }

  _loadSaved() {
    try {
      const raw = localStorage.getItem(this._storageKey());
      if (raw) {
        const saved = JSON.parse(raw);
        this.formData = { ...EMPTY_FORM, ...(saved.formData || {}) };
        this.selectedAssets = saved.selectedAssets || [];
        this.currentStep = saved.currentStep || 1;
      }
    } catch (_e) {
      /* storage not available */
    }
  }

  _prefillFromCart() {
    if (this._brandId !== "subway") return;
    try {
      const raw = localStorage.getItem("htf_cart_subway");
      if (!raw) return;
      const cart = JSON.parse(raw);
      if (!Array.isArray(cart) || !cart.length) return;
      const names = cart
        .map((i) => i.name || i.title || "")
        .filter(Boolean)
        .join(", ");
      if (!this.formData.equipDetails)
        this.formData = { ...this.formData, equipDetails: names };
      if (!this.selectedAssets.length) this.selectedAssets = ["ovens"];
    } catch (_e) {
      /* ignore */
    }
  }

  _save() {
    try {
      localStorage.setItem(
        this._storageKey(),
        JSON.stringify({
          formData: this.formData,
          selectedAssets: this.selectedAssets,
          currentStep: this.currentStep
        })
      );
    } catch (_e) {
      /* ignore */
    }
  }

  _clearSaved() {
    try {
      localStorage.removeItem(this._storageKey());
    } catch (_e) {
      /* ignore */
    }
  }

  _injectStaticIcons() {
    const successIcon = this.template.querySelector("[data-success-icon]");
    if (successIcon) successIcon.innerHTML = getIconSvg("check-circle", 64);
  }

  _injectDynamicIcons() {
    this.template.querySelectorAll("[data-asset-icon]").forEach((el) => {
      el.innerHTML = getIconSvg(el.dataset.assetIcon, 28);
    });
  }

  get brandId() {
    return this._brandId;
  }
  get appConfig() {
    return this._appConfig || {};
  }
  get usStates() {
    return US_STATES;
  }
  get isStep1() {
    return this.currentStep === 1;
  }
  get isStep2() {
    return this.currentStep === 2;
  }
  get isStep3() {
    return this.currentStep === 3;
  }
  get isStep4() {
    return this.currentStep === 4;
  }
  get showBack() {
    return this.currentStep > 1;
  }
  get showFinType() {
    return (this.appConfig.finTypes || []).length > 1;
  }

  get stepMeta() {
    return STEP_LABELS.map((label, idx) => {
      const num = idx + 1;
      const isDone = num < this.currentStep;
      const isCurrent = num === this.currentStep;
      return {
        num,
        label,
        isCurrent,
        isDisabled: num > this.currentStep && !isDone,
        navClass: [
          "step-nav__item",
          isDone ? "step-nav__item--done" : "",
          isCurrent ? "step-nav__item--current" : ""
        ]
          .filter(Boolean)
          .join(" ")
      };
    });
  }

  get assetTiles() {
    const raw = this._finContent.assets || [];
    return raw.map((a) => ({
      id: a.id,
      icon: a.icon || "server",
      title: a.title || "",
      selected: this.selectedAssets.includes(a.id),
      tileClass: [
        "asset-tile",
        this.selectedAssets.includes(a.id) ? "asset-tile--selected" : ""
      ]
        .filter(Boolean)
        .join(" ")
    }));
  }

  get reviewBizAddress() {
    const f = this.formData;
    return [f.bizAddress, f.bizCity, f.bizState, f.bizZip]
      .filter(Boolean)
      .join(", ");
  }

  get reviewAssets() {
    if (!this.selectedAssets.length) return "—";
    return (
      this.selectedAssets
        .map((id) => {
          const a = (this._finContent.assets || []).find((r) => r.id === id);
          return a ? a.title : id;
        })
        .join(", ") || "—"
    );
  }

  get reviewAmount() {
    return this.formData.equipAmount ? `$${this.formData.equipAmount}` : "—";
  }
  get reviewOwnName() {
    return (
      [this.formData.ownFirst, this.formData.ownLast]
        .filter(Boolean)
        .join(" ") || "—"
    );
  }

  _fc(key) {
    return this.errors[key]
      ? "field__input field__input--error"
      : "field__input";
  }
  get bizLegalCls() {
    return this._fc("bizLegal");
  }
  get bizStructureCls() {
    return this._fc("bizStructure");
  }
  get bizEinCls() {
    return this._fc("bizEin");
  }
  get bizYearsCls() {
    return this._fc("bizYears");
  }
  get bizAddressCls() {
    return this._fc("bizAddress");
  }
  get bizCityCls() {
    return this._fc("bizCity");
  }
  get bizStateCls() {
    return this._fc("bizState");
  }
  get bizZipCls() {
    return this._fc("bizZip");
  }
  get bizPhoneCls() {
    return this._fc("bizPhone");
  }
  get bizEmailCls() {
    return this._fc("bizEmail");
  }
  get equipDetailsCls() {
    return this._fc("equipDetails");
  }
  get equipAmountCls() {
    return this._fc("equipAmount");
  }
  get equipTermCls() {
    return this._fc("equipTerm");
  }
  get ownFirstCls() {
    return this._fc("ownFirst");
  }
  get ownLastCls() {
    return this._fc("ownLast");
  }
  get ownTitleCls() {
    return this._fc("ownTitle");
  }
  get ownPctCls() {
    return this._fc("ownPct");
  }
  get ownSsnCls() {
    return this._fc("ownSsn");
  }
  get ownDobCls() {
    return this._fc("ownDob");
  }
  get ownAddressCls() {
    return this._fc("ownAddress");
  }
  get ownCityCls() {
    return this._fc("ownCity");
  }
  get ownStateCls() {
    return this._fc("ownState");
  }
  get ownZipCls() {
    return this._fc("ownZip");
  }
  get ownPhoneCls() {
    return this._fc("ownPhone");
  }
  get ownEmailCls() {
    return this._fc("ownEmail");
  }
  get signatureCls() {
    return this._fc("signature");
  }

  handleInput(evt) {
    const key = evt.target.dataset.key;
    this.formData = { ...this.formData, [key]: evt.target.value };
    if (this.errors[key]) {
      const e = { ...this.errors };
      delete e[key];
      this.errors = e;
    }
  }
  handleSelect(evt) {
    const key = evt.target.dataset.key;
    this.formData = { ...this.formData, [key]: evt.target.value };
    if (this.errors[key]) {
      const e = { ...this.errors };
      delete e[key];
      this.errors = e;
    }
  }
  handleCheckbox(evt) {
    const key = evt.target.dataset.key;
    this[key] = evt.target.checked;
    if (this.errors[key]) {
      const e = { ...this.errors };
      delete e[key];
      this.errors = e;
    }
  }
  handleAssetToggle(evt) {
    const id = evt.currentTarget.dataset.asset;
    const idx = this.selectedAssets.indexOf(id);
    this.selectedAssets =
      idx === -1
        ? [...this.selectedAssets, id]
        : this.selectedAssets.filter((a) => a !== id);
    if (this.errors.assets) {
      const e = { ...this.errors };
      delete e.assets;
      this.errors = e;
    }
  }
  handleStepNav(evt) {
    const target = parseInt(
      evt.currentTarget.dataset.goto || evt.currentTarget.dataset.step,
      10
    );
    if (target < this.currentStep) this.currentStep = target;
  }
  handleNext() {
    if (!this._validateStep(this.currentStep)) return;
    this.currentStep++;
    this._save();
    this._scrollTop();
  }
  handleBack() {
    this.currentStep--;
    this._scrollTop();
  }
  handleSubmit() {
    if (!this._validateStep(4)) return;
    this._clearSaved();
    this.refNumber = this._generateRef();
    this.submitted = true;
    this._scrollTop();
  }

  _validateStep(step) {
    const errs = {};
    if (step === 1) {
      if (!this.formData.bizLegal?.trim()) errs.bizLegal = "Required";
      if (!this.formData.bizStructure) errs.bizStructure = "Required";
      if (!this.formData.bizEin?.trim()) errs.bizEin = "Required";
      if (!this.formData.bizYears) errs.bizYears = "Required";
      if (!this.formData.bizAddress?.trim()) errs.bizAddress = "Required";
      if (!this.formData.bizCity?.trim()) errs.bizCity = "Required";
      if (!this.formData.bizState) errs.bizState = "Required";
      if (!this.formData.bizZip?.trim()) errs.bizZip = "Required";
      if (!this.formData.bizPhone?.trim()) errs.bizPhone = "Required";
      if (!this.formData.bizEmail?.trim()) errs.bizEmail = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.bizEmail))
        errs.bizEmail = "Enter a valid email";
    }
    if (step === 2) {
      if (!this.selectedAssets.length)
        errs.assets = "Select at least one category";
      if (!this.formData.equipDetails?.trim()) errs.equipDetails = "Required";
      if (!this.formData.equipAmount?.trim()) errs.equipAmount = "Required";
      if (!this.formData.equipTerm) errs.equipTerm = "Required";
    }
    if (step === 3) {
      if (!this.formData.ownFirst?.trim()) errs.ownFirst = "Required";
      if (!this.formData.ownLast?.trim()) errs.ownLast = "Required";
      if (!this.formData.ownTitle?.trim()) errs.ownTitle = "Required";
      if (!this.formData.ownPct) errs.ownPct = "Required";
      if (!this.formData.ownSsn?.trim()) errs.ownSsn = "Required";
      else if (!/^\d{4}$/.test(this.formData.ownSsn))
        errs.ownSsn = "Enter last 4 digits";
      if (!this.formData.ownDob) errs.ownDob = "Required";
      if (!this.formData.ownAddress?.trim()) errs.ownAddress = "Required";
      if (!this.formData.ownCity?.trim()) errs.ownCity = "Required";
      if (!this.formData.ownState) errs.ownState = "Required";
      if (!this.formData.ownZip?.trim()) errs.ownZip = "Required";
      if (!this.formData.ownPhone?.trim()) errs.ownPhone = "Required";
      if (!this.formData.ownEmail?.trim()) errs.ownEmail = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.ownEmail))
        errs.ownEmail = "Enter a valid email";
    }
    if (step === 4) {
      if (!this.consentCredit)
        errs.consentCredit = "Your authorization is required";
      if (!this.consentTerms) errs.consentTerms = "You must agree to the terms";
      if (!this.formData.signature?.trim())
        errs.signature = "Electronic signature is required";
    }
    this.errors = errs;
    return Object.keys(errs).length === 0;
  }

  _generateRef() {
    const prefix =
      this._brandId === "subway"
        ? "SUBWAY"
        : this._brandId === "dunkin"
          ? "DUNKIN"
          : "HTF";
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  _scrollTop() {
    try {
      this.template.host.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (_e) {
      /* ignore */
    }
  }
}