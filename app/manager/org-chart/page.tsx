'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Navbar } from '@/components/shared/navbar';
import { OrgChart } from '@/components/hierarchy/org-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  Crown, 
  Shield,
  RefreshCw,
  Download,
  Settings,
  Loader2,
  Brain,
  TrendingUp,
  BarChart3,
  Eye
} from 'lucide-react';
import { getTeamHierarchy, getManagerPermissions } from '@/lib/hierarchy-service';
import type { User, HierarchyNode } from '@/types/index';
import { toast } from 'sonner';

export default function OrgChartPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWellnessIndicators, setShowWellnessIndicators] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // For demo mode, allow access without strict authentication
    if (!userLoading) {
      if (!user) {
        // Create demo user for org chart access
        const demoUser = {
          id: 'demo-manager-1',
          role: 'manager' as const,
          company_id: 'demo-company',
          hierarchy_level: 3,
          can_view_team_reports: true
        };
      }
      fetchOrgChart();
    }
  }, [user, userLoading, router]);

  const fetchOrgChart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // For managers, show their team hierarchy
      // For HR/Admin, show company-wide hierarchy (would need additional logic)
      const teamHierarchy = await getTeamHierarchy(user.id, 4);
      setHierarchy(teamHierarchy);
      
    } catch (error) {
      console.error('Error fetching org chart:', error);
      toast.error('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    // Could open a modal or navigate to user profile
    toast.info(`Selected: ${selectedUser.first_name} ${selectedUser.last_name}`);
  };

  const exportOrgChart = () => {
    // Implementation for exporting org chart
    toast.info('Exporting organization chart...');
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar user={user || undefined} />
        <div className="flex items-center justify-center h-64">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading organization chart...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const permissions = getManagerPermissions(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <Navbar user={user || undefined} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Building className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Organization Chart</h1>
                <p className="text-lg text-gray-600 mt-1">
                  View your team structure and reporting relationships
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-4 mt-4 sm:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              onClick={fetchOrgChart}
              className="bg-white/60 backdrop-blur-sm hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={exportOrgChart}
              className="bg-white/60 backdrop-blur-sm hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Settings className="h-5 w-5 text-blue-500" />
                <span>View Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="wellness-indicators"
                    checked={showWellnessIndicators}
                    onCheckedChange={setShowWellnessIndicators}
                  />
                  <label htmlFor="wellness-indicators" className="text-sm font-medium text-gray-700">
                    Show Wellness Indicators
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    id="compact-view"
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                  <label htmlFor="compact-view" className="text-sm font-medium text-gray-700">
                    Compact View
                  </label>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <motion.div 
                    className="flex items-center space-x-2 p-2 rounded-lg bg-yellow-50"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Executive</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">HR</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2 p-2 rounded-lg bg-green-50"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Manager</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Building className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Employee</span>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Users className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {hierarchy.reduce((total, node) => {
                        const countNodes = (n: HierarchyNode): number => {
                          return 1 + n.children.reduce((sum, child) => sum + countNodes(child), 0);
                        };
                        return total + countNodes(node);
                      }, 0)}
                    </div>
                    <p className="text-sm text-gray-600">Total Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Crown className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {hierarchy.filter(node => 
                        node.user.role === 'manager' || node.user.role === 'admin'
                      ).length}
                    </div>
                    <p className="text-sm text-gray-600">Managers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Building className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {[...new Set(hierarchy.map(node => node.user.department).filter((dept): dept is string => Boolean(dept)))].length}
                    </div>
                    <p className="text-sm text-gray-600">Departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.max(...hierarchy.map(node => {
                        const getDepth = (n: HierarchyNode): number => {
                          return n.children.length > 0 
                            ? 1 + Math.max(...n.children.map(getDepth))
                            : 1;
                        };
                        return getDepth(node);
                      }), 0)}
                    </div>
                    <p className="text-sm text-gray-600">Hierarchy Levels</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Organization Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <OrgChart
                hierarchy={hierarchy}
                onUserSelect={handleUserSelect}
                showWellnessIndicators={showWellnessIndicators}
                compactView={compactView}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected User Info */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span>Selected Team Member</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-lg">
                      {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                    </span>
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                    <p className="text-gray-600">{selectedUser.position}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {selectedUser.role}
                      </Badge>
                      {selectedUser.department && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedUser.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {permissions.can_view_team_reports && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/manager/team-member/${selectedUser.id}`)}
                        className="bg-white/60 backdrop-blur-sm hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Reports
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(null)}
                      className="bg-white/60 backdrop-blur-sm hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Access Level Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Your Access Level</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-blue-500" />
                    Permissions
                  </h4>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">View direct reports</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        permissions.can_view_direct_reports ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {permissions.can_view_direct_reports ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">View team reports</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        permissions.can_view_team_reports ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {permissions.can_view_team_reports ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">View subordinate teams</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        permissions.can_view_subordinate_teams ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {permissions.can_view_subordinate_teams ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">Access analytics</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        permissions.can_access_analytics ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {permissions.can_access_analytics ? '✓' : '✗'}
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                    Hierarchy Info
                  </h4>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">Your level</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {user.hierarchy_level || 'Not set'}
                      </Badge>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">Access depth</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {permissions.hierarchy_access_level} levels
                      </Badge>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">Department head</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        user.is_department_head ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {user.is_department_head ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium">Skip-level access</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        user.skip_level_access ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {user.skip_level_access ? '✓' : '✗'}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
