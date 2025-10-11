import Link from 'next/link';
import { Brain } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

export default function Footer() {
  const { openContactModal } = useModal();
  return (
    <footer className="bg-green-600 dark:bg-gray-800 text-white py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6 sm:gap-8 mb-8">
          {/* Logo */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8" />
              <span className="text-2xl font-bold">Diltak.ai</span>
            </div>
          </div>

          {/* Integration */}
          <div>
            <h4 className="font-semibold mb-4">Integration</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">HR Systems</Link></li>
              <li><Link href="#" className="hover:underline">Communication Tools</Link></li>
            </ul>
          </div>

          {/* Education */}
          <div>
            <h4 className="font-semibold mb-4">Education</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">Universities</Link></li>
              <li><Link href="#" className="hover:underline">Schools</Link></li>
            </ul>
          </div>

          {/* Healthcare */}
          <div>
            <h4 className="font-semibold mb-4">Healthcare</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">Hospitals</Link></li>
              <li><Link href="#" className="hover:underline">Clinics</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={openContactModal} className="hover:underline cursor-pointer">Technical Support</button></li>
              <li><button onClick={openContactModal} className="hover:underline cursor-pointer">Customer Success</button></li>
              <li><a href="mailto:info@diltak.ai" className="hover:underline">info@diltak.ai</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-500 dark:border-gray-600 pt-6 text-center text-gray-300 dark:text-gray-400 text-sm">
          © 2024 Diltak.ai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
