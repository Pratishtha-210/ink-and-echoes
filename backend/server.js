import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'url';
import { fileURLToPath } from 'url';

// Configurations and Helpers
import { connectDB, isLocalFallback } from './config/db.js';
import { securityHeaders, apiLimiter } from './middleware/security.js';
import { dataService } from './models/dataService.js';
import User from './models/User.js';
import Poem from './models/Poem.js';
import Essay from './models/Essay.js';
import bcrypt from 'bcryptjs';
import { initialPoems } from './config/seedData.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import poemRoutes from './routes/poemRoutes.js';
import essayRoutes from './routes/essayRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
await connectDB();

// Middlewares
app.use(securityHeaders);
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // React default Vite dev server URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());
app.use(express.json());

// General API request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Seed function to ensure administrative setup and dummy portfolios on clean starts
const seedDatabase = async () => {
  try {
    const adminCount = await dataService.countDocuments(User, { role: 'admin' });
    if (adminCount === 0) {
      console.log('🌱 Database is empty. Seeding default administrator account...');
      const salt = await bcrypt.genSalt(12);
      const defaultPassword = 'adminpassword123';
      const passwordHash = await bcrypt.hash(defaultPassword, salt);
      
      await dataService.create(User, {
        username: 'admin',
        email: 'admin@inkandechoes.com',
        passwordHash,
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully.');
      console.log('---------------------------------------------');
      console.log('🔑 DEFAULT LOGIN CREDENTIALS:');
      console.log('   Email:    admin@inkandechoes.com');
      console.log('   Password: adminpassword123');
      console.log('---------------------------------------------');
    }

    const poemCount = await dataService.countDocuments(Poem);
    if (poemCount === 0) {
      console.log('🌱 Seeding initial poetry collection...');
      for (const p of initialPoems) {
        await dataService.create(Poem, p);
      }
      console.log('✅ Initial poetry collection seeded.');
    }

    const essayCount = await dataService.countDocuments(Essay);
    if (essayCount === 0) {
      console.log('🌱 Seeding initial essays & thoughts...');
      const initialEssays = [
        {
          title: "The Architecture of Solitude",
          content: `Solitude is not the absence of company, but the presence of self. In our modern, hyper-connected landscape, we have traded the quiet room of the mind for the loud market of notifications. \n\nWhen we write, we rebuild the walls of this inner chamber. We learn to listen to the echoes of our own questions. It is here, in the dim light of dark academia, that we find what we truly believe, away from the expectations of the screen.`,
          tags: ["Philosophy", "Writing", "Solitude"],
          views: 67,
          isFeatured: true,
          readingTime: 3
        },
        {
          title: "Why We Still Write on Paper",
          content: `There is a tactile resistance to paper that digital interfaces cannot match. The scratch of a fountain pen, the slight bleeding of black ink into fibers—it is a physical exchange. \n\nIn a world where everything can be deleted and rewritten in milliseconds, the permanence of ink forces deliberate thought. Every smudge is a history, every crossed-out line a confession.`,
          tags: ["Writings", "Tactile", "Artistry"],
          views: 48,
          isFeatured: false,
          readingTime: 2
        }
      ];

      for (const e of initialEssays) {
        await dataService.create(Essay, e);
      }
      console.log('✅ Initial essays seeded.');
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
};

await seedDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/poems', poemRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/contact', contactRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    databaseFallback: isLocalFallback
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong inside the echoes.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`📡 Ink & Echoes server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
