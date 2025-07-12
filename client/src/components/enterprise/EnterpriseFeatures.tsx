import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Shield, 
  Users, 
  Globe,
  Lock,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Settings,
  Crown,
  Zap,
  BarChart3,
  Database,
  Network,
  Activity
} from 'lucide-react';

interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  users: number;
  maxUsers: number;
  features: string[];
  compliance: {
    gdpr: boolean;
    soc2: boolean;
    hipaa: boolean;
    iso27001: boolean;
  };
  usage: {
    apiCalls: number;
    storage: number;
    bandwidth: number;
  };
  limits: {
    apiCalls: number;
    storage: number;
    bandwidth: number;
  };
}

interface ComplianceReport {
  id: string;
  type: 'audit' | 'security' | 'privacy' | 'compliance';
  title: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastRun: Date;
  nextDue: Date;
}

export default function EnterpriseFeatures() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'compliance' | 'analytics'>('overview');
  const [tenants, setTenants] = useState<TenantConfig[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEnterpriseData();
  }, []);

  const loadEnterpriseData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate loading tenant data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTenants: TenantConfig[] = [
        {
          id: '1',
          name: 'Acme Corporation',
          domain: 'acme.example.com',
          plan: 'enterprise',
          users: 150,
          maxUsers: 500,
          features: ['sso', 'audit-logs', 'custom-branding', 'api-access', 'priority-support'],
          compliance: { gdpr: true, soc2: true, hipaa: false, iso27001: true },
          usage: { apiCalls: 45000, storage: 2400, bandwidth: 1200 },
          limits: { apiCalls: 100000, storage: 10000, bandwidth: 5000 }
        },
        {
          id: '2',
          name: 'TechStart Inc',
          domain: 'techstart.example.com',
          plan: 'professional',
          users: 25,
          maxUsers: 100,
          features: ['team-collaboration', 'advanced-analytics', 'api-access'],
          compliance: { gdpr: true, soc2: false, hipaa: false, iso27001: false },
          usage: { apiCalls: 12000, storage: 450, bandwidth: 280 },
          limits: { apiCalls: 50000, storage: 2000, bandwidth: 1000 }
        },
        {
          id: '3',
          name: 'Healthcare Solutions',
          domain: 'healthsol.example.com',
          plan: 'enterprise',
          users: 85,
          maxUsers: 200,
          features: ['hipaa-compliance', 'encryption', 'audit-logs', 'dedicated-support'],
          compliance: { gdpr: true, soc2: true, hipaa: true, iso27001: true },
          usage: { apiCalls: 28000, storage: 1800, bandwidth: 750 },
          limits: { apiCalls: 75000, storage: 5000, bandwidth: 2500 }
        }
      ];
      
      const mockReports: ComplianceReport[] = [
        {
          id: '1',
          type: 'security',
          title: 'Security Audit Q4 2024',
          status: 'passed',
          score: 94,
          findings: { critical: 0, high: 1, medium: 3, low: 8 },
          lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextDue: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          type: 'compliance',
          title: 'GDPR Compliance Check',
          status: 'passed',
          score: 98,
          findings: { critical: 0, high: 0, medium: 1, low: 2 },
          lastRun: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          nextDue: new Date(Date.now() + 78 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'privacy',
          title: 'Data Privacy Assessment',
          status: 'warning',
          score: 87,
          findings: { critical: 0, high: 2, medium: 5, low: 12 },
          lastRun: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          nextDue: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
        }
      ];
      
      setTenants(mockTenants);
      setComplianceReports(mockReports);
    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'starter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const totalTenants = tenants.length;
  const totalUsers = tenants.reduce((sum, tenant) => sum + tenant.users, 0);
  const enterpriseClients = tenants.filter(t => t.plan === 'enterprise').length;
  const averageCompliance = Math.round(
    complianceReports.reduce((sum, report) => sum + report.score, 0) / complianceReports.length
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold">{totalTenants}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enterprise Clients</p>
                <p className="text-2xl font-bold">{enterpriseClients}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold">{averageCompliance}%</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resource Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.slice(0, 3).map((tenant) => (
                <div key={tenant.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tenant.name}</span>
                    <Badge className={getPlanColor(tenant.plan)}>
                      {tenant.plan}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>API Calls</span>
                      <span>{tenant.usage.apiCalls.toLocaleString()} / {tenant.limits.apiCalls.toLocaleString()}</span>
                    </div>
                    <Progress value={(tenant.usage.apiCalls / tenant.limits.apiCalls) * 100} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(report.status)}
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-gray-600">
                        Last run: {report.lastRun.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getStatusColor(report.status)}`}>
                      {report.score}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {report.findings.critical + report.findings.high + report.findings.medium + report.findings.low} findings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTenants = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tenant Management</h3>
        <Button className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Add Tenant
        </Button>
      </div>
      
      <div className="space-y-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{tenant.name}</CardTitle>
                  <p className="text-sm text-gray-600">{tenant.domain}</p>
                </div>
                <Badge className={getPlanColor(tenant.plan)}>
                  {tenant.plan}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Users & Limits</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Active Users</span>
                      <span>{tenant.users} / {tenant.maxUsers}</span>
                    </div>
                    <Progress value={(tenant.users / tenant.maxUsers) * 100} />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Resource Usage</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>API Calls</span>
                      <span>{tenant.usage.apiCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Storage (GB)</span>
                      <span>{tenant.usage.storage}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Bandwidth (GB)</span>
                      <span>{tenant.usage.bandwidth}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Compliance</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tenant.compliance.gdpr ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">GDPR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tenant.compliance.soc2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">SOC 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tenant.compliance.hipaa ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">HIPAA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tenant.compliance.iso27001 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">ISO 27001</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Features</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tenant.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Compliance Management</h3>
        <Button className="flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Run Audit
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Passed Audits</p>
                <p className="text-2xl font-bold text-green-600">
                  {complianceReports.filter(r => r.status === 'passed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {complianceReports.filter(r => r.status === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Audits</p>
                <p className="text-2xl font-bold text-red-600">
                  {complianceReports.filter(r => r.status === 'failed').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{averageCompliance}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        {complianceReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(report.status)}
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-gray-600 capitalize">{report.type} audit</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getStatusColor(report.status)}`}>
                    {report.score}%
                  </div>
                  <Badge variant={report.status === 'passed' ? 'default' : report.status === 'warning' ? 'secondary' : 'destructive'}>
                    {report.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Findings Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-600">Critical</span>
                      <span className="font-medium">{report.findings.critical}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-600">High</span>
                      <span className="font-medium">{report.findings.high}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-600">Medium</span>
                      <span className="font-medium">{report.findings.medium}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600">Low</span>
                      <span className="font-medium">{report.findings.low}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Run</span>
                      <span>{report.lastRun.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Next Due</span>
                      <span>{report.nextDue.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Frequency</span>
                      <span>Quarterly</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Enterprise Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue (Monthly)</p>
                <p className="text-2xl font-bold">$45,200</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold">2.3%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Support Tickets</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Advanced analytics dashboard coming soon</p>
        <p className="text-sm">Real-time metrics, custom reports, and predictive insights</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enterprise Features</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'tenants' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tenants')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Tenants
          </Button>
          <Button
            variant={activeTab === 'compliance' ? 'default' : 'outline'}
            onClick={() => setActiveTab('compliance')}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Compliance
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'tenants' && renderTenants()}
          {activeTab === 'compliance' && renderCompliance()}
          {activeTab === 'analytics' && renderAnalytics()}
        </>
      )}
    </div>
  );
}