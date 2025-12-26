import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { Product } from "./models/Product";
import { User } from "./models/User";

const placeholderSets: string[][] = [
  [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1528701800489-20be3c16ef5b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1528701800489-20be3c16ef5b?auto=format&fit=crop&w=900&q=80"
  ]
];

async function run() {
  const mongoUri = process.env.MONGO_URI ?? process.env.DATABASE_URL;
  if (!mongoUri) throw new Error("Missing MONGO_URI (or DATABASE_URL)");

  await mongoose.connect(mongoUri);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@exporium.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin12345!";

  const adminEmailLower = adminEmail.toLowerCase();
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.findOneAndUpdate(
    { email: adminEmailLower },
    {
      $set: {
        name: "Exporium Admin",
        email: adminEmailLower,
        passwordHash,
        role: "admin"
      }
    },
    { upsert: true, new: true }
  );

  const productCount = await Product.countDocuments();
  if (productCount < 8) {
    await Product.deleteMany({});

    const products = [
      {
        name: "Exporium Runner 01",
        brand: "Exporium",
        category: "Running",
        description: "Lightweight comfort with premium cushioning.",
        price: 129.99,
        images: placeholderSets[0],
        sizes: ["7", "8", "9", "10", "11"],
        stock: 40
      },
      {
        name: "Street Luxe Low",
        brand: "Exporium",
        category: "Lifestyle",
        description: "Minimal low-top silhouette with luxe finish.",
        price: 149.99,
        images: placeholderSets[0],
        sizes: ["7", "8", "9", "10", "11", "12"],
        stock: 35
      },
      {
        name: "CloudStep Pro",
        brand: "Exporium",
        category: "Training",
        description: "Stable platform designed for gym sessions.",
        price: 119.99,
        images: placeholderSets[0],
        sizes: ["6", "7", "8", "9", "10"],
        stock: 30
      },
      {
        name: "Retro Court",
        brand: "Exporium",
        category: "Court",
        description: "Vintage court vibes with modern materials.",
        price: 139.99,
        images: placeholderSets[0],
        sizes: ["7", "8", "9", "10", "11"],
        stock: 25
      },
      {
        name: "Midnight Black",
        brand: "Exporium",
        category: "Lifestyle",
        description: "Luxury black-on-black sneaker for all-day wear.",
        price: 159.99,
        images: placeholderSets[0],
        sizes: ["7", "8", "9", "10", "11", "12"],
        stock: 50
      },
      {
        name: "Trail Vantage",
        brand: "Exporium",
        category: "Outdoor",
        description: "Grip-ready outsole and durable upper for trails.",
        price: 169.99,
        images: placeholderSets[0],
        sizes: ["8", "9", "10", "11", "12"],
        stock: 18
      },
      {
        name: "Aero Knit",
        brand: "Exporium",
        category: "Running",
        description: "Breathable knit upper with responsive ride.",
        price: 134.99,
        images: placeholderSets[0],
        sizes: ["7", "8", "9", "10"],
        stock: 22
      },
      {
        name: "Heritage High",
        brand: "Exporium",
        category: "Lifestyle",
        description: "Classic high-top profile with premium comfort.",
        price: 179.99,
        images: placeholderSets[0],
        sizes: ["8", "9", "10", "11"],
        stock: 15
      },
      {
        name: "Velocity Max",
        brand: "Exporium",
        category: "Running",
        description: "Maximum cushion for long-distance miles.",
        price: 189.99,
        images: placeholderSets[0],
        sizes: ["7", "8", "9", "10", "11"],
        stock: 12
      },
      {
        name: "Minimal Mono",
        brand: "Exporium",
        category: "Lifestyle",
        description: "Monochrome design with refined details.",
        price: 124.99,
        images: placeholderSets[0],
        sizes: ["6", "7", "8", "9", "10", "11"],
        stock: 28
      }
    ];

    await Product.insertMany(products);
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete.");
  // eslint-disable-next-line no-console
  console.log(`Admin email: ${adminEmail}`);
  // eslint-disable-next-line no-console
  console.log(`Admin password: ${adminPassword}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
