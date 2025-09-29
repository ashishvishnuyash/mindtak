# Task: Add Curated Mental Health & Well-Being Resources Section

## Steps to Complete:

1. [ ] Update app/page.tsx: Add import for ExternalLink from 'lucide-react' (for site links in cards).
2. [ ] Update app/page.tsx: Insert new section after the closing </section> of the Solutions section (id="about"), before the FAQ section.
   - Section: id="resources", className="py-20 bg-white" for contrast.
   - Header: Centered h2 "Curated Mental Health & Well-Being Resources", p "Discover trusted platforms for personal growth and support, complementing Diltak.ai's enterprise solutions."
   - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8, max-w-7xl mx-auto px-4 sm:px-6 lg:px-8.
   - 4 Cards: bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow rounded-lg.
     - Each Card: Header with icon in w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 (icon text-green-600 h-6 w-6).
     - CardTitle: text-2xl font-bold text-gray-900 mb-2.
     - CardContent: space-y-4.
       - Description p: text-gray-600 leading-relaxed.
       - Link: Button variant="outline" border-green-600 text-green-600 hover:bg-green-600 hover:text-white, with ExternalLink icon.
3. [ ] Ensure layout fits: Use existing Card, CardHeader, CardTitle, CardContent components.
4. [ ] Update TODO.md: Mark step 1 as [x] after import addition.
5. [ ] Update TODO.md: Mark step 2 as [x] after inserting section.
6. [ ] Update TODO.md: Mark step 3 as [x] after verification.

## Follow-up:
- Run `npm run dev` to preview the changes.
- Test responsiveness on different screen sizes.
- Use browser_action to launch http://localhost:3000 and verify the new section renders correctly with luxurious layout.
- Confirm links open external sites.
