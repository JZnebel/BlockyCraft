# BlocklyCraft Website

The official website for BlocklyCraft - a visual Minecraft modding tool for kids and classrooms.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Optional: Add OpenAI API key for voxel demo
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start dev server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables (Optional)

For the interactive voxel model demo to work with the "Live Demo" tab:

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key: `OPENAI_API_KEY=sk-...`
3. The demo includes rate limiting (3 requests/hour per IP)
4. If no API key is set, users can still use the "Free Option" tab (copy prompt to ChatGPT)

## 📁 Project Structure

```
my-astro-site/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navigation.astro # Top navigation bar
│   │   ├── Footer.astro     # Site footer
│   │   ├── Button.astro     # CTA buttons
│   │   ├── Card.astro       # Feature cards
│   │   └── Section.astro    # Page sections
│   ├── layouts/
│   │   └── Layout.astro     # Main layout wrapper
│   └── pages/
│       └── index.astro      # Homepage
├── public/                  # Static assets
└── tailwind.config.mjs      # Tailwind configuration
```

## 🎨 Design System

### Brand Colors
- **Aqua**: `#38E1F5` - Primary accents, CTAs
- **Teal**: `#00B497` - Secondary accents
- **Blue**: `#0072C6` - Headers, backgrounds
- **Orange**: `#FF9F2A` - Primary CTA buttons
- **Navy**: `#012033` - Text, contrast

### Typography
- **Display**: Poppins (headings)
- **Body**: Inter (body text)

### Components
All components use Tailwind CSS with consistent spacing, rounded corners (2xl, 3xl), and soft shadows.

## 📝 Content Sections

The homepage includes:
1. **Hero Section** - Main CTA and value proposition
2. **What is BlocklyCraft** - Feature overview
3. **Learning Through Play** - Educational benefits
4. **Mod Builder Features** - Core functionality
5. **AI Voxel Models** - Unique selling point
6. **For Kids** - Kid-focused benefits
7. **For Teachers** - Classroom use cases
8. **For Parents** - Parent concerns addressed
9. **How It Works** - 3-step process
10. **Download CTA** - System requirements
11. **Examples** - Project showcase

## 🔗 External Links

- Domain: [blocklycraft.com](https://blocklycraft.com)
- GitHub: [github.com/JZnebel/BlockyCraft](https://github.com/JZnebel/BlockyCraft)

## 📦 Next Steps

- [ ] Add real screenshots of BlocklyCraft app
- [ ] Copy logo from main project
- [ ] Create download pages for each platform
- [ ] Add examples gallery page
- [ ] Create teacher resources page
- [ ] Add documentation pages
- [ ] Set up analytics
- [ ] Configure sitemap
- [ ] Add meta tags for SEO

## 🛠️ Built With

- [Astro](https://astro.build/) v5.15.9 - Static site generator
- [Tailwind CSS](https://tailwindcss.com/) v3.0.24 - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) - Type safety
