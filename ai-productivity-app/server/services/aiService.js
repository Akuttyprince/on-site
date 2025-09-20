// AI Service for generating event plans and suggestions
// This is a mock implementation - in production, you would integrate with OpenAI, Gemini, or other AI services

export const generateEventPlan = async (eventDetails) => {
  const { eventType, eventName, duration, budget, attendees, requirements } = eventDetails;
  
  // Mock AI response - replace with actual AI API call
  const eventPlans = {
    hackathon: {
      phases: [
        {
          phase: "Pre-Event Planning",
          duration: "4-6 weeks",
          tasks: [
            { title: "Define hackathon theme and problem statements", priority: "high", estimatedHours: 8 },
            { title: "Secure venue and technical infrastructure", priority: "high", estimatedHours: 12 },
            { title: "Partner with sponsors and mentors", priority: "medium", estimatedHours: 16 },
            { title: "Set up registration platform", priority: "medium", estimatedHours: 6 },
            { title: "Create marketing materials and social media campaign", priority: "medium", estimatedHours: 10 }
          ]
        },
        {
          phase: "Event Execution",
          duration: "2-3 days",
          tasks: [
            { title: "Set up registration and welcome desk", priority: "high", estimatedHours: 4 },
            { title: "Coordinate opening ceremony and keynotes", priority: "high", estimatedHours: 6 },
            { title: "Manage technical support and mentoring", priority: "high", estimatedHours: 24 },
            { title: "Organize meals and refreshments", priority: "medium", estimatedHours: 8 },
            { title: "Facilitate judging and award ceremony", priority: "high", estimatedHours: 6 }
          ]
        },
        {
          phase: "Post-Event",
          duration: "1-2 weeks",
          tasks: [
            { title: "Collect feedback from participants", priority: "medium", estimatedHours: 4 },
            { title: "Share results and winner announcements", priority: "high", estimatedHours: 3 },
            { title: "Process payments and reimbursements", priority: "high", estimatedHours: 6 },
            { title: "Create event report and documentation", priority: "low", estimatedHours: 8 }
          ]
        }
      ],
      roles: [
        { role: "Event Coordinator", responsibilities: ["Overall planning", "Timeline management", "Stakeholder communication"] },
        { role: "Technical Lead", responsibilities: ["Infrastructure setup", "Technical support", "Platform management"] },
        { role: "Marketing Manager", responsibilities: ["Promotion", "Social media", "Participant engagement"] },
        { role: "Logistics Coordinator", responsibilities: ["Venue management", "Catering", "Material procurement"] }
      ]
    },
    conference: {
      phases: [
        {
          phase: "Planning & Preparation",
          duration: "8-12 weeks",
          tasks: [
            { title: "Define conference agenda and speakers", priority: "high", estimatedHours: 20 },
            { title: "Book venue and arrange AV equipment", priority: "high", estimatedHours: 15 },
            { title: "Set up registration and ticketing system", priority: "high", estimatedHours: 8 },
            { title: "Coordinate with speakers and sponsors", priority: "medium", estimatedHours: 25 },
            { title: "Plan catering and networking sessions", priority: "medium", estimatedHours: 12 }
          ]
        },
        {
          phase: "Event Day",
          duration: "1-2 days",
          tasks: [
            { title: "Manage registration and check-in", priority: "high", estimatedHours: 6 },
            { title: "Coordinate speaker sessions and Q&A", priority: "high", estimatedHours: 16 },
            { title: "Facilitate networking breaks", priority: "medium", estimatedHours: 4 },
            { title: "Handle technical support", priority: "high", estimatedHours: 12 },
            { title: "Manage live streaming and recordings", priority: "medium", estimatedHours: 8 }
          ]
        }
      ],
      roles: [
        { role: "Conference Director", responsibilities: ["Strategic planning", "Speaker coordination", "Overall execution"] },
        { role: "Program Manager", responsibilities: ["Agenda management", "Session coordination", "Content quality"] },
        { role: "Operations Manager", responsibilities: ["Venue logistics", "Vendor management", "Day-of coordination"] }
      ]
    },
    workshop: {
      phases: [
        {
          phase: "Content Development",
          duration: "3-4 weeks",
          tasks: [
            { title: "Design workshop curriculum and materials", priority: "high", estimatedHours: 16 },
            { title: "Prepare hands-on exercises and examples", priority: "high", estimatedHours: 12 },
            { title: "Set up learning environment and tools", priority: "medium", estimatedHours: 8 },
            { title: "Create participant resources and handouts", priority: "medium", estimatedHours: 6 }
          ]
        },
        {
          phase: "Workshop Delivery",
          duration: "1 day",
          tasks: [
            { title: "Set up workshop space and materials", priority: "high", estimatedHours: 2 },
            { title: "Facilitate interactive learning sessions", priority: "high", estimatedHours: 8 },
            { title: "Provide individual guidance and support", priority: "medium", estimatedHours: 4 },
            { title: "Collect feedback and evaluate outcomes", priority: "medium", estimatedHours: 2 }
          ]
        }
      ],
      roles: [
        { role: "Workshop Facilitator", responsibilities: ["Content delivery", "Participant engagement", "Learning outcomes"] },
        { role: "Technical Assistant", responsibilities: ["Setup support", "Technical troubleshooting", "Material distribution"] }
      ]
    }
  };

  const basePlan = eventPlans[eventType] || eventPlans.conference;
  
  // Customize based on event details
  const customizedPlan = {
    eventName: eventName || `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Event`,
    eventType,
    estimatedDuration: duration || "2-3 days",
    recommendedBudget: budget || "Contact for estimate",
    expectedAttendees: attendees || "50-100",
    phases: basePlan.phases,
    recommendedRoles: basePlan.roles,
    aiInsights: [
      `Based on your ${eventType} requirements, I recommend starting planning ${basePlan.phases[0].duration} in advance.`,
      `Key success factors: Strong technical infrastructure, clear communication, and engaged participants.`,
      `Consider having backup plans for critical components like venue, speakers, and technology.`
    ],
    generatedAt: new Date()
  };

  return customizedPlan;
};

