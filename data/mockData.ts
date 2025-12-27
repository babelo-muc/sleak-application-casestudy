export interface Owner {
    id: string
    name: string
    avatar?: string
}

export interface Recording {
    id: string
    name: string
    date: string
    status: 'processing' | 'completed' | 'error'
    duration: string
    owner: Owner
    callType: 'Outbound' | 'Inbound' | 'Follow-Up'
}

export interface TranscriptLine {
    speaker: 'Me' | 'Prospect'
    text: string
    timestamp: string
    timestampSeconds: number
    highlightType?: 'objection' | 'signal' | 'discovery' | 'next-steps'
    note?: string
}

export interface FeedbackItem {
    category: string
    advice: string
}

export interface TimelineSegment {
    startSeconds: number
    endSeconds: number
    speaker: 'Me' | 'Prospect'
    topic?: 'objection' | 'discovery' | 'next-steps'
}

export interface TimelinePin {
    timestampSeconds: number
    type: 'missed-opportunity' | 'weak-question' | 'strong-pivot'
    label: string
}

export interface CoachingInsight {
    timestampSeconds: number
    endSeconds: number
    whatYouSaid: string
    critique: string
    tryThisInstead: string
}

export interface Objection {
    id: string
    timestampSeconds: number
    label: string
    quote: string
}

export interface CallMetrics {
    talkRatio: number // percentage 0-100 representing "Me"
    wordsPerMinute: number
    longestMonologue: string // formatted timestamp
    longestMonologueSeconds: number
    questionScore: number
    openQuestions: number
    closedQuestions: number
}

export interface Drill {
    id: string
    text: string
    completed: boolean
}

export interface ProgressPoint {
    callDate: string
    discoveryScore: number
}

export interface CoachingSession {
    id: string
    title: string
    date: string
    duration: string
    durationSeconds: number
    audioUrl: string
    transcript: TranscriptLine[]
    summary: string
    improvements: FeedbackItem[]
    timelineSegments: TimelineSegment[]
    timelinePins: TimelinePin[]
    insights: CoachingInsight[]
    objections: Objection[]
    metrics: CallMetrics
    drills: Drill[]
    progressHistory: ProgressPoint[]
}

export interface ConversationDetail {
    id: string
    title: string
    date: string
    duration: string
    audioUrl: string
    transcript: TranscriptLine[]
    summary: string
    improvements: FeedbackItem[]
}

const owners: Owner[] = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Mike Chen' },
    { id: '3', name: 'Emily Davis' },
    { id: '4', name: 'Alex Thompson' },
    { id: '5', name: 'Jordan Lee' },
]

// Generate more mock recordings for pagination demo
const generateMockRecordings = (): Recording[] => {
    const baseRecordings = [
        { name: 'Enterprise Demo - Acme Corp', callType: 'Inbound' as const, status: 'completed' as const },
        { name: 'Discovery Call - TechStart Inc', callType: 'Inbound' as const, status: 'completed' as const },
        { name: 'Pricing Discussion - Global Solutions', callType: 'Inbound' as const, status: 'processing' as const },
        { name: 'Follow-up Call - Innovate Labs', callType: 'Follow-Up' as const, status: 'completed' as const },
        { name: 'Initial Outreach - DataFlow', callType: 'Outbound' as const, status: 'error' as const },
        { name: 'Product Demo - CloudSync', callType: 'Inbound' as const, status: 'completed' as const },
        { name: 'Negotiation Call - Apex Systems', callType: 'Inbound' as const, status: 'completed' as const },
        { name: 'Onboarding Review - StartupXYZ', callType: 'Inbound' as const, status: 'completed' as const },
        { name: 'Quarterly Review - MegaCorp', callType: 'Inbound' as const, status: 'processing' as const },
        { name: 'Cold Outreach - NewVenture', callType: 'Outbound' as const, status: 'completed' as const },
    ]

    const recordings: Recording[] = []
    const durations = ['12:20', '18:55', '25:30', '32:45', '45:12', '28:00', '15:45', '38:22', '22:10', '55:00']

    for (let i = 0; i < 48; i++) {
        const base = baseRecordings[i % baseRecordings.length]
        const date = new Date()
        date.setDate(date.getDate() - i)

        recordings.push({
            id: String(i + 1),
            name: i < 10 ? base.name : `${base.name} #${Math.floor(i / 10) + 1}`,
            date: date.toISOString().split('T')[0],
            status: base.status,
            duration: durations[i % durations.length],
            owner: owners[i % owners.length],
            callType: base.callType,
        })
    }

    return recordings
}

export const mockRecordings: Recording[] = generateMockRecordings()

