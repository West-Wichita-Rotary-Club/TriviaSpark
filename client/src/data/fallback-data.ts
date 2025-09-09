// Original demo data as fallback
export const demoEvent = {
  id: "seed-event-coast-to-cascades",
  title: "Coast to Cascades Wine & Trivia Evening",
  description:
    "An elegant evening combining Pacific Northwest wines with engaging trivia, supporting West Wichita Rotary Club's community initiatives.",
  hostId: "mark-user-id",
  eventType: "wine_dinner",
  status: "draft",
  qrCode: "rotary-cascades-2025",
  maxParticipants: 50,
  difficulty: "mixed",
  logoUrl: "https://example.com/rotary-logo.png",
  backgroundImageUrl: "https://example.com/wine-background.jpg",
  eventCopy:
    "Experience an unforgettable evening where fine wine meets friendly competition! Join us for Coast to Cascades Wine & Trivia Night, where every sip and every answer helps support our local community. With carefully curated Pacific Northwest wines and engaging trivia questions, this elegant fundraiser promises both sophistication and fun.",
  welcomeMessage:
    "Welcome to Coast to Cascades Wine & Trivia Night! We're thrilled to have you join us for this special evening of wine, wisdom, and wonderful causes. Get ready for an exciting trivia experience while supporting our community!",
  thankYouMessage:
    "Thank you for participating in Coast to Cascades Wine & Trivia Night! Your involvement helps us continue supporting local charities and making a difference in our community. We hope you enjoyed the evening!",
  primaryColor: "#7C2D12",
  secondaryColor: "#FEF3C7",
  fontFamily: "Inter",
  contactEmail: "events@westwichitarotary.org",
  contactPhone: "(316) 555-0123",
  websiteUrl: "https://westwichitarotary.org",
  socialLinks: JSON.stringify({
    facebook: "https://facebook.com/westwichitarotary",
    twitter: "https://twitter.com/wwrotary",
    instagram: "https://instagram.com/westwichitarotary",
  }),
  prizeInformation:
    "1st Place: $500 Wine Country Gift Package\n2nd Place: $300 Local Restaurant Gift Cards\n3rd Place: $200 Wine Selection\nAll participants receive a commemorative wine glass and local business discount cards!",
  eventRules:
    "• Teams of 2-6 participants\n• No smartphones or electronic devices during questions\n• Wine tasting between rounds is encouraged\n• Be respectful to all participants and volunteers\n• Have fun and support a great cause!",
  specialInstructions:
    "Please arrive 30 minutes early for check-in and wine selection. Designated driver arrangements are encouraged. Business casual or cocktail attire suggested.",
  accessibilityInfo:
    "The venue is wheelchair accessible with elevator access to all floors. Large print question sheets available upon request. Please contact us for any specific accommodation needs.",
  dietaryAccommodations:
    "Light appetizers will be served. Vegetarian and gluten-free options available. Please contact us 48 hours in advance for specific dietary requirements.",
  dressCode: "Business casual or cocktail attire",
  ageRestrictions: "21+ for wine tasting, 18+ for trivia participation",
  technicalRequirements: "No technical requirements - all materials provided",
  registrationDeadline: new Date("2025-02-10T23:59:59"),
  cancellationPolicy:
    "Full refund available until 72 hours before the event. After that, 50% refund is available until 24 hours before. No refunds within 24 hours of the event.",
  refundPolicy:
    "Refunds processed within 5-7 business days to the original payment method. Processing fees may apply.",
  sponsorInformation: JSON.stringify({
    name: "Pacific Northwest Wine Distributors",
    logoUrl: "https://example.com/sponsor-logo.png",
    website: "https://pnwwine.com",
    description:
      "Leading distributor of premium Pacific Northwest wines, proudly supporting community fundraising events throughout the region.",
  }),
  settings: {},
  eventDate: new Date("2025-09-13"),
  eventTime: "6:30 PM",
  location: "Riverside Conference Center",
  sponsoringOrganization: "West Wichita Rotary Club",
  createdAt: new Date("2025-08-23"),
  startedAt: null,
  completedAt: null,
};

