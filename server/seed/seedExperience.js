import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Education from "../models/Education.js";

const educations = [
  {
    years: "2023 – 2027",
    title: "B.Tech (BEU)",
    place: "Supaul College of Engineering",
    location: "Supaul, Bihar",
    detail: "Computer Science (AI)",
    cgpa: "7.7 / 10",
    percentage: "",
    icon: "🎓",
    order: 1,
    visible: true,
  },

  {
    years: "2020 – 2022",
    title: "Class 12th (CBSE)",
    place: "Shivam School",
    location: "Vijaynagar, Bihta, Patna",
    detail: "Class 12th (CBSE)",
    cgpa: "",
    percentage: "",
    icon: "🏫",
    order: 2,
    visible: true,
  },

  {
    years: "2018 – 2020",
    title: "Class 10th (CBSE)",
    place: "D.A.V Public School",
    location: "BSEB Colony, New Punaichack, Patna",
    detail: "Class 10th (CBSE)",
    cgpa: "",
    percentage: "",
    icon: "🏫",
    order: 3,
    visible: true,
  },
];

const seedEducation = async () => {
  try {
    await connectDB();

    let added = 0;
    let skipped = 0;

    for (const education of educations) {
      const existing = await Education.findOne({
        years: education.years,
        title: education.title,
        place: education.place,
      });

      if (existing) {
        skipped++;

        console.log(
          `⏭️ Already exists: ${education.title} — ${education.place}`,
        );

        continue;
      }

      await Education.create(education);
      added++;

      console.log(`✅ Added: ${education.title} — ${education.place}`);
    }

    console.log(
      `\n🎉 Education seed completed: ${added} added, ${skipped} skipped.`,
    );

    process.exit(0);
  } catch (error) {
    console.error(`❌ Education seed error: ${error.message}`);
    process.exit(1);
  }
};

seedEducation();
