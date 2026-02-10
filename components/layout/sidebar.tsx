'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, LayoutGrid, Settings, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Calendar', href: '/', icon: Calendar },
  { name: 'Categories Board', href: '/categories', icon: Layers },
  { name: 'Status Board', href: '/status', icon: LayoutGrid },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <nav className="flex flex-col h-full p-4 space-y-2">
        <div className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="px-4 text-xs text-gray-500 dark:text-gray-400">
            Version 1.0
          </p>
        </div>
      </nav>
    </aside>
  )
}
