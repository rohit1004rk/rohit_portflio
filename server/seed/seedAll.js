import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import User from '../models/User.js';

const projects = [
  {
    title: 'Fake News Detector using NLP',
    slug: 'fake-news-detector',
    category: 'AI/ML · NLP',
    icon: '🧠',
    overview:
      'A text-classification system that analyzes news articles and classifies them as real or fake, built with classical ML baselines and a BERT-based deep-learning version in development.',
    problem:
      'Misinformation spreads rapidly through social media and online platforms, making automated identification of potentially fake news useful.',
    whatIBuilt:
      'A text-classification system that analyzes a news article and classifies it as real or fake. The baseline used TF-IDF + Logistic Regression, while a BERT-based version is being developed. The project uses the Kaggle Fake and Real News Dataset, containing approximately 44,000 articles.',
    result:
      'The baseline achieved 87% accuracy, while the BERT version reached 91.4% accuracy, with 90.1% precision, 92.8% recall, and 91.4% F1-score. A key limitation was that satire articles were sometimes classified as fake because of similar linguistic patterns.',
    workflow: [
      'Cleaned and preprocessed ~44,000 articles from the Kaggle Fake and Real News Dataset',
      'Built a TF-IDF + Logistic Regression baseline for text classification',
      'Developed a BERT-based deep-learning version for improved accuracy',
      'Evaluated with precision, recall, and F1-score alongside accuracy',
    ],
    limitations: [
      'Satire articles were sometimes classified as fake because of similar linguistic patterns.',
    ],
    future: [
      'Complete and validate the BERT-based version',
      'Add a web interface for real-time article classification',
      'Explore stance detection to better handle satire and nuance',
    ],
    metrics: [
      { label: 'Baseline Accuracy', value: '87%' },
      { label: 'BERT Accuracy', value: '91.4%' },
      { label: 'Precision', value: '90.1%' },
      { label: 'Recall', value: '92.8%' },
      { label: 'F1-Score', value: '91.4%' },
    ],
    tech: ['Python', 'Scikit-learn', 'TF-IDF', 'Logistic Regression', 'BERT', 'Flask', 'Streamlit'],
    status: 'in-progress',
    featured: true,
    order: 1,
  },
  {
    title: 'Campus Lost & Found Portal',
    slug: 'campus-lost-found-portal',
    category: 'Full Stack · MERN',
    icon: '🎓',
    overview:
      'A centralized web platform where students can post lost or found items with images and location, using ResNet image embeddings to suggest potentially matching items.',
    problem:
      'Campus lost-and-found information is often scattered across WhatsApp groups and physical noticeboards, making it difficult to find matching items.',
    whatIBuilt:
      'A centralized web platform where students can post lost or found items with images and location information. The system uses a pretrained ResNet to generate image embeddings and suggest potentially matching items.',
    result:
      'The core CRUD and item-posting workflow is implemented. Image-similarity matching is still being tuned, and its threshold has not yet been validated on real-world data.',
    workflow: [
      'Designed the item-posting and search data model (images, location, category)',
      'Built CRUD APIs and the React frontend for posting and browsing items',
      'Integrated Cloudinary for image uploads',
      'Implemented ResNet-based image embeddings to suggest matching items',
    ],
    limitations: [
      'Image-similarity matching is still being tuned.',
      'Matching threshold has not yet been validated on real-world data.',
    ],
    future: [
      'Validate the similarity threshold with real campus data',
      'Add notifications when a potential match is found',
      'Add campus-wide categories and filters',
    ],
    metrics: [],
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Cloudinary', 'ResNet'],
    status: 'in-progress',
    order: 2,
  },
  {
    title: 'Voice-Based Attendance System',
    slug: 'voice-based-attendance-system',
    category: 'AI/ML · Speech',
    icon: '🎙️',
    overview:
      'A speaker-recognition prototype that identifies students from short spoken phrases using MFCC features and an SVM classifier.',
    problem:
      'Manual roll-call is time-consuming, while conventional attendance systems such as RFID can be vulnerable to proxy attendance.',
    whatIBuilt:
      'A prototype that uses speaker recognition to identify students from short spoken phrases. Voice samples are enrolled and matched using extracted MFCC features and an SVM classifier.',
    result:
      'The prototype was tested with approximately 30 students in a controlled environment and achieved around 85% correct identification in quiet conditions. Performance dropped noticeably in background noise, highlighting the need for further robustness testing.',
    workflow: [
      'Enrolled voice samples from students in a controlled environment',
      'Extracted MFCC features using Librosa',
      'Trained an SVM classifier for speaker identification',
      'Built a Tkinter desktop interface for the prototype',
    ],
    limitations: [
      'Performance dropped noticeably in background noise.',
      'Tested with ~30 students in a controlled environment only.',
    ],
    future: [
      'Add noise-robustness testing and augmentation',
      'Scale evaluation to a larger, more varied dataset',
      'Explore deep speaker-embedding models',
    ],
    metrics: [{ label: 'Identification (quiet)', value: '~85%' }],
    tech: ['Python', 'Librosa', 'MFCC', 'SVM', 'Tkinter'],
    status: 'prototype',
    order: 3,
  },
  {
    title: 'Mini E-commerce Store',
    slug: 'mini-ecommerce-store',
    category: 'Full Stack · MERN',
    icon: '🛒',
    overview:
      'A MERN-based e-commerce application with product management, carts, JWT authentication, role-based access, and integrated payment and image services.',
    problem:
      'Small online stores need product management, user accounts, shopping carts, orders, payments, and communication within a single application.',
    whatIBuilt:
      'A MERN-based e-commerce application with product listing, cart functionality, authentication, REST APIs, MongoDB CRUD operations, and role-based access for users and administrators. I also integrated Razorpay for payments, Cloudinary for product images, and Nodemailer for order-confirmation emails.',
    result:
      'The core application is functional locally, including product management, cart operations, authentication, API testing, and order storage. Real payment processing and advanced order management are still being completed.',
    workflow: [
      'Built REST APIs with product, cart, order, and auth modules',
      'Implemented JWT authentication with role-based access (user / admin)',
      'Integrated Razorpay for payments and Cloudinary for product images',
      'Added Nodemailer for order-confirmation emails',
    ],
    limitations: [
      'Real payment processing is still being completed.',
      'Advanced order management is not yet production-ready.',
    ],
    future: [
      'Complete real payment processing end-to-end',
      'Add order management and admin dashboards',
      'Add product search, filters, and reviews',
    ],
    metrics: [],
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'Razorpay', 'Cloudinary', 'Nodemailer', 'Postman'],
    status: 'in-progress',
    order: 4,
  },
  {
    title: 'Spam Email Classifier',
    slug: 'spam-email-classifier',
    category: 'AI/ML · NLP',
    icon: '📧',
    overview:
      'A machine-learning text classifier that detects spam messages using TF-IDF features and Multinomial Naive Bayes.',
    problem:
      'Spam messages can overwhelm users and make it difficult to identify legitimate communication.',
    whatIBuilt:
      'A machine-learning text classifier using the SMS Spam Collection Dataset of approximately 5,572 messages. I performed lowercasing, punctuation removal, NLTK tokenization, stop-word removal, and Porter stemming. I initially experimented with CountVectorizer before using TF-IDF with Multinomial Naive Bayes.',
    result:
      'The classifier achieved 97.3% accuracy, 96.1% precision, 89.4% recall, and 92.6% F1-score. The project was implemented and tested in a Jupyter Notebook.',
    workflow: [
      'Preprocessed ~5,572 SMS messages (lowercasing, punctuation removal, tokenization, stop-word removal, Porter stemming)',
      'Experimented with CountVectorizer before settling on TF-IDF',
      'Trained a Multinomial Naive Bayes classifier',
      'Evaluated with accuracy, precision, recall, and F1-score',
    ],
    limitations: [],
    future: [
      'Package the model behind a simple web API',
      'Explore transformer-based classifiers for comparison',
    ],
    metrics: [
      { label: 'Accuracy', value: '97.3%' },
      { label: 'Precision', value: '96.1%' },
      { label: 'Recall', value: '89.4%' },
      { label: 'F1-Score', value: '92.6%' },
    ],
    tech: ['Python', 'NLTK', 'TF-IDF', 'Scikit-learn', 'Multinomial Naive Bayes'],
    status: 'completed',
    order: 5,
  },
  {
    title: 'Image Caption Generator',
    slug: 'image-caption-generator',
    category: 'AI/ML · Computer Vision',
    icon: '🖼️',
    overview:
      'A Show-and-Tell style prototype that generates image captions using a pretrained InceptionV3 encoder and an LSTM decoder.',
    problem:
      'Automatically generating meaningful descriptions from images requires combining computer vision with natural-language generation.',
    whatIBuilt:
      'A prototype based on the Show and Tell architecture. A pretrained InceptionV3 model extracts image features, which are passed to an LSTM decoder that generates captions word-by-word. The system was developed using the Flickr8k dataset.',
    result:
      'The prototype achieved approximately 0.55 BLEU-1. It generated reasonable captions for simple scenes but produced generic or incorrect captions for complex and cluttered images. The full end-to-end pipeline was not yet stable.',
    workflow: [
      'Extracted image features with a pretrained InceptionV3 model',
      'Built an LSTM decoder to generate captions word-by-word',
      'Trained and evaluated on the Flickr8k dataset',
      'Measured quality with the BLEU-1 metric',
    ],
    limitations: [
      'Generated generic or incorrect captions for complex and cluttered images.',
      'The full end-to-end pipeline was not yet stable.',
    ],
    future: [
      'Stabilize the end-to-end training pipeline',
      'Experiment with attention mechanisms for better captions',
      'Evaluate on larger datasets such as Flickr30k',
    ],
    metrics: [{ label: 'BLEU-1', value: '~0.55' }],
    tech: ['Python', 'TensorFlow/Keras', 'InceptionV3', 'LSTM', 'NumPy', 'Matplotlib', 'Pillow'],
    status: 'learning',
    order: 6,
  },
];

