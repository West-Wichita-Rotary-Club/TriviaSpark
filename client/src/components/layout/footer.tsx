import { Brain } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 wine-gradient rounded-lg flex items-center justify-center mr-3">
                <Brain className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary" data-testid="text-footer-title">
                  TriviaSpark
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-footer-tagline">
                  A WebSpark Solution
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4" data-testid="text-footer-description">
              Where Every Event Becomes Unforgettable. Create intelligent, immersive trivia
              experiences that transform any gathering into lasting memories.
            </p>
            <p className="text-sm text-muted-foreground" data-testid="text-footer-credit">
              Created by Mark Hazleton • © 2025 Mark Hazleton
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-platform-title">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  data-testid="link-features"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  data-testid="link-pricing"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/api-docs"
                  className="hover:text-primary transition-colors"
                  data-testid="link-api-docs"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  data-testid="link-templates"
                >
                  Templates
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-support-title">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  data-testid="link-help"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  data-testid="link-contact"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  data-testid="link-community"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  data-testid="link-status"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
