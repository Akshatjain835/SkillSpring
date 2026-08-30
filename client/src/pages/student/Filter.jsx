import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Filter as FilterIcon, RotateCcw } from "lucide-react";
import React, { useState } from "react";

const categories = [
  { id: "nextjs", label: "Next JS" },
  { id: "data science", label: "Data Science" },
  { id: "frontend development", label: "Frontend Development" },
  { id: "fullstack development", label: "Fullstack Development" },
  { id: "mern stack development", label: "MERN Stack Development" },
  { id: "backend development", label: "Backend Development" },
  { id: "javascript", label: "Javascript" },
  { id: "python", label: "Python" },
  { id: "docker", label: "Docker" },
  { id: "mongodb", label: "MongoDB" },
  { id: "html", label: "HTML" },
];

function Filter({ handleFilterChange }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const handleCategoryChange = (getcategory) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(getcategory)
        ? prevCategories.filter((category) => category !== getcategory)
        : [...prevCategories, getcategory];

      handleFilterChange(newCategories, sortByPrice);
      return newCategories;
    });
  };

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortByPrice("");
    handleFilterChange([], "");
  };

  return (
    <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-blue-600 dark:text-blue-400" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Filters</h2>
        </div>
        {(selectedCategories.length > 0 || sortByPrice) && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-slate-500 hover:text-red-600 gap-1 px-2"
          >
            <RotateCcw size={12} />
            Reset
          </Button>
        )}
      </div>

      {/* Sort Option */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Sort By Price
        </Label>
        <Select value={sortByPrice} onValueChange={selectByPriceHandler}>
          <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-800 text-xs">
            <SelectValue placeholder="Featured / Any" />
          </SelectTrigger>
          <SelectContent className="z-50 rounded-xl">
            <SelectGroup>
              <SelectLabel className="text-xs">Price Order</SelectLabel>
              <SelectItem value="low" className="text-xs">Price: Low to High</SelectItem>
              <SelectItem value="high" className="text-xs">Price: High to Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Categories
        </Label>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2.5">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.label)}
                onCheckedChange={() => handleCategoryChange(category.label)}
                className="rounded-md border-slate-300 dark:border-slate-700"
              />
              <Label
                htmlFor={category.id}
                className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Filter;