const skills = [
  { category: 'Programming Languages', icon: '⌨️', items: ['Python', 'JavaScript', 'Java', 'C'], order: 1 },
  { category: 'Frontend Development', icon: '🎨', items: ['HTML', 'CSS', 'JavaScript', 'React'], order: 2 },
  {
    category: 'Backend Development',
    icon: '⚙️',
    items: ['Node.js', 'Express.js', 'REST API Development', 'JWT Authentication', 'Authentication Middleware', 'Role-Based Authorization'],
    order: 3,
  },
  { category: 'Databases', icon: '🗄️', items: ['MongoDB', 'Mongoose', 'CRUD Operations'], order: 4 },
  {
    category: 'AI / Machine Learning',
    icon: '🤖',
    items: ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Text Classification', 'TF-IDF', 'Logistic Regression', 'Multinomial Naive Bayes', 'SVM', 'BERT', 'CNN / InceptionV3', 'ResNet', 'LSTM', 'MFCC-based Speaker Recognition'],
    order: 5,
  },
  {
    category: 'Libraries & Frameworks',
    icon: '📚',
    items: ['Scikit-learn', 'TensorFlow / Keras', 'NLTK', 'Librosa', 'NumPy', 'Matplotlib', 'Pillow', 'Flask', 'Streamlit', 'Tkinter'],
    order: 6,
  },
  { category: 'Tools & Services', icon: '🛠️', items: ['Git/GitHub', 'Postman', 'Cloudinary', 'Razorpay', 'Nodemailer / SMTP'], order: 7 },
  {
    category: 'Additional Skills',
    icon: '🧩',
    items: ['Web Development', 'AI/ML Application Development', 'Graphic Designing', 'Cybersecurity fundamentals'],
    order: 8,
  },
];

const seedAll = async () => {
  try {
    await connectDB();
    await Project.deleteMany();
    await Project.insertMany(projects);
    await Skill.deleteMany();
    await Skill.insertMany(skills);

    // Create the admin user for the admin panel (change these via env vars)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rohit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    await User.deleteMany({ role: 'admin' });
    await User.create({
      name: 'Rohit Kumar (Admin)',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log(`✅ Seeded ${projects.length} projects, ${skills.length} skill categories`);
    console.log(`✅ Admin user created → ${adminEmail} / ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedAll();
