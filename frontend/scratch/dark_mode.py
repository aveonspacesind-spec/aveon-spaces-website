import re
import os

path = 'E:/WebDev Projects/Aveon Seating System/frontend/src/app/product/[id]/page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Base wrapper
content = content.replace('bg-white text-black font-sans selection:bg-brand-accent selection:text-white', 
                          'bg-[#0a0a0a] text-white font-sans selection:bg-brand-accent selection:text-white')

# Headings and Texts
content = content.replace('text-black', 'text-white')
content = content.replace('text-gray-900', 'text-gray-100')
content = content.replace('text-gray-800', 'text-gray-200')
content = content.replace('text-gray-600', 'text-gray-400')
content = content.replace('text-gray-500', 'text-gray-400')
content = content.replace('text-gray-700', 'text-gray-300')

# Specific Backgrounds
content = content.replace('bg-white/80', 'bg-black/80')
content = content.replace('bg-white px-4 py-2', 'bg-black px-4 py-2')
content = content.replace('bg-gray-50', 'bg-white/5')
content = content.replace('bg-gray-100/50', 'bg-black/50')
content = content.replace('bg-gray-100', 'bg-white/10')
content = content.replace('bg-gray-200', 'bg-white/10')

# Borders
content = content.replace('border-gray-200', 'border-white/10')
content = content.replace('border-gray-100', 'border-white/10')
content = content.replace('border-gray-300', 'border-white/20')

# Specific inverted buttons
# "Add to Cart" button: 'bg-black text-white hover:bg-gray-900'
content = content.replace('bg-black text-white hover:bg-gray-900', 'bg-white text-black hover:bg-gray-200')
# Hotspots: border-white
content = content.replace('border-4 border-white', 'border-4 border-black')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done replacing classes for dark mode")
