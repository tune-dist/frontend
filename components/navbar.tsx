"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ArrowRight, Music2, Users2, TrendingUp, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);
  const [isMobileDistributionOpen, setIsMobileDistributionOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    {
      name: "Distribution",
      href: "#",
      dropdown: [
        { name: "Smart Music", href: "/smart-music" },
        { name: "Royalty Splits", href: "/royalty-splits" },
        { name: "Sell & Grow", href: "/sell-and-grow" },
      ],
    },
    { name: "Pricing", href: "/pricing" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-[10px] left-0 right-0 z-50 transition-all duration-300 header_bar ${isScrolled
        ? "header_bar_active"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/">
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
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown && setIsDistributionOpen(true)}
                onMouseLeave={() => link.dropdown && setIsDistributionOpen(false)}
              >
                <a
                  href={link.href}
                  className={`${pathname === link.href || (link.dropdown && link.dropdown.some(sub => sub.href === pathname))
                    ? "text-violet-500"
                    : "text-white"
                    } hover:text-violet-500 transition-colors duration-200 flex items-center gap-1 py-4`}
                >
                  {link.name}
                  {link.dropdown && (
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDistributionOpen ? 'rotate-180' : ''}`} />
                  )}
                </a>

                {link.dropdown && (
                  <AnimatePresence>
                    {isDistributionOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/1 -translate-x-1/2 top-full w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 overflow-hidden"
                      >
                        <div className="grid gap-1">
                          {link.dropdown.map((subItem) => (
                            <a
                              key={subItem.name}
                              href={subItem.href}
                              className={`block p-3 rounded-lg hover:bg-white/5 transition-colors group ${pathname === subItem.href ? "bg-white/5" : ""
                                }`}
                            >
                              <div className={`text-sm font-medium transition-colors ${pathname === subItem.href ? "text-primary" : "text-white group-hover:text-primary"
                                }`}>
                                {subItem.name}
                              </div>
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
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
              <Button size="default" className="animated-gradient-bg text-white transition-all duration-300">
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-1" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-foreground hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden py-4 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl absolute left-0 right-0 top-full px-4"
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => setIsMobileDistributionOpen(!isMobileDistributionOpen)}
                          className="flex items-center justify-between w-full text-foreground/80 hover:text-primary p-2 transition-colors"
                        >
                          {link.name}
                          <ChevronDown className={`h-4 w-4 transition-transform ${isMobileDistributionOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isMobileDistributionOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-4 space-y-1"
                            >
                              {link.dropdown.map((subItem) => (
                                <a
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`block p-2 text-sm transition-colors ${pathname === subItem.href ? "text-primary font-semibold" : "text-foreground/60 hover:text-primary"
                                    }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.name}
                                </a>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <a
                        href={link.href}
                        className={`block p-2 transition-colors ${pathname === link.href ? "text-primary font-semibold" : "text-foreground/80 hover:text-primary"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </a>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <a href="/auth?tab=login" className="w-full block">
                    <Button variant="outline" className="w-full border-white/10">
                      Login
                    </Button>
                  </a>
                  <a href="/auth?tab=signup" className="w-full block">
                    <Button className="w-full animated-gradient-bg">Get Started</Button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
