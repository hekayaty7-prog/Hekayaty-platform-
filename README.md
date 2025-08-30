# HEKAYATY Platform 🏰📚

A comprehensive fantasy story publishing and reading platform that allows users to discover, read, and publish stories and comics.

**Live Site:** https://hekayaty-platforms.vercel.app

## 🌟 Features

### For Readers
- **Multi-format Content**: Read stories in text, PDF, audio, and image formats
- **Genre-based Discovery**: Browse Adventure, Romance, Sci-Fi, and Writer's Gems
- **Chapter Navigation**: Sequential reading with bookmarking
- **Premium Content**: VIB subscription for exclusive stories
- **Community Features**: Join clubs and workshops
- **Character Database**: Explore detailed character profiles

### For Authors
- **Story Publishing**: Multi-chapter story creation with rich media support
- **Comic Publishing**: PDF-based comic creation and publishing
- **TaleCraft System**: Advanced publishing with placement categories
- **Analytics**: Track story performance and reader engagement
- **Collaboration**: Work with other authors in workshops

### For Admins
- **Content Moderation**: Approve/reject submissions
- **User Management**: Manage subscribers and authors
- **Analytics Dashboard**: Monitor platform metrics
- **Security Monitoring**: Track suspicious activity
- **Subscription Management**: Handle VIB codes and renewals

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth with JWT
- **File Storage**: Cloudinary
- **Deployment**: Vercel-ready

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/hekayaty7-prog/Hekayaty-platform-.git
cd Hekayaty-platform-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see DEPLOYMENT.md)

4. Run database migrations:
```bash
npm run db:push
```

5. Start development servers:
```bash
npm run dev
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   └── lib/           # Utilities and API clients
├── server/                # Express.js backend
│   ├── routes.ts          # API routes
│   ├── supabase-*.ts      # Database operations
│   └── security-*.ts      # Security middleware
├── shared/                # Shared types and schemas
└── migrations/            # Database migrations
```

## 🔐 Security Features

- Comprehensive security middleware stack
- Rate limiting and IP monitoring
- Honeypots for malicious actor detection
- Audit logging for all operations
- Input validation with Zod schemas
- JWT-based authentication

## 🎯 Key User Journeys

1. **New Reader**: Register → Browse genres → Read stories → Subscribe for premium
2. **Author**: Login → Publish story → Upload chapters → Track analytics
3. **Admin**: Monitor dashboard → Review submissions → Manage users

## 📊 Database Schema

Key entities:
- **Users**: Authentication and profiles
- **Stories**: Multi-chapter stories with metadata
- **Comics**: Visual content with PDF support
- **Projects**: TaleCraft publishing system
- **Community**: Clubs, workshops, ratings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For deployment or technical issues, refer to the DEPLOYMENT.md guide or create an issue in the repository.
