import { NextRequest, NextResponse } from 'next/server';
import { createEventRecord, fetchEventById } from '@/lib/events';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { eventType = 'in-person' } = await req.json();

    const testPayloads = {
      'in-person': {
        title: 'Bandra Sunset Terrace Feast',
        tagline: 'Acoustic sitar, woodfired sourdough, and sea breeze in Bandra',
        description: 'An intimate sunset feast bringing together 35 founders, writers, and cultural creators.',
        category: 'Dining & Social',
        theme_template: 'Grove',
        start_time: '2026-09-22T18:30:00+05:30',
        end_time: '2026-09-22T22:00:00+05:30',
        location: 'Carter Road, Bandra West, Mumbai',
        venue_name: 'Sea Breeze Rooftop Salon',
        is_virtual: false,
        capacity: 35,
        status: 'live',
        slug: 'bandra-sunset-terrace-' + nanoid(4),
        custom_questions: [{ id: 'q1', label: 'Company / Studio', type: 'text' as const, required: true }],
      },
      'online': {
        title: 'Global Multimodal Agents Virtual Salon',
        tagline: 'Deep dive into local LLM workflows and tool autonomy',
        description: 'A global virtual salon for deep-tech engineers exploring open-weights multimodal systems.',
        category: 'Technology',
        theme_template: 'Sprint',
        start_time: '2026-09-24T18:00:00+05:30',
        end_time: '2026-09-24T20:00:00+05:30',
        location: 'Online',
        venue_name: 'Virtual Gathering',
        is_virtual: true,
        capacity: 100,
        status: 'live',
        slug: 'multimodal-agents-online-' + nanoid(4),
        custom_questions: [{ id: 'q1', label: 'GitHub URL', type: 'text' as const, required: false }],
      },
      'hybrid': {
        title: 'CyberCity Sovereign Compute Summit',
        tagline: 'Off-the-record keynote in Gurgaon with private global stream',
        description: 'An executive hybrid summit gathering 40 Managing Partners and enterprise CTOs.',
        category: 'Networking',
        theme_template: 'Vertex',
        start_time: '2026-09-28T17:30:00+05:30',
        end_time: '2026-09-28T21:00:00+05:30',
        location: 'CyberCity, Gurgaon, Delhi NCR',
        venue_name: 'The Oberoi Presidential Lounge',
        is_virtual: false,
        capacity: 50,
        status: 'live',
        slug: 'cybercity-compute-hybrid-' + nanoid(4),
        custom_questions: [{ id: 'q1', label: 'Enterprise Role', type: 'text' as const, required: true }],
      },
    };

    const targetPayload = testPayloads[eventType as keyof typeof testPayloads] || testPayloads['in-person'];
    const result = await createEventRecord(targetPayload);

    return NextResponse.json({
      success: result.success,
      event: result.data,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
