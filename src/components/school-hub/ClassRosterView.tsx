'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  attendance: number;
  lastActive: string;
}

interface ClassRosterViewProps {
  selectedClassId: string;
  onClassSelect: (classId: string) => void;
}

export default function ClassRosterView({ selectedClassId, onClassSelect }: ClassRosterViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock classes data
  const classes = [
    { id: 'math-101', name: 'Mathematics 101', students: 25 },
    { id: 'eng-201', name: 'English Literature 201', students: 30 },
    { id: 'sci-301', name: 'Science 301', students: 22 },
    { id: 'hist-401', name: 'History 401', students: 28 },
  ];

  // Mock students data
  const mockStudents: Student[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice.j@school.edu', grade: 'A', attendance: 95, lastActive: '2024-01-15' },
    { id: '2', name: 'Bob Smith', email: 'bob.s@school.edu', grade: 'B+', attendance: 88, lastActive: '2024-01-14' },
    { id: '3', name: 'Carol Davis', email: 'carol.d@school.edu', grade: 'A-', attendance: 92, lastActive: '2024-01-15' },
    { id: '4', name: 'David Wilson', email: 'david.w@school.edu', grade: 'B', attendance: 85, lastActive: '2024-01-13' },
    { id: '5', name: 'Emma Brown', email: 'emma.b@school.edu', grade: 'A+', attendance: 98, lastActive: '2024-01-15' },
  ];

  useEffect(() => {
    if (selectedClassId) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setStudents(mockStudents);
        setLoading(false);
      }, 500);
    }
  }, [selectedClassId]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Class Roster Management</h1>
          <p className="text-gray-300">Manage and view student information for your classes</p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Class Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Select Class</h2>
              <div className="space-y-2">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => onClassSelect(cls.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedClassId === cls.id
                        ? 'bg-purple-600/50 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">{cls.name}</div>
                    <div className="text-sm opacity-75">{cls.students} students</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Roster */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 h-full">
              {selectedClassId ? (
                <>
                  {/* Search and Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <Icons.UserPlus size={20} />
                      Add Student
                    </button>
                  </div>

                  {/* Student List */}
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Student</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Grade</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Attendance</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Active</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student) => (
                            <tr key={student.id} className="border-b border-white/10 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="text-white font-medium">{student.name}</div>
                                  <div className="text-gray-400 text-sm">{student.email}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  student.grade.startsWith('A') ? 'bg-green-600/20 text-green-300' :
                                  student.grade.startsWith('B') ? 'bg-blue-600/20 text-blue-300' :
                                  'bg-yellow-600/20 text-yellow-300'
                                }`}>
                                  {student.grade}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-white/10 rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full" 
                                      style={{ width: `${student.attendance}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-white text-sm">{student.attendance}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-300">{student.lastActive}</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                    <Icons.Eye size={16} />
                                  </button>
                                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                    <Icons.Edit size={16} />
                                  </button>
                                  <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                                    <Icons.Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Icons.Users className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-medium text-white mb-2">Select a Class</h3>
                    <p className="text-gray-400">Choose a class from the sidebar to view its roster</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
