import mongoose from "mongoose";

const contactLinkSchema = new mongoose.Schema(
  {
    /*
     * Used to identify links that originally existed
     * in the old hard-coded ContactPage.
     *
     * This field is only for safe migration.
     */
    migrationKey: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },

    platform: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    icon: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * Public Contact page uses:
 *
 * isActive = true
 * order = ascending
 */
contactLinkSchema.index({
  isActive: 1,
  order: 1,
});

/*
 * IMPORTANT:
 *
 * Do NOT call mongoose.model("ContactLink", ...)
 * directly every time.
 *
 * If the model already exists, reuse it.
 *
 * This prevents:
 *
 * OverwriteModelError:
 * Cannot overwrite `ContactLink` model once compiled.
 */
const ContactLink =
  mongoose.models.ContactLink ||
  mongoose.model("ContactLink", contactLinkSchema);

export default ContactLink;
