"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

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

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-[10px] left-0 right-0 z-50 transition-all duration-700 delay-500 header_bar ${
          isScrolled ? "header_bar_active" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <img src="/logo.png" alt="KratoLib" className="h-[2rem] max-w-full" />
              </Link>
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
                  <Link
                    href={link.href}
                    className={`${
                      pathname === link.href ||
                      (link.dropdown && link.dropdown.some((sub) => sub.href === pathname))
                        ? "text-violet-500"
                        : "text-white"
                    } hover:text-violet-500 transition-colors duration-200 flex items-center gap-1 py-4`}
                  >
                    {link.name}
                    {link.dropdown && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isDistributionOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {link.dropdown && (
                    <AnimatePresence>
                      {isDistributionOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 overflow-hidden"
                        >
                          <div className="grid gap-1">
                            {link.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`block p-3 rounded-lg hover:bg-white/5 transition-colors group ${
                                  pathname === subItem.href ? "bg-white/5" : ""
                                }`}
                              >
                                <div
                                  className={`text-sm font-medium transition-colors ${
                                    pathname === subItem.href
                                      ? "text-primary"
                                      : "text-white group-hover:text-primary"
                                  }`}
                                >
                                  {subItem.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Buttons - Desktop Right */}
            <div className="hidden md:flex md:items-center md:space-x-3 flex-shrink-0">
              <Link href="/contact">
                <Button size="default" className="animated-gradient-bg text-white transition-all duration-300">
                  Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 rounded-md text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} className="text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Left Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMenu}
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-[80vw] max-w-[320px] z-[70] bg-[#0d0d0d] border-r border-white/10 flex flex-col md:hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                <Link href="/" onClick={closeMenu}>
                  <img src="/logo.png" alt="KratoLib" className="h-7" />
                </Link>
                <button
                  onClick={closeMenu}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} className="text-white" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <div>
                        <button
                          onClick={() => setIsMobileDistributionOpen(!isMobileDistributionOpen)}
                          className={`flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            link.dropdown.some((sub) => sub.href === pathname)
                              ? "text-violet-400 bg-violet-500/10"
                              : "text-white/80 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {link.name}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isMobileDistributionOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isMobileDistributionOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-4 mt-1 space-y-1"
                            >
                              {link.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={closeMenu}
                                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    pathname === subItem.href
                                      ? "text-violet-400 font-semibold bg-violet-500/10"
                                      : "text-white/60 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={`block px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          pathname === link.href
                            ? "text-violet-400 bg-violet-500/10 font-semibold"
                            : "text-white/80 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Drawer Footer CTA */}
              <div className="px-4 pb-8 pt-4 border-t border-white/10">
                <Link href="/contact" onClick={closeMenu} className="block">
                  <Button className="w-full animated-gradient-bg text-white font-semibold">
                    Get Started <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
