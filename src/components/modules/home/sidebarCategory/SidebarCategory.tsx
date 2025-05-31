'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  Smartphone,
  Laptop,
  Printer,
  Home,
  Watch,
  Heart,
  Dumbbell,

  LucideIcon,
  Headphones,
  Volleyball,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'mobile': Smartphone,
  'laptop': Laptop,
  'phone': Package,
  'printers': Printer,
  'apps': Home,
  'electronics': Watch,
  'headset': Headphones,
  'sports': Volleyball,
  'juwelary': Heart,
  'training': Dumbbell,
  'default': Package,
};

interface Category {
  id: string;
  name: string;
}

// ✅ Static category list
const staticCategories: Category[] = [
  { id: '1', name: 'Mobile' },
  { id: '2', name: 'Laptop' },
  { id: '3', name: 'Printers' },
  { id: '4', name: 'Apps' },
  { id: '5', name: 'Electronics' },
  { id: '6', name: 'Headset' },
  { id: '7', name: 'Sports' },
  { id: '8', name: 'Juwelary' },
  { id: '9', name: 'Training' },
];

const CategorySidebar = () => {
  const getIcon = (categoryName: string): LucideIcon => {
    const key = categoryName.toLowerCase().replace(/[^a-z]/g, '');
    return iconMap[key] ?? iconMap['default'];
  };

  return (
    <aside className="w-44 bg-gradient-to-r from-blue-100 to-gray-50 rounded-tl-2xl">
      <h2 className="font-bold bg-[#35A09F] py-1.5 pl-1.5 rounded-tl-2xl text-white">CATEGORIES</h2>
      <ul className="py-2">
        {staticCategories.map((category) => {
          const IconComponent = getIcon(category.name);
          return (
            <li
              key={category.id}
              className="border-b border-gray-100 last:border-b-0 hover:scale-110 duration-700"
            >
              <Link
                href={`/category/${category.name}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-[#35A09F] group"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent
                    size={16}
                    className="text-gray-400 group-hover:text-emerald-500 flex-shrink-0"
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
