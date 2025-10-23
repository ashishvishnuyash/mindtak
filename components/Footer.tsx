import Link from 'next/link';
import { Brain } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

export default function Footer() {
  const { openContactModal } = useModal();
  return (
    <footer className="bg-green-600 dark:bg-gray-800 text-white py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Logo */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xl sm:text-2xl font-bold">Diltak.ai</span>
            </div>
          </div>

          {/* Integration */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Integration</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li><Link href="#" className="hover:underline transition-colors">HR Systems</Link></li>
              <li><Link href="#" className="hover:underline transition-colors">Communication Tools</Link></li>
              <li><Link href="#" className="hover:underline transition-colors">Universities</Link></li>
              <li><Link href="#" className="hover:underline transition-colors">Schools</Link></li>
              <li><Link href="#" className="hover:underline transition-colors">Hospitals</Link></li>
              <li><Link href="#" className="hover:underline transition-colors">Clinics</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Contact</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li><button onClick={openContactModal} className="hover:underline cursor-pointer transition-colors text-left">Technical Support</button></li>
              <li><button onClick={openContactModal} className="hover:underline cursor-pointer transition-colors text-left">Customer Success</button></li>
              <li><a href="mailto:info@diltak.ai" className="hover:underline transition-colors">Email Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-500 dark:border-gray-600 pt-4 sm:pt-6 text-center text-gray-300 dark:text-gray-400 text-xs sm:text-sm">
          © 2024 Diltak.ai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
