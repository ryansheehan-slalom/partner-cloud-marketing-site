import { LightningElement, api, wire, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import USER_ID from "@salesforce/user/Id";
import EMAIL_FIELD from "@salesforce/schema/User.Email";
import getPasswordPolicy from "@salesforce/apex/ECUserProfileController.getPasswordPolicy";
import changePassword from "@salesforce/apex/ECUserProfileController.changePassword";

// This component is scoped to the running User only.
const OBJECT_API_NAME = "User";
const PROFILE_HEADER = "Profile Details";
const PASSWORD_HEADER = "Change Password";
const FALLBACK_MIN_LENGTH = 8;

// Fields treated as "Location" settings and grouped together in the UI.
const LOCATION_FIELDS = new Set([
  "LanguageLocaleKey",
  "LocaleSidKey",
  "TimeZoneSidKey"
]);

// The User fields the profile renders, and how each behaves.
// editable: false renders the field read-only even in edit mode.
const DEFAULT_FIELDS = [
  { fieldName: "FirstName", editable: true, required: true },
  { fieldName: "LastName", editable: true, required: true },
  { fieldName: "Email", editable: true, required: true },
  { fieldName: "Title", editable: true, required: false },
  { fieldName: "LanguageLocaleKey", editable: true, required: false },
  { fieldName: "LocaleSidKey", editable: true, required: false },
  { fieldName: "TimeZoneSidKey", editable: true, required: false }
];

const EMAIL_DISCLAIMER =
  "Any changes to your email address will generate a confirmation request " +
  "message to the new address. Changes will not be reflected until your new " +
  "email address is confirmed.";

export default class EcUserProfile extends LightningElement {
  // ─── Public configuration ─────────────────────────────────────────────
  /** Hide the entire change-password section when true. */
  @api hidePasswordSection = false;

  userId = USER_ID;

  // ─── Static labels (not admin-configurable) ───────────────────────────
  get objectApiName() {
    return OBJECT_API_NAME;
  }
  get profileHeader() {
    return PROFILE_HEADER;
  }
  get passwordHeader() {
    return PASSWORD_HEADER;
  }

  // ─── Profile view/edit state ──────────────────────────────────────────
  isViewMode = true;
  isSaving = false;
  originalEmail;
  emailChanged = false;

  // ─── Password state (transient; cleared after submit) ─────────────────
  @track passwords = { current: "", next: "", confirm: "" };
  showCurrent = false;
  showNext = false;
  showConfirm = false;
  isChangingPassword = false;
  passwordError = "";
  // Minimum length sourced from the org Password Policies (via Apex).
  policyMinLength = FALLBACK_MIN_LENGTH;

  // ─── Wires ────────────────────────────────────────────────────────────
  @wire(getRecord, { recordId: "$userId", fields: [EMAIL_FIELD] })
  wiredUser({ data }) {
    if (data) {
      this.originalEmail = getFieldValue(data, EMAIL_FIELD);
    }
  }

  @wire(getPasswordPolicy)
  wiredPolicy({ data }) {
    if (data && data.minLength) {
      this.policyMinLength = data.minLength;
    }
  }

  // ─── Field configuration ──────────────────────────────────────────────
  get profileFieldRows() {
    return DEFAULT_FIELDS.filter((f) => !LOCATION_FIELDS.has(f.fieldName)).map(
      (f) => this._decorateField(f)
    );
  }

  get locationFieldRows() {
    return DEFAULT_FIELDS.filter((f) => LOCATION_FIELDS.has(f.fieldName)).map(
      (f) => this._decorateField(f)
    );
  }

  get hasLocationFields() {
    return this.locationFieldRows.length > 0;
  }

  _decorateField(f) {
    return {
      key: f.fieldName,
      fieldName: f.fieldName,
      editable: f.editable !== false,
      readOnly: f.editable === false,
      required: f.required === true
    };
  }

  // ─── Profile view/edit handlers ───────────────────────────────────────
  get profileButtonLabel() {
    return "Edit";
  }

  handleEdit() {
    this.isViewMode = false;
    this.emailChanged = false;
  }

  handleCancel() {
    this.isViewMode = true;
    this.isSaving = false;
    this.emailChanged = false;
  }

  handleFieldChange(event) {
    // Show the email disclaimer only when the Email value actually changes.
    // (lightning-input-field change events don't carry detail.value, so read
    // the current value straight off the field element.)
    if (event.target.dataset.field === "Email") {
      const value = event.target.value;
      this.emailChanged =
        value != null && value !== "" && value !== this.originalEmail;
    }
  }

  handleSubmit() {
    // lightning-record-edit-form enforces CRUD/FLS via the UI API; we only
    // flip the saving flag so the spinner shows.
    this.isSaving = true;
  }

  handleSuccess() {
    this.isSaving = false;
    this.isViewMode = true;
    this.emailChanged = false;
    this._toast("Success", "Your profile has been updated.", "success");
  }

  handleError(event) {
    this.isSaving = false;
    const detail =
      event && event.detail && event.detail.detail
        ? event.detail.detail
        : "We couldn't save your changes. Please review the form and try again.";
    this._toast("Unable to save", detail, "error");
  }

  get showEmailDisclaimer() {
    return !this.isViewMode && this.emailChanged;
  }

  get emailDisclaimer() {
    return EMAIL_DISCLAIMER;
  }

  // ─── Password: show/hide toggles ──────────────────────────────────────
  get currentType() {
    return this.showCurrent ? "text" : "password";
  }
  get nextType() {
    return this.showNext ? "text" : "password";
  }
  get confirmType() {
    return this.showConfirm ? "text" : "password";
  }
  get currentToggleIcon() {
    return this.showCurrent ? "utility:hide" : "utility:preview";
  }
  get nextToggleIcon() {
    return this.showNext ? "utility:hide" : "utility:preview";
  }
  get confirmToggleIcon() {
    return this.showConfirm ? "utility:hide" : "utility:preview";
  }

  toggleCurrent() {
    this.showCurrent = !this.showCurrent;
  }
  toggleNext() {
    this.showNext = !this.showNext;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  // ─── Password: input handlers ─────────────────────────────────────────
  handleCurrentInput(event) {
    this.passwords = { ...this.passwords, current: event.target.value };
  }
  handleNextInput(event) {
    this.passwords = { ...this.passwords, next: event.target.value };
  }
  handleConfirmInput(event) {
    this.passwords = { ...this.passwords, confirm: event.target.value };
  }

  // ─── Password: live criteria feedback ─────────────────────────────────
  get minLength() {
    const n = parseInt(this.policyMinLength, 10);
    return Number.isNaN(n) || n < 1 ? FALLBACK_MIN_LENGTH : n;
  }

  get criteria() {
    const v = this.passwords.next || "";
    const confirm = this.passwords.confirm || "";
    const rules = [
      {
        id: "length",
        label: `Contain at least ${this.minLength} characters`,
        met: v.length >= this.minLength
      },
      {
        id: "lower",
        label: "Contain at least 1 lower-case character",
        met: /[a-z]/.test(v)
      },
      {
        id: "upper",
        label: "Contain at least 1 upper-case character",
        met: /[A-Z]/.test(v)
      },
      {
        id: "number",
        label: "Contain at least 1 numeric character",
        met: /[0-9]/.test(v)
      },
      {
        id: "special",
        label: "Contain at least 1 special character",
        met: /[^A-Za-z0-9]/.test(v)
      },
      {
        id: "match",
        label: "Match the confirm password",
        met: v !== "" && v === confirm
      }
    ];
    return rules.map((r) => ({
      ...r,
      iconName: r.met ? "utility:success" : "utility:error",
      iconVariant: r.met ? "success" : "error",
      textClass: r.met ? "slds-text-color_success" : "slds-text-color_error"
    }));
  }

  get allCriteriaMet() {
    return this.criteria.every((c) => c.met);
  }

  get disableSubmit() {
    return (
      this.isChangingPassword || !this.passwords.current || !this.allCriteriaMet
    );
  }

  get showPasswordSection() {
    return !this.hidePasswordSection;
  }

  // ─── Password: submit ─────────────────────────────────────────────────
  handleChangePassword() {
    this.passwordError = "";
    if (this.disableSubmit) {
      return;
    }

    this.isChangingPassword = true;
    changePassword({
      oldPassword: this.passwords.current,
      newPassword: this.passwords.next,
      verifyPassword: this.passwords.confirm
    })
      .then(() => {
        this._resetPasswordForm();
        this._toast(
          "Password updated",
          "Your password has been changed successfully.",
          "success"
        );
      })
      .catch((error) => {
        this.isChangingPassword = false;
        this.passwordError =
          error && error.body && error.body.message
            ? error.body.message
            : "We couldn't update your password. Please try again.";
      });
  }

  _resetPasswordForm() {
    this.isChangingPassword = false;
    this.passwordError = "";
    this.showCurrent = false;
    this.showNext = false;
    this.showConfirm = false;
    this.passwords = { current: "", next: "", confirm: "" };
    // Clear the underlying inputs so no value lingers in the DOM.
    this.template.querySelectorAll('[data-password="true"]').forEach((el) => {
      el.value = "";
    });
  }

  // ─── Utilities ────────────────────────────────────────────────────────
  _toast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}