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
      background: "207 30% 96%",
      primary: "200 60% 32%",
    },
    dark: {
      background: "210 68% 8%",
      primary: "174 50% 55%",
    }
  },
  clay: {
    name: "Clay",
    emoji: "🏺",
    light: {
      background: "30 40% 96%",
      primary: "25 75% 47%",
    },
    dark: {
      background: "25 30% 12%",
      primary: "30 80% 55%",
    }
  },
  ocean: {
    name: "Ocean",
    emoji: "🌊",
    light: {
      background: "200 40% 96%",
      primary: "195 85% 41%",
    },
    dark: {
      background: "200 50% 8%",
      primary: "190 80% 50%",
    }
  },
  forest: {
    name: "Forest",
    emoji: "🌲",
    light: {
      background: "140 30% 96%",
      primary: "145 63% 32%",
    },
    dark: {
      background: "145 40% 8%",
      primary: "140 60% 45%",
    }
  },
  sunset: {
    name: "Sunset",
    emoji: "🌅",
    light: {
      background: "20 40% 96%",
      primary: "340 75% 55%",
    },
    dark: {
      background: "340 30% 10%",
      primary: "340 70% 60%",
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

    // Apply color scheme
    const colors = colorSchemes[scheme][newTheme];
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--primary", colors.primary);
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
