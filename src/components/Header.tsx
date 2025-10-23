import { Button } from "@/components/ui/button";
import { ChevronDown, Globe, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">Darwin AI</span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-smooth">
                Industrias <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover">
                <DropdownMenuItem>Finanzas</DropdownMenuItem>
                <DropdownMenuItem>Agricultura</DropdownMenuItem>
                <DropdownMenuItem>Retail</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-smooth">
                Empleados IA <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover">
                <DropdownMenuItem>Ventas</DropdownMenuItem>
                <DropdownMenuItem>Soporte</DropdownMenuItem>
                <DropdownMenuItem>Marketing</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#" className="text-sm text-foreground hover:text-primary transition-smooth">
              Nosotros
            </a>

            <a href="#" className="text-sm text-foreground hover:text-primary transition-smooth">
              Partners
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-smooth">
                Recursos <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover">
                <DropdownMenuItem>Blog</DropdownMenuItem>
                <DropdownMenuItem>Documentación</DropdownMenuItem>
                <DropdownMenuItem>Casos de Estudio</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
              <Globe className="w-4 h-4" />
              <span>ES</span>
            </button>

            <Button variant="outline" size="sm">
              Login
            </Button>

            <Button size="sm" className="gap-2">
              Prueba Darwin <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
