import mongoose from "mongoose";

const contactLinkSchema = new mongoose.Schema(
  {
    /*
     * Stable internal key used only for migrating
     * the portfolio's existing hard-coded contact links.
     *
     * Admin users do not edit this value.
     *
     * Example:
     * email
     * linkedin
     * github
     * resume
     * youtube
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
      index: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * Public Contact page:
 * only active links are returned and they are ordered
 * according to the Admin Dashboard display order.
 */
contactLinkSchema.index({
  isActive: 1,
  order: 1,
});

const ContactLink = mongoose.model("ContactLink", contactLinkSchema);

export default ContactLink;

