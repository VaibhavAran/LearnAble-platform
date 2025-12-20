// components/StatsCards.tsx
"use client";
import { Users, Clock, FileText } from 'lucide-react';

interface StatsCardsProps {
  totalStudents: number;
  pendingAssessments: number;
  reportsReady: number;
}

export default function StatsCards({ 
  totalStudents, 
  pendingAssessments, 
  reportsReady 
}: StatsCardsProps) {
  console.log('StatsCards rendering:', { totalStudents, pendingAssessments, reportsReady });

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Pending Assessments',
      value: pendingAssessments || 0,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50'
    },
    {
      title: 'Reports Ready',
      value: reportsReady || 0,
      icon: FileText,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-white`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {stat.title}
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl shadow-lg`}>
                <Icon className="text-white w-8 h-8" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}