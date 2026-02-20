import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';

const ConversationAnalytics = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Mock data for initial development
  const mockData = {
    overview: {
      totalConversations: 396,
      avgQualityScore: 5.2,
      avgAuthenticityScore: 7.1,
      completionRate: 45,
      improvementVsBaseline: 12
    },
    alerts: [
      {
        id: 1,
        severity: 'warning',
        metric: 'Authenticity Score',
        value: 6.8,
        threshold: 7.0,
        date: '2025-02-18'
      }
    ],
    trendsData: [
      { date: 'Feb 12', quality: 4.8, completion: 42, authenticity: 7.2, reflection: 32 },
      { date: 'Feb 13', quality: 5.1, completion: 44, authenticity: 7.0, reflection: 35 },
      { date: 'Feb 14', quality: 5.0, completion: 43, authenticity: 6.9, reflection: 33 },
      { date: 'Feb 15', quality: 5.3, completion: 46, authenticity: 7.1, reflection: 37 },
      { date: 'Feb 16', quality: 5.2, completion: 45, authenticity: 7.0, reflection: 35 },
      { date: 'Feb 17', quality: 5.4, completion: 47, authenticity: 7.2, reflection: 38 },
      { date: 'Feb 18', quality: 5.2, completion: 45, authenticity: 7.1, reflection: 35 }
    ],
    complianceData: [
      { date: 'Feb 12', messageLength: 71, singleQuestion: 65, coverage: 89, inOrder: 82 },
      { date: 'Feb 13', messageLength: 73, singleQuestion: 68, coverage: 92, inOrder: 85 },
      { date: 'Feb 14', messageLength: 72, singleQuestion: 67, coverage: 91, inOrder: 83 },
      { date: 'Feb 15', messageLength: 74, singleQuestion: 69, coverage: 93, inOrder: 86 },
      { date: 'Feb 16', messageLength: 73, singleQuestion: 68, coverage: 92, inOrder: 85 },
      { date: 'Feb 17', messageLength: 75, singleQuestion: 70, coverage: 94, inOrder: 87 },
      { date: 'Feb 18', messageLength: 73, singleQuestion: 68, coverage: 92, inOrder: 85 }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (value, type) => {
    if (type === 'score') {
      return value >= 7 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-red-500';
    }
    if (type === 'percentage') {
      return value >= 60 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  const getTrendIcon = (improvement) => {
    if (improvement > 5) return '↗️';
    if (improvement < -5) return '↘️';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading conversation analytics...</div>
      </div>
    );
  }

  const tabTriggerClass = 'data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-600 font-medium px-4 py-2 rounded-md transition-all text-sm';

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      {data?.alerts?.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="font-medium text-yellow-800">Active Alerts ({data.alerts.length})</span>
            </div>
            <div className="mt-1 text-sm text-yellow-700">
              {data.alerts[0].metric} below threshold: {data.alerts[0].value} &lt; {data.alerts[0].threshold}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="executive" className="space-y-6">
        <TabsList className="bg-white border border-[#E3E3E3] p-1 rounded-lg inline-flex gap-0.5">
          <TabsTrigger value="executive" className={tabTriggerClass}>Executive Overview</TabsTrigger>
          <TabsTrigger value="compliance" className={tabTriggerClass}>AI Compliance</TabsTrigger>
          <TabsTrigger value="engagement" className={tabTriggerClass}>Engagement &amp; Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.totalConversations}</div>
                <div className="text-sm text-gray-600">
                  {getTrendIcon(data.overview.improvementVsBaseline)} +{data.overview.improvementVsBaseline}% vs baseline
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{data.overview.avgQualityScore}</div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(data.overview.avgQualityScore, 'score')}`}></div>
                </div>
                <div className="text-sm text-gray-600">Out of 10</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Authenticity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{data.overview.avgAuthenticityScore}</div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(data.overview.avgAuthenticityScore, 'score')}`}></div>
                </div>
                <div className="text-sm text-gray-600">Human-like responses</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{data.overview.completionRate}%</div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(data.overview.completionRate, 'percentage')}`}></div>
                </div>
                <Progress value={data.overview.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{data.overview.improvementVsBaseline}%</div>
                <div className="text-sm text-gray-600">vs baseline period</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality &amp; Completion Trends</CardTitle>
                <CardDescription>Student quality scores and completion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    quality: {
                      label: "Quality Score",
                      color: "#4242EA",
                    },
                    completion: {
                      label: "Completion Rate",
                      color: "#FF33FF",
                    },
                  }}
                  className="h-64"
                >
                  <ComposedChart data={data?.trendsData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="quality"
                      stroke="var(--color-quality)"
                      strokeWidth={2}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="completion"
                      fill="var(--color-completion)"
                      opacity={0.6}
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authenticity &amp; Reflection Trends</CardTitle>
                <CardDescription>Human authenticity and reflection indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    authenticity: {
                      label: "Authenticity Score",
                      color: "#10B981",
                    },
                    reflection: {
                      label: "Reflection Rate",
                      color: "#F59E0B",
                    },
                  }}
                  className="h-64"
                >
                  <LineChart data={data?.trendsData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="authenticity"
                      stroke="var(--color-authenticity)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="reflection"
                      stroke="var(--color-reflection)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Message Length Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <Progress value={73} className="mt-2" />
                <div className="text-sm text-gray-600 mt-1">&lt;150 words per message</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Single Question Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <Progress value={68} className="mt-2" />
                <div className="text-sm text-gray-600 mt-1">One question per message</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Questions Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <Progress value={92} className="mt-2" />
                <div className="text-sm text-gray-600 mt-1">Required questions asked</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Questions in Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <Progress value={85} className="mt-2" />
                <div className="text-sm text-gray-600 mt-1">Followed sequence</div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>AI Compliance Trends</CardTitle>
              <CardDescription>Daily compliance metrics for AI behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  messageLength: {
                    label: "Message Length",
                    color: "#4242EA",
                  },
                  singleQuestion: {
                    label: "Single Question",
                    color: "#FF33FF",
                  },
                  coverage: {
                    label: "Coverage",
                    color: "#10B981",
                  },
                  inOrder: {
                    label: "In Order",
                    color: "#F59E0B",
                  },
                }}
                className="h-64"
              >
                <LineChart data={data?.complianceData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="messageLength"
                    stroke="var(--color-messageLength)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="singleQuestion"
                    stroke="var(--color-singleQuestion)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="coverage"
                    stroke="var(--color-coverage)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="inOrder"
                    stroke="var(--color-inOrder)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Student Word Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87</div>
                <div className="text-sm text-gray-600">words per response</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reflection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35%</div>
                <Progress value={35} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800">⚠️ Authenticity Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-800">12%</div>
                <div className="text-sm text-yellow-700">likely AI-generated responses</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConversationAnalytics;