import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { CartDrawer } from "@/components/cart-drawer";
import { AuthModal } from "@/components/auth-modal";
import { ProductModal } from "@/components/product-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithCategory } from "@shared/schema";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState<string>("");
  const [sortBy, setSortBy] = useState("featured");
  
  const { user } = useAuth();
  const { addItem, setItems } = useCart();
  const { toast } = useToast();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { search: searchQuery, categoryId: selectedCategory }],
    queryFn: () => api.getProducts({ 
      search: searchQuery, 
      categoryId: selectedCategory,
      limit: 20 
    }),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  // Fetch cart items if user is logged in
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart", user?.id],
    queryFn: () => user ? api.getCartItems(user.id) : [],
    enabled: !!user,
  });

  useEffect(() => {
    if (cartItems.length > 0) {
      setItems(cartItems);
    }
  }, [cartItems, setItems]);

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const cartItem = await api.addToCart({
        userId: user.id,
        productId,
        quantity,
      });

      const product = products.find(p => p.id === productId);
      if (product) {
        addItem({
          ...cartItem,
          product,
        });
      }

      toast({
        title: "Success",
        description: "Product added to cart!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredProducts = products.filter(product => {
    if (priceRange) {
      const price = parseFloat(product.salePrice || product.price);
      switch (priceRange) {
        case "under-25":
          return price < 25;
        case "25-50":
          return price >= 25 && price <= 50;
        case "50-100":
          return price >= 50 && price <= 100;
        case "over-100":
          return price > 100;
        default:
          return true;
      }
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.salePrice || a.price) - parseFloat(b.salePrice || b.price);
      case "price-high":
        return parseFloat(b.salePrice || b.price) - parseFloat(a.salePrice || a.price);
      case "rating":
        return parseFloat(b.rating ?? "0") - parseFloat(a.rating ?? "0");
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return b.featured ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} onSearch={handleSearch} />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-primary to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-8 items-center w-full">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Shop the Latest
                <span className="text-accent ml-2">Trends</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Discover amazing products with unbeatable prices and fast delivery
              </p>
              <Button className="bg-accent hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Shop Now
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                  <img 
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                    alt="Latest Smartphones" 
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm font-medium">Latest Smartphones</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                  <img 
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                    alt="Fashion Trends" 
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm font-medium">Fashion Trends</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <Select
                  value={selectedCategory?.toString() || "all"}
                  onValueChange={(value) => setSelectedCategory(value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { value: "under-25", label: "Under $25" },
                    { value: "25-50", label: "$25 - $50" },
                    { value: "50-100", label: "$50 - $100" },
                    { value: "over-100", label: "Over $100" },
                  ].map((range) => (
                    <div key={range.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={range.value}
                        checked={priceRange === range.value}
                        onCheckedChange={(checked) => 
                          setPriceRange(checked ? range.value : "")
                        }
                      />
                      <Label htmlFor={range.value} className="text-sm">
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          
          {/* Product Grid */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            {/* Sort and View Options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {sortedProducts.length} Products found
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Sort by: Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(productId) => handleAddToCart(productId)}
                    onProductClick={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals and Drawers */}
      <CartDrawer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
