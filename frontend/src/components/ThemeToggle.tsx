import { Moon, Sun, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type ColorScheme = "default" | "clay" | "ocean" | "forest" | "sunset";

const colorSchemes = {
  default: {
    name: "Default",
    emoji: "🎨",
    light: {
      background: "210 40% 98%",
      foreground: "222.2 84% 4.9%",
      primary: "221.2 83.2% 53.3%",
      secondary: "210 40% 96.1%",
      accent: "210 40% 96.1%",
      muted: "210 40% 96.1%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      primary: "217.2 91.2% 59.8%",
      secondary: "217.2 32.6% 17.5%",
      accent: "217.2 32.6% 17.5%",
      muted: "217.2 32.6% 17.5%",
    }
  },
  clay: {
    name: "Clay",
    emoji: "🏺",
    light: {
      background: "30 40% 98%",
      foreground: "20 14.3% 4.1%",
      primary: "24.6 95% 53.1%",
      secondary: "30 40% 96.1%",
      accent: "30 40% 96.1%",
      muted: "30 40% 96.1%",
    },
    dark: {
      background: "20 14.3% 4.1%",
      foreground: "30 40% 98%",
      primary: "20.5 90.2% 48.2%",
      secondary: "12 6.5% 15.1%",
      accent: "12 6.5% 15.1%",
      muted: "12 6.5% 15.1%",
    }
  },
  ocean: {
    name: "Ocean",
    emoji: "🌊",
    light: {
      background: "200 40% 98%",
      foreground: "200 50% 10%",
      primary: "199 89% 48%",
      secondary: "200 40% 96.1%",
      accent: "200 40% 96.1%",
      muted: "200 40% 96.1%",
    },
    dark: {
      background: "200 50% 10%",
      foreground: "200 40% 98%",
      primary: "198 93% 60%",
      secondary: "200 50% 15%",
      accent: "200 50% 15%",
      muted: "200 50% 15%",
    }
  },
  forest: {
    name: "Forest",
    emoji: "🌲",
    light: {
      background: "140 30% 98%",
      foreground: "140 50% 10%",
      primary: "142 71% 45%",
      secondary: "140 30% 96.1%",
      accent: "140 30% 96.1%",
      muted: "140 30% 96.1%",
    },
    dark: {
      background: "140 50% 10%",
      foreground: "140 30% 98%",
      primary: "142 76% 36%",
      secondary: "140 50% 15%",
      accent: "140 50% 15%",
      muted: "140 50% 15%",
    }
  },
  sunset: {
    name: "Sunset",
    emoji: "🌅",
    light: {
      background: "20 40% 98%",
      foreground: "340 50% 10%",
      primary: "346 77% 50%",
      secondary: "20 40% 96.1%",
      accent: "20 40% 96.1%",
      muted: "20 40% 96.1%",
    },
    dark: {
      background: "340 50% 10%",
      foreground: "20 40% 98%",
      primary: "346 83% 47%",
      secondary: "340 50% 15%",
      accent: "340 50% 15%",
      muted: "340 50% 15%",
    }
  }
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedScheme = localStorage.getItem("colorScheme") as ColorScheme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    
    const initialTheme = savedTheme || systemTheme;
    const initialScheme = savedScheme || "default";
    
    setTheme(initialTheme);
    setColorScheme(initialScheme);
    applyTheme(initialTheme, initialScheme);
  }, []);

  const applyTheme = (newTheme: Theme, scheme: ColorScheme) => {
    const root = document.documentElement;
    
    // Apply dark/light mode
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply color scheme - update all CSS variables
    const colors = colorSchemes[scheme][newTheme];
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--muted", colors.muted);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme, colorScheme);
  };

  const changeColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    localStorage.setItem("colorScheme", scheme);
    applyTheme(theme, scheme);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="transition-transform hover:scale-110"
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="transition-transform hover:scale-110"
            title="Change color scheme"
          >
            <Palette className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(colorSchemes).map(([key, scheme]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => changeColorScheme(key as ColorScheme)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{scheme.emoji}</span>
                <span>{scheme.name}</span>
              </span>
              {colorScheme === key && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