export const demoQuestions = [
  {
    id: "q1-wine-regions",
    eventId: "seed-event-coast-to-cascades",
    type: "multiple_choice",
    question:
      "Which Pacific Northwest wine region is known as Oregon's premier Pinot Noir producing area?",
    options: [
      "Willamette Valley",
      "Columbia Valley",
      "Walla Walla Valley",
      "Yakima Valley",
    ],
    correctAnswer: "Willamette Valley",
    explanation:
      "The Willamette Valley is Oregon's most famous wine region, producing some of the world's finest Pinot Noir thanks to its unique climate and volcanic soils.",
    difficulty: "medium",
    category: "wine",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    points: 100,
    timeLimit: 30,
    orderIndex: 1,
    aiGenerated: false,
    createdAt: new Date(),
  },
  {
    id: "q2-rotary-service",
    eventId: "seed-event-coast-to-cascades",
    type: "multiple_choice",
    question:
      "What is Rotary International's primary focus in community service?",
    options: [
      "Environmental conservation",
      "Education and literacy",
      "Service Above Self",
      "Economic development",
    ],
    correctAnswer: "Service Above Self",
    explanation:
      "Rotary's motto 'Service Above Self' encapsulates the organization's core philosophy of putting service to others before personal interests.",
    difficulty: "medium",
    category: "rotary",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    points: 100,
    timeLimit: 30,
    orderIndex: 2,
    aiGenerated: false,
    createdAt: new Date(),
  },
  {
    id: "q3-pacific-northwest",
    eventId: "seed-event-coast-to-cascades",
    type: "multiple_choice",
    question:
      "Mount Rainier, the iconic peak visible from Seattle, reaches what elevation?",
    options: ["12,330 feet", "14,411 feet", "16,050 feet", "11,249 feet"],
    correctAnswer: "14,411 feet",
    explanation:
      "Mount Rainier stands at 14,411 feet, making it the highest peak in the Cascade Range and a prominent feature of the Pacific Northwest landscape.",
    difficulty: "medium",
    category: "geography",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    points: 100,
    timeLimit: 30,
    orderIndex: 3,
    aiGenerated: false,
    createdAt: new Date(),
  },
  {
    id: "q4-oregon-wine-variety",
    eventId: "seed-event-coast-to-cascades",
    type: "multiple_choice",
    question:
      "Which grape variety is Oregon's signature and most widely planted wine grape?",
    options: ["Chardonnay", "Pinot Noir", "Riesling", "Cabernet Sauvignon"],
    correctAnswer: "Pinot Noir",
    explanation:
      "Pinot Noir is Oregon's flagship grape variety, thriving in the cool climate and representing about 58% of all wine grape plantings in the state.",
    difficulty: "medium",
    category: "wine",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    points: 100,
    timeLimit: 30,
    orderIndex: 4,
    aiGenerated: false,
    createdAt: new Date(),
  },
  {
    id: "q5-oregon-geographic-feature",
    eventId: "seed-event-coast-to-cascades",
    type: "multiple_choice",
    question:
      "What major geographic feature creates the natural boundary between Oregon's wine regions and influences their climate patterns?",
    options: [
      "Columbia River",
      "Coast Range",
      "Cascade Mountains",
      "Blue Mountains",
    ],
    correctAnswer: "Cascade Mountains",
    explanation:
      "The Cascade Mountains create a rain shadow effect, giving Oregon's wine regions their Mediterranean-like climate with wet winters and dry summers.",
    difficulty: "medium",
    category: "geography",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    points: 100,
    timeLimit: 30,
    orderIndex: 5,
    aiGenerated: false,
    createdAt: new Date(),
  },
];

export const demoFunFacts = [
  {
    id: "ff1-musical-tradition",
    eventId: "seed-event-coast-to-cascades",
    title: "Musical Holiday Tradition",
    content:
      "The club hosts an annual Holiday Lunch featuring performances by the Friends University Concert Choir, a tradition started by founding member Dr. David Weber that continues nearly 40 years later! 🎵",
    orderIndex: 1,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "ff2-oregon-wine-facts",
    eventId: "seed-event-coast-to-cascades",
    title: "Oregon Wine Pioneer",
    content:
      "David Lett, known as 'Papa Pinot,' planted Oregon's first Pinot Noir vines in 1965 in the Dundee Hills. His 1975 Pinot Noir shocked the wine world by placing second in a blind tasting against top French Burgundies! 🍷",
    orderIndex: 2,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "ff3-rotary-foundation",
    eventId: "seed-event-coast-to-cascades",
    title: "Rotary's Global Impact",
    content:
      "The Rotary Foundation has helped immunize more than 2.5 billion children against polio since 1985, bringing the world closer to eradicating this disease completely! 💉",
    orderIndex: 3,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "ff4-pacific-northwest-climate",
    eventId: "seed-event-coast-to-cascades",
    title: "Perfect Wine Climate",
    content:
      "Oregon's Willamette Valley shares the same latitude (45°N) as Burgundy, France, which explains why Pinot Noir thrives so well in both regions! 🌍",
    orderIndex: 4,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "ff5-community-service",
    eventId: "seed-event-coast-to-cascades",
    title: "Service Above Self",
    content:
      "Rotary clubs worldwide contribute over 47 million volunteer hours annually, with members donating their time to projects ranging from literacy programs to clean water initiatives! 🤝",
    orderIndex: 5,
    isActive: true,
    createdAt: new Date(),
  },
];
