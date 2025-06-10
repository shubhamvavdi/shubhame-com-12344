import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

interface HeaderProps {
  onAuthClick: () => void;
  onSearch: (query: string) => void;
}

export function Header({ onAuthClick, onSearch }: HeaderProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { itemCount, toggleCart } = useCart();

  const categories = [
    "Electronics",
    "Fashion", 
    "Home & Garden",
    "Sports",
    "Books",
    "Beauty"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="text-2xl font-bold text-primary cursor-pointer">
                EcommercePro
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onAuthClick}
              className="hidden md:flex items-center text-gray-700 hover:text-primary"
            >
              <User className="w-4 h-4 mr-1" />
              <span>{isLoggedIn ? user?.username : "Login"}</span>
            </Button>

            <Button
              variant="ghost"
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-primary"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 flex items-center justify-center p-0">
                  {itemCount}
                </Badge>
              )}
            </Button>

            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-3">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/?category=${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              >
                <a className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-primary cursor-pointer">
                  {category}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>
            
            <Button
              variant="ghost"
              onClick={onAuthClick}
              className="w-full justify-start"
            >
              <User className="w-4 h-4 mr-2" />
              {isLoggedIn ? user?.username : "Login"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
