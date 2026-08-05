import Link from 'next/link';
import { Video, Github, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Start Chatting', href: '/chat' },
        { label: 'Premium', href: '/premium' },
        { label: 'Features', href: '/#features' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/5 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AHHHMETV</span>
            </Link>
            <p className="text-sm text-muted mb-4 max-w-xs">
              Connect with people from around the world through instant random video chat.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg glass-hover flex items-center justify-center text-muted hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg glass-hover flex items-center justify-center text-muted hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted hover:text-white transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-dark">
            &copy; {currentYear} AHHHMETV. All rights reserved.
          </p>
          <p className="text-xs text-muted-dark flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-danger fill-danger" /> for global friendships
          </p>
        </div>
      </div>
    </footer>
  );
}