export const mockCoachingSession: CoachingSession = {
    id: '1',
    title: 'Enterprise Demo - Acme Corp',
    date: 'January 15, 2024',
    duration: '04:32',
    durationSeconds: 272, // 04:32 in seconds
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    transcript: [
        {
            speaker: 'Me',
            text: "Good morning! Thank you for taking the time to meet with us today. I'm excited to show you how our platform can help streamline your sales operations.",
            timestamp: '00:00',
            timestampSeconds: 0,
        },
        {
            speaker: 'Prospect',
            text: "Thanks for having us. We've been looking at several solutions and are curious to see what makes yours different.",
            timestamp: '00:15',
            timestampSeconds: 15,
        },
        {
            speaker: 'Me',
            text: 'Absolutely. Before I dive in, could you tell me a bit more about your current challenges with your sales process?',
            timestamp: '00:28',
            timestampSeconds: 28,
            highlightType: 'discovery',
        },
        {
            speaker: 'Prospect',
            text: "Sure. Our main issues are around visibility into rep performance and the length of our sales cycles. We're currently averaging about 45 days to close.",
            timestamp: '00:42',
            timestampSeconds: 42,
            highlightType: 'signal',
        },
        {
            speaker: 'Me',
            text: 'I understand completely. Many of our clients faced similar challenges before implementing our solution. Let me show you our analytics dashboard first...',
            timestamp: '01:05',
            timestampSeconds: 65,
        },
        {
            speaker: 'Prospect',
            text: "That sounds great. We're particularly interested in the coaching features you mentioned in your email.",
            timestamp: '01:22',
            timestampSeconds: 82,
            highlightType: 'signal',
        },
        {
            speaker: 'Me',
            text: "Perfect, I'll definitely cover that. Our AI-powered coaching module has helped teams reduce their sales cycle by an average of 23%. Now, let me walk you through the main interface and explain each component in detail so you can see exactly how this works in practice.",
            timestamp: '01:35',
            timestampSeconds: 95,
        },
        {
            speaker: 'Prospect',
            text: "That's impressive. How does the implementation process work? We have a team of about 50 sales reps and we're concerned about the timeline and budget for this project.",
            timestamp: '02:10',
            timestampSeconds: 130,
            highlightType: 'objection',
        },
        {
            speaker: 'Me',
            text: 'Great question about implementation. Our onboarding process is designed to be as smooth as possible. We typically have teams up and running within two weeks.',
            timestamp: '02:35',
            timestampSeconds: 155,
        },
        {
            speaker: 'Prospect',
            text: 'Two weeks sounds reasonable. What about integration with our existing CRM? We use Salesforce.',
            timestamp: '02:55',
            timestampSeconds: 175,
        },
        {
            speaker: 'Me',
            text: "Salesforce integration is one of our core features. We have a native connector that syncs in real-time, so your reps don't need to change their workflow at all.",
            timestamp: '03:10',
            timestampSeconds: 190,
        },
        {
            speaker: 'Prospect',
            text: "That's good to hear. I have to be honest though, we've had bad experiences with similar tools in the past. How do you ensure adoption?",
            timestamp: '03:30',
            timestampSeconds: 210,
            highlightType: 'objection',
        },
        {
            speaker: 'Me',
            text: 'I appreciate your honesty. Adoption is crucial, and we take it very seriously. Our customer success team provides hands-on training and we have a gamification layer that encourages engagement.',
            timestamp: '03:52',
            timestampSeconds: 232,
        },
        {
            speaker: 'Prospect',
            text: 'Gamification could work well with our team. What kind of ROI have your customers typically seen?',
            timestamp: '04:15',
            timestampSeconds: 255,
            highlightType: 'signal',
        },
        {
            speaker: 'Me',
            text: 'On average, our customers see a 30% improvement in win rates within the first quarter. Would you like me to share some case studies?',
            timestamp: '04:32',
            timestampSeconds: 272,
            highlightType: 'next-steps',
        },
    ],
    summary:
        'This was a productive initial demo call with Acme Corp. The prospect showed strong interest in the coaching and analytics features. Key pain points identified include long sales cycles (45 days average) and lack of visibility into rep performance. The conversation maintained good engagement throughout, with the prospect asking specific implementation questions - a positive buying signal.',
    improvements: [
        {
            category: 'Discovery',
            advice: 'Deeper qualification needed. Consider asking about their decision-making process and timeline before diving into the demo.',
        },
        {
            category: 'Objection Handling',
            advice: "When the prospect mentioned looking at 'several solutions', this was an opportunity to understand the competitive landscape better.",
        },
        {
            category: 'Value Proposition',
            advice: 'Good use of specific metrics (23% reduction). Continue to tie features back to their stated pain points.',
        },
        {
            category: 'Next Steps',
            advice: 'Ensure to establish clear next steps and timeline at the end of the call. Schedule the follow-up before ending.',
        },
        {
            category: 'Engagement',
            advice: 'Excellent job maintaining conversational flow. Continue asking open-ended questions to keep the prospect engaged.',
        },
    ],
    timelineSegments: [
        { startSeconds: 0, endSeconds: 14, speaker: 'Me', topic: 'discovery' },
        { startSeconds: 15, endSeconds: 27, speaker: 'Prospect' },
        { startSeconds: 28, endSeconds: 41, speaker: 'Me', topic: 'discovery' },
        { startSeconds: 42, endSeconds: 64, speaker: 'Prospect' },
        { startSeconds: 65, endSeconds: 81, speaker: 'Me' },
        { startSeconds: 82, endSeconds: 94, speaker: 'Prospect' },
        { startSeconds: 95, endSeconds: 129, speaker: 'Me' },
        { startSeconds: 130, endSeconds: 154, speaker: 'Prospect', topic: 'objection' },
        { startSeconds: 155, endSeconds: 174, speaker: 'Me' },
        { startSeconds: 175, endSeconds: 189, speaker: 'Prospect' },
        { startSeconds: 190, endSeconds: 209, speaker: 'Me' },
        { startSeconds: 210, endSeconds: 231, speaker: 'Prospect', topic: 'objection' },
        { startSeconds: 232, endSeconds: 254, speaker: 'Me' },
        { startSeconds: 255, endSeconds: 271, speaker: 'Prospect' },
        { startSeconds: 272, endSeconds: 272, speaker: 'Me', topic: 'next-steps' },
    ],
    timelinePins: [
        { timestampSeconds: 15, type: 'missed-opportunity', label: "Didn't probe competitor landscape" },
        { timestampSeconds: 95, type: 'weak-question', label: 'Long monologue without checking in' },
        { timestampSeconds: 232, type: 'strong-pivot', label: 'Good recovery on adoption concern' },
        { timestampSeconds: 272, type: 'strong-pivot', label: 'Strong close with case study offer' },
    ],
    insights: [
        {
            timestampSeconds: 15,
            endSeconds: 40,
            whatYouSaid: 'Absolutely. Before I dive in, could you tell me a bit more about your current challenges...',
            critique:
                "You missed an opportunity to understand the competitive landscape when they mentioned 'several solutions'.",
            tryThisInstead:
                "Before we dive in, I'm curious - you mentioned looking at several solutions. What's been the deciding factor in your evaluations so far?",
        },
        {
            timestampSeconds: 95,
            endSeconds: 129,
            whatYouSaid:
                "Perfect, I'll definitely cover that. Our AI-powered coaching module has helped teams reduce their sales cycle by an average of 23%. Now, let me walk you through...",
            critique: 'This turned into a long monologue. Check in with the prospect more frequently.',
            tryThisInstead:
                'Our coaching module has helped teams reduce sales cycles by 23%. Before I show you more, does that metric resonate with your goals?',
        },
        {
            timestampSeconds: 130,
            endSeconds: 154,
            whatYouSaid: 'Great question about implementation...',
            critique:
                'Good job addressing the concern, but you could have asked clarifying questions about their specific timeline constraints.',
            tryThisInstead:
                "That's an important consideration. Is there a specific deadline you're working toward, or an event driving your timeline?",
        },
    ],
    objections: [
        {
            id: 'obj-1',
            timestampSeconds: 130,
            label: 'Timeline & Budget Concern',
            quote: "We're concerned about the timeline and budget for this project.",
        },
        {
            id: 'obj-2',
            timestampSeconds: 210,
            label: 'Past Bad Experience',
            quote: "We've had bad experiences with similar tools in the past.",
        },
    ],
    metrics: {
        talkRatio: 42,
        wordsPerMinute: 145,
        longestMonologue: '2m 15s',
        longestMonologueSeconds: 135,
        questionScore: 7,
        openQuestions: 5,
        closedQuestions: 2,
    },
    drills: [
        { id: 'drill-1', text: 'Ask two discovery questions before presenting features', completed: false },
        { id: 'drill-2', text: 'Acknowledge objections by restating them back to the prospect', completed: false },
        { id: 'drill-3', text: 'Check in with the prospect every 60 seconds during demos', completed: true },
    ],
    progressHistory: [
        { callDate: 'Jan 10', discoveryScore: 62 },
        { callDate: 'Jan 12', discoveryScore: 68 },
        { callDate: 'Jan 14', discoveryScore: 71 },
        { callDate: 'Jan 15', discoveryScore: 74 },
        { callDate: 'Jan 16', discoveryScore: 78 },
    ],
}

// Legacy support
export const mockConversationDetail: ConversationDetail = {
    id: mockCoachingSession.id,
    title: mockCoachingSession.title,
    date: mockCoachingSession.date,
    duration: mockCoachingSession.duration,
    audioUrl: mockCoachingSession.audioUrl,
    transcript: mockCoachingSession.transcript.map((line) => ({
        ...line,
        speaker: (line.speaker === 'Me' ? 'A' : 'B') as unknown as 'Me' | 'Prospect',
    })),
    summary: mockCoachingSession.summary,
    improvements: mockCoachingSession.improvements,
}
