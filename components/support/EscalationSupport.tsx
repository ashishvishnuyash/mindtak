'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Eye, 
  EyeOff, 
  Send, 
  CheckCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

interface EscalationFormData {
  ticket_type: 'hr' | 'manager' | 'anonymous' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  category: 'workplace_harassment' | 'mental_health_crisis' | 'workload_concerns' | 'discrimination' | 'other';
  is_anonymous: boolean;
  confidential: boolean;
}

export default function EscalationSupport() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EscalationFormData>({
    ticket_type: 'hr',
    priority: 'medium',
    subject: '',
    description: '',
    category: 'other',
    is_anonymous: false,
    confidential: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/escalation/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.id,
          company_id: user.company_id,
          ...formData
        })
      });

      const result = await response.json();

      if (result.success) {
        setTicketId(result.ticket_id);
        setSubmitted(true);
        toast.success('Support ticket created successfully!');
      } else {
        toast.error(result.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('An error occurred while creating the ticket');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof EscalationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Ticket Submitted Successfully!
            </h2>
            
            <p className="text-green-700 mb-4">
              Your support request has been received and will be reviewed by our team.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-green-300 mb-4">
              <p className="text-sm text-gray-600 mb-2">Ticket ID:</p>
              <p className="font-mono text-lg font-bold text-gray-800">{ticketId}</p>
            </div>
            
            <div className="space-y-2 text-sm text-green-700">
              <p>• You will receive updates via email</p>
              <p>• Response time: {formData.priority === 'urgent' ? 'Within 2 hours' : 'Within 24 hours'}</p>
              <p>• All information is kept confidential</p>
            </div>
            
            <Button
              onClick={() => {
                setSubmitted(false);
                setTicketId(null);
                setFormData({
                  ticket_type: 'hr',
                  priority: 'medium',
                  subject: '',
                  description: '',
                  category: 'other',
                  is_anonymous: false,
                  confidential: false
                });
              }}
              className="mt-6"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Escalation & Support
        </h1>
        <p className="text-gray-600">
          Get help with workplace concerns, mental health support, or other issues
        </p>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">HR Support</h3>
            <p className="text-sm text-gray-600">General HR concerns and workplace issues</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manager Support</h3>
            <p className="text-sm text-gray-600">Direct manager assistance and guidance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <EyeOff className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Anonymous</h3>
            <p className="text-sm text-gray-600">Submit concerns without revealing identity</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Urgent</h3>
            <p className="text-sm text-gray-600">Critical issues requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Create Support Request</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticket_type">Support Type</Label>
                <Select
                  value={formData.ticket_type}
                  onValueChange={(value) => updateFormData('ticket_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select support type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR Support</SelectItem>
                    <SelectItem value="manager">Manager Support</SelectItem>
                    <SelectItem value="anonymous">Anonymous</SelectItem>
                    <SelectItem value="urgent">Urgent Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => updateFormData('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workplace_harassment">Workplace Harassment</SelectItem>
                  <SelectItem value="mental_health_crisis">Mental Health Crisis</SelectItem>
                  <SelectItem value="workload_concerns">Workload Concerns</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => updateFormData('subject', e.target.value)}
                placeholder="Brief description of your concern"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Please provide detailed information about your concern..."
                rows={6}
                required
              />
            </div>

            {/* Privacy Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={(e) => updateFormData('is_anonymous', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_anonymous" className="flex items-center space-x-2">
                  <EyeOff className="h-4 w-4" />
                  <span>Submit anonymously</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={formData.confidential}
                  onChange={(e) => updateFormData('confidential', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="confidential" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Mark as confidential</span>
                </Label>
              </div>
            </div>

            {/* Priority Alert */}
            {formData.priority === 'urgent' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Urgent Priority:</strong> This request will be escalated immediately and you should receive a response within 2 hours.
                </AlertDescription>
              </Alert>
            )}

            {/* Mental Health Crisis Alert */}
            {formData.category === 'mental_health_crisis' && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Mental Health Support:</strong> If you're experiencing a mental health crisis, please also consider reaching out to:
                  <br />• National Suicide Prevention Lifeline: 988
                  <br />• Crisis Text Line: Text HOME to 741741
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.subject || !formData.description}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Ticket...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Support Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Additional Support Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>Emergency: 911</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>HR Email: hr@company.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Business Hours: 9 AM - 5 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


