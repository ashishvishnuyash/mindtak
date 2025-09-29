import Link from 'next/link';
import { Brain } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

export default function Footer() {
  const { openContactModal } = useModal();
  return (
    <footer className="bg-green-600 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 mb-8">
          {/* Logo */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8" />
              <span className="text-2xl font-bold">Diltak.ai</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">Diltak AI</Link></li>
              <li><Link href="#" className="hover:underline">White Label</Link></li>
            </ul>
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
            </ul>
          </div>

          {/* Privacy & Compliance */}
          <div>
            <h4 className="font-semibold mb-4">Privacy & Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">DPDP Act</Link></li>
              <li><Link href="#" className="hover:underline">GDPR</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-500 pt-6 text-center text-gray-300 text-sm">
          © 2024 Diltak.ai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
