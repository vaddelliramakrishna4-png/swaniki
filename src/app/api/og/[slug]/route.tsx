import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { fetchEventById } from '@/lib/events';
import { formatEventTimeRangeIST, extractCity } from '@/lib/date';
import { getTemplateConfig } from '@/lib/templates';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolved = 'then' in params ? await params : params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'whatsapp';

    const event = await fetchEventById(resolved.slug);

    const title = event?.title || 'Exclusive Gathering';
    const tagline = event?.tagline || 'Curated high-signal salon & cultural experience';
    const coverUrl =
      event?.cover_url ||
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80';
    const city = event?.city || (event?.location ? extractCity(event.location) : 'Bengaluru');
    const venue = event?.venue_name || event?.location || 'Indiranagar Terrace';
    const timeFormatted = event?.start_time
      ? formatEventTimeRangeIST(event.start_time, event.end_time)
      : 'Sat, 14 Sep · 7:00 PM IST';
    const organizer = event?.organizer_name || 'Swaniki Collective';
    const template = getTemplateConfig(event?.theme_template);

    // Dimensions based on requested format
    let width = 1280;
    let height = 720;
    let isStory = false;
    let isPost = false;

    if (format === 'story') {
      width = 1080;
      height = 1920;
      isStory = true;
    } else if (format === 'post') {
      width = 1080;
      height = 1080;
      isPost = true;
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#1A1A2E',
            fontFamily: 'sans-serif',
            color: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          {/* Background Cover Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt="Event Cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Atmospheric Brand Color Gradient Overlay */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isStory
                ? 'linear-gradient(to bottom, rgba(26,26,46,0.75) 0%, rgba(15,23,42,0.88) 50%, rgba(10,12,24,0.98) 100%)'
                : 'linear-gradient(135deg, rgba(26,26,46,0.94) 0%, rgba(22,33,62,0.85) 50%, rgba(15,52,96,0.92) 100%)',
            }}
          />

          {/* Top Bar: Organizer & Category Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isStory ? '80px 60px 0 60px' : '48px 56px 0 56px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: isStory ? '64px' : '48px',
                  height: isStory ? '64px' : '48px',
                  borderRadius: '999px',
                  backgroundColor: '#C9A84C',
                  color: '#1A1A2E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isStory ? '24px' : '20px',
                  fontWeight: 'bold',
                }}
              >
                {organizer.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    display: 'flex',
                    fontSize: isStory ? '18px' : '13px',
                    color: '#C9A84C',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  Vibe Presents
                </span>
                <span
                  style={{
                    display: 'flex',
                    fontSize: isStory ? '24px' : '18px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                  }}
                >
                  {organizer}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: isStory ? '12px 24px' : '8px 18px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: isStory ? '16px' : '13px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {`${template.name} • ${event?.category || 'Curated'}`}
            </div>
          </div>

          {/* Center Main Content Area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isStory ? 'center' : 'flex-end',
              flex: 1,
              padding: isStory ? '0 60px 80px 60px' : '0 56px 48px 56px',
              position: 'relative',
              gap: isStory ? '32px' : '20px',
            }}
          >
            {/* City Tag */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  backgroundColor: '#E8621A',
                  color: '#FFFFFF',
                  fontSize: isStory ? '18px' : '13px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}
              >
                {`📍 ${city}`}
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: isStory ? '64px' : isPost ? '52px' : '56px',
                fontWeight: 'bold',
                lineHeight: 1.15,
                color: '#FFFFFF',
                maxWidth: '92%',
              }}
            >
              {title}
            </div>

            {/* Tagline */}
            <div
              style={{
                display: 'flex',
                fontSize: isStory ? '32px' : isPost ? '24px' : '26px',
                fontStyle: 'italic',
                color: '#C9A84C',
                lineHeight: 1.3,
                maxWidth: '88%',
              }}
            >
              {`"${tagline}"`}
            </div>

            {/* Logistics Pill Strip */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isStory ? '16px' : '12px',
                paddingTop: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isStory ? '14px 22px' : '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: isStory ? '20px' : '15px',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                }}
              >
                {`🗓 ${timeFormatted}`}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isStory ? '14px 22px' : '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: isStory ? '20px' : '15px',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                }}
              >
                {`🏛 ${venue}`}
              </div>
            </div>

            {/* Footer Watermark */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: isStory ? '40px' : '16px',
                borderTop: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  fontSize: isStory ? '18px' : '13px',
                  color: '#A0AEC0',
                }}
              >
                RSVP & Event Details via Vibe by Swaniki
              </span>
              <span
                style={{
                  display: 'flex',
                  fontSize: isStory ? '18px' : '13px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  color: '#C9A84C',
                }}
              >
                * VIBE BY SWANIKI
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (err: any) {
    return new Response(`Failed to generate OG banner: ${err.message}`, { status: 500 });
  }
}
