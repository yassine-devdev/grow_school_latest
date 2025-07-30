import { NextRequest, NextResponse } from 'next/server';
import { SocialImpactSimulation, SimulationScenario, DecisionPoint, DecisionOption, ImpactMetric } from '@/types';

// Mock data for social impact simulations
const mockSimulations: SocialImpactSimulation[] = [
  {
    id: 'sim-1',
    title: 'Community Food Security Initiative',
    description: 'Address food insecurity in your local community by developing and implementing a comprehensive food assistance program.',
    type: 'community-service',
    impactLevel: 'community',
    complexity: 'intermediate',
    estimatedDuration: 45,
    targetAgeRange: { min: 14, max: 18 },
    maxParticipants: 30,
    currentParticipants: 18,
    learningObjectives: [
      'Understand the root causes of food insecurity',
      'Develop strategic planning skills for community programs',
      'Learn about resource allocation and partnership building',
      'Measure and evaluate program effectiveness'
    ],
    scenarios: [
      {
        id: 'scenario-1',
        title: 'Needs Assessment',
        description: 'Conduct a comprehensive assessment of food insecurity in your community',
        order: 1,
        estimatedDuration: 15,
        context: 'You are tasked with understanding the scope of food insecurity in a community of 50,000 people. Recent surveys suggest 15% of families struggle with food access.',
        decisionPoints: [
          {
            id: 'dp-1',
            title: 'Research Method Selection',
            description: 'How will you gather data about food insecurity in the community?',
            options: [
              {
                id: 'opt-1',
                text: 'Conduct door-to-door surveys in all neighborhoods',
                consequences: [
                  {
                    optionId: 'opt-1',
                    impactType: 'social',
                    magnitude: 3,
                    description: 'Comprehensive data but resource-intensive approach'
                  }
                ]
              },
              {
                id: 'opt-2',
                text: 'Partner with existing social services for data sharing',
                consequences: [
                  {
                    optionId: 'opt-2',
                    impactType: 'social',
                    magnitude: 4,
                    description: 'Efficient data collection with established trust'
                  }
                ]
              },
              {
                id: 'opt-3',
                text: 'Use online surveys and social media outreach',
                consequences: [
                  {
                    optionId: 'opt-3',
                    impactType: 'social',
                    magnitude: 2,
                    description: 'May miss vulnerable populations without internet access'
                  }
                ]
              }
            ],
            timeLimit: 300,
            isRequired: true
          }
        ],
        successCriteria: [
          'Identify at least 3 data collection methods',
          'Consider accessibility and inclusivity',
          'Plan for data privacy and ethics'
        ]
      },
      {
        id: 'scenario-2',
        title: 'Program Design',
        description: 'Design a food assistance program based on your assessment findings',
        order: 2,
        estimatedDuration: 20,
        context: 'Your assessment revealed that 12% of families experience food insecurity, with highest rates among single-parent households and elderly residents.',
        decisionPoints: [
          {
            id: 'dp-2',
            title: 'Program Structure',
            description: 'What type of food assistance program will you implement?',
            options: [
              {
                id: 'opt-4',
                text: 'Mobile food pantry visiting different neighborhoods',
                consequences: [
                  {
                    optionId: 'opt-4',
                    impactType: 'social',
                    magnitude: 4,
                    description: 'Reaches underserved areas but requires transportation logistics'
                  }
                ]
              },
              {
                id: 'opt-5',
                text: 'Central food bank with volunteer delivery service',
                consequences: [
                  {
                    optionId: 'opt-5',
                    impactType: 'social',
                    magnitude: 3,
                    description: 'Efficient distribution but may miss those without transportation'
                  }
                ]
              },
              {
                id: 'opt-6',
                text: 'Community garden and cooking education program',
                consequences: [
                  {
                    optionId: 'opt-6',
                    impactType: 'social',
                    magnitude: 5,
                    description: 'Long-term sustainability and skill building'
                  }
                ]
              }
            ],
            timeLimit: 300,
            isRequired: true
          }
        ],
        successCriteria: [
          'Address identified community needs',
          'Consider sustainability and scalability',
          'Plan for community engagement'
        ]
      }
    ],
    impactMetrics: [
      {
        id: 'metric-1',
        name: 'Families Served',
        description: 'Number of families receiving food assistance',
        unit: 'families',
        category: 'social',
        baseline: 0,
        target: 500
      },
      {
        id: 'metric-2',
        name: 'Food Security Improvement',
        description: 'Percentage improvement in food security scores',
        unit: 'percentage',
        category: 'social',
        baseline: 0,
        target: 25
      },
      {
        id: 'metric-3',
        name: 'Community Engagement',
        description: 'Number of community volunteers involved',
        unit: 'volunteers',
        category: 'social',
        baseline: 0,
        target: 100
      }
    ],
    tags: ['food-security', 'community-service', 'social-justice', 'program-management'],
    isActive: true,
    rating: 4.6,
    createdBy: 'admin-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T15:30:00Z'
  },
  {
    id: 'sim-2',
    title: 'Climate Action Policy Simulation',
    description: 'Navigate the complex world of environmental policy-making by proposing and advocating for climate action legislation.',
    type: 'policy-making',
    impactLevel: 'regional',
    complexity: 'advanced',
    estimatedDuration: 60,
    targetAgeRange: { min: 16, max: 20 },
    maxParticipants: 25,
    currentParticipants: 15,
    learningObjectives: [
      'Understand the policy-making process',
      'Learn about stakeholder engagement and compromise',
      'Develop skills in research and evidence-based arguments',
      'Experience the challenges of balancing competing interests'
    ],
    scenarios: [
      {
        id: 'scenario-3',
        title: 'Policy Research and Development',
        description: 'Research and draft a climate action policy proposal',
        order: 1,
        estimatedDuration: 25,
        context: 'Your region has committed to reducing carbon emissions by 50% by 2030. You need to develop specific policy recommendations.',
        decisionPoints: [
          {
            id: 'dp-3',
            title: 'Policy Focus Area',
            description: 'Which area should be the primary focus of your climate policy?',
            options: [
              {
                id: 'opt-7',
                text: 'Renewable energy transition and incentives',
                consequences: [
                  {
                    optionId: 'opt-7',
                    impactType: 'environmental',
                    magnitude: 4,
                    description: 'Strong environmental impact but requires significant investment'
                  },
                  {
                    optionId: 'opt-7',
                    impactType: 'economic',
                    magnitude: -2,
                    description: 'Short-term economic costs for long-term benefits'
                  }
                ]
              },
              {
                id: 'opt-8',
                text: 'Transportation electrification and public transit',
                consequences: [
                  {
                    optionId: 'opt-8',
                    impactType: 'environmental',
                    magnitude: 3,
                    description: 'Moderate environmental impact with broad public benefit'
                  },
                  {
                    optionId: 'opt-8',
                    impactType: 'social',
                    magnitude: 3,
                    description: 'Improves public transportation access'
                  }
                ]
              },
              {
                id: 'opt-9',
                text: 'Carbon pricing and emissions trading',
                consequences: [
                  {
                    optionId: 'opt-9',
                    impactType: 'environmental',
                    magnitude: 5,
                    description: 'Market-based approach with strong environmental incentives'
                  },
                  {
                    optionId: 'opt-9',
                    impactType: 'economic',
                    magnitude: -3,
                    description: 'May face strong business opposition'
                  }
                ]
              }
            ],
            timeLimit: 400,
            isRequired: true
          }
        ],
        successCriteria: [
          'Research evidence-based policy options',
          'Consider environmental and economic impacts',
          'Identify key stakeholders and their interests'
        ]
      }
    ],
    impactMetrics: [
      {
        id: 'metric-4',
        name: 'Carbon Emission Reduction',
        description: 'Projected percentage reduction in regional carbon emissions',
        unit: 'percentage',
        category: 'environmental',
        baseline: 0,
        target: 30
      },
      {
        id: 'metric-5',
        name: 'Policy Support Score',
        description: 'Level of stakeholder support for the policy proposal',
        unit: 'score',
        category: 'political',
        baseline: 0,
        target: 75
      }
    ],
    tags: ['climate-change', 'policy-making', 'environmental-action', 'government'],
    isActive: true,
    rating: 4.3,
    createdBy: 'admin-2',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-02-05T09:15:00Z'
  },
  {
    id: 'sim-3',
    title: 'Social Justice Advocacy Campaign',
    description: 'Organize and lead a social justice campaign to address inequality and promote fair treatment in your community.',
    type: 'social-justice',
    impactLevel: 'community',
    complexity: 'intermediate',
    estimatedDuration: 40,
    targetAgeRange: { min: 15, max: 19 },
    maxParticipants: 35,
    currentParticipants: 22,
    learningObjectives: [
      'Understand systemic inequality and its impacts',
      'Learn grassroots organizing and advocacy strategies',
      'Develop communication and coalition-building skills',
      'Experience the challenges and rewards of social change work'
    ],
    scenarios: [
      {
        id: 'scenario-4',
        title: 'Issue Identification and Research',
        description: 'Identify a social justice issue and conduct thorough research',
        order: 1,
        estimatedDuration: 15,
        context: 'Your community faces several social justice challenges including housing inequality, educational disparities, and employment discrimination.',
        decisionPoints: [
          {
            id: 'dp-4',
            title: 'Campaign Focus',
            description: 'Which social justice issue will your campaign address?',
            options: [
              {
                id: 'opt-10',
                text: 'Affordable housing and anti-displacement advocacy',
                consequences: [
                  {
                    optionId: 'opt-10',
                    impactType: 'social',
                    magnitude: 4,
                    description: 'Addresses basic human need but faces strong economic interests'
                  }
                ]
              },
              {
                id: 'opt-11',
                text: 'Educational equity and resource allocation',
                consequences: [
                  {
                    optionId: 'opt-11',
                    impactType: 'social',
                    magnitude: 4,
                    description: 'Long-term impact on community but requires sustained effort'
                  }
                ]
              },
              {
                id: 'opt-12',
                text: 'Criminal justice reform and community policing',
                consequences: [
                  {
                    optionId: 'opt-12',
                    impactType: 'social',
                    magnitude: 5,
                    description: 'High impact but politically sensitive issue'
                  }
                ]
              }
            ],
            timeLimit: 300,
            isRequired: true
          }
        ],
        successCriteria: [
          'Research the root causes of the chosen issue',
          'Identify affected communities and stakeholders',
          'Gather data and evidence to support your campaign'
        ]
      }
    ],
    impactMetrics: [
      {
        id: 'metric-6',
        name: 'Community Awareness',
        description: 'Percentage increase in community awareness of the issue',
        unit: 'percentage',
        category: 'social',
        baseline: 0,
        target: 40
      },
      {
        id: 'metric-7',
        name: 'Policy Changes Achieved',
        description: 'Number of policy or practice changes resulting from the campaign',
        unit: 'changes',
        category: 'social',
        baseline: 0,
        target: 3
      }
    ],
    tags: ['social-justice', 'advocacy', 'community-organizing', 'equality'],
    isActive: true,
    rating: 4.5,
    createdBy: 'admin-3',
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-02-08T11:20:00Z'
  },
  {
    id: 'sim-4',
    title: 'Nonprofit Organization Management',
    description: 'Experience the challenges of running a nonprofit organization focused on youth development and community empowerment.',
    type: 'nonprofit-management',
    impactLevel: 'community',
    complexity: 'advanced',
    estimatedDuration: 55,
    targetAgeRange: { min: 17, max: 21 },
    maxParticipants: 20,
    currentParticipants: 12,
    learningObjectives: [
      'Understand nonprofit governance and operations',
      'Learn fundraising and resource development strategies',
      'Develop program management and evaluation skills',
      'Experience board relations and stakeholder management'
    ],
    scenarios: [
      {
        id: 'scenario-5',
        title: 'Strategic Planning and Program Development',
        description: 'Develop a strategic plan for your nonprofit organization',
        order: 1,
        estimatedDuration: 20,
        context: 'You are the executive director of a youth-focused nonprofit with a $500,000 annual budget. The board wants a new strategic plan.',
        decisionPoints: [
          {
            id: 'dp-5',
            title: 'Program Priority',
            description: 'Which program area should be your organization\'s primary focus?',
            options: [
              {
                id: 'opt-13',
                text: 'After-school tutoring and academic support',
                consequences: [
                  {
                    optionId: 'opt-13',
                    impactType: 'educational',
                    magnitude: 4,
                    description: 'Clear measurable outcomes but competitive funding landscape'
                  }
                ]
              },
              {
                id: 'opt-14',
                text: 'Job training and career development for youth',
                consequences: [
                  {
                    optionId: 'opt-14',
                    impactType: 'economic',
                    magnitude: 4,
                    description: 'High impact on youth employment but requires industry partnerships'
                  }
                ]
              },
              {
                id: 'opt-15',
                text: 'Mental health and wellness support services',
                consequences: [
                  {
                    optionId: 'opt-15',
                    impactType: 'social',
                    magnitude: 5,
                    description: 'Critical need but requires specialized staff and licensing'
                  }
                ]
              }
            ],
            timeLimit: 400,
            isRequired: true
          }
        ],
        successCriteria: [
          'Conduct stakeholder needs assessment',
          'Align programs with organizational mission',
          'Develop measurable goals and outcomes'
        ]
      }
    ],
    impactMetrics: [
      {
        id: 'metric-8',
        name: 'Youth Served',
        description: 'Number of young people served by programs annually',
        unit: 'youth',
        category: 'social',
        baseline: 200,
        target: 350
      },
      {
        id: 'metric-9',
        name: 'Program Effectiveness',
        description: 'Percentage of participants achieving program goals',
        unit: 'percentage',
        category: 'social',
        baseline: 65,
        target: 80
      }
    ],
    tags: ['nonprofit-management', 'youth-development', 'organizational-leadership', 'program-evaluation'],
    isActive: true,
    rating: 4.2,
    createdBy: 'admin-4',
    createdAt: '2024-02-01T16:00:00Z',
    updatedAt: '2024-02-10T13:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const complexity = searchParams.get('complexity');
    const impactLevel = searchParams.get('impactLevel');

    let filteredSimulations = mockSimulations;

    // Apply filters
    if (type) {
      filteredSimulations = filteredSimulations.filter(sim => sim.type === type);
    }
    if (complexity) {
      filteredSimulations = filteredSimulations.filter(sim => sim.complexity === complexity);
    }
    if (impactLevel) {
      filteredSimulations = filteredSimulations.filter(sim => sim.impactLevel === impactLevel);
    }

    return NextResponse.json(filteredSimulations);
  } catch (error) {
    console.error('Error fetching social impact simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const simulationData = await request.json();
    
    // In a real implementation, this would save to a database
    const newSimulation: SocialImpactSimulation = {
      id: `sim-${Date.now()}`,
      ...simulationData,
      currentParticipants: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data (in memory only)
    mockSimulations.push(newSimulation);

    return NextResponse.json(newSimulation, { status: 201 });
  } catch (error) {
    console.error('Error creating social impact simulation:', error);
    return NextResponse.json(
      { error: 'Failed to create simulation' },
      { status: 500 }
    );
  }
}