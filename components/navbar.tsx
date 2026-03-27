"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

import { ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Smart Music", href: "/smart-music" },
    { name: "Royalty Splits", href: "/royalty-splits" },
    { name: "Sell & Grow", href: "/sell-and-grow" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300  border-b border-white/5 ${isScrolled
        ? "bg-background/80 backdrop-blur-lg border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-011">
            <a href="#home">
              <img
                src="/logo.png"
                alt="KratoLib"
                className="h-[2rem] max-w-100%"
              />
            </a>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex md:items-center md:justify-center md:space-x-8 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth Buttons - Right */}
          <div className="hidden md:flex md:items-center md:space-x-3 flex-shrink-0">
            <a href="/auth?tab=login">
              <Button variant="outline" size="default" className="border border-white/10">
                Login
              </Button>
            </a>
            <a href="/auth?tab=signup">
              <Button size="default" className="animated-gradient-bg text-white">Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-foreground hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-foreground/80 hover:text-primary transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              <a href="/auth?tab=login" className="w-full block">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </a>
              <a href="/auth?tab=signup" className="w-full mt-2 block">
                <Button className="w-full">Get Started</Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