export const generateTaskSuggestions = async (taskTitle, context) => {
  // Mock AI suggestions - replace with actual AI API
  const suggestions = [
    {
      type: "optimization",
      suggestion: `For "${taskTitle}", consider breaking this into smaller subtasks for better tracking and team collaboration.`
    },
    {
      type: "resource",
      suggestion: "You might need additional resources or team members for this task. Consider delegating or requesting support."
    },
    {
      type: "timeline",
      suggestion: "Based on similar tasks, this might take longer than estimated. Consider adding buffer time."
    }
  ];

  return suggestions;
};

export const generateRoleSuggestions = async (eventType, teamSize, skills) => {
  const roleSuggestions = {
    hackathon: [
      { role: "Event Coordinator", skills: ["Project Management", "Communication"], priority: "essential" },
      { role: "Technical Lead", skills: ["Software Development", "Infrastructure"], priority: "essential" },
      { role: "Mentor Coordinator", skills: ["Networking", "Industry Knowledge"], priority: "important" },
      { role: "Marketing Manager", skills: ["Social Media", "Content Creation"], priority: "important" },
      { role: "Logistics Coordinator", skills: ["Operations", "Vendor Management"], priority: "helpful" }
    ],
    conference: [
      { role: "Conference Director", skills: ["Leadership", "Strategic Planning"], priority: "essential" },
      { role: "Program Manager", skills: ["Content Curation", "Speaker Management"], priority: "essential" },
      { role: "Operations Manager", skills: ["Event Operations", "Logistics"], priority: "important" },
      { role: "Marketing Specialist", skills: ["Digital Marketing", "PR"], priority: "important" }
    ]
  };

  return roleSuggestions[eventType] || roleSuggestions.conference;
};

export const generateSmartReminder = async (task, userContext) => {
  const timeUntilDue = task.dueDate ? new Date(task.dueDate) - new Date() : null;
  const daysUntilDue = timeUntilDue ? Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24)) : null;

  if (daysUntilDue === 1) {
    return {
      message: `⏰ Hey ${userContext.name}! Your task "${task.title}" is due tomorrow. Do you need any help or want to extend the deadline?`,
      type: "urgent",
      actions: ["Mark as done", "Request extension", "Ask for help"]
    };
  } else if (daysUntilDue === 0) {
    return {
      message: `🚨 Task "${task.title}" is due today! Let me know if you need support to complete it.`,
      type: "critical",
      actions: ["Mark as done", "Request emergency help", "Reassign task"]
    };
  } else if (daysUntilDue > 1 && daysUntilDue <= 3) {
    return {
      message: `📅 Reminder: "${task.title}" is due in ${daysUntilDue} days. You're doing great - keep it up!`,
      type: "normal",
      actions: ["Update progress", "Mark as done", "Add comment"]
    };
  }

  return null;
};
